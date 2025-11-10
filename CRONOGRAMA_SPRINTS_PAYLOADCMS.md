# Cronograma Sprint-a-Sprint - Portal Container PayloadCMS

**Projeto**: LB Portal Container (PayloadCMS)
**Organização**: LBPay
**Duração Total**: 10 semanas (50 dias úteis)
**Total de Sprints**: 5 sprints de 2 semanas cada
**Velocity Target**: 40 story points/sprint (±5 buffer)
**Data de Criação**: 2025-11-09
**Última Atualização**: 2025-11-09

---

## 📊 Visão Geral do Cronograma

### Estatísticas Globais

| Métrica | Valor |
|---------|-------|
| **Total de Story Points** | 200 pts |
| **Total de User Stories** | 35 stories |
| **Total de Sprints** | 5 sprints |
| **Duração por Sprint** | 2 semanas (10 dias úteis) |
| **Velocity Target** | 40 pts/sprint ±5 |
| **Total de Épicos** | 8 épicos |
| **Total de NFRs** | 5 NFRs |

### Milestones Principais

| Milestone | Sprint | Data Alvo | Objetivo |
|-----------|--------|-----------|----------|
| **M1: Infrastructure Ready** | Sprint 1 | D+10 | Docker stack local funcional (PayloadCMS + Keycloak + PostgreSQL) |
| **M2: Core Portal Ready** | Sprint 2 | D+20 | 10 Collections criadas, RBAC básico, SSO Keycloak integrado |
| **M3: Apps Integration** | Sprint 3 | D+30 | Gestão de aplicações + iframe rendering funcional |
| **M4: i18n Complete** | Sprint 4 | D+40 | Multi-idioma implementado (pt-BR, en-US, es-ES) |
| **M5: Production Ready** | Sprint 5 | D+50 | Testes E2E, segurança, compliance validados - GO-LIVE |

---

## 🚀 Sprint 1: Infrastructure Setup (D+0 a D+10)

**Sprint Goal**: "Provisionar stack de desenvolvimento local com PayloadCMS 3.x, PostgreSQL 15, Keycloak 23 e criar estrutura base do projeto"

**Story Points**: 40 pts

**Épicos**: EPIC-01 (Infrastructure)

**Squad Lead**: AGENT-DEVOPS-012 (DevOps/SRE)

**Agentes Ativos**: MAESTRO-001, SCRUM-002, DEVOPS-012, DB-009, KEYCLOAK-006, DOC-013

---

### 📅 Sprint 1 - Planejamento Dia-a-Dia

#### **Dia 1 (D+0) - Segunda-feira: Sprint Planning + Setup Inicial**

**09:00-13:00** - Sprint Planning (4h)
- **Facilitador**: AGENT-SCRUM-002
- **Participantes**: Toda squad (12 agentes)
- **Agenda**:
  - 09:00-09:30: Apresentação da visão do projeto (MAESTRO-001)
  - 09:30-10:30: Refinamento do backlog Sprint 1 (SCRUM-002)
  - 10:30-11:00: Break
  - 11:00-12:30: Planning poker (estimativa US-001 a US-007)
  - 12:30-13:00: Commit do sprint (40 pts)

**13:30-14:30** - Setup de Ambiente (1h)
- **Todos agentes**:
  - Clone repositório: `git clone https://github.com/LBPAY-LAB/LB_BackOffice.git`
  - Instalar dependências: Node 20, Docker, Docker Compose
  - Setup IDE: VSCode + extensões (ESLint, Prettier, TypeScript)
  - Configurar Git hooks: pre-commit (lint), commit-msg (conventional commits)

**14:30-17:30** - Trabalho Paralelo (3h)
- **DEVOPS-012**:
  - [ ] Criar estrutura de diretórios (US-001)
  - [ ] Criar `.gitignore`, `.nvmrc`, `.editorconfig`
  - [ ] Setup GitHub Actions workflow (CI básico)
- **DB-009**:
  - [ ] Escrever `docker-compose.yml` (PostgreSQL service)
  - [ ] Criar script `init-db.sh` (databases: `payload_dev`, `keycloak_dev`)
- **KEYCLOAK-006**:
  - [ ] Escrever `docker-compose.yml` (Keycloak service)
  - [ ] Preparar realm export `keycloak-realm.json` (initial structure)
- **DOC-013**:
  - [ ] Criar `README.md` inicial
  - [ ] Criar `CONTRIBUTING.md` (code style, PR guidelines)

**17:30-18:00** - Daily Review + Sync Assíncrono
- **SCRUM-002**: Facilita quick sync (15min)
- Cada agente reporta progresso + blockers
- Decisões rápidas se necessário (MAESTRO-001)

---

#### **Dia 2 (D+1) - Terça-feira: Docker Compose Stack**

**09:15-09:30** - Daily Standup
- **Formato**: What I did / What I'll do / Blockers
- **Timeboxed**: 15min (máximo 2min/agente)

**09:30-12:00** - Trabalho Profundo (2.5h)
- **DEVOPS-012** + **DB-009** (Pair Programming):
  - [ ] Finalizar `docker-compose.yml` completo (3 services: PostgreSQL, Keycloak, PayloadCMS)
  - [ ] Configurar networks (`portal_network`)
  - [ ] Configurar volumes (persistência de dados)
  - [ ] Testar: `docker-compose up -d`
  - [ ] Validar: PostgreSQL acessível em `localhost:5432`

- **KEYCLOAK-006**:
  - [ ] Criar realm `lbpay-portal`
  - [ ] Criar client `payload-admin` (OAuth2 Authorization Code)
  - [ ] Configurar redirect URIs: `http://localhost:3000/api/oauth/callback`
  - [ ] Criar roles iniciais: `super_admin`, `admin`, `user`
  - [ ] Exportar realm: `docker exec keycloak /opt/keycloak/bin/kc.sh export --realm lbpay-portal --file /tmp/realm.json`

- **DOC-013**:
  - [ ] Documentar `docs/operations/local-development-setup.md`
  - [ ] Passo-a-passo para subir stack local
  - [ ] Troubleshooting comum

**12:00-13:00** - Almoço

**13:00-17:00** - Trabalho Profundo (4h)
- **DEVOPS-012**:
  - [ ] Criar `Dockerfile` multi-stage para PayloadCMS (US-002)
  - [ ] Stage 1 (deps): `npm ci`
  - [ ] Stage 2 (builder): `npm run build`
  - [ ] Stage 3 (runner): `npm start`
  - [ ] Build e push para registry local: `docker build -t lb-portal:dev .`

- **DB-009**:
  - [ ] Criar migrations inicial (Drizzle ORM setup)
  - [ ] Configurar `drizzle.config.ts`
  - [ ] Criar schema base: `src/db/schema/index.ts`

- **TYPESCRIPT-PRO**:
  - [ ] Configurar `tsconfig.json` (strict mode)
  - [ ] Configurar ESLint + Prettier
  - [ ] Criar `.prettierrc`, `.eslintrc.js`
  - [ ] Setup pre-commit hooks (Husky + lint-staged)

**17:00-17:30** - Code Review
- **MAESTRO-001**: Revisar PRs do dia
- Foco: `docker-compose.yml`, `Dockerfile`, `tsconfig.json`

---

#### **Dia 3 (D+2) - Quarta-feira: PayloadCMS Setup**

**09:15-09:30** - Daily Standup

**09:30-12:00** - Trabalho Profundo (2.5h)
- **PAYLOADCMS-003** (Lead):
  - [ ] Instalar PayloadCMS: `npm install payload @payloadcms/db-postgres @payloadcms/next`
  - [ ] Criar `src/payload/payload.config.ts` (configuração inicial)
  - [ ] Configurar conexão PostgreSQL (Drizzle adapter)
  - [ ] Criar primeira collection (Users - minimal):
    ```typescript
    {
      slug: 'users',
      auth: true,
      fields: [
        { name: 'email', type: 'email', required: true },
        { name: 'keycloak_sub', type: 'text', unique: true },
      ]
    }
    ```
  - [ ] Rodar: `npm run payload generate:types`
  - [ ] Testar admin UI: `npm run dev` → `http://localhost:3000/admin`

- **DB-009**:
  - [ ] Validar conexão PayloadCMS ↔ PostgreSQL
  - [ ] Verificar tabelas criadas automaticamente
  - [ ] Criar indexes: `email`, `keycloak_sub`

**12:00-13:00** - Almoço

**13:00-17:00** - Trabalho Profundo (4h)
- **PAYLOADCMS-003** + **KEYCLOAK-006** (Pair):
  - [ ] Implementar plugin `keycloak-auth` (US-006 - parcial)
  - [ ] Criar `src/payload/plugins/keycloak-auth.ts`
  - [ ] Implementar apenas validação de JWT (sem OAuth flow completo)
  - [ ] Testar: Login manual com token Keycloak

- **FRONTEND-008**:
  - [ ] Setup Next.js 15 (já vem com PayloadCMS)
  - [ ] Criar layout base: `src/app/layout.tsx`
  - [ ] Instalar TailwindCSS: `npm install tailwindcss @tailwindcss/typography`
  - [ ] Configurar `tailwind.config.ts`
  - [ ] Instalar shadcn/ui: `npx shadcn-ui@latest init`

**17:00-17:30** - Demo Parcial
- **PAYLOADCMS-003**: Demonstra admin UI funcionando
- **KEYCLOAK-006**: Demonstra Keycloak realm configurado
- Squad valida progresso

---

#### **Dia 4 (D+3) - Quinta-feira: OAuth2 Integration (Parte 1)**

**09:15-09:30** - Daily Standup

**09:30-12:00** - Trabalho Profundo (2.5h)
- **KEYCLOAK-006** (Lead US-006):
  - [ ] Implementar OAuth2 Authorization Code Flow (12 steps)
  - [ ] Criar endpoint `/api/oauth/login` (redirect para Keycloak)
  - [ ] Criar endpoint `/api/oauth/callback` (token exchange)
  - [ ] Implementar token storage (cookies httpOnly, secure)
  - [ ] Criar middleware de autenticação

- **BACKEND-007**:
  - [ ] Criar service `src/services/auth.service.ts`
  - [ ] Funções: `validateToken()`, `refreshToken()`, `revokeToken()`
  - [ ] Integrar com plugin `keycloak-auth`

**12:00-13:00** - Almoço

**13:00-17:00** - Trabalho Profundo (4h)
- **KEYCLOAK-006** + **PAYLOADCMS-003**:
  - [ ] Implementar shadow user sync (US-007)
  - [ ] Hook `afterLogin`: verifica se `keycloak_sub` existe em `users`
  - [ ] Se não existe, cria shadow user:
    ```typescript
    await payload.create({
      collection: 'users',
      data: {
        email: keycloakUser.email,
        keycloak_sub: keycloakUser.sub,
        isActive: true,
      }
    });
    ```
  - [ ] Mapear roles: Keycloak role → Payload role (inicial: 1:1)

- **QA-010**:
  - [ ] Escrever testes E2E para OAuth flow (Playwright setup)
  - [ ] Testar: Login → Redirect Keycloak → Callback → Admin UI

**17:00-17:30** - Code Review
- **MAESTRO-001**: Revisar OAuth implementation
- **TYPESCRIPT-PRO**: Revisar type safety

---

#### **Dia 5 (D+4) - Sexta-feira: OAuth2 Integration (Parte 2) + Sprint Mid-Review**

**09:15-09:30** - Daily Standup

**09:30-12:00** - Trabalho Profundo (2.5h)
- **KEYCLOAK-006**:
  - [ ] Implementar logout flow (US-006)
  - [ ] Endpoint `/api/oauth/logout`
  - [ ] Revoke tokens no Keycloak
  - [ ] Clear cookies
  - [ ] Redirect para Keycloak logout page

- **PAYLOADCMS-003**:
  - [ ] Configurar session timeout (30min default)
  - [ ] Implementar token refresh automático
  - [ ] Testar idle timeout

- **FRONTEND-008**:
  - [ ] Criar componente `<LoginButton />` (shadcn/ui Button)
  - [ ] Criar componente `<UserMenu />` (dropdown com logout)
  - [ ] Integrar em layout principal

**12:00-13:00** - Almoço

**13:00-14:30** - Sprint Mid-Review (1.5h)
- **Facilitador**: SCRUM-002
- **Agenda**:
  - Demo de cada agente (5min cada)
  - Validação de progresso vs Sprint Goal
  - Ajustes de prioridades se necessário
  - Identificação de riscos

**14:30-17:00** - Trabalho Profundo (2.5h)
- **Todos agentes**: Finalizar tasks pendentes
- **DEVOPS-012**: Ajustes no Docker Compose conforme feedback
- **DOC-013**: Atualizar documentação com learnings da semana

**17:00-17:30** - Retrospectiva Parcial (opcional)
- **SCRUM-002**: Coleta feedback rápido da equipe
- What went well / What to improve

---

#### **Dia 6 (D+5) - Segunda-feira (Semana 2): Collections Setup**

**09:15-09:30** - Daily Standup

**09:30-12:00** - Trabalho Profundo (2.5h)
- **PAYLOADCMS-003** (Lead US-008):
  - [ ] Criar 10 Collections (schema definitions):
    1. `users` (já criado - expandir)
    2. `roles`
    3. `permissions`
    4. `regions`
    5. `applications`
    6. `menu_items`
    7. `audit_logs`
    8. `notifications`
    9. `user_preferences`
    10. `portal_settings` (Global)
  - [ ] Definir relacionamentos (1:N, N:N)
  - [ ] Configurar soft delete (`deleted_at`)

- **DB-009**:
  - [ ] Criar migrations para cada collection
  - [ ] Criar indexes (performance):
    - `users`: `email`, `keycloak_sub`, `isActive`
    - `roles`: `name`
    - `permissions`: `role_id`, `collection`
    - `menu_items`: `parent_id`, `order`, `role_id`
  - [ ] Configurar foreign keys

**12:00-13:00** - Almoço

**13:00-17:00** - Trabalho Profundo (4h)
- **PAYLOADCMS-003**:
  - [ ] Configurar Access Control para cada collection (US-010)
  - [ ] Implementar função `hasPermission(user, action, collection)`
  - [ ] Exemplo:
    ```typescript
    access: {
      read: ({ req: { user } }) => hasPermission(user, 'read', 'applications'),
      create: ({ req: { user } }) => hasPermission(user, 'create', 'applications'),
    }
    ```

- **BACKEND-007**:
  - [ ] Criar seeds iniciais (US-009):
    - 3 roles: `super_admin`, `admin`, `user`
    - 10 permissions base
    - 1 super admin user

**17:00-17:30** - Code Review
- **MAESTRO-001**: Revisar schemas de Collections
- **DB-009**: Validar indexes e relacionamentos

---

#### **Dia 7 (D+6) - Terça-feira: RBAC Implementation**

**09:15-09:30** - Daily Standup

**09:30-12:00** - Trabalho Profundo (2.5h)
- **PAYLOADCMS-003** + **BACKEND-007** (Pair):
  - [ ] Implementar RBAC 3 níveis (US-010):
    1. **Collection-level**: Pode acessar collection?
    2. **Field-level**: Pode ver/editar campo?
    3. **Document-level**: Pode acessar documento específico?
  - [ ] Criar helper functions:
    ```typescript
    export const hasCollectionAccess = (user, collection, action) => { ... }
    export const hasFieldAccess = (user, collection, field, action) => { ... }
    export const hasDocumentAccess = (user, collection, docId) => { ... }
    ```

- **DB-009**:
  - [ ] Criar tabela `permissions_cache` (Redis-like em PostgreSQL)
  - [ ] Otimizar queries de permissões (performance)

**12:00-13:00** - Almoço

**13:00-17:00** - Trabalho Profundo (4h)
- **PAYLOADCMS-003**:
  - [ ] Configurar field-level permissions em todas collections
  - [ ] Exemplo: `users.email` visível apenas para `super_admin` e próprio usuário

- **QA-010**:
  - [ ] Escrever testes unitários para RBAC
  - [ ] Casos de teste:
    - `super_admin` acessa tudo
    - `admin` acessa aplicações mas não usuários
    - `user` acessa apenas próprios dados

**17:00-17:30** - Demo
- **PAYLOADCMS-003**: Demonstra RBAC funcionando no admin UI
- Testa com 3 usuários diferentes (super_admin, admin, user)

---

#### **Dia 8 (D+7) - Quarta-feira: Audit Logs + Hooks**

**09:15-09:30** - Daily Standup

**09:30-12:00** - Trabalho Profundo (2.5h)
- **PAYLOADCMS-003** (Lead US-011):
  - [ ] Implementar audit log hook:
    ```typescript
    // src/payload/hooks/audit-log.ts
    export const auditLogHook = {
      beforeChange: async ({ operation, data, req }) => {
        await req.payload.create({
          collection: 'audit_logs',
          data: {
            user_id: req.user?.id,
            action: operation,
            entity: req.collection,
            entity_id: data.id,
            old_value: JSON.stringify(req.originalDoc),
            new_value: JSON.stringify(data),
            timestamp: new Date(),
            ip_address: req.ip,
          }
        });
        return data;
      }
    }
    ```
  - [ ] Aplicar hook em todas collections (exceto `audit_logs`)

- **DB-009**:
  - [ ] Configurar `audit_logs` como append-only (no updates/deletes)
  - [ ] Criar partitioning por ano (performance)

**12:00-13:00** - Almoço

**13:00-17:00** - Trabalho Profundo (4h)
- **PAYLOADCMS-003**:
  - [ ] Criar hook de validação customizada (US-012):
    - Validar email único
    - Validar CNPJ/CPF (se aplicável)
    - Validar URL de aplicações

- **QA-010**:
  - [ ] Testar audit logs:
    - Criar usuário → log criado
    - Atualizar role → log criado com diff
    - Deletar aplicação → log criado

**17:00-17:30** - Code Review
- **MAESTRO-001**: Revisar implementação de hooks
- **SECURITY-011**: Validar que audit logs são immutable

---

#### **Dia 9 (D+8) - Quinta-feira: CI/CD Pipeline**

**09:15-09:30** - Daily Standup

**09:30-12:00** - Trabalho Profundo (2.5h)
- **DEVOPS-012** (Lead US-003):
  - [ ] Criar GitHub Actions workflows:
    - `.github/workflows/ci.yml` (lint, test, build, type-check)
    - `.github/workflows/security-scan.yml` (npm audit, Trivy)
  - [ ] Configurar branch protection rules:
    - `main`: requer 2 aprovações + CI pass
    - `develop`: requer 1 aprovação + CI pass
  - [ ] Setup Dependabot (auto-merge patches)

- **TYPESCRIPT-PRO**:
  - [ ] Configurar type-check no CI
  - [ ] Garantir `npm run build` passa sem warnings

**12:00-13:00** - Almoço

**13:00-17:00** - Trabalho Profundo (4h)
- **DEVOPS-012**:
  - [ ] Setup Docker Build & Push workflow
  - [ ] Configurar AWS ECR (ou outro registry)
  - [ ] Testar build automático em PR

- **DOC-013**:
  - [ ] Documentar `docs/operations/ci-cd-pipeline.md`
  - [ ] Diagramas de workflow (Mermaid)
  - [ ] Troubleshooting guide

**17:00-17:30** - Validação
- **MAESTRO-001**: Validar CI/CD funcionando
- Criar PR de teste → CI executa → Merge

---

#### **Dia 10 (D+9) - Sexta-feira: Sprint Review + Retrospectiva**

**09:00-09:15** - Daily Standup Final

**09:15-11:00** - Sprint Review (1.75h)
- **Facilitador**: SCRUM-002
- **Audiência**: Product Owner, Stakeholders (simulado)
- **Agenda**:
  - 09:15-09:30: Recap do Sprint Goal
  - 09:30-10:30: Demo de cada épico (15min cada):
    - DEVOPS-012: Docker stack + CI/CD
    - DB-009: PostgreSQL + migrations
    - KEYCLOAK-006: SSO OAuth2 funcionando
    - PAYLOADCMS-003: 10 Collections + RBAC + Audit logs
  - 10:30-11:00: Q&A, feedback, validação de Milestone M1

**11:00-12:00** - Retrospectiva (1h)
- **Facilitador**: SCRUM-002
- **Formato**: Start/Stop/Continue
- **Agenda**:
  - 11:00-11:20: Coleta individual (Post-its virtuais)
  - 11:20-11:40: Discussão em grupo
  - 11:40-12:00: Action items (máximo 3)

**12:00-13:00** - Almoço

**13:00-17:00** - Trabalho Final + Documentação (4h)
- **Todos agentes**: Finalizar tasks pendentes
- **DOC-013**:
  - [ ] Atualizar `README.md` com progresso Sprint 1
  - [ ] Criar `CHANGELOG.md` (v0.1.0 - Infrastructure Ready)
  - [ ] Documentar decisões arquiteturais (ADR-001: PayloadCMS choice)

**17:00-17:30** - Celebração + Planejamento Sprint 2
- **SCRUM-002**: Prep para Sprint 2 (refinamento inicial)
- **MAESTRO-001**: Comunicação de Milestone M1 atingido

---

### ✅ Sprint 1 - Acceptance Criteria

**Milestone M1: Infrastructure Ready** atingido quando:

- [ ] Docker Compose stack sobe sem erros (`docker-compose up -d`)
- [ ] PostgreSQL acessível e databases criados (`payload_dev`, `keycloak_dev`)
- [ ] Keycloak rodando com realm `lbpay-portal` configurado
- [ ] PayloadCMS admin UI acessível em `http://localhost:3000/admin`
- [ ] Login via Keycloak SSO funcional (Authorization Code Flow)
- [ ] Shadow users criados automaticamente após primeiro login
- [ ] 10 Collections criadas e visíveis no admin UI
- [ ] RBAC básico funcionando (super_admin vs admin vs user)
- [ ] Audit logs registrando todas operações CRUD
- [ ] CI/CD pipeline funcionando (lint, test, build pass)
- [ ] Documentação atualizada (`README.md`, `local-development-setup.md`)

**Validação Manual**:
```bash
# 1. Stack sobe
docker-compose up -d
docker ps  # 3 containers rodando

# 2. PostgreSQL conecta
psql "host=localhost user=payload_user dbname=payload_dev password=payload_pass"
\dt  # Mostra tabelas (users, roles, permissions, etc.)

# 3. Keycloak acessível
curl http://localhost:8080/realms/lbpay-portal/.well-known/openid-configuration
# Expected: JSON com configuração OAuth2

# 4. PayloadCMS Admin UI
open http://localhost:3000/admin
# Expected: Redirect para Keycloak → Login → Redirect de volta → Admin UI

# 5. Shadow user criado
psql "host=localhost user=payload_user dbname=payload_dev" -c "SELECT * FROM users WHERE keycloak_sub IS NOT NULL;"
# Expected: 1 row (seu usuário de teste)

# 6. Audit log registrado
psql "host=localhost user=payload_user dbname=payload_dev" -c "SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 5;"
# Expected: Logs de login, criação de shadow user

# 7. CI passa
git push origin feature/US-001
# Expected: GitHub Actions workflow passa (green checkmark)
```

---

## 🚀 Sprint 2: Core Portal & RBAC (D+11 a D+20)

**Sprint Goal**: "Implementar gestão completa de roles, permissions, regions com RBAC field-level e integrar role mapping Keycloak ↔ Payload"

**Story Points**: 40 pts

**Épicos**: EPIC-02 (Core Portal), EPIC-03 (RBAC)

**Squad Lead**: AGENT-PAYLOADCMS-003 (PayloadCMS Specialist)

**Agentes Ativos**: MAESTRO-001, SCRUM-002, PAYLOADCMS-003, BACKEND-007, KEYCLOAK-006, DB-009, QA-010, DOC-013

---

### 📅 Sprint 2 - Planejamento Resumido (High-Level)

**Semana 1 (D+11 a D+15)**:
- **Dia 11**: Sprint Planning + US-013 (Implementar collection Roles com CRUD completo)
- **Dia 12**: US-014 (Implementar collection Permissions com CRUD completo)
- **Dia 13**: US-015 (Implementar collection Regions com CRUD completo)
- **Dia 14**: US-016 (Role Mapping Keycloak → Payload) - Parte 1
- **Dia 15**: US-016 (Role Mapping Keycloak → Payload) - Parte 2 + Mid-Review

**Semana 2 (D+16 a D+20)**:
- **Dia 16**: US-017 (Field-level permissions em Users collection)
- **Dia 17**: US-018 (Field-level permissions em Applications collection)
- **Dia 18**: US-019 (Document-level permissions - regional data isolation)
- **Dia 19**: US-020 (Criar seeds de dados de teste) + Testing
- **Dia 20**: Sprint Review + Retrospectiva + Milestone M2

**Key Deliverables Sprint 2**:
- ✅ CRUD completo para Roles, Permissions, Regions
- ✅ Role mapping automático (Keycloak role → Payload role via hook)
- ✅ Field-level permissions configuradas (ex: `users.email` apenas super_admin)
- ✅ Document-level permissions (ex: usuários veem apenas dados da própria região)
- ✅ Seeds de 5 roles, 30 permissions, 5 regions
- ✅ Testes E2E cobrindo RBAC scenarios

---

## 🚀 Sprint 3: Applications & Menu Management (D+21 a D+30)

**Sprint Goal**: "Implementar gestão de aplicações externas, menu dinâmico com RBAC e iframe rendering funcional"

**Story Points**: 40 pts

**Épicos**: EPIC-04 (Applications), EPIC-05 (Menu Management), EPIC-06 (Iframe Rendering)

**Squad Lead**: AGENT-FRONTEND-008 (Frontend Developer)

**Agentes Ativos**: MAESTRO-001, SCRUM-002, FRONTEND-008, PAYLOADCMS-003, BACKEND-007, QA-010, TYPESCRIPT-PRO, DOC-013

---

### 📅 Sprint 3 - Planejamento Resumido (High-Level)

**Semana 1 (D+21 a D+25)**:
- **Dia 21**: Sprint Planning + US-021 (Implementar collection Applications com CRUD)
- **Dia 22**: US-022 (Implementar collection Menu Items com hierarquia)
- **Dia 23**: US-023 (RBAC em Menu Items - filtrar por role)
- **Dia 24**: US-024 (Criar componente Sidebar com menu dinâmico)
- **Dia 25**: US-025 (Criar componente ApplicationFrame com iframe) + Mid-Review

**Semana 2 (D+26 a D+30)**:
- **Dia 26**: US-026 (Implementar PostMessage API - portal → iframe)
- **Dia 27**: US-027 (Passar JWT token para aplicação no iframe)
- **Dia 28**: US-028 (Criar aplicação externa de exemplo - React + RBAC)
- **Dia 29**: US-029 (Testar integração completa - menu → iframe → token) + Testing
- **Dia 30**: Sprint Review + Retrospectiva + Milestone M3

**Key Deliverables Sprint 3**:
- ✅ CRUD completo para Applications (name, url, icon, authentication config)
- ✅ CRUD completo para Menu Items (hierarquia N níveis, ordering, role-based)
- ✅ Sidebar renderizado dinamicamente conforme role do usuário
- ✅ ApplicationFrame renderiza iframe com aplicação externa
- ✅ PostMessage API funcional (bidirectional: portal ↔ iframe)
- ✅ JWT token passado para iframe (método: postMessage ou query param)
- ✅ Aplicação externa de exemplo (React + token validation)
- ✅ Testes E2E cobrindo fluxo completo: login → menu → app rendering

---

## 🚀 Sprint 4: Multi-idioma & UX Polish (D+31 a D+40)

**Sprint Goal**: "Implementar suporte multi-idioma nativo (pt-BR, en-US, es-ES) e polir experiência de usuário"

**Story Points**: 40 pts

**Épicos**: EPIC-07 (i18n), EPIC-08 (UX Polish)

**Squad Lead**: AGENT-FRONTEND-008 (Frontend Developer)

**Agentes Ativos**: MAESTRO-001, SCRUM-002, FRONTEND-008, PAYLOADCMS-003, QA-010, DOC-013

---

### 📅 Sprint 4 - Planejamento Resumido (High-Level)

**Semana 1 (D+31 a D+35)**:
- **Dia 31**: Sprint Planning + US-030 (Configurar PayloadCMS localization)
- **Dia 32**: US-031 (Traduzir admin UI - pt-BR, en-US, es-ES)
- **Dia 33**: US-032 (Implementar LanguageSwitcher component)
- **Dia 34**: US-033 (Traduzir menu items e aplicações - i18n fields)
- **Dia 35**: US-034 (User preferences - preferred language) + Mid-Review

**Semana 2 (D+36 a D+40)**:
- **Dia 36**: US-035 (Melhorar UX - loading states, error boundaries)
- **Dia 37**: US-036 (Melhorar UX - notifications toast, confirmations)
- **Dia 38**: US-037 (Accessibility - WCAG 2.1 AA compliance)
- **Dia 39**: US-038 (Criar tour guiado para novos usuários) + Testing
- **Dia 40**: Sprint Review + Retrospectiva + Milestone M4

**Key Deliverables Sprint 4**:
- ✅ PayloadCMS localization configurado (3 idiomas: pt-BR, en-US, es-ES)
- ✅ Admin UI 100% traduzido (labels, tooltips, mensagens de erro)
- ✅ LanguageSwitcher no header (troca idioma em tempo real)
- ✅ Menu items e aplicações com campos i18n (título, descrição)
- ✅ User preferences salvam idioma preferido (persiste entre sessões)
- ✅ Loading states, skeleton loaders, error boundaries
- ✅ Toast notifications (sucesso, erro, warning, info)
- ✅ Dialogs de confirmação para ações destrutivas (delete)
- ✅ Accessibility: keyboard navigation, ARIA labels, color contrast
- ✅ Tour guiado (intro.js ou similar) - primeira vez que usuário loga

---

## 🚀 Sprint 5: Testing, Security & Production (D+41 a D+50)

**Sprint Goal**: "Executar testes completos (E2E, performance, segurança), validar compliance LGPD e realizar deploy production-ready"

**Story Points**: 40 pts

**Épicos**: EPIC-09 (Testing), EPIC-10 (Security & Compliance)

**Squad Lead**: AGENT-QA-010 (Quality Assurance)

**Agentes Ativos**: MAESTRO-001, SCRUM-002, QA-010, SECURITY-011, DEVOPS-012, COMP-011 (Compliance - ad-hoc), DOC-013

---

### 📅 Sprint 5 - Planejamento Resumido (High-Level)

**Semana 1 (D+41 a D+45)**:
- **Dia 41**: Sprint Planning + US-039 (Criar suite E2E completa - Playwright)
- **Dia 42**: US-040 (Testes de performance - k6 load tests)
- **Dia 43**: US-041 (Security scan - OWASP ZAP, npm audit, Trivy)
- **Dia 44**: US-042 (Validar compliance LGPD - checklist)
- **Dia 45**: US-043 (Pentest manual - top 5 vulnerabilidades) + Mid-Review

**Semana 2 (D+46 a D+50)**:
- **Dia 46**: US-044 (Criar runbooks operacionais - deployment, troubleshooting)
- **Dia 47**: US-045 (Setup monitoring - Prometheus + Grafana)
- **Dia 48**: US-046 (Deploy em ambiente staging - validação final)
- **Dia 49**: US-047 (Treinamento de usuários - documentação + vídeos)
- **Dia 50**: Sprint Review + Retrospectiva + GO-LIVE Celebration + Milestone M5

**Key Deliverables Sprint 5**:
- ✅ Suite E2E completa (Playwright):
  - Login flow (OAuth2)
  - CRUD de todas collections
  - Menu rendering
  - Iframe integration
  - Multi-idioma
  - RBAC scenarios (30+ test cases)
- ✅ Load tests (k6):
  - 1000 req/s por 5min
  - p95 < 200ms
  - 0 errors
- ✅ Security validation:
  - OWASP ZAP scan: 0 HIGH/CRITICAL
  - npm audit: 0 vulnerabilities
  - Trivy Docker scan: 0 HIGH/CRITICAL
- ✅ Compliance LGPD:
  - Política de Privacidade publicada
  - Consentimento implementado
  - Portabilidade de dados (export JSON/CSV)
  - Direito ao esquecimento (anonimização)
- ✅ Runbooks:
  - `deployment.md` (passo-a-passo deploy)
  - `troubleshooting.md` (common issues)
  - `disaster-recovery.md` (backup/restore)
- ✅ Monitoring:
  - Prometheus scraping métricas (CPU, RAM, request latency)
  - Grafana dashboards (5 dashboards: Overview, API, Database, Auth, Errors)
  - Alerting configurado (Slack ou email)
- ✅ Staging deployment:
  - URL: `https://staging.portal.lbpay.com.br`
  - Smoke tests passando
  - Validação com stakeholders
- ✅ Documentação de usuário:
  - User guide (30 páginas)
  - Video tutoriais (10 vídeos x 5min)
  - FAQ (20 perguntas)

---

## 📊 Resumo de Entregas por Sprint

| Sprint | Story Points | User Stories | Key Deliverables | Milestone |
|--------|--------------|--------------|------------------|-----------|
| **Sprint 1** | 40 pts | US-001 a US-007 (7 stories) | Docker stack, OAuth2, 10 Collections, RBAC básico, Audit logs, CI/CD | **M1**: Infrastructure Ready |
| **Sprint 2** | 40 pts | US-013 a US-020 (8 stories) | Roles CRUD, Permissions CRUD, Regions CRUD, Role mapping, Field-level permissions, Seeds | **M2**: Core Portal Ready |
| **Sprint 3** | 40 pts | US-021 a US-029 (9 stories) | Applications CRUD, Menu Items CRUD, Sidebar dinâmico, Iframe rendering, PostMessage API, Exemplo app externa | **M3**: Apps Integration |
| **Sprint 4** | 40 pts | US-030 a US-038 (9 stories) | i18n (3 idiomas), LanguageSwitcher, User preferences, UX polish, Accessibility, Tour guiado | **M4**: i18n Complete |
| **Sprint 5** | 40 pts | US-039 a US-047 (9 stories) | E2E tests, Load tests, Security scan, LGPD compliance, Runbooks, Monitoring, Staging deploy, Treinamento | **M5**: Production Ready |
| **TOTAL** | **200 pts** | **35 stories** | Portal Container 100% funcional | **GO-LIVE** |

---

## 🎯 Definição de Pronto (Definition of Done)

Cada User Story é considerada **PRONTA** apenas quando:

### Code Quality
- [ ] Código segue style guide (ESLint + Prettier pass)
- [ ] TypeScript strict mode sem erros
- [ ] Self-review realizado pelo desenvolvedor
- [ ] Code review aprovado por 2+ agentes (especialista + MAESTRO-001)
- [ ] Sem `console.log()` ou código comentado (exceto TODOs documentados)

### Testing
- [ ] Unit tests escritos (coverage > 80% para código crítico)
- [ ] Integration tests escritos (se aplicável)
- [ ] E2E tests escritos para fluxos de usuário (se aplicável)
- [ ] Todos testes passando (`npm run test`)
- [ ] Build sucesso sem warnings (`npm run build`)

### Documentation
- [ ] JSDoc comments em funções públicas
- [ ] README.md atualizado (se necessário)
- [ ] CHANGELOG.md atualizado (entry para feature/fix)
- [ ] Documentação de API atualizada (se criou endpoints)
- [ ] Runbooks atualizados (se afetou operações)

### Security & Compliance
- [ ] Security scan passou (npm audit, Trivy)
- [ ] OWASP Top 10 considerado (se aplicável)
- [ ] Dados sensíveis não logados
- [ ] Audit logs criados (se operação CRUD)
- [ ] RBAC validado (permissões corretas)

### Deployment
- [ ] CI/CD pipeline passou (GitHub Actions green)
- [ ] Testado em ambiente local (Docker Compose)
- [ ] Deploy em staging realizado (se próximo a release)
- [ ] Smoke tests passando

### Acceptance
- [ ] Todos critérios de aceitação ([AC-XXX.Y]) validados
- [ ] Demo realizado para squad (se feature visível)
- [ ] Product Owner aprovou (se necessário)

---

## 📆 Calendário de Cerimônias

### Daily Standup
- **Quando**: Todos os dias úteis, 09:15-09:30 (15min)
- **Facilitador**: SCRUM-002
- **Formato**: What I did / What I'll do / Blockers (2min/agente)
- **Local**: Slack canal `#daily-standup` (async) ou call (sync)

### Sprint Planning
- **Quando**: Primeiro dia do sprint, 09:00-13:00 (4h)
- **Facilitador**: SCRUM-002
- **Participantes**: Toda squad
- **Agenda**:
  - Sprint Goal definition (30min)
  - Backlog refinement (1h)
  - Break (30min)
  - Planning poker (1.5h)
  - Sprint commit (30min)

### Sprint Mid-Review
- **Quando**: Dia 5 de cada sprint (meio do sprint), 13:00-14:30 (1.5h)
- **Facilitador**: SCRUM-002
- **Objetivo**: Validar progresso, ajustar prioridades, identificar riscos
- **Formato**: Demo parcial + discussão

### Sprint Review
- **Quando**: Último dia do sprint, 09:00-11:00 (2h)
- **Facilitador**: SCRUM-002
- **Audiência**: Product Owner, Stakeholders
- **Formato**: Demo de features completas + Q&A

### Sprint Retrospectiva
- **Quando**: Último dia do sprint, 11:00-12:00 (1h)
- **Facilitador**: SCRUM-002
- **Participantes**: Apenas squad (sem stakeholders)
- **Formato**: Start/Stop/Continue + Action items (máx 3)

### Backlog Refinement
- **Quando**: Mid-sprint (dia 5), após mid-review, 14:30-16:00 (1.5h)
- **Facilitador**: SCRUM-002
- **Objetivo**: Preparar stories para próximo sprint
- **Participantes**: MAESTRO-001, SCRUM-002, leads de cada área

---

## 🎓 Padrões e Convenções

### Git Workflow

**Branch Naming**:
- `feature/US-XXX-short-description` (ex: `feature/US-001-docker-setup`)
- `bugfix/issue-XXX-description` (ex: `bugfix/issue-42-login-redirect`)
- `hotfix/critical-description` (ex: `hotfix/security-patch`)

**Commit Messages** (Conventional Commits):
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`

**Example**:
```
feat(auth): implement OAuth2 callback endpoint

- Exchange authorization code for access token
- Store tokens in httpOnly cookies
- Create shadow user if not exists
- Map Keycloak roles to Payload roles

Closes US-006
```

### Code Style

**TypeScript**:
- Strict mode enabled
- No `any` (usar `unknown` se necessário)
- Interfaces para tipos públicos, Types para internos
- Naming: `camelCase` variáveis, `PascalCase` interfaces/classes

**React**:
- Functional components (hooks)
- Props com TypeScript interfaces
- One component per file
- Named exports (não default)

**Formatting**:
- Prettier: `--single-quote --semi --trailing-comma all --print-width 100`
- Indentation: 2 spaces

### Pull Request Guidelines

**Template**:
```markdown
## Descrição
[Descrição clara do que foi alterado]

## Motivação
[Por que essa mudança foi necessária? Qual problema resolve?]

## User Story
Closes US-XXX

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova feature
- [ ] Breaking change
- [ ] Documentação

## Como Testar
1. [Passo 1]
2. [Passo 2]
3. Resultado esperado: [...]

## Checklist
- [ ] Código segue style guide
- [ ] Self-review realizado
- [ ] Unit tests adicionados (coverage > 80%)
- [ ] Documentação atualizada
- [ ] Build passa sem warnings
- [ ] Testes E2E passando (se aplicável)

## Screenshots (se aplicável)
[Anexar screenshots]

## Revisores Sugeridos
@AGENT-MAESTRO-001 @AGENT-PAYLOADCMS-003
```

**Review SLA**: < 4 horas para primeira revisão

---

## 🚨 Gestão de Riscos

### Riscos Identificados

| ID | Risco | Probabilidade | Impacto | Mitigação |
|----|-------|---------------|---------|-----------|
| **R-01** | PayloadCMS breaking changes em atualizações | Média | Alto | - SemVer strict (`^3.0.0`)<br>- Testes de upgrade em staging<br>- Dependabot com approval manual para minor/major |
| **R-02** | Keycloak realm configuração incorreta | Baixa | Alto | - Terraform para Keycloak config<br>- Realm export versionado no Git<br>- Testes E2E de OAuth flow |
| **R-03** | Performance de RBAC queries | Média | Médio | - Caching de permissões (Redis)<br>- Indexes otimizados<br>- Load tests desde Sprint 2 |
| **R-04** | Complexidade de role mapping multi-role | Alta | Médio | - Começar com 1:1 mapping (Sprint 2)<br>- Evoluir para N:N se necessário (Sprint 3)<br>- Documentação clara de decisões |
| **R-05** | Iframe security (XSS, clickjacking) | Média | Alto | - CSP headers strict<br>- Sandbox attributes<br>- PostMessage origin validation<br>- Security scan Sprint 5 |
| **R-06** | Squad knowledge gaps (PayloadCMS novo) | Alta | Baixo | - Treinamento semana 0 (antes Sprint 1)<br>- Pair programming<br>- DOC-013 mantém knowledge base |
| **R-07** | Scope creep (stakeholders pedem features extras) | Alta | Médio | - Product Owner filtra pedidos<br>- Backlog priorizado claramente<br>- "Parking lot" para ideias futuras |

### Plano de Contingência

**Se velocity < 30 pts/sprint**:
1. SCRUM-002 convoca retrospectiva emergencial
2. Identificar bottlenecks (skills gap, blockers técnicos, etc.)
3. Re-priorizar backlog (mover stories menos críticas para sprints futuros)
4. Pedir suporte externo se necessário (ex: consultor PayloadCMS)

**Se bug crítico em produção (P0)**:
1. MAESTRO-001 declara incident
2. War room em Slack `#incidents`
3. Hotfix branch criado imediatamente
4. Deploy em staging → validação → produção (< 2h)
5. Postmortem 24h após resolução

---

## 📞 Comunicação da Squad

### Canais Slack

| Canal | Propósito | Participantes |
|-------|-----------|---------------|
| `#squad-portal-pix` | Comunicação geral da squad | Toda squad |
| `#daily-standup` | Daily async (se não houver call) | Toda squad |
| `#deployments` | Notificações de deploy (ArgoCD, GitHub Actions) | DEVOPS-012, MAESTRO-001 |
| `#code-review` | Notificações de PRs pendentes | Toda squad |
| `#incidents` | War room para P0/P1 | MAESTRO-001, DEVOPS-012, on-call |
| `#celebration` | Wins, milestones atingidos | Toda squad |

### Meetings Recorrentes

| Meeting | Frequência | Duração | Participantes |
|---------|-----------|---------|---------------|
| Daily Standup | Diário | 15min | Toda squad |
| Sprint Planning | A cada 2 semanas | 4h | Toda squad |
| Sprint Review | A cada 2 semanas | 2h | Squad + Stakeholders |
| Retrospectiva | A cada 2 semanas | 1h | Apenas squad |
| Backlog Refinement | A cada 2 semanas | 1.5h | MAESTRO, SCRUM, Leads |
| Tech Sync (ad-hoc) | Conforme necessário | 30min | Especialistas envolvidos |

---

## 🎉 Critérios de Sucesso do Projeto

### Milestone M5: Production Ready (GO-LIVE)

O projeto é considerado **100% PRONTO PARA PRODUÇÃO** quando:

#### Funcional
- [ ] Login via Keycloak SSO funcionando (OAuth2 Authorization Code)
- [ ] Shadow users criados automaticamente
- [ ] RBAC field-level funcionando (8 roles configuradas)
- [ ] Menu dinâmico renderizado conforme role
- [ ] Iframe rendering funcional com aplicação externa de exemplo
- [ ] PostMessage API funcionando (token passing)
- [ ] Multi-idioma funcionando (pt-BR, en-US, es-ES)
- [ ] Audit logs registrando 100% operações CRUD
- [ ] Notificações toast funcionando

#### Técnico
- [ ] Docker Compose stack sobe sem erros
- [ ] Build de produção sucesso (`npm run build`)
- [ ] Type-check passa sem erros
- [ ] Lint passa sem warnings
- [ ] Unit tests > 80% coverage
- [ ] E2E tests passando (30+ scenarios)
- [ ] Load tests: 1000 req/s, p95 < 200ms, 0 errors
- [ ] Security scan: 0 HIGH/CRITICAL vulnerabilities
- [ ] CI/CD pipeline 100% funcional

#### Compliance
- [ ] LGPD: Política de Privacidade publicada
- [ ] LGPD: Consentimento implementado
- [ ] LGPD: Portabilidade de dados funcional (export JSON/CSV)
- [ ] LGPD: Direito ao esquecimento implementado (anonimização)
- [ ] Audit logs: Retenção de 5 anos configurada
- [ ] TLS 1.3 enforced (HTTP → HTTPS redirect)

#### Operacional
- [ ] Runbooks criados (deployment, troubleshooting, disaster recovery)
- [ ] Monitoring configurado (Prometheus + Grafana)
- [ ] Alerting funcionando (teste de alerta enviado)
- [ ] Backup automático configurado (PostgreSQL daily)
- [ ] Documentação de usuário completa (user guide + vídeos)
- [ ] Treinamento de usuários realizado (mínimo 5 pessoas)

#### Stakeholder
- [ ] Product Owner aprovou (sign-off formal)
- [ ] CTO aprovou arquitetura
- [ ] Compliance Officer aprovou LGPD
- [ ] Security Officer aprovou pentest
- [ ] Usuários piloto validaram (mínimo 3 feedbacks positivos)

---

## 📚 Documentação de Referência

### Documentos do Projeto

Todos documentos estão em [`/Users/jose.silva.lb/LBPay/lb_bo_portal/`]:

| Documento | Descrição | Tamanho |
|-----------|-----------|---------|
| **ESPECIFICACAO_TECNICA_PORTAL_CONTAINER_PAYLOADCMS.md** | Especificação técnica completa (fonte da verdade) | ~50.000 palavras |
| **PRODUCT_BACKLOG_PAYLOADCMS.md** | 35 User Stories detalhadas com critérios de aceitação | ~40.000 palavras |
| **SQUAD_AGENTES_PAYLOADCMS.md** | 12 agentes especializados, RACI matrix, skills matrix | ~30.000 palavras |
| **ESTRATEGIA_EXTENSIBILIDADE_PAYLOADCMS.md** | Zero fork strategy, Docker, versionamento | ~20.000 palavras |
| **PARECER_EXECUTIVO_PAYLOADCMS.md** | Executive summary (Score 9.2/10) | ~15.000 palavras |
| **CRONOGRAMA_SPRINTS_PAYLOADCMS.md** | Este documento - Sprint-by-Sprint schedule | ~15.000 palavras |
| **.claude/Claude.md** | Context file para Claude Code | Atualizado |

**Total**: ~170.000 palavras (~425 páginas) de planejamento meticuloso

### Links Externos

- **PayloadCMS Docs**: https://payloadcms.com/docs
- **Keycloak Docs**: https://www.keycloak.org/docs/latest
- **Next.js Docs**: https://nextjs.org/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/15
- **Drizzle ORM**: https://orm.drizzle.team/docs
- **TailwindCSS**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com

---

## ✅ Status Atual do Projeto

**Fase**: 📋 Planejamento 100% Completo

**Próximo Passo**: Aguardando aprovação executiva → Kickoff Sprint 1 (D+0)

**Milestones Futuros**:
- **M1**: Infrastructure Ready (D+10)
- **M2**: Core Portal Ready (D+20)
- **M3**: Apps Integration (D+30)
- **M4**: i18n Complete (D+40)
- **M5**: Production Ready - GO-LIVE (D+50)

**Repositório GitHub**: [LBPAY-LAB/LB_BackOffice](https://github.com/LBPAY-LAB/LB_BackOffice)

---

**🎯 PROJETO 100% PRONTO PARA INICIAR IMPLEMENTAÇÃO**

**Última Atualização**: 2025-11-09
**Versão deste documento**: 1.0
**Mantido por**: AGENT-SCRUM-002, AGENT-DOC-013

---

## 📝 Changelog

### v1.0 (2025-11-09)
- ✅ Criação inicial do cronograma sprint-by-sprint
- ✅ Sprint 1 planejado dia-a-dia (10 dias detalhados)
- ✅ Sprints 2-5 planejados em alto nível (high-level)
- ✅ 5 Milestones definidos (M1-M5)
- ✅ Cerimônias ágeis documentadas
- ✅ Padrões e convenções definidos
- ✅ Gestão de riscos documentada
- ✅ Critérios de sucesso definidos
- ✅ 200 story points distribuídos em 5 sprints de 2 semanas
