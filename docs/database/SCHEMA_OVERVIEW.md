# Database Schema Overview - Portal Container

**Project**: LB Portal Container (PayloadCMS 3.x)
**Database**: PostgreSQL 15
**ORM**: Drizzle ORM (integrated in PayloadCMS)
**Created by**: AGENT-DB-009 (Database Engineer)
**Date**: 2025-11-09
**Sprint**: Sprint 1 - Dia 1
**User Story**: US-001 (Setup de Repositório)

---

## Table of Contents

1. [Overview](#overview)
2. [Database Architecture](#database-architecture)
3. [Collections (Tables)](#collections-tables)
4. [Relationships](#relationships)
5. [Indexing Strategy](#indexing-strategy)
6. [Access Control (RBAC)](#access-control-rbac)
7. [Data Retention](#data-retention)
8. [Performance Considerations](#performance-considerations)

---

## Overview

This document describes the **10 core Collections** that will be managed by PayloadCMS in the Portal Container project. PayloadCMS uses **Drizzle ORM** to automatically generate and manage database schemas.

### Key Principles

- **Auto-generated schemas**: PayloadCMS generates SQL schemas from TypeScript Collection configs
- **Migration-based**: All schema changes are versioned via Drizzle Kit migrations
- **Type-safe**: Full TypeScript type inference from Collection definitions
- **Audit trail**: Built-in `createdAt`, `updatedAt` timestamps on all tables
- **Soft delete**: `_status: 'draft' | 'published'` pattern for publishable content

### Databases

| Database | Purpose | Owner | Size Estimate |
|----------|---------|-------|---------------|
| `payload_dev` | PayloadCMS portal metadata (all 10 collections) | `portal_user` | ~500MB (5k users, 50k entries) |
| `keycloak_dev` | Keycloak SSO authentication data | `portal_user` | ~200MB (5k users, sessions) |

---

## Database Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        PostgreSQL 15                             │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Database: payload_dev                                   │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  Core Collections (10 tables)                      │  │   │
│  │  │  ├── users                 (shadow users)          │  │   │
│  │  │  ├── roles                 (RBAC roles)            │  │   │
│  │  │  ├── permissions           (granular perms)        │  │   │
│  │  │  ├── regions               (multi-regional)        │  │   │
│  │  │  ├── applications          (external apps)         │  │   │
│  │  │  ├── menu_items            (hierarchical menu)     │  │   │
│  │  │  ├── portal_settings       (global config)         │  │   │
│  │  │  ├── audit_logs            (append-only audit)     │  │   │
│  │  │  ├── notifications         (system notifications)  │  │   │
│  │  │  └── media                 (file uploads)          │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Database: keycloak_dev                                  │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  Keycloak Tables (auto-created by Keycloak)       │  │   │
│  │  │  - User credentials, sessions, realms, clients... │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Collections (Tables)

### 1. `users` - Shadow Users from Keycloak

**Purpose**: Store synchronized user data from Keycloak SSO.

**Collection Type**: Auth Collection (extends Payload built-in `users`)

**Fields**:

| Field | Type | Required | Description | Indexed |
|-------|------|----------|-------------|---------|
| `id` | UUID | Yes | Primary key (auto-generated) | PK |
| `email` | String | Yes | User email (unique) | Unique |
| `keycloak_sub` | String | Yes | Keycloak subject UUID (unique) | Unique |
| `first_name` | String | No | First name | No |
| `last_name` | String | No | Last name | No |
| `role` | Relationship | Yes | References `roles.id` | FK |
| `region` | Relationship | No | References `regions.id` (multi-regional) | FK |
| `status` | Select | Yes | `active`, `inactive`, `suspended` | Yes |
| `last_login` | DateTime | No | Last login timestamp | No |
| `created_at` | DateTime | Yes | Creation timestamp (auto) | Yes |
| `updated_at` | DateTime | Yes | Last update timestamp (auto) | Yes |

**Relationships**:
- **N:1** with `roles` (many users, one role)
- **N:1** with `regions` (many users, one region)
- **1:N** with `audit_logs` (one user, many audit logs)
- **1:N** with `notifications` (one user, many notifications)

**RBAC Access**:
- **Admins**: Full CRUD
- **Auditors**: Read-only all fields
- **Self**: Read/Update own profile (restricted fields)
- **Others**: No access

**Indexes**:
```sql
-- Primary key
PRIMARY KEY (id)

-- Unique constraints
UNIQUE INDEX users_email_unique ON users(email)
UNIQUE INDEX users_keycloak_sub_unique ON users(keycloak_sub)

-- Foreign keys
INDEX users_role_fk ON users(role)
INDEX users_region_fk ON users(region)

-- Query optimization
INDEX users_status_idx ON users(status)
INDEX users_created_at_idx ON users(created_at DESC)
```

**Notes**:
- Shadow users are auto-created via Payload `auth` hook on first Keycloak login
- `keycloak_sub` is the **source of truth** for identity (immutable)
- `email` can be updated if changed in Keycloak (sync via webhook)

---

### 2. `roles` - RBAC Roles

**Purpose**: Define access control roles with granular permissions.

**Collection Type**: Standard Collection

**Fields**:

| Field | Type | Required | Description | Indexed |
|-------|------|----------|-------------|---------|
| `id` | UUID | Yes | Primary key | PK |
| `name` | String | Yes | Role name (e.g., "Super Admin") | Unique |
| `slug` | String | Yes | Role slug (e.g., "super_admin") | Unique |
| `description` | Textarea | No | Role description | No |
| `permissions` | Relationship | No | References `permissions.id` (many-to-many) | No |
| `is_system_role` | Checkbox | Yes | System role (cannot be deleted) | Yes |
| `created_at` | DateTime | Yes | Creation timestamp | No |
| `updated_at` | DateTime | Yes | Last update timestamp | No |

**Predefined Roles** (created via seed script):

| Slug | Name | Description | System Role |
|------|------|-------------|-------------|
| `super_admin` | Super Admin | Full access to all features | Yes |
| `admin` | Admin | Manage users, roles, settings | Yes |
| `operator` | Operator | Manage applications, menu items | Yes |
| `auditor` | Auditor | Read-only access to audit logs | Yes |
| `viewer` | Viewer | Read-only access to portal | Yes |

**Relationships**:
- **1:N** with `users` (one role, many users)
- **N:N** with `permissions` (many roles, many permissions)

**RBAC Access**:
- **Super Admins**: Full CRUD
- **Admins**: Read all, Create/Update custom roles (cannot modify system roles)
- **Others**: Read-only own role

**Indexes**:
```sql
PRIMARY KEY (id)
UNIQUE INDEX roles_name_unique ON roles(name)
UNIQUE INDEX roles_slug_unique ON roles(slug)
INDEX roles_is_system_role_idx ON roles(is_system_role)
```

---

### 3. `permissions` - Granular Permissions

**Purpose**: Define fine-grained permissions for RBAC.

**Collection Type**: Standard Collection

**Fields**:

| Field | Type | Required | Description | Indexed |
|-------|------|----------|-------------|---------|
| `id` | UUID | Yes | Primary key | PK |
| `resource` | String | Yes | Resource name (e.g., "users", "applications") | Yes |
| `action` | Select | Yes | Action: `create`, `read`, `update`, `delete` | Yes |
| `scope` | Select | Yes | Scope: `all`, `own`, `region`, `custom` | Yes |
| `field_filters` | JSON | No | Field-level access (e.g., `{"allow": ["email", "name"]}`) | No |
| `condition` | JSON | No | Dynamic conditions (e.g., `{"status": "active"}`) | No |
| `description` | Textarea | No | Permission description | No |
| `created_at` | DateTime | Yes | Creation timestamp | No |
| `updated_at` | DateTime | Yes | Last update timestamp | No |

**Example Permissions**:

```json
// Permission 1: Admins can read all users
{
  "resource": "users",
  "action": "read",
  "scope": "all",
  "field_filters": null,
  "condition": null
}

// Permission 2: Operators can update own profile
{
  "resource": "users",
  "action": "update",
  "scope": "own",
  "field_filters": {
    "allow": ["first_name", "last_name", "email"],
    "deny": ["role", "status"]
  },
  "condition": {"id": "{{current_user.id}}"}
}

// Permission 3: Regional admins can read users in same region
{
  "resource": "users",
  "action": "read",
  "scope": "region",
  "field_filters": null,
  "condition": {"region": "{{current_user.region}}"}
}
```

**Relationships**:
- **N:N** with `roles` (many permissions, many roles)

**RBAC Access**:
- **Super Admins**: Full CRUD
- **Admins**: Read all, Create/Update custom permissions
- **Others**: No access

**Indexes**:
```sql
PRIMARY KEY (id)
INDEX permissions_resource_idx ON permissions(resource)
INDEX permissions_action_idx ON permissions(action)
INDEX permissions_scope_idx ON permissions(scope)
INDEX permissions_resource_action_idx ON permissions(resource, action)
```

---

### 4. `regions` - Multi-Regional Support

**Purpose**: Support multi-regional data isolation (e.g., Norte, Nordeste, Sul, Sudeste, Centro-Oeste).

**Collection Type**: Standard Collection

**Fields**:

| Field | Type | Required | Description | Indexed |
|-------|------|----------|-------------|---------|
| `id` | UUID | Yes | Primary key | PK |
| `code` | String | Yes | Region code (e.g., "norte", "nordeste") | Unique |
| `name` | String | Yes | Display name (e.g., "Norte", "Nordeste") | No |
| `description` | Textarea | No | Region description | No |
| `timezone` | String | Yes | Timezone (e.g., "America/Sao_Paulo") | No |
| `is_active` | Checkbox | Yes | Active status | Yes |
| `created_at` | DateTime | Yes | Creation timestamp | No |
| `updated_at` | DateTime | Yes | Last update timestamp | No |

**Predefined Regions** (created via seed script):

| Code | Name | Timezone | Active |
|------|------|----------|--------|
| `norte` | Norte | America/Manaus | Yes |
| `nordeste` | Nordeste | America/Fortaleza | Yes |
| `sudeste` | Sudeste | America/Sao_Paulo | Yes |
| `sul` | Sul | America/Sao_Paulo | Yes |
| `centro_oeste` | Centro-Oeste | America/Cuiaba | Yes |

**Relationships**:
- **1:N** with `users` (one region, many users)

**RBAC Access**:
- **Super Admins**: Full CRUD
- **Admins**: Read all
- **Others**: Read own region

**Indexes**:
```sql
PRIMARY KEY (id)
UNIQUE INDEX regions_code_unique ON regions(code)
INDEX regions_is_active_idx ON regions(is_active)
```

---

### 5. `applications` - External Applications Registry

**Purpose**: Register external applications that integrate with the portal (e.g., DICT Core, Conn-DICT, PIX API).

**Collection Type**: Standard Collection

**Fields**:

| Field | Type | Required | Description | Indexed |
|-------|------|----------|-------------|---------|
| `id` | UUID | Yes | Primary key | PK |
| `name` | String | Yes | Application name | Unique |
| `slug` | String | Yes | URL-safe slug | Unique |
| `description` | Textarea | No | Application description | No |
| `icon` | Upload | No | Application icon (Payload media) | No |
| `url` | String | Yes | External URL (with protocol) | No |
| `target` | Select | Yes | Open in: `_blank`, `_self`, `iframe` | No |
| `category` | Select | No | Category: `pix`, `dict`, `admin`, `compliance`, `other` | Yes |
| `is_active` | Checkbox | Yes | Active status | Yes |
| `display_order` | Number | No | Display order in menu (lower = first) | Yes |
| `requires_role` | Relationship | No | References `roles.id` (access control) | FK |
| `created_at` | DateTime | Yes | Creation timestamp | No |
| `updated_at` | DateTime | Yes | Last update timestamp | No |

**Example Applications**:

```typescript
{
  name: "DICT Core",
  slug: "dict-core",
  description: "Gerenciamento de chaves DICT",
  url: "https://dict-core.lbpay.internal",
  target: "_blank",
  category: "dict",
  is_active: true,
  display_order: 10,
  requires_role: "operator" // Only operators+ can see
}
```

**Relationships**:
- **N:1** with `roles` (many apps, one required role)
- **1:N** with `menu_items` (one app, many menu entries)

**RBAC Access**:
- **Super Admins**: Full CRUD
- **Admins**: Full CRUD
- **Operators**: Create/Update own apps
- **Others**: Read active apps (filtered by role)

**Indexes**:
```sql
PRIMARY KEY (id)
UNIQUE INDEX applications_name_unique ON applications(name)
UNIQUE INDEX applications_slug_unique ON applications(slug)
INDEX applications_category_idx ON applications(category)
INDEX applications_is_active_idx ON applications(is_active)
INDEX applications_display_order_idx ON applications(display_order)
INDEX applications_requires_role_fk ON applications(requires_role)
```

---

### 6. `menu_items` - Hierarchical Menu System

**Purpose**: Build dynamic, hierarchical navigation menu (supports infinite nesting).

**Collection Type**: Standard Collection

**Fields**:

| Field | Type | Required | Description | Indexed |
|-------|------|----------|-------------|---------|
| `id` | UUID | Yes | Primary key | PK |
| `label` | String | Yes | Menu label (translatable) | No |
| `parent` | Relationship | No | Self-reference to `menu_items.id` (for hierarchy) | FK |
| `application` | Relationship | No | References `applications.id` (if linked to app) | FK |
| `url` | String | No | Custom URL (if not linked to app) | No |
| `icon` | String | No | Icon name (e.g., "home", "settings") | No |
| `is_active` | Checkbox | Yes | Active status | Yes |
| `display_order` | Number | No | Display order among siblings | Yes |
| `requires_role` | Relationship | No | References `roles.id` (access control) | FK |
| `created_at` | DateTime | Yes | Creation timestamp | No |
| `updated_at` | DateTime | Yes | Last update timestamp | No |

**Example Hierarchy**:

```
┌── PIX (parent: null, order: 10)
│   ├── DICT Core (parent: PIX, order: 10, app: dict-core)
│   └── PIX API (parent: PIX, order: 20, app: pix-api)
├── Administração (parent: null, order: 20)
│   ├── Usuários (parent: Administração, order: 10, url: /admin/users)
│   ├── Roles (parent: Administração, order: 20, url: /admin/roles)
│   └── Configurações (parent: Administração, order: 30, url: /admin/settings)
└── Compliance (parent: null, order: 30)
    └── Audit Logs (parent: Compliance, order: 10, url: /admin/audit-logs)
```

**Relationships**:
- **Self-referencing** (parent-child hierarchy)
- **N:1** with `applications` (many menu items, one app)
- **N:1** with `roles` (many menu items, one required role)

**RBAC Access**:
- **Super Admins**: Full CRUD
- **Admins**: Full CRUD
- **Others**: Read active items (filtered by role)

**Indexes**:
```sql
PRIMARY KEY (id)
INDEX menu_items_parent_fk ON menu_items(parent)
INDEX menu_items_application_fk ON menu_items(application)
INDEX menu_items_is_active_idx ON menu_items(is_active)
INDEX menu_items_display_order_idx ON menu_items(display_order)
INDEX menu_items_requires_role_fk ON menu_items(requires_role)
```

**Queries**:

```typescript
// Get full menu tree (recursive CTE)
const menuTree = await payload.find({
  collection: 'menu_items',
  where: {
    is_active: { equals: true },
    parent: { exists: false } // Root items
  },
  depth: 3, // Fetch 3 levels deep
  sort: 'display_order',
});

// Filter by user role
const userRole = req.user.role.slug;
const filteredMenu = menuTree.docs.filter(item =>
  !item.requires_role || item.requires_role.slug === userRole
);
```

---

### 7. `portal_settings` - Global Configuration (Singleton)

**Purpose**: Store global portal settings (singleton - only 1 document).

**Collection Type**: Global Collection (Payload singleton)

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Primary key (always same ID for singleton) |
| `site_title` | String | Yes | Portal title (e.g., "LBPay Portal Container") |
| `site_description` | Textarea | No | SEO description |
| `logo` | Upload | No | Portal logo (Payload media) |
| `favicon` | Upload | No | Favicon |
| `primary_color` | String | Yes | Primary color (hex, e.g., "#0066CC") |
| `secondary_color` | String | Yes | Secondary color (hex) |
| `contact_email` | Email | Yes | Support email |
| `maintenance_mode` | Checkbox | No | Enable maintenance mode |
| `maintenance_message` | RichText | No | Maintenance mode message |
| `session_timeout_minutes` | Number | Yes | Session timeout (default: 30min) |
| `max_login_attempts` | Number | Yes | Max failed logins before lock (default: 5) |
| `enable_notifications` | Checkbox | Yes | Enable system notifications |
| `updated_at` | DateTime | Yes | Last update timestamp |

**Default Values** (created via seed script):

```typescript
{
  site_title: "LBPay Portal Container",
  site_description: "Portal de administração para gestão de aplicações PIX/DICT",
  primary_color: "#0066CC",
  secondary_color: "#333333",
  contact_email: "suporte@lbpay.com",
  maintenance_mode: false,
  session_timeout_minutes: 30,
  max_login_attempts: 5,
  enable_notifications: true
}
```

**RBAC Access**:
- **Super Admins**: Full Update
- **Admins**: Read all
- **Others**: Read public fields only (`site_title`, `logo`, `colors`)

**Notes**:
- **Singleton**: Only 1 document exists (no list view)
- **Global API**: Accessed via `/api/globals/portal-settings`
- **Cached**: Cached in Redis for 5 minutes (performance)

---

### 8. `audit_logs` - Append-Only Audit Trail

**Purpose**: Immutable audit trail for compliance (LGPD + Bacen Res. 4.753).

**Collection Type**: Standard Collection (append-only)

**Fields**:

| Field | Type | Required | Description | Indexed |
|-------|------|----------|-------------|---------|
| `id` | UUID | Yes | Primary key | PK |
| `user` | Relationship | Yes | References `users.id` (who performed action) | FK |
| `action` | Select | Yes | `create`, `read`, `update`, `delete`, `login`, `logout` | Yes |
| `collection` | String | Yes | Collection name (e.g., "users", "applications") | Yes |
| `document_id` | String | Yes | ID of affected document | Yes |
| `before` | JSON | No | Document state before action (for updates/deletes) | No |
| `after` | JSON | No | Document state after action (for creates/updates) | No |
| `ip_address` | String | Yes | Client IP address | Yes |
| `user_agent` | String | No | Client user agent | No |
| `timestamp` | DateTime | Yes | Action timestamp (auto, immutable) | Yes |
| `request_id` | String | No | Request ID for correlation | Yes |

**Relationships**:
- **N:1** with `users` (many logs, one user)

**RBAC Access**:
- **Super Admins**: Read all
- **Auditors**: Read all
- **Admins**: Read all (no delete)
- **Others**: No access

**CRITICAL**: Append-only, **NO updates or deletes allowed** (enforced via Payload hooks).

**Indexes**:
```sql
PRIMARY KEY (id)
INDEX audit_logs_user_fk ON audit_logs(user)
INDEX audit_logs_action_idx ON audit_logs(action)
INDEX audit_logs_collection_idx ON audit_logs(collection)
INDEX audit_logs_document_id_idx ON audit_logs(document_id)
INDEX audit_logs_timestamp_idx ON audit_logs(timestamp DESC)
INDEX audit_logs_ip_address_idx ON audit_logs(ip_address)
INDEX audit_logs_request_id_idx ON audit_logs(request_id)

-- Composite index for common queries
INDEX audit_logs_user_timestamp_idx ON audit_logs(user, timestamp DESC)
INDEX audit_logs_collection_timestamp_idx ON audit_logs(collection, timestamp DESC)
```

**Retention**: 5 years (Bacen requirement), then archive to cold storage (S3 Glacier).

**Partitioning Strategy** (PostgreSQL native partitioning):

```sql
-- Partition by year (created by Drizzle migration)
CREATE TABLE audit_logs (
  ...
) PARTITION BY RANGE (timestamp);

-- Create partitions for each year
CREATE TABLE audit_logs_2025 PARTITION OF audit_logs
    FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

CREATE TABLE audit_logs_2026 PARTITION OF audit_logs
    FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');

-- Future partitions created automatically via cron job
```

**Queries**:

```typescript
// Get user activity in last 30 days
const userActivity = await payload.find({
  collection: 'audit_logs',
  where: {
    user: { equals: userId },
    timestamp: {
      greater_than: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    }
  },
  sort: '-timestamp',
  limit: 100
});

// Compliance report: All user updates in 2025
const complianceReport = await payload.find({
  collection: 'audit_logs',
  where: {
    collection: { equals: 'users' },
    action: { in: ['create', 'update', 'delete'] },
    timestamp: {
      greater_than_equal: new Date('2025-01-01'),
      less_than: new Date('2026-01-01')
    }
  },
  limit: 0 // No limit for reports
});
```

---

### 9. `notifications` - System Notifications

**Purpose**: Store system notifications for users (in-app notifications).

**Collection Type**: Standard Collection

**Fields**:

| Field | Type | Required | Description | Indexed |
|-------|------|----------|-------------|---------|
| `id` | UUID | Yes | Primary key | PK |
| `user` | Relationship | Yes | References `users.id` (recipient) | FK |
| `type` | Select | Yes | `info`, `success`, `warning`, `error` | Yes |
| `title` | String | Yes | Notification title | No |
| `message` | RichText | Yes | Notification message (HTML) | No |
| `link` | String | No | Optional link (e.g., "/admin/users/123") | No |
| `is_read` | Checkbox | No | Read status (default: false) | Yes |
| `read_at` | DateTime | No | Read timestamp | No |
| `expires_at` | DateTime | No | Expiration timestamp (auto-delete after) | Yes |
| `created_at` | DateTime | Yes | Creation timestamp | Yes |

**Example Notifications**:

```typescript
// Welcome notification (auto-created on first login)
{
  user: userId,
  type: "info",
  title: "Bem-vindo ao Portal LBPay",
  message: "Explore o menu para acessar aplicações PIX/DICT.",
  link: null,
  is_read: false,
  expires_at: null // Never expires
}

// Password change notification
{
  user: userId,
  type: "warning",
  title: "Senha alterada",
  message: "Sua senha foi alterada em 2025-11-09 14:30 UTC.",
  link: "/admin/profile/security",
  is_read: false,
  expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
}
```

**Relationships**:
- **N:1** with `users` (many notifications, one user)

**RBAC Access**:
- **Self**: Read/Update own notifications (mark as read)
- **Admins**: Create notifications for any user
- **Others**: No access to others' notifications

**Indexes**:
```sql
PRIMARY KEY (id)
INDEX notifications_user_fk ON notifications(user)
INDEX notifications_type_idx ON notifications(type)
INDEX notifications_is_read_idx ON notifications(is_read)
INDEX notifications_expires_at_idx ON notifications(expires_at)
INDEX notifications_created_at_idx ON notifications(created_at DESC)

-- Composite index for user inbox query
INDEX notifications_user_unread_idx ON notifications(user, is_read, created_at DESC);
```

**Auto-cleanup**: Expired notifications deleted via daily cron job.

**Queries**:

```typescript
// Get unread notifications for current user
const unreadNotifications = await payload.find({
  collection: 'notifications',
  where: {
    user: { equals: req.user.id },
    is_read: { equals: false }
  },
  sort: '-created_at',
  limit: 50
});

// Mark notification as read
await payload.update({
  collection: 'notifications',
  id: notificationId,
  data: {
    is_read: true,
    read_at: new Date()
  }
});
```

---

### 10. `media` - File Uploads (Payload Built-in)

**Purpose**: Store file uploads (logos, icons, avatars, documents).

**Collection Type**: Upload Collection (Payload built-in)

**Fields** (auto-generated by Payload):

| Field | Type | Required | Description | Indexed |
|-------|------|----------|-------------|---------|
| `id` | UUID | Yes | Primary key | PK |
| `filename` | String | Yes | Original filename | Yes |
| `mimeType` | String | Yes | MIME type (e.g., "image/png") | Yes |
| `filesize` | Number | Yes | File size in bytes | No |
| `width` | Number | No | Image width (pixels) | No |
| `height` | Number | No | Image height (pixels) | No |
| `url` | String | Yes | Public URL (S3 or local) | No |
| `thumbnail_url` | String | No | Thumbnail URL (auto-generated) | No |
| `uploaded_by` | Relationship | Yes | References `users.id` | FK |
| `alt_text` | String | No | Accessibility alt text | No |
| `created_at` | DateTime | Yes | Upload timestamp | Yes |

**Storage**:
- **Development**: Local filesystem (`/uploads/`)
- **Production**: AWS S3 (`s3://lbpay-portal-media-prod/`)

**Auto-generated Sizes** (image transformations):

```typescript
// PayloadCMS config
sizes: [
  {
    name: 'thumbnail',
    width: 150,
    height: 150,
    fit: 'cover'
  },
  {
    name: 'small',
    width: 400,
    fit: 'cover'
  },
  {
    name: 'medium',
    width: 800,
    fit: 'cover'
  },
  {
    name: 'large',
    width: 1200,
    fit: 'cover'
  }
]
```

**RBAC Access**:
- **Admins**: Full CRUD
- **Operators**: Create/Update own uploads
- **Others**: Read public media

**Indexes**:
```sql
PRIMARY KEY (id)
INDEX media_filename_idx ON media(filename)
INDEX media_mimeType_idx ON media(mimeType)
INDEX media_uploaded_by_fk ON media(uploaded_by)
INDEX media_created_at_idx ON media(created_at DESC)
```

---

## Relationships

### Entity-Relationship Diagram (ERD)

```
┌──────────────┐
│   users      │
│──────────────│
│ id (PK)      │───┐
│ email (UQ)   │   │
│ keycloak_sub │   │ N:1
│ role (FK)    │───┼──────────┐
│ region (FK)  │───┼─────┐    │
└──────────────┘   │     │    │
       │           │     │    │
       │ 1:N       │     │    │
       ▼           │     │    │
┌──────────────┐   │     │    │       ┌──────────────┐
│ audit_logs   │   │     │    └──────▶│   roles      │
│──────────────│   │     │            │──────────────│
│ id (PK)      │   │     │            │ id (PK)      │
│ user (FK)    │───┘     │            │ name (UQ)    │
│ action       │         │            │ slug (UQ)    │
│ collection   │         │            └──────┬───────┘
│ document_id  │         │                   │
│ before (JSON)│         │                   │ N:N
│ after (JSON) │         │                   ▼
│ timestamp    │         │            ┌──────────────┐
└──────────────┘         │            │ permissions  │
                         │            │──────────────│
       ┌─────────────────┘            │ id (PK)      │
       │                              │ resource     │
       │ 1:N                          │ action       │
       ▼                              │ scope        │
┌──────────────┐                      │ field_filters│
│notifications │                      │ condition    │
│──────────────│                      └──────────────┘
│ id (PK)      │
│ user (FK)    │
│ type         │         ┌──────────────┐
│ title        │         │   regions    │
│ message      │         │──────────────│
│ is_read      │         │ id (PK)      │
│ expires_at   │         │ code (UQ)    │
└──────────────┘         │ name         │
                         │ timezone     │
                         └──────────────┘
                                │
                                │ 1:N
                                ▼
┌──────────────┐         (users.region FK)
│ applications │
│──────────────│
│ id (PK)      │
│ name (UQ)    │
│ slug (UQ)    │         ┌──────────────┐
│ url          │         │  menu_items  │
│ category     │         │──────────────│
│ is_active    │         │ id (PK)      │
│ requires_role│─────┐   │ label        │
└──────┬───────┘     │   │ parent (FK)  │──┐ self-reference
       │             │   │ application  │  │ (hierarchy)
       │ 1:N         │   │ url          │  │
       ▼             │   │ requires_role│──┘
┌──────────────┐     │   └──────────────┘
│  menu_items  │     │
│──────────────│     │
│ id (PK)      │     │
│ application  │─────┘
│ (FK)         │
└──────────────┘

┌──────────────┐
│portal_settings│ (Singleton)
│──────────────│
│ id (PK)      │
│ site_title   │
│ logo (FK)────┼──┐
│ primary_color│  │
└──────────────┘  │
                  │ N:1
                  ▼
           ┌──────────────┐
           │    media     │ (Payload built-in)
           │──────────────│
           │ id (PK)      │
           │ filename     │
           │ mimeType     │
           │ url          │
           │ uploaded_by  │──┐
           └──────────────┘  │
                  ▲          │ N:1
                  └──────────┘ (users FK)
```

---

## Indexing Strategy

### Index Types Used

| Index Type | Usage | Collections |
|------------|-------|-------------|
| **Primary Key (PK)** | Unique identifier | All collections |
| **Unique Index** | Enforce uniqueness | `users.email`, `roles.slug`, `applications.slug` |
| **Foreign Key (FK)** | Relationship lookups | All relationship fields |
| **B-tree Index** | Equality & range queries | `status`, `created_at`, `timestamp` |
| **Composite Index** | Multi-column queries | `(user, timestamp)`, `(collection, timestamp)` |
| **Partial Index** | Filtered queries | `audit_logs WHERE is_read = false` |
| **GIN Index** | JSON queries | `permissions.field_filters`, `audit_logs.before/after` |

### Performance Considerations

**Hot Paths** (most queried):

1. **User login/session**: `users.keycloak_sub`, `users.email` (unique indexes)
2. **Menu rendering**: `menu_items.parent`, `menu_items.display_order` (FK + B-tree)
3. **Audit log queries**: `audit_logs.user`, `audit_logs.timestamp` (composite index)
4. **Notifications inbox**: `notifications.user`, `notifications.is_read` (composite index)
5. **RBAC checks**: `roles.slug`, `permissions.resource` (unique + B-tree)

**Index Maintenance**:

```sql
-- Analyze table statistics (run weekly via cron)
ANALYZE users;
ANALYZE audit_logs;
ANALYZE notifications;

-- Reindex bloated indexes (run monthly)
REINDEX INDEX CONCURRENTLY users_email_unique;
REINDEX INDEX CONCURRENTLY audit_logs_timestamp_idx;

-- Monitor index usage
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

---

## Access Control (RBAC)

### Permission Matrix

| Collection | Super Admin | Admin | Operator | Auditor | Viewer |
|------------|-------------|-------|----------|---------|--------|
| `users` | Full CRUD | Read All, Update (restricted) | Read Own | Read All | Read Own |
| `roles` | Full CRUD | Read All, Create/Update custom | Read All | Read All | Read Own |
| `permissions` | Full CRUD | Read All, Create/Update custom | Read All | Read All | No access |
| `regions` | Full CRUD | Read All | Read Own | Read All | Read Own |
| `applications` | Full CRUD | Full CRUD | Create/Update Own | Read All | Read Active |
| `menu_items` | Full CRUD | Full CRUD | Read All | Read All | Read Active |
| `portal_settings` | Full Update | Read All | Read Public | Read All | Read Public |
| `audit_logs` | Read All | Read All | No access | Read All | No access |
| `notifications` | Create Any | Create Any | Read/Update Own | Read/Update Own | Read/Update Own |
| `media` | Full CRUD | Full CRUD | Create/Update Own | Read All | Read Public |

### Field-Level Permissions

Example: `users` collection

```typescript
// Super Admins: See all fields
{
  "allow": "*",
  "deny": []
}

// Operators: Cannot see/edit role, status
{
  "allow": ["email", "first_name", "last_name", "region"],
  "deny": ["role", "status", "keycloak_sub"]
}

// Self (any user): Can edit own profile (limited fields)
{
  "allow": ["first_name", "last_name", "email"],
  "deny": ["role", "status", "region", "keycloak_sub"]
}
```

---

## Data Retention

### Retention Policies

| Collection | Retention | Archive Strategy |
|------------|-----------|------------------|
| `users` | Indefinite | Soft delete (inactive status) |
| `roles` | Indefinite | System roles cannot be deleted |
| `permissions` | Indefinite | Audit trail before deletion |
| `regions` | Indefinite | Mark as `is_active: false` |
| `applications` | Indefinite | Soft delete (`is_active: false`) |
| `menu_items` | Indefinite | Soft delete (`is_active: false`) |
| `portal_settings` | Indefinite | Singleton (versioned via audit logs) |
| `audit_logs` | **5 years** | Archive to S3 Glacier after 2 years |
| `notifications` | 90 days | Auto-delete expired notifications |
| `media` | Indefinite | Orphaned files cleaned monthly |

### Archive Process (Audit Logs)

```sql
-- Archive audit logs older than 2 years to S3 Glacier
-- Run quarterly via cron job

-- 1. Export to CSV
COPY (
  SELECT * FROM audit_logs
  WHERE timestamp < NOW() - INTERVAL '2 years'
) TO '/tmp/audit_logs_archive_2025Q1.csv' CSV HEADER;

-- 2. Upload to S3 Glacier via AWS CLI
-- aws s3 cp /tmp/audit_logs_archive_2025Q1.csv s3://lbpay-audit-archive/ --storage-class GLACIER

-- 3. Delete archived records (after confirming S3 upload)
DELETE FROM audit_logs
WHERE timestamp < NOW() - INTERVAL '2 years';

-- 4. Vacuum table to reclaim space
VACUUM FULL audit_logs;
```

---

## Performance Considerations

### Query Optimization

**1. Use Indexes Wisely**:
```typescript
// Bad: Full table scan
const users = await payload.find({
  collection: 'users',
  where: {
    first_name: { equals: 'John' } // No index on first_name
  }
});

// Good: Use indexed field
const users = await payload.find({
  collection: 'users',
  where: {
    email: { equals: 'john@example.com' } // Unique index on email
  }
});
```

**2. Limit Depth for Relationships**:
```typescript
// Bad: Deep nesting (N+1 queries)
const menuItems = await payload.find({
  collection: 'menu_items',
  depth: 5 // Fetches 5 levels of parent/child
});

// Good: Limit depth or use GraphQL
const menuItems = await payload.find({
  collection: 'menu_items',
  depth: 2 // Fetch only 2 levels
});
```

**3. Pagination**:
```typescript
// Bad: Fetch all records
const auditLogs = await payload.find({
  collection: 'audit_logs',
  limit: 0 // No limit (OOM risk)
});

// Good: Use pagination
const auditLogs = await payload.find({
  collection: 'audit_logs',
  limit: 100,
  page: 1
});
```

### Database Tuning

**PostgreSQL Settings** (for RDS db.m5.xlarge - 4 vCPU, 16GB RAM):

```sql
-- Connection pooling
max_connections = 200

-- Memory settings
shared_buffers = 4GB              -- 25% of RAM
effective_cache_size = 12GB       -- 75% of RAM
work_mem = 20MB                   -- For sorting/hashing
maintenance_work_mem = 1GB        -- For VACUUM, CREATE INDEX

-- Query planner
random_page_cost = 1.1            -- SSD-optimized
effective_io_concurrency = 200    -- SSD concurrency

-- Write-ahead log
wal_buffers = 16MB
checkpoint_completion_target = 0.9
```

### Monitoring Queries

```sql
-- Find slow queries (> 1 second)
SELECT
  pid,
  now() - pg_stat_activity.query_start AS duration,
  query,
  state
FROM pg_stat_activity
WHERE state != 'idle'
  AND now() - pg_stat_activity.query_start > interval '1 second'
ORDER BY duration DESC;

-- Check table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check index hit ratio (should be > 99%)
SELECT
  schemaname,
  tablename,
  ROUND(idx_scan::numeric / (seq_scan + idx_scan + 0.001) * 100, 2) AS index_hit_ratio
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY index_hit_ratio ASC;
```

---

## Next Steps

1. **Implement Collections**: Create Payload Collection configs in `/src/collections/`
2. **Generate Migrations**: Run `npm run payload migrate:create` to generate Drizzle migrations
3. **Apply Migrations**: Run `npm run payload migrate` to apply to database
4. **Seed Data**: Create seed script for roles, regions, permissions
5. **Implement Hooks**: Create audit log hooks, shadow user sync hooks
6. **Test RBAC**: Validate access control for each role

---

**Created by**: AGENT-DB-009 (Database Engineer)
**Date**: 2025-11-09
**Sprint**: Sprint 1 - Dia 1
**User Story**: US-001 (Setup de Repositório)
**Next Review**: Sprint 1 - Dia 2 (Validation by AGENT-MAESTRO-001)
