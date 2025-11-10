# 🔧 ESTRATÉGIA DE EXTENSIBILIDADE E VERSIONAMENTO - PayloadCMS

**Projeto:** Portal Container LBPay
**Documento:** Estratégia de Extensibilidade e Upgrade
**Versão:** 1.0
**Data:** 09 de Janeiro de 2025

---

## 🎯 PROBLEMA

Como garantir que:

1. ✅ **NÃO precisamos fazer fork** do PayloadCMS
2. ✅ **Extensões customizadas** não quebrem em upgrades do Payload
3. ✅ **Retrocompatibilidade** seja mantida
4. ✅ **Atualizações do Payload** sejam aplicadas sem reescrever código
5. ✅ **Dockerização** seja feita corretamente

---

## ✅ SOLUÇÃO: ARQUITETURA DE EXTENSÕES (SEM FORK)

### Princípio Fundamental

**PayloadCMS foi projetado para NUNCA precisar de fork.**

PayloadCMS usa **Dependency Injection** e **Plugin Architecture**, permitindo:
- ✅ Customizações via **configuração** (não modificação de código-fonte)
- ✅ Extensões via **hooks**, **endpoints**, **componentes** (APIs públicas estáveis)
- ✅ Overrides via **config** (não patches no core)

---

## 🏗️ ARQUITETURA DE PROJETO (ZERO FORK)

### Estrutura de Diretórios

```
lb-portal-container/
├── package.json                    # Payload como dependency (NPM)
├── payload.config.ts               # Config file (entrypoint)
├── tsconfig.json
├── next.config.js
├── docker/
│   ├── Dockerfile                  # Custom Dockerfile
│   ├── Dockerfile.dev              # Dev mode
│   └── docker-compose.yml          # Full stack
├── src/
│   ├── payload/                    # ⚠️ CUSTOM CODE (extensions)
│   │   ├── collections/           # Collection configs
│   │   │   ├── Users.ts
│   │   │   ├── Roles.ts
│   │   │   ├── Applications.ts
│   │   │   └── MenuItems.ts
│   │   ├── hooks/                 # Custom hooks
│   │   │   ├── afterLogin.ts
│   │   │   ├── auditLog.ts
│   │   │   └── keycloakSync.ts
│   │   ├── endpoints/             # Custom endpoints
│   │   │   ├── oauth-callback.ts
│   │   │   └── badge-api.ts
│   │   ├── access/                # Access control functions
│   │   │   ├── canManageUsers.ts
│   │   │   └── canViewAuditLogs.ts
│   │   ├── fields/                # Custom field components
│   │   │   └── MenuIconPicker.tsx
│   │   └── plugins/               # Custom plugins
│   │       └── keycloak-auth.ts
│   ├── app/                        # Next.js App Router
│   │   ├── (auth)/
│   │   ├── (portal)/
│   │   └── api/
│   ├── components/                 # React components
│   │   ├── portal/
│   │   └── ui/
│   └── lib/
│       ├── keycloak.ts
│       └── permissions.ts
├── public/
└── node_modules/                   # ⚠️ Payload está AQUI (não forked)
    └── payload/                    # Official PayloadCMS package
```

**Regra de Ouro:**
- ✅ **NUNCA modificar** `node_modules/payload/`
- ✅ **SEMPRE customizar** via `src/payload/` (config, hooks, endpoints)

---

## 📦 PACKAGE.JSON - PAYLOAD COMO DEPENDÊNCIA

```json
{
  "name": "lb-portal-container",
  "version": "1.0.0",
  "private": true,
  "engines": {
    "node": ">=20.0.0",
    "npm": ">=10.0.0"
  },
  "dependencies": {
    // ⚠️ PayloadCMS e plugins OFICIAIS (NPM registry)
    "payload": "^3.0.0",                       // Pin major version
    "@payloadcms/db-postgres": "^3.0.0",
    "@payloadcms/next": "^3.0.0",
    "@payloadcms/richtext-lexical": "^3.0.0",
    "@payloadcms/plugin-cloud-storage": "^3.0.0",  // Official plugin
    "@payloadcms/plugin-seo": "^3.0.0",             // Official plugin

    // Next.js e React (versões compatíveis com Payload)
    "next": "15.4.7",
    "react": "19.1.1",
    "react-dom": "19.1.1",

    // TypeScript
    "typescript": "5.7.3",

    // Database
    "drizzle-orm": "^0.30.0",
    "postgres": "^3.4.0",

    // OAuth/Auth
    "openid-client": "^5.6.0",      // Keycloak client
    "jose": "^5.2.0",                // JWT handling

    // UI
    "lucide-react": "^0.300.0",
    "tailwindcss": "^4.0.0",
    "@radix-ui/react-dropdown-menu": "^2.0.6",

    // Utils
    "zod": "^3.22.4",
    "date-fns": "^3.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "@types/react": "^19.1.0",
    "eslint": "^8.56.0",
    "prettier": "^3.2.0"
  },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "payload": "payload",
    "generate:types": "payload generate:types",
    "migrate": "payload migrate",
    "migrate:create": "payload migrate:create",
    "seed": "node ./scripts/seed.js",

    // ⚠️ Upgrade scripts
    "check:updates": "npm outdated",
    "upgrade:payload": "npm update payload @payloadcms/*",
    "upgrade:minor": "npm update",
    "upgrade:major": "npm install payload@latest @payloadcms/db-postgres@latest @payloadcms/next@latest"
  },
  "resolutions": {
    // ⚠️ Force consistent versions (opcional, para prevenir conflitos)
    "react": "19.1.1",
    "react-dom": "19.1.1"
  }
}
```

### Estratégia de Versionamento

**Payload Versioning:**
```
payload: "^3.0.0"  ✅ RECOMENDADO
  ├─ ^3.0.0  → Permite 3.0.0 a 3.x.x (minor + patch updates)
  ├─ ~3.0.0  → Permite 3.0.0 a 3.0.x (somente patch updates)
  └─ 3.0.0   → Versão exata (não recomendado, perde bugfixes)
```

**Política de Upgrades:**

| Tipo | Versão | Frequência | Teste | Automação |
|------|--------|-----------|-------|-----------|
| **Patch** | 3.0.0 → 3.0.1 | Automático (CI) | Regression tests | ✅ Auto-merge (Dependabot) |
| **Minor** | 3.0.0 → 3.1.0 | Mensal | Full QA | ⚠️ Manual approval |
| **Major** | 3.0.0 → 4.0.0 | Semestral | Migration guide | ❌ Manual planning |

---

## 🎨 PAYLOAD.CONFIG.TS - PONTO DE CUSTOMIZAÇÃO

```typescript
// payload.config.ts
import { buildConfig } from 'payload/config';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'path';

// ⚠️ IMPORT CUSTOM COLLECTIONS (nosso código)
import { Users } from './src/payload/collections/Users';
import { Roles } from './src/payload/collections/Roles';
import { Permissions } from './src/payload/collections/Permissions';
import { Applications } from './src/payload/collections/Applications';
import { MenuItems } from './src/payload/collections/MenuItems';
import { AuditLogs } from './src/payload/collections/AuditLogs';

// ⚠️ IMPORT CUSTOM PLUGINS (nosso código)
import { keycloakAuthPlugin } from './src/payload/plugins/keycloak-auth';

// ⚠️ IMPORT CUSTOM HOOKS (nosso código)
import { auditLogHook } from './src/payload/hooks/auditLog';

export default buildConfig({
  // ════════════════════════════════════════════════════════════
  // ⚠️ CONFIGURAÇÃO BÁSICA (não afeta core do Payload)
  // ════════════════════════════════════════════════════════════

  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',

  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '- LBPay Portal',
      favicon: '/favicon.ico',
      ogImage: '/og-image.png',
    },
    // ⚠️ Custom CSS (não modifica core)
    css: path.resolve(__dirname, './src/styles/payload-custom.css'),
  },

  // ════════════════════════════════════════════════════════════
  // ⚠️ COLLECTIONS CUSTOMIZADAS (nosso código, API estável)
  // ════════════════════════════════════════════════════════════

  collections: [
    Users,          // src/payload/collections/Users.ts
    Roles,          // src/payload/collections/Roles.ts
    Permissions,    // src/payload/collections/Permissions.ts
    Applications,   // src/payload/collections/Applications.ts
    MenuItems,      // src/payload/collections/MenuItems.ts
    AuditLogs,      // src/payload/collections/AuditLogs.ts
  ],

  // ════════════════════════════════════════════════════════════
  // ⚠️ GLOBALS (singleton collections, API estável)
  // ════════════════════════════════════════════════════════════

  globals: [
    {
      slug: 'portal-settings',
      fields: [
        { name: 'siteName', type: 'text', localized: true },
        { name: 'logo', type: 'upload', relationTo: 'media' },
      ],
    },
  ],

  // ════════════════════════════════════════════════════════════
  // ⚠️ PLUGINS (oficial + custom, API estável)
  // ════════════════════════════════════════════════════════════

  plugins: [
    // Official plugins (via NPM)
    // cloudStorage({...}),  // @payloadcms/plugin-cloud-storage
    // seo({...}),           // @payloadcms/plugin-seo

    // ⚠️ Custom plugin (nosso código)
    keycloakAuthPlugin({
      keycloakUrl: process.env.KEYCLOAK_URL,
      realm: process.env.KEYCLOAK_REALM,
      clientId: process.env.KEYCLOAK_CLIENT_ID,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
    }),
  ],

  // ════════════════════════════════════════════════════════════
  // ⚠️ DATABASE (adapter oficial, API estável)
  // ════════════════════════════════════════════════════════════

  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
    // ⚠️ Push: true em dev, false em prod (usar migrations)
    push: process.env.NODE_ENV === 'development',
  }),

  // ════════════════════════════════════════════════════════════
  // ⚠️ EDITOR (oficial, API estável)
  // ════════════════════════════════════════════════════════════

  editor: lexicalEditor({}),

  // ════════════════════════════════════════════════════════════
  // ⚠️ LOCALIZATION (API estável)
  // ════════════════════════════════════════════════════════════

  localization: {
    locales: [
      { code: 'pt-BR', label: 'Português (Brasil)' },
      { code: 'en-US', label: 'English (US)' },
      { code: 'es-ES', label: 'Español' },
    ],
    defaultLocale: 'pt-BR',
    fallback: true,
  },

  // ════════════════════════════════════════════════════════════
  // ⚠️ TYPESCRIPT (gera types automaticamente)
  // ════════════════════════════════════════════════════════════

  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },

  // ════════════════════════════════════════════════════════════
  // ⚠️ CORS (segurança)
  // ════════════════════════════════════════════════════════════

  cors: [
    process.env.KEYCLOAK_URL,
    process.env.NEXT_PUBLIC_PORTAL_URL,
  ].filter(Boolean),

  // ════════════════════════════════════════════════════════════
  // ⚠️ CSRF (segurança)
  // ════════════════════════════════════════════════════════════

  csrf: [
    process.env.NEXT_PUBLIC_PORTAL_URL,
  ].filter(Boolean),

  // ════════════════════════════════════════════════════════════
  // ⚠️ HOOKS GLOBAIS (nosso código, API estável)
  // ════════════════════════════════════════════════════════════

  hooks: {
    afterChange: [auditLogHook],  // src/payload/hooks/auditLog.ts
  },
});
```

**Pontos de Extensão Estáveis (API Pública do Payload):**

| Feature | API Status | Exemplo |
|---------|-----------|---------|
| `collections` | ✅ Stable | `Users`, `Roles`, `Applications` |
| `fields` | ✅ Stable | `{ name: 'email', type: 'email' }` |
| `hooks` | ✅ Stable | `beforeChange`, `afterLogin` |
| `access` | ✅ Stable | `({ req }) => req.user?.role === 'admin'` |
| `endpoints` | ✅ Stable | Custom REST endpoints |
| `plugins` | ✅ Stable | Plugin system |
| `admin.components` | ✅ Stable | Custom React components |
| `localization` | ✅ Stable | Multi-language |
| `db` | ✅ Stable | Database adapter |
| `editor` | ✅ Stable | Rich text editor |

---

## 🐳 DOCKERIZAÇÃO - ARQUITETURA

### Opção 1: Dockerfile Customizado (RECOMENDADO)

```dockerfile
# docker/Dockerfile
# ════════════════════════════════════════════════════════════
# STAGE 1: Dependencies
# ════════════════════════════════════════════════════════════
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies (includes PayloadCMS from NPM)
RUN npm ci --only=production

# ════════════════════════════════════════════════════════════
# STAGE 2: Builder
# ════════════════════════════════════════════════════════════
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code (CUSTOM CODE ONLY)
COPY package.json package-lock.json ./
COPY payload.config.ts tsconfig.json next.config.js ./
COPY src ./src
COPY public ./public

# ⚠️ Generate Payload types
RUN npm run generate:types

# ⚠️ Build Next.js + Payload
ENV NODE_ENV=production
RUN npm run build

# ════════════════════════════════════════════════════════════
# STAGE 3: Runner
# ════════════════════════════════════════════════════════════
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy built assets
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/payload-types.ts ./payload-types.ts

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

EXPOSE 3000

CMD ["npm", "start"]
```

**Por que NÃO precisamos fork:**
- ✅ PayloadCMS está em `node_modules` (instalado do NPM oficial)
- ✅ Customizações estão em `src/payload/` (nosso código)
- ✅ Build usa configuração oficial do Payload (`payload.config.ts`)

---

### Opção 2: Docker Compose (Stack Completo)

```yaml
# docker/docker-compose.yml
version: '3.9'

services:
  # ════════════════════════════════════════════════════════════
  # PostgreSQL (Database)
  # ════════════════════════════════════════════════════════════
  postgres:
    image: postgres:15-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-portal_container}
      POSTGRES_USER: ${POSTGRES_USER:-portal_user}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-portal_password}
    ports:
      - '${POSTGRES_PORT:-5432}:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U ${POSTGRES_USER:-portal_user}']
      interval: 10s
      timeout: 5s
      retries: 5

  # ════════════════════════════════════════════════════════════
  # Keycloak (Auth Server)
  # ════════════════════════════════════════════════════════════
  keycloak:
    image: quay.io/keycloak/keycloak:23.0
    restart: unless-stopped
    environment:
      KEYCLOAK_ADMIN: ${KEYCLOAK_ADMIN:-admin}
      KEYCLOAK_ADMIN_PASSWORD: ${KEYCLOAK_ADMIN_PASSWORD:-admin}
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://postgres:5432/${POSTGRES_DB:-portal_container}
      KC_DB_USERNAME: ${POSTGRES_USER:-portal_user}
      KC_DB_PASSWORD: ${POSTGRES_PASSWORD:-portal_password}
      KC_HOSTNAME: ${KEYCLOAK_HOSTNAME:-localhost}
      KC_HTTP_ENABLED: ${KC_HTTP_ENABLED:-true}
      KC_PROXY: ${KC_PROXY:-edge}
    ports:
      - '${KEYCLOAK_PORT:-8080}:8080'
    depends_on:
      postgres:
        condition: service_healthy
    command: start-dev
    healthcheck:
      test: ['CMD-SHELL', 'curl -f http://localhost:8080/health/ready || exit 1']
      interval: 10s
      timeout: 5s
      retries: 10

  # ════════════════════════════════════════════════════════════
  # Portal Container (PayloadCMS + Next.js)
  # ════════════════════════════════════════════════════════════
  portal:
    build:
      context: ..
      dockerfile: docker/Dockerfile
    restart: unless-stopped
    environment:
      # Database
      DATABASE_URL: postgresql://${POSTGRES_USER:-portal_user}:${POSTGRES_PASSWORD:-portal_password}@postgres:5432/${POSTGRES_DB:-portal_container}

      # Payload
      PAYLOAD_SECRET: ${PAYLOAD_SECRET}
      PAYLOAD_PUBLIC_SERVER_URL: ${PAYLOAD_PUBLIC_SERVER_URL:-http://localhost:3000}

      # Keycloak
      KEYCLOAK_URL: http://keycloak:8080
      KEYCLOAK_REALM: ${KEYCLOAK_REALM:-lbpay-portal}
      KEYCLOAK_CLIENT_ID: ${KEYCLOAK_CLIENT_ID:-portal-container}
      KEYCLOAK_CLIENT_SECRET: ${KEYCLOAK_CLIENT_SECRET}

      # Next.js
      NEXT_PUBLIC_PORTAL_URL: ${NEXT_PUBLIC_PORTAL_URL:-http://localhost:3000}
      NODE_ENV: ${NODE_ENV:-production}
    ports:
      - '${PORTAL_PORT:-3000}:3000'
    depends_on:
      postgres:
        condition: service_healthy
      keycloak:
        condition: service_healthy
    healthcheck:
      test: ['CMD-SHELL', 'curl -f http://localhost:3000/api/health || exit 1']
      interval: 10s
      timeout: 5s
      retries: 5
    # ⚠️ VOLUMES (dev mode only - hot reload)
    volumes:
      - ../src:/app/src
      - ../public:/app/public
      - ../payload.config.ts:/app/payload.config.ts

volumes:
  postgres_data:
```

---

## 🔄 ESTRATÉGIA DE UPGRADES

### 1. Semver Compliance (PayloadCMS segue SemVer)

```
v3.0.0 → v3.0.1  ✅ PATCH (bugfixes, safe)
v3.0.0 → v3.1.0  ⚠️ MINOR (new features, backwards compatible)
v3.0.0 → v4.0.0  ❌ MAJOR (breaking changes, migration needed)
```

### 2. Testing Matrix

```yaml
# .github/workflows/test-upgrades.yml
name: Test Payload Upgrades

on:
  schedule:
    - cron: '0 0 * * 1'  # Every Monday
  workflow_dispatch:

jobs:
  test-patch:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install current version
        run: npm ci

      - name: Upgrade to latest patch
        run: npm update payload @payloadcms/db-postgres @payloadcms/next

      - name: Generate types
        run: npm run generate:types

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build

      - name: Report
        if: failure()
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: '⚠️ Payload patch update failed',
              body: 'Automated upgrade test failed. Review changes.',
              labels: ['payload-upgrade', 'bug']
            });
```

### 3. Migration Checklist

Quando **Payload lançar major version** (ex: v3 → v4):

| Etapa | Ação | Responsável |
|-------|------|-------------|
| 1. Announcement | Ler release notes do Payload | Tech Lead |
| 2. Breaking Changes | Identificar breaking changes | Dev Team |
| 3. Sandbox Testing | Testar em branch isolada | QA |
| 4. Code Audit | Verificar uso de APIs depreciadas | Dev Team |
| 5. Refactor | Adaptar código customizado | Dev Team |
| 6. Migration Script | Criar script de migração de DB | Backend Dev |
| 7. Staging Deploy | Deploy em staging | DevOps |
| 8. QA Testing | Testes completos | QA |
| 9. Rollback Plan | Criar plano de rollback | DevOps |
| 10. Production Deploy | Deploy em produção | DevOps |

---

## 🛡️ GARANTIAS DE RETROCOMPATIBILIDADE

### APIs Estáveis do PayloadCMS (Sem Breaking Changes em Minor)

PayloadCMS garante **semantic versioning** estrito:

| API | Stability | Promise |
|-----|-----------|---------|
| **Collections Config** | ✅ Stable | Fields, hooks, access - backward compatible |
| **Field Types** | ✅ Stable | `text`, `email`, `relationship`, etc. |
| **Hooks** | ✅ Stable | `beforeChange`, `afterRead`, etc. |
| **Access Control** | ✅ Stable | Functions signature |
| **REST API** | ✅ Stable | Endpoints, query syntax |
| **GraphQL API** | ✅ Stable | Schema, resolvers |
| **Admin UI Components** | ⚠️ Evolving | May change in minor versions (visual only) |
| **TypeScript Types** | ✅ Stable | Auto-generated, safe |

### Nosso Contrato de API

**Garantimos que upgrades de Payload NÃO quebram nosso código se:**

1. ✅ Usamos apenas **APIs públicas** (documented)
2. ✅ Seguimos **TypeScript types** (compile-time safety)
3. ✅ NÃO importamos `payload/dist/` (internal APIs)
4. ✅ NÃO monkey-patcheamos core do Payload
5. ✅ NÃO modificamos `node_modules/payload/`

**Exemplo de Código Seguro (Backward Compatible):**

```typescript
// ✅ SAFE - Usa API pública estável
import { CollectionConfig } from 'payload/types';

export const Users: CollectionConfig = {
  slug: 'users',
  fields: [
    { name: 'email', type: 'email', required: true },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // ✅ TypeScript garante que 'data' tem shape correto
        data.updatedAt = new Date();
        return data;
      }
    ],
  },
};
```

**Exemplo de Código INSEGURO (Pode quebrar):**

```typescript
// ❌ UNSAFE - Importa internal API (não documentada)
import { internalFunction } from 'payload/dist/internal/utils';  // ❌ NUNCA FAZER ISSO

// ❌ UNSAFE - Monkey-patch do core
const originalFind = payload.find;
payload.find = function(...args) {  // ❌ NUNCA FAZER ISSO
  console.log('Intercepting find');
  return originalFind.apply(this, args);
};
```

---

## 📋 DEPENDABOT CONFIGURATION

```yaml
# .github/dependabot.yml
version: 2
updates:
  # ════════════════════════════════════════════════════════════
  # NPM dependencies
  # ════════════════════════════════════════════════════════════
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"

    # ⚠️ Auto-merge strategy
    open-pull-requests-limit: 10

    # ⚠️ Grouping (menos PRs)
    groups:
      payload:
        patterns:
          - "payload"
          - "@payloadcms/*"
        update-types:
          - "patch"
          - "minor"

      next-react:
        patterns:
          - "next"
          - "react"
          - "react-dom"
        update-types:
          - "patch"

      dev-dependencies:
        dependency-type: "development"
        update-types:
          - "patch"
          - "minor"

    # ⚠️ Ignore major versions (manual review needed)
    ignore:
      - dependency-name: "payload"
        update-types: ["version-update:semver-major"]
      - dependency-name: "@payloadcms/*"
        update-types: ["version-update:semver-major"]
      - dependency-name: "next"
        update-types: ["version-update:semver-major"]

    # ⚠️ Labels para automação
    labels:
      - "dependencies"
      - "automerge"
```

---

## 🔧 CI/CD PIPELINE

```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  # ════════════════════════════════════════════════════════════
  # Test
  # ════════════════════════════════════════════════════════════
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_DB: test_db
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_password
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Generate Payload types
        run: npm run generate:types

      - name: Lint
        run: npm run lint

      - name: TypeScript check
        run: npx tsc --noEmit

      - name: Run tests
        run: npm test
        env:
          DATABASE_URL: postgresql://test_user:test_password@localhost:5432/test_db
          PAYLOAD_SECRET: test-secret-key

      - name: Build
        run: npm run build
        env:
          DATABASE_URL: postgresql://test_user:test_password@localhost:5432/test_db
          PAYLOAD_SECRET: test-secret-key

  # ════════════════════════════════════════════════════════════
  # Auto-merge Dependabot (patch + minor only)
  # ════════════════════════════════════════════════════════════
  auto-merge:
    needs: test
    if: github.actor == 'dependabot[bot]'
    runs-on: ubuntu-latest

    steps:
      - name: Approve PR
        run: gh pr review --approve "$PR_URL"
        env:
          PR_URL: ${{ github.event.pull_request.html_url }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Enable auto-merge
        run: gh pr merge --auto --squash "$PR_URL"
        env:
          PR_URL: ${{ github.event.pull_request.html_url }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  # ════════════════════════════════════════════════════════════
  # Build Docker Image
  # ════════════════════════════════════════════════════════════
  docker:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          file: docker/Dockerfile
          push: true
          tags: |
            ghcr.io/lbpay/portal-container:latest
            ghcr.io/lbpay/portal-container:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

---

## 📊 CHECKLIST DE UPGRADE

### Antes de Atualizar Payload

- [ ] Ler **release notes** completo
- [ ] Verificar **breaking changes** listados
- [ ] Pesquisar **migration guide** oficial
- [ ] Criar **branch isolada** (`upgrade/payload-v3.1.0`)
- [ ] Rodar `npm outdated` para ver todas versões
- [ ] Verificar **compatibilidade** de plugins oficiais

### Durante Upgrade

- [ ] Atualizar `package.json` com nova versão
- [ ] Rodar `npm install`
- [ ] Rodar `npm run generate:types` (atualizar types)
- [ ] Verificar **TypeScript errors** (compile-time checks)
- [ ] Rodar `npm run lint` (code style)
- [ ] Rodar `npm test` (unit tests)
- [ ] Rodar `npm run build` (build completo)
- [ ] Testar **localmente** (docker-compose up)
- [ ] Executar **migration scripts** (se houver)

### Após Upgrade

- [ ] Deploy em **staging**
- [ ] Executar **smoke tests** completos
- [ ] Verificar **Payload Admin UI** funcionando
- [ ] Verificar **OAuth/Keycloak** integração
- [ ] Verificar **custom hooks** executando
- [ ] Verificar **custom endpoints** respondendo
- [ ] Monitorar **logs** por 24h
- [ ] Deploy em **produção** (com rollback plan)

---

## 🎯 RESUMO EXECUTIVO

### ✅ NÃO Precisamos Fork Porque:

1. **PayloadCMS é extensível por design** - Plugin architecture
2. **APIs públicas são estáveis** - Semantic versioning
3. **Customizações via config** - Não modificação de core
4. **TypeScript garante compatibilidade** - Compile-time safety
5. **Dependabot automatiza upgrades** - Patch/minor auto-merge
6. **CI/CD valida mudanças** - Tests + build obrigatórios

### ✅ Garantias de Retrocompatibilidade:

1. **Payload segue SemVer** - Breaking changes só em major
2. **Usamos apenas APIs públicas** - Documented + typed
3. **TypeScript detecta quebras** - Antes de runtime
4. **Tests validam comportamento** - Regression testing
5. **Staging valida upgrade** - Antes de produção

### ✅ Dockerização:

1. **Payload vem do NPM** - `node_modules/payload`
2. **Custom code separado** - `src/payload/`
3. **Build multi-stage** - Deps → Build → Run
4. **Health checks** - Database, Keycloak, Portal
5. **Docker Compose** - Stack completo local

---

## 📞 SUPORTE E COMUNIDADE

**Quando upgrade der problema:**

1. **Payload Discord** - https://discord.gg/payload
2. **GitHub Issues** - https://github.com/payloadcms/payload/issues
3. **Documentation** - https://payloadcms.com/docs
4. **Migration Guides** - https://payloadcms.com/docs/migration
5. **Community Slack** - Active community support

---

**Conclusão:** PayloadCMS foi desenhado para **NUNCA precisar de fork**. Todas customizações via APIs públicas estáveis. Dockerização simples (Payload como dependency NPM). Upgrades seguros via SemVer + TypeScript + CI/CD.

---

**Documento mantido por:** Equipe de Desenvolvimento LBPay
**Última atualização:** 09 de Janeiro de 2025
**Versão:** 1.0
