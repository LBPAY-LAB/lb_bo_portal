# Keycloak + PayloadCMS - Quick Start Guide

**TL;DR**: Integração Keycloak SSO com PayloadCMS Admin UI funcionando via shadow users e custom `/api/users/me` endpoint.

---

## 🚀 Quick Setup

### 1. Variáveis de Ambiente

```bash
# .env
KEYCLOAK_ISSUER=http://localhost:8080/realms/lbpay-portal
KEYCLOAK_CLIENT_ID=payloadcms-portal
KEYCLOAK_CLIENT_SECRET=<your-secret>
DATABASE_URI=postgresql://user:password@localhost:5432/payloadcms_dev
PAYLOAD_SECRET=<your-secret-min-32-chars>
```

### 2. Keycloak Client Config

- Client authentication: **ON**
- Direct access grants: **ON** ✅ (CRITICAL)
- Valid redirect URIs: `http://localhost:3000/*`

### 3. Arquivos Criados

```
src/
├── app/
│   ├── (payload)/
│   │   ├── login/page.tsx                    # Custom login page
│   │   └── api/users/me/route.ts             # Custom /me endpoint ✅
│   └── api/auth/keycloak/login/route.ts      # Keycloak integration
├── middleware.ts                              # Redirect /admin/login → /login
└── collections/Users.ts                       # Added keycloak_sub field
```

### 4. Test

```bash
# Run test script
./test-complete-auth-flow.sh

# Expected output:
# ✅ Login successful
# ✅ /api/users/me returns {user, token, exp}
```

---

## 🔑 Key Concepts

### Shadow Users

- Users authenticate via Keycloak
- Synced to PayloadCMS DB as "shadow users"
- `keycloak_sub` = unique identifier (JWT `sub` claim)
- `password` = hashed `keycloak_sub` (for programmatic login)

### Authentication Flow

```
User → /login → Keycloak → JWT tokens → Shadow user sync →
payload.login() → Set cookie → /admin accessible
```

### Critical Files

1. **`/api/auth/keycloak/login`**:
   - Authenticates with Keycloak
   - Creates/updates shadow user
   - Calls `payload.login()`
   - Sets `payload-token` cookie

2. **`/api/users/me`** (custom):
   - Reads `payload-token` cookie
   - Returns `{user, token, exp}` (Admin UI expects this format)
   - **MUST** be in `src/app/(payload)/api/users/me/route.ts` (route priority)

---

## 🐛 Common Issues

### Issue: /api/users/me returns `{user: null}`

**Fix**: Check if custom endpoint exists at `src/app/(payload)/api/users/me/route.ts` (NOT `src/app/api/users/me/route.ts`)

### Issue: payload.login() fails with "incorrect password"

**Fix**: Ensure shadow user password is set to `keycloak_sub`:

```typescript
await payload.create({
  data: {
    keycloak_sub: sub,
    password: sub, // ✅ CRITICAL
  }
})
```

### Issue: Admin UI shows "unauthenticated: true"

**Fix**: Verify `/api/users/me` returns `{user, token, exp}` (not just `{user}`)

---

## 📋 Checklist

- [ ] Keycloak client configured with Direct Access Grants
- [ ] Environment variables set
- [ ] `keycloak_sub` field added to Users collection
- [ ] Custom `/api/users/me` endpoint created in `(payload)` route group
- [ ] Test script passes (`./test-complete-auth-flow.sh`)
- [ ] Browser login works (`http://localhost:3000/login`)

---

## 📚 Full Documentation

See [KEYCLOAK_PAYLOADCMS_INTEGRATION.md](./KEYCLOAK_PAYLOADCMS_INTEGRATION.md) for complete documentation.

---

**Status**: ✅ Production Ready
**Version**: 1.0
**Last Updated**: 2025-01-10
