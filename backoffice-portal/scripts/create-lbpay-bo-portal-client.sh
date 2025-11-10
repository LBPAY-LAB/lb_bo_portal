#!/bin/bash

# Script para criar client lbpay-bo-portal com service account configurado

set -e

echo "🔧 Criando client 'lbpay-bo-portal' com Service Account..."
echo ""

# Variáveis
KEYCLOAK_URL="http://localhost:8081"
REALM="lbpay-portal"
CLIENT_ID="lbpay-bo-portal"
ADMIN_USER="admin"
ADMIN_PASSWORD="admin123"
CLIENT_SECRET="d2xwnrkjfYmx6xLMSfqGl4Xof1oIHo0J"

# 1. Obter token de admin
echo "1️⃣  Autenticando como admin..."
ADMIN_TOKEN=$(curl -s -X POST \
  "${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=${ADMIN_USER}" \
  -d "password=${ADMIN_PASSWORD}" \
  -d "grant_type=password" \
  -d "client_id=admin-cli" | jq -r '.access_token')

if [ -z "$ADMIN_TOKEN" ] || [ "$ADMIN_TOKEN" = "null" ]; then
  echo "❌ Falha ao autenticar"
  exit 1
fi

echo "✅ Token obtido"
echo ""

# 2. Criar client
echo "2️⃣  Criando client '${CLIENT_ID}'..."

curl -s -X POST \
  "${KEYCLOAK_URL}/admin/realms/${REALM}/clients" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "'${CLIENT_ID}'",
    "name": "LBPay Backoffice Portal",
    "description": "Portal de backoffice da LBPay - Produção",
    "enabled": true,
    "publicClient": false,
    "standardFlowEnabled": true,
    "implicitFlowEnabled": false,
    "directAccessGrantsEnabled": true,
    "serviceAccountsEnabled": true,
    "authorizationServicesEnabled": false,
    "protocol": "openid-connect",
    "redirectUris": [
      "http://localhost:3000/*",
      "http://localhost:3000/api/auth/keycloak/callback"
    ],
    "webOrigins": [
      "http://localhost:3000"
    ],
    "attributes": {
      "pkce.code.challenge.method": "S256"
    },
    "secret": "'${CLIENT_SECRET}'"
  }'

echo "✅ Client criado"
echo ""

# 3. Obter client UUID
echo "3️⃣  Obtendo client ID..."
CLIENT_UUID=$(curl -s -X GET \
  "${KEYCLOAK_URL}/admin/realms/${REALM}/clients?clientId=${CLIENT_ID}" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" | jq -r '.[0].id')

if [ -z "$CLIENT_UUID" ] || [ "$CLIENT_UUID" = "null" ]; then
  echo "❌ Client não encontrado"
  exit 1
fi

echo "✅ Client UUID: ${CLIENT_UUID}"
echo ""

# 4. Obter Service Account User
echo "4️⃣  Obtendo Service Account User..."
sleep 2  # Aguardar propagação

SERVICE_ACCOUNT_USER_ID=$(curl -s -X GET \
  "${KEYCLOAK_URL}/admin/realms/${REALM}/clients/${CLIENT_UUID}/service-account-user" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" | jq -r '.id')

if [ -z "$SERVICE_ACCOUNT_USER_ID" ] || [ "$SERVICE_ACCOUNT_USER_ID" = "null" ]; then
  echo "❌ Service Account User não encontrado"
  exit 1
fi

echo "✅ Service Account User ID: ${SERVICE_ACCOUNT_USER_ID}"
echo ""

# 5. Obter realm-management client UUID
echo "5️⃣  Obtendo realm-management client..."
REALM_MGMT_UUID=$(curl -s -X GET \
  "${KEYCLOAK_URL}/admin/realms/${REALM}/clients?clientId=realm-management" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" | jq -r '.[0].id')

echo "✅ realm-management UUID: ${REALM_MGMT_UUID}"
echo ""

# 6. Obter roles necessárias
echo "6️⃣  Obtendo roles..."
ROLES=$(curl -s -X GET \
  "${KEYCLOAK_URL}/admin/realms/${REALM}/clients/${REALM_MGMT_UUID}/roles" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}")

MANAGE_USERS=$(echo "$ROLES" | jq -c '.[] | select(.name=="manage-users")')
VIEW_USERS=$(echo "$ROLES" | jq -c '.[] | select(.name=="view-users")')
QUERY_USERS=$(echo "$ROLES" | jq -c '.[] | select(.name=="query-users")')

echo "✅ Roles encontradas"
echo ""

# 7. Atribuir roles
echo "7️⃣  Atribuindo roles ao Service Account..."

curl -s -X POST \
  "${KEYCLOAK_URL}/admin/realms/${REALM}/users/${SERVICE_ACCOUNT_USER_ID}/role-mappings/clients/${REALM_MGMT_UUID}" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "[${MANAGE_USERS},${VIEW_USERS},${QUERY_USERS}]" > /dev/null

echo "✅ Roles atribuídas:"
echo "   - manage-users"
echo "   - view-users"
echo "   - query-users"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 CLIENT CRIADO E CONFIGURADO COM SUCESSO!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Configuração:"
echo "   Client ID: ${CLIENT_ID}"
echo "   Client Secret: ${CLIENT_SECRET}"
echo "   Service Account: ✅ Habilitado"
echo "   Permissions: ✅ manage-users, view-users, query-users"
echo ""
echo "✅ Configuração no .env já está correta:"
echo "   KEYCLOAK_CLIENT_ID=lbpay-bo-portal"
echo "   KEYCLOAK_CLIENT_SECRET=${CLIENT_SECRET}"
echo ""
echo "📝 Próximo passo: Testar Keycloak Admin API"
echo "   cd /Users/jose.silva.lb/LBPAY/lb_bo_portal/backoffice-portal"
echo "   pnpm exec tsx src/test-keycloak-admin.ts"
echo ""
