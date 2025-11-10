#!/bin/bash

echo "=== Step 1: Login via Keycloak ==="
curl -s -c /tmp/test-cookies.txt -b /tmp/test-cookies.txt \
  http://localhost:3002/api/auth/keycloak/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"jose.silva","password":"Test@123"}' | jq '{success, user: {id: .user.id, email: .user.email}}'

echo ""
echo "=== Step 2: Check /api/users/me with cookie ==="
curl -s -b /tmp/test-cookies.txt http://localhost:3002/api/users/me | jq .

echo ""
echo "=== Cookies saved: ==="
cat /tmp/test-cookies.txt | grep -v "^#"
