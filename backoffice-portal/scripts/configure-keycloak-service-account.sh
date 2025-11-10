#!/bin/bash

# Script para configurar Service Account do Keycloak via API REST
# Sem precisar da UI Admin

set -e

echo "🔧 Configurando Service Account do Keycloak via API..."
echo ""

# Variáveis
KEYCLOAK_URL="http://localhost:8081"
REALM="lbpay-portal"
CLIENT_ID="lbpay-bo-portal"
ADMIN_USER="admin"
ADMIN_PASSWORD="admin123"

# 1. Obter token de admin
echo "1️⃣ Autenticando como admin..."
ADMIN_TOKEN=$(curl -s -X POST \
  "${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=${ADMIN_USER}" \
  -d "password=${ADMIN_PASSWORD}" \
  -d "grant_type=password" \
  -d "client_id=admin-cli" | jq -r '.access_token')

if [ -z "$ADMIN_TOKEN" ] || [ "$ADMIN_TOKEN" = "null" ]; then
  echo "❌ Falha ao autenticar. Verifique se Keycloak está rodando e credenciais corretas."
  exit 1
fi

echo "✅ Token obtido com sucesso!"
echo ""

# 2. Obter ID do client
echo "2️⃣ Buscando client '${CLIENT_ID}'..."
CLIENT_UUID=$(curl -s -X GET \
  "${KEYCLOAK_URL}/admin/realms/${REALM}/clients?clientId=${CLIENT_ID}" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" | jq -r '.[0].id')

if [ -z "$CLIENT_UUID" ] || [ "$CLIENT_UUID" = "null" ]; then
  echo "❌ Client '${CLIENT_ID}' não encontrado no realm '${REALM}'"
  exit 1
fi

echo "✅ Client encontrado: ${CLIENT_UUID}"
echo ""

# 3. Verificar configuração atual
echo "3️⃣ Verificando configuração atual do client..."
CURRENT_CONFIG=$(curl -s -X GET \
  "${KEYCLOAK_URL}/admin/realms/${REALM}/clients/${CLIENT_UUID}" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}")

SERVICE_ACCOUNTS_ENABLED=$(echo "$CURRENT_CONFIG" | jq -r '.serviceAccountsEnabled')
echo "   Service Accounts Enabled: ${SERVICE_ACCOUNTS_ENABLED}"
echo ""

# 4. Habilitar Service Account (se necessário)
if [ "$SERVICE_ACCOUNTS_ENABLED" != "true" ]; then
  echo "4️⃣ Habilitando Service Account..."

  curl -s -X PUT \
    "${KEYCLOAK_URL}/admin/realms/${REALM}/clients/${CLIENT_UUID}" \
    -H "Authorization: Bearer ${ADMIN_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
      "serviceAccountsEnabled": true,
      "authorizationServicesEnabled": false,
      "publicClient": false
    }' > /dev/null

  echo "✅ Service Account habilitado!"
else
  echo "4️⃣ Service Account já está habilitado ✅"
fi
echo ""

# 5. Obter service account user ID
echo "5️⃣ Obtendo Service Account User..."
SERVICE_ACCOUNT_USER=$(curl -s -X GET \
  "${KEYCLOAK_URL}/admin/realms/${REALM}/clients/${CLIENT_UUID}/service-account-user" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}")

SERVICE_ACCOUNT_USER_ID=$(echo "$SERVICE_ACCOUNT_USER" | jq -r '.id')

if [ -z "$SERVICE_ACCOUNT_USER_ID" ] || [ "$SERVICE_ACCOUNT_USER_ID" = "null" ]; then
  echo "❌ Falha ao obter Service Account User"
  exit 1
fi

echo "✅ Service Account User ID: ${SERVICE_ACCOUNT_USER_ID}"
echo ""

# 6. Obter realm-management client ID
echo "6️⃣ Buscando client 'realm-management'..."
REALM_MGMT_CLIENT_UUID=$(curl -s -X GET \
  "${KEYCLOAK_URL}/admin/realms/${REALM}/clients?clientId=realm-management" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" | jq -r '.[0].id')

if [ -z "$REALM_MGMT_CLIENT_UUID" ] || [ "$REALM_MGMT_CLIENT_UUID" = "null" ]; then
  echo "❌ Client 'realm-management' não encontrado"
  exit 1
fi

echo "✅ realm-management client: ${REALM_MGMT_CLIENT_UUID}"
echo ""

# 7. Obter roles disponíveis
echo "7️⃣ Obtendo roles de 'realm-management'..."
AVAILABLE_ROLES=$(curl -s -X GET \
  "${KEYCLOAK_URL}/admin/realms/${REALM}/clients/${REALM_MGMT_CLIENT_UUID}/roles" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}")

# Extrair IDs dos roles necessários
MANAGE_USERS_ROLE=$(echo "$AVAILABLE_ROLES" | jq -r '.[] | select(.name=="manage-users")')
VIEW_USERS_ROLE=$(echo "$AVAILABLE_ROLES" | jq -r '.[] | select(.name=="view-users")')
QUERY_USERS_ROLE=$(echo "$AVAILABLE_ROLES" | jq -r '.[] | select(.name=="query-users")')

if [ -z "$MANAGE_USERS_ROLE" ]; then
  echo "❌ Role 'manage-users' não encontrada"
  exit 1
fi

echo "✅ Roles encontradas:"
echo "   - manage-users"
echo "   - view-users"
echo "   - query-users"
echo ""

# 8. Atribuir roles ao service account
echo "8️⃣ Atribuindo roles ao Service Account..."

curl -s -X POST \
  "${KEYCLOAK_URL}/admin/realms/${REALM}/users/${SERVICE_ACCOUNT_USER_ID}/role-mappings/clients/${REALM_MGMT_CLIENT_UUID}" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "[
    ${MANAGE_USERS_ROLE},
    ${VIEW_USERS_ROLE},
    ${QUERY_USERS_ROLE}
  ]" > /dev/null

echo "✅ Roles atribuídas com sucesso!"
echo ""

# 9. Verificar roles atribuídas
echo "9️⃣ Verificando roles atribuídas..."
ASSIGNED_ROLES=$(curl -s -X GET \
  "${KEYCLOAK_URL}/admin/realms/${REALM}/users/${SERVICE_ACCOUNT_USER_ID}/role-mappings/clients/${REALM_MGMT_CLIENT_UUID}" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}")

echo "✅ Roles atribuídas ao Service Account:"
echo "$ASSIGNED_ROLES" | jq -r '.[].name' | sed 's/^/   - /'
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 CONFIGURAÇÃO CONCLUÍDA COM SUCESSO!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Próximo passo: Testar Keycloak Admin API"
echo "  cd /Users/jose.silva.lb/LBPAY/lb_bo_portal/backoffice-portal"
echo "  pnpm exec tsx src/test-keycloak-admin.ts"
echo ""
