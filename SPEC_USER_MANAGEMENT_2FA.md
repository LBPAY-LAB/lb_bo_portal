# User Management & 2FA Integration - Technical Specification

**Project**: LB Portal Container (PayloadCMS)
**Feature**: User Invitation, Direct Creation, and 2FA with Keycloak
**Version**: 1.0
**Date**: 2025-01-10

---

## 1. Executive Summary

This specification extends the Portal Container to support comprehensive user management with deep Keycloak integration:

- **Email-based user invitations** with time-limited tokens
- **Direct user creation** by administrators (without invitation)
- **2FA/MFA integration** leveraging Keycloak's OTP configuration
- **Bidirectional sync** between Portal and Keycloak

### Business Value

- **Self-service onboarding**: Reduce admin workload with invitation system
- **Security**: 2FA/MFA enforcement via Keycloak policies
- **Compliance**: Audit trail for user creation and invitations
- **Flexibility**: Support both invitation-based and direct user creation

---

## 2. Current Architecture

### 2.1 Existing Components

**Users Collection** (`src/collections/Users.ts`):
```typescript
{
  email: string (from Keycloak)
  name: string (from Keycloak)
  keycloak_sub: string (unique, indexed) // Links to Keycloak user ID
  roles: Relationship[] // RBAC roles
  password: string (random, not used for auth)
}
```

**Keycloak Strategy** (`src/auth/keycloak-strategy.ts`):
- Just-in-Time (JIT) user provisioning
- Auto-creates shadow users on first Keycloak login
- Syncs: `sub`, `email`, `given_name`, `family_name`, `preferred_username`

**Authentication Flow**:
1. User clicks "Login via Keycloak"
2. OAuth2 redirect to Keycloak
3. User authenticates in Keycloak
4. Callback with JWT token
5. Keycloak Strategy validates token
6. Shadow user created/updated in Portal
7. Session created in Portal

### 2.2 Limitations

- ❌ No way to create users from Portal UI
- ❌ No invitation mechanism
- ❌ No 2FA support (Keycloak has it, but Portal doesn't use it)
- ❌ One-way sync (Keycloak → Portal only)

---

## 3. Proposed Architecture

### 3.1 New Collections

#### 3.1.1 UserInvitations Collection

**Purpose**: Track email invitations sent to new users

**Schema**:
```typescript
{
  slug: 'user-invitations',
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true, // One active invitation per email
      index: true,
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'roles',
      type: 'relationship',
      relationTo: 'roles',
      hasMany: true,
      required: true, // Admin must assign at least one role
    },
    {
      name: 'token',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        readOnly: true,
        hidden: true, // Don't show in UI
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Accepted', value: 'accepted' },
        { label: 'Expired', value: 'expired' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
    },
    {
      name: 'expiresAt',
      type: 'date',
      required: true,
      admin: {
        description: 'Invitation expires 48h after creation',
      },
    },
    {
      name: 'invitedBy',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'Admin who sent the invitation',
      },
    },
    {
      name: 'acceptedAt',
      type: 'date',
      admin: {
        description: 'When user accepted invitation',
      },
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional metadata (IP, user-agent, etc.)',
      },
    },
  ],
  timestamps: true,
}
```

**Access Control**:
- Read: SuperAdmin, Admin
- Create: SuperAdmin, Admin
- Update: System only (status changes)
- Delete: SuperAdmin only

**Hooks**:
- `beforeChange`: Generate secure token (crypto.randomBytes)
- `beforeChange`: Set `expiresAt` = now + 48h
- `afterChange`: Send invitation email (if status = pending)
- `beforeRead`: Auto-expire if past `expiresAt`

#### 3.1.2 Extend Users Collection

**New Fields**:
```typescript
{
  name: 'userType',
  type: 'select',
  required: true,
  defaultValue: 'keycloak_sso',
  options: [
    { label: 'Keycloak SSO', value: 'keycloak_sso' },
    { label: 'Portal Managed', value: 'portal_managed' },
    { label: 'Invited', value: 'invited' },
  ],
  admin: {
    description: 'How user was created',
  },
}
{
  name: 'invitationId',
  type: 'relationship',
  relationTo: 'user-invitations',
  admin: {
    description: 'Original invitation (if created via invitation)',
  },
}
{
  name: 'twoFactorEnabled',
  type: 'checkbox',
  defaultValue: false,
  admin: {
    description: 'Synced from Keycloak OTP configuration',
    readOnly: true,
  },
}
{
  name: 'lastLoginAt',
  type: 'date',
  admin: {
    description: 'Last successful login',
    readOnly: true,
  },
}
{
  name: 'status',
  type: 'select',
  required: true,
  defaultValue: 'active',
  options: [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Suspended', value: 'suspended' },
    { label: 'Pending Activation', value: 'pending' },
  ],
}
```

### 3.2 Keycloak Admin API Integration

**New Service**: `src/lib/keycloak-admin.ts`

```typescript
import KcAdminClient from '@keycloak/keycloak-admin-client'

export class KeycloakAdminService {
  private client: KcAdminClient

  constructor() {
    this.client = new KcAdminClient({
      baseUrl: process.env.KEYCLOAK_ISSUER!.replace('/realms/lbpay-portal', ''),
      realmName: 'lbpay-portal',
    })
  }

  // Authenticate admin client
  async authenticate(): Promise<void> {
    await this.client.auth({
      grantType: 'client_credentials',
      clientId: process.env.KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
    })
  }

  // Create user in Keycloak
  async createUser(data: {
    email: string
    firstName: string
    lastName: string
    enabled: boolean
    emailVerified: boolean
    requiredActions?: string[] // e.g., ['UPDATE_PASSWORD']
  }): Promise<string> {
    await this.authenticate()

    const user = await this.client.users.create({
      realm: 'lbpay-portal',
      username: data.email,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      enabled: data.enabled,
      emailVerified: data.emailVerified,
      requiredActions: data.requiredActions || [],
    })

    return user.id! // Keycloak user ID
  }

  // Set temporary password (forces reset on first login)
  async setTemporaryPassword(userId: string, password: string): Promise<void> {
    await this.authenticate()

    await this.client.users.resetPassword({
      realm: 'lbpay-portal',
      id: userId,
      credential: {
        temporary: true,
        type: 'password',
        value: password,
      },
    })
  }

  // Send password reset email (Keycloak built-in)
  async sendPasswordResetEmail(userId: string): Promise<void> {
    await this.authenticate()

    await this.client.users.executeActionsEmail({
      realm: 'lbpay-portal',
      id: userId,
      actions: ['UPDATE_PASSWORD'],
      lifespan: 43200, // 12 hours
    })
  }

  // Check if user has 2FA enabled
  async getTwoFactorStatus(userId: string): Promise<boolean> {
    await this.authenticate()

    const credentials = await this.client.users.getCredentials({
      realm: 'lbpay-portal',
      id: userId,
    })

    return credentials.some((cred) => cred.type === 'otp')
  }

  // Assign role to user
  async assignRole(userId: string, roleName: string): Promise<void> {
    await this.authenticate()

    const roles = await this.client.roles.find({
      realm: 'lbpay-portal',
    })

    const role = roles.find((r) => r.name === roleName)

    if (role) {
      await this.client.users.addRealmRoleMappings({
        realm: 'lbpay-portal',
        id: userId,
        roles: [{ id: role.id!, name: role.name! }],
      })
    }
  }
}

export const keycloakAdmin = new KeycloakAdminService()
```

**Required NPM Package**:
```bash
npm install @keycloak/keycloak-admin-client
```

**Environment Variables** (`.env`):
```bash
# Existing
KEYCLOAK_ISSUER=http://localhost:8081/realms/lbpay-portal
KEYCLOAK_CLIENT_ID=payloadcms-portal
KEYCLOAK_CLIENT_SECRET=d2xwnrkjfYmx6xLMSfqGl4Xof1oIHo0J
KEYCLOAK_REDIRECT_URI=http://localhost:3000/api/auth/keycloak/callback

# New - Email configuration for invitations
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@lbpay.com.br
SMTP_PASSWORD=your-app-password
EMAIL_FROM=Portal LBPAY <noreply@lbpay.com.br>
```

### 3.3 API Endpoints

#### 3.3.1 Direct User Creation

**Endpoint**: `POST /api/users/create`

**Request Body**:
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "roles": ["role_id_1", "role_id_2"],
  "sendPasswordResetEmail": true
}
```

**Flow**:
1. Validate admin permissions (only SuperAdmin/Admin)
2. Validate email uniqueness (check Keycloak + Portal)
3. Parse name → `firstName`, `lastName`
4. Create user in Keycloak with `requiredActions: ['UPDATE_PASSWORD']`
5. Get Keycloak user ID (`sub`)
6. Create shadow user in Portal with:
   - `keycloak_sub` = Keycloak ID
   - `userType` = 'portal_managed'
   - `status` = 'pending' (until password is set)
7. Send password reset email via Keycloak
8. Return success response

**Response**:
```json
{
  "success": true,
  "user": {
    "id": "portal_user_id",
    "email": "user@example.com",
    "keycloak_sub": "keycloak_user_id",
    "status": "pending"
  },
  "message": "User created. Password reset email sent."
}
```

**Handler** (`src/app/api/users/create/route.ts`):
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { keycloakAdmin } from '@/lib/keycloak-admin'

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config: await config })
    const { user } = await payload.auth({ headers: req.headers })

    // 1. Check permissions
    if (!user || !user.roles?.some(r => ['super_admin', 'admin'].includes(r.slug))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // 2. Parse request
    const body = await req.json()
    const { email, name, roles, sendPasswordResetEmail = true } = body

    // 3. Validate
    if (!email || !name || !roles || roles.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: email, name, roles' },
        { status: 400 }
      )
    }

    // 4. Check if user already exists in Portal
    const existingUser = await payload.find({
      collection: 'users',
      where: { email: { equals: email } },
      limit: 1,
    })

    if (existingUser.docs.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // 5. Parse name
    const nameParts = name.trim().split(' ')
    const firstName = nameParts[0]
    const lastName = nameParts.slice(1).join(' ') || firstName

    // 6. Create user in Keycloak
    const keycloakUserId = await keycloakAdmin.createUser({
      email,
      firstName,
      lastName,
      enabled: true,
      emailVerified: false,
      requiredActions: ['VERIFY_EMAIL', 'UPDATE_PASSWORD'],
    })

    // 7. Create shadow user in Portal
    const newUser = await payload.create({
      collection: 'users',
      data: {
        email,
        name,
        keycloak_sub: keycloakUserId,
        roles,
        userType: 'portal_managed',
        status: 'pending',
        password: Math.random().toString(36) + Math.random().toString(36), // Random
      },
    })

    // 8. Send password reset email via Keycloak
    if (sendPasswordResetEmail) {
      await keycloakAdmin.sendPasswordResetEmail(keycloakUserId)
    }

    // 9. Audit log
    await payload.create({
      collection: 'audit-logs',
      data: {
        user: user.id,
        action: 'user_created',
        resource: 'users',
        resourceId: newUser.id,
        metadata: {
          email,
          userType: 'portal_managed',
          keycloak_sub: keycloakUserId,
        },
      },
    })

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        keycloak_sub: keycloakUserId,
        status: newUser.status,
      },
      message: sendPasswordResetEmail
        ? 'User created. Password reset email sent.'
        : 'User created.',
    })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
```

#### 3.3.2 Send User Invitation

**Endpoint**: `POST /api/users/invite`

**Request Body**:
```json
{
  "email": "newuser@example.com",
  "name": "Jane Smith",
  "roles": ["role_id_1"]
}
```

**Flow**:
1. Validate admin permissions
2. Validate email uniqueness (check Portal + Keycloak)
3. Create invitation record with:
   - Secure random token (32 bytes)
   - `expiresAt` = now + 48h
   - `status` = 'pending'
4. Send invitation email with link: `{PORTAL_URL}/accept-invitation?token={token}`
5. Return success response

**Email Template** (HTML):
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invitation to LBPAY Portal</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #2563EB; color: white; padding: 20px; text-align: center;">
    <h1>LBPAY Portal</h1>
  </div>

  <div style="padding: 30px; background: #f9fafb;">
    <h2>Hi {{name}},</h2>

    <p>You've been invited to join the <strong>LBPAY Portal</strong> by {{inviter_name}}.</p>

    <p>Please click the button below to accept the invitation and create your account:</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="{{invitation_link}}"
         style="background: #2563EB; color: white; padding: 12px 24px;
                text-decoration: none; border-radius: 4px; display: inline-block;">
        Accept Invitation
      </a>
    </div>

    <p style="color: #6B7280; font-size: 14px;">
      This invitation will expire in 48 hours ({{expires_at}}).
    </p>

    <p style="color: #6B7280; font-size: 14px;">
      If you did not expect this invitation, please ignore this email.
    </p>
  </div>

  <div style="padding: 20px; text-align: center; color: #9CA3AF; font-size: 12px;">
    <p>&copy; 2025 LBPAY. All rights reserved.</p>
  </div>
</body>
</html>
```

**Handler** (`src/app/api/users/invite/route.ts`):
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import crypto from 'crypto'
import { sendInvitationEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config: await config })
    const { user } = await payload.auth({ headers: req.headers })

    // 1. Check permissions
    if (!user || !user.roles?.some(r => ['super_admin', 'admin'].includes(r.slug))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // 2. Parse request
    const body = await req.json()
    const { email, name, roles } = body

    // 3. Validate
    if (!email || !name || !roles || roles.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: email, name, roles' },
        { status: 400 }
      )
    }

    // 4. Check if user already exists
    const existingUser = await payload.find({
      collection: 'users',
      where: { email: { equals: email } },
      limit: 1,
    })

    if (existingUser.docs.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // 5. Check if pending invitation exists
    const existingInvitation = await payload.find({
      collection: 'user-invitations',
      where: {
        and: [
          { email: { equals: email } },
          { status: { equals: 'pending' } },
        ],
      },
      limit: 1,
    })

    if (existingInvitation.docs.length > 0) {
      return NextResponse.json(
        { error: 'Pending invitation already exists for this email' },
        { status: 409 }
      )
    }

    // 6. Generate secure token
    const token = crypto.randomBytes(32).toString('hex')

    // 7. Calculate expiration (48 hours)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 48)

    // 8. Create invitation
    const invitation = await payload.create({
      collection: 'user-invitations',
      data: {
        email,
        name,
        roles,
        token,
        status: 'pending',
        expiresAt: expiresAt.toISOString(),
        invitedBy: user.id,
      },
    })

    // 9. Send email
    const invitationLink = `${process.env.NEXT_PUBLIC_SERVER_URL}/accept-invitation?token=${token}`

    await sendInvitationEmail({
      to: email,
      name,
      inviterName: user.name || user.email,
      invitationLink,
      expiresAt: expiresAt.toLocaleString('pt-BR'),
    })

    // 10. Audit log
    await payload.create({
      collection: 'audit-logs',
      data: {
        user: user.id,
        action: 'invitation_sent',
        resource: 'user-invitations',
        resourceId: invitation.id,
        metadata: { email, roles },
      },
    })

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        expiresAt: invitation.expiresAt,
      },
      message: 'Invitation sent successfully',
    })
  } catch (error) {
    console.error('Error sending invitation:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
```

#### 3.3.3 Accept Invitation

**Endpoint**: `POST /api/users/accept-invitation`

**Request Body**:
```json
{
  "token": "invitation_token_here",
  "password": "NewSecurePassword123!"
}
```

**Flow**:
1. Validate token (exists, not expired, status = pending)
2. Create user in Keycloak with provided password
3. Create shadow user in Portal with `userType` = 'invited'
4. Update invitation status to 'accepted'
5. Send welcome email
6. Return success + auto-login token

**Handler** (`src/app/api/users/accept-invitation/route.ts`):
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { keycloakAdmin } from '@/lib/keycloak-admin'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config: await config })

    // 1. Parse request
    const body = await req.json()
    const { token, password } = body

    // 2. Validate
    if (!token || !password) {
      return NextResponse.json(
        { error: 'Missing required fields: token, password' },
        { status: 400 }
      )
    }

    // 3. Find invitation
    const invitations = await payload.find({
      collection: 'user-invitations',
      where: {
        and: [
          { token: { equals: token } },
          { status: { equals: 'pending' } },
        ],
      },
      limit: 1,
    })

    if (invitations.docs.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation' },
        { status: 404 }
      )
    }

    const invitation = invitations.docs[0]

    // 4. Check expiration
    if (new Date(invitation.expiresAt) < new Date()) {
      // Auto-expire
      await payload.update({
        collection: 'user-invitations',
        id: invitation.id,
        data: { status: 'expired' },
      })

      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 410 }
      )
    }

    // 5. Parse name
    const nameParts = invitation.name.trim().split(' ')
    const firstName = nameParts[0]
    const lastName = nameParts.slice(1).join(' ') || firstName

    // 6. Create user in Keycloak
    const keycloakUserId = await keycloakAdmin.createUser({
      email: invitation.email,
      firstName,
      lastName,
      enabled: true,
      emailVerified: true,
    })

    // 7. Set password in Keycloak
    await keycloakAdmin.setTemporaryPassword(keycloakUserId, password)

    // 8. Create shadow user in Portal
    const newUser = await payload.create({
      collection: 'users',
      data: {
        email: invitation.email,
        name: invitation.name,
        keycloak_sub: keycloakUserId,
        roles: invitation.roles,
        userType: 'invited',
        status: 'active',
        invitationId: invitation.id,
        password: Math.random().toString(36) + Math.random().toString(36), // Random
      },
    })

    // 9. Update invitation status
    await payload.update({
      collection: 'user-invitations',
      id: invitation.id,
      data: {
        status: 'accepted',
        acceptedAt: new Date().toISOString(),
      },
    })

    // 10. Send welcome email
    await sendWelcomeEmail({
      to: invitation.email,
      name: invitation.name,
    })

    // 11. Audit log
    await payload.create({
      collection: 'audit-logs',
      data: {
        user: newUser.id,
        action: 'invitation_accepted',
        resource: 'user-invitations',
        resourceId: invitation.id,
        metadata: {
          email: invitation.email,
          keycloak_sub: keycloakUserId,
        },
      },
    })

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
      },
      message: 'Account created successfully. You can now login.',
      redirectTo: '/login',
    })
  } catch (error) {
    console.error('Error accepting invitation:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### 3.4 2FA Integration with Keycloak

#### 3.4.1 Keycloak OTP Configuration

**Admin Console Setup** (Manual):
1. Keycloak Admin Console → Realm Settings → Security Defenses → Brute Force Detection (Enable)
2. Authentication → Required Actions → Configure OTP (Enable)
3. Authentication → Flows → Browser → Browser Forms → OTP Form (Required)

**Enforcement Levels**:
- **Optional**: Users can choose to enable 2FA
- **Required**: All users must configure 2FA on first login
- **Conditional**: Based on role or IP address

#### 3.4.2 Sync 2FA Status to Portal

**Hook**: `src/hooks/sync-2fa-status.ts`

```typescript
import { CollectionAfterLoginHook } from 'payload'
import { keycloakAdmin } from '@/lib/keycloak-admin'

export const sync2FAStatus: CollectionAfterLoginHook = async ({ req, user }) => {
  try {
    // Only for Keycloak users
    if (!user.keycloak_sub) {
      return user
    }

    // Check 2FA status in Keycloak
    const has2FA = await keycloakAdmin.getTwoFactorStatus(user.keycloak_sub)

    // Update Portal shadow user
    if (user.twoFactorEnabled !== has2FA) {
      await req.payload.update({
        collection: 'users',
        id: user.id,
        data: {
          twoFactorEnabled: has2FA,
          lastLoginAt: new Date().toISOString(),
        },
      })

      console.log(`✅ 2FA status synced for user ${user.email}: ${has2FA}`)
    }

    return user
  } catch (error) {
    console.error('Error syncing 2FA status:', error)
    return user
  }
}
```

**Register Hook** in `src/collections/Users.ts`:
```typescript
import { sync2FAStatus } from '@/hooks/sync-2fa-status'

export const Users: CollectionConfig = {
  // ...
  hooks: {
    afterLogin: [sync2FAStatus],
  },
}
```

#### 3.4.3 Enforce 2FA Based on Role

**Keycloak Policy** (Admin Console):
- Create authentication flow: "Browser with Conditional OTP"
- Add conditional: "Condition - User Role"
- Configure: "If user has role 'admin' OR 'super_admin', require OTP"

**Portal UI Indicator** (`src/components/admin/UserInfo.tsx`):
```typescript
export const UserInfo = () => {
  const { user } = useAuth()

  return (
    <div style={{...}}>
      <div style={{...}}>
        <span>{getDisplayName()}</span>
        <span>{user.email}</span>
        {user.twoFactorEnabled && (
          <span style={{ fontSize: '10px', color: '#10B981' }}>
            🔒 2FA Enabled
          </span>
        )}
      </div>
    </div>
  )
}
```

---

## 4. Implementation Phases

### Phase 1: Infrastructure (2-3 days)

**Tasks**:
- [ ] Install `@keycloak/keycloak-admin-client` NPM package
- [ ] Create `KeycloakAdminService` class
- [ ] Create `user-invitations` collection
- [ ] Extend `users` collection with new fields
- [ ] Setup email service (Nodemailer)
- [ ] Create email templates (invitation, welcome, password reset)

**Validation**:
```bash
# Test Keycloak Admin API connection
curl -X POST http://localhost:8081/realms/lbpay-portal/protocol/openid-connect/token \
  -d "grant_type=client_credentials" \
  -d "client_id=payloadcms-portal" \
  -d "client_secret=YOUR_SECRET"
```

### Phase 2: Direct User Creation (2 days)

**Tasks**:
- [ ] Implement `POST /api/users/create` endpoint
- [ ] Test user creation in Keycloak
- [ ] Test shadow user creation in Portal
- [ ] Test password reset email
- [ ] Add RBAC checks

**Validation**:
```bash
# Test direct user creation
curl -X POST http://localhost:3000/api/users/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "roles": ["role_id"]
  }'
```

### Phase 3: Invitation System (3 days)

**Tasks**:
- [ ] Implement `POST /api/users/invite` endpoint
- [ ] Implement `POST /api/users/accept-invitation` endpoint
- [ ] Create invitation acceptance page UI
- [ ] Test invitation email delivery
- [ ] Test token expiration logic
- [ ] Test duplicate invitation prevention

**Validation**:
```bash
# Test invitation flow
curl -X POST http://localhost:3000/api/users/invite \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invite@example.com",
    "name": "Invited User",
    "roles": ["role_id"]
  }'
```

### Phase 4: 2FA Integration (2 days)

**Tasks**:
- [ ] Configure Keycloak OTP in Admin Console
- [ ] Implement `getTwoFactorStatus` in KeycloakAdminService
- [ ] Create `sync2FAStatus` hook
- [ ] Update UserInfo component with 2FA badge
- [ ] Test 2FA enforcement for admin roles

**Validation**:
- Login as admin → Should require OTP
- Login as regular user → OTP optional
- Check Portal UI shows "🔒 2FA Enabled" badge

### Phase 5: Testing & Documentation (2 days)

**Tasks**:
- [ ] E2E tests for invitation flow
- [ ] E2E tests for direct creation flow
- [ ] E2E tests for 2FA sync
- [ ] Update API documentation
- [ ] Update user guide
- [ ] Security audit

---

## 5. Security Considerations

### 5.1 Invitation Tokens

- ✅ Use `crypto.randomBytes(32)` for token generation (256-bit entropy)
- ✅ Store hashed version in database (optional, current design stores plaintext for simplicity)
- ✅ Single-use tokens (status changes to 'accepted' after use)
- ✅ Time-limited (48h expiration)
- ✅ Rate limiting on `/api/users/invite` endpoint (10 invitations/hour per admin)

### 5.2 Password Reset

- ✅ Use Keycloak's built-in email action (`UPDATE_PASSWORD`)
- ✅ 12-hour expiration on reset links
- ✅ Invalidate after use
- ✅ Audit log all password reset requests

### 5.3 2FA Enforcement

- ✅ Keycloak handles OTP validation (TOTP, Google Authenticator)
- ✅ Portal syncs status, doesn't implement OTP itself
- ✅ Admin roles require 2FA (Keycloak policy)
- ✅ Backup codes generated by Keycloak

### 5.4 Audit Trail

**Events to Log**:
- `user_created` (direct creation)
- `invitation_sent`
- `invitation_accepted`
- `invitation_expired`
- `password_reset_requested`
- `2fa_enabled`
- `2fa_disabled`

---

## 6. User Interface Updates

### 6.1 Admin Panel - Users List

**New Columns**:
- Email
- Name
- Status (badge: Active, Pending, Suspended)
- User Type (badge: SSO, Portal Managed, Invited)
- 2FA Status (🔒 icon if enabled)
- Last Login
- Actions (Edit, Suspend, Delete)

**New Buttons**:
- "Invite User" (opens modal)
- "Create User" (opens modal)

### 6.2 Invitation Acceptance Page

**Route**: `/accept-invitation?token={token}`

**UI** (`src/app/accept-invitation/page.tsx`):
```tsx
'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function AcceptInvitationPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/users/accept-invitation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (response.ok) {
        // Success! Redirect to login
        router.push('/login?message=Account created! Please login.')
      } else {
        setError(data.error || 'Failed to accept invitation')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Accept Invitation
        </h1>
        <p className="text-gray-600 mb-6">
          Create your password to activate your account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password (min 8 characters)"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>
      </div>
    </div>
  )
}
```

---

## 7. Testing Strategy

### 7.1 Unit Tests

**Files**:
- `src/lib/keycloak-admin.test.ts` - Keycloak Admin API
- `src/app/api/users/create/route.test.ts` - Direct creation endpoint
- `src/app/api/users/invite/route.test.ts` - Invitation endpoint
- `src/app/api/users/accept-invitation/route.test.ts` - Accept endpoint

### 7.2 Integration Tests

**Scenarios**:
1. Direct user creation → Keycloak user exists → Shadow user created → Email sent
2. Invitation → Email sent → Token valid → User accepts → Keycloak user created
3. Invitation → Token expires → Accept fails with 410 Gone
4. Duplicate invitation → Returns 409 Conflict
5. 2FA sync → User enables OTP in Keycloak → Portal shows badge

### 7.3 E2E Tests (Playwright)

**Test Cases**:
```typescript
test('Admin can invite user via email', async ({ page }) => {
  // Login as admin
  await page.goto('/login')
  await page.fill('[name="email"]', 'admin@lbpay.com.br')
  await page.fill('[name="password"]', 'admin123')
  await page.click('button[type="submit"]')

  // Navigate to Users
  await page.click('a[href="/admin/collections/users"]')

  // Click "Invite User"
  await page.click('button:has-text("Invite User")')

  // Fill invitation form
  await page.fill('[name="email"]', 'newuser@example.com')
  await page.fill('[name="name"]', 'New User')
  await page.selectOption('[name="roles"]', 'operator')
  await page.click('button:has-text("Send Invitation")')

  // Verify success message
  await expect(page.locator('text=Invitation sent successfully')).toBeVisible()
})

test('User can accept invitation and create account', async ({ page }) => {
  // Simulate clicking email link
  const token = 'mock_invitation_token_here'
  await page.goto(`/accept-invitation?token=${token}`)

  // Fill password form
  await page.fill('[name="password"]', 'SecurePassword123!')
  await page.fill('[name="confirmPassword"]', 'SecurePassword123!')
  await page.click('button:has-text("Create Account")')

  // Verify redirect to login
  await expect(page).toHaveURL(/\/login/)
  await expect(page.locator('text=Account created')).toBeVisible()
})
```

---

## 8. Migration Plan

### 8.1 Database Migration

**File**: `src/migrations/YYYYMMDD_add_user_invitations.ts`

```typescript
import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  // Migration runs automatically via Payload schema changes
  // No manual SQL needed, Drizzle handles it

  console.log('✅ Added user-invitations collection')
  console.log('✅ Extended users collection with new fields')
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  // Rollback not recommended (data loss)
  console.warn('⚠️ Rollback will delete user-invitations collection')
}
```

### 8.2 Keycloak Configuration

**Manual Steps** (Admin Console):

1. **Create Service Account for Admin API**:
   - Clients → payloadcms-portal → Settings
   - Enable "Service Accounts Enabled"
   - Save
   - Service Account Roles → Add "realm-management" roles:
     - `manage-users`
     - `view-users`
     - `create-client`

2. **Configure OTP (Optional)**:
   - Authentication → Required Actions → Configure OTP (Enable)
   - Realm Settings → Tokens → SSO Session Idle = 30 minutes

3. **Email Settings** (Required for password reset):
   - Realm Settings → Email
   - From: `noreply@lbpay.com.br`
   - Host: `smtp.gmail.com`
   - Port: `587`
   - Enable SSL: No
   - Enable StartTLS: Yes
   - Authentication: Yes
   - Username: `noreply@lbpay.com.br`
   - Password: `{SMTP_PASSWORD}`

---

## 9. Rollout Plan

### Week 1: Infrastructure & Direct Creation

**Mon-Tue**: Setup Keycloak Admin API + Email service
**Wed-Thu**: Implement direct user creation endpoint
**Fri**: Testing + Code review

### Week 2: Invitation System

**Mon-Tue**: Implement invitation endpoints
**Wed**: UI for invitation acceptance page
**Thu-Fri**: Testing + Bug fixes

### Week 3: 2FA Integration & Polish

**Mon**: Configure Keycloak OTP
**Tue**: Implement 2FA sync hook
**Wed**: UI updates (badges, indicators)
**Thu**: E2E testing
**Fri**: Documentation + Deployment

---

## 10. Success Metrics

**KPIs**:
- ✅ **Invitation Acceptance Rate**: >80% within 48h
- ✅ **Failed Invitations**: <5% (expired, invalid email)
- ✅ **Direct User Creation Time**: <30 seconds (from click to email sent)
- ✅ **2FA Adoption Rate**: 100% for admins, >50% for operators
- ✅ **Audit Log Coverage**: 100% of user management actions logged

**Monitoring**:
- Keycloak user count vs Portal shadow user count (should match)
- Invitation expiration rate (optimize expiration time if >10% expire)
- Password reset email delivery rate (>95%)

---

## 11. Next Steps

After reviewing this specification, we will proceed with:

1. **Phase 1 Implementation** - Setup infrastructure
2. **Iterative Testing** - Validate each endpoint as we build
3. **UI Development** - Create admin interfaces in parallel
4. **Security Audit** - Before production deployment

**Ready to begin implementation?** 🚀

