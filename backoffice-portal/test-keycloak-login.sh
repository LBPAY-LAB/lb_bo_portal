#!/bin/bash

echo "=== Testing Keycloak Login ==="
curl -s http://localhost:3000/api/auth/keycloak/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"jose.silva","password":"Test@123"}' | jq .
