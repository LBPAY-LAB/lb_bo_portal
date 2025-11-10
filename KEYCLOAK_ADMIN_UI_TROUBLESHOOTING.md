# Keycloak Admin UI - Troubleshooting

**Problema**: Admin UI fica em branco ou mostra "Loading the Admin UI" indefinidamente

---

## 🔍 Diagnóstico

### 1. Verificar se Keycloak está rodando

```bash
docker ps | grep keycloak
```

**Expected**: Container `portal_keycloak` com status "Up" (pode estar "unhealthy", ok por enquanto)

### 2. Verificar logs do Keycloak

```bash
docker logs portal_keycloak --tail 50
```

**Procure por**:
- ✅ "Keycloak 23.0.7 on JVM ... started in X.Xs. Listening on: http://0.0.0.0:8080"
- ❌ Erros de banco de dados
- ❌ Erros de memória (OutOfMemoryError)

### 3. Testar se o backend está respondendo

```bash
# Health check
curl -s http://localhost:8081/health/ready

# Verificar realm
curl -s http://localhost:8081/realms/lbpay-portal | jq .realm
```

**Expected**:
- Health: Status 200
- Realm: `"lbpay-portal"`

---

## 🛠️ Soluções

### Solução 1: Limpar cache do navegador

1. Abra Developer Tools (F12)
2. Clique com botão direito no ícone de "Refresh"
3. Selecione "Empty Cache and Hard Reload"

### Solução 2: Tentar outro navegador

Keycloak Admin UI funciona melhor em:
- ✅ Chrome/Edge (recomendado)
- ✅ Firefox
- ⚠️ Safari (pode ter problemas)

### Solução 3: Verificar erros de JavaScript

1. Abra Developer Tools (F12)
2. Vá para aba **Console**
3. Procure por erros (texto em vermelho)

**Erros comuns**:

#### A. CORS Error
```
Access to fetch at 'http://localhost:8081/...' has been blocked by CORS policy
```

**Solução**: Verificar se Keycloak está configurado corretamente para aceitar requisições de localhost

#### B. 404 Not Found
```
Failed to load resource: the server responded with a status of 404 (Not Found)
```

**Solução**: Reiniciar Keycloak
```bash
docker restart portal_keycloak
```

#### C. Network Error
```
Failed to fetch
```

**Solução**: Keycloak pode não ter iniciado completamente. Aguarde 30s e tente novamente.

### Solução 4: Restart completo do Keycloak

```bash
# Parar container
docker stop portal_keycloak

# Remover container (dados persistem no volume)
docker rm portal_keycloak

# Recriar e iniciar
cd /Users/jose.silva.lb/LBPAY/lb_bo_portal
docker-compose up -d keycloak

# Aguardar 30 segundos
sleep 30

# Verificar logs
docker logs portal_keycloak --tail 20
```

### Solução 5: Acessar via hostname

Às vezes `localhost` causa problemas. Tente:

```
http://127.0.0.1:8081/admin
```

---

## 🌐 URLs Corretas

### ❌ URLs INCORRETAS (não funcionam):
- ~~http://localhost:8081/admin/master/console/~~ (abre em branco)
- ~~http://localhost:8081/admin/console~~ (404)

### ✅ URLs CORRETAS:

#### 1. Login Admin (RECOMENDADO):
```
http://localhost:8081/admin
```
- Faça login com `admin` / `admin`
- Depois troque realm para `lbpay-portal` (dropdown no topo esquerdo)

#### 2. Acesso direto ao realm (após login):
```
http://localhost:8081/admin/master/console/#/lbpay-portal/clients
```

---

## 🐛 Problemas Conhecidos

### Keycloak 23.x + Desenvolvimento

**Sintoma**: Admin UI demora muito para carregar ou fica em branco

**Causa**: Modo desenvolvimento (`--start-dev`) pode ter problemas com cache

**Solução temporária**: Use modo produção no docker-compose

Edite `docker-compose.yml`:

```yaml
keycloak:
  command:
    - start-dev  # ← TROCAR POR:
    - start      # Modo produção (mais estável)
    - --hostname=localhost
    - --http-enabled=true
```

**Recrie o container**:
```bash
docker-compose down
docker-compose up -d
```

---

## 📊 Verificação Final

Após aplicar as soluções, verifique:

**1. Keycloak está UP e HEALTHY**:
```bash
docker ps | grep keycloak
```

**2. Admin UI carrega**:
- Acesse: http://localhost:8081/admin
- Login com `admin` / `admin`
- Veja se a página principal do admin carrega (não fica em branco)

**3. Realm lbpay-portal existe**:
- Clique no dropdown "master" (topo esquerdo)
- Veja se `lbpay-portal` aparece na lista

**4. Client lbpay-bo-portal existe**:
- Troque para realm `lbpay-portal`
- Menu lateral: Clients
- Procure por `lbpay-bo-portal`

---

## 🆘 Ainda não funciona?

### Opção 1: Usar API diretamente (sem UI)

Você pode configurar tudo via API REST:

```bash
# Ver guia completo
cat KEYCLOAK_SERVICE_ACCOUNT_SETUP.md
```

### Opção 2: Recri ar ambiente Keycloak do zero

```bash
# Backup (opcional)
docker exec portal_keycloak /opt/keycloak/bin/kc.sh export --dir /tmp/keycloak-export

# Parar e remover tudo
docker-compose down -v  # ⚠️ REMOVE DADOS

# Recriar
docker-compose up -d

# Reconfigurar realm
./scripts/setup-keycloak.sh
```

---

**Última atualização**: 2025-01-10
**Keycloak Version**: 23.0.7
