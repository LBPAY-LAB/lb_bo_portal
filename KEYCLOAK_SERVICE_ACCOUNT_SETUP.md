# Keycloak Service Account Configuration - lbpay-bo-portal

**Client**: `lbpay-bo-portal`
**Realm**: `lbpay-portal`
**Purpose**: Enable PayloadCMS to manage Keycloak users via Admin API

---

## 🎯 Overview

The portal needs **service account** credentials to:
- Create users in Keycloak programmatically
- Sync user data (email, name, roles)
- Manage passwords (set, reset)
- Check 2FA/OTP status
- Assign realm roles

---

## 📋 Configuration Steps

### 1. Access Keycloak Admin Console

```bash
URL: http://localhost:8081/admin
Realm: lbpay-portal
User: admin
Password: admin
```

### 2. Enable Service Account for Client

**Navigation**: Clients → `lbpay-bo-portal` → Settings

1. **Scroll to "Capability config" section**
2. **Enable**: ✅ **Client authentication** (this was previously called "Confidential")
3. **Enable**: ✅ **Service accounts roles**
4. Click **Save**

**Visual Verification**:
- "Credentials" tab should now be visible
- "Service account roles" tab should now be visible

### 3. Grant Admin Permissions to Service Account

**Navigation**: Clients → `lbpay-bo-portal` → **Service account roles** tab

**Step 1**: Select client roles
- Client: Select **realm-management** from dropdown

**Step 2**: Assign roles (from "Available roles" → "Assigned roles")
- ✅ **manage-users** - Create, update, delete users
- ✅ **view-users** - Read user data
- ✅ **query-users** - Search users by email
- ✅ **impersonation** (Optional) - Admin can impersonate users

**Step 3**: Click **Assign** or **Add selected**

**Visual Verification**:
You should see all 4 roles in "Assigned roles" section.

### 4. Verify Client Secret

**Navigation**: Clients → `lbpay-bo-portal` → **Credentials** tab

**Action**: Copy the **Client Secret**

**Update .env**:
```bash
KEYCLOAK_CLIENT_SECRET=<paste-secret-here>
```

**Example**:
```bash
KEYCLOAK_CLIENT_SECRET=d2xwnrkjfYmx6xLMSfqGl4Xof1oIHo0J
```

---

## ✅ Verification

### Test 1: Service Account Authentication

Run the test script to verify Keycloak Admin API access:

```bash
cd /Users/jose.silva.lb/LBPAY/lb_bo_portal/backoffice-portal
pnpm exec tsx src/test-keycloak-admin.ts
```

**Expected Output**:
```
🧪 Testing Keycloak Admin API...

✅ Keycloak Admin Client initialized: { baseUrl: 'http://localhost:8081', realm: 'lbpay-portal' }
Test 1: Authenticating with Keycloak...
✅ Authentication successful

Test 2: Looking up non-existent user...
✅ getUserByEmail: User not found (expected)

🎉 All tests passed!
```

### Test 2: Check Assigned Roles via API

```bash
# Get service account user ID
KEYCLOAK_USER_ID=$(curl -s \
  -d "client_id=lbpay-bo-portal" \
  -d "client_secret=d2xwnrkjfYmx6xLMSfqGl4Xof1oIHo0J" \
  -d "grant_type=client_credentials" \
  "http://localhost:8081/realms/lbpay-portal/protocol/openid-connect/token" | \
  jq -r '.access_token')

# List assigned roles (should include manage-users, view-users, query-users)
echo "Service account has admin permissions if you see manage-users, view-users, query-users below:"
echo $KEYCLOAK_USER_ID | cut -d'.' -f2 | base64 -d 2>/dev/null | jq
```

---

## 🔒 Security Notes

### Production Recommendations

1. **Rotate Client Secret** periodically
2. **Use separate service accounts** for different environments (dev, staging, prod)
3. **Limit permissions** - Only assign necessary roles
4. **Monitor API usage** - Track service account activity
5. **Use HTTPS** - Never send credentials over HTTP in production

### Keycloak Best Practices

- **Service Account Naming**: Use descriptive names (e.g., `lbpay-bo-portal-api`)
- **Audit Logs**: Enable Keycloak event logging
- **IP Whitelisting**: Restrict service account access by IP (if possible)
- **Minimum Permissions**: Start with minimal roles, add as needed

---

## 🐛 Troubleshooting

### Error: "Failed to authenticate with Keycloak Admin API"

**Possible Causes**:
1. Service accounts roles not enabled
2. Incorrect client secret in .env
3. Keycloak not running
4. Wrong realm name

**Solution**:
```bash
# Check Keycloak is running
docker ps | grep keycloak

# Verify client secret matches
cat .env | grep KEYCLOAK_CLIENT_SECRET

# Check Keycloak logs
docker logs portal_keycloak --tail 50
```

### Error: "Insufficient permissions" when creating users

**Cause**: Missing `manage-users` role

**Solution**: Go back to Step 3 and verify `manage-users` is in "Assigned roles"

### Error: "Client not found"

**Cause**: Client ID mismatch

**Solution**: Verify client name is exactly `lbpay-bo-portal` (case-sensitive)

---

## 📚 Reference

**Keycloak Admin REST API Docs**:
- https://www.keycloak.org/docs-api/23.0/rest-api/

**Client Credentials Grant**:
- https://www.keycloak.org/docs/latest/securing_apps/#_client_credentials_grant

**Service Accounts**:
- https://www.keycloak.org/docs/latest/server_admin/#_service_accounts

---

**Last Updated**: 2025-01-10
**Keycloak Version**: 23.0.7
**Status**: ✅ Ready for Configuration
