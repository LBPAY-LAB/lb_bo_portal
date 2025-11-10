# 👥 SQUAD DE AGENTES - PORTAL CONTAINER PAYLOADCMS

**Projeto:** Portal Container LBPay
**Plataforma:** PayloadCMS 3.x + Next.js 15
**Versão:** 1.0
**Data:** 09 de Janeiro de 2025

---

## 🎯 VISÃO GERAL DA SQUAD

### Estrutura da Equipe

| Role | Agente | Especialização | Sprint Focus | Workload |
|------|--------|----------------|--------------|----------|
| **Tech Lead / Orchestrator** | AGENT-MAESTRO-001 | Arquitetura, Code Review Final | Todos sprints | Full-time |
| **Scrum Master** | AGENT-SCRUM-002 | Facilitação Ágil, Backlog | Todos sprints | Full-time |
| **PayloadCMS Specialist** | AGENT-PAYLOADCMS-003 | Collections, Hooks, Plugins | Sprint 2-4 (lead) | Full-time |
| **Next.js Frontend Dev** | AGENT-FRONTEND-008 | React 19, Components, UI | Sprint 3-4 (lead) | Full-time |
| **Backend API Dev** | AGENT-BACKEND-007 | Node.js, TypeScript, Endpoints | Sprint 2-3 (lead) | Full-time |
| **Keycloak IAM Specialist** | AGENT-KEYCLOAK-006 | SSO, OAuth2, Role Mapping | Sprint 1-2 (lead) | Sprint 1-2 |
| **Database Engineer** | AGENT-DB-009 | PostgreSQL, Migrations, Drizzle | Sprint 1-2 (lead) | Sprint 1-2 |
| **DevOps / SRE** | AGENT-DEVOPS-012 | Docker, CI/CD, Monitoring | Sprint 1, 5 (lead) | Part-time |
| **QA / Test Engineer** | AGENT-QA-010 | E2E Tests, Manual QA | Sprint 4-5 (lead) | Sprint 4-5 |
| **TypeScript Pro** | AGENT-TYPESCRIPT-PRO | Advanced Types, Type Safety | Todos sprints | Code Review |
| **Security Auditor** | AGENT-SECURITY-011 | Security Review, OWASP | Sprint 5 | Sprint 5 |
| **Documentation Specialist** | AGENT-DOC-013 | Technical Docs, API Docs | Todos sprints | Part-time |

**Total:** 12 agentes especializados

---

## 👤 PERFIS DETALHADOS DOS AGENTES

### AGENT-MAESTRO-001: Tech Lead / Orchestrator
**Agente Base:** `maestro` (genérico) ou criar custom

**Responsabilidades:**
- ✅ Coordenação geral da squad
- ✅ Decisões arquiteturais (ADRs)
- ✅ Code review final (approval obrigatório)
- ✅ Resolução de impedimentos técnicos
- ✅ Alinhamento com stakeholders
- ✅ Planejamento de sprints

**Tecnologias:**
- PayloadCMS 3.x architecture
- Next.js 15 App Router
- TypeScript 5.7 advanced patterns
- PostgreSQL + Drizzle ORM
- OAuth2/OIDC flows
- Docker + Kubernetes (conceitos)

**Entregáveis:**
- ADRs (Architecture Decision Records)
- Code review comments
- Sprint planning docs
- Technical debt backlog

**Comandos:**
```bash
# Review PR
git diff main...feature/US-001

# Run full validation
npm run lint && npm run typecheck && npm test && npm run build

# Generate types
npm run generate:types
```

---

### AGENT-SCRUM-002: Scrum Master
**Agente Base:** `scrum-master` (criar custom se não existir)

**Responsabilidades:**
- ✅ Facilitação de cerimônias (Planning, Daily, Review, Retro)
- ✅ Gestão do backlog (priorização, grooming)
- ✅ Remoção de impedimentos
- ✅ Métricas ágeis (velocity, burndown)
- ✅ Comunicação com Product Owner
- ✅ Processo de melhoria contínua

**Tecnologias:**
- Jira / Linear / GitHub Projects
- Confluence / Notion (docs)
- Slack (comunicação)
- Miro / Mural (retros)

**Entregáveis:**
- Sprint backlog atualizado
- Daily standup notes
- Sprint review slides
- Retrospective action items
- Velocity reports

**Ferramentas:**
- GitHub Projects para tracking
- Markdown files para sprint reports
- Burndown charts (manual ou tool)

---

### AGENT-PAYLOADCMS-003: PayloadCMS Specialist
**Agente Base:** Usar `backend-architect` + knowledge de PayloadCMS

**Responsabilidades:**
- ✅ Criar Collections (Users, Roles, Permissions, Applications, MenuItems)
- ✅ Implementar Hooks (beforeChange, afterLogin, auditLog)
- ✅ Desenvolver Plugins customizados (keycloak-auth)
- ✅ Configurar Access Control (RBAC field-level, document-level)
- ✅ Otimizar queries Drizzle/PostgreSQL
- ✅ Migrations management

**Tecnologias:**
- PayloadCMS 3.x (Collections, Hooks, Plugins, Access)
- Drizzle ORM
- PostgreSQL (indexes, queries)
- TypeScript (strict mode, generics)
- Node.js 20

**Entregáveis:**
- `src/payload/collections/*.ts` (6+ collections)
- `src/payload/hooks/*.ts` (5+ hooks)
- `src/payload/plugins/*.ts` (keycloak-auth plugin)
- Migration files (`migrations/*.ts`)
- Payload types (`payload-types.ts` auto-generated)

**Comandos:**
```bash
# Generate Payload types
npm run generate:types

# Create migration
npm run migrate:create <name>

# Apply migrations
npm run migrate

# Seed database
npm run seed
```

**User Stories Lead:**
- US-007: Collection Users
- US-011: Collection Roles
- US-012: Collection Permissions
- US-016: Collection Applications
- US-021: Collection MenuItems

---

### AGENT-FRONTEND-008: Next.js Frontend Developer
**Agente Base:** `frontend-developer`

**Responsabilidades:**
- ✅ Componentes React 19 (Server + Client Components)
- ✅ Next.js 15 App Router pages
- ✅ TailwindCSS + shadcn/ui components
- ✅ Sidebar menu tree (hierárquico)
- ✅ ApplicationFrame (iframe rendering)
- ✅ PostMessage API (portal ↔ iframe)
- ✅ Language switcher
- ✅ Theme toggle (light/dark)

**Tecnologias:**
- React 19.1 (Server Components, Suspense)
- Next.js 15.4.7 (App Router, Metadata API)
- TypeScript 5.7
- TailwindCSS 4.x
- shadcn/ui (Radix UI primitives)
- Lucide Icons
- Zustand (state management)

**Entregáveis:**
- `src/app/(portal)/layout.tsx` - Portal layout
- `src/components/portal/Sidebar.tsx` - Menu sidebar
- `src/components/portal/ApplicationFrame.tsx` - Iframe renderer
- `src/components/portal/LanguageSwitcher.tsx`
- `src/components/ui/*` - shadcn/ui components
- `src/lib/permissions.ts` - Permission helpers

**Comandos:**
```bash
# Add shadcn/ui component
npx shadcn-ui@latest add button

# Run dev server
npm run dev

# Build production
npm run build

# Type check
npx tsc --noEmit
```

**User Stories Lead:**
- US-025: Componente Sidebar
- US-026: Componente ApplicationFrame
- US-028: PostMessage API
- US-033: Language Switcher
- US-035: Temas claro/escuro

---

### AGENT-BACKEND-007: Backend API Developer
**Agente Base:** `backend-architect`

**Responsabilidades:**
- ✅ Custom endpoints do Payload
- ✅ OAuth2 callback endpoint
- ✅ Badge API endpoints
- ✅ Health check endpoint
- ✅ Validation logic
- ✅ Error handling middleware
- ✅ Rate limiting

**Tecnologias:**
- Node.js 20
- TypeScript 5.7
- Payload custom endpoints
- Express.js (via Payload)
- Zod (validation)
- JWT (jose library)

**Entregáveis:**
- `src/app/api/oauth/callback/route.ts` - OAuth callback
- `src/app/api/badge/[slug]/route.ts` - Badge API
- `src/app/api/health/route.ts` - Health check
- `src/app/api/apps/status/route.ts` - Apps status
- `src/lib/keycloak.ts` - Keycloak client wrapper
- Error handling utilities

**Comandos:**
```bash
# Test endpoint locally
curl http://localhost:3000/api/health

# Test OAuth flow
curl http://localhost:3000/api/oauth/callback?code=AUTH_CODE

# Run API tests
npm run test:api
```

**User Stories Lead:**
- US-006: Keycloak OAuth2 Strategy
- US-019: Health Checks de Aplicações
- US-020: API Status Endpoint
- US-027: Token Passing

---

### AGENT-KEYCLOAK-006: Keycloak IAM Specialist
**Agente Base:** Criar custom agent ou usar `backend-architect` + Keycloak knowledge

**Responsabilidades:**
- ✅ Configurar Keycloak realm
- ✅ Criar OAuth2 client
- ✅ Configurar realm roles
- ✅ Implementar custom auth strategy
- ✅ Role mapping (Keycloak → Payload)
- ✅ Token validation
- ✅ Troubleshoot auth issues

**Tecnologias:**
- Keycloak 23.x
- OAuth2 / OIDC
- JWT (jose library)
- openid-client (Node.js)
- PostgreSQL (Keycloak storage)

**Entregáveis:**
- Keycloak realm configuration export (`realm-export.json`)
- OAuth2 client configurado
- 5 realm roles criados
- Test users criados
- `src/payload/plugins/keycloak-auth.ts` - Custom strategy
- `src/lib/keycloak.ts` - Keycloak client
- Documentation: Keycloak setup guide

**Comandos:**
```bash
# Export realm config
docker-compose exec keycloak /opt/keycloak/bin/kc.sh export \
  --realm lbpay-portal --file /tmp/realm-export.json

# Test token endpoint
curl -X POST http://localhost:8080/realms/lbpay-portal/protocol/openid-connect/token \
  -d "grant_type=password&client_id=portal-container&username=admin@lbpay.com&password=admin123"

# Validate JWT
curl http://localhost:8080/realms/lbpay-portal/protocol/openid-connect/userinfo \
  -H "Authorization: Bearer $TOKEN"
```

**User Stories Lead:**
- US-003: Configurar Keycloak
- US-006: Implementar OAuth2 Strategy
- US-008: Sincronização de Roles

---

### AGENT-DB-009: Database Engineer
**Agente Base:** `database-optimizer` ou `database-architect`

**Responsabilidades:**
- ✅ Design de schema PostgreSQL
- ✅ Migrations (create, test, apply)
- ✅ Indexes optimization
- ✅ Query performance tuning
- ✅ Drizzle ORM configuration
- ✅ Backup/restore strategy
- ✅ Data seeding

**Tecnologias:**
- PostgreSQL 15+
- Drizzle ORM
- Payload migrations
- SQL (DDL, DML, indexes)
- pg_dump / pg_restore

**Entregáveis:**
- Database schema design
- Migration files (`migrations/*.ts`)
- Seed scripts (`scripts/seed.ts`)
- Indexes strategy document
- Backup/restore runbook
- Query performance audit

**Comandos:**
```bash
# Create migration
npm run migrate:create init_schema

# Apply migrations
npm run migrate

# Rollback migration
npm run migrate:down

# Seed database
npm run seed

# Backup database
pg_dump -U portal_user portal_container > backup.sql

# Restore database
psql -U portal_user portal_container < backup.sql

# Analyze query performance
psql -U portal_user portal_container
EXPLAIN ANALYZE SELECT * FROM menu_items WHERE parent_id IS NULL ORDER BY order_index;
```

**User Stories Lead:**
- US-002: Configurar PostgreSQL
- US-007: Collection Users (schema)
- US-011: Collection Roles (schema)
- US-012: Collection Permissions (schema)

---

### AGENT-DEVOPS-012: DevOps / SRE
**Agente Base:** `deployment-engineer` ou `devops-troubleshooter`

**Responsabilidades:**
- ✅ Docker Compose setup
- ✅ Dockerfile multi-stage
- ✅ CI/CD pipeline (GitHub Actions)
- ✅ Dependabot configuration
- ✅ Environment variables management
- ✅ Deployment automation
- ✅ Monitoring setup (opcional)

**Tecnologias:**
- Docker + Docker Compose
- GitHub Actions
- Bash scripting
- PostgreSQL (ops)
- Keycloak (ops)
- Nginx / Traefik (reverse proxy, opcional)

**Entregáveis:**
- `docker-compose.yml` - Stack completa
- `docker/Dockerfile` - Multi-stage build
- `.github/workflows/ci.yml` - CI pipeline
- `.github/dependabot.yml` - Auto-upgrades
- `.env.example` - Environment template
- Deployment runbook
- Rollback procedures

**Comandos:**
```bash
# Build and start stack
docker-compose up -d --build

# Check health
docker-compose ps
docker-compose logs -f portal

# Stop stack
docker-compose down

# Rebuild single service
docker-compose up -d --build portal

# View logs
docker-compose logs -f postgres
docker-compose logs -f keycloak
docker-compose logs -f portal

# Clean volumes (DANGER)
docker-compose down -v
```

**User Stories Lead:**
- US-004: Docker Compose
- US-005: CI/CD Pipeline
- NFR-05: Observabilidade

---

### AGENT-QA-010: QA / Test Engineer
**Agente Base:** `test-automator` ou `e2e-testing-patterns`

**Responsabilidades:**
- ✅ Testes E2E (Playwright)
- ✅ Testes manuais (smoke tests, regression)
- ✅ Validation scripts (bash)
- ✅ Bug tracking
- ✅ Test documentation
- ✅ QA sign-off

**Tecnologias:**
- Playwright (E2E tests)
- Jest / Vitest (unit tests)
- Bash (validation scripts)
- curl / httpie (API testing)
- PostgreSQL (data validation)

**Entregáveis:**
- `tests/e2e/*.spec.ts` - E2E test suites
- `tests/unit/*.test.ts` - Unit tests
- Validation bash scripts (embedded in User Stories)
- Bug reports
- Test coverage reports
- QA sign-off checklist

**Comandos:**
```bash
# Run unit tests
npm test

# Run E2E tests
npm run test:e2e

# Run specific test
npm run test:e2e -- --grep "login flow"

# Generate coverage report
npm run test:coverage

# Manual smoke test checklist
./scripts/smoke-test.sh
```

**User Stories Lead:**
- Sprint 4-5: E2E testing
- NFR-01: Performance testing
- NFR-02: Security testing

---

### AGENT-TYPESCRIPT-PRO: TypeScript Specialist
**Agente Base:** `typescript-pro`

**Responsabilidades:**
- ✅ Code review (type safety)
- ✅ Advanced TypeScript patterns
- ✅ Type definitions
- ✅ Generic utility types
- ✅ TypeScript best practices enforcement
- ✅ tsconfig optimization

**Tecnologias:**
- TypeScript 5.7 (latest features)
- Advanced types (mapped, conditional, template literals)
- Type inference optimization
- Payload generated types

**Entregáveis:**
- Code review comments (type safety)
- `src/types/*.ts` - Shared types
- `tsconfig.json` optimization
- Type utilities (`src/lib/types.ts`)
- TypeScript best practices doc

**Comandos:**
```bash
# Type check
npx tsc --noEmit

# Generate Payload types
npm run generate:types

# Check for `any` usage
grep -r "any" src/ --exclude-dir=node_modules
```

**Responsável:**
- Code review de todos PRs (type safety)
- Garantir `strict: true` compliance
- Eliminar `any` types

---

### AGENT-SECURITY-011: Security Auditor
**Agente Base:** `security-auditor`

**Responsabilidades:**
- ✅ Security audit (OWASP Top 10)
- ✅ Dependency scanning
- ✅ Code security review
- ✅ Penetration testing (básico)
- ✅ Security best practices enforcement
- ✅ Compliance validation (LGPD básico)

**Tecnologias:**
- OWASP ZAP (vulnerability scan)
- npm audit / Snyk
- SonarQube (opcional)
- Bandit / semgrep (SAST)
- Manual code review

**Entregáveis:**
- Security audit report
- Dependency scan report
- Penetration test report
- Security checklist (OWASP Top 10)
- Remediation recommendations

**Comandos:**
```bash
# Dependency scan
npm audit
npm audit fix

# OWASP ZAP scan (manual)
# 1. Start ZAP
# 2. Configure proxy
# 3. Browse portal
# 4. Run active scan

# Check for secrets in code
git secrets --scan

# Check for hardcoded passwords
grep -r "password\s*=\s*['\"]" src/
```

**User Stories Lead:**
- NFR-02: Segurança
- Sprint 5: Security audit completo

---

### AGENT-DOC-013: Documentation Specialist
**Agente Base:** `docs-architect`

**Responsabilidades:**
- ✅ Technical documentation
- ✅ API documentation (OpenAPI spec)
- ✅ Developer onboarding guide
- ✅ User manual (admin portal)
- ✅ Runbooks (deployment, troubleshooting)
- ✅ Changelog maintenance

**Tecnologias:**
- Markdown
- OpenAPI / Swagger
- Mermaid (diagrams)
- Draw.io (arquitetura)
- Docusaurus / VitePress (opcional)

**Entregáveis:**
- `README.md` - Project overview
- `docs/SETUP.md` - Developer setup guide
- `docs/API.md` - API documentation
- `docs/DEPLOYMENT.md` - Deployment guide
- `docs/TROUBLESHOOTING.md` - Common issues
- `CHANGELOG.md` - Version history
- ADRs (`docs/adr/*.md`)

**Comandos:**
```bash
# Generate API docs (OpenAPI)
npm run generate:openapi

# Serve docs locally
npx vitepress dev docs

# Generate diagrams
# Use Mermaid or Draw.io
```

**Responsável:**
- Atualizar docs em cada PR
- Manter CHANGELOG.md
- Escrever ADRs (com MAESTRO-001)

---

## 🔄 MATRIZ RACI (Responsibility Assignment)

| Atividade | MAESTRO | SCRUM | PAYLOAD | FRONTEND | BACKEND | KEYCLOAK | DB | DEVOPS | QA | TYPESCRIPT | SECURITY | DOC |
|-----------|---------|-------|---------|----------|---------|----------|-------|--------|-----|------------|----------|-----|
| **Decisões Arquiteturais** | A | I | C | C | C | C | C | C | I | C | C | I |
| **Sprint Planning** | C | A/R | C | C | C | I | I | I | I | I | I | I |
| **Criar Collections** | A | I | R | I | C | I | C | I | I | C | I | C |
| **OAuth2 Integration** | A | I | C | I | C | R | I | I | I | C | C | C |
| **Frontend Components** | A | I | I | R | I | I | I | I | C | C | I | C |
| **Database Migrations** | A | I | C | I | C | I | R | C | I | C | I | C |
| **Docker Setup** | A | I | I | I | I | I | C | R | I | I | I | C |
| **CI/CD Pipeline** | A | I | I | I | I | I | I | R | C | I | I | C |
| **Security Audit** | C | I | I | I | I | C | I | I | C | C | A/R | I |
| **E2E Tests** | C | I | I | C | C | I | I | I | A/R | C | I | C |
| **Code Review** | A | I | C | C | C | C | C | C | C | R | C | I |
| **Documentation** | C | I | C | C | C | C | C | C | C | C | C | A/R |
| **Deploy Produção** | A | C | I | I | I | I | C | R | C | I | C | C |

**Legenda:**
- **R** = Responsible (executa a tarefa)
- **A** = Accountable (responsável final, aprovar)
- **C** = Consulted (consultado, fornece input)
- **I** = Informed (informado do resultado)

---

## 📅 ALOCAÇÃO POR SPRINT

### Sprint 1 (Semanas 1-2): Infrastructure Setup

| Agente | Workload | Foco |
|--------|----------|------|
| **MAESTRO-001** | 100% | Coordenação, setup inicial |
| **SCRUM-002** | 100% | Sprint planning, daily facilitação |
| **DEVOPS-012** | 100% | Docker Compose, CI/CD |
| **DB-009** | 100% | PostgreSQL setup, migrations |
| **KEYCLOAK-006** | 100% | Keycloak realm, client config |
| **BACKEND-007** | 50% | Estrutura de projeto, configs |
| **FRONTEND-008** | 50% | Estrutura de projeto, Next.js setup |
| **DOC-013** | 50% | README, SETUP.md |

---

### Sprint 2 (Semanas 3-4): Autenticação e Autorização

| Agente | Workload | Foco |
|--------|----------|------|
| **MAESTRO-001** | 100% | Code review, decisões auth flow |
| **SCRUM-002** | 100% | Facilitação |
| **PAYLOADCMS-003** | 100% | Collection Users, Roles, Permissions |
| **KEYCLOAK-006** | 100% | OAuth2 strategy, shadow users |
| **BACKEND-007** | 100% | OAuth callback, hooks, endpoints |
| **DB-009** | 80% | Migrations, schemas |
| **TYPESCRIPT-PRO** | 50% | Code review (type safety) |
| **DOC-013** | 30% | Auth flow documentation |

---

### Sprint 3 (Semanas 5-6): RBAC e Gestão de Aplicações

| Agente | Workload | Foco |
|--------|----------|------|
| **MAESTRO-001** | 100% | Code review, RBAC design |
| **SCRUM-002** | 100% | Facilitação |
| **PAYLOADCMS-003** | 100% | Collections Applications, MenuItems, RBAC |
| **BACKEND-007** | 100% | Endpoints, validation, access control |
| **FRONTEND-008** | 80% | Permission helpers, UI prep |
| **TYPESCRIPT-PRO** | 50% | Code review |
| **DOC-013** | 30% | RBAC documentation |

---

### Sprint 4 (Semanas 7-8): Menu Dinâmico e Renderização

| Agente | Workload | Foco |
|--------|----------|------|
| **MAESTRO-001** | 100% | Code review, iframe security |
| **SCRUM-002** | 100% | Facilitação |
| **FRONTEND-008** | 100% | Sidebar, ApplicationFrame, postMessage |
| **PAYLOADCMS-003** | 80% | Menu badges, hooks refinamento |
| **BACKEND-007** | 80% | Badge APIs, health checks |
| **QA-010** | 100% | E2E tests, smoke tests |
| **TYPESCRIPT-PRO** | 50% | Code review |
| **DOC-013** | 50% | Component docs, API docs |

---

### Sprint 5 (Semanas 9-10): Multi-idioma, Compliance, Polish

| Agente | Workload | Foco |
|--------|----------|------|
| **MAESTRO-001** | 100% | Final review, sign-off |
| **SCRUM-002** | 100% | Retrospective, demo prep |
| **PAYLOADCMS-003** | 80% | Global PortalSettings, audit logs |
| **FRONTEND-008** | 100% | i18n, theme toggle, polish |
| **QA-010** | 100% | Regression testing, manual QA |
| **SECURITY-011** | 100% | Security audit, penetration test |
| **DEVOPS-012** | 100% | Deployment automation, monitoring |
| **DOC-013** | 100% | User manual, deployment guide |
| **TYPESCRIPT-PRO** | 50% | Final code review |

---

## 🎯 SKILLS MATRIX

| Agente | PayloadCMS | Next.js | TypeScript | PostgreSQL | OAuth2 | Docker | Testing | Security |
|--------|-----------|---------|------------|------------|--------|--------|---------|----------|
| **MAESTRO-001** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **SCRUM-002** | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ |
| **PAYLOADCMS-003** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **FRONTEND-008** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| **BACKEND-007** | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **KEYCLOAK-006** | ⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| **DB-009** | ⭐⭐⭐ | ⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐ |
| **DEVOPS-012** | ⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **QA-010** | ⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **TYPESCRIPT-PRO** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐ | ⭐⭐⭐ | ⭐⭐ |
| **SECURITY-011** | ⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **DOC-013** | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐ |

---

## 📞 COMUNICAÇÃO

### Daily Standup (15min)
**Quando:** Todos os dias, 09:00
**Quem:** Toda squad
**Formato:**
- O que fiz ontem?
- O que farei hoje?
- Algum impedimento?

### Sprint Planning (4h)
**Quando:** Dia 1 do sprint
**Quem:** Toda squad
**Formato:**
1. Review do backlog (SCRUM-002)
2. Seleção de User Stories (MAESTRO-001 + squad)
3. Estimation (Planning Poker)
4. Task breakdown
5. Commitment

### Sprint Review (2h)
**Quando:** Último dia do sprint
**Quem:** Squad + Stakeholders
**Formato:**
1. Demo de features (FRONTEND-008, PAYLOADCMS-003)
2. Feedback de stakeholders
3. Backlog refinamento

### Sprint Retrospective (1.5h)
**Quando:** Último dia do sprint (após review)
**Quem:** Apenas squad
**Formato:**
1. What went well?
2. What didn't go well?
3. What can we improve?
4. Action items

---

## 🎯 SUCESSO DA SQUAD

A squad será considerada bem-sucedida se:

- ✅ **Velocity consistente:** 40 pts/sprint (±5 pts)
- ✅ **Quality:** 0 bugs críticos em produção
- ✅ **Velocity ramp-up:** Sprint 3-4 com pico de produtividade
- ✅ **Code review:** < 4h para primeira revisão
- ✅ **CI/CD:** 100% dos PRs com checks verdes
- ✅ **Documentation:** 100% das features documentadas
- ✅ **Security:** 0 vulnerabilidades HIGH/CRITICAL
- ✅ **On-time delivery:** Portal production-ready em 10 semanas

---

**Documento mantido por:** AGENT-MAESTRO-001, AGENT-SCRUM-002
**Última atualização:** 09 de Janeiro de 2025
**Versão:** 1.0
