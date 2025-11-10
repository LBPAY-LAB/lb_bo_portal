#!/bin/bash

# Script para atribuir roles admin e user ao usuário jose.silva@lbpay.com.br no Keycloak

set -e

KEYCLOAK_URL="http://localhost:8081"
REALM="lbpay"
USERNAME="jose.silva@lbpay.com.br"
ADMIN_USER="admin"
ADMIN_PASSWORD="admin"

echo "🔐 Autenticando no Keycloak..."

# Obter token de acesso do admin
ACCESS_TOKEN=$(curl -s -X POST "$KEYCLOAK_URL/realms/master/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=$ADMIN_USER" \
  -d "password=$ADMIN_PASSWORD" \
  -d "grant_type=password" \
  -d "client_id=admin-cli" | jq -r '.access_token')

if [ "$ACCESS_TOKEN" == "null" ] || [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ Erro ao obter token de acesso"
  exit 1
fi

echo "✅ Token obtido com sucesso"

# Buscar o usuário pelo username (email)
echo "🔍 Buscando usuário $USERNAME..."

USER_ID=$(curl -s -X GET "$KEYCLOAK_URL/admin/realms/$REALM/users?username=$USERNAME&exact=true" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq -r '.[0].id')

if [ "$USER_ID" == "null" ] || [ -z "$USER_ID" ]; then
  echo "❌ Usuário não encontrado: $USERNAME"
  exit 1
fi

echo "✅ Usuário encontrado: ID = $USER_ID"

# Buscar as roles disponíveis no realm
echo "🔍 Buscando roles disponíveis..."

ADMIN_ROLE=$(curl -s -X GET "$KEYCLOAK_URL/admin/realms/$REALM/roles/admin" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

USER_ROLE=$(curl -s -X GET "$KEYCLOAK_URL/admin/realms/$REALM/roles/user" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

ADMIN_ROLE_ID=$(echo $ADMIN_ROLE | jq -r '.id')
ADMIN_ROLE_NAME=$(echo $ADMIN_ROLE | jq -r '.name')

USER_ROLE_ID=$(echo $USER_ROLE | jq -r '.id')
USER_ROLE_NAME=$(echo $USER_ROLE | jq -r '.name')

if [ "$ADMIN_ROLE_ID" == "null" ] || [ "$USER_ROLE_ID" == "null" ]; then
  echo "❌ Roles 'admin' ou 'user' não encontradas no realm $REALM"
  echo "Vou criar as roles primeiro..."

  # Criar role admin se não existir
  if [ "$ADMIN_ROLE_ID" == "null" ]; then
    echo "📝 Criando role 'admin'..."
    curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM/roles" \
      -H "Authorization: Bearer $ACCESS_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "admin",
        "description": "Administrator role with full access"
      }'

    # Buscar novamente
    ADMIN_ROLE=$(curl -s -X GET "$KEYCLOAK_URL/admin/realms/$REALM/roles/admin" \
      -H "Authorization: Bearer $ACCESS_TOKEN")
    ADMIN_ROLE_ID=$(echo $ADMIN_ROLE | jq -r '.id')
    ADMIN_ROLE_NAME=$(echo $ADMIN_ROLE | jq -r '.name')
    echo "✅ Role 'admin' criada"
  fi

  # Criar role user se não existir
  if [ "$USER_ROLE_ID" == "null" ]; then
    echo "📝 Criando role 'user'..."
    curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM/roles" \
      -H "Authorization: Bearer $ACCESS_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "user",
        "description": "Standard user role"
      }'

    # Buscar novamente
    USER_ROLE=$(curl -s -X GET "$KEYCLOAK_URL/admin/realms/$REALM/roles/user" \
      -H "Authorization: Bearer $ACCESS_TOKEN")
    USER_ROLE_ID=$(echo $USER_ROLE | jq -r '.id')
    USER_ROLE_NAME=$(echo $USER_ROLE | jq -r '.name')
    echo "✅ Role 'user' criada"
  fi
fi

echo "✅ Roles encontradas:"
echo "   - admin: $ADMIN_ROLE_ID"
echo "   - user: $USER_ROLE_ID"

# Atribuir as roles ao usuário
echo "📝 Atribuindo roles ao usuário..."

ROLES_PAYLOAD=$(cat <<EOF
[
  {
    "id": "$ADMIN_ROLE_ID",
    "name": "$ADMIN_ROLE_NAME"
  },
  {
    "id": "$USER_ROLE_ID",
    "name": "$USER_ROLE_NAME"
  }
]
EOF
)

curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM/users/$USER_ID/role-mappings/realm" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$ROLES_PAYLOAD"

echo ""
echo "✅ Roles atribuídas com sucesso!"

# Verificar as roles do usuário
echo ""
echo "🔍 Verificando roles do usuário..."

USER_ROLES=$(curl -s -X GET "$KEYCLOAK_URL/admin/realms/$REALM/users/$USER_ID/role-mappings/realm" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq -r '.[].name' | sort)

echo "✅ Roles atuais do usuário $USERNAME:"
echo "$USER_ROLES" | while read role; do
  echo "   - $role"
done

echo ""
echo "🎉 Concluído!"