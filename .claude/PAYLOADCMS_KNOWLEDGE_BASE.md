# PayloadCMS 3.x - Base de Conhecimento Técnico

**Versão PayloadCMS**: 3.63.0
**Última Atualização**: 2025-01-10
**Fonte**: [PayloadCMS Documentation](https://payloadcms.com/docs)

---

## 📚 Índice de Roteiros

1. [Access Control & RBAC](#1-access-control--rbac)
2. [Authentication & Custom Strategies](#2-authentication--custom-strategies)
3. [Custom Components & Admin UI](#3-custom-components--admin-ui)
4. [Hooks & Lifecycle Events](#4-hooks--lifecycle-events)
5. [Plugins & Custom Endpoints](#5-plugins--custom-endpoints)
6. [Migrations & Versioning](#6-migrations--versioning)
7. [Update Strategy & Backward Compatibility](#7-update-strategy--backward-compatibility)

---

## 1. Access Control & RBAC

### 📖 Documentação Oficial
- **URL**: https://payloadcms.com/docs/access-control/overview
- **Sub-páginas**:
  - Collection Access: https://payloadcms.com/docs/access-control/collections
  - Field-level Access: https://payloadcms.com/docs/access-control/fields
  - Local API Access: https://payloadcms.com/docs/local-api/access-control

### 🎯 Conceitos Fundamentais

**Access Control** determina o que usuários podem ou não fazer com documentos, com restrições granulares baseadas em:
- **User** - Dados do usuário autenticado (`req.user`)
- **Roles (RBAC)** - Papéis definidos no sistema
- **Document Data** - Campos do próprio documento
- **Custom Logic** - Qualquer lógica JavaScript

**Access Control Functions** são scoped para operações:
- `create` - Criar novos documentos
- `read` - Ler/buscar documentos
- `update` - Atualizar documentos existentes
- `delete` - Deletar documentos

### 💡 Padrões de Implementação

#### A) RBAC Simple (Role-based)

```typescript
import { CollectionConfig } from 'payload'

export const Applications: CollectionConfig = {
  slug: 'applications',
  access: {
    // Apenas SuperAdmin pode criar aplicações
    create: ({ req: { user } }) => {
      return user?.roles?.includes('super-admin')
    },

    // Qualquer usuário autenticado pode ler
    read: ({ req: { user } }) => {
      return !!user
    },

    // SuperAdmin e Admin podem atualizar
    update: ({ req: { user } }) => {
      return user?.roles?.some(role =>
        ['super-admin', 'admin'].includes(role)
      )
    },

    // Apenas SuperAdmin pode deletar
    delete: ({ req: { user } }) => {
      return user?.roles?.includes('super-admin')
    },
  },
}
```

#### B) Document-Level Access (Owner-based)

```typescript
export const MenuItems: CollectionConfig = {
  slug: 'menu_items',
  access: {
    // Qualquer admin pode criar
    create: ({ req: { user } }) => !!user,

    // Filtro dinâmico: retorna query constraint
    read: ({ req: { user } }) => {
      // SuperAdmin vê tudo
      if (user?.roles?.includes('super-admin')) {
        return true
      }

      // Outros veem apenas seus próprios items
      return {
        createdBy: {
          equals: user?.id,
        },
      }
    },

    // Owner ou SuperAdmin pode atualizar
    update: ({ req: { user }, id }) => {
      if (user?.roles?.includes('super-admin')) return true

      // Verifica ownership via documento
      return {
        createdBy: {
          equals: user?.id,
        },
      }
    },
  },
}
```

#### C) Field-Level Access

```typescript
export const Users: CollectionConfig = {
  slug: 'users',
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      // Email visível para todos
      access: {
        read: () => true,
      },
    },
    {
      name: 'salary',
      type: 'number',
      // Salary apenas para HR e SuperAdmin
      access: {
        read: ({ req: { user } }) => {
          return user?.roles?.some(role =>
            ['super-admin', 'hr'].includes(role)
          )
        },
        update: ({ req: { user } }) => {
          return user?.roles?.includes('super-admin')
        },
      },
    },
  ],
}
```

### ⚠️ Pontos de Atenção

1. **Access Control é executado em TODA operação** (Admin UI, REST API, GraphQL, Local API)
2. **Retornar `false`** bloqueia acesso completamente
3. **Retornar query object** (`{ field: { equals: value } }`) filtra resultados
4. **Retornar `true`** permite acesso irrestrito
5. **Field-level access** se sobrepõe ao collection-level
6. **Local API** respeita Access Control por padrão (pode ser desabilitado com `overrideAccess: true`)

### 🔗 Relacionado com Projeto LBPay

**Collections afetadas**:
- `applications` - Apenas admin pode gerenciar apps registradas
- `menu_items` - RBAC filtering por permissões do usuário
- `roles` - SuperAdmin exclusive
- `permissions` - SuperAdmin exclusive
- `audit_logs` - Read-only para todos, write-only via hooks

---

## 2. Authentication & Custom Strategies

### 📖 Documentação Oficial
- **URL**: https://payloadcms.com/docs/authentication/overview
- **Sub-páginas**:
  - Operations: https://payloadcms.com/docs/authentication/operations
  - Config: https://payloadcms.com/docs/authentication/config

### 🎯 Conceitos Fundamentais

Quando **Authentication** é habilitada em uma Collection, Payload injeta:
- **Account creation** - Registro de novos usuários
- **Login/Logout** - Sessões via JWT
- **Password resets** - Recuperação de senha via email
- **Auth-related emails** - Templates de email configuráveis
- **Admin Panel UI** - Tela de login automática

Qualquer Collection pode optar por **suportar Authentication**. Cada documento vira um "user".

### 💡 Padrões de Implementação

#### A) Basic Email/Password Authentication

```typescript
import { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true, // Habilita autenticação nativa
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Super Admin', value: 'super-admin' },
        { label: 'Admin', value: 'admin' },
        { label: 'Operator', value: 'operator' },
      ],
      required: true,
      defaultValue: ['operator'],
    },
  ],
}
```

#### B) Custom Authentication Strategy (Keycloak OAuth2)

**Arquivo**: `src/lib/keycloakAuthStrategy.ts`

```typescript
import { Strategy } from '@payloadcms/passport-strategy'
import type { PayloadRequest } from 'payload'

export const keycloakStrategy = new Strategy(
  'keycloak',
  async (req: PayloadRequest) => {
    // 1. Validar JWT token do Keycloak
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) return null

    // 2. Decodificar e validar
    const decoded = await validateKeycloakToken(token)
    if (!decoded) return null

    // 3. Buscar ou criar shadow user
    const user = await req.payload.find({
      collection: 'users',
      where: {
        keycloak_sub: {
          equals: decoded.sub,
        },
      },
    })

    if (user.docs.length > 0) {
      return user.docs[0]
    }

    // 4. Criar novo shadow user
    const newUser = await req.payload.create({
      collection: 'users',
      data: {
        email: decoded.email,
        name: decoded.name,
        keycloak_sub: decoded.sub,
        roles: mapKeycloakRoles(decoded.realm_access?.roles || []),
      },
    })

    return newUser
  }
)
```

**Configuração no `payload.config.ts`**:

```typescript
import { buildConfig } from 'payload'
import { keycloakStrategy } from './lib/keycloakAuthStrategy'

export default buildConfig({
  collections: [
    {
      slug: 'users',
      auth: {
        strategies: [
          {
            name: 'keycloak',
            strategy: keycloakStrategy,
          },
        ],
      },
    },
  ],
})
```

#### C) Hooks de Autenticação

```typescript
export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  hooks: {
    // Após login bem-sucedido
    afterLogin: [
      async ({ req, user }) => {
        // Registrar login em audit log
        await req.payload.create({
          collection: 'audit_logs',
          data: {
            action: 'user.login',
            user: user.id,
            ip: req.ip,
            userAgent: req.headers['user-agent'],
            timestamp: new Date(),
          },
        })

        return user
      },
    ],

    // Após logout
    afterLogout: [
      async ({ req, user }) => {
        // Registrar logout
        await req.payload.create({
          collection: 'audit_logs',
          data: {
            action: 'user.logout',
            user: user.id,
            ip: req.ip,
            timestamp: new Date(),
          },
        })
      },
    ],
  },
}
```

### ⚠️ Pontos de Atenção

1. **JWT Secrets** - `secret` no `payload.config.ts` DEVE ser forte e único
2. **Token Expiration** - Configurável via `auth.tokenExpiration` (padrão: 7 dias)
3. **Cookie Config** - `auth.cookies` permite customizar httpOnly, secure, sameSite
4. **Email Templates** - Customizáveis via `auth.forgotPassword.generateEmailHTML`
5. **Multiple Strategies** - Payload suporta múltiplas estratégias (email/password + OAuth2 + SAML)

### 🔗 Relacionado com Projeto LBPay

**Implementação atual**:
- ✅ Custom Keycloak OAuth2 strategy
- ✅ Shadow users auto-creation
- ✅ Role mapping (Keycloak → Payload)
- ✅ Audit logs no `afterLogin`
- ⏳ 2FA via email (pendente - US-023)

---

## 3. Custom Components & Admin UI

### 📖 Documentação Oficial
- **URL**: https://payloadcms.com/docs/custom-components/overview
- **Sub-páginas**:
  - Root Components: https://payloadcms.com/docs/custom-components/root-components
  - Custom Views: https://payloadcms.com/docs/custom-components/custom-views
  - Field Components: https://payloadcms.com/docs/custom-components/fields

### 🎯 Conceitos Fundamentais

Collections podem definir **Custom Components** para:
- **Collection-specific UI** - Save Button, Delete Button
- **Layouts inteiros** - Edit View, List View, Default View
- **Campos customizados** - Custom Field Component, Label, Description

**Importante**: Custom Components são **Client Components** (`'use client'`).

### 💡 Padrões de Implementação

#### A) Custom Root Components (Header, Logout, Actions)

**Arquivo**: `src/payload.config.ts`

```typescript
import { buildConfig } from 'payload'

export default buildConfig({
  admin: {
    components: {
      // Botão de logout customizado
      logout: {
        Button: '@/components/admin/LogoutButton#LogoutButton',
      },

      // Componentes antes dos links de navegação (sidebar)
      beforeNavLinks: ['@/components/admin/UserInfo#UserInfo'],

      // Actions no header (ex: botão de notificações)
      actions: ['@/components/admin/NotificationBell#NotificationBell'],

      // Header customizado completo (substituição total)
      // header: ['@/components/admin/CustomHeader#CustomHeader'],
    },
  },
})
```

**Arquivo**: `src/components/admin/LogoutButton.tsx`

```typescript
'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export const LogoutButton = () => {
  const router = useRouter()

  const handleLogout = async () => {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    })

    if (response.ok) {
      router.push('/login')
      router.refresh()
    }
  }

  return (
    <button onClick={handleLogout} className="logout-button">
      <LogOut size={16} />
      <span>Logout</span>
    </button>
  )
}
```

**Arquivo**: `src/components/admin/UserInfo.tsx`

```typescript
'use client'

import { useAuth } from '@payloadcms/ui'

export const UserInfo = () => {
  const { user } = useAuth()

  if (!user) return null

  const displayName = user.name || user.email?.split('@')[0]

  return (
    <div className="user-info">
      <span>{displayName}</span>
      <span className="email">{user.email}</span>
    </div>
  )
}
```

#### B) Import Map Generation

Após criar componentes customizados, rodar:

```bash
npx payload generate:importmap
```

Isso gera/atualiza `src/app/(payload)/admin/importMap.js`:

```javascript
import { LogoutButton } from '@/components/admin/LogoutButton'
import { UserInfo } from '@/components/admin/UserInfo'

export const importMap = {
  "@/components/admin/LogoutButton#LogoutButton": LogoutButton,
  "@/components/admin/UserInfo#UserInfo": UserInfo,
}
```

#### C) Custom Field Component

```typescript
// src/fields/ColorPicker/Component.tsx
'use client'

import { useField } from '@payloadcms/ui'

export const ColorPickerField = ({ path }: { path: string }) => {
  const { value, setValue } = useField<string>({ path })

  return (
    <div>
      <label>Color</label>
      <input
        type="color"
        value={value || '#000000'}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  )
}
```

```typescript
// Collection usando custom field
export const Themes: CollectionConfig = {
  slug: 'themes',
  fields: [
    {
      name: 'primaryColor',
      type: 'text',
      admin: {
        components: {
          Field: '@/fields/ColorPicker/Component#ColorPickerField',
        },
      },
    },
  ],
}
```

### ⚠️ Pontos de Atenção

1. **Import Map** - Necessário gerar após adicionar/modificar componentes
2. **'use client'** - Todos custom components DEVEM ter diretiva `'use client'`
3. **@payloadcms/ui** - Hooks como `useAuth()`, `useField()`, `useDocumentInfo()` disponíveis
4. **Path Syntax** - `'@/path/to/file#ExportedName'` (hash para named exports)
5. **Reiniciar dev server** - Após gerar import map, reiniciar Next.js dev server

### 🔗 Relacionado com Projeto LBPay

**Componentes criados**:
- ✅ `LogoutButton` - Botão de logout com integração endpoint
- ✅ `UserInfo` - Display de nome + email no header
- ⏳ `NotificationBell` - Badge de notificações (pendente)
- ⏳ `UserProfileMenu` - Menu dropdown com perfil (pendente)

---

## 4. Hooks & Lifecycle Events

### 📖 Documentação Oficial
- **URL**: https://payloadcms.com/docs/hooks/overview
- **Sub-páginas**:
  - Collection Hooks: https://payloadcms.com/docs/hooks/collections
  - Field Hooks: https://payloadcms.com/docs/hooks/fields
  - Global Hooks: https://payloadcms.com/docs/hooks/globals

### 🎯 Conceitos Fundamentais

**Collection Hooks** permitem executar lógica durante eventos específicos do ciclo de vida de documentos.

**Tipos de Hooks**:
- `beforeOperation` - Antes de QUALQUER operação (create, read, update, delete)
- `beforeValidate` - Antes de validação
- `beforeChange` - Antes de salvar no DB (create/update)
- `afterChange` - Após salvar no DB
- `beforeRead` - Antes de ler do DB
- `afterRead` - Após ler do DB
- `beforeDelete` - Antes de deletar
- `afterDelete` - Após deletar

**Contexto disponível**: `req`, `operation`, `data`, `originalDoc`, `context`

### 💡 Padrões de Implementação

#### A) Audit Log (afterChange Hook)

```typescript
export const Users: CollectionConfig = {
  slug: 'users',
  hooks: {
    afterChange: [
      async ({ req, doc, previousDoc, operation }) => {
        // Registrar mudanças em audit log
        await req.payload.create({
          collection: 'audit_logs',
          data: {
            action: operation === 'create' ? 'user.created' : 'user.updated',
            user: req.user?.id,
            resource: 'users',
            resourceId: doc.id,
            changes: calculateDiff(previousDoc, doc),
            ip: req.ip,
            userAgent: req.headers['user-agent'],
            timestamp: new Date(),
          },
        })

        return doc
      },
    ],
  },
}
```

#### B) Prevent Modification (beforeChange Hook)

```typescript
export const AuditLogs: CollectionConfig = {
  slug: 'audit_logs',
  hooks: {
    beforeChange: [
      async ({ req, operation, data }) => {
        // Audit logs são append-only
        if (operation === 'update') {
          throw new Error('Audit logs cannot be modified')
        }

        return data
      },
    ],

    beforeDelete: [
      async () => {
        // Audit logs não podem ser deletados
        throw new Error('Audit logs cannot be deleted')
      },
    ],
  },
}
```

#### C) Auto-populate Fields (beforeValidate Hook)

```typescript
export const Applications: CollectionConfig = {
  slug: 'applications',
  hooks: {
    beforeValidate: [
      async ({ data, operation, req }) => {
        // Auto-gerar slug a partir do name
        if (operation === 'create' && !data.slug && data.name) {
          data.slug = data.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
        }

        // Auto-popular createdBy
        if (operation === 'create') {
          data.createdBy = req.user?.id
        }

        return data
      },
    ],
  },
}
```

#### D) Keycloak Role Sync (afterLogin Hook)

```typescript
export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  hooks: {
    afterLogin: [
      async ({ req, user, token }) => {
        // Extrair roles do JWT Keycloak
        const keycloakRoles = token?.realm_access?.roles || []

        // Mapear para roles do Payload
        const mappedRoles = mapKeycloakRolesToPayload(keycloakRoles)

        // Atualizar roles se mudaram
        if (JSON.stringify(user.roles) !== JSON.stringify(mappedRoles)) {
          await req.payload.update({
            collection: 'users',
            id: user.id,
            data: {
              roles: mappedRoles,
            },
          })
        }

        return user
      },
    ],
  },
}
```

### ⚠️ Pontos de Atenção

1. **Hooks são executados sequencialmente** - Ordem importa
2. **Retornar data modificado** - Hooks podem alterar `data` e devem retornar
3. **Throw Error para bloquear** - Lançar erro cancela operação
4. **Acesso ao Payload API** - `req.payload` disponível para chamadas
5. **Evitar recursão infinita** - Hook criando doc pode triggar outro hook

### 🔗 Relacionado com Projeto LBPay

**Hooks implementados**:
- ✅ `afterLogin` - Sync roles Keycloak + audit log
- ✅ `afterLogout` - Audit log
- ⏳ `beforeChange` (audit_logs) - Prevent updates/deletes (pendente)
- ⏳ `beforeValidate` (applications) - Auto-generate slug (pendente)

---

## 5. Plugins & Custom Endpoints

### 📖 Documentação Oficial
- **URL**: https://payloadcms.com/docs/plugins/overview
- **Sub-páginas**:
  - REST API: https://payloadcms.com/docs/rest-api/overview
  - Custom Endpoints: https://payloadcms.com/docs/configuration/collections#endpoints

### 🎯 Conceitos Fundamentais

**Plugins** permitem adicionar funcionalidades reutilizáveis:
- Custom endpoints ou GraphQL queries/mutations
- Novas collections ou fields
- Hooks globais
- Admin views customizadas

**Custom Endpoints** podem ser adicionados em:
- Root level (`endpoints` no `payload.config.ts`)
- Collection level (`endpoints` na collection config)
- Global level (`endpoints` no global config)

**Importante**: Custom endpoints **NÃO** são autenticados por padrão. Você é responsável por securizar.

### 💡 Padrões de Implementação

#### A) Custom Endpoint na Collection

```typescript
// src/collections/Users.ts
export const Users: CollectionConfig = {
  slug: 'users',
  endpoints: [
    {
      path: '/me',
      method: 'get',
      handler: async (req, res) => {
        // Verificar autenticação
        if (!req.user) {
          return res.status(401).json({ error: 'Unauthorized' })
        }

        // Retornar dados do usuário logado
        const user = await req.payload.findByID({
          collection: 'users',
          id: req.user.id,
        })

        return res.status(200).json(user)
      },
    },
  ],
}
```

**URL resultante**: `http://localhost:3000/api/users/me`

#### B) Custom Endpoint no Root Level

```typescript
// src/payload.config.ts
export default buildConfig({
  endpoints: [
    {
      path: '/health',
      method: 'get',
      handler: async (req, res) => {
        // Health check endpoint
        const dbStatus = await checkDatabaseConnection(req.payload)
        const keycloakStatus = await checkKeycloakConnection()

        return res.status(200).json({
          status: 'healthy',
          database: dbStatus,
          keycloak: keycloakStatus,
          timestamp: new Date().toISOString(),
        })
      },
    },
  ],
})
```

**URL resultante**: `http://localhost:3000/api/health`

#### C) Plugin Example (Badge Endpoint para Menu)

```typescript
// src/plugins/menuBadges.ts
import { Plugin } from 'payload'

export const menuBadgesPlugin: Plugin = (config) => {
  return {
    ...config,
    endpoints: [
      ...(config.endpoints || []),
      {
        path: '/menu/badges',
        method: 'get',
        handler: async (req, res) => {
          if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' })
          }

          // Calcular badges dinâmicos
          const notifications = await req.payload.find({
            collection: 'notifications',
            where: {
              user: { equals: req.user.id },
              read: { equals: false },
            },
          })

          const pendingApprovals = await req.payload.find({
            collection: 'approvals',
            where: {
              assignedTo: { equals: req.user.id },
              status: { equals: 'pending' },
            },
          })

          return res.status(200).json({
            notifications: notifications.totalDocs,
            approvals: pendingApprovals.totalDocs,
          })
        },
      },
    ],
  }
}
```

```typescript
// src/payload.config.ts
import { menuBadgesPlugin } from './plugins/menuBadges'

export default buildConfig({
  plugins: [menuBadgesPlugin],
})
```

#### D) CORS Handling

```typescript
import { headersWithCors } from '@payloadcms/next/utilities'

export const customEndpoint = {
  path: '/public-data',
  method: 'get',
  handler: async (req, res) => {
    const data = await fetchPublicData()

    // Adicionar headers CORS
    const headers = headersWithCors({
      headers: new Headers(),
      req,
    })

    return new Response(JSON.stringify(data), {
      status: 200,
      headers,
    })
  },
}
```

### ⚠️ Pontos de Atenção

1. **Security** - Custom endpoints NÃO têm auth por padrão
2. **req.payload** - Objeto Payload disponível para queries
3. **req.user** - User autenticado (se houver)
4. **Path escaping** - `:id` para parâmetros dinâmicos (ex: `/posts/:id`)
5. **CORS** - Use `headersWithCors` para adicionar CORS headers

### 🔗 Relacionado com Projeto LBPay

**Endpoints criados**:
- ✅ `/api/users/me` - Get user data
- ✅ `/api/auth/logout` - Clear auth cookies
- ⏳ `/api/menu/badges` - Dynamic menu badges (pendente)
- ⏳ `/api/applications/:id/health` - App health check (pendente)

---

## 6. Migrations & Versioning

### 📖 Documentação Oficial
- **URL**: https://payloadcms.com/docs/database/migrations
- **Sub-páginas**:
  - Versions: https://payloadcms.com/docs/versions/overview

### 🎯 Conceitos Fundamentais

**Migrations** são arquivos que descrevem mudanças no schema do banco de dados.

**Comandos**:
- `payload migrate:create` - Criar nova migration
- `payload migrate` - Rodar pending migrations
- `payload migrate:status` - Ver status das migrations
- `payload migrate:refresh` - Drop DB + re-run all migrations (DEV ONLY)

**Versioning** é uma funcionalidade do Payload que mantém histórico de mudanças nos documentos.

### 💡 Padrões de Implementação

#### A) Criar Migration

```bash
cd backoffice-portal
npx payload migrate:create add_keycloak_sub_to_users
```

Isso cria arquivo em `src/migrations/XXXXXX_add_keycloak_sub_to_users.ts`:

```typescript
import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.schema.alterTable('users', (table) => {
    table.string('keycloak_sub').unique()
  })
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.schema.alterTable('users', (table) => {
    table.dropColumn('keycloak_sub')
  })
}
```

#### B) Rodar Migrations

```bash
npx payload migrate
```

Output:
```
Running migrations...
✔ Migration add_keycloak_sub_to_users ran successfully
```

#### C) Habilitar Versioning em Collection

```typescript
export const Applications: CollectionConfig = {
  slug: 'applications',
  versions: {
    drafts: true, // Habilita drafts (rascunhos)
    maxPerDoc: 50, // Máximo de versões por documento
  },
  fields: [
    // ... campos
  ],
}
```

Payload automaticamente cria collection `applications_versions` com:
- `parent` - ID do documento original
- `version` - Dados do documento naquela versão
- `createdAt` - Timestamp da versão
- `updatedAt` - Timestamp da última atualização
- `autosave` - Boolean indicando se é autosave
- `latest` - Boolean indicando versão mais recente

#### D) Acessar Versões via API

```typescript
// Buscar versões de um documento
const versions = await payload.findVersions({
  collection: 'applications',
  where: {
    parent: {
      equals: 'app-id-123',
    },
  },
  sort: '-createdAt',
  limit: 10,
})

// Restaurar versão específica
await payload.restoreVersion({
  collection: 'applications',
  id: 'version-id-456',
})
```

### ⚠️ Pontos de Atenção

1. **Não misturar push + migrations** - Use UM método apenas
2. **Migrations em produção** - SEMPRE testar em staging primeiro
3. **down() é opcional** - Mas recomendado para rollback
4. **Versioning aumenta DB size** - Configurar `maxPerDoc` apropriadamente
5. **Breaking changes em migrations** - Documentar em release notes

### 🔗 Relacionado com Projeto LBPay

**Migrations planejadas**:
- ⏳ Add `keycloak_sub` to users
- ⏳ Add `two_factor_secret` to users
- ⏳ Add `last_login_at` to users
- ⏳ Create `user_preferences` table

**Versioning**:
- ⏳ Habilitar em `applications` (drafts para edições)
- ⏳ Habilitar em `menu_items` (histórico de menu changes)

---

## 7. Update Strategy & Backward Compatibility

### 📖 Documentação Oficial
- **URL**: https://payloadcms.com/docs/versions/overview
- **Community**: https://payloadcms.com/community-help/discord/best-way-to-update-payloadcms

### 🎯 Estratégia de Atualização

#### A) PayloadCMS como NPM Dependency

**NÃO precisamos fork** do PayloadCMS. Ele é instalado como dependency:

```json
{
  "dependencies": {
    "payload": "^3.63.0",
    "@payloadcms/next": "^3.63.0",
    "@payloadcms/db-postgres": "^3.63.0"
  }
}
```

**Vantagens**:
- ✅ Updates via `npm update`
- ✅ Semantic versioning (breaking changes em major versions)
- ✅ Customizações via `src/payload/` (não afetadas por updates)

#### B) Processo de Atualização Seguro

**1. Ler Release Notes**

Antes de qualquer update, ler: https://github.com/payloadcms/payload/releases

Procurar por:
- **Breaking Changes** - Mudanças que quebram compatibilidade
- **Migration Required** - Migrations obrigatórias
- **Deprecated Features** - Features que serão removidas

**2. Testar em Dev Environment**

```bash
# Criar branch de teste
git checkout -b update/payload-3.64.0

# Atualizar packages
npm update payload @payloadcms/next @payloadcms/db-postgres

# Rodar migrations (se houver)
npx payload migrate

# Testar aplicação
npm run dev
```

**3. Verificar Customizações**

Verificar se customizações continuam funcionando:
- Custom components (`src/components/admin/*`)
- Custom endpoints (`src/endpoints/*`)
- Hooks (`collections/*/hooks`)
- Plugins (`src/plugins/*`)

**4. Testar em Staging**

```bash
# Build production
npm run build

# Deploy para staging
# ... processo de deploy ...

# Smoke tests
npm run test:e2e
```

**5. Deploy para Produção**

```bash
# Merge para main
git checkout main
git merge update/payload-3.64.0

# Tag release
git tag v1.1.0
git push origin v1.1.0

# Deploy
# ... processo de deploy ...
```

#### C) Backward Compatibility Garantida

**PayloadCMS segue Semantic Versioning**:
- `MAJOR.MINOR.PATCH` (ex: 3.63.0)
- **MAJOR** - Breaking changes (3.x → 4.x)
- **MINOR** - New features, backward compatible (3.63 → 3.64)
- **PATCH** - Bug fixes, backward compatible (3.63.0 → 3.63.1)

**Garantias**:
- Patches (`3.63.0` → `3.63.1`) = SEMPRE seguro atualizar
- Minors (`3.63.x` → `3.64.x`) = Geralmente seguro, testar customizações
- Majors (`3.x.x` → `4.x.x`) = PODE quebrar, ler migration guide

#### D) Dependabot Auto-Update (Recomendado)

**.github/dependabot.yml**:

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/backoffice-portal"
    schedule:
      interval: "weekly"
    # Auto-merge patches
    auto-merge:
      - match:
          dependency-type: "all"
          update-type: "security"
      - match:
          dependency-name: "payload"
          update-type: "semver:patch"
    # Agrupar updates
    groups:
      payloadcms:
        patterns:
          - "payload"
          - "@payloadcms/*"
```

**Vantagens**:
- ✅ Updates automáticos de patches
- ✅ Security fixes aplicados rapidamente
- ✅ PRs agrupados por categoria

### ⚠️ Pontos de Atenção

1. **NUNCA atualizar direto em produção**
2. **SEMPRE ler release notes**
3. **Testar customizações após update**
4. **Manter staging environment atualizado**
5. **Documentar breaking changes** em CHANGELOG.md do projeto

### 🔗 Relacionado com Projeto LBPay

**Versão atual**:
- PayloadCMS: 3.63.0
- Next.js: 15.4.7
- React: 19.1.1

**Update policy**:
- ✅ Auto-merge patches (Dependabot)
- ✅ Review minors (PR manual)
- ✅ Plan majors (release planning)

---

## 📝 Resumo Executivo

### Pontos-Chave para Implementação

1. **Access Control é DECLARATIVO** - Definir em config, não em código business
2. **Hooks são SEQUENCIAIS** - Ordem importa, return data modificado
3. **Custom Components precisam Import Map** - Rodar `generate:importmap`
4. **Custom Endpoints NÃO têm auth** - Verificar `req.user` manualmente
5. **Migrations são IRREVERSÍVEIS em prod** - Testar em dev/staging
6. **PayloadCMS é NPM dependency** - Não fazer fork, customizar via config

### Próximos Passos

Com este conhecimento, podemos implementar:
- ✅ RBAC field-level e document-level
- ✅ Menu dinâmico com badges via endpoint
- ✅ 2FA via hooks (beforeLogin)
- ✅ User preferences via custom collection
- ✅ Audit logs append-only via hooks
- ✅ Multi-language via i18n config

---

## 📖 Guias Oficiais Recomendados

Estes guias oficiais do PayloadCMS Blog contêm exemplos práticos e best practices:

### 1. Authentication & RBAC
**URL**: https://payloadcms.com/posts/guides/setting-up-auth-and-role-based-access-control-in-nextjs-payload

**Tópicos Cobertos**:
- Setup de autenticação em Collections
- Implementação de RBAC (Role-Based Access Control)
- Padrões de access control em collection-level e field-level
- Best practices para definição de roles e permissions
- Integração com Next.js App Router

**Relevância para LBPay**: ⭐⭐⭐⭐⭐ (Crítico)
- Nosso sistema de roles (SuperAdmin, Admin, Operator)
- Access control para Applications, MenuItems, AuditLogs
- Field-level permissions (ex: salary, sensitiveData)

### 2. Header Navigation with Globals
**URL**: https://payloadcms.com/posts/guides/how-to-build-a-header-navigation-using-payload-globals

**Tópicos Cobertos**:
- Uso de Payload Globals para menu/navigation
- Estrutura hierárquica de menus (parent/child)
- Renderização dinâmica de menus no frontend
- Best practices para menu management
- Integração com Link field type

**Relevância para LBPay**: ⭐⭐⭐⭐⭐ (Crítico)
- Nossa collection MenuItems (hierárquica)
- Menu dinâmico com RBAC filtering
- Badges dinâmicos via endpoint

### 3. Local API for Performance
**URL**: https://payloadcms.com/posts/guides/payload-local-api-faster-queries-for-nextjs-and-beyond

**Tópicos Cobertos**:
- Local API vs REST API (performance comparison)
- Quando usar Local API (Server Components, SSR, SSG)
- Integração com Next.js Server Components
- Access control com Local API (`overrideAccess`)
- Best practices para queries otimizadas

**Relevância para LBPay**: ⭐⭐⭐⭐ (Alta)
- Queries de menu items para sidebar (Server Component)
- Portal settings (Global) no layout server-side
- User data em homepage (Server Component)

### 4. Tailwind CSS 4 + Admin Panel Theming
**URL**: https://payloadcms.com/posts/guides/how-to-theme-the-payload-admin-panel-with-tailwind-css-4

**Tópicos Cobertos**:
- Customização de tema do Admin Panel
- Integração Tailwind CSS 4 com PayloadCMS
- CSS variables para theming
- Dark mode / Light mode toggle
- Responsive design patterns

**Relevância para LBPay**: ⭐⭐⭐ (Média)
- Futuro: Customizar cores do admin panel (LBPay branding)
- Dark mode para usuários (user preferences)

### 5. Tailwind CSS + shadcn/ui Setup
**URL**: https://payloadcms.com/posts/guides/how-to-setup-tailwindcss-and-shadcn-ui-in-payload

**Tópicos Cobertos**:
- Setup de Tailwind CSS em projeto Payload
- Integração com shadcn/ui components
- Configuração de tailwind.config.ts
- Uso de components em custom fields
- Best practices para styling consistency

**Relevância para LBPay**: ⭐⭐⭐⭐ (Alta)
- Já temos Tailwind + shadcn/ui configurados
- Custom components (LogoutButton, UserInfo)
- Futuro: Custom fields com shadcn/ui

### 6. Search Plugin for Custom Search
**URL**: https://payloadcms.com/posts/guides/using-payloads-search-plugin-for-custom-search-experiences

**Tópicos Cobertos**:
- Plugin de search do PayloadCMS
- Indexação de collections para busca
- Custom search experiences
- Filtros e facetas de busca
- Performance optimization

**Relevância para LBPay**: ⭐⭐ (Baixa - Futuro)
- Possível: Search de applications no portal
- Possível: Search de menu items
- Possível: Global search no admin panel

---

**Última Atualização**: 2025-01-10
**Versão do Documento**: 1.1
**Mantido por**: AGENT-MAESTRO-001, AGENT-DOC-013
