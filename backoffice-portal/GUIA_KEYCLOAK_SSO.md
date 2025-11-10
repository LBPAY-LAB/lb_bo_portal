# 🔐 Guia: Integração Keycloak SSO com PayloadCMS

Este guia detalha a integração completa entre Keycloak (OAuth2/OIDC) e PayloadCMS para SSO (Single Sign-On).

---

## 📋 Arquitetura da Solução

```
┌─────────────────────────────────────────────────────────────┐
│                     USUÁRIO (Browser)                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ 1. Acessa /admin
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              PayloadCMS Portal (Next.js 15)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  2. Verifica autenticação                            │   │
│  │  3. Se não autenticado → Redirect para Keycloak      │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ 4. Redirect OAuth2
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  Keycloak (http://localhost:8081)            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  5. Tela de login (username/password)                │   │
│  │  6. Usuário autentica                                │   │
│  │  7. Keycloak gera JWT token                          │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ 8. Callback com authorization code
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              PayloadCMS - OAuth Callback                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  9. Troca code por access_token                      │   │
│  │ 10. Valida JWT token                                 │   │
│  │ 11. Extrai user info (sub, email, roles)             │   │
│  │ 12. Cria/atualiza shadow user no Payload             │   │
│  │ 13. Cria sessão Payload                              │   │
│  │ 14. Redirect para /admin                             │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ 1. Verificar Keycloak Rodando

```bash
# Ver status dos containers
docker-compose ps

# Deve mostrar:
# portal_postgres  Up (healthy)
# portal_redis     Up (healthy)
# portal_keycloak  Up (healthy)

# Acessar admin console
open http://localhost:8081
```

**Credenciais Keycloak**:
- Username: `admin`
- Password: `admin123`

---

## 🔧 2. Configurar Realm e Client no Keycloak

### 2.1. Criar Realm

1. Acesse http://localhost:8081/admin
2. Login com `admin` / `admin123`
3. Clique em **"Create Realm"**
4. Preencha:
   - **Realm name**: `lbpay-portal`
   - **Enabled**: ✅
5. Clique em **"Create"**

### 2.2. Criar Client (OAuth2)

1. No realm `lbpay-portal`, vá em **Clients** → **Create client**
2. **General Settings**:
   - **Client ID**: `payloadcms-portal`
   - **Client Protocol**: `openid-connect`
   - **Client authentication**: ✅ ON
3. **Capability config**:
   - **Standard flow**: ✅ ON (Authorization Code)
   - **Direct access grants**: ✅ ON (para testes)
4. **Login settings**:
   - **Root URL**: `http://localhost:3002`
   - **Valid redirect URIs**: `http://localhost:3002/api/auth/keycloak/callback`
   - **Web origins**: `http://localhost:3002`
5. Clique em **"Save"**

### 2.3. Obter Client Secret

1. Vá em **Clients** → `payloadcms-portal`
2. Aba **"Credentials"**
3. Copie o **"Client secret"** (será algo como `abc123...`)
4. Guarde para usar no `.env`

### 2.4. Criar Usuário de Teste

1. Vá em **Users** → **Add user**
2. Preencha:
   - **Username**: `jose.silva`
   - **Email**: `jose.silva@lbpay.com.br`
   - **First name**: `José`
   - **Last name**: `Silva`
   - **Email verified**: ✅
3. Clique em **"Create"**
4. Vá na aba **"Credentials"**
5. Clique em **"Set password"**:
   - **Password**: `Test@123`
   - **Temporary**: ❌ (para não pedir troca)
6. Clique em **"Save"**

### 2.5. Criar Roles

1. Vá em **Realm roles** → **Create role**
2. Crie 3 roles:
   - **super_admin** (descrição: "Full access")
   - **admin** (descrição: "Administrative access")
   - **operator** (descrição: "Read-only access")

### 2.6. Associar Role ao Usuário

1. Vá em **Users** → `jose.silva`
2. Aba **"Role mappings"**
3. Clique em **"Assign role"**
4. Selecione `super_admin`
5. Clique em **"Assign"**

---

## 🔑 3. Configurar Variáveis de Ambiente

Edite `/Users/jose.silva.lb/LBPAY/lb_bo_portal/backoffice-portal/.env`:

```env
# Existing vars
DATABASE_URI=postgresql://portal_user:portal_dev_pass@localhost:5432/payload_dev
PAYLOAD_SECRET=1c8f68125e793af063e12e80
NEXT_PUBLIC_SERVER_URL=http://localhost:3002
NODE_ENV=development

# NEW: Keycloak OAuth2 Config
KEYCLOAK_ISSUER=http://localhost:8081/realms/lbpay-portal
KEYCLOAK_CLIENT_ID=payloadcms-portal
KEYCLOAK_CLIENT_SECRET=<COLE_AQUI_O_SECRET_COPIADO>
KEYCLOAK_REDIRECT_URI=http://localhost:3002/api/auth/keycloak/callback
```

---

## 📦 4. Instalar Dependências OAuth2

```bash
cd /Users/jose.silva.lb/LBPAY/lb_bo_portal/backoffice-portal
pnpm add openid-client jose
```

Bibliotecas:
- **openid-client**: Cliente OpenID Connect certificado
- **jose**: JWT validation e manipulation

---

## 🎯 Próximos Passos (Implementação)

Agora vou implementar:

1. ✅ **Custom Auth Strategy** (`src/auth/KeycloakStrategy.ts`)
2. ✅ **OAuth Callback Endpoint** (`src/app/api/auth/keycloak/callback/route.ts`)
3. ✅ **Login Redirect** (modificar Users collection)
4. ✅ **Shadow Users Sync** (criar/atualizar user do Keycloak no Payload)
5. ✅ **Role Mapping** (mapear roles Keycloak → Payload)

---

## 🧪 Teste de Login

Após implementação, você poderá testar:

1. Acesse `http://localhost:3002/admin`
2. Será redirecionado para Keycloak
3. Login com `jose.silva` / `Test@123`
4. Será redirecionado de volta para `/admin` autenticado
5. Shadow user será criado automaticamente no Payload

---

## 📊 Fluxo de Dados

### JWT Token Claims (Keycloak)

```json
{
  "sub": "f1234567-89ab-cdef-0123-456789abcdef",
  "email": "jose.silva@lbpay.com.br",
  "given_name": "José",
  "family_name": "Silva",
  "preferred_username": "jose.silva",
  "realm_access": {
    "roles": ["super_admin", "admin"]
  }
}
```

### Shadow User (Payload)

```typescript
{
  email: "jose.silva@lbpay.com.br",
  keycloak_sub: "f1234567-89ab-cdef-0123-456789abcdef",
  name: "José Silva",
  roles: [<relationship_to_roles_collection>]
}
```

---

## 🔐 Segurança

### Token Validation
- ✅ **JWT Signature**: Validado com public key do Keycloak
- ✅ **Issuer**: Verificado contra `KEYCLOAK_ISSUER`
- ✅ **Audience**: Validado para `payloadcms-portal`
- ✅ **Expiration**: Token expirado rejeita automaticamente

### Session Management
- ✅ **httpOnly cookies**: Previne XSS
- ✅ **secure flag**: Apenas HTTPS (produção)
- ✅ **sameSite**: Previne CSRF
- ✅ **Session timeout**: Configurável em Portal Settings

---

**Documentado em**: 2025-01-09
**Versão**: 1.0
**Keycloak Version**: 23.0
