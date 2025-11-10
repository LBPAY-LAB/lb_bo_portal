# 📘 ESPECIFICAÇÃO TÉCNICA - PORTAL CONTAINER LBPAY (PayloadCMS)

**Projeto:** Portal Container / Shell Application - Instituição de Pagamento (IP)
**Organização:** LBPay
**Plataforma Base:** PayloadCMS 3.x
**Versão:** 1.0
**Data:** 09 de Janeiro de 2025
**Status:** Especificação Técnica Aprovada para Implementação

---

## 🎯 VISÃO GERAL DO PROJETO

### Contexto de Negócio

Somos uma IP (Instituição de Pagamento) licenciada pelo Banco Central do Brasil com múltiplos módulos de negócio já desenvolvidos (ou em desenvolvimento) pelo time técnico:

- **Módulos Existentes/Planejados:**
  - Gestão de Cadastro (PF/PJ)
  - Gestão de Clientes
  - Gestão de Contas
  - Billing & Cobrança
  - Extrato de Transações
  - PIX/DICT Operations
  - Relatórios & Analytics
  - Compliance & Auditoria

**Problema:**
Cada módulo é desenvolvido independentemente (diferentes tecnologias, times, ciclos de release). Precisamos de um **Portal Unificado** que:

1. Forneça ponto de entrada único (Single Sign-On)
2. Gerencie autenticação/autorização centralizada
3. Orquestre acesso aos módulos via menu dinâmico
4. Renderize aplicações externas em área de trabalho (iframe/frame)
5. Ofereça UX consistente e profissional
6. Suporte multi-idioma
7. Seja altamente configurável (sem deployments para mudanças de menu)

### Objetivo do Portal Container

Desenvolver um **Portal Container / Shell Application** moderno, escalável e altamente configurável que atua como:

- ✅ **Gateway de Autenticação** - SSO via Keycloak (OAuth2/OIDC)
- ✅ **Gerenciador de Autorização** - RBAC granular (roles + permissions)
- ✅ **Orquestrador de Aplicações** - Menu dinâmico chamando apps externas
- ✅ **Frame de Renderização** - Área de trabalho para apps rodarem
- ✅ **Hub de Configuração** - Gestão centralizada de portal, temas, idiomas

**O que o portal NÃO faz:**
- ❌ **NÃO** implementa lógica de negócio (cadastro, contas, billing, etc.)
- ❌ **NÃO** gerencia dados de negócio (clientes, transações, etc.)
- ❌ **NÃO** processa operações de negócio

**Analogia:**
O portal é como o **Windows Explorer** ou **macOS Finder** - fornece estrutura, navegação e acesso, mas os "programas" (módulos de negócio) rodam dentro dele.

---

## 🏗️ ARQUITETURA DO PORTAL CONTAINER

### Stack Tecnológico

| Camada | Tecnologia | Versão | Papel | Documentação |
|--------|------------|--------|-------|--------------|
| **CMS/Framework** | PayloadCMS | 3.x | Plataforma base (headless CMS + Next.js) | [Payload Docs](https://payloadcms.com/docs) |
| **Frontend Framework** | Next.js | 15.4.7 | App Router, Server Components, SSR/SSG | [Next.js Docs](https://nextjs.org/docs) |
| **Language** | TypeScript | 5.7.3 | Type-safe, strict mode | [TS Handbook](https://www.typescriptlang.org/docs) |
| **UI Framework** | React | 19.1.1 | Component library | [React Docs](https://react.dev) |
| **Database** | PostgreSQL | 15+ | Metadata persistence (users, roles, menu items, apps) | [PostgreSQL Docs](https://www.postgresql.org/docs/15) |
| **ORM** | Drizzle ORM | Latest | Type-safe queries via Payload | [Drizzle Docs](https://orm.drizzle.team) |
| **Authentication** | Keycloak | 23+ | SSO, OAuth2/OIDC, user federation | [Keycloak Docs](https://www.keycloak.org/docs) |
| **Styling** | TailwindCSS | 4.x | Utility-first CSS | [Tailwind Docs](https://tailwindcss.com/docs) |
| **UI Components** | shadcn/ui | Latest | Accessible, customizable components | [shadcn/ui](https://ui.shadcn.com) |
| **Icons** | Lucide Icons | Latest | Icon library (2000+ icons) | [Lucide](https://lucide.dev) |
| **i18n** | Payload Native | Built-in | Multi-language support | Payload localization |
| **State Management** | Zustand | Latest | Lightweight global state | [Zustand](https://zustand-demo.pmnd.rs) |
| **Forms** | React Hook Form | Latest | Form validation + Zod | [RHF Docs](https://react-hook-form.com) |

### Arquitetura de Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                     USUÁRIOS (Browser)                          │
│                    HTTPS (TLS 1.3)                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              PORTAL CONTAINER (Next.js 15 + Payload)            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  LAYOUT DO PORTAL                                        │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │ Header: Logo | Breadcrumb | Lang | User Menu      │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │  ┌──────────┐  ┌────────────────────────────────────┐   │   │
│  │  │          │  │                                    │   │   │
│  │  │ Sidebar  │  │  MAIN CONTENT AREA                 │   │   │
│  │  │ (Menu)   │  │  ┌──────────────────────────────┐  │   │   │
│  │  │          │  │  │                              │  │   │   │
│  │  │ 📊 Home  │  │  │  <iframe>                    │  │   │   │
│  │  │ 👥 Users │  │  │    External Business App     │  │   │   │
│  │  │ 🏢 PJ    │  │  │    (Gestão de Cadastro,      │  │   │   │
│  │  │ 💳 Contas│  │  │     Contas, Billing, etc.)   │  │   │   │
│  │  │ 📈 Billing│ │  │  </iframe>                   │  │   │   │
│  │  │ 📊 Extrato│ │  │                              │  │   │   │
│  │  │ 📋 Reports│ │  │                              │  │   │   │
│  │  │          │  │  └──────────────────────────────┘  │   │   │
│  │  └──────────┘  └────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  RESPONSABILIDADES DO PORTAL:                                  │
│  ✅ Autenticação via Keycloak (OAuth2/OIDC)                    │
│  ✅ Gerenciamento de sessão (JWT tokens)                       │
│  ✅ RBAC (verificação de permissões)                           │
│  ✅ Renderização de menu dinâmico                              │
│  ✅ Gestão de aplicações externas (URLs, configs)              │
│  ✅ Iframe communication (postMessage API)                     │
│  ✅ Multi-idioma (i18n)                                        │
│  ✅ Tema claro/escuro                                          │
│  ✅ Audit logs (login, acessos, mudanças)                      │
└─────────────────┬───────────────────────────┬─────────────────┘
                  │                           │
         ┌────────▼──────────┐       ┌────────▼─────────────┐
         │   KEYCLOAK        │       │   POSTGRESQL         │
         │   (Auth Server)   │       │   (Portal Metadata)  │
         │                   │       │                      │
         │ - Users           │       │ - users              │
         │ - Roles           │       │ - roles              │
         │ - Permissions     │       │ - permissions        │
         │ - Sessions        │       │ - menu_items         │
         │ - 2FA/MFA         │       │ - applications       │
         │ - OAuth2 Clients  │       │ - audit_logs         │
         └───────────────────┘       │ - system_settings    │
                                     └──────────────────────┘
                  │
                  │  Chamadas HTTP/gRPC
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│              APLICAÇÕES EXTERNAS (Business Modules)             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Gestão PJ   │  │  Gestão de   │  │   Billing    │          │
│  │  (React)     │  │  Contas (Vue)│  │  (Angular)   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Extrato     │  │   PIX/DICT   │  │  Reports     │          │
│  │  (Svelte)    │  │  (Go + HTMX) │  │  (Next.js)   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
│  Cada app pode usar tecnologia própria (React, Vue, Angular,   │
│  Svelte, HTMX, etc.) desde que:                                │
│  ✅ Aceite token JWT via query param ou postMessage            │
│  ✅ Implemente comunicação via postMessage (opcional)          │
│  ✅ Siga design system do portal (opcional, recomendado)       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 MODELO DE DADOS (PayloadCMS Collections)

### Visão Geral das Collections

O Portal Container gerencia apenas **metadata de portal**, não dados de negócio:

| Collection | Descrição | Relacionamentos | Admin UI |
|------------|-----------|----------------|----------|
| **users** | Usuários do portal (shadow users do Keycloak) | N:1 com roles | ✅ |
| **roles** | Papéis de acesso (SuperAdmin, Admin, Operator, Viewer, etc.) | N:N com permissions | ✅ |
| **permissions** | Permissões granulares (resource.action) | N:N com roles | ✅ |
| **applications** | Aplicações externas registradas no portal | N:N com menu_items | ✅ |
| **menu_items** | Itens de menu (hierárquico) | N:1 parent, N:1 application | ✅ |
| **menu_groups** | Grupos de menu (separadores visuais) | 1:N com menu_items | ✅ |
| **portal_settings** | Configurações globais do portal | - | ✅ |
| **themes** | Temas de cores/branding | - | ✅ |
| **audit_logs** | Logs de auditoria (append-only) | N:1 com users | ✅ Read-only |
| **notifications** | Notificações do portal (sistema) | N:1 com users | ✅ |

**Total:** 10 Collections (leves, focadas em portal management)

---

### Collection: `users` (Shadow Users)

**Descrição:** Usuários do portal sincronizados do Keycloak via OAuth2

**Fields:**

```typescript
{
  slug: 'users',
  auth: {
    strategies: [
      {
        name: 'keycloak-oauth',
        authenticate: async ({ payload, headers }) => {
          // Custom Keycloak OAuth2 strategy (implementation below)
        }
      }
    ]
  },
  access: {
    read: ({ req: { user } }) => {
      if (user.role === 'super-admin') return true;
      return { id: { equals: user.id } }; // Users can only read themselves
    },
    create: ({ req: { user } }) => user.role === 'super-admin',
    update: ({ req: { user } }) => {
      if (user.role === 'super-admin') return true;
      return { id: { equals: user.id } }; // Users can update themselves
    },
    delete: ({ req: { user } }) => user.role === 'super-admin',
  },
  fields: [
    {
      name: 'keycloak_sub',
      type: 'text',
      unique: true,
      required: true,
      admin: {
        readOnly: true,
        description: 'Keycloak Subject ID (from JWT "sub" claim)',
      },
    },
    {
      name: 'email',
      type: 'email',
      unique: true,
      required: true,
      admin: {
        readOnly: true, // Synced from Keycloak
      },
    },
    {
      name: 'username',
      type: 'text',
      unique: true,
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'firstName',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'lastName',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'User avatar (uploaded or from Keycloak)',
      },
    },
    {
      name: 'role',
      type: 'relationship',
      relationTo: 'roles',
      required: true,
      hasMany: false,
      admin: {
        description: 'Primary role (mapped from Keycloak roles)',
      },
    },
    {
      name: 'additionalRoles',
      type: 'relationship',
      relationTo: 'roles',
      hasMany: true,
      admin: {
        description: 'Additional roles for multi-role support',
      },
    },
    {
      name: 'preferredLanguage',
      type: 'select',
      options: [
        { label: 'Português (Brasil)', value: 'pt-BR' },
        { label: 'English (US)', value: 'en-US' },
        { label: 'Español', value: 'es-ES' },
      ],
      defaultValue: 'pt-BR',
      localized: false,
    },
    {
      name: 'timezone',
      type: 'text',
      defaultValue: 'America/Sao_Paulo',
    },
    {
      name: 'theme',
      type: 'select',
      options: [
        { label: 'Light', value: 'light' },
        { label: 'Dark', value: 'dark' },
        { label: 'Auto', value: 'auto' },
      ],
      defaultValue: 'auto',
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'If false, user cannot login',
      },
    },
    {
      name: 'lastLoginAt',
      type: 'date',
      admin: {
        readOnly: true,
        date: {
          displayFormat: 'dd/MM/yyyy HH:mm:ss',
        },
      },
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional metadata from Keycloak (claims, attributes)',
      },
    },
  ],
  timestamps: true,
  hooks: {
    afterLogin: [
      async ({ user, req }) => {
        // Update lastLoginAt
        await req.payload.update({
          collection: 'users',
          id: user.id,
          data: { lastLoginAt: new Date() },
        });

        // Create audit log
        await req.payload.create({
          collection: 'audit_logs',
          data: {
            user: user.id,
            action: 'user.login',
            resource: 'authentication',
            metadata: {
              ip: req.ip,
              userAgent: req.headers['user-agent'],
            },
          },
        });
      },
    ],
  },
}
```

---

### Collection: `roles`

**Descrição:** Papéis de acesso com permissões associadas

**Fields:**

```typescript
{
  slug: 'roles',
  admin: {
    useAsTitle: 'displayName',
  },
  access: {
    read: () => true, // All authenticated users can read roles
    create: ({ req: { user } }) => user.role === 'super-admin',
    update: ({ req: { user } }) => user.role === 'super-admin',
    delete: ({ req: { user } }) => user.role === 'super-admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      unique: true,
      required: true,
      admin: {
        description: 'Unique role identifier (e.g., super-admin, operator)',
      },
    },
    {
      name: 'displayName',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description: 'Display name (localized)',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'permissions',
      type: 'relationship',
      relationTo: 'permissions',
      hasMany: true,
      admin: {
        description: 'Permissions granted to this role',
      },
    },
    {
      name: 'isSystemRole',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'System roles cannot be deleted',
        readOnly: true,
      },
    },
    {
      name: 'color',
      type: 'text',
      admin: {
        description: 'Badge color for UI (hex)',
      },
    },
  ],
  timestamps: true,
}
```

**System Roles (Seed Data):**

| Role Name | Display Name | Description | Permissions |
|-----------|--------------|-------------|-------------|
| `super-admin` | Super Administrador | Acesso total ao portal e todas aplicações | ALL |
| `admin` | Administrador | Gestão de usuários e configurações | users.*, roles.*, menu_items.*, applications.* |
| `operator` | Operador | Acesso operacional limitado | Definido por app |
| `compliance-officer` | Oficial de Compliance | Acesso a auditoria e relatórios | audit_logs.read, reports.* |
| `viewer` | Visualizador | Somente leitura | *.read |

---

### Collection: `permissions`

**Descrição:** Permissões granulares (resource.action)

**Fields:**

```typescript
{
  slug: 'permissions',
  admin: {
    useAsTitle: 'displayName',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => user.role === 'super-admin',
    update: ({ req: { user } }) => user.role === 'super-admin',
    delete: ({ req: { user } }) => user.role === 'super-admin',
  },
  fields: [
    {
      name: 'resource',
      type: 'text',
      required: true,
      admin: {
        description: 'Resource name (e.g., users, applications, menu_items)',
      },
    },
    {
      name: 'action',
      type: 'select',
      options: [
        { label: 'Create', value: 'create' },
        { label: 'Read', value: 'read' },
        { label: 'Update', value: 'update' },
        { label: 'Delete', value: 'delete' },
        { label: 'All', value: '*' },
      ],
      required: true,
    },
    {
      name: 'displayName',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
    },
  ],
  timestamps: true,
  indexes: [
    {
      fields: ['resource', 'action'],
      unique: true,
    },
  ],
}
```

**Example Permissions (Seed Data):**

```json
[
  { "resource": "users", "action": "create", "displayName": "Create Users" },
  { "resource": "users", "action": "read", "displayName": "View Users" },
  { "resource": "users", "action": "update", "displayName": "Edit Users" },
  { "resource": "users", "action": "delete", "displayName": "Delete Users" },
  { "resource": "roles", "action": "*", "displayName": "Manage Roles" },
  { "resource": "applications", "action": "*", "displayName": "Manage Applications" },
  { "resource": "menu_items", "action": "*", "displayName": "Manage Menu Items" },
  { "resource": "audit_logs", "action": "read", "displayName": "View Audit Logs" },
  { "resource": "portal_settings", "action": "update", "displayName": "Edit Portal Settings" }
]
```

---

### Collection: `applications`

**Descrição:** Aplicações externas registradas no portal

**Fields:**

```typescript
{
  slug: 'applications',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'url', 'status', 'type'],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => ['super-admin', 'admin'].includes(user.role),
    update: ({ req: { user } }) => ['super-admin', 'admin'].includes(user.role),
    delete: ({ req: { user } }) => user.role === 'super-admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description: 'Application display name',
      },
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      required: true,
      admin: {
        description: 'Unique identifier (e.g., gestao-cadastro)',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'icon',
      type: 'select',
      options: [
        { label: '👥 Users', value: 'users' },
        { label: '🏢 Building', value: 'building' },
        { label: '💳 Credit Card', value: 'credit-card' },
        { label: '📊 Chart', value: 'chart' },
        { label: '📈 Trending Up', value: 'trending-up' },
        { label: '🔔 Bell', value: 'bell' },
        { label: '⚙️ Settings', value: 'settings' },
        { label: '📋 Clipboard', value: 'clipboard' },
        { label: '💰 Dollar', value: 'dollar-sign' },
        { label: '📄 File', value: 'file-text' },
      ],
      admin: {
        description: 'Lucide icon name',
      },
    },
    {
      name: 'url',
      type: 'text',
      required: true,
      admin: {
        description: 'Application URL (absolute or relative)',
        placeholder: 'https://apps.lbpay.com/cadastro or /apps/cadastro',
      },
    },
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Iframe (Embedded)', value: 'iframe' },
        { label: 'New Tab', value: 'new-tab' },
        { label: 'Same Window', value: 'same-window' },
      ],
      defaultValue: 'iframe',
      required: true,
    },
    {
      name: 'iframeConfig',
      type: 'group',
      admin: {
        condition: (data) => data.type === 'iframe',
      },
      fields: [
        {
          name: 'allowFullscreen',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'sandbox',
          type: 'select',
          hasMany: true,
          options: [
            { label: 'Allow Forms', value: 'allow-forms' },
            { label: 'Allow Scripts', value: 'allow-scripts' },
            { label: 'Allow Same Origin', value: 'allow-same-origin' },
            { label: 'Allow Popups', value: 'allow-popups' },
            { label: 'Allow Modals', value: 'allow-modals' },
          ],
          defaultValue: ['allow-forms', 'allow-scripts', 'allow-same-origin'],
        },
        {
          name: 'csp',
          type: 'text',
          admin: {
            description: 'Content Security Policy',
          },
        },
      ],
    },
    {
      name: 'authentication',
      type: 'group',
      fields: [
        {
          name: 'requiresAuth',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'tokenPassingMethod',
          type: 'select',
          options: [
            { label: 'Query Parameter', value: 'query-param' },
            { label: 'PostMessage', value: 'postmessage' },
            { label: 'Custom Header', value: 'header' },
            { label: 'Cookie', value: 'cookie' },
          ],
          defaultValue: 'query-param',
          admin: {
            condition: (data) => data.authentication?.requiresAuth,
          },
        },
        {
          name: 'tokenParamName',
          type: 'text',
          defaultValue: 'token',
          admin: {
            condition: (data) =>
              data.authentication?.requiresAuth &&
              data.authentication?.tokenPassingMethod === 'query-param',
          },
        },
      ],
    },
    {
      name: 'requiredPermissions',
      type: 'relationship',
      relationTo: 'permissions',
      hasMany: true,
      admin: {
        description: 'Permissions required to access this app',
      },
    },
    {
      name: 'requiredRoles',
      type: 'relationship',
      relationTo: 'roles',
      hasMany: true,
      admin: {
        description: 'Roles required to access this app',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Development', value: 'development' },
        { label: 'Maintenance', value: 'maintenance' },
      ],
      defaultValue: 'active',
      required: true,
    },
    {
      name: 'healthCheckUrl',
      type: 'text',
      admin: {
        description: 'Health check endpoint (optional)',
        placeholder: 'https://apps.lbpay.com/cadastro/health',
      },
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional metadata (version, team, etc.)',
      },
    },
  ],
  timestamps: true,
  hooks: {
    afterChange: [
      async ({ doc, req, operation }) => {
        await req.payload.create({
          collection: 'audit_logs',
          data: {
            user: req.user?.id,
            action: `application.${operation}`,
            resource: 'applications',
            resourceId: doc.id,
            metadata: { applicationSlug: doc.slug },
          },
        });
      },
    ],
  },
}
```

---

### Collection: `menu_items`

**Descrição:** Itens de menu hierárquico (tree structure)

**Fields:**

```typescript
{
  slug: 'menu_items',
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'parent', 'application', 'order', 'visible'],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => ['super-admin', 'admin'].includes(user.role),
    update: ({ req: { user } }) => ['super-admin', 'admin'].includes(user.role),
    delete: ({ req: { user } }) => ['super-admin', 'admin'].includes(user.role),
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description: 'Menu item display label',
      },
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'menu_items',
      admin: {
        description: 'Parent menu item (for nested menus)',
      },
    },
    {
      name: 'application',
      type: 'relationship',
      relationTo: 'applications',
      admin: {
        description: 'Application to open when clicked',
      },
    },
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Link (Application)', value: 'link' },
        { label: 'Separator', value: 'separator' },
        { label: 'Group Header', value: 'group' },
        { label: 'External URL', value: 'external' },
      ],
      defaultValue: 'link',
      required: true,
    },
    {
      name: 'externalUrl',
      type: 'text',
      admin: {
        condition: (data) => data.type === 'external',
        description: 'External URL (opens in new tab)',
      },
    },
    {
      name: 'icon',
      type: 'text',
      admin: {
        description: 'Lucide icon name (e.g., users, building, chart)',
        placeholder: 'users',
      },
    },
    {
      name: 'order',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Display order (lower numbers first)',
      },
    },
    {
      name: 'badge',
      type: 'group',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'type',
          type: 'select',
          options: [
            { label: 'Static', value: 'static' },
            { label: 'API Endpoint', value: 'api' },
            { label: 'Real-time (WebSocket)', value: 'websocket' },
          ],
          admin: {
            condition: (data) => data.badge?.enabled,
          },
        },
        {
          name: 'value',
          type: 'text',
          admin: {
            condition: (data) => data.badge?.enabled && data.badge?.type === 'static',
            description: 'Static badge value (e.g., "NEW", "BETA")',
          },
        },
        {
          name: 'apiEndpoint',
          type: 'text',
          admin: {
            condition: (data) => data.badge?.enabled && data.badge?.type === 'api',
            description: 'API endpoint to fetch badge value',
            placeholder: '/api/badge/pending-approvals',
          },
        },
        {
          name: 'color',
          type: 'select',
          options: [
            { label: 'Red', value: 'red' },
            { label: 'Orange', value: 'orange' },
            { label: 'Yellow', value: 'yellow' },
            { label: 'Green', value: 'green' },
            { label: 'Blue', value: 'blue' },
            { label: 'Purple', value: 'purple' },
            { label: 'Gray', value: 'gray' },
          ],
          defaultValue: 'blue',
        },
      ],
    },
    {
      name: 'visible',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Show/hide menu item',
      },
    },
    {
      name: 'requiredPermissions',
      type: 'relationship',
      relationTo: 'permissions',
      hasMany: true,
      admin: {
        description: 'Permissions required to see this menu item',
      },
    },
    {
      name: 'requiredRoles',
      type: 'relationship',
      relationTo: 'roles',
      hasMany: true,
      admin: {
        description: 'Roles required to see this menu item',
      },
    },
  ],
  timestamps: true,
}
```

---

### Collection: `portal_settings` (Global Singleton)

**Descrição:** Configurações globais do portal

**Fields:**

```typescript
{
  slug: 'portal_settings',
  admin: {
    useAsTitle: 'siteName',
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => ['super-admin', 'admin'].includes(user.role),
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      required: true,
      localized: true,
      defaultValue: 'LBPay Portal',
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Portal logo (displayed in header)',
      },
    },
    {
      name: 'favicon',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'branding',
      type: 'group',
      fields: [
        {
          name: 'primaryColor',
          type: 'text',
          defaultValue: '#3b82f6',
          admin: {
            description: 'Primary brand color (hex)',
          },
        },
        {
          name: 'secondaryColor',
          type: 'text',
          defaultValue: '#8b5cf6',
        },
        {
          name: 'accentColor',
          type: 'text',
          defaultValue: '#10b981',
        },
      ],
    },
    {
      name: 'authentication',
      type: 'group',
      fields: [
        {
          name: 'sessionTimeout',
          type: 'number',
          defaultValue: 30,
          admin: {
            description: 'Session timeout in minutes',
          },
        },
        {
          name: 'require2FA',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Require two-factor authentication for all users',
          },
        },
        {
          name: 'allowSelfRegistration',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },
    {
      name: 'localization',
      type: 'group',
      fields: [
        {
          name: 'defaultLanguage',
          type: 'select',
          options: [
            { label: 'Português (Brasil)', value: 'pt-BR' },
            { label: 'English (US)', value: 'en-US' },
            { label: 'Español', value: 'es-ES' },
          ],
          defaultValue: 'pt-BR',
          required: true,
        },
        {
          name: 'availableLanguages',
          type: 'select',
          hasMany: true,
          options: [
            { label: 'Português (Brasil)', value: 'pt-BR' },
            { label: 'English (US)', value: 'en-US' },
            { label: 'Español', value: 'es-ES' },
          ],
          defaultValue: ['pt-BR', 'en-US'],
        },
        {
          name: 'defaultTimezone',
          type: 'text',
          defaultValue: 'America/Sao_Paulo',
        },
      ],
    },
    {
      name: 'features',
      type: 'group',
      fields: [
        {
          name: 'enableNotifications',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'enableAuditLogs',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'enableThemeSwitcher',
          type: 'checkbox',
          defaultValue: true,
        },
      ],
    },
    {
      name: 'footer',
      type: 'group',
      fields: [
        {
          name: 'text',
          type: 'richText',
          localized: true,
          admin: {
            description: 'Footer text/copyright',
          },
        },
        {
          name: 'links',
          type: 'array',
          fields: [
            {
              name: 'label',
              type: 'text',
              localized: true,
            },
            {
              name: 'url',
              type: 'text',
            },
          ],
        },
      ],
    },
  ],
  globals: true, // This is a global singleton
}
```

---

### Collection: `audit_logs` (Append-Only)

**Descrição:** Logs de auditoria imutáveis

**Fields:**

```typescript
{
  slug: 'audit_logs',
  admin: {
    useAsTitle: 'action',
    defaultColumns: ['user', 'action', 'resource', 'timestamp'],
    pagination: {
      defaultLimit: 50,
    },
  },
  access: {
    read: ({ req: { user } }) =>
      ['super-admin', 'compliance-officer'].includes(user.role),
    create: () => true, // Internal creation only
    update: () => false, // Immutable
    delete: () => false, // Never delete
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'action',
      type: 'text',
      required: true,
      admin: {
        readOnly: true,
        description: 'Action performed (e.g., user.login, application.create)',
      },
    },
    {
      name: 'resource',
      type: 'text',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'resourceId',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'success',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'errorMessage',
      type: 'textarea',
      admin: {
        readOnly: true,
        condition: (data) => !data.success,
      },
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        readOnly: true,
        description: 'Additional context (IP, user agent, changes, etc.)',
      },
    },
    {
      name: 'timestamp',
      type: 'date',
      admin: {
        readOnly: true,
        date: {
          displayFormat: 'dd/MM/yyyy HH:mm:ss',
        },
      },
    },
  ],
  timestamps: false, // Use custom timestamp field
  hooks: {
    beforeChange: [
      () => {
        throw new Error('Audit logs are immutable');
      },
    ],
    beforeDelete: [
      () => {
        throw new Error('Audit logs cannot be deleted');
      },
    ],
  },
}
```

---

## 🔐 AUTENTICAÇÃO E AUTORIZAÇÃO

### Integração Keycloak (OAuth2/OIDC)

**Estratégia de Autenticação:**

1. **Keycloak como Identity Provider (IdP)**
2. **PayloadCMS como Service Provider (SP)**
3. **Shadow Users** sincronizados automaticamente
4. **Dual Token System:** Keycloak JWT + Payload Session

**Flow de Autenticação (OAuth2 Authorization Code):**

```
1. User acessa Portal → /admin
2. Portal detecta: não autenticado
3. Redirect para Keycloak:
   https://keycloak.lbpay.com/realms/lbpay-portal/protocol/openid-connect/auth
   ?client_id=portal-container
   &redirect_uri=https://portal.lbpay.com/api/oauth/callback
   &response_type=code
   &scope=openid email profile roles

4. User faz login no Keycloak (email/password + 2FA)
5. Keycloak valida credenciais
6. Redirect de volta ao Portal com code:
   https://portal.lbpay.com/api/oauth/callback?code=AUTHORIZATION_CODE

7. Portal troca code por tokens:
   POST https://keycloak.lbpay.com/realms/lbpay-portal/protocol/openid-connect/token
   Body: {
     grant_type: 'authorization_code',
     code: 'AUTHORIZATION_CODE',
     redirect_uri: 'https://portal.lbpay.com/api/oauth/callback',
     client_id: 'portal-container',
     client_secret: 'CLIENT_SECRET'
   }

8. Keycloak retorna tokens:
   {
     "access_token": "eyJhbGc...", // JWT (15min)
     "refresh_token": "eyJhbGc...", // Refresh token (30 days)
     "id_token": "eyJhbGc...", // OIDC ID token
     "token_type": "Bearer",
     "expires_in": 900
   }

9. Portal decodifica JWT e extrai claims:
   {
     "sub": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
     "email": "joao.silva@lbpay.com",
     "given_name": "João",
     "family_name": "Silva",
     "preferred_username": "joao.silva",
     "realm_roles": ["operator", "billing-viewer"],
     "resource_access": {
       "portal-container": {
         "roles": ["menu-admin", "app-admin"]
       }
     }
   }

10. Portal cria/atualiza Shadow User no Payload:
    - Busca user por keycloak_sub
    - Se não existe: cria novo
    - Se existe: atualiza dados (email, nome, roles)
    - Mapeia Keycloak roles → Payload roles

11. Portal cria sessão Payload:
    - Gera Payload JWT (session token)
    - Armazena Keycloak access_token + refresh_token

12. Redirect para /admin (autenticado)
```

**Implementação - Custom Keycloak Strategy:**

```typescript
// payload.config.ts
import { buildConfig } from 'payload/config';
import { postgresAdapter } from '@payloadcms/db-postgres';

export default buildConfig({
  collections: [
    {
      slug: 'users',
      auth: {
        strategies: [
          {
            name: 'keycloak-oauth',
            authenticate: async ({ payload, headers, req }) => {
              // Extract token from Authorization header
              const authHeader = headers.authorization;
              if (!authHeader?.startsWith('Bearer ')) {
                throw new Error('Missing Authorization header');
              }

              const keycloakAccessToken = authHeader.split(' ')[1];

              // Validate token with Keycloak
              const userInfoResponse = await fetch(
                `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/userinfo`,
                {
                  headers: {
                    Authorization: `Bearer ${keycloakAccessToken}`,
                  },
                }
              );

              if (!userInfoResponse.ok) {
                throw new Error('Invalid Keycloak token');
              }

              const keycloakUser = await userInfoResponse.json();

              // Find or create shadow user
              let user = await payload.find({
                collection: 'users',
                where: {
                  keycloak_sub: {
                    equals: keycloakUser.sub,
                  },
                },
                limit: 1,
              });

              if (!user.docs[0]) {
                // Create new shadow user
                const primaryRole = await mapKeycloakRoleToPayload(
                  keycloakUser.realm_roles?.[0] || 'viewer',
                  payload
                );

                user = await payload.create({
                  collection: 'users',
                  data: {
                    keycloak_sub: keycloakUser.sub,
                    email: keycloakUser.email,
                    username: keycloakUser.preferred_username,
                    firstName: keycloakUser.given_name,
                    lastName: keycloakUser.family_name,
                    role: primaryRole.id,
                    isActive: true,
                    metadata: {
                      keycloakRoles: keycloakUser.realm_roles,
                      keycloakGroups: keycloakUser.groups,
                    },
                  },
                });

                return user;
              } else {
                // Update existing shadow user
                const updatedUser = await payload.update({
                  collection: 'users',
                  id: user.docs[0].id,
                  data: {
                    email: keycloakUser.email,
                    firstName: keycloakUser.given_name,
                    lastName: keycloakUser.family_name,
                    metadata: {
                      ...user.docs[0].metadata,
                      keycloakRoles: keycloakUser.realm_roles,
                      lastSyncAt: new Date().toISOString(),
                    },
                  },
                });

                return updatedUser;
              }
            },
          },
        ],
      },
    },
  ],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
  }),
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL,
  cors: [process.env.KEYCLOAK_URL],
});

// Helper: Map Keycloak roles to Payload roles
async function mapKeycloakRoleToPayload(
  keycloakRole: string,
  payload: any
): Promise<any> {
  const roleMapping = {
    'super-admin': 'super-admin',
    'admin': 'admin',
    'operator': 'operator',
    'compliance-officer': 'compliance-officer',
    'viewer': 'viewer',
  };

  const payloadRoleName = roleMapping[keycloakRole] || 'viewer';

  const role = await payload.find({
    collection: 'roles',
    where: {
      name: {
        equals: payloadRoleName,
      },
    },
    limit: 1,
  });

  return role.docs[0];
}
```

**OAuth2 Callback Endpoint:**

```typescript
// app/api/oauth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${error}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/login?error=missing_code', request.url)
    );
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch(
      `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: `${process.env.NEXT_PUBLIC_PORTAL_URL}/api/oauth/callback`,
          client_id: process.env.KEYCLOAK_CLIENT_ID!,
          client_secret: process.env.KEYCLOAK_CLIENT_SECRET!,
        }),
      }
    );

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    const tokens = await tokenResponse.json();

    // Decode JWT to get user info
    const payload = await getPayload({ config });

    // Authenticate using custom strategy
    const user = await payload.auth({
      headers: {
        authorization: `Bearer ${tokens.access_token}`,
      },
    });

    // Create Payload session
    const sessionToken = await payload.login({
      collection: 'users',
      data: {
        email: user.email,
        password: 'oauth', // Dummy password
      },
    });

    // Set session cookie
    const response = NextResponse.redirect(
      new URL('/admin', request.url)
    );

    response.cookies.set('payload-token', sessionToken.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    // Store Keycloak tokens (for calling external apps)
    response.cookies.set('keycloak-access-token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokens.expires_in,
    });

    response.cookies.set('keycloak-refresh-token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/login?error=authentication_failed', request.url)
    );
  }
}
```

---

### RBAC (Role-Based Access Control)

**3 Níveis de Controle:**

1. **Collection-Level Access Control**
   - Controla acesso a Collections inteiras
   - Exemplo: Apenas `super-admin` pode criar/deletar `roles`

2. **Field-Level Access Control**
   - Controla visibilidade/edição de campos específicos
   - Exemplo: Apenas `super-admin` pode editar `keycloak_sub`

3. **Document-Level Access Control (Row-Level)**
   - Controla acesso a documentos específicos
   - Exemplo: Users só podem ler seus próprios dados

**Exemplo Completo - Collection `users`:**

```typescript
{
  slug: 'users',
  access: {
    // Collection-level
    read: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'super-admin') return true;
      // Users can read themselves
      return { id: { equals: user.id } };
    },
    create: ({ req: { user } }) => {
      return user?.role === 'super-admin';
    },
    update: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'super-admin') return true;
      // Users can update themselves (with field restrictions)
      return { id: { equals: user.id } };
    },
    delete: ({ req: { user } }) => {
      return user?.role === 'super-admin';
    },
  },
  fields: [
    {
      name: 'keycloak_sub',
      type: 'text',
      // Field-level access
      access: {
        read: () => true,
        update: () => false, // Immutable
      },
    },
    {
      name: 'email',
      type: 'email',
      access: {
        read: () => true,
        update: ({ req: { user } }) => user?.role === 'super-admin',
      },
    },
    {
      name: 'role',
      type: 'relationship',
      relationTo: 'roles',
      access: {
        read: () => true,
        update: ({ req: { user } }) =>
          ['super-admin', 'admin'].includes(user?.role),
      },
    },
  ],
}
```

**Permission Checking Helper (Frontend):**

```typescript
// lib/permissions.ts
import { User, Role, Permission } from '@/payload-types';

export function hasPermission(
  user: User,
  resource: string,
  action: string
): boolean {
  if (!user || !user.role) return false;

  const role = user.role as Role;

  if (role.name === 'super-admin') return true;

  const permissions = role.permissions as Permission[];

  return permissions?.some(
    (perm) =>
      (perm.resource === resource || perm.resource === '*') &&
      (perm.action === action || perm.action === '*')
  );
}

export function canAccessApplication(
  user: User,
  application: Application
): boolean {
  if (!user || !user.role) return false;

  const role = user.role as Role;

  if (role.name === 'super-admin') return true;

  // Check if user role is in required roles
  if (application.requiredRoles?.length > 0) {
    const userRoleIds = [role.id, ...(user.additionalRoles?.map(r => r.id) || [])];
    const requiredRoleIds = application.requiredRoles.map(r => r.id);

    if (!requiredRoleIds.some(id => userRoleIds.includes(id))) {
      return false;
    }
  }

  // Check if user has required permissions
  if (application.requiredPermissions?.length > 0) {
    const userPermissions = role.permissions as Permission[];
    const requiredPermissions = application.requiredPermissions as Permission[];

    return requiredPermissions.every((reqPerm) =>
      userPermissions?.some(
        (userPerm) =>
          (userPerm.resource === reqPerm.resource || userPerm.resource === '*') &&
          (userPerm.action === reqPerm.action || userPerm.action === '*')
      )
    );
  }

  return true;
}
```

---

## 🎨 INTERFACE DO PORTAL (Frontend Custom)

### Layout do Portal

**Estrutura de Componentes:**

```
┌─────────────────────────────────────────────────────────────────┐
│  <PortalLayout>                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  <PortalHeader>                                           │  │
│  │    <Logo />                                               │  │
│  │    <Breadcrumb />                                         │  │
│  │    <LanguageSwitcher />                                   │  │
│  │    <NotificationBell />                                   │  │
│  │    <UserMenu />                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌──────────────┐  ┌────────────────────────────────────────┐  │
│  │              │  │                                        │  │
│  │  <Sidebar>   │  │  <MainContent>                         │  │
│  │              │  │    {children}                          │  │
│  │  <MenuTree>  │  │  </MainContent>                        │  │
│  │    {items}   │  │                                        │  │
│  │  </MenuTree> │  │                                        │  │
│  │              │  │                                        │  │
│  │  <SidebarFooter>                                         │  │
│  │    Theme Toggle                                          │  │
│  │    Collapse Button                                       │  │
│  │  </SidebarFooter>                                        │  │
│  └──────────────┘  └────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  <PortalFooter>                                           │  │
│  │    Version | Links | Copyright                           │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

**Implementação - Portal Layout:**

```typescript
// app/(portal)/layout.tsx
import { PortalHeader } from '@/components/portal/PortalHeader';
import { Sidebar } from '@/components/portal/Sidebar';
import { PortalFooter } from '@/components/portal/PortalFooter';
import { getPayload } from 'payload';
import config from '@payload-config';

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const payload = await getPayload({ config });

  // Fetch current user from session
  const { user } = await payload.auth({ req });

  if (!user) {
    redirect('/login');
  }

  // Fetch menu items filtered by user permissions
  const menuItems = await payload.find({
    collection: 'menu_items',
    where: {
      visible: { equals: true },
      parent: { exists: false }, // Root items only
    },
    sort: 'order',
    depth: 2, // Include nested items and applications
  });

  // Filter menu items by user permissions
  const filteredMenuItems = menuItems.docs.filter((item) => {
    if (!item.requiredRoles && !item.requiredPermissions) {
      return true; // No restrictions
    }

    // Check roles
    if (item.requiredRoles?.length > 0) {
      const userRoleIds = [
        user.role.id,
        ...(user.additionalRoles?.map((r) => r.id) || []),
      ];
      const requiredRoleIds = item.requiredRoles.map((r) => r.id);

      if (!requiredRoleIds.some((id) => userRoleIds.includes(id))) {
        return false;
      }
    }

    // Check permissions
    if (item.requiredPermissions?.length > 0) {
      const userPermissions = user.role.permissions;
      return item.requiredPermissions.every((reqPerm) =>
        userPermissions.some(
          (userPerm) =>
            (userPerm.resource === reqPerm.resource ||
              userPerm.resource === '*') &&
            (userPerm.action === reqPerm.action || userPerm.action === '*')
        )
      );
    }

    return true;
  });

  // Fetch portal settings
  const portalSettings = await payload.findGlobal({
    slug: 'portal_settings',
  });

  return (
    <div className="flex h-screen flex-col">
      <PortalHeader user={user} settings={portalSettings} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar menuItems={filteredMenuItems} user={user} />

        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>

      <PortalFooter settings={portalSettings} />
    </div>
  );
}
```

**Implementação - Sidebar com Menu Tree:**

```typescript
// components/portal/Sidebar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight } from 'lucide-react';
import * as Icons from 'lucide-react';
import { MenuItem, User } from '@/payload-types';

interface SidebarProps {
  menuItems: MenuItem[];
  user: User;
}

export function Sidebar({ menuItems, user }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'flex flex-col border-r bg-white dark:bg-gray-800 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex-1 overflow-auto py-4">
        <nav className="space-y-1 px-2">
          {menuItems.map((item) => (
            <MenuTreeItem
              key={item.id}
              item={item}
              collapsed={collapsed}
              pathname={pathname}
            />
          ))}
        </nav>
      </div>

      <div className="border-t p-4">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          {collapsed ? '→' : '← Collapse'}
        </button>
      </div>
    </aside>
  );
}

function MenuTreeItem({
  item,
  collapsed,
  pathname,
  level = 0,
}: {
  item: MenuItem;
  collapsed: boolean;
  pathname: string;
  level?: number;
}) {
  const [expanded, setExpanded] = useState(false);

  const Icon = item.icon ? Icons[item.icon] : null;
  const hasChildren = item.children?.length > 0;

  const href = item.application
    ? `/app/${item.application.slug}`
    : item.externalUrl || '#';

  const isActive = pathname === href;

  if (item.type === 'separator') {
    return <div className="my-2 border-t border-gray-200 dark:border-gray-700" />;
  }

  if (item.type === 'group') {
    return (
      <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
        {!collapsed && item.label}
      </div>
    );
  }

  return (
    <div>
      <Link
        href={href}
        onClick={(e) => {
          if (hasChildren) {
            e.preventDefault();
            setExpanded(!expanded);
          }
        }}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          'hover:bg-gray-100 dark:hover:bg-gray-700',
          isActive && 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-100',
          !isActive && 'text-gray-700 dark:text-gray-300',
          level > 0 && 'ml-4'
        )}
        style={{ paddingLeft: collapsed ? undefined : `${12 + level * 16}px` }}
      >
        {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}

        {!collapsed && (
          <>
            <span className="flex-1">{item.label}</span>

            {item.badge?.enabled && (
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-xs font-semibold',
                  `bg-${item.badge.color}-100 text-${item.badge.color}-800`,
                  `dark:bg-${item.badge.color}-900 dark:text-${item.badge.color}-100`
                )}
              >
                {item.badge.value || '0'}
              </span>
            )}

            {hasChildren && (
              expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
            )}
          </>
        )}
      </Link>

      {hasChildren && expanded && !collapsed && (
        <div className="mt-1 space-y-1">
          {item.children.map((child) => (
            <MenuTreeItem
              key={child.id}
              item={child}
              collapsed={collapsed}
              pathname={pathname}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

---

### Renderização de Aplicações Externas (Iframe)

**Implementação - Application Frame:**

```typescript
// app/(portal)/app/[slug]/page.tsx
import { getPayload } from 'payload';
import config from '@payload-config';
import { notFound } from 'next/navigation';
import { ApplicationFrame } from '@/components/portal/ApplicationFrame';

export default async function ApplicationPage({
  params,
}: {
  params: { slug: string };
}) {
  const payload = await getPayload({ config });

  // Fetch application
  const applications = await payload.find({
    collection: 'applications',
    where: {
      slug: { equals: params.slug },
    },
    limit: 1,
  });

  if (!applications.docs[0]) {
    notFound();
  }

  const application = applications.docs[0];

  // Get current user
  const { user } = await payload.auth({ req });

  if (!user) {
    redirect('/login');
  }

  // Check if user has permission to access this app
  const canAccess = canAccessApplication(user, application);

  if (!canAccess) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Access Denied
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            You don't have permission to access this application.
          </p>
        </div>
      </div>
    );
  }

  // Get Keycloak access token from cookies
  const keycloakToken = cookies().get('keycloak-access-token')?.value;

  return (
    <ApplicationFrame
      application={application}
      user={user}
      token={keycloakToken}
    />
  );
}
```

```typescript
// components/portal/ApplicationFrame.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { Application, User } from '@/payload-types';
import { Loader2 } from 'lucide-react';

interface ApplicationFrameProps {
  application: Application;
  user: User;
  token?: string;
}

export function ApplicationFrame({
  application,
  user,
  token,
}: ApplicationFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Build iframe URL with token
  const buildUrl = () => {
    const url = new URL(application.url);

    if (application.authentication?.requiresAuth && token) {
      if (application.authentication.tokenPassingMethod === 'query-param') {
        url.searchParams.set(
          application.authentication.tokenParamName || 'token',
          token
        );
      }
    }

    return url.toString();
  };

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    // Listen for iframe load
    const handleLoad = () => {
      setLoading(false);

      // Send initial message to iframe (if using postMessage)
      if (application.authentication?.tokenPassingMethod === 'postmessage') {
        iframe.contentWindow?.postMessage(
          {
            type: 'AUTH_TOKEN',
            token,
            user: {
              id: user.id,
              email: user.email,
              name: `${user.firstName} ${user.lastName}`,
              role: user.role,
            },
          },
          application.url
        );
      }
    };

    const handleError = () => {
      setLoading(false);
      setError('Failed to load application');
    };

    iframe.addEventListener('load', handleLoad);
    iframe.addEventListener('error', handleError);

    return () => {
      iframe.removeEventListener('load', handleLoad);
      iframe.removeEventListener('error', handleError);
    };
  }, [application, token, user]);

  // Listen for messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate origin
      const appOrigin = new URL(application.url).origin;
      if (event.origin !== appOrigin) return;

      // Handle iframe messages
      switch (event.data.type) {
        case 'READY':
          console.log('Application loaded successfully');
          break;
        case 'NAVIGATE':
          // Handle navigation requests from iframe
          window.location.href = event.data.url;
          break;
        case 'RESIZE':
          // Handle iframe resize requests
          if (iframeRef.current) {
            iframeRef.current.style.height = `${event.data.height}px`;
          }
          break;
        default:
          console.log('Unknown message type:', event.data.type);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [application.url]);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600">Error</h2>
          <p className="mt-2 text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-900">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )}

      <iframe
        ref={iframeRef}
        src={buildUrl()}
        className="h-full w-full border-0"
        title={application.name}
        sandbox={
          application.type === 'iframe'
            ? application.iframeConfig?.sandbox?.join(' ')
            : undefined
        }
        allow={application.iframeConfig?.allowFullscreen ? 'fullscreen' : undefined}
      />
    </div>
  );
}
```

**Comunicação Iframe ↔ Portal (PostMessage API):**

```typescript
// External Application (React/Vue/Angular/etc.)
// app.ts

// Listen for auth token from portal
window.addEventListener('message', (event) => {
  // Validate origin
  if (event.origin !== 'https://portal.lbpay.com') return;

  switch (event.data.type) {
    case 'AUTH_TOKEN':
      // Store token and user info
      localStorage.setItem('auth_token', event.data.token);
      localStorage.setItem('user', JSON.stringify(event.data.user));

      // Initialize app with user context
      initializeApp(event.data.user);

      // Notify portal that app is ready
      window.parent.postMessage(
        { type: 'READY', appId: 'gestao-cadastro' },
        'https://portal.lbpay.com'
      );
      break;
  }
});

// Request portal navigation
function navigateToApp(appSlug: string) {
  window.parent.postMessage(
    { type: 'NAVIGATE', url: `/app/${appSlug}` },
    'https://portal.lbpay.com'
  );
}

// Request iframe resize
function resizeIframe(height: number) {
  window.parent.postMessage(
    { type: 'RESIZE', height },
    'https://portal.lbpay.com'
  );
}
```

---

## 🌐 MULTI-IDIOMA (i18n)

PayloadCMS possui suporte nativo a multi-idioma via **localization**:

**Configuração:**

```typescript
// payload.config.ts
export default buildConfig({
  localization: {
    locales: [
      {
        code: 'pt-BR',
        label: 'Português (Brasil)',
        fallbackLocale: 'pt-BR',
      },
      {
        code: 'en-US',
        label: 'English (US)',
        fallbackLocale: 'pt-BR',
      },
      {
        code: 'es-ES',
        label: 'Español',
        fallbackLocale: 'pt-BR',
      },
    ],
    defaultLocale: 'pt-BR',
    fallback: true,
  },
  collections: [
    {
      slug: 'menu_items',
      fields: [
        {
          name: 'label',
          type: 'text',
          localized: true, // This field supports multiple languages
        },
      ],
    },
  ],
});
```

**Frontend Language Switcher:**

```typescript
// components/portal/LanguageSwitcher.tsx
'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const languages = [
  { code: 'pt-BR', label: 'Português', flag: '🇧🇷' },
  { code: 'en-US', label: 'English', flag: '🇺🇸' },
  { code: 'es-ES', label: 'Español', flag: '🇪🇸' },
];

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();

  const currentLang = pathname.split('/')[1] || 'pt-BR';

  const handleLanguageChange = (code: string) => {
    // Update locale cookie
    document.cookie = `NEXT_LOCALE=${code}; path=/; max-age=31536000`;

    // Reload to apply new locale
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">
          {languages.find((l) => l.code === currentLang)?.flag}
        </span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className="cursor-pointer"
          >
            <span className="mr-2">{lang.flag}</span>
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

---

## 🚀 IMPLEMENTAÇÃO E DEPLOY

### Estrutura de Repositório

```
lb-portal-container/
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
├── payload.config.ts
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── logout/
│   ├── (portal)/
│   │   ├── layout.tsx       # Portal layout with sidebar
│   │   ├── page.tsx          # Dashboard
│   │   └── app/
│   │       └── [slug]/
│   │           └── page.tsx  # Application frame
│   ├── api/
│   │   ├── oauth/
│   │   │   └── callback/
│   │   │       └── route.ts  # OAuth callback
│   │   └── badge/
│   │       └── [slug]/
│   │           └── route.ts  # Badge value API
│   └── (payload)/
│       └── admin/            # Payload admin UI
├── components/
│   ├── portal/
│   │   ├── PortalHeader.tsx
│   │   ├── Sidebar.tsx
│   │   ├── ApplicationFrame.tsx
│   │   ├── LanguageSwitcher.tsx
│   │   └── UserMenu.tsx
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── permissions.ts        # Permission helpers
│   ├── keycloak.ts          # Keycloak client
│   └── utils.ts
├── collections/
│   ├── Users.ts
│   ├── Roles.ts
│   ├── Permissions.ts
│   ├── Applications.ts
│   ├── MenuItems.ts
│   ├── PortalSettings.ts
│   └── AuditLogs.ts
├── hooks/
│   ├── afterLogin.ts
│   └── auditLog.ts
├── public/
│   ├── logo.svg
│   └── favicon.ico
└── docker-compose.yml
```

---

### Docker Compose (Desenvolvimento Local)

```yaml
# docker-compose.yml
version: '3.9'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: portal_container
      POSTGRES_USER: portal_user
      POSTGRES_PASSWORD: portal_password
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

  keycloak:
    image: quay.io/keycloak/keycloak:23.0
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://postgres:5432/keycloak
      KC_DB_USERNAME: portal_user
      KC_DB_PASSWORD: portal_password
      KC_HOSTNAME: localhost
      KC_HTTP_ENABLED: true
    ports:
      - '8080:8080'
    depends_on:
      - postgres
    command: start-dev

  portal:
    build: .
    environment:
      DATABASE_URL: postgresql://portal_user:portal_password@postgres:5432/portal_container
      PAYLOAD_SECRET: your-secret-key-change-in-production
      NEXT_PUBLIC_PORTAL_URL: http://localhost:3000
      KEYCLOAK_URL: http://localhost:8080
      KEYCLOAK_REALM: lbpay-portal
      KEYCLOAK_CLIENT_ID: portal-container
      KEYCLOAK_CLIENT_SECRET: your-keycloak-client-secret
    ports:
      - '3000:3000'
    depends_on:
      - postgres
      - keycloak
    volumes:
      - ./src:/app/src
      - ./public:/app/public

volumes:
  postgres_data:
```

---

### Variáveis de Ambiente

```.env
# .env.example

# Database
DATABASE_URL=postgresql://portal_user:portal_password@localhost:5432/portal_container

# Payload
PAYLOAD_SECRET=your-secret-key-minimum-32-characters-change-in-production
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000

# Next.js
NEXT_PUBLIC_PORTAL_URL=http://localhost:3000

# Keycloak
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=lbpay-portal
KEYCLOAK_CLIENT_ID=portal-container
KEYCLOAK_CLIENT_SECRET=your-keycloak-client-secret

# Optional: External Apps Base URL
NEXT_PUBLIC_APPS_BASE_URL=http://localhost:4000
```

---

### Scripts de Deploy

```json
// package.json
{
  "name": "lb-portal-container",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "payload": "payload",
    "generate:types": "payload generate:types",
    "migrate": "payload migrate",
    "seed": "payload seed",
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down",
    "docker:logs": "docker-compose logs -f portal"
  },
  "dependencies": {
    "@payloadcms/db-postgres": "^3.0.0",
    "@payloadcms/next": "^3.0.0",
    "@payloadcms/richtext-lexical": "^3.0.0",
    "next": "15.4.7",
    "payload": "^3.0.0",
    "react": "19.1.1",
    "react-dom": "19.1.1",
    "typescript": "5.7.3",
    "drizzle-orm": "latest",
    "lucide-react": "latest",
    "@radix-ui/react-dropdown-menu": "latest",
    "tailwindcss": "^4.0.0",
    "zustand": "latest"
  }
}
```

---

## ✅ CRITÉRIOS DE ACEITE

### Fase 1: Autenticação e Autorização (2 semanas)

- [ ] Usuário consegue fazer login via Keycloak (OAuth2)
- [ ] Shadow user é criado automaticamente no Payload
- [ ] Roles do Keycloak são mapeadas para roles do Payload
- [ ] Logout funciona e invalida sessão
- [ ] RBAC field-level funciona (campos visíveis conforme role)
- [ ] RBAC document-level funciona (users só veem seus dados)

### Fase 2: Gestão de Aplicações e Menus (2 semanas)

- [ ] Admin consegue cadastrar aplicações via Payload Admin
- [ ] Admin consegue criar itens de menu via Payload Admin
- [ ] Menu hierárquico (parent/child) funciona
- [ ] Menu filtra items conforme permissões do usuário
- [ ] Ícones do Lucide aparecem corretamente
- [ ] Badges dinâmicos funcionam (estático, API)

### Fase 3: Renderização de Aplicações (2 semanas)

- [ ] Aplicações externas carregam em iframe
- [ ] Token JWT é passado para aplicação (query param)
- [ ] PostMessage API funciona (portal ↔ iframe)
- [ ] Aplicação em new-tab abre corretamente
- [ ] Sandbox e CSP funcionam (segurança)
- [ ] Loading state aparece enquanto carrega

### Fase 4: Multi-idioma e Configuração (1 semana)

- [ ] Troca de idioma funciona (pt-BR, en-US, es-ES)
- [ ] Menu labels aparecem no idioma selecionado
- [ ] Configurações do portal podem ser editadas
- [ ] Logo e branding aplicam corretamente
- [ ] Tema claro/escuro funciona

### Fase 5: Auditoria e Compliance (1 semana)

- [ ] Login/logout gera audit log
- [ ] CRUD de applications gera audit log
- [ ] Audit logs são imutáveis (não podem ser editados/deletados)
- [ ] Compliance Officer consegue visualizar audit logs
- [ ] Audit logs incluem IP e user agent

---

## 📊 MÉTRICAS DE SUCESSO

| Métrica | Target | Medição |
|---------|--------|---------|
| **Tempo de Login** | < 2s | Keycloak redirect + shadow user sync |
| **Tempo de Carregamento Menu** | < 500ms | Query + filter + render |
| **Tempo de Carregamento Iframe** | < 3s | External app boot time |
| **Disponibilidade** | 99.9% | Uptime monitoring |
| **Session Timeout** | 30min | Configurable via portal_settings |
| **Audit Logs Retention** | 5 anos | Compliance requirement |

---

## 🎯 PRÓXIMOS PASSOS

1. **Aprovação desta Especificação** - Stakeholders validam escopo
2. **Configuração Keycloak** - Criar realm, client, roles
3. **Setup Repositório** - Inicializar projeto Next.js + PayloadCMS
4. **Fase 1 - Sprint 1** (2 semanas) - Autenticação e autorização
5. **Fase 2 - Sprint 2** (2 semanas) - Gestão de aplicações e menus
6. **Fase 3 - Sprint 3** (2 semanas) - Renderização de aplicações
7. **Fase 4 - Sprint 4** (1 semana) - Multi-idioma e configuração
8. **Fase 5 - Sprint 5** (1 semana) - Auditoria e compliance
9. **Testing e Bug Fixes** (1 semana)
10. **Deploy em Produção** (1 semana)

**Total estimado: 10 semanas (2,5 meses)**

---

## 📝 NOTAS IMPORTANTES

### Vantagens do PayloadCMS para Portal Container

1. ✅ **Admin UI Nativa** - Gestão de aplicações/menus via interface
2. ✅ **RBAC Granular** - Collection-level, field-level, document-level
3. ✅ **Multi-idioma Nativo** - Localization built-in
4. ✅ **TypeScript First** - Type-safe, autocompletion
5. ✅ **Next.js 15 Integration** - Server Components, App Router
6. ✅ **Extensível** - Hooks, endpoints, componentes customizados
7. ✅ **PostgreSQL** - Database robusto e escalável
8. ✅ **REST + GraphQL** - APIs automáticas
9. ✅ **File Upload** - Storage integrado (local ou S3)
10. ✅ **Open Source** - MIT license, sem vendor lock-in

### Diferencial do Portal Container

- **Não gerencia lógica de negócio** - Apenas orquestra acesso
- **Tecnologia agnóstica** - Apps podem usar React, Vue, Angular, Svelte, HTMX, etc.
- **SSO centralizado** - Keycloak gerencia autenticação
- **Menus 100% dinâmicos** - Sem deployments para mudar menu
- **RBAC no portal** - Permissões controlam visibilidade de menus e apps
- **Iframe seguro** - Sandbox, CSP, postMessage
- **Multi-idioma real** - Não apenas UI, mas menu labels e configurações

---

**Documento mantido por:** Equipe de Desenvolvimento LBPay
**Última atualização:** 09 de Janeiro de 2025
**Versão:** 1.0
**Status:** ✅ Aprovado para Implementação
