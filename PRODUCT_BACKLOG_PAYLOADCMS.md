# 📋 PRODUCT BACKLOG - PORTAL CONTAINER PAYLOADCMS

**Projeto:** Portal Container LBPay
**Plataforma:** PayloadCMS 3.x + Next.js 15
**Versão:** 1.0
**Data:** 09 de Janeiro de 2025

---

## 📊 ESTATÍSTICAS GLOBAIS

| Métrica | Valor |
|---------|-------|
| **Total de User Stories** | 35 stories |
| **Total de Story Points** | 200 pts |
| **Total de Épicos** | 8 épicos |
| **Total de NFRs** | 5 NFRs |
| **Duração Total** | 10 semanas (5 sprints x 2 semanas) |
| **Velocity Target** | 40 pts/sprint |

---

## 🎯 ÉPICOS

### EPIC-01: Infraestrutura e Setup (40 pts)
**Objetivo:** Provisionar ambiente de desenvolvimento e produção completo

**User Stories:**
- US-001: Setup de repositório e estrutura de projeto
- US-002: Configurar PostgreSQL e migrações
- US-003: Configurar Keycloak realm e clients
- US-004: Criar Docker Compose para stack local
- US-005: Configurar CI/CD pipeline (GitHub Actions)

---

### EPIC-02: Autenticação e Autorização (35 pts)
**Objetivo:** Implementar SSO via Keycloak com shadow users

**User Stories:**
- US-006: Implementar Keycloak OAuth2 strategy
- US-007: Criar collection Users com shadow users
- US-008: Implementar sincronização automática Keycloak → Payload
- US-009: Criar hook afterLogin para audit logs
- US-010: Implementar logout e invalidação de sessão

---

### EPIC-03: RBAC e Permissions (30 pts)
**Objetivo:** Sistema de permissões granular (collection, field, document-level)

**User Stories:**
- US-011: Criar collection Roles
- US-012: Criar collection Permissions
- US-013: Implementar RBAC collection-level
- US-014: Implementar RBAC field-level
- US-015: Criar helpers de permissões (frontend)

---

### EPIC-04: Gestão de Aplicações (25 pts)
**Objetivo:** CRUD de aplicações externas com configuração de iframe

**User Stories:**
- US-016: Criar collection Applications
- US-017: Implementar CRUD de aplicações via Payload Admin
- US-018: Configurar iframe sandbox e CSP
- US-019: Implementar health checks de aplicações
- US-020: Criar API endpoint para status de aplicações

---

### EPIC-05: Menu Dinâmico (30 pts)
**Objetivo:** Menu hierárquico com RBAC e badges dinâmicos

**User Stories:**
- US-021: Criar collection MenuItems
- US-022: Implementar menu tree hierárquico (parent/child)
- US-023: Filtrar menu items por RBAC
- US-024: Implementar badges dinâmicos (estático, API, WebSocket)
- US-025: Criar componente Sidebar com menu tree

---

### EPIC-06: Renderização de Aplicações (25 pts)
**Objetivo:** Iframe rendering com comunicação bidirecional

**User Stories:**
- US-026: Criar componente ApplicationFrame
- US-027: Implementar token passing (query param, postMessage)
- US-028: Implementar postMessage API (portal ↔ iframe)
- US-029: Criar loading states e error handling
- US-030: Implementar aplicação de exemplo (React)

---

### EPIC-07: Multi-idioma e Configuração (15 pts)
**Objetivo:** Internacionalização nativa e configurações globais

**User Stories:**
- US-031: Configurar localization do Payload (pt-BR, en-US, es-ES)
- US-032: Criar global PortalSettings
- US-033: Implementar language switcher
- US-034: Aplicar branding (logo, cores)
- US-035: Criar temas claro/escuro

---

### EPIC-08: Compliance e Auditoria (20 pts - NFRs incluídos)
**Objetivo:** Audit logs imutáveis e compliance LGPD/Bacen

**User Stories:** (Incluídas em NFRs)

---

## 📝 USER STORIES DETALHADAS

### SPRINT 1 (Semanas 1-2): Infraestrutura e Setup

---

#### **US-001: Setup de Repositório e Estrutura de Projeto**
**Épico:** EPIC-01 | **Story Points:** 8 | **Prioridade:** CRÍTICA

**Como** desenvolvedor
**Quero** ter repositório estruturado com PayloadCMS + Next.js 15
**Para** iniciar desenvolvimento com padrões corretos

**Critérios de Aceitação:**

**[AC-001.1] Estrutura de Diretórios Criada**
- [ ] Repositório Git inicializado
- [ ] Estrutura conforme [ESTRATEGIA_EXTENSIBILIDADE_PAYLOADCMS.md]
- [ ] Pastas: `src/payload/`, `src/app/`, `src/components/`, `src/lib/`

**[AC-001.2] Dependencies Instaladas**
- [ ] `package.json` com Payload 3.x, Next.js 15.4.7, React 19.1.1
- [ ] TypeScript 5.7.3 configurado (strict mode)
- [ ] ESLint + Prettier configurados

**[AC-001.3] Payload Config Criado**
- [ ] `payload.config.ts` base funcional
- [ ] PostgreSQL adapter configurado
- [ ] TypeScript types gerados (`npm run generate:types`)

**[AC-001.4] Next.js Config Criado**
- [ ] `next.config.js` com integração Payload
- [ ] App Router configurado
- [ ] TailwindCSS 4.x configurado

**Tasks Técnicas:**
1. `git init` + `.gitignore` (node_modules, .env, .next, dist)
2. `npm init` + install dependencies
3. Criar `tsconfig.json` (strict: true, paths aliases)
4. Criar `payload.config.ts` base
5. Criar `next.config.js` com `@payloadcms/next`
6. Criar estrutura de pastas completa
7. Criar `.env.example` com variáveis documentadas

**Testes de Validação:**
```bash
# 1. TypeScript compila sem erros
npm run generate:types
npx tsc --noEmit

# Expected: No errors

# 2. Next.js dev server inicia
npm run dev

# Expected: Server running on http://localhost:3000

# 3. Payload admin acessível
curl http://localhost:3000/admin

# Expected: HTTP 200 (redirect to login)
```

---

#### **US-002: Configurar PostgreSQL e Migrações**
**Épico:** EPIC-01 | **Story Points:** 5 | **Prioridade:** CRÍTICA

**Como** desenvolvedor
**Quero** banco PostgreSQL configurado com migrations
**Para** persistir dados do portal

**Critérios de Aceitação:**

**[AC-002.1] PostgreSQL Local Rodando**
- [ ] PostgreSQL 15+ instalado ou Docker
- [ ] Database `portal_container` criado
- [ ] User `portal_user` com permissões corretas

**[AC-002.2] Payload DB Adapter Configurado**
- [ ] `@payloadcms/db-postgres` instalado
- [ ] `DATABASE_URL` em `.env`
- [ ] Connection pool configurado

**[AC-002.3] Migrations Setup**
- [ ] Migrations em modo manual (não push)
- [ ] `payload migrate` funciona
- [ ] Pasta `migrations/` criada

**Tasks Técnicas:**
1. Instalar PostgreSQL (brew/apt/docker)
2. Criar database: `CREATE DATABASE portal_container;`
3. Criar user: `CREATE USER portal_user WITH PASSWORD 'pwd';`
4. Grant permissions: `GRANT ALL ON DATABASE portal_container TO portal_user;`
5. Configurar `payload.config.ts` com postgresAdapter
6. Criar primeira migration: `npm run migrate:create init`
7. Aplicar migration: `npm run migrate`

**Testes de Validação:**
```bash
# 1. Conexão ao banco funciona
psql "postgresql://portal_user:portal_password@localhost:5432/portal_container" -c "SELECT version();"

# Expected: PostgreSQL version info

# 2. Payload conecta ao banco
npm run generate:types

# Expected: Types gerados, conexão OK

# 3. Migration aplicada
npm run migrate

# Expected: ✅ Migration applied successfully
```

---

#### **US-003: Configurar Keycloak Realm e Clients**
**Épico:** EPIC-01 | **Story Points:** 8 | **Prioridade:** CRÍTICA

**Como** admin de sistema
**Quero** Keycloak configurado com realm e client OAuth2
**Para** autenticar usuários via SSO

**Critérios de Aceitação:**

**[AC-003.1] Keycloak Server Rodando**
- [ ] Keycloak 23.x rodando (Docker ou standalone)
- [ ] Admin console acessível: http://localhost:8080
- [ ] Credenciais admin: `admin/admin`

**[AC-003.2] Realm Criado**
- [ ] Realm `lbpay-portal` criado
- [ ] Login theme: keycloak (padrão)
- [ ] Session timeout: 30 minutos

**[AC-003.3] OAuth2 Client Configurado**
- [ ] Client ID: `portal-container`
- [ ] Client Protocol: `openid-connect`
- [ ] Access Type: `confidential`
- [ ] Valid Redirect URIs: `http://localhost:3000/api/oauth/callback`
- [ ] Web Origins: `http://localhost:3000`
- [ ] Client Secret gerado

**[AC-003.4] Roles Criados**
- [ ] Realm role: `super-admin`
- [ ] Realm role: `admin`
- [ ] Realm role: `operator`
- [ ] Realm role: `compliance-officer`
- [ ] Realm role: `viewer`

**[AC-003.5] Test User Criado**
- [ ] Username: `admin@lbpay.com`
- [ ] Password: `admin123` (temporária)
- [ ] Email verified: `true`
- [ ] Assigned role: `super-admin`

**Tasks Técnicas:**
1. `docker run` Keycloak ou download standalone
2. Login admin console
3. Create realm: `lbpay-portal`
4. Create client: `portal-container` (OAuth2, confidential)
5. Configure redirect URIs
6. Create realm roles (5 roles)
7. Create test user + assign role
8. Export realm config: `realm-export.json`
9. Adicionar `KEYCLOAK_*` vars em `.env`

**Testes de Validação:**
```bash
# 1. Keycloak health check
curl http://localhost:8080/health/ready

# Expected: {"status":"UP"}

# 2. OAuth2 discovery endpoint
curl http://localhost:8080/realms/lbpay-portal/.well-known/openid-configuration

# Expected: JSON com authorization_endpoint, token_endpoint, etc.

# 3. Login test user via browser
# Navigate to: http://localhost:8080/realms/lbpay-portal/account
# Login: admin@lbpay.com / admin123
# Expected: User account page visible
```

---

#### **US-004: Criar Docker Compose para Stack Local**
**Épico:** EPIC-01 | **Story Points:** 5 | **Prioridade:** ALTA

**Como** desenvolvedor
**Quero** stack completa via Docker Compose
**Para** rodar ambiente local facilmente

**Critérios de Aceitação:**

**[AC-004.1] Docker Compose File Criado**
- [ ] `docker-compose.yml` com 3 services: postgres, keycloak, portal
- [ ] Networks configuradas corretamente
- [ ] Volumes persistentes

**[AC-004.2] Services Configurados**
- [ ] PostgreSQL 15-alpine
- [ ] Keycloak 23 (dev mode)
- [ ] Portal (dev mode com hot-reload)

**[AC-004.3] Health Checks**
- [ ] PostgreSQL: `pg_isready`
- [ ] Keycloak: `/health/ready`
- [ ] Portal: `/api/health`

**[AC-004.4] Comandos Funcionando**
- [ ] `docker-compose up -d`: Sobe stack
- [ ] `docker-compose logs -f portal`: Logs portal
- [ ] `docker-compose down`: Para stack

**Tasks Técnicas:**
1. Criar `docker-compose.yml` base
2. Configurar service `postgres` com env vars
3. Configurar service `keycloak` com depends_on postgres
4. Configurar service `portal` com depends_on keycloak
5. Criar volumes: `postgres_data`
6. Criar network: `portal_network`
7. Adicionar health checks em todos services
8. Criar `.dockerignore`

**Testes de Validação:**
```bash
# 1. Stack sobe sem erros
docker-compose up -d

# Expected: 3/3 services running

# 2. Health checks passam
docker-compose ps

# Expected: All services healthy

# 3. Portal acessível
curl http://localhost:3000/api/health

# Expected: {"status":"ok"}

# 4. Keycloak acessível
curl http://localhost:8080/health/ready

# Expected: {"status":"UP"}

# 5. Database acessível
docker-compose exec postgres psql -U portal_user -d portal_container -c "SELECT 1;"

# Expected: 1
```

---

#### **US-005: Configurar CI/CD Pipeline (GitHub Actions)**
**Épico:** EPIC-01 | **Story Points:** 8 | **Prioridade:** ALTA

**Como** DevOps
**Quero** CI/CD automatizado
**Para** garantir qualidade e deploy contínuo

**Critérios de Aceitação:**

**[AC-005.1] Workflow CI Criado**
- [ ] `.github/workflows/ci.yml`
- [ ] Triggers: push (main, develop), pull_request
- [ ] Jobs: lint, typecheck, test, build

**[AC-005.2] Lint Job**
- [ ] ESLint configurado
- [ ] Prettier configurado
- [ ] Executa: `npm run lint`

**[AC-005.3] TypeCheck Job**
- [ ] Executa: `npx tsc --noEmit`
- [ ] Gera Payload types: `npm run generate:types`

**[AC-005.4] Test Job**
- [ ] PostgreSQL service configurado
- [ ] Executa: `npm test`
- [ ] Coverage report gerado

**[AC-005.5] Build Job**
- [ ] Executa: `npm run build`
- [ ] Valida build completo

**[AC-005.6] Dependabot Configurado**
- [ ] `.github/dependabot.yml`
- [ ] Auto-merge patches habilitado

**Tasks Técnicas:**
1. Criar `.github/workflows/ci.yml`
2. Configurar job `lint` com ESLint
3. Configurar job `typecheck` com tsc
4. Configurar job `test` com PostgreSQL service
5. Configurar job `build` com cache npm
6. Criar `.github/dependabot.yml`
7. Configurar branch protection rules (main, develop)
8. Configurar required checks

**Testes de Validação:**
```bash
# 1. Push para branch trigger CI
git checkout -b test/ci
git commit --allow-empty -m "test: trigger CI"
git push origin test/ci

# Expected: GitHub Actions workflow runs

# 2. Verificar jobs no GitHub UI
# Navigate to: https://github.com/{org}/{repo}/actions
# Expected: All jobs pass (lint, typecheck, test, build)

# 3. Pull request trigger CI
gh pr create --title "Test CI" --body "Testing CI pipeline"

# Expected: CI runs on PR, status checks visible
```

---

### SPRINT 2 (Semanas 3-4): Autenticação e Autorização

---

#### **US-006: Implementar Keycloak OAuth2 Strategy**
**Épico:** EPIC-02 | **Story Points:** 13 | **Prioridade:** CRÍTICA

**Como** usuário
**Quero** fazer login via Keycloak
**Para** acessar o portal com SSO

**Critérios de Aceitação:**

**[AC-006.1] Custom Auth Strategy Criado**
- [ ] `src/payload/plugins/keycloak-auth.ts` criado
- [ ] Implementa `authenticate()` function
- [ ] Valida JWT com Keycloak userinfo endpoint

**[AC-006.2] OAuth2 Callback Endpoint**
- [ ] `src/app/api/oauth/callback/route.ts` criado
- [ ] Troca code por tokens (authorization_endpoint)
- [ ] Armazena tokens em cookies (httpOnly, secure)

**[AC-006.3] Login Flow Completo**
- [ ] User acessa `/admin`
- [ ] Redirect para Keycloak login
- [ ] User faz login no Keycloak
- [ ] Callback retorna code
- [ ] Portal troca code por tokens
- [ ] Portal cria shadow user (se não existe)
- [ ] Redirect para `/admin` (autenticado)

**[AC-006.4] Token Validation**
- [ ] Valida JWT signature
- [ ] Valida exp claim (expiration)
- [ ] Valida iss claim (issuer)
- [ ] Valida aud claim (audience)

**Tasks Técnicas:**
1. Instalar `openid-client` library
2. Criar plugin `keycloak-auth.ts`
3. Implementar `authenticate()` function
4. Criar endpoint `/api/oauth/callback`
5. Implementar token exchange flow
6. Criar função `validateKeycloakToken()`
7. Configurar `payload.config.ts` com custom strategy
8. Criar `/api/oauth/login` redirect endpoint
9. Configurar cookies (httpOnly, secure, sameSite)

**Testes de Validação:**
```bash
# 1. Login flow manual
# Navigate to: http://localhost:3000/admin
# Expected: Redirect para Keycloak login

# 2. Login com test user
# Username: admin@lbpay.com
# Password: admin123
# Expected: Redirect para /admin, autenticado

# 3. Verificar cookies criados
# Open DevTools → Application → Cookies
# Expected: payload-token, keycloak-access-token, keycloak-refresh-token

# 4. Verificar token JWT válido
curl http://localhost:3000/api/users/me \
  -H "Authorization: Bearer $(cat cookies/payload-token)"

# Expected: User info JSON
```

---

#### **US-007: Criar Collection Users com Shadow Users**
**Épico:** EPIC-02 | **Story Points:** 8 | **Prioridade:** CRÍTICA

**Como** sistema
**Quero** sincronizar usuários do Keycloak
**Para** manter shadow users no Payload

**Critérios de Aceitação:**

**[AC-007.1] Collection Users Criada**
- [ ] `src/payload/collections/Users.ts` criado
- [ ] Fields: keycloak_sub, email, username, firstName, lastName
- [ ] Field: role (relationship com Roles)
- [ ] Field: preferredLanguage, timezone, theme

**[AC-007.2] Shadow User Auto-Creation**
- [ ] Hook afterLogin cria user se não existe
- [ ] Busca por `keycloak_sub`
- [ ] Mapeia Keycloak roles → Payload roles

**[AC-007.3] Shadow User Auto-Update**
- [ ] Hook afterLogin atualiza dados se mudaram
- [ ] Atualiza: email, firstName, lastName
- [ ] Atualiza: metadata (keycloakRoles, lastSyncAt)

**[AC-007.4] RBAC na Collection**
- [ ] Users só podem ler seus próprios dados
- [ ] super-admin pode ler/criar/editar/deletar todos
- [ ] admin pode ler/editar users

**Tasks Técnicas:**
1. Criar `src/payload/collections/Users.ts`
2. Definir fields (keycloak_sub unique, email unique)
3. Implementar `access` control functions
4. Criar hook `findOrCreateShadowUser()`
5. Criar função `mapKeycloakRoleToPayload()`
6. Configurar `auth: true` na collection
7. Configurar custom strategy
8. Adicionar timestamps

**Testes de Validação:**
```bash
# 1. Login cria shadow user
# DELETE FROM users; (limpar banco)
# Navigate to: http://localhost:3000/admin
# Login com: admin@lbpay.com
# Expected: Shadow user criado

# 2. Verificar shadow user no banco
psql -U portal_user -d portal_container \
  -c "SELECT email, keycloak_sub, username FROM users;"

# Expected: 1 row (admin@lbpay.com)

# 3. Login novamente atualiza dados (não duplica)
# Navigate to: http://localhost:3000/admin
# Login novamente
# Expected: Ainda 1 row (não duplicou)

# 4. Verificar metadata sincronizada
psql -U portal_user -d portal_container \
  -c "SELECT metadata FROM users WHERE email = 'admin@lbpay.com';"

# Expected: JSON com keycloakRoles, lastSyncAt
```

---

#### **US-008: Implementar Sincronização Automática Keycloak → Payload**
**Épico:** EPIC-02 | **Story Points:** 5 | **Prioridade:** ALTA

**Como** sistema
**Quero** sincronizar roles do Keycloak
**Para** manter permissões atualizadas

**Critérios de Aceitação:**

**[AC-008.1] Mapeamento de Roles**
- [ ] `keycloak: super-admin` → `payload: super-admin`
- [ ] `keycloak: admin` → `payload: admin`
- [ ] `keycloak: operator` → `payload: operator`
- [ ] `keycloak: compliance-officer` → `payload: compliance-officer`
- [ ] `keycloak: viewer` → `payload: viewer`

**[AC-008.2] Sincronização no Login**
- [ ] Hook afterLogin extrai `realm_roles` do JWT
- [ ] Mapeia roles usando função `mapKeycloakRoleToPayload()`
- [ ] Atualiza `user.role` (primary role)
- [ ] Atualiza `user.additionalRoles` (multi-role support)

**[AC-008.3] Fallback para Viewer**
- [ ] Se Keycloak role não mapeada, usar `viewer`
- [ ] Log warning em console

**Tasks Técnicas:**
1. Criar função `mapKeycloakRoleToPayload(keycloakRole: string): Promise<Role>`
2. Criar mapeamento de roles (object literal)
3. Implementar extração de `realm_roles` do JWT
4. Atualizar hook afterLogin para sync roles
5. Implementar fallback para `viewer`
6. Adicionar logging

**Testes de Validação:**
```bash
# 1. Criar test user no Keycloak com role 'operator'
# Keycloak Admin → Users → Add user
# Username: operator@lbpay.com
# Assign role: operator

# 2. Login com operator user
# Navigate to: http://localhost:3000/admin
# Login: operator@lbpay.com / senha123

# 3. Verificar role sincronizada
psql -U portal_user -d portal_container \
  -c "SELECT u.email, r.name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = 'operator@lbpay.com';"

# Expected: operator@lbpay.com | operator

# 4. Mudar role no Keycloak para 'admin'
# Keycloak Admin → Users → operator@lbpay.com → Role Mappings
# Remove: operator, Add: admin

# 5. Logout + Login novamente
# Expected: Role atualizada para 'admin'
```

---

#### **US-009: Criar Hook afterLogin para Audit Logs**
**Épico:** EPIC-02 | **Story Points:** 5 | **Prioridade:** MÉDIA

**Como** compliance officer
**Quero** logar todos logins
**Para** auditoria e segurança

**Critérios de Aceitação:**

**[AC-009.1] Hook afterLogin Criado**
- [ ] `src/payload/hooks/afterLogin.ts` criado
- [ ] Executa após login bem-sucedido
- [ ] Cria registro em `audit_logs`

**[AC-009.2] Dados Logados**
- [ ] user_id
- [ ] action: `user.login`
- [ ] timestamp
- [ ] ip_address (do request)
- [ ] user_agent (do request)
- [ ] success: true

**[AC-009.3] Falhas de Login Também Logadas**
- [ ] Hook beforeLogin tenta validar
- [ ] Se falha, loga: action `user.login_failed`, success: false

**Tasks Técnicas:**
1. Criar `src/payload/hooks/afterLogin.ts`
2. Implementar função `logLogin(user, req)`
3. Extrair IP: `req.ip` ou `req.headers['x-forwarded-for']`
4. Extrair user agent: `req.headers['user-agent']`
5. Criar registro em `audit_logs` collection
6. Configurar hook em `payload.config.ts`

**Testes de Validação:**
```bash
# 1. Login gera audit log
# Navigate to: http://localhost:3000/admin
# Login: admin@lbpay.com

# 2. Verificar audit log criado
psql -U portal_user -d portal_container \
  -c "SELECT action, success, ip_address FROM audit_logs ORDER BY timestamp DESC LIMIT 1;"

# Expected: user.login | true | 127.0.0.1

# 3. Login failed gera audit log
# Navigate to: http://localhost:3000/admin
# Login: admin@lbpay.com / SENHA_ERRADA

# 4. Verificar audit log de falha
psql -U portal_user -d portal_container \
  -c "SELECT action, success, error_message FROM audit_logs ORDER BY timestamp DESC LIMIT 1;"

# Expected: user.login_failed | false | Invalid credentials
```

---

#### **US-010: Implementar Logout e Invalidação de Sessão**
**Épico:** EPIC-02 | **Story Points:** 3 | **Prioridade:** MÉDIA

**Como** usuário
**Quero** fazer logout
**Para** encerrar minha sessão

**Critérios de Aceitação:**

**[AC-010.1] Endpoint Logout Criado**
- [ ] `POST /api/auth/logout` criado
- [ ] Limpa cookies: `payload-token`, `keycloak-access-token`, `keycloak-refresh-token`
- [ ] Retorna 200 OK

**[AC-010.2] Keycloak Logout (Opcional)**
- [ ] Chama Keycloak logout endpoint (end_session_endpoint)
- [ ] Invalida sessão no Keycloak também

**[AC-010.3] Audit Log de Logout**
- [ ] Cria registro em `audit_logs`
- [ ] Action: `user.logout`
- [ ] Success: true

**[AC-010.4] UI Logout Button**
- [ ] Header tem user menu
- [ ] User menu tem opção "Logout"
- [ ] Click em Logout chama API

**Tasks Técnicas:**
1. Criar `src/app/api/auth/logout/route.ts`
2. Implementar limpeza de cookies
3. Implementar chamada Keycloak end_session (opcional)
4. Criar audit log de logout
5. Criar componente UserMenu com logout button
6. Redirect para `/login` após logout

**Testes de Validação:**
```bash
# 1. Logout limpa cookies
# Login primeiro
# Navigate to: http://localhost:3000/admin
# Click: User Menu → Logout

# 2. Verificar cookies removidos
# Open DevTools → Application → Cookies
# Expected: payload-token, keycloak-* removed

# 3. Tentar acessar /admin após logout
# Navigate to: http://localhost:3000/admin
# Expected: Redirect para login

# 4. Verificar audit log de logout
psql -U portal_user -d portal_container \
  -c "SELECT action, success FROM audit_logs ORDER BY timestamp DESC LIMIT 1;"

# Expected: user.logout | true
```

---

### SPRINT 3 (Semanas 5-6): RBAC e Gestão de Aplicações

*(Continue com US-011 até US-020...)*

**[Nota: Por questão de espaço, vou resumir os próximos sprints. A estrutura segue o mesmo padrão detalhado acima]**

#### **US-011: Criar Collection Roles** (8 pts)
- Collection Roles com fields: name, displayName, description, permissions
- Seed data: 5 system roles

#### **US-012: Criar Collection Permissions** (5 pts)
- Collection Permissions com fields: resource, action, displayName
- Seed data: 20+ permissions base

#### **US-013: Implementar RBAC Collection-Level** (8 pts)
- Access control functions em cada collection
- super-admin bypass, outros roles filtered

#### **US-014: Implementar RBAC Field-Level** (5 pts)
- Field access control (read, update)
- Exemplo: keycloak_sub read-only

#### **US-015: Criar Helpers de Permissões (Frontend)** (3 pts)
- `hasPermission(user, resource, action)` function
- `canAccessApplication(user, app)` function

#### **US-016: Criar Collection Applications** (8 pts)
- Collection Applications com todos fields da spec
- Admin UI funcional

#### **US-017: Implementar CRUD de Aplicações** (5 pts)
- Create, Read, Update, Delete via Payload Admin
- Validation rules

#### **US-018: Configurar Iframe Sandbox e CSP** (8 pts)
- Sandbox attribute configurável
- CSP headers configurados

#### **US-019: Implementar Health Checks de Aplicações** (3 pts)
- Endpoint `/api/apps/[slug]/health`
- Retorna status da aplicação

#### **US-020: Criar API Endpoint para Status** (3 pts)
- Endpoint `/api/apps/status`
- Lista todas apps com health status

---

### SPRINT 4 (Semanas 7-8): Menu Dinâmico e Renderização

#### **US-021: Criar Collection MenuItems** (8 pts)
- Hierarchical collection (parent/child)
- Badges configuration

#### **US-022: Implementar Menu Tree Hierárquico** (8 pts)
- Recursive menu rendering
- Support 3+ levels deep

#### **US-023: Filtrar Menu Items por RBAC** (5 pts)
- Server-side filtering by user permissions
- Client-side permission gates

#### **US-024: Implementar Badges Dinâmicos** (8 pts)
- Static badges
- API badges (fetch from endpoint)
- WebSocket badges (opcional)

#### **US-025: Criar Componente Sidebar** (8 pts)
- Sidebar component com menu tree
- Collapsible sidebar
- Active state highlighting

#### **US-026: Criar Componente ApplicationFrame** (8 pts)
- Iframe rendering component
- Loading states
- Error handling

#### **US-027: Implementar Token Passing** (5 pts)
- Query param method
- PostMessage method

#### **US-028: Implementar PostMessage API** (8 pts)
- Portal → Iframe communication
- Iframe → Portal communication
- Message types: AUTH_TOKEN, READY, NAVIGATE, RESIZE

#### **US-029: Criar Loading States e Error Handling** (3 pts)
- Loading spinner
- Error boundary
- Retry logic

#### **US-030: Implementar Aplicação de Exemplo** (5 pts)
- React app exemplo
- Recebe token via postMessage
- Comunica com portal

---

### SPRINT 5 (Semanas 9-10): Multi-idioma, Compliance e Polish

#### **US-031: Configurar Localization do Payload** (5 pts)
- 3 locales: pt-BR, en-US, es-ES
- Fallback strategy

#### **US-032: Criar Global PortalSettings** (5 pts)
- Singleton global
- Branding, localization, features config

#### **US-033: Implementar Language Switcher** (3 pts)
- Language selector component
- Cookie persistence

#### **US-034: Aplicar Branding** (3 pts)
- Logo upload
- Primary/secondary/accent colors
- CSS custom properties

#### **US-035: Criar Temas Claro/Escuro** (3 pts)
- Theme toggle button
- Local storage persistence
- CSS variables

---

## 🎯 NON-FUNCTIONAL REQUIREMENTS (NFRs)

### NFR-01: Performance (8 pts)
**Objetivo:** Portal responde rápido e fluidamente

**Critérios:**
- [ ] Time to Interactive (TTI) < 3s
- [ ] Menu rendering < 200ms
- [ ] Iframe load < 2s (external app dependent)
- [ ] API response p95 < 500ms

**Tasks:**
- Lighthouse audit > 90 performance score
- Next.js build optimizations (code splitting)
- Database query optimization (indexes)
- Payload field selection optimization

---

### NFR-02: Segurança (8 pts)
**Objetivo:** Portal é seguro por design

**Critérios:**
- [ ] OWASP Top 10 compliance
- [ ] HTTPS enforced (TLS 1.3)
- [ ] CSP headers configurados
- [ ] XSS protection
- [ ] CSRF protection
- [ ] SQL injection prevention (ORM)

**Tasks:**
- Security audit com OWASP ZAP
- Dependency scan (Snyk, npm audit)
- Secrets em environment vars (nunca hardcoded)
- Rate limiting em APIs críticas

---

### NFR-03: Auditabilidade (8 pts)
**Objetivo:** 100% das ações críticas logadas

**Critérios:**
- [ ] Collection AuditLogs criada (append-only)
- [ ] Login/logout logado
- [ ] CRUD de applications logado
- [ ] CRUD de menu items logado
- [ ] Acesso a aplicações logado
- [ ] Mudanças de roles logadas
- [ ] Retenção: 5 anos (compliance)

**Tasks:**
- Criar collection AuditLogs
- Hooks afterChange em collections críticas
- Immutable logs (no update/delete)
- Index por user_id, action, timestamp

---

### NFR-04: Escalabilidade (8 pts)
**Objetivo:** Portal suporta 100+ aplicações, 1000+ menu items

**Critérios:**
- [ ] Menu rendering otimizado (virtual scroll se necessário)
- [ ] Database indexes corretos
- [ ] Pagination em listagens
- [ ] Lazy loading de aplicações

**Tasks:**
- Database indexes: menu_items(parent_id, order), applications(slug)
- Pagination padrão: 50 items
- React.memo em components pesados
- Code splitting por route

---

### NFR-05: Observabilidade (8 pts)
**Objetivo:** Sistema monitorado e debuggável

**Critérios:**
- [ ] Structured logs (JSON)
- [ ] Health check endpoint `/api/health`
- [ ] Metrics endpoint `/api/metrics` (opcional)
- [ ] Error tracking (Sentry ou similar)

**Tasks:**
- Winston logger (JSON format)
- Health endpoint retorna: DB status, Keycloak status
- Sentry integration (opcional)
- Log levels: ERROR, WARN, INFO, DEBUG

---

## 📊 VELOCITY E CAPACIDADE

| Sprint | Story Points | Weeks | Team Size | Velocity/Week |
|--------|--------------|-------|-----------|---------------|
| Sprint 1 | 34 pts | 2 | 4 devs | 17 pts/week |
| Sprint 2 | 34 pts | 2 | 4 devs | 17 pts/week |
| Sprint 3 | 43 pts | 2 | 4 devs | 21 pts/week |
| Sprint 4 | 50 pts | 2 | 4 devs | 25 pts/week |
| Sprint 5 | 39 pts | 2 | 5 devs | 19 pts/week |
| **TOTAL** | **200 pts** | **10** | **4-5 devs** | **20 pts/week avg** |

**Assumptions:**
- 4 developers full-time (2 backend, 2 frontend)
- Sprint 5: +1 QA/DevOps para polish e deploy
- Velocity ramp-up: Sprint 1-2 (setup), Sprint 3-4 (produtividade máxima)

---

## 🎯 DEFINITION OF DONE (DoD)

Para uma User Story ser considerada DONE:

- [ ] **Code Complete** - Feature implementada 100%
- [ ] **Tests Written** - Unit tests > 80% coverage (se aplicável)
- [ ] **TypeScript Types** - No `any`, strict mode compliant
- [ ] **Linted** - ESLint + Prettier passed
- [ ] **Documented** - Code comments, JSDoc (se necessário)
- [ ] **Peer Reviewed** - PR aprovado por 2+ devs
- [ ] **CI Passed** - Todos checks verdes (lint, typecheck, test, build)
- [ ] **Manually Tested** - QA manual executado
- [ ] **Validation Scripts** - Bash scripts de validação executados e passaram
- [ ] **Merged to Main** - PR merged sem conflitos

---

## 📅 RELEASE PLAN

| Milestone | Sprint | Deliverable | Date (estimado) |
|-----------|--------|-------------|-----------------|
| **M1: Infrastructure Ready** | Sprint 1 | Repo setup, CI/CD, Docker Compose | Semana 2 |
| **M2: Auth Working** | Sprint 2 | Keycloak SSO, shadow users, RBAC base | Semana 4 |
| **M3: Portal Core** | Sprint 3 | Applications CRUD, Menu tree, RBAC completo | Semana 6 |
| **M4: App Rendering** | Sprint 4 | Iframe working, postMessage, badges | Semana 8 |
| **M5: Production Ready** | Sprint 5 | i18n, themes, audit logs, polish | Semana 10 |
| **🚀 Go-Live** | Post-Sprint 5 | Deploy produção | Semana 11 |

---

**Documento mantido por:** Product Owner + Tech Lead
**Última atualização:** 09 de Janeiro de 2025
**Versão:** 1.0
