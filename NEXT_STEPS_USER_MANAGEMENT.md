# Próximos Passos - Sistema de Gestão de Usuários e 2FA

**Status**: Fase 1 Completada (Infraestrutura e Collections)
**Próxima Fase**: Fase 2 (Endpoints e UI)
**Data**: 2025-01-10

---

## ✅ O Que Já Foi Implementado (Fase 1)

### Collections Criadas
1. **EmailTemplates** (`src/collections/EmailTemplates.ts`) ✅
   - Templates editáveis no portal
   - Variáveis: {{username}}, {{invitationLink}}, {{portalName}}, etc.
   - Categorização por tipo

2. **UserInvitations** (`src/collections/UserInvitations.ts`) ✅
   - Sistema de convites com tokens seguros (32 bytes)
   - Expiração automática em 48h
   - Auto-envio de email via hook `afterChange`
   - Status: pending, accepted, expired, cancelled

3. **Users** (Extended) (`src/collections/Users.ts`) ✅
   - Novos campos:
     - `userType`: keycloak_sso | portal_managed | invited
     - `invitationId`: relationship para UserInvitations
     - `twoFactorEnabled`: boolean (sync do Keycloak)
     - `lastLoginAt`: date
     - `status`: active | inactive | suspended | pending

### Serviços Criados
1. **KeycloakAdminService** (`src/lib/keycloak-admin.ts`) ✅
   - `createUser()` - Criar usuário no Keycloak
   - `setPassword()` / `setTemporaryPassword()` - Gerenciar senhas
   - `sendPasswordResetEmail()` - Reset via Keycloak
   - `getTwoFactorStatus()` - Verificar OTP habilitado
   - `assignRole()` - Atribuir roles
   - `getUserByEmail()` - Buscar usuário
   - `updateUser()` / `deleteUser()` - CRUD completo

2. **EmailService** (`src/lib/email.ts`) ✅
   - `sendInvitationEmail()` - Envia convite com template editável
   - `sendWelcomeEmail()` - Email de boas-vindas
   - `sendPasswordResetNotification()` - Notificação de reset
   - `testEmailConfiguration()` - Testa configuração SMTP
   - Sistema de substituição de variáveis {{variable}}

### Configuração
- ✅ Novas collections registradas em `payload.config.ts`
- ✅ Imports adicionados

---

## 📝 Fase 2 - Endpoints e API (A Implementar)

### 1. Endpoint: Direct User Creation

**Arquivo**: `src/app/api/users/create/route.ts`

**Funcionalidade**:
- Criação direta de usuários por admins (sem convite)
- Cria usuário no Keycloak + Portal
- Envia email de reset de senha

**Request**:
```typescript
POST /api/users/create
{
  "email": "user@example.com",
  "name": "John Doe",
  "roles": ["role_id_1"],
  "sendPasswordResetEmail": true
}
```

**Flow**:
1. Validar permissões (SuperAdmin/Admin)
2. Validar email único
3. Criar usuário no Keycloak (`keycloakAdmin.createUser()`)
4. Criar shadow user no Portal (userType: 'portal_managed')
5. Enviar email de reset via Keycloak
6. Log de auditoria

**Response**:
```json
{
  "success": true,
  "user": {
    "id": "...",
    "email": "...",
    "keycloak_sub": "...",
    "status": "pending"
  }
}
```

### 2. Endpoint: Send Invitation

**Arquivo**: `src/app/api/users/invite/route.ts`

**Funcionalidade**:
- Envia convite por email
- Collection UserInvitations cuida da criação do token e envio do email (via hook)

**Request**:
```typescript
POST /api/users/invite
{
  "email": "newuser@example.com",
  "name": "Jane Smith",
  "roles": ["role_id_1"]
}
```

**Flow**:
1. Validar permissões (SuperAdmin/Admin)
2. Validar email único (Portal + Keycloak)
3. Criar registro em UserInvitations
4. Hook `afterChange` envia email automaticamente
5. Log de auditoria

**Response**:
```json
{
  "success": true,
  "invitation": {
    "id": "...",
    "email": "...",
    "expiresAt": "2025-01-12T10:00:00Z"
  }
}
```

### 3. Endpoint: Accept Invitation

**Arquivo**: `src/app/api/users/accept-invitation/route.ts`

**Funcionalidade**:
- Usuário aceita convite e define senha
- Cria conta no Keycloak + Portal

**Request**:
```typescript
POST /api/users/accept-invitation
{
  "token": "abc123...",
  "password": "SecurePassword123!"
}
```

**Flow**:
1. Validar token (existe, não expirado, status pending)
2. Criar usuário no Keycloak com senha
3. Criar shadow user no Portal (userType: 'invited')
4. Atualizar invitation (status: 'accepted', acceptedAt: now)
5. Enviar email de boas-vindas
6. Log de auditoria

**Response**:
```json
{
  "success": true,
  "user": {
    "id": "...",
    "email": "..."
  },
  "redirectTo": "/login"
}
```

---

## 🎨 Fase 3 - UI Components (A Implementar)

### 1. Página: Accept Invitation

**Arquivo**: `src/app/accept-invitation/page.tsx`

**UI**:
- Formulário de criação de senha
- Validação de senha (min 8 chars, match confirm)
- Loading states
- Error handling (token inválido/expirado)

**Componentes**:
```tsx
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function AcceptInvitationPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  // Estado: password, confirmPassword, loading, error
  // handleSubmit: POST /api/users/accept-invitation
  // Redirect para /login em caso de sucesso
}
```

### 2. Componente: User Invitation Modal (Admin Panel)

**Funcionalidade**:
- Modal no admin panel para enviar convite
- Formulário: email, name, roles

**Localização**: Custom component via PayloadCMS Admin

**Opção 1**: Usar Collection nativa UserInvitations (admin já funciona)
**Opção 2**: Custom button/modal em Users collection

### 3. Componente: User Creation Modal (Admin Panel)

**Similar ao invitation modal**, mas para criação direta

---

## 🔐 Fase 4 - 2FA Integration (A Implementar)

### 1. Hook: Sync 2FA Status

**Arquivo**: `src/hooks/sync-2fa-status.ts`

**Funcionalidade**:
- Hook `afterLogin` para Users collection
- Verifica 2FA no Keycloak
- Atualiza campo `twoFactorEnabled` no Portal
- Atualiza `lastLoginAt`

**Código**:
```typescript
import { CollectionAfterLoginHook } from 'payload'
import { keycloakAdmin } from '@/lib/keycloak-admin'

export const sync2FAStatus: CollectionAfterLoginHook = async ({ req, user }) => {
  if (!user.keycloak_sub) return user

  const has2FA = await keycloakAdmin.getTwoFactorStatus(user.keycloak_sub)

  if (user.twoFactorEnabled !== has2FA) {
    await req.payload.update({
      collection: 'users',
      id: user.id,
      data: {
        twoFactorEnabled: has2FA,
        lastLoginAt: new Date().toISOString(),
      },
    })
  }

  return user
}
```

**Registro** em `src/collections/Users.ts`:
```typescript
hooks: {
  afterLogin: [sync2FAStatus],
}
```

### 2. UI: 2FA Badge

**Atualizar**: `src/components/admin/UserInfo.tsx`

**Adicionar** indicador visual:
```tsx
{user.twoFactorEnabled && (
  <span style={{ fontSize: '10px', color: '#10B981' }}>
    🔒 2FA Enabled
  </span>
)}
```

---

## ⚙️ Fase 5 - Configuration & Setup (A Implementar)

### 1. Environment Variables

**Adicionar em** `.env`:
```bash
# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@lbpay.com.br
SMTP_PASSWORD=your-app-password
EMAIL_FROM=Portal LBPAY <noreply@lbpay.com.br>
```

### 2. Keycloak Configuration (Manual)

**Admin Console** → Clients → payloadcms-portal:

1. **Enable Service Account**:
   - Settings → Service Accounts Enabled: ON
   - Save

2. **Grant Admin Permissions**:
   - Service Account Roles → Client Roles → realm-management
   - Assign: `manage-users`, `view-users`, `query-users`

3. **Configure Email** (Realm Settings → Email):
   - From: noreply@lbpay.com.br
   - Host: smtp.gmail.com
   - Port: 587
   - Enable StartTLS: Yes
   - Authentication: Yes
   - Username/Password: (SMTP credentials)

4. **Configure OTP** (Optional):
   - Authentication → Required Actions → Configure OTP: Enable
   - Authentication → Flows → Browser → OTP Form: Conditional/Required

### 3. Seed Default Email Templates

**Arquivo**: `src/seed/email-templates.ts`

**Templates a Criar**:

#### Template 1: User Invitation
```typescript
{
  name: 'User Invitation Email',
  slug: 'user_invitation',
  type: 'system',
  subject: 'You have been invited to {{portalName}}',
  htmlBody: `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #2563EB; color: white; padding: 20px; text-align: center;">
        <h1>{{portalName}}</h1>
      </div>
      <div style="padding: 30px; background: #f9fafb;">
        <h2>Hi {{username}},</h2>
        <p>You've been invited to join <strong>{{portalName}}</strong> by {{inviterName}}.</p>
        <p>Click the button below to accept and create your account:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{invitationLink}}" style="background: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Accept Invitation</a>
        </div>
        <p style="color: #6B7280; font-size: 14px;">
          This invitation expires in 48 hours ({{expiresAt}}).
        </p>
      </div>
    </body>
    </html>
  `,
  textBody: `Hi {{username}}, you've been invited to {{portalName}}. Accept: {{invitationLink}}`,
  availableVariables: [
    { variable: 'username', description: 'User full name', example: 'John Doe' },
    { variable: 'inviterName', description: 'Name of admin who sent invitation', example: 'Admin User' },
    { variable: 'invitationLink', description: 'Unique invitation acceptance link', example: 'https://portal.lbpay.com/accept-invitation?token=...' },
    { variable: 'portalName', description: 'Portal name from settings', example: 'LBPAY Portal' },
    { variable: 'expiresAt', description: 'Expiration date/time', example: '12/01/2025 18:00' }
  ],
  active: true,
  category: 'user_management'
}
```

#### Template 2: Welcome Email
```typescript
{
  name: 'Welcome Email',
  slug: 'welcome',
  type: 'system',
  subject: 'Welcome to {{portalName}}!',
  htmlBody: `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #2563EB; color: white; padding: 20px; text-align: center;">
        <h1>{{portalName}}</h1>
      </div>
      <div style="padding: 30px; background: #f9fafb;">
        <h2>Welcome, {{username}}!</h2>
        <p>Your account has been created successfully.</p>
        <p>You can now login at: <a href="{{loginLink}}">{{loginLink}}</a></p>
      </div>
    </body>
    </html>
  `,
  textBody: `Welcome {{username}}! Login at: {{loginLink}}`,
  availableVariables: [
    { variable: 'username', description: 'User full name', example: 'John Doe' },
    { variable: 'portalName', description: 'Portal name', example: 'LBPAY Portal' },
    { variable: 'loginLink', description: 'Login page URL', example: 'https://portal.lbpay.com/login' }
  ],
  active: true,
  category: 'user_management'
}
```

#### Template 3: Password Reset
```typescript
{
  name: 'Password Reset Notification',
  slug: 'password_reset',
  type: 'system',
  subject: 'Password reset request - {{portalName}}',
  htmlBody: `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #2563EB; color: white; padding: 20px; text-align: center;">
        <h1>{{portalName}}</h1>
      </div>
      <div style="padding: 30px; background: #f9fafb;">
        <h2>Hi {{username}},</h2>
        <p>A password reset email has been sent to you by Keycloak.</p>
        <p>Please check your inbox for instructions.</p>
      </div>
    </body>
    </html>
  `,
  textBody: `Hi {{username}}, check your email for password reset instructions.`,
  availableVariables: [
    { variable: 'username', description: 'User full name', example: 'John Doe' },
    { variable: 'portalName', description: 'Portal name', example: 'LBPAY Portal' }
  ],
  active: true,
  category: 'security'
}
```

**Executar Seed**:
```bash
npx payload seed --file src/seed/email-templates.ts
```

---

## 🧪 Fase 6 - Testing (A Implementar)

### 1. Test Direct User Creation

```bash
curl -X POST http://localhost:3000/api/users/create \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "roles": ["role_id_here"]
  }'
```

**Expected Result**:
- User created in Keycloak
- Shadow user created in Portal (status: pending)
- Password reset email sent

### 2. Test Invitation Flow

```bash
# Step 1: Send Invitation
curl -X POST http://localhost:3000/api/users/invite \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invite@example.com",
    "name": "Invited User",
    "roles": ["role_id_here"]
  }'

# Step 2: Accept Invitation (user clicks link in email)
curl -X POST http://localhost:3000/api/users/accept-invitation \
  -H "Content-Type: application/json" \
  -d '{
    "token": "TOKEN_FROM_EMAIL",
    "password": "SecurePassword123!"
  }'
```

**Expected Result**:
- Invitation sent with token
- User accepts, account created
- Welcome email sent
- User can login

### 3. Test 2FA Sync

```bash
# 1. Enable 2FA in Keycloak for a user
# 2. User logs in via portal
# 3. Check Users collection: twoFactorEnabled should be true
```

---

## 📦 Dependencies to Install

```bash
cd /Users/jose.silva.lb/LBPAY/lb_bo_portal/backoffice-portal

# Keycloak Admin Client
npm install @keycloak/keycloak-admin-client

# Email
npm install nodemailer @types/nodemailer
```

---

## 🎯 Summary - Next Steps

1. **Instalar dependências** (nodemailer + keycloak-admin-client)
2. **Criar 3 endpoints** (create, invite, accept-invitation)
3. **Criar UI** (accept-invitation page)
4. **Configurar .env** (SMTP)
5. **Configurar Keycloak** (service account permissions + email)
6. **Criar seed** (default email templates)
7. **Implementar hook** (sync 2FA status)
8. **Testar fluxo completo** (create → invite → accept → login → 2FA)

---

**Próxima Sessão**: Implementar Fase 2 (Endpoints) + Fase 3 (UI)

**Tempo Estimado**: 3-4 horas para completar todas as fases

