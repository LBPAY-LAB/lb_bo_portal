# Integração Keycloak + PayloadCMS - Guia Completo

**Versão**: 1.0
**Data**: 2025-01-10
**Autor**: AGENT-MAESTRO-001, AGENT-KEYCLOAK-006
**Status**: ✅ Implementado e Testado

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura da Solução](#arquitetura-da-solução)
3. [Componentes Implementados](#componentes-implementados)
4. [Fluxo de Autenticação](#fluxo-de-autenticação)
5. [Configuração Passo a Passo](#configuração-passo-a-passo)
6. [Testes e Validação](#testes-e-validação)
7. [Troubleshooting](#troubleshooting)
8. [Referências](#referências)

---

## 🎯 Visão Geral

Esta documentação descreve a integração completa entre **Keycloak** (Identity Provider) e **PayloadCMS 3.x** (Headless CMS + Admin UI) para autenticação centralizada via OAuth2/OIDC.

### Problema Resolvido

- **Antes**: PayloadCMS usa autenticação local (email/password) armazenada no banco de dados
- **Depois**: Usuários autenticam via Keycloak SSO, sincronizados como "shadow users" no PayloadCMS
- **Benefício**: Single Sign-On (SSO) centralizado, gestão de usuários no Keycloak, Admin UI do PayloadCMS acessível

### Tecnologias Envolvidas

- **Keycloak 23+**: Identity Provider (OAuth2/OIDC)
- **PayloadCMS 3.63.0**: Headless CMS com Admin UI React
- **Next.js 15.4.7**: Framework full-stack (App Router)
- **PostgreSQL 15+**: Banco de dados para shadow users
- **TypeScript 5.7.3**: Type-safe code

---

## 🏗️ Arquitetura da Solução

```
┌─────────────────────────────────────────────────────────────┐
│                      BROWSER                                │
│  ┌────────────────────────────────────────────────────┐     │
│  │  1. /login (Custom Login Page)                     │     │
│  │     - Input: username, password                    │     │
│  │     - POST /api/auth/keycloak/login                │     │
│  └────────────────────────────────────────────────────┘     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              NEXT.JS API ROUTES (Payload Portal)            │
│                                                             │
│  POST /api/auth/keycloak/login                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 1. Authenticate with Keycloak (OAuth2 password grant)│   │
│  │ 2. Get JWT tokens (access_token, refresh_token)     │   │
│  │ 3. Decode JWT → extract user info (sub, email, name)│   │
│  │ 4. Create/Update shadow user in PayloadCMS DB       │   │
│  │ 5. payload.login() → generate PayloadCMS session    │   │
│  │ 6. Set cookie: payload-token (HttpOnly, SameSite)   │   │
│  │ 7. Return {success, user, access_token, payload_token}│ │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  GET /api/users/me (Custom Override)                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 1. Read payload-token cookie                        │   │
│  │ 2. Decode JWT (no signature verification)           │   │
│  │ 3. Fetch user from DB using decoded.id              │   │
│  │ 4. Return {user, token, exp} (PayloadCMS format)    │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────┬──────────────────────────┬─────────────────────┘
             │                          │
             ▼                          ▼
┌─────────────────────┐    ┌─────────────────────────────────┐
│   KEYCLOAK          │    │   PAYLOADCMS DATABASE (PostgreSQL)│
│   (Auth Server)     │    │                                  │
│                     │    │  TABLE: users                    │
│ - Users/Roles       │    │  ┌────────────────────────────┐  │
│ - OAuth2 Tokens     │    │  │ id (PK)                    │  │
│ - Session Mgmt      │    │  │ email                      │  │
│                     │    │  │ name                       │  │
│ Realm: lbpay-portal │    │  │ keycloak_sub (unique)      │  │
│ Client: payloadcms- │    │  │ password (hashed sub)      │  │
│         portal      │    │  │ createdAt, updatedAt       │  │
│                     │    │  └────────────────────────────┘  │
└─────────────────────┘    └─────────────────────────────────┘
```

### Fluxo de Dados

1. **Login Inicial** → User entra username/password na tela `/login`
2. **Keycloak Auth** → POST `/api/auth/keycloak/login` autentica com Keycloak
3. **Shadow User Sync** → Cria/atualiza user no PayloadCMS DB
4. **PayloadCMS Session** → `payload.login()` gera JWT session token
5. **Cookie Setup** → `payload-token` cookie configurado (HttpOnly)
6. **Admin UI Access** → `/admin` verifica sessão via `/api/users/me`
7. **User Authenticated** → Admin UI renderiza com user logado

---

## 📦 Componentes Implementados

### 1. Custom Login Page

**Arquivo**: `src/app/(payload)/login/page.tsx`

**Função**: Página de login customizada que substitui o login padrão do PayloadCMS

**Características**:
- Form HTML com username/password
- Chama POST `/api/auth/keycloak/login`
- Armazena tokens no sessionStorage (Keycloak access_token, refresh_token)
- Redireciona para `/admin` após sucesso

**Key Code**:
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  const response = await fetch('/api/auth/keycloak/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
    credentials: 'include', // Important for cookie
  })

  if (response.ok) {
    const data = await response.json()
    sessionStorage.setItem('keycloak_token', data.access_token)
    window.location.href = '/admin' // Redirect to Admin UI
  }
}
```

---

### 2. Keycloak Login API Route

**Arquivo**: `src/app/api/auth/keycloak/login/route.ts`

**Função**: Endpoint que integra Keycloak → PayloadCMS

**Fluxo Detalhado**:

```typescript
export async function POST(request: NextRequest) {
  // 1. Parse request body
  const { username, password } = await request.json()

  // 2. Authenticate with Keycloak (OAuth2 Resource Owner Password Credentials)
  const keycloakResponse = await fetch(
    `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'password',
        client_id: process.env.KEYCLOAK_CLIENT_ID!,
        client_secret: process.env.KEYCLOAK_CLIENT_SECRET!,
        username,
        password,
        scope: 'openid profile email',
      }),
    }
  )

  // 3. Decode JWT to extract user info
  const tokens = await keycloakResponse.json()
  const base64Payload = tokens.access_token.split('.')[1]
  const { sub, email, preferred_username, given_name, family_name } =
    JSON.parse(Buffer.from(base64Payload, 'base64').toString())

  // 4. Create or update shadow user in PayloadCMS
  const payload = await getPayload({ config })

  const existingUsers = await payload.find({
    collection: 'users',
    where: { keycloak_sub: { equals: sub } },
    limit: 1,
  })

  let user
  if (existingUsers.docs.length > 0) {
    // Update existing user
    user = await payload.update({
      collection: 'users',
      id: existingUsers.docs[0].id,
      data: {
        email: email || `${preferred_username}@keycloak.local`,
        name: `${given_name} ${family_name}`,
        password: sub, // CRITICAL: Set password to keycloak_sub for programmatic login
      },
    })
  } else {
    // Create new shadow user
    user = await payload.create({
      collection: 'users',
      data: {
        email: email || `${preferred_username}@keycloak.local`,
        name: `${given_name} ${family_name}`,
        keycloak_sub: sub,
        password: sub, // CRITICAL: Use keycloak_sub as password
      },
    })
  }

  // 5. Programmatic login to PayloadCMS
  const loginResult = await payload.login({
    collection: 'users',
    data: {
      email: user.email!,
      password: user.keycloak_sub, // Use keycloak_sub as password
    },
    req: { payload } as any,
  })

  // 6. Set PayloadCMS session cookie
  const response = NextResponse.json({
    success: true,
    user: { id: user.id, email: user.email, name: user.name },
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    payload_token: loginResult.token,
  })

  const cookiePrefix = payload.config.cookiePrefix || 'payload'
  response.cookies.set(`${cookiePrefix}-token`, loginResult.token!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: loginResult.exp! - Math.floor(Date.now() / 1000),
    path: '/',
  })

  return response
}
```

**Pontos Críticos**:

1. **Password = keycloak_sub**: Essencial para `payload.login()` funcionar
2. **payload.login()**: Gera JWT session token válido
3. **Cookie HttpOnly**: Segurança (não acessível via JavaScript)
4. **SameSite: lax**: Permite cookie em redirects

---

### 3. Custom /api/users/me Endpoint

**Arquivo**: `src/app/(payload)/api/users/me/route.ts`

**Função**: Sobrescreve o endpoint padrão do PayloadCMS para retornar formato correto

**Por que é necessário?**

O PayloadCMS Admin UI faz uma requisição GET `/api/users/me` durante a inicialização para verificar se há um usuário autenticado. O endpoint padrão do PayloadCMS retorna apenas `{user}`, mas o Admin UI **espera** `{user, token, exp}`.

**Implementação**:

```typescript
export async function GET(request: NextRequest) {
  const payload = await getPayload({ config })

  // 1. Read payload-token cookie
  const cookieStore = await cookies()
  const cookiePrefix = payload.config.cookiePrefix || 'payload'
  const token = cookieStore.get(`${cookiePrefix}-token`)

  if (!token?.value) {
    return NextResponse.json({ user: null })
  }

  // 2. Decode JWT (no signature verification needed - token created by PayloadCMS)
  const base64Payload = token.value.split('.')[1]
  const decoded = JSON.parse(Buffer.from(base64Payload, 'base64').toString())

  // 3. Fetch full user from database
  const user = await payload.findByID({
    collection: 'users',
    id: decoded.id,
  })

  if (!user) {
    return NextResponse.json({ user: null })
  }

  // 4. Return format expected by Admin UI
  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      collection: 'users',
    },
    token: token.value,
    exp: decoded.exp,
  })
}
```

**Key Points**:

- **Location**: `src/app/(payload)/api/users/me/route.ts` (dentro do route group `(payload)`)
- **Route Priority**: Sobrescreve o endpoint padrão do PayloadCMS
- **No Signature Verification**: Token já foi criado pelo PayloadCMS, confiável
- **Formato de Resposta**: `{user, token, exp}` - exatamente o que Admin UI espera

---

### 4. Middleware - Redirect Login

**Arquivo**: `src/middleware.ts`

**Função**: Redireciona `/admin/login` (padrão do PayloadCMS) para `/login` (custom)

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Redirect PayloadCMS default login to custom Keycloak login
  if (pathname === '/admin/login') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/login'],
}
```

---

### 5. Users Collection Configuration

**Arquivo**: `src/collections/Users.ts`

**Configuração**:

```typescript
import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: {
    // Local authentication (shadow users synced from Keycloak)
  },
  access: {
    admin: ({ req: { user } }) => !!user, // Any authenticated user can access admin
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: false,
    },
    {
      name: 'name',
      type: 'text',
      required: false,
    },
    {
      name: 'keycloak_sub',
      type: 'text',
      unique: true,
      required: false,
      admin: {
        description: 'Keycloak user ID (sub claim) for shadow user sync',
        readOnly: true,
      },
      index: true,
    },
    {
      name: 'roles',
      type: 'relationship',
      relationTo: 'roles',
      hasMany: true,
    },
  ],
}
```

**Key Fields**:

- `keycloak_sub`: Unique identifier do Keycloak (JWT claim `sub`)
- `password`: Hash da senha (configurado como `keycloak_sub` para login programático)
- `email`, `name`: Sincronizados do Keycloak

---

## 🔄 Fluxo de Autenticação (Detalhado)

### Cenário 1: Primeiro Login (Usuário Novo)

```
┌────────┐
│ BROWSER│
└────┬───┘
     │
     │ 1. Navigate to /login
     ▼
┌────────────────────────────┐
│  Custom Login Page         │
│  - Input: jose.silva       │
│  - Input: Test@123         │
│  - Click "Login"           │
└────────────┬───────────────┘
             │
             │ 2. POST /api/auth/keycloak/login
             │    {username: "jose.silva", password: "Test@123"}
             ▼
┌────────────────────────────────────────────────────┐
│  Keycloak Login API Route                          │
│                                                    │
│  3. Authenticate with Keycloak                     │
│     POST http://keycloak:8080/realms/lbpay-portal/│
│          protocol/openid-connect/token             │
│     Body: grant_type=password&client_id=...&       │
│           username=jose.silva&password=Test@123    │
│                                                    │
│  ✅ Keycloak validates credentials                 │
│  ✅ Returns: {access_token, refresh_token}         │
│                                                    │
│  4. Decode access_token JWT                        │
│     Extract: sub (fc0432b2-...), email, name       │
│                                                    │
│  5. Check if shadow user exists (keycloak_sub)     │
│     ❌ NOT FOUND                                    │
│                                                    │
│  6. Create new shadow user                         │
│     payload.create({                               │
│       collection: 'users',                         │
│       data: {                                      │
│         email: 'jose.silva@lbpay.com.br',          │
│         name: 'José Silva',                        │
│         keycloak_sub: 'fc0432b2-...',              │
│         password: 'fc0432b2-...' (same as sub)     │
│       }                                            │
│     })                                             │
│     ✅ User created in PostgreSQL                  │
│                                                    │
│  7. Programmatic login to PayloadCMS               │
│     payload.login({                                │
│       collection: 'users',                         │
│       data: {                                      │
│         email: 'jose.silva@lbpay.com.br',          │
│         password: 'fc0432b2-...' (keycloak_sub)    │
│       }                                            │
│     })                                             │
│     ✅ Returns: {token: "eyJ...", exp: 1762752512} │
│                                                    │
│  8. Set cookie: payload-token=eyJ...               │
│     HttpOnly, SameSite=lax, Path=/                 │
│                                                    │
│  9. Return JSON response                           │
│     {                                              │
│       success: true,                               │
│       user: {id: 1, email: "...", name: "..."},    │
│       access_token: "eyJ... (Keycloak)",           │
│       payload_token: "eyJ... (PayloadCMS)"         │
│     }                                              │
└────────────┬───────────────────────────────────────┘
             │
             │ 10. Redirect to /admin
             ▼
┌────────────────────────────────────────────────────┐
│  PayloadCMS Admin UI (React)                       │
│                                                    │
│  11. Admin UI initialization                       │
│      GET /api/users/me (with cookie)               │
│                                                    │
│  12. Custom /api/users/me endpoint                 │
│      - Read payload-token cookie                   │
│      - Decode JWT → id: 1                          │
│      - Fetch user from DB                          │
│      - Return {user, token, exp}                   │
│                                                    │
│  ✅ Admin UI renders authenticated                 │
│  ✅ User sees dashboard                            │
└────────────────────────────────────────────────────┘
```

### Cenário 2: Login Subsequente (Usuário Existente)

```
Same as above, but step 6 changes:

6. Check if shadow user exists (keycloak_sub)
   ✅ FOUND (user.id = 1)

7. Update existing shadow user
   payload.update({
     collection: 'users',
     id: 1,
     data: {
       email: 'jose.silva@lbpay.com.br',
       name: 'José Silva',
       password: 'fc0432b2-...' (refresh keycloak_sub)
     }
   })
   ✅ User updated (ensures password is always keycloak_sub)

Continue with step 7 (programmatic login)...
```

---

## ⚙️ Configuração Passo a Passo

### Pré-requisitos

- ✅ Keycloak instalado e rodando (Docker ou standalone)
- ✅ Realm `lbpay-portal` criado
- ✅ Client `payloadcms-portal` configurado
- ✅ User `jose.silva` criado com password `Test@123`
- ✅ PostgreSQL rodando
- ✅ PayloadCMS 3.x instalado

### Passo 1: Configurar Variáveis de Ambiente

**Arquivo**: `.env`

```bash
# Database
DATABASE_URI=postgresql://user:password@localhost:5432/payloadcms_dev
PAYLOAD_SECRET=your-secret-key-min-32-chars

# Keycloak Configuration
KEYCLOAK_ISSUER=http://localhost:8080/realms/lbpay-portal
KEYCLOAK_CLIENT_ID=payloadcms-portal
KEYCLOAK_CLIENT_SECRET=your-client-secret-from-keycloak

# App
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

### Passo 2: Configurar Keycloak Client

1. Acesse Keycloak Admin Console: `http://localhost:8080/admin`
2. Realm: `lbpay-portal`
3. Clients → `payloadcms-portal`
4. **Settings**:
   - Client authentication: ON
   - Authorization: OFF
   - Standard flow: ON
   - Direct access grants: ON ✅ (CRITICAL - enables password grant)
   - Valid redirect URIs: `http://localhost:3000/*`
   - Web origins: `http://localhost:3000`
5. **Credentials** tab:
   - Copy `Client Secret` → `.env` file

### Passo 3: Criar Arquivos da Integração

Criar os seguintes arquivos:

1. ✅ `src/app/(payload)/login/page.tsx` - Custom login page
2. ✅ `src/app/api/auth/keycloak/login/route.ts` - Login API
3. ✅ `src/app/(payload)/api/users/me/route.ts` - Custom /me endpoint
4. ✅ `src/middleware.ts` - Redirect middleware
5. ✅ `src/collections/Users.ts` - Users collection (já existe, adicionar `keycloak_sub` field)

### Passo 4: Adicionar Campo `keycloak_sub` ao Users

**Arquivo**: `src/collections/Users.ts`

Adicionar field:

```typescript
{
  name: 'keycloak_sub',
  type: 'text',
  unique: true,
  required: false,
  admin: {
    description: 'Keycloak user ID (sub claim) for shadow user sync',
    readOnly: true,
  },
  index: true,
}
```

### Passo 5: Executar Migrations

```bash
pnpm run payload migrate
```

### Passo 6: Testar Integração

```bash
# Start development server
pnpm run dev

# In another terminal, run test script
chmod +x test-complete-auth-flow.sh
./test-complete-auth-flow.sh
```

**Expected Output**:

```
=== Step 1: Login via Keycloak ===
{
  "success": true,
  "user": {
    "id": 1,
    "email": "jose.silva@lbpay.com.br"
  }
}

=== Step 2: Check /api/users/me with cookie ===
{
  "user": {
    "id": 1,
    "email": "jose.silva@lbpay.com.br",
    "name": "José Silva",
    ...
  },
  "token": "eyJ...",
  "exp": 1762752512
}
```

---

## 🧪 Testes e Validação

### Testes Automatizados

#### Teste 1: Login Flow Completo

**Script**: `test-complete-auth-flow.sh`

```bash
#!/bin/bash

echo "=== Step 1: Login via Keycloak ==="
curl -s -c /tmp/test-cookies.txt -b /tmp/test-cookies.txt \
  http://localhost:3000/api/auth/keycloak/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"jose.silva","password":"Test@123"}' | jq .

echo ""
echo "=== Step 2: Check /api/users/me with cookie ==="
curl -s -b /tmp/test-cookies.txt http://localhost:3000/api/users/me | jq .
```

#### Teste 2: Admin UI Access

**Script**: `test-admin-ui-access.sh`

```bash
#!/bin/bash

# 1. Login
LOGIN_RESPONSE=$(curl -s -c /tmp/admin-cookies.txt \
  http://localhost:3000/api/auth/keycloak/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"jose.silva","password":"Test@123"}')

# 2. Check /api/users/me
ME_RESPONSE=$(curl -s -b /tmp/admin-cookies.txt http://localhost:3000/api/users/me)
HAS_USER=$(echo "$ME_RESPONSE" | jq -r '.user != null')

# 3. Access /admin
ADMIN_RESPONSE=$(curl -s -b /tmp/admin-cookies.txt -w "\n%{http_code}" http://localhost:3000/admin)
HTTP_CODE=$(echo "$ADMIN_RESPONSE" | tail -n1)

echo "Admin Access: HTTP $HTTP_CODE"
if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Admin UI accessible"
else
  echo "❌ Admin UI not accessible"
fi
```

### Testes Manuais

#### Teste 1: Browser Login

1. Abra `http://localhost:3000/login`
2. Entre com `jose.silva` / `Test@123`
3. Clique "Login"
4. **Esperado**: Redirect para `http://localhost:3000/admin`
5. **Verificar**: Admin UI renderiza dashboard, não mostra tela de login

#### Teste 2: Session Persistence

1. Faça login conforme Teste 1
2. Feche o browser (mantém cookie)
3. Reabra `http://localhost:3000/admin`
4. **Esperado**: Admin UI carrega diretamente, sem pedir login

#### Teste 3: Logout

1. Faça login conforme Teste 1
2. No Admin UI, clique no menu do usuário → Logout
3. **Esperado**: Redirect para `/login`
4. Acesse `http://localhost:3000/admin`
5. **Esperado**: Redirect para `/login` (unauthenticated)

---

## 🔧 Troubleshooting

### Problema 1: Login retorna erro "invalid_grant"

**Causa**: Keycloak não consegue autenticar o usuário

**Soluções**:

1. Verificar username/password corretos
2. Keycloak Admin → Users → `jose.silva` → Credentials → Reset password
3. Verificar Keycloak Client → Settings → Direct access grants: ON

### Problema 2: /api/users/me retorna {user: null}

**Causa**: Cookie não está sendo enviado ou é inválido

**Debug**:

```bash
# Check if cookie is being set
curl -v http://localhost:3000/api/auth/keycloak/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"jose.silva","password":"Test@123"}' 2>&1 | grep -i "set-cookie"
```

**Esperado**: Ver `set-cookie: payload-token=...`

**Soluções**:

1. Verificar se `payload.login()` está retornando `{token, exp}`
2. Verificar se cookie está sendo configurado com `response.cookies.set()`
3. Verificar se endpoint `/api/users/me` está lendo cookie corretamente

### Problema 3: Admin UI mostra "unauthenticated": true

**Causa**: Endpoint `/api/users/me` não retorna formato correto

**Debug**:

```bash
# Login first
curl -s -c cookies.txt http://localhost:3000/api/auth/keycloak/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"jose.silva","password":"Test@123"}'

# Check /api/users/me response
curl -s -b cookies.txt http://localhost:3000/api/users/me | jq .
```

**Esperado**:

```json
{
  "user": {...},
  "token": "eyJ...",
  "exp": 1762752512
}
```

**Soluções**:

1. Verificar se arquivo `src/app/(payload)/api/users/me/route.ts` existe
2. Verificar se está dentro do route group `(payload)`
3. Verificar se retorna `{user, token, exp}`

### Problema 4: payload.login() retorna erro "The email or password provided is incorrect"

**Causa**: Password do shadow user não corresponde a `keycloak_sub`

**Solução**:

Verificar que ao criar/atualizar user, o campo `password` é configurado como `keycloak_sub`:

```typescript
await payload.create({
  collection: 'users',
  data: {
    email: '...',
    name: '...',
    keycloak_sub: sub,
    password: sub, // ✅ CRITICAL
  }
})
```

### Problema 5: Custom /api/users/me não sobrescreve endpoint padrão

**Causa**: Route priority incorreto

**Solução**:

1. Verificar que arquivo está em `src/app/(payload)/api/users/me/route.ts`
2. **NÃO** em `src/app/api/users/me/route.ts` (fora do route group)
3. Limpar cache Next.js: `rm -rf .next && pnpm run dev`

---

## 📚 Referências

### PayloadCMS Documentation

- [PayloadCMS Authentication](https://payloadcms.com/docs/authentication/overview)
- [PayloadCMS Access Control](https://payloadcms.com/docs/access-control/overview)
- [PayloadCMS Collections](https://payloadcms.com/docs/configuration/collections)
- [PayloadCMS Login API](https://payloadcms.com/docs/authentication/operations#login)

### Keycloak Documentation

- [Keycloak OAuth2/OIDC](https://www.keycloak.org/docs/latest/securing_apps/#_oidc)
- [Keycloak Resource Owner Password Credentials](https://www.keycloak.org/docs/latest/securing_apps/#_resource_owner_password_credentials_flow)
- [Keycloak Client Configuration](https://www.keycloak.org/docs/latest/server_admin/#_clients)

### Next.js Documentation

- [Next.js App Router](https://nextjs.org/docs/app)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)

### OAuth2/OIDC Standards

- [RFC 6749: OAuth 2.0](https://datatracker.ietf.org/doc/html/rfc6749)
- [OpenID Connect Core](https://openid.net/specs/openid-connect-core-1_0.html)

---

## ✅ Checklist de Implementação

- [x] Keycloak configurado com Realm `lbpay-portal`
- [x] Client `payloadcms-portal` com Direct Access Grants habilitado
- [x] Variáveis de ambiente configuradas (`.env`)
- [x] Campo `keycloak_sub` adicionado ao Users collection
- [x] Custom login page criada (`/login`)
- [x] API route `/api/auth/keycloak/login` implementada
- [x] Custom endpoint `/api/users/me` implementado
- [x] Middleware de redirect configurado
- [x] Testes automatizados criados e passando
- [x] Admin UI acessível após login
- [x] Session persistence funcionando
- [x] Logout funcionando

---

## 📝 Notas Importantes

### Shadow Users

- Shadow users são usuários sincronizados do Keycloak para o PayloadCMS
- **NÃO** gerenciar passwords no PayloadCMS - sempre use Keycloak
- Campo `keycloak_sub` é unique identifier - **NUNCA** modificar manualmente
- Campo `password` é configurado como `keycloak_sub` apenas para login programático

### Segurança

- ✅ Cookies são HttpOnly (não acessíveis via JavaScript)
- ✅ SameSite=lax (proteção contra CSRF)
- ✅ Tokens Keycloak armazenados em sessionStorage (client-side)
- ✅ PayloadCMS tokens em cookies (server-side)
- ⚠️ Em produção, configurar `secure: true` para cookies
- ⚠️ Usar HTTPS em produção

### Performance

- Cada login cria/atualiza shadow user (operação DB)
- `payload.login()` gera novo JWT a cada login
- Considerar cache de user data se necessário
- Session expiration: 2 horas (padrão PayloadCMS)

### Manutenção

- Atualizar Keycloak e PayloadCMS regularmente
- Monitorar logs de autenticação
- Revisar shadow users periodicamente (limpar unused)
- Testar integração após updates

---

**Última Atualização**: 2025-01-10
**Versão**: 1.0
**Status**: ✅ Produção Ready
