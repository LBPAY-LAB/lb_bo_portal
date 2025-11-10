# Database Migration Strategy - Portal Container

**Project**: LB Portal Container (PayloadCMS 3.x)
**ORM**: Drizzle ORM (integrated in PayloadCMS)
**Database**: PostgreSQL 15
**Created by**: AGENT-DB-009 (Database Engineer)
**Date**: 2025-11-09
**Sprint**: Sprint 1 - Dia 1
**User Story**: US-001 (Setup de Repositório)

---

## Table of Contents

1. [Overview](#overview)
2. [Migration Workflow](#migration-workflow)
3. [Drizzle Kit Commands](#drizzle-kit-commands)
4. [Migration Files](#migration-files)
5. [Best Practices](#best-practices)
6. [Common Scenarios](#common-scenarios)
7. [Rollback Strategy](#rollback-strategy)
8. [Production Deployment](#production-deployment)
9. [Troubleshooting](#troubleshooting)

---

## Overview

### What are Database Migrations?

Database migrations are **version-controlled schema changes** that allow you to evolve your database structure over time in a predictable, repeatable manner.

### Why Use Migrations?

- **Version Control**: Track database schema changes in Git alongside code
- **Reproducibility**: Apply same changes across dev/staging/prod environments
- **Rollback Safety**: Revert schema changes if needed
- **Team Collaboration**: Avoid schema conflicts between developers
- **Automated Deployment**: Integrate with CI/CD pipelines

### PayloadCMS + Drizzle ORM

PayloadCMS 3.x uses **Drizzle ORM** as its database abstraction layer. Drizzle provides:

- **Type-safe queries**: Full TypeScript type inference
- **Schema-first approach**: Define schemas in TypeScript, generate SQL
- **Automatic migrations**: Generate migrations from schema changes
- **Multi-database support**: PostgreSQL, MySQL, SQLite

---

## Migration Workflow

### Development Workflow

```
┌────────────────────────────────────────────────────────────────┐
│                     DEVELOPMENT WORKFLOW                        │
└────────────────────────────────────────────────────────────────┘

1. Define Collection Config (TypeScript)
   ├── /src/collections/users.ts
   └── /src/collections/roles.ts

2. PayloadCMS generates Drizzle schema
   ├── Payload Config → Drizzle Schema
   └── Auto-generated (no manual editing)

3. Generate Migration
   ├── Command: npm run payload migrate:create
   ├── Drizzle Kit compares schema vs database
   └── Generates SQL migration file

4. Review Migration File
   ├── /src/migrations/YYYYMMDD_HHMMSS_migration_name.ts
   ├── Review SQL statements (CREATE, ALTER, DROP)
   └── Edit if needed (rare)

5. Apply Migration
   ├── Command: npm run payload migrate
   ├── Executes SQL against database
   └── Updates _drizzle_migrations table

6. Commit to Git
   ├── git add src/collections/ src/migrations/
   ├── git commit -m "feat: add users collection"
   └── git push origin feature/US-XXX

7. CI/CD Pipeline
   ├── GitHub Actions runs tests
   ├── Auto-deploy to staging
   └── Migrations applied automatically
```

### Production Deployment Workflow

```
┌────────────────────────────────────────────────────────────────┐
│                   PRODUCTION DEPLOYMENT                         │
└────────────────────────────────────────────────────────────────┘

1. Pre-Deployment
   ├── Backup database: pg_dump
   ├── Test migrations on staging clone
   └── Review migration plan with DBA

2. Deployment Window
   ├── Enable maintenance mode (optional)
   ├── Run migrations: npm run payload migrate
   └── Monitor for errors

3. Validation
   ├── Smoke tests: verify critical paths
   ├── Check table structure: \d+ table_name
   └── Monitor application logs

4. Rollback (if needed)
   ├── Restore from backup: pg_restore
   ├── OR apply down migration
   └── Deploy previous application version

5. Post-Deployment
   ├── Disable maintenance mode
   ├── Monitor metrics (latency, errors)
   └── Document changes in runbook
```

---

## Drizzle Kit Commands

### Core Commands

| Command | Description | When to Use |
|---------|-------------|-------------|
| `npm run payload migrate:create` | Generate new migration from schema changes | After modifying Collection configs |
| `npm run payload migrate` | Apply pending migrations | Deploy changes to database |
| `npm run payload migrate:status` | Check migration status | Verify which migrations are pending |
| `npm run db:generate` | Generate Drizzle schema (advanced) | Manual schema generation |
| `npm run db:push` | Push schema changes without migration | **DANGER**: Only use in dev (skips migrations) |

### Command Details

#### 1. Create Migration

```bash
# Generate migration from Collection changes
npm run payload migrate:create

# Example output:
# ✔ Migration created: src/migrations/20251109_add_users_table.ts
# Review the migration file before applying
```

**What it does**:
1. Reads PayloadCMS Collection configs (`src/collections/*.ts`)
2. Generates Drizzle schema
3. Compares schema with current database state
4. Generates SQL statements (CREATE, ALTER, DROP)
5. Creates timestamped migration file

**Generated file** (`src/migrations/20251109_add_users_table.ts`):

```typescript
import { sql } from 'drizzle-orm';
import type { MigrationMeta } from 'payload';

export const migration: MigrationMeta = {
  name: '20251109_add_users_table',
  up: async ({ db }) => {
    // Create users table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "email" TEXT NOT NULL UNIQUE,
        "keycloak_sub" TEXT NOT NULL UNIQUE,
        "first_name" TEXT,
        "last_name" TEXT,
        "role" UUID NOT NULL REFERENCES "roles"("id") ON DELETE RESTRICT,
        "region" UUID REFERENCES "regions"("id") ON DELETE SET NULL,
        "status" TEXT NOT NULL DEFAULT 'active',
        "last_login" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Create indexes
    await db.execute(sql`
      CREATE INDEX "users_role_idx" ON "users"("role");
      CREATE INDEX "users_region_idx" ON "users"("region");
      CREATE INDEX "users_status_idx" ON "users"("status");
    `);

    console.log('✔ users table created');
  },
  down: async ({ db }) => {
    // Rollback: Drop table
    await db.execute(sql`
      DROP TABLE IF EXISTS "users";
    `);

    console.log('✔ users table dropped');
  },
};
```

#### 2. Apply Migrations

```bash
# Apply all pending migrations
npm run payload migrate

# Example output:
# Checking for pending migrations...
# Found 2 pending migrations:
#   - 20251109_add_users_table
#   - 20251109_add_roles_table
# Applying migrations...
# ✔ 20251109_add_users_table (123ms)
# ✔ 20251109_add_roles_table (87ms)
# All migrations applied successfully!
```

**What it does**:
1. Connects to database
2. Checks `_drizzle_migrations` table for applied migrations
3. Runs pending migrations in order (by timestamp)
4. Updates `_drizzle_migrations` table
5. Commits transaction (atomic)

#### 3. Check Status

```bash
# Check migration status
npm run payload migrate:status

# Example output:
# Migration Status:
# ┌─────────────────────────────────┬──────────┬─────────────────────┐
# │ Migration                       │ Status   │ Applied At          │
# ├─────────────────────────────────┼──────────┼─────────────────────┤
# │ 20251109_add_users_table        │ Applied  │ 2025-11-09 14:23:10 │
# │ 20251109_add_roles_table        │ Applied  │ 2025-11-09 14:23:11 │
# │ 20251109_add_audit_logs_table   │ Pending  │ -                   │
# └─────────────────────────────────┴──────────┴─────────────────────┘
```

#### 4. Generate Schema (Advanced)

```bash
# Generate Drizzle schema only (no SQL migration)
npm run db:generate

# Use case: Review schema before creating migration
```

#### 5. Push Schema (DANGER - Dev Only)

```bash
# Push schema changes directly WITHOUT creating migration
npm run db:push

# WARNING: This skips migration history!
# Only use in local development for rapid prototyping
# NEVER use in staging/production
```

---

## Migration Files

### File Structure

```
src/migrations/
├── 20251109_120000_add_users_table.ts
├── 20251109_120001_add_roles_table.ts
├── 20251109_130000_add_permissions_table.ts
├── 20251109_140000_add_audit_logs_table.ts
└── index.ts (auto-generated)
```

### Naming Convention

```
YYYYMMDD_HHMMSS_descriptive_name.ts
│        │        └─ Snake_case description (max 50 chars)
│        └─ Time (24h format)
└─ Date (ISO 8601)

Examples:
- 20251109_120000_add_users_table.ts
- 20251109_130000_add_role_column_to_users.ts
- 20251109_140000_create_audit_logs_partitions.ts
```

### Migration File Template

```typescript
import { sql } from 'drizzle-orm';
import type { MigrationMeta } from 'payload';

export const migration: MigrationMeta = {
  name: '20251109_HHMMSS_migration_name',

  /**
   * up: Apply migration (forward)
   */
  up: async ({ db, payload }) => {
    // Execute SQL statements
    await db.execute(sql`
      -- Your SQL here
    `);

    // Optional: Access Payload API for data migrations
    // await payload.update({
    //   collection: 'users',
    //   where: { ... },
    //   data: { ... }
    // });

    console.log('✔ Migration applied: 20251109_HHMMSS_migration_name');
  },

  /**
   * down: Rollback migration (backward)
   */
  down: async ({ db, payload }) => {
    // Revert changes
    await db.execute(sql`
      -- Rollback SQL here
    `);

    console.log('✔ Migration rolled back: 20251109_HHMMSS_migration_name');
  },
};
```

### Migration Registry Table

Drizzle Kit automatically creates a `_drizzle_migrations` table:

```sql
CREATE TABLE "_drizzle_migrations" (
  "id" SERIAL PRIMARY KEY,
  "hash" TEXT NOT NULL,
  "created_at" BIGINT NOT NULL
);

-- Example data:
-- id | hash                             | created_at
-- 1  | 20251109_120000_add_users_table  | 1699545790000
-- 2  | 20251109_120001_add_roles_table  | 1699545791000
```

---

## Best Practices

### 1. Always Review Generated Migrations

```bash
# Generate migration
npm run payload migrate:create

# STOP! Review the file before applying
cat src/migrations/20251109_HHMMSS_*.ts

# Check SQL statements:
# - Are indexes correct?
# - Are foreign keys properly named?
# - Are default values sensible?
# - Is down() migration correct?

# If OK, apply:
npm run payload migrate
```

### 2. Test Migrations Locally First

```bash
# 1. Create migration
npm run payload migrate:create

# 2. Apply to local database
npm run payload migrate

# 3. Test application
npm run dev

# 4. Rollback to test down migration
npm run payload migrate:down

# 5. Re-apply
npm run payload migrate

# 6. If all OK, commit
git add src/migrations/
git commit -m "feat: add users table migration"
```

### 3. One Logical Change per Migration

```typescript
// ❌ BAD: Multiple unrelated changes
migration: {
  up: async ({ db }) => {
    await db.execute(sql`CREATE TABLE users (...)`);
    await db.execute(sql`CREATE TABLE roles (...)`);
    await db.execute(sql`ALTER TABLE applications ADD COLUMN ...`);
  }
}

// ✅ GOOD: Single logical change
migration: {
  up: async ({ db }) => {
    await db.execute(sql`CREATE TABLE users (...)`);
    await db.execute(sql`CREATE INDEX users_email_idx ON users(email)`);
  }
}
```

### 4. Always Provide Rollback (down)

```typescript
migration: {
  up: async ({ db }) => {
    await db.execute(sql`
      ALTER TABLE users ADD COLUMN region UUID REFERENCES regions(id);
    `);
  },

  // ✅ GOOD: Proper rollback
  down: async ({ db }) => {
    await db.execute(sql`
      ALTER TABLE users DROP COLUMN region;
    `);
  },

  // ❌ BAD: No rollback
  // down: async ({ db }) => {
  //   // TODO: implement
  // }
};
```

### 5. Use Transactions for Multi-Step Migrations

```typescript
migration: {
  up: async ({ db }) => {
    // All statements in a transaction (default)
    await db.execute(sql`CREATE TABLE users (...)`);
    await db.execute(sql`CREATE INDEX users_email_idx ON users(email)`);
    // If any fails, entire migration rolls back
  },
};
```

### 6. Backup Before Destructive Migrations

```typescript
migration: {
  up: async ({ db }) => {
    // Destructive: Dropping column
    console.log('⚠️  WARNING: This migration drops the old_column!');
    console.log('⚠️  Ensure backup exists before continuing.');

    await db.execute(sql`
      ALTER TABLE users DROP COLUMN old_column;
    `);
  },
};
```

### 7. Add Comments to Complex Migrations

```typescript
migration: {
  up: async ({ db }) => {
    // Migration: Split full_name into first_name + last_name
    // Step 1: Add new columns
    await db.execute(sql`
      ALTER TABLE users
        ADD COLUMN first_name TEXT,
        ADD COLUMN last_name TEXT;
    `);

    // Step 2: Migrate data (COALESCE handles NULL)
    await db.execute(sql`
      UPDATE users
      SET
        first_name = SPLIT_PART(full_name, ' ', 1),
        last_name = SPLIT_PART(full_name, ' ', 2)
      WHERE full_name IS NOT NULL;
    `);

    // Step 3: Drop old column (DANGER: Data loss if rollback needed)
    await db.execute(sql`
      ALTER TABLE users DROP COLUMN full_name;
    `);
  },

  down: async ({ db }) => {
    // Rollback: Re-create full_name from parts
    await db.execute(sql`
      ALTER TABLE users ADD COLUMN full_name TEXT;
    `);

    await db.execute(sql`
      UPDATE users
      SET full_name = CONCAT(first_name, ' ', last_name);
    `);

    await db.execute(sql`
      ALTER TABLE users
        DROP COLUMN first_name,
        DROP COLUMN last_name;
    `);
  },
};
```

---

## Common Scenarios

### Scenario 1: Add New Collection

**Steps**:

1. **Create Collection config**:

```typescript
// src/collections/regions.ts
import { CollectionConfig } from 'payload/types';

export const Regions: CollectionConfig = {
  slug: 'regions',
  fields: [
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'timezone',
      type: 'text',
      required: true,
    },
    {
      name: 'is_active',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
};
```

2. **Generate migration**:

```bash
npm run payload migrate:create
# ✔ Migration created: src/migrations/20251109_add_regions_table.ts
```

3. **Review migration file**:

```typescript
// src/migrations/20251109_add_regions_table.ts
up: async ({ db }) => {
  await db.execute(sql`
    CREATE TABLE "regions" (
      "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      "code" TEXT NOT NULL UNIQUE,
      "name" TEXT NOT NULL,
      "timezone" TEXT NOT NULL,
      "is_active" BOOLEAN DEFAULT TRUE,
      "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);
},
```

4. **Apply migration**:

```bash
npm run payload migrate
# ✔ 20251109_add_regions_table (95ms)
```

### Scenario 2: Add Column to Existing Table

**Steps**:

1. **Update Collection config**:

```typescript
// src/collections/users.ts
export const Users: CollectionConfig = {
  slug: 'users',
  fields: [
    // ... existing fields
    {
      name: 'phone',         // NEW FIELD
      type: 'text',
      required: false,
    },
  ],
};
```

2. **Generate migration**:

```bash
npm run payload migrate:create
# ✔ Migration created: src/migrations/20251109_add_phone_to_users.ts
```

3. **Review and apply**:

```typescript
// src/migrations/20251109_add_phone_to_users.ts
up: async ({ db }) => {
  await db.execute(sql`
    ALTER TABLE "users" ADD COLUMN "phone" TEXT;
  `);
},

down: async ({ db }) => {
  await db.execute(sql`
    ALTER TABLE "users" DROP COLUMN "phone";
  `);
},
```

```bash
npm run payload migrate
```

### Scenario 3: Add Index

**Steps**:

1. **Manual migration** (Drizzle doesn't auto-detect index changes):

```bash
npm run payload migrate:create
# Manually edit the generated file
```

2. **Write migration**:

```typescript
// src/migrations/20251109_add_users_phone_index.ts
export const migration: MigrationMeta = {
  name: '20251109_add_users_phone_index',

  up: async ({ db }) => {
    await db.execute(sql`
      CREATE INDEX "users_phone_idx" ON "users"("phone")
      WHERE "phone" IS NOT NULL;
    `);

    console.log('✔ Index users_phone_idx created');
  },

  down: async ({ db }) => {
    await db.execute(sql`
      DROP INDEX IF EXISTS "users_phone_idx";
    `);

    console.log('✔ Index users_phone_idx dropped');
  },
};
```

3. **Apply**:

```bash
npm run payload migrate
```

### Scenario 4: Rename Column

**Steps**:

1. **Create migration manually** (Drizzle can't detect renames):

```typescript
// src/migrations/20251109_rename_users_fullname_to_first_last.ts
export const migration: MigrationMeta = {
  name: '20251109_rename_users_fullname_to_first_last',

  up: async ({ db }) => {
    // Add new columns
    await db.execute(sql`
      ALTER TABLE "users"
        ADD COLUMN "first_name" TEXT,
        ADD COLUMN "last_name" TEXT;
    `);

    // Migrate data
    await db.execute(sql`
      UPDATE "users"
      SET
        "first_name" = SPLIT_PART("full_name", ' ', 1),
        "last_name" = SUBSTRING("full_name" FROM POSITION(' ' IN "full_name") + 1)
      WHERE "full_name" IS NOT NULL;
    `);

    // Drop old column
    await db.execute(sql`
      ALTER TABLE "users" DROP COLUMN "full_name";
    `);
  },

  down: async ({ db }) => {
    // Re-create full_name
    await db.execute(sql`
      ALTER TABLE "users" ADD COLUMN "full_name" TEXT;
    `);

    // Migrate data back
    await db.execute(sql`
      UPDATE "users"
      SET "full_name" = CONCAT("first_name", ' ', "last_name")
      WHERE "first_name" IS NOT NULL OR "last_name" IS NOT NULL;
    `);

    // Drop new columns
    await db.execute(sql`
      ALTER TABLE "users"
        DROP COLUMN "first_name",
        DROP COLUMN "last_name";
    `);
  },
};
```

2. **Apply with caution** (data loss risk):

```bash
# Backup first!
pg_dump -U portal_user -d payload_dev > backup_before_rename.sql

npm run payload migrate
```

### Scenario 5: Seed Data in Migration

**Steps**:

```typescript
// src/migrations/20251109_seed_predefined_roles.ts
export const migration: MigrationMeta = {
  name: '20251109_seed_predefined_roles',

  up: async ({ db, payload }) => {
    // Option 1: Raw SQL
    await db.execute(sql`
      INSERT INTO "roles" ("id", "name", "slug", "is_system_role")
      VALUES
        (uuid_generate_v4(), 'Super Admin', 'super_admin', TRUE),
        (uuid_generate_v4(), 'Admin', 'admin', TRUE),
        (uuid_generate_v4(), 'Operator', 'operator', TRUE),
        (uuid_generate_v4(), 'Auditor', 'auditor', TRUE),
        (uuid_generate_v4(), 'Viewer', 'viewer', TRUE)
      ON CONFLICT (slug) DO NOTHING;
    `);

    // Option 2: Using Payload API (type-safe)
    const roles = [
      { name: 'Super Admin', slug: 'super_admin', is_system_role: true },
      { name: 'Admin', slug: 'admin', is_system_role: true },
      { name: 'Operator', slug: 'operator', is_system_role: true },
      { name: 'Auditor', slug: 'auditor', is_system_role: true },
      { name: 'Viewer', slug: 'viewer', is_system_role: true },
    ];

    for (const role of roles) {
      try {
        await payload.create({
          collection: 'roles',
          data: role,
        });
      } catch (error) {
        // Ignore duplicates
        if (!error.message.includes('duplicate key')) {
          throw error;
        }
      }
    }

    console.log('✔ Predefined roles seeded');
  },

  down: async ({ db }) => {
    // Delete seeded roles
    await db.execute(sql`
      DELETE FROM "roles" WHERE "is_system_role" = TRUE;
    `);

    console.log('✔ Predefined roles removed');
  },
};
```

---

## Rollback Strategy

### When to Rollback

- **Failed deployment**: Application not starting, errors in logs
- **Data corruption**: Incorrect data migration
- **Performance degradation**: New indexes causing slowdowns
- **Business decision**: Feature rollback

### Rollback Methods

#### Method 1: Apply Down Migration (Preferred)

```bash
# Rollback last migration
npm run payload migrate:down

# Example output:
# Rolling back migration: 20251109_add_users_phone_index
# ✔ Migration rolled back successfully
```

**Pros**:
- Clean rollback via down() function
- Maintains migration history
- Fast (no full restore)

**Cons**:
- Requires well-written down() function
- May lose data if down() is destructive

#### Method 2: Database Restore (Nuclear Option)

```bash
# 1. Stop application
kubectl scale deployment/payloadcms --replicas=0

# 2. Restore database from backup
pg_restore -U portal_user -d payload_dev backup_before_migration.sql

# 3. Redeploy previous application version
git checkout v1.2.0
docker build -t payloadcms:v1.2.0 .
kubectl set image deployment/payloadcms payloadcms=payloadcms:v1.2.0

# 4. Restart application
kubectl scale deployment/payloadcms --replicas=3
```

**Pros**:
- Guaranteed restore to known-good state
- No risk of partial rollback

**Cons**:
- Loses data created between backup and restore
- Longer downtime (minutes to hours)
- Requires maintenance mode

### Rollback Testing

```bash
# Always test rollback in staging BEFORE production

# 1. Apply migration in staging
npm run payload migrate

# 2. Test application
npm run test:e2e

# 3. Rollback migration
npm run payload migrate:down

# 4. Verify application still works
npm run test:e2e

# 5. Re-apply migration
npm run payload migrate

# If all OK, deploy to production
```

---

## Production Deployment

### Pre-Deployment Checklist

```bash
# ✅ Checklist before running migrations in production

□ Database backup created (pg_dump)
□ Migrations tested in staging environment
□ Rollback procedure documented
□ Down migrations tested
□ Deployment window scheduled (low traffic)
□ On-call engineer available
□ Monitoring dashboards open
□ Stakeholders notified
```

### Deployment Steps

```bash
# 1. Backup database
pg_dump -U portal_user -d payload_prod \
  --format=custom \
  --file=/backups/payload_prod_$(date +%Y%m%d_%H%M%S).dump

# 2. Check migration status
npm run payload migrate:status

# 3. Enable maintenance mode (optional)
kubectl set env deployment/payloadcms MAINTENANCE_MODE=true

# 4. Apply migrations
npm run payload migrate

# 5. Restart application (to pick up schema changes)
kubectl rollout restart deployment/payloadcms

# 6. Watch rollout
kubectl rollout status deployment/payloadcms

# 7. Smoke tests
curl https://portal.lbpay.com/api/health
curl https://portal.lbpay.com/api/users?limit=1

# 8. Disable maintenance mode
kubectl set env deployment/payloadcms MAINTENANCE_MODE=false

# 9. Monitor logs for 30 minutes
kubectl logs -f deployment/payloadcms --tail=100
```

### Zero-Downtime Migrations

For large tables, use **online schema migrations** to avoid locking:

```typescript
// Example: Add column with default (non-blocking)
migration: {
  up: async ({ db }) => {
    // Step 1: Add column without default (fast, no rewrite)
    await db.execute(sql`
      ALTER TABLE "users" ADD COLUMN "phone" TEXT;
    `);

    // Step 2: Backfill in batches (avoid lock)
    await db.execute(sql`
      UPDATE "users"
      SET "phone" = ''
      WHERE "phone" IS NULL
      AND id IN (SELECT id FROM "users" WHERE "phone" IS NULL LIMIT 1000);
    `);
    // Repeat until all rows updated

    // Step 3: Add NOT NULL constraint (after backfill)
    await db.execute(sql`
      ALTER TABLE "users" ALTER COLUMN "phone" SET NOT NULL;
    `);
  },
};
```

---

## Troubleshooting

### Issue 1: Migration Fails Mid-Execution

**Symptoms**:
```
Error: column "phone" already exists
Migration failed: 20251109_add_phone_to_users
```

**Cause**: Previous migration partially applied, then failed.

**Solution**:

```bash
# 1. Check database state
psql -U portal_user -d payload_dev -c "\d users"

# 2. Manually fix database to match expected state
psql -U portal_user -d payload_dev -c "ALTER TABLE users DROP COLUMN phone;"

# 3. Mark migration as not applied
psql -U portal_user -d payload_dev -c "
  DELETE FROM _drizzle_migrations
  WHERE hash = '20251109_add_phone_to_users';
"

# 4. Re-run migration
npm run payload migrate
```

### Issue 2: Migration Applied but Not Recorded

**Symptoms**:
- Table exists in database
- Migration shows as "Pending" in status

**Solution**:

```bash
# Manually mark migration as applied
psql -U portal_user -d payload_dev -c "
  INSERT INTO _drizzle_migrations (hash, created_at)
  VALUES ('20251109_add_phone_to_users', EXTRACT(EPOCH FROM NOW()) * 1000);
"
```

### Issue 3: Cannot Rollback (down() Missing)

**Symptoms**:
```
Error: Migration down() not implemented
Cannot rollback: 20251109_complex_data_migration
```

**Solution**:

```bash
# Manual rollback via database restore
pg_restore -U portal_user -d payload_dev backup_before_migration.dump

# Then skip the problematic migration
psql -U portal_user -d payload_dev -c "
  DELETE FROM _drizzle_migrations
  WHERE hash = '20251109_complex_data_migration';
"
```

### Issue 4: Slow Migrations (Locking Issues)

**Symptoms**:
- Migration takes > 5 minutes
- Application timing out during migration

**Solution**:

```bash
# 1. Check for long-running queries
psql -U portal_user -d payload_dev -c "
  SELECT pid, now() - query_start AS duration, query
  FROM pg_stat_activity
  WHERE state != 'idle'
  ORDER BY duration DESC;
"

# 2. Kill blocking queries (if safe)
psql -U portal_user -d payload_dev -c "
  SELECT pg_terminate_backend(pid)
  FROM pg_stat_activity
  WHERE state != 'idle' AND pid != pg_backend_pid();
"

# 3. Re-run migration in maintenance window
```

---

## Summary

### Key Takeaways

1. **Always review generated migrations** before applying
2. **Test migrations locally** before staging/production
3. **Always provide down() rollback** functions
4. **Backup before destructive migrations** (DROP, RENAME)
5. **Use transactions** for multi-step migrations
6. **Monitor production migrations** (logs, metrics)
7. **Document complex migrations** with comments
8. **Test rollback procedures** in staging

### Quick Reference

```bash
# Development
npm run payload migrate:create      # Generate migration
npm run payload migrate              # Apply migrations
npm run payload migrate:status       # Check status
npm run payload migrate:down         # Rollback last migration

# Production
pg_dump -U portal_user -d payload_prod -f backup.sql  # Backup
npm run payload migrate                                 # Apply
pg_restore -U portal_user -d payload_prod backup.sql   # Restore (if needed)
```

---

**Created by**: AGENT-DB-009 (Database Engineer)
**Date**: 2025-11-09
**Sprint**: Sprint 1 - Dia 1
**User Story**: US-001 (Setup de Repositório)
**Next Steps**: Implement Collections in `/src/collections/` (Sprint 1 - Dia 2-3)
