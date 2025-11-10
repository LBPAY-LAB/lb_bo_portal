# LB Portal Container - Docker Development Stack

Stack de desenvolvimento local completo para o projeto PayloadCMS Portal.

## Stack Incluída

- **PostgreSQL 15** (porta 5432) - Database principal
- **Keycloak 23** (porta 8080) - Identity & Access Management (SSO)
- **Redis 7** (porta 6379) - Cache e sessões

---

## Início Rápido

### 1. Configurar Variáveis de Ambiente

```bash
# Copiar template
cp .env.example .env

# Editar .env (opcional - valores default funcionam em dev)
nano .env
```

### 2. Iniciar Stack

```bash
# Iniciar todos os serviços
docker-compose up -d

# Ver logs em tempo real
docker-compose logs -f

# Ver apenas logs do PostgreSQL
docker-compose logs -f postgres
```

### 3. Verificar Status

```bash
# Verificar containers rodando
docker-compose ps

# Deve mostrar:
# NAME                  STATUS         PORTS
# portal_postgres       Up (healthy)   0.0.0.0:5432->5432/tcp
# portal_keycloak       Up (healthy)   0.0.0.0:8080->8080/tcp
# portal_redis          Up (healthy)   0.0.0.0:6379->6379/tcp
```

### 4. Acessar Serviços

| Serviço | URL | Credenciais |
|---------|-----|-------------|
| **Keycloak Admin Console** | http://localhost:8080 | admin / admin |
| **PostgreSQL** | localhost:5432 | portal_user / portal_dev_pass |
| **Redis** | localhost:6379 | (sem senha) |

---

## Databases Criados

O script `docker/postgres/init-db.sh` cria automaticamente:

1. **payload_dev**
   - Database principal do PayloadCMS
   - Extensions: uuid-ossp, pg_trgm
   - Schema: audit (para audit logs)

2. **keycloak_dev**
   - Database do Keycloak
   - Configuração padrão

---

## Keycloak - Realm Pré-Configurado

O arquivo `docker/keycloak/realm.json` importa automaticamente:

### Realm: `lbpay-portal`

**Client**:
- Client ID: `payload-portal`
- Client Secret: `**********` (ver Keycloak Admin Console)
- Redirect URIs: `http://localhost:3000/*`

**Roles** (8 roles):
- `super_admin` - Acesso total
- `admin` - Administração regional
- `operator` - Operações DICT
- `auditor` - Auditoria (read-only)
- `compliance` - Compliance
- `support` - Suporte
- `analyst` - Análise/BI
- `viewer` - Visualização

**Usuários de Teste**:

| Username | Password | Role | Region |
|----------|----------|------|--------|
| admin | admin123 (temp) | super_admin | * (todas) |
| operator.sudeste | operator123 (temp) | operator | sudeste |
| auditor | auditor123 (temp) | auditor | * (todas) |

**Grupos Regionais**:
- /Operations/Norte
- /Operations/Nordeste
- /Operations/Centro-Oeste
- /Operations/Sudeste
- /Operations/Sul

---

## Comandos Úteis

### Docker Compose

```bash
# Parar todos os serviços
docker-compose down

# Parar e remover volumes (CUIDADO: apaga dados!)
docker-compose down -v

# Reiniciar um serviço específico
docker-compose restart postgres

# Ver logs de um serviço
docker-compose logs -f keycloak

# Rebuild images (após mudanças no Dockerfile)
docker-compose up -d --build
```

### PostgreSQL

```bash
# Conectar ao database payload_dev
docker exec -it portal_postgres psql -U portal_user -d payload_dev

# Executar query
docker exec -it portal_postgres psql -U portal_user -d payload_dev -c "SELECT version();"

# Listar databases
docker exec -it portal_postgres psql -U portal_user -c "\l"

# Backup database
docker exec portal_postgres pg_dump -U portal_user payload_dev > backup.sql

# Restore database
cat backup.sql | docker exec -i portal_postgres psql -U portal_user payload_dev
```

### Keycloak

```bash
# Ver logs do Keycloak
docker-compose logs -f keycloak

# Exportar realm (backup)
docker exec -it portal_keycloak /opt/keycloak/bin/kc.sh export --dir /tmp --realm lbpay-portal
docker cp portal_keycloak:/tmp/lbpay-portal-realm.json ./backup-realm.json

# Reiniciar Keycloak
docker-compose restart keycloak
```

### Redis

```bash
# Conectar ao Redis CLI
docker exec -it portal_redis redis-cli

# Verificar chaves existentes
docker exec -it portal_redis redis-cli KEYS "*"

# Limpar cache
docker exec -it portal_redis redis-cli FLUSHDB

# Ver informações
docker exec -it portal_redis redis-cli INFO
```

---

## Health Checks

Cada serviço tem health check configurado:

```bash
# PostgreSQL
docker exec portal_postgres pg_isready -U portal_user

# Keycloak
curl http://localhost:8080/health/ready

# Redis
docker exec portal_redis redis-cli ping
# Deve retornar: PONG
```

---

## Troubleshooting

### PostgreSQL não inicia

```bash
# Verificar logs
docker-compose logs postgres

# Problemas comuns:
# 1. Porta 5432 já em uso
lsof -i :5432
# Solução: Parar PostgreSQL local ou mudar porta no .env

# 2. Permissões do volume
docker-compose down -v
docker volume rm portal_postgres_data
docker-compose up -d
```

### Keycloak demora para iniciar

```bash
# Normal: Keycloak leva ~60-90s para iniciar (start_period: 90s)
docker-compose logs -f keycloak

# Aguardar mensagem:
# "Keycloak 23.0.0 started in 45s"
```

### Redis connection refused

```bash
# Verificar se está rodando
docker-compose ps redis

# Testar conexão
docker exec -it portal_redis redis-cli ping

# Reiniciar
docker-compose restart redis
```

### Volumes com dados antigos

```bash
# Resetar TUDO (CUIDADO: apaga dados!)
docker-compose down -v
docker volume prune -f
docker-compose up -d
```

---

## Volumes (Dados Persistentes)

Dados são salvos em volumes nomeados:

```bash
# Listar volumes
docker volume ls | grep portal

# Inspecionar volume
docker volume inspect portal_postgres_data

# Backup de volume
docker run --rm -v portal_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-backup.tar.gz /data

# Restore de volume
docker run --rm -v portal_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres-backup.tar.gz -C /
```

---

## Network

Custom network: `portal_network` (subnet: 172.20.0.0/16)

```bash
# Inspecionar network
docker network inspect portal_network

# Ver containers conectados
docker network inspect portal_network --format '{{range .Containers}}{{.Name}}: {{.IPv4Address}}{{println}}{{end}}'
```

---

## Próximos Passos

Após stack rodando:

1. **Configurar PayloadCMS**:
   - Instalar dependências: `npm install`
   - Criar arquivo `payload.config.ts`
   - Configurar database URL (ver `.env.example`)

2. **Integrar com Keycloak**:
   - Obter Client Secret do Keycloak Admin Console
   - Atualizar `.env` com `KEYCLOAK_CLIENT_SECRET`
   - Implementar OAuth2 flow no PayloadCMS

3. **Testar Conexões**:
   - PostgreSQL: `psql -U portal_user -h localhost -d payload_dev`
   - Redis: `redis-cli -h localhost ping`
   - Keycloak: http://localhost:8080

---

## Segurança (Development)

**AVISO**: Esta configuração é APENAS para desenvolvimento local!

Para produção:
- Usar secrets management (AWS Secrets Manager, HashiCorp Vault)
- TLS/SSL obrigatório
- Senhas complexas geradas aleatoriamente
- Network policies restritivas
- Keycloak em modo produção (`start` ao invés de `start-dev`)
- PostgreSQL com SSL enforced
- Redis com autenticação (requirepass)

---

## Contato

**DevOps Lead**: AGENT-DEVOPS-012
**Slack**: #squad-portal-container
**Docs**: /Users/jose.silva.lb/LBPay/lb_bo_portal/docs/

---

**Última Atualização**: 2025-11-09
**Versão**: 1.0.0
