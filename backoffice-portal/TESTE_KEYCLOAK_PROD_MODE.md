# Testar Keycloak Admin UI em Modo Produção

O Admin UI do Keycloak 23.x tem problemas conhecidos em modo desenvolvimento (start-dev).
A API REST funciona perfeitamente, mas a interface web pode ficar em loading infinito.

## Status Atual

✅ **API REST**: 100% funcional
- Realm `lbpay-portal` criado
- Client `lbpay-bo-portal` configurado
- Service Account com permissões corretas
- Teste passou: `pnpm exec tsx src/test-keycloak-admin.ts`

❌ **Admin UI**: Loading infinito (problema conhecido do Keycloak 23.x dev mode)

---

## Opção 1: Continuar SEM Admin UI (RECOMENDADO)

**Você NÃO precisa da interface web!** Tudo já está configurado via API.

**Gerenciamento disponível via:**
1. Scripts bash (já criados em `scripts/`)
2. PayloadCMS Admin UI (quando implementarmos)
3. CLI do Keycloak (dentro do container)

**Pular para próximo passo:**
```bash
cd /Users/jose.silva.lb/LBPAY/lb_bo_portal/backoffice-portal
pnpm exec tsx src/seed/email-templates-seed.ts
```

---

## Opção 2: Testar Modo Produção (pode resolver Admin UI)

### Passo 1: Parar containers atuais

```bash
cd /Users/jose.silva.lb/LBPAY/lb_bo_portal/backoffice-portal
docker-compose down
```

### Passo 2: Subir em modo produção

```bash
docker-compose -f docker-compose.prod-mode.yml up -d
```

### Passo 3: Aguardar 30 segundos

```bash
sleep 30
```

### Passo 4: Recriar client lbpay-bo-portal

```bash
./scripts/create-lbpay-bo-portal-client.sh
```

### Passo 5: Testar Admin UI

Abra: http://localhost:8081/admin

- User: `admin`
- Password: `admin123`

---

## Opção 3: Usar CLI do Keycloak

```bash
# Autenticar
docker exec -it portal_keycloak /opt/keycloak/bin/kcadm.sh config credentials \
  --server http://localhost:8080 \
  --realm master \
  --user admin \
  --password admin123

# Listar clients do realm lbpay-portal
docker exec -it portal_keycloak /opt/keycloak/bin/kcadm.sh get clients \
  -r lbpay-portal \
  --fields clientId,serviceAccountsEnabled

# Ver detalhes do client lbpay-bo-portal
docker exec -it portal_keycloak /opt/keycloak/bin/kcadm.sh get clients \
  -r lbpay-portal \
  -q clientId=lbpay-bo-portal
```

---

## Recomendação

**Opção 1** é a melhor escolha:
- API funciona 100%
- Não depende de UI bugada
- Mais rápido para desenvolvimento
- Gerenciamento via PayloadCMS é melhor UX

**Próximos passos:**
1. Seed email templates
2. Implementar endpoints de user management
3. Criar UI no PayloadCMS Admin

---

**Última atualização**: 2025-01-10
**Status**: API 100% funcional | Admin UI opcional
