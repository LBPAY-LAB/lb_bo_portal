#!/bin/bash

# Test /api/users/me endpoint with valid session

echo "=== Testing /api/users/me endpoint ==="
echo ""

# First login to get the cookie
echo "1. Logging in via Keycloak..."
LOGIN_RESPONSE=$(curl -s -c cookies.txt http://localhost:3000/api/auth/keycloak/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"jose.silva","password":"Test@123"}')

echo "Login response:"
echo "$LOGIN_RESPONSE" | jq .

echo ""
echo "2. Checking cookie file..."
cat cookies.txt

echo ""
echo "3. Calling /api/users/me with cookie..."
ME_RESPONSE=$(curl -s -b cookies.txt http://localhost:3000/api/users/me)

echo "Response:"
echo "$ME_RESPONSE" | jq .

echo ""
echo "4. Checking response structure..."
echo "$ME_RESPONSE" | jq 'keys'

rm -f cookies.txt
