# Claude Code - LB Portal Container (PayloadCMS)

**Projeto**: Portal Container / Shell Application - Instituição de Pagamento (IP)
**Organização**: LBPay
**Plataforma**: PayloadCMS 3.x + Next.js 15
**Repositório**: lb_bo_portal
**Última Atualização**: 2025-01-09

---

## 🎯 Visão Geral do Projeto

### Objetivo Principal

Desenvolver um **Portal Container / Shell Application** que atua como gateway centralizado para aplicações de negócio da Instituição de Pagamento (IP), focado em:

- ✅ **Autenticação Centralizada** - SSO via Keycloak (OAuth2/OIDC)
- ✅ **Autorização Granular** - RBAC (collection, field, document-level)
- ✅ **Gestão de Aplicações** - CRUD de apps externas registradas
- ✅ **Menu Dinâmico** - Menu hierárquico com RBAC
- ✅ **Renderização de Apps** - Iframe com comunicação bidirecional
- ✅ **Multi-idioma** - pt-BR, en-US, es-ES (nativo)
- ✅ **Compliance** - Audit logs append-only, LGPD básico

### Contexto de Negócio

**Problema**: A IP possui múltiplos módulos de negócio desenvolvidos por times diferentes (Gestão de Cadastro, Contas, Billing, DICT/PIX, Reports, etc.). Falta um ponto de entrada unificado com SSO e controle de acesso centralizado.

**Solução**: Utilizar **PayloadCMS 3.x** como plataforma base (headless CMS + Next.js 15) para criar portal que:
- **NÃO** implementa lógica de negócio (cadastro, contas, billing, etc.)
- **SIM** gerencia autenticação, autorização, menu, rendering de apps externas

**Analogia**: O portal é como o **Windows Explorer** ou **macOS Finder** - fornece estrutura, navegação e acesso, mas os "programas" (módulos de negócio) rodam dentro dele.

**Valor de Negócio**:
- Time-to-market: 10 semanas (vs 6 meses desenvolvendo do zero)
- Redução de custo: ~60% (usando PayloadCMS vs desenvolvimento custom)
- Tecnologia agnóstica: Apps podem ser React, Vue, Angular, Svelte, Go + HTMX, etc.
- Menus 100% dinâmicos: Sem deployments para mudar menu

---

## 🏗️ Arquitetura Técnica

### Stack Tecnológico

| Camada | Tecnologia | Versão | Papel | Documentação |
|--------|------------|--------|-------|--------------|
| **CMS/Framework** | PayloadCMS | 3.x | Headless CMS + Next.js nativo | [Payload Docs](https://payloadcms.com/docs) |
| **Frontend Framework** | Next.js | 15.4.7 | App Router, Server Components, SSR/SSG | [Next.js Docs](https://nextjs.org/docs) |
| **Language** | TypeScript | 5.7.3 | Type-safe, strict mode | [TS Handbook](https://www.typescriptlang.org/docs) |
| **UI Framework** | React | 19.1.1 | Component library | [React Docs](https://react.dev) |
| **Database** | PostgreSQL | 15+ | Portal metadata (users, roles, apps, menu) | [PostgreSQL Docs](https://www.postgresql.org/docs/15) |
| **ORM** | Drizzle ORM | Latest | Type-safe queries via Payload | [Drizzle Docs](https://orm.drizzle.team) |
| **Authentication** | Keycloak | 23+ | SSO, OAuth2/OIDC, user federation | [Keycloak Docs](https://www.keycloak.org/docs) |
| **Styling** | TailwindCSS | 4.x | Utility-first CSS | [Tailwind Docs](https://tailwindcss.com/docs) |
| **UI Components** | shadcn/ui | Latest | Accessible components (Radix UI) | [shadcn/ui](https://ui.shadcn.com) |
| **Icons** | Lucide Icons | Latest | 2000+ icons | [Lucide](https://lucide.dev) |

### Arquitetura de Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│              PORTAL CONTAINER (Next.js 15 + PayloadCMS)         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  LAYOUT DO PORTAL                                        │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │ Header: Logo | Breadcrumb | Lang | User Menu      │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │  ┌──────────┐  ┌────────────────────────────────────┐   │   │
│  │  │          │  │                                    │   │   │
│  │  │ Sidebar  │  │  MAIN CONTENT AREA                 │   │   │
│  │  │ (Menu)   │  │  ┌──────────────────────────────┐  │   │   │
│  │  │          │  │  │                              │  │   │   │
│  │  │ 📊 Home  │  │  │  <iframe>                    │  │   │   │
│  │  │ 👥 Users │  │  │    External App              │  │   │   │
│  │  │ 🏢 PJ    │  │  │    (Gestão Cadastro,         │  │   │   │
│  │  │ 💳 Contas│  │  │     Contas, Billing, etc.)   │  │   │   │
│  │  │ 📈 Billing│ │  │  </iframe>                   │  │   │   │
│  │  └──────────┘  └────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  RESPONSABILIDADES:                                             │
│  ✅ Autenticação via Keycloak                                  │
│  ✅ RBAC (verificação de permissões)                           │
│  ✅ Menu dinâmico (renderização)                               │
│  ✅ Gestão de aplicações (CRUD)                                │
│  ✅ Iframe rendering + postMessage API                         │
│  ✅ Multi-idioma (i18n)                                        │
│  ✅ Audit logs                                                 │
└─────────────────┬───────────────────────────┬─────────────────┘
                  │                           │
         ┌────────▼──────────┐       ┌────────▼─────────────┐
         │   KEYCLOAK        │       │   POSTGRESQL         │
         │   (Auth Server)   │       │   (Portal Metadata)  │
         │                   │       │                      │
         │ - Users           │       │ - users              │
         │ - Roles           │       │ - roles              │
         │ - Permissions     │       │ - permissions        │
         │ - Sessions        │       │ - applications       │
         │ - 2FA/MFA         │       │ - menu_items         │
         └───────────────────┘       │ - audit_logs         │
                                     └──────────────────────┘
                  │
                  │  HTTP/gRPC
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│         APLICAÇÕES EXTERNAS (Business Modules)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Gestão PJ   │  │  Gestão de   │  │   Billing    │          │
│  │  (React)     │  │  Contas (Vue)│  │  (Angular)   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📚 Documentação Disponível

### Especificações Técnicas

| Documento | Tamanho | Descrição |
|-----------|---------|-----------|
| **[ESPECIFICACAO_TECNICA_PORTAL_CONTAINER_PAYLOADCMS.md](../ESPECIFICACAO_TECNICA_PORTAL_CONTAINER_PAYLOADCMS.md)** | ~50k palavras | Especificação técnica completa do Portal Container. 10 Collections, auth flow, RBAC, iframe rendering, i18n. **Fonte da verdade técnica.** |
| **[ESTRATEGIA_EXTENSIBILIDADE_PAYLOADCMS.md](../ESTRATEGIA_EXTENSIBILIDADE_PAYLOADCMS.md)** | ~20k palavras | Estratégia de versionamento, Docker, CI/CD. **NÃO precisamos fork**. Payload como NPM dependency. |
| **[PARECER_EXECUTIVO_PAYLOADCMS.md](../PARECER_EXECUTIVO_PAYLOADCMS.md)** | ~15k palavras | Parecer executivo (Score 9.2/10) validando PayloadCMS para projeto. |

### Planejamento de Implementação

| Documento | Descrição |
|-----------|-----------|
| **[PRODUCT_BACKLOG_PAYLOADCMS.md](../PRODUCT_BACKLOG_PAYLOADCMS.md)** | 35 User Stories, 200 pts, 10 semanas. Critérios de aceitação detalhados, tasks técnicas, validation scripts. |
| **[SQUAD_AGENTES_PAYLOADCMS.md](../SQUAD_AGENTES_PAYLOADCMS.md)** | 12 agentes especializados. Perfis, RACI matrix, skills matrix, alocação por sprint. |

---

## 📊 Modelo de Dados (10 Collections)

O Portal Container gerencia apenas **metadata de portal**, não dados de negócio:

| Collection | Descrição | Responsabilidade |
|------------|-----------|------------------|
| **users** | Shadow users (sync do Keycloak) | Payload + Keycloak |
| **roles** | Papéis de acesso (SuperAdmin, Admin, Operator, etc.) | Payload |
| **permissions** | Permissões granulares (resource.action) | Payload |
| **applications** | Apps externas registradas | Admin via Payload UI |
| **menu_items** | Menu hierárquico (parent/child) | Admin via Payload UI |
| **portal_settings** | Global singleton (logo, branding, i18n) | Admin via Payload UI |
| **audit_logs** | Logs imutáveis (append-only) | Sistema (hooks) |
| **notifications** | Notificações do portal | Sistema (hooks) |
| **media** | Uploads (logo, avatars) | Payload built-in |

**Detalhes completos:** Ver [ESPECIFICACAO_TECNICA_PORTAL_CONTAINER_PAYLOADCMS.md](../ESPECIFICACAO_TECNICA_PORTAL_CONTAINER_PAYLOADCMS.md) seção "Modelo de Dados".

---

## 👥 Squad Técnica (12 Agentes Especializados)

| Agente | Papel | Especialização | Sprint Focus |
|--------|-------|----------------|--------------|
| **AGENT-MAESTRO-001** | Tech Lead | Coordenação, code review, arquitetura | Todos sprints |
| **AGENT-SCRUM-002** | Scrum Master | Facilitação ágil, backlog | Todos sprints |
| **AGENT-PAYLOADCMS-003** | PayloadCMS Specialist | Collections, hooks, plugins | Sprint 2-4 |
| **AGENT-FRONTEND-008** | Frontend Dev (Next.js) | React 19, components, UI | Sprint 3-4 |
| **AGENT-BACKEND-007** | Backend Dev (Node.js) | Endpoints, validation | Sprint 2-3 |
| **AGENT-KEYCLOAK-006** | Keycloak IAM | SSO, OAuth2, role mapping | Sprint 1-2 |
| **AGENT-DB-009** | Database Engineer | PostgreSQL, migrations | Sprint 1-2 |
| **AGENT-DEVOPS-012** | DevOps / SRE | Docker, CI/CD | Sprint 1, 5 |
| **AGENT-QA-010** | QA Engineer | E2E tests, manual QA | Sprint 4-5 |
| **AGENT-TYPESCRIPT-PRO** | TypeScript Specialist | Type safety, code review | Todos sprints |
| **AGENT-SECURITY-011** | Security Auditor | OWASP, pentest | Sprint 5 |
| **AGENT-DOC-013** | Documentation | Docs, runbooks | Todos sprints |

**Detalhes completos:** Ver [SQUAD_AGENTES_PAYLOADCMS.md](../SQUAD_AGENTES_PAYLOADCMS.md).

---

## 📅 Cronograma (10 Semanas, 5 Sprints)

| Sprint | Duração | Sprint Goal | Story Points | Milestone |
|--------|---------|-------------|--------------|-----------|
| **Sprint 1** | Semanas 1-2 | Infraestrutura (Docker, PostgreSQL, Keycloak) | 34 pts | M1: Infrastructure Ready |
| **Sprint 2** | Semanas 3-4 | Autenticação (OAuth2, shadow users, RBAC) | 34 pts | M2: Auth Working |
| **Sprint 3** | Semanas 5-6 | Aplicações e Menu (CRUD apps, menu tree, RBAC) | 43 pts | M3: Portal Core |
| **Sprint 4** | Semanas 7-8 | Rendering (Iframe, postMessage, badges) | 50 pts | M4: App Rendering |
| **Sprint 5** | Semanas 9-10 | Polish (i18n, audit logs, themes, QA) | 39 pts | M5: Production Ready |

**Total:** 200 story points, 10 semanas, ~20 pts/semana velocity média.

---

## 📋 Product Backlog (Resumo)

### Épicos

| Épico | Story Points | Descrição |
|-------|--------------|-----------|
| **EPIC-01** - Infraestrutura | 40 pts | Docker Compose, PostgreSQL, Keycloak, CI/CD |
| **EPIC-02** - Autenticação | 35 pts | OAuth2, shadow users, sync roles |
| **EPIC-03** - RBAC | 30 pts | Roles, permissions, access control |
| **EPIC-04** - Gestão de Apps | 25 pts | CRUD applications, health checks |
| **EPIC-05** - Menu Dinâmico | 30 pts | Menu tree, badges, RBAC filtering |
| **EPIC-06** - Rendering | 25 pts | Iframe, postMessage, token passing |
| **EPIC-07** - i18n & Config | 15 pts | Multi-idioma, global settings, themes |
| **EPIC-08** - Compliance | 20 pts | Audit logs, LGPD básico, security audit |

### User Stories Principais (Exemplos)

**US-001: Setup de Repositório** (8 pts)
- Repositório Git estruturado
- PayloadCMS 3.x + Next.js 15 instalado
- TypeScript strict mode configurado

**US-006: Keycloak OAuth2 Strategy** (13 pts)
- Custom auth strategy implementada
- OAuth2 callback endpoint funcionando
- Shadow user auto-creation

**US-021: Collection MenuItems** (8 pts)
- Menu hierárquico (parent/child)
- Badges configuráveis
- RBAC filtering

**US-026: ApplicationFrame Component** (8 pts)
- Iframe rendering
- Loading states, error handling
- PostMessage API (portal ↔ iframe)

**Detalhes completos:** Ver [PRODUCT_BACKLOG_PAYLOADCMS.md](../PRODUCT_BACKLOG_PAYLOADCMS.md).

---

## 🎨 Padrões e Convenções de Código

### Code Style

**Linguagens**: TypeScript (strict mode), React 19 (Server + Client Components)

**Formatação**:
- Prettier: `--single-quote --semi --trailing-comma all --print-width 100`
- ESLint: `@typescript-eslint/recommended`, `next/core-web-vitals`

**Naming Conventions**:
- **Variáveis**: `camelCase` (ex: `userId`, `applicationSlug`)
- **Constantes**: `UPPER_SNAKE_CASE` (ex: `MAX_MENU_DEPTH`, `API_BASE_URL`)
- **Interfaces/Types**: `PascalCase` (ex: `User`, `Application`, `MenuItem`)
- **Arquivos**: `kebab-case` (ex: `application-frame.tsx`, `keycloak-auth.ts`)
- **Collections Payload**: `snake_case` (ex: `users`, `menu_items`, `audit_logs`)

### Git Workflow

**Branch Strategy**: GitFlow

```
main                    # Produção
  ├── develop           # Staging
      ├── feature/US-001-repo-setup
      ├── feature/US-006-keycloak-oauth
      └── hotfix/fix-login
```

**Commit Messages**: Conventional Commits

```
feat(collections): add applications collection

- Created applications collection with 15 fields
- Configured iframe sandbox options
- Added RBAC access control

Closes US-016
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`

### Pull Request Guidelines

**Aprovações**: 2 obrigatórias (especialista + MAESTRO-001)

**Checklist**:
- [ ] Code segue style guide
- [ ] TypeScript strict mode (no `any`)
- [ ] Unit tests (se aplicável)
- [ ] Self-review realizado
- [ ] CI passing (lint, typecheck, build)

---

## 🔒 Segurança e Compliance

### OWASP Top 10 (Mitigações)

✅ **A01: Broken Access Control** - RBAC field-level via Payload
✅ **A02: Cryptographic Failures** - TLS 1.3, PostgreSQL TDE
✅ **A03: Injection** - Drizzle ORM (SQL injection prevention)
✅ **A07: Auth/AuthZ Failures** - Keycloak SSO, MFA, session timeout

### Audit Logs

- ✅ **Append-only** - Hook `beforeChange` bloqueia updates/deletes
- ✅ **Retenção** - 5 anos (compliance)
- ✅ **Campos logados** - user, action, resource, timestamp, IP, user-agent

### LGPD (Básico)

- ✅ **Consentimento** - Política de privacidade publicada
- ✅ **Acesso aos dados** - Endpoint `/api/users/me`
- ✅ **Portabilidade** - Export JSON/CSV via Payload Admin
- ✅ **Anonimização** - Soft delete (`deleted_at`)

---

## 💡 Diretrizes para Claude Code

### Quando Trabalhar Neste Projeto

**1. SEMPRE consulte documentação ANTES de implementar**:
- User Story completa: [PRODUCT_BACKLOG_PAYLOADCMS.md](../PRODUCT_BACKLOG_PAYLOADCMS.md)
- Especificação técnica: [ESPECIFICACAO_TECNICA_PORTAL_CONTAINER_PAYLOADCMS.md](../ESPECIFICACAO_TECNICA_PORTAL_CONTAINER_PAYLOADCMS.md)

**2. Siga RIGOROSAMENTE os critérios de aceitação**:
- Cada User Story tem [AC-XXX.Y]
- Implemente validation scripts (bash + expected output)
- Marque checkboxes conforme completa

**3. Arquitetura PayloadCMS**:
- NUNCA modificar `node_modules/payload/`
- SEMPRE customizar via `src/payload/` (collections, hooks, plugins)
- Config em `payload.config.ts` (declarativo)

**4. Docker e Versionamento**:
- PayloadCMS como NPM dependency (NÃO fork)
- Dockerfile multi-stage (deps → build → run)
- Dependabot auto-merge patches

**5. Code Review obrigatório**:
- NUNCA commit direto em `main` ou `develop`
- PR com 2+ aprovações
- CI deve passar (lint, typecheck, build)

### Estrutura de Arquivos do Projeto

```
lb-portal-container/
├── package.json                # Payload como dependency
├── payload.config.ts           # Config entrypoint
├── docker-compose.yml          # Stack completa
├── src/
│   ├── payload/                # ⚠️ CUSTOM CODE
│   │   ├── collections/       # Users, Roles, Applications, MenuItems
│   │   ├── hooks/             # afterLogin, auditLog, keycloakSync
│   │   ├── endpoints/         # oauth-callback, badge-api
│   │   └── plugins/           # keycloak-auth
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/
│   │   ├── (portal)/
│   │   └── api/
│   ├── components/             # React components
│   │   ├── portal/            # Sidebar, ApplicationFrame
│   │   └── ui/                # shadcn/ui
│   └── lib/
│       ├── keycloak.ts
│       └── permissions.ts
├── public/
└── node_modules/
    └── payload/                # ⚠️ OFICIAL (NPM) - NUNCA MODIFICAR
```

### Comandos Úteis

```bash
# Desenvolvimento Local
npm run dev                     # Next.js dev server
npm run generate:types          # Generate Payload types
npm run migrate                 # Apply migrations
npm run seed                    # Seed database

# Docker
docker-compose up -d            # Start stack
docker-compose logs -f portal   # View logs

# TypeScript
npx tsc --noEmit                # Type check

# Tests
npm test                        # Unit tests
npm run test:e2e               # E2E tests (Playwright)
```

---

## 📞 Contatos e Comunicação

**Tech Lead**: AGENT-MAESTRO-001
**Scrum Master**: AGENT-SCRUM-002

**Cerimônias Ágeis**:
- **Daily Standup**: 09:00 (15min) - Todos os dias
- **Sprint Planning**: Dia 1 do sprint (4h)
- **Sprint Review**: Último dia (2h)
- **Retrospective**: Último dia após review (1.5h)

---

## 📝 FAQ (Perguntas Frequentes)

### 1. PayloadCMS é um CMS tradicional como WordPress?

**Resposta**: Não. PayloadCMS é um **headless CMS + framework** que combina:
- CMS backend (admin UI, collections, RBAC)
- Next.js 15 integrado (frontend framework)
- TypeScript first (type-safe)
- Extensível via config (não fork)

### 2. Por que NÃO precisamos fork do PayloadCMS?

**Resposta**: PayloadCMS foi projetado para extensibilidade via:
- Collections (config declarativa)
- Hooks (lifecycle events)
- Plugins (reusable extensions)
- Custom endpoints (REST API custom)
- Access control functions (RBAC)

Tudo via **configuração**, não modificação de código-fonte.

### 3. Como funciona shadow users (Keycloak → Payload)?

**Resposta**:
1. User faz login via Keycloak
2. Keycloak retorna JWT com claims (sub, email, roles)
3. Payload recebe JWT e valida
4. Hook `afterLogin` busca user por `keycloak_sub`
5. Se não existe, cria shadow user com dados do JWT
6. Sync de roles (Keycloak → Payload)

### 4. Aplicações externas podem usar qualquer tecnologia?

**Resposta**: Sim! Apps podem ser React, Vue, Angular, Svelte, Go + HTMX, etc. Requisitos:
- Aceitar token JWT (via query param ou postMessage)
- Implementar postMessage API (opcional)
- Seguir design system do portal (opcional, recomendado)

### 5. Como deployar em produção?

**Resposta**:
1. Merge PR em `main`
2. CI build Docker image → push ECR
3. Deploy manual (kubectl apply ou Helm)
4. Smoke tests
5. Monitorar por 24h

---

## ✅ Status Atual do Projeto

**Fase**: 📋 Planejamento Completo
**Próximo Passo**: Kickoff Sprint 1 (D+0)

**Documentação**:
- ✅ Especificação Técnica: 100% completa
- ✅ Product Backlog: 35 User Stories, 200 pts
- ✅ Squad Definida: 12 agentes especializados
- ✅ Cronograma: 10 semanas planejadas
- ✅ Estratégia de Extensibilidade: Documentada

**Repositório**:
- ✅ Estrutura definida
- ✅ .claude/Claude.md (este arquivo)
- ⏳ Código fonte: Será criado durante Sprint 1-5

---

**🚀 PROJETO PRONTO PARA INICIAR IMPLEMENTAÇÃO**

**Última Atualização**: 2025-01-09
**Versão**: 2.0 (PayloadCMS Edition)
**Mantido por**: AGENT-MAESTRO-001, AGENT-DOC-013
