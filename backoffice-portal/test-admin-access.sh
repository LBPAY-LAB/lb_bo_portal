#!/bin/bash

echo "=== Testing Admin Access Flow ==="
echo ""

# Login primeiro
echo "1. Logging in..."
LOGIN_RESPONSE=$(curl -s -c cookies.txt http://localhost:3000/api/auth/keycloak/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"jose.silva","password":"Test@123"}')

echo "Login OK"
echo ""

# Verificar /api/users/me
echo "2. Checking /api/users/me..."
ME_RESPONSE=$(curl -s -b cookies.txt http://localhost:3000/api/users/me)
echo "$ME_RESPONSE" | jq '{has_user: (.user != null), has_token: (.token != null), has_exp: (.exp != null)}'

echo ""

# Tentar acessar /admin
echo "3. Accessing /admin page..."
ADMIN_RESPONSE=$(curl -s -b cookies.txt -w "\nHTTP_CODE:%{http_code}\nREDIRECT:%{redirect_url}\n" http://localhost:3000/admin)

echo "$ADMIN_RESPONSE" | tail -3

rm -f cookies.txt
