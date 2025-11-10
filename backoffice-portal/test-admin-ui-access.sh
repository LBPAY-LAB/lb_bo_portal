#!/bin/bash

echo "======================================"
echo " Keycloak + PayloadCMS Auth Test"
echo "======================================"
echo ""

# Step 1: Login
echo "1. Login via Keycloak..."
LOGIN_RESPONSE=$(curl -s -c /tmp/admin-test-cookies.txt -b /tmp/admin-test-cookies.txt \
  http://localhost:3002/api/auth/keycloak/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"jose.silva","password":"Test@123"}')

SUCCESS=$(echo "$LOGIN_RESPONSE" | jq -r '.success')
if [ "$SUCCESS" = "true" ]; then
  echo "✅ Login successful"
  echo "$LOGIN_RESPONSE" | jq '{user: {id: .user.id, email: .user.email, name: .user.name}}'
else
  echo "❌ Login failed"
  echo "$LOGIN_RESPONSE" | jq .
  exit 1
fi

echo ""

# Step 2: Check /api/users/me
echo "2. Verify /api/users/me endpoint..."
ME_RESPONSE=$(curl -s -b /tmp/admin-test-cookies.txt http://localhost:3002/api/users/me)
HAS_USER=$(echo "$ME_RESPONSE" | jq -r '.user != null')
HAS_TOKEN=$(echo "$ME_RESPONSE" | jq -r '.token != null')
HAS_EXP=$(echo "$ME_RESPONSE" | jq -r '.exp != null')

if [ "$HAS_USER" = "true" ] && [ "$HAS_TOKEN" = "true" ] && [ "$HAS_EXP" = "true" ]; then
  echo "✅ /api/users/me returns user, token, and exp"
  echo "$ME_RESPONSE" | jq '{user: {id: .user.id, email: .user.email, collection: .user.collection}, has_token: true, exp: .exp}'
else
  echo "❌ /api/users/me response invalid"
  echo "$ME_RESPONSE" | jq .
  exit 1
fi

echo ""

# Step 3: Try to access /admin
echo "3. Access /admin page..."
ADMIN_RESPONSE=$(curl -s -b /tmp/admin-test-cookies.txt -w "\n%{http_code}" http://localhost:3002/admin)
HTTP_CODE=$(echo "$ADMIN_RESPONSE" | tail -n1)
BODY=$(echo "$ADMIN_RESPONSE" | head -n -1)

echo "HTTP Status: $HTTP_CODE"

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Admin page accessible (HTTP 200)"

  # Check if the body contains "unauthenticated": true
  if echo "$BODY" | grep -q '"unauthenticated":true'; then
    echo "❌ But page shows unauthenticated:true"
    echo "$BODY" | grep -o '"unauthenticated":[^,}]*'
    exit 1
  else
    echo "✅ Page does not show unauthenticated:true"

    # Check for user email in the page
    if echo "$BODY" | grep -q 'jose.silva@lbpay.com.br'; then
      echo "✅ User email found in page - AUTHENTICATION WORKING!"
    else
      echo "⚠️  User email not found in page (may need to check further)"
    fi
  fi
elif [ "$HTTP_CODE" = "307" ] || [ "$HTTP_CODE" = "302" ]; then
  echo "❌ Admin page redirects (HTTP $HTTP_CODE)"
  REDIRECT=$(echo "$BODY" | grep -i "location:" || echo "Unknown")
  echo "Redirect to: $REDIRECT"
  exit 1
else
  echo "❌ Unexpected HTTP status: $HTTP_CODE"
  exit 1
fi

echo ""
echo "======================================"
echo " ✅ ALL TESTS PASSED!"
echo "======================================"

# Cleanup
rm -f /tmp/admin-test-cookies.txt
