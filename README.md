# LB Portal Container (PayloadCMS)

**Portal Container / Shell Application** - Gateway centralizado para aplicações de negócio da Instituição de Pagamento (IP)

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PayloadCMS](https://img.shields.io/badge/PayloadCMS-3.x-5E31DC)](https://payloadcms.com)
[![Next.js](https://img.shields.io/badge/Next.js-15.4.7-000000)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-3178C6)](https://www.typescriptlang.org)

---

## 🎯 Visão Geral

Portal administrativo que atua como **gateway centralizado** para múltiplas aplicações de negócio, fornecendo:

- ✅ **Autenticação Centralizada** - SSO via Keycloak (OAuth2/OIDC)
- ✅ **Autorização Granular** - RBAC (collection, field, document-level)
- ✅ **Gestão de Aplicações** - CRUD de apps externas registradas
- ✅ **Menu Dinâmico** - Menu hierárquico configurável com RBAC
- ✅ **Renderização de Apps** - Iframe com comunicação bidirecional
- ✅ **Multi-idioma** - pt-BR, en-US, es-ES (nativo)
- ✅ **Compliance** - Audit logs append-only, LGPD básico

### Analogia

O portal é como o **Windows Explorer** ou **macOS Finder** - fornece estrutura, navegação e acesso, mas os "programas" (módulos de negócio) rodam dentro dele.

**O portal NÃO implementa lógica de negócio** (cadastro, contas, billing, etc.)
**O portal SIM gerencia** autenticação, autorização, menu, rendering de apps externas

---

## 🏗️ Arquitetura

### Stack Tecnológico

| Camada | Tecnologia | Versão | Papel |
|--------|------------|--------|-------|
| **CMS/Framework** | PayloadCMS | 3.x | Headless CMS + Next.js nativo |
| **Frontend Framework** | Next.js | 15.4.7 | App Router, Server Components |
| **Language** | TypeScript | 5.7.3 | Type-safe, strict mode |
| **UI Framework** | React | 19.1.1 | Component library |
| **Database** | PostgreSQL | 15+ | Portal metadata |
| **ORM** | Drizzle ORM | Latest | Type-safe queries |
| **Authentication** | Keycloak | 23+ | SSO, OAuth2/OIDC |
| **Styling** | TailwindCSS | 4.x | Utility-first CSS |
| **UI Components** | shadcn/ui | Latest | Accessible components |

### Componentes

```
┌─────────────────────────────────────────────────┐
│         PORTAL CONTAINER (PayloadCMS)           │
│  ┌───────────────────────────────────────────┐  │
│  │  Header: Logo | Breadcrumb | Lang | User │  │
│  └───────────────────────────────────────────┘  │
│  ┌──────────┐  ┌──────────────────────────┐    │
│  │          │  │                          │    │
│  │ Sidebar  │  │  <iframe>                │    │
│  │ (Menu)   │  │    External App          │    │
│  │          │  │  </iframe>               │    │
│  │ 📊 Home  │  │                          │    │
│  │ 👥 Users │  │                          │    │
│  │ 🏢 PJ    │  │                          │    │
│  │ 💳 Contas│  │                          │    │
│  └──────────┘  └──────────────────────────┘    │
└─────────────┬───────────────┬──────────────────┘
              │               │
      ┌───────▼──────┐  ┌────▼─────────┐
      │  KEYCLOAK    │  │  POSTGRESQL  │
      │  (Auth)      │  │  (Metadata)  │
      └──────────────┘  └──────────────┘
```

---

## 📚 Documentação

### Especificações Técnicas

- **[ESPECIFICACAO_TECNICA_PORTAL_CONTAINER_PAYLOADCMS.md](ESPECIFICACAO_TECNICA_PORTAL_CONTAINER_PAYLOADCMS.md)** (~50k palavras) - Especificação técnica completa, 10 Collections, auth flow, RBAC
- **[ESTRATEGIA_EXTENSIBILIDADE_PAYLOADCMS.md](ESTRATEGIA_EXTENSIBILIDADE_PAYLOADCMS.md)** (~20k palavras) - Zero fork strategy, Docker, CI/CD
- **[PARECER_EXECUTIVO_PAYLOADCMS.md](PARECER_EXECUTIVO_PAYLOADCMS.md)** (~15k palavras) - Executive summary (Score 9.2/10)

### Planejamento

- **[PRODUCT_BACKLOG_PAYLOADCMS.md](PRODUCT_BACKLOG_PAYLOADCMS.md)** - 35 User Stories, 200 story points, 10 semanas
- **[SQUAD_AGENTES_PAYLOADCMS.md](SQUAD_AGENTES_PAYLOADCMS.md)** - 12 agentes especializados, RACI matrix
- **[CRONOGRAMA_SPRINTS_PAYLOADCMS.md](CRONOGRAMA_SPRINTS_PAYLOADCMS.md)** - Cronograma detalhado sprint-by-sprint

---

## 🚀 Quick Start

### Pré-requisitos

- Node.js 20.18.1+ (via nvm: `nvm use`)
- Docker 24+ e Docker Compose
- PostgreSQL 15+ (via Docker)
- Git

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/LBPAY-LAB/lb_bo_portal.git
cd lb_bo_portal

# 2. Instalar dependências
npm install

# 3. Copiar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# 4. Subir stack (PostgreSQL + Keycloak)
docker-compose up -d

# 5. Aguardar serviços (30-60 segundos)
docker-compose ps

# 6. Gerar tipos do Payload
npm run generate:types

# 7. Iniciar servidor de desenvolvimento
npm run dev
```

Acesse:
- **Portal Admin**: http://localhost:3000/admin
- **Keycloak Admin**: http://localhost:8080 (admin/admin)
- **PostgreSQL**: localhost:5432 (portal_user/portal_dev_pass)

---

## 📋 Scripts Disponíveis

```bash
npm run dev              # Development server
npm run build            # Production build
npm run start            # Production server
npm run lint             # ESLint (max 0 warnings)
npm run typecheck        # TypeScript type checking
npm run format           # Prettier formatting
npm run validate         # ALL checks (typecheck + lint + format)
npm run generate:types   # PayloadCMS types generation
```

---

## 🏗️ Estrutura do Projeto

```
lb_bo_portal/
├── .claude/                    # Claude Code project context
│   └── Claude.md              # Project instructions for AI
├── docker/                     # Docker configurations
│   ├── postgres/
│   │   └── init-db.sh         # Database initialization
│   └── keycloak/
│       └── realm.json         # Keycloak realm config
├── docs/                       # Documentation
│   └── database/
│       ├── SCHEMA_OVERVIEW.md
│       └── MIGRATION_STRATEGY.md
├── src/                        # Source code (to be created)
│   ├── payload/               # PayloadCMS custom code
│   │   ├── collections/      # Data models
│   │   ├── hooks/            # Lifecycle hooks
│   │   ├── endpoints/        # Custom API endpoints
│   │   └── plugins/          # Reusable plugins
│   ├── app/                   # Next.js App Router
│   ├── components/            # React components
│   └── lib/                   # Utilities
├── public/                     # Static assets
├── docker-compose.yml         # Docker stack definition
├── package.json               # Dependencies & scripts
├── tsconfig.json              # TypeScript configuration
├── payload.config.ts          # PayloadCMS config (to be created)
└── .env.example               # Environment variables template
```

---

## 🔒 Segurança

- ✅ **OWASP Top 10** - Mitigações implementadas
- ✅ **Audit Logs** - Append-only, retenção 5 anos
- ✅ **LGPD** - Consentimento, portabilidade, anonimização
- ✅ **TLS 1.3** - Criptografia enforced
- ✅ **RBAC** - Field-level permissions

---

## 📅 Roadmap

### Sprint 1 (Semanas 1-2) - Infraestrutura
- [x] Docker Compose stack (PostgreSQL, Keycloak)
- [x] TypeScript configuration
- [ ] PayloadCMS initialization
- [ ] OAuth2 authentication

### Sprint 2 (Semanas 3-4) - Autenticação
- [ ] Shadow users (Keycloak → Payload sync)
- [ ] RBAC implementation
- [ ] Collections setup

### Sprint 3 (Semanas 5-6) - Portal Core
- [ ] Applications CRUD
- [ ] Menu management
- [ ] Sidebar component

### Sprint 4 (Semanas 7-8) - Rendering
- [ ] Iframe rendering
- [ ] PostMessage API
- [ ] Token passing

### Sprint 5 (Semanas 9-10) - Polish
- [ ] Multi-idioma (i18n)
- [ ] Audit logs
- [ ] E2E tests
- [ ] Production deployment

---

## 👥 Squad Técnica

| Agente | Papel | Especialização |
|--------|-------|----------------|
| **AGENT-MAESTRO-001** | Tech Lead | Coordenação, code review |
| **AGENT-SCRUM-002** | Scrum Master | Facilitação ágil |
| **AGENT-PAYLOADCMS-003** | PayloadCMS Specialist | Collections, hooks, plugins |
| **AGENT-FRONTEND-008** | Frontend Dev | React 19, Next.js 15 |
| **AGENT-KEYCLOAK-006** | Keycloak IAM | SSO, OAuth2 |
| **AGENT-DEVOPS-012** | DevOps/SRE | Docker, CI/CD |

[Ver squad completa](SQUAD_AGENTES_PAYLOADCMS.md)

---

## 📞 Contatos

- **Organização**: [LBPAY-LAB](https://github.com/LBPAY-LAB)
- **Repositório**: [lb_bo_portal](https://github.com/LBPAY-LAB/lb_bo_portal)
- **Issues**: [GitHub Issues](https://github.com/LBPAY-LAB/lb_bo_portal/issues)

---

## 📝 Licença

Este projeto é proprietário da LBPay - Instituição de Pagamento.

---

## 🎯 Status

**Fase**: 🏗️ **Em Desenvolvimento** - Sprint 1 em andamento

**Última Atualização**: 2025-11-09
**Versão**: 0.1.0-alpha
