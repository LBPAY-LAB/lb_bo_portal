#!/bin/bash

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🔐 Keycloak Auto-Setup Script"
echo "=============================="
echo ""

# Configuration
KEYCLOAK_URL="http://localhost:8081"
ADMIN_USER="admin"
ADMIN_PASS="admin123"
REALM_NAME="lbpay-portal"
CLIENT_ID="payloadcms-portal"

# Wait for Keycloak to be ready
echo "⏳ Waiting for Keycloak to be ready..."
MAX_RETRIES=30
RETRY=0

while [ $RETRY -lt $MAX_RETRIES ]; do
  if curl -sf "$KEYCLOAK_URL/realms/master" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Keycloak is ready!${NC}"
    break
  fi
  RETRY=$((RETRY+1))
  echo "   Attempt $RETRY/$MAX_RETRIES..."
  sleep 2
done

if [ $RETRY -eq $MAX_RETRIES ]; then
  echo -e "${RED}❌ Keycloak did not start in time${NC}"
  exit 1
fi

echo ""

# Get admin access token
echo "🔑 Getting admin access token..."
ADMIN_TOKEN=$(curl -sf -X POST "$KEYCLOAK_URL/realms/master/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=$ADMIN_USER" \
  -d "password=$ADMIN_PASS" \
  -d 'grant_type=password' \
  -d 'client_id=admin-cli' | jq -r '.access_token')

if [ -z "$ADMIN_TOKEN" ] || [ "$ADMIN_TOKEN" == "null" ]; then
  echo -e "${RED}❌ Failed to get admin token${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Got admin token${NC}"
echo ""

# Create Realm
echo "🌐 Creating realm '$REALM_NAME'..."
REALM_EXISTS=$(curl -sf -X GET "$KEYCLOAK_URL/admin/realms/$REALM_NAME" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq -r '.id')

if [ "$REALM_EXISTS" != "null" ] && [ -n "$REALM_EXISTS" ]; then
  echo -e "${YELLOW}⚠️  Realm already exists, skipping...${NC}"
else
  curl -sf -X POST "$KEYCLOAK_URL/admin/realms" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"realm\": \"$REALM_NAME\",
      \"enabled\": true,
      \"displayName\": \"LBPay Portal\",
      \"displayNameHtml\": \"<b>LBPay</b> Portal\"
    }"

  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Realm created${NC}"
  else
    echo -e "${RED}❌ Failed to create realm${NC}"
    exit 1
  fi
fi

echo ""

# Create Client
echo "📦 Creating client '$CLIENT_ID'..."
CLIENT_EXISTS=$(curl -sf -X GET "$KEYCLOAK_URL/admin/realms/$REALM_NAME/clients?clientId=$CLIENT_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq -r '.[0].id')

if [ "$CLIENT_EXISTS" != "null" ] && [ -n "$CLIENT_EXISTS" ]; then
  echo -e "${YELLOW}⚠️  Client already exists${NC}"
  CLIENT_UUID="$CLIENT_EXISTS"
else
  curl -sf -X POST "$KEYCLOAK_URL/admin/realms/$REALM_NAME/clients" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"clientId\": \"$CLIENT_ID\",
      \"name\": \"PayloadCMS Portal\",
      \"description\": \"OAuth2 client for PayloadCMS backoffice portal\",
      \"enabled\": true,
      \"protocol\": \"openid-connect\",
      \"publicClient\": false,
      \"bearerOnly\": false,
      \"standardFlowEnabled\": true,
      \"directAccessGrantsEnabled\": true,
      \"serviceAccountsEnabled\": false,
      \"authorizationServicesEnabled\": false,
      \"redirectUris\": [\"http://localhost:3002/api/auth/keycloak/callback\"],
      \"webOrigins\": [\"http://localhost:3002\"],
      \"attributes\": {
        \"pkce.code.challenge.method\": \"S256\"
      }
    }"

  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Client created${NC}"

    # Get client UUID
    CLIENT_UUID=$(curl -sf -X GET "$KEYCLOAK_URL/admin/realms/$REALM_NAME/clients?clientId=$CLIENT_ID" \
      -H "Authorization: Bearer $ADMIN_TOKEN" | jq -r '.[0].id')
  else
    echo -e "${RED}❌ Failed to create client${NC}"
    exit 1
  fi
fi

echo ""

# Get Client Secret
echo "🔐 Getting client secret..."
CLIENT_SECRET=$(curl -sf -X GET "$KEYCLOAK_URL/admin/realms/$REALM_NAME/clients/$CLIENT_UUID/client-secret" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq -r '.value')

if [ -z "$CLIENT_SECRET" ] || [ "$CLIENT_SECRET" == "null" ]; then
  echo -e "${YELLOW}⚠️  No secret found, generating...${NC}"
  curl -sf -X POST "$KEYCLOAK_URL/admin/realms/$REALM_NAME/clients/$CLIENT_UUID/client-secret" \
    -H "Authorization: Bearer $ADMIN_TOKEN"

  CLIENT_SECRET=$(curl -sf -X GET "$KEYCLOAK_URL/admin/realms/$REALM_NAME/clients/$CLIENT_UUID/client-secret" \
    -H "Authorization: Bearer $ADMIN_TOKEN" | jq -r '.value')
fi

echo -e "${GREEN}✅ Client secret: $CLIENT_SECRET${NC}"
echo ""

# Create Roles
echo "👤 Creating realm roles..."
for ROLE in "super_admin" "admin" "operator"; do
  ROLE_EXISTS=$(curl -sf -X GET "$KEYCLOAK_URL/admin/realms/$REALM_NAME/roles/$ROLE" \
    -H "Authorization: Bearer $ADMIN_TOKEN" | jq -r '.name')

  if [ "$ROLE_EXISTS" == "$ROLE" ]; then
    echo -e "${YELLOW}⚠️  Role '$ROLE' already exists${NC}"
  else
    curl -sf -X POST "$KEYCLOAK_URL/admin/realms/$REALM_NAME/roles" \
      -H "Authorization: Bearer $ADMIN_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{
        \"name\": \"$ROLE\",
        \"description\": \"Role: $ROLE\"
      }"

    if [ $? -eq 0 ]; then
      echo -e "${GREEN}✅ Role '$ROLE' created${NC}"
    fi
  fi
done

echo ""

# Create Test User
echo "🧑 Creating test user 'jose.silva'..."
USER_ID=$(curl -sf -X GET "$KEYCLOAK_URL/admin/realms/$REALM_NAME/users?username=jose.silva" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq -r '.[0].id')

if [ "$USER_ID" != "null" ] && [ -n "$USER_ID" ]; then
  echo -e "${YELLOW}⚠️  User already exists${NC}"
else
  curl -sf -X POST "$KEYCLOAK_URL/admin/realms/$REALM_NAME/users" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "username": "jose.silva",
      "email": "jose.silva@lbpay.com.br",
      "firstName": "José",
      "lastName": "Silva",
      "enabled": true,
      "emailVerified": true
    }'

  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ User created${NC}"

    # Get user ID
    USER_ID=$(curl -sf -X GET "$KEYCLOAK_URL/admin/realms/$REALM_NAME/users?username=jose.silva" \
      -H "Authorization: Bearer $ADMIN_TOKEN" | jq -r '.[0].id')

    # Set password
    echo "🔑 Setting password..."
    curl -sf -X PUT "$KEYCLOAK_URL/admin/realms/$REALM_NAME/users/$USER_ID/reset-password" \
      -H "Authorization: Bearer $ADMIN_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "type": "password",
        "value": "Test@123",
        "temporary": false
      }'

    echo -e "${GREEN}✅ Password set${NC}"
  fi
fi

echo ""

# Assign role to user
if [ "$USER_ID" != "null" ] && [ -n "$USER_ID" ]; then
  echo "🎯 Assigning 'super_admin' role to user..."

  # Get role representation
  ROLE_REP=$(curl -sf -X GET "$KEYCLOAK_URL/admin/realms/$REALM_NAME/roles/super_admin" \
    -H "Authorization: Bearer $ADMIN_TOKEN")

  curl -sf -X POST "$KEYCLOAK_URL/admin/realms/$REALM_NAME/users/$USER_ID/role-mappings/realm" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d "[$ROLE_REP]"

  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Role assigned${NC}"
  fi
fi

echo ""
echo "=============================="
echo -e "${GREEN}🎉 Keycloak Setup Complete!${NC}"
echo "=============================="
echo ""
echo "📋 Configuration Details:"
echo "   Realm: $REALM_NAME"
echo "   Client ID: $CLIENT_ID"
echo "   Client Secret: $CLIENT_SECRET"
echo ""
echo "👤 Test User:"
echo "   Username: jose.silva"
echo "   Password: Test@123"
echo ""
echo "🔗 URLs:"
echo "   Keycloak Admin: http://localhost:8081/admin"
echo "   Realm URL: http://localhost:8081/realms/$REALM_NAME"
echo ""
echo "📝 Add to .env:"
echo "   KEYCLOAK_ISSUER=http://localhost:8081/realms/$REALM_NAME"
echo "   KEYCLOAK_CLIENT_ID=$CLIENT_ID"
echo "   KEYCLOAK_CLIENT_SECRET=$CLIENT_SECRET"
echo "   KEYCLOAK_REDIRECT_URI=http://localhost:3002/api/auth/keycloak/callback"
echo ""
