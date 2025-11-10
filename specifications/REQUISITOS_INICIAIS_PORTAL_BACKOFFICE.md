# 📘 REQUISITOS INICIAIS - PORTAL DE BACKOFFICE IP PARTICIPANTE DIRETO PIX

**Projeto:** Portal de Backoffice LBPay
**Cliente:** IP Participante Direta PIX - Banco Central do Brasil
**Versão:** 1.0
**Data:** 07 de Janeiro de 2025
**Status:** Documento de Requisitos Iniciais

---

## 🎯 VISÃO GERAL DO PROJETO

### Contexto de Negócio

Somos uma IP (Instituição de Pagamento) licenciada pelo Banco Central do Brasil e participante direta do ecossistema PIX. Estamos na fase de implementação do Core Bancário e integração direta com SPI (PIX IN/OUT) e DICT (Chaves PIX).

Os módulos core já estão implementados:
- ✅ Ledger (TigerBeetle)
- ✅ Gestão do PIX/OUT
- ✅ Gateways de integração
- ✅ DICT (Chaves PIX)

### Objetivo do Portal

Desenvolver um **portal de backoffice moderno, escalável e altamente configurável** para gestão completa da operação da IP, com foco em:

1. **UX/UI de excelência** - Experiência fluente e agradável
2. **Configurabilidade total** - Tudo configurável via interface
3. **Compliance nativo** - Auditoria, LGPD e regulamentação Bacen
4. **Arquitetura orientada a workflows** - Temporal como motor de orquestração
5. **Segurança em múltiplas camadas** - IAM, RBAC, 2FA, auditoria completa

---

## 🏗️ ARQUITETURA CENTRAL: ORGANISMOS VIVOS ORQUESTRADOS

### Conceito Fundamental

**TUDO no sistema é um "Organismo Vivo" gerenciado por Workflows Temporal:**

- 🧬 **Entidades (PJ/PF)** → EntityWorkflow
- 👥 **Clientes** → CustomerWorkflow
- 💳 **Contas de Pagamento** → AccountWorkflow
- 👤 **Usuários do Portal** → UserWorkflow
- 💸 **Transações PIX** → TransactionWorkflow
- 🔑 **Chaves DICT** → DICTKeyWorkflow
- 📋 **Claims (Portabilidade)** → ClaimWorkflow
- ⚖️ **Disputas** → DisputeWorkflow
- 🔄 **E muito mais...**

### Características de Cada Organismo

Cada organismo:
- ✅ TEM seu próprio Workflow Temporal (ciclo de vida completo)
- ✅ RECEBE e ENVIA sinais para outros workflows
- ✅ PERSISTE estado em PostgreSQL (materialized view)
- ✅ SEGUE regras de negócio (OPA)
- ✅ RESPEITA permissões (Keycloak + Cerbos)
- ✅ ESTÁ SEMPRE em um estado conhecido e auditável

---

## 🎨 STACK TECNOLÓGICA

### Frontend
```
- Next.js 15 (App Router + Server Components)
- TypeScript 5.x (strict mode)
- TailwindCSS 4 + shadcn/ui
- Radix UI (primitives acessíveis)
- React Hook Form + Zod (validações)
- TanStack Query v5 (estado servidor + cache)
- TanStack Table v8 (tabelas avançadas)
- Zustand (estado global leve)
- date-fns + react-day-picker (calendário)
- Framer Motion (animações fluidas)
- Lucide Icons
- Sonner (toasts)
- next-intl (internacionalização)
```

### Backend
```
- Go 1.22+ (Fiber ou Echo framework)
- PostgreSQL 16 (TimescaleDB para audit logs)
- Redis 7 (cache + sessions)
- MinIO (S3-compatible storage para documentos)
- Temporal (workflows orchestration)
```

### Segurança & Autorização
```
- Keycloak (Identity & Access Management)
- Cerbos ou OPA (Policy Engine para RBAC)
- JWT (access + refresh tokens)
- 2FA (TOTP - Google Authenticator)
```

### Infraestrutura & Observabilidade
```
- Docker + Docker Compose (desenvolvimento)
- Kubernetes (produção)
- GitHub Actions (CI/CD)
- Prometheus + Grafana (métricas)
- Loki (logs estruturados)
- Jaeger (distributed tracing)
- OpenTelemetry (instrumentação)
```

---

## 🔄 ARQUITETURA DE ORQUESTRAÇÃO

### Stack de Orquestração

```
┌─────────────────────────────────────────────────┐
│ PORTAL (Frontend - Next.js)                     │
│ - Renderiza estados visuais                     │
│ - Dispara ações (sinais para workflows)         │
│ - Consulta estados (PostgreSQL read models)     │
└──────────────────┬──────────────────────────────┘
                   │ REST/GraphQL API
┌──────────────────▼──────────────────────────────┐
│ API GATEWAY (Backend - Go)                      │
│ - Valida JWT (Keycloak)                         │
│ - Checa permissões (Cerbos)                     │
│ - Roteia para workflows ou queries              │
└─────┬───────────────────────────────────────────┘
      │
      ├─────────────────────────────────────────┐
      │                                         │
┌─────▼──────────┐                   ┌──────────▼────────┐
│ TEMPORAL       │◄──signals/queries─►│ POSTGRESQL        │
│ (Workflows)    │                   │ (State Store)     │
│                │                   │                   │
│ - Entity WF    │                   │ - entities table  │
│ - Customer WF  │                   │ - customers table │
│ - Account WF   │◄──────────────────┤ - accounts table  │
│ - User WF      │   persist state   │ - users table     │
│ - Transaction  │                   │ - audit_logs      │
│   WF           │                   │ - workflow_state  │
└────┬───────────┘                   └───────────────────┘
     │
     │ evaluate rules
     │
┌────▼──────────────────────────────────────────────┐
│ POLICY ENGINES                                    │
│ ┌──────────┐  ┌──────────┐                        │
│ │ CERBOS   │  │   OPA    │                        │
│ │ (RBAC +  │  │ (Business│                        │
│ │  AuthZ)  │  │  Rules)  │                        │
│ └──────────┘  └──────────┘                        │
└────┬──────────────────────────────────────────────┘
     │
     │ user identity
     │
┌────▼───────────┐
│ KEYCLOAK (IAM) │
│ - Users        │
│ - Roles        │
│ - Sessions     │
└────────────────┘
```

### Divisão de Responsabilidades

**Keycloak (IAM):**
- Quem é o usuário?
- Autenticação (OAuth2/OIDC)
- Gestão de sessões
- 2FA

**Cerbos (Autorização de Usuários):**
- O que o usuário pode fazer?
- RBAC: "User X pode aprovar KYC?"
- Permissões baseadas em roles
- Políticas de acesso

**OPA (Regras de Negócio):**
- O que a entidade/recurso pode fazer?
- "PJ pode criar customer se KYC != APPROVED?"
- "Empresa Betting deve ter 2 contas?"
- Validação de regras de compliance

**Temporal (Orquestração):**
- Como fazer?
- Gerenciamento do ciclo de vida
- Comunicação entre workflows (signals)
- Estado durável e resiliente

**PostgreSQL (Persistência):**
- Onde estão os dados?
- Materialized views (read models)
- Relacionamentos entre entidades
- Queries otimizadas para o Portal

**Portal (Interface):**
- Como mostrar?
- Visualização de estados
- Disparar ações
- UX/UI responsiva e fluida

---

## 📐 DESENVOLVIMENTO EM CAMADAS PROGRESSIVAS

### FASE 0: FOUNDATIONS (6-8 semanas)

**Objetivo:** Base configurável do portal sem módulos de negócio

#### 0.1. Estrutura de Layout Base
- Header (topo): Logo, breadcrumb, seletor de idioma, notificações, perfil
- Sidebar (menu lateral): Menu tree, ícones, badges, colapsável
- Main Content (área principal): Conteúdo dinâmico baseado em rotas
- Footer (rodapé): Versão, links úteis, copyright
- Layout responsivo (desktop, tablet, mobile)
- Tema claro/escuro

#### 0.2. Sistema de Autenticação (IAM)
- Login com email/password
- OAuth2/OIDC (Keycloak)
- Two-Factor Authentication (2FA - TOTP)
- Gestão de sessões (JWT + refresh tokens)
- Password management (recuperação, políticas)
- Logout em múltiplos dispositivos
- Timeout por inatividade

#### 0.3. Sistema de Autorização (RBAC)
- Roles (SuperAdmin, ComplianceOfficer, Operator, Viewer)
- Permissions granulares (resource.action)
- User-Role assignments
- Policy engine (Cerbos ou OPA)
- Verificação em runtime no frontend e backend
- Permissões diretas a usuários (override)

#### 0.4. Gestão Dinâmica de Menus
- CRUD de itens de menu via interface
- Hierarquia (parent/child)
- Reordenação (drag & drop)
- Ícones customizáveis (Lucide icons)
- Badges dinâmicos (queries, valores estáticos)
- Visibilidade baseada em permissões (RBAC)
- Multi-idioma (chaves i18n)

#### 0.5. Sistema de Workflows (Temporal)
- Temporal Server configurado
- Workers em Go
- Biblioteca de workflows base:
  - ApprovalWorkflow (aprovações genéricas)
  - NotificationWorkflow (notificações)
  - ScheduledJobWorkflow (jobs agendados)
- API para expor estados de workflows
- Integração visual (timeline, histórico)
- Webhooks para eventos

#### 0.6. Internacionalização (i18n)
- Idiomas suportados:
  - 🇧🇷 Português (Brasil) - padrão
  - 🇺🇸 Inglês (Estados Unidos)
  - 🇪🇸 Espanhol (preparado)
- Biblioteca: next-intl
- Arquivos JSON estruturados por namespace
- Formatação de datas/números (Intl API)
- Backend: Accept-Language header
- Emails/notificações multi-idioma

#### 0.7. Sistema de Auditoria (Audit Logs)
- Registro de todas ações críticas:
  - Login/Logout
  - CRUD de entidades
  - Decisões de KYC
  - Criação/bloqueio de contas
  - Mudanças de permissões
  - Alterações em configurações
  - Execução de workflows
- Tabela imutável (nunca deletar/editar)
- Retenção configurável por tipo
- Acesso restrito (compliance officers)
- Exportação para análise externa

#### 0.8. Observabilidade
- **Logs estruturados:** zerolog (Go), formato JSON
- **Métricas:** Prometheus + Grafana
  - Taxa de aprovação KYC
  - Tempo médio de workflow
  - Latência de APIs
  - Erros de integração
- **Traces:** OpenTelemetry + Jaeger
- **Alertas:** Alertmanager (Slack, PagerDuty, Email)

#### 0.9. Design System & Componentes Base
- Biblioteca: shadcn/ui + Radix UI
- Componentes primitivos (Button, Input, Select, etc)
- Componentes customizados:
  - DataTable (filtros, ordenação, paginação)
  - FormBuilder (React Hook Form + Zod)
  - DateRangePicker
  - FileUploader (drag & drop)
  - WorkflowTimeline (visualização de estados)
  - PermissionGate (wrapper RBAC)
  - PageHeader (breadcrumb + actions)
  - StatsCard (métricas)
- Tokens de design (cores, espaçamento, tipografia)
- Storybook para documentação

**Entregáveis Fase 0:**
- ✅ Portal base funcional (login, menu, layout)
- ✅ Sistema de permissões completo (RBAC visual)
- ✅ Gestão de menus via interface
- ✅ Multi-idioma funcionando
- ✅ Audit logs operacionais
- ✅ Design system documentado
- ✅ Temporal integrado
- ✅ Dashboards Grafana configurados

---

### FASE 1.1: MÓDULO DE CADASTRO (4-5 semanas)

**Objetivo:** CRUD completo de Pessoas Físicas e Jurídicas com KYC manual

#### 1.1.1. Cadastro de Pessoas Físicas (PF)

**Campos:**
- Dados Pessoais: Nome Completo, CPF, Data Nascimento, Nacionalidade, Estado Civil, Nome da Mãe, Telefone, Email
- Endereço: CEP (autocomplete ViaCEP), Logradouro, Número, Complemento, Bairro, Cidade, UF
- Documentos: RG (número, órgão, UF, data), CNH (opcional)

**Validações:**
- CPF válido (algoritmo verificador)
- Email único
- Idade mínima: 18 anos
- Telefone brasileiro válido

**Telas:**
- Listagem (DataTable com filtros)
- Formulário criação/edição
- Visualização detalhada (read-only)
- Upload de documentos

#### 1.1.2. Cadastro de Pessoas Jurídicas (PJ)

**Campos:**
- Dados Empresariais: CNPJ, Razão Social, Nome Fantasia, CNAE, Data Abertura, Natureza Jurídica, Porte, Website, Telefone, Email
- Endereço: (mesmo modelo PF)
- Sócios/Representantes: Relacionamento com PFs, tipo participação, percentual
- Setor de Negócio: Checkbox "É empresa de Betting?" (afeta regras de contas)

**Validações:**
- CNPJ válido
- Validação automática Serpro (ao salvar)
- CNAE permitido (lista de bloqueados)
- Pelo menos 1 representante legal

**Telas:**
- Listagem (DataTable)
- Formulário criação/edição
- Visualização detalhada (com aba de sócios)
- Upload de documentos

#### 1.1.3. Gestão de Documentos

**Tipos de Documentos:**
- **PF:** RG (frente/verso), CNH, Comprovante Residência, Selfie
- **PJ:** Contrato Social, Cartão CNPJ, Comprovante Endereço, Procuração

**Funcionalidades:**
- Upload drag & drop
- Suporte: PDF, PNG, JPG (max 10MB)
- Preview inline (PDF.js)
- Versionamento (histórico)
- Download batch (zip)
- Anotações (compliance pode comentar)

**Storage:**
- MinIO (S3-compatible) ou AWS S3
- Organização: `/{entity_type}/{entity_id}/{document_type}/{filename}`
- Encriptação at-rest

#### 1.1.4. Validação Serpro (CNPJ)

**Fluxo:**
1. Usuário preenche CNPJ
2. Backend valida formato básico
3. Ao salvar, trigger chamada assíncrona Serpro
4. Worker processa resposta
5. Comparação com dados cadastrados
6. Frontend exibe resultado:
   - ✅ Dados conferem
   - ⚠️ Divergências (lista)
   - ❌ Erro na consulta (retry)

**Tratamento de Divergências:**
- Highlight campos divergentes
- Modal "Cadastrado vs Serpro"
- Opção: "Aceitar Serpro" ou "Manter cadastrado"
- Justificativa obrigatória

#### 1.1.5. Workflow de KYC Manual

**Estados:**
```
PENDENTE → EM_ANALISE → APROVADO
                ↓
         PENDENTE_DOCUMENTACAO → EM_ANALISE
                ↓
            REJEITADO
```

**Atores:**
- Operador: Cadastra entidade → PENDENTE
- Compliance Officer: Analisa → aprova/rejeita/solicita docs
- Sistema: Valida Serpro, envia notificações

**Fluxo do Workflow (Temporal):**
1. Validação automática (Serpro para PJ)
2. Atualiza status → EM_ANALISE
3. Aguarda decisão manual (signal)
4. Processa decisão:
   - APPROVE → ativa entidade
   - REJECT → bloqueia entidade
   - REQUEST_DOCS → volta para EM_ANALISE
5. Notifica resultado

#### 1.1.6. Interface de Aprovação KYC

**Layout da Tela de Review:**
- Workflow Timeline (visual de estados)
- Split view: Dados Cadastrados vs Validação Serpro
- Documentos anexados (thumbnails + lightbox)
- Checklist Banco Central (interativo)
- Ações: Aprovar / Solicitar Docs / Rejeitar
- Campo de comentários (histórico visível)
- Confirmação com justificativa obrigatória

**Entregáveis Fase 1.1:**
- ✅ CRUD completo PF/PJ
- ✅ Upload de documentos
- ✅ Integração Serpro funcionando
- ✅ Workflow KYC visual
- ✅ Interface de aprovação KYC

---

### FASE 1.2: MÓDULO DE GESTÃO DE CONTAS (3-4 semanas)

**Objetivo:** Criação e gestão de contas de pagamento com regras de negócio Betting

#### 1.2.1. Criação de Contas

**Regras de Negócio:**

**Empresa do Setor Betting:**
- Obrigatório: 2 contas mínimo
  - Conta Transacional (operações dia a dia)
  - Conta Proprietária (reserva, compliance)

**Empresa NÃO Betting:**
- 1 conta proprietária

**Campos:**
- Entidade (PJ) - obrigatório
- Tipo de Conta (Transacional, Proprietária, Escrow)
- Nome/Apelido da Conta
- Moeda (BRL fixo)
- Limite Diário (opcional)
- Status Inicial: INATIVA

**Validações:**
- Entidade com KYC = APROVADO
- Se Betting, validar 2 contas (existentes ou sendo criadas)
- Nome único por entidade

#### 1.2.2. Workflows de Conta

**Estados:**
```
CRIADA → ATIVA → BLOQUEADA → ENCERRADA
           ↓         ↑
       SUSPENSA ─────┘
```

**Ações:**
- Ativar: Requer aprovação (2º nível)
- Bloquear: Imediato (emergência)
- Suspender: Temporário (prazo definido)
- Encerrar: Irreversível (saldo zerado)

**Fluxo do Workflow:**
1. Validação: Entidade aprovada no KYC
2. Verificação regras Betting (OPA)
3. Preparação para TigerBeetle (Fase 2 - mock)
4. Persistência metadados conta
5. Aguarda ativação manual
6. Ativação/Bloqueio conforme sinais recebidos

#### 1.2.3. Preparação para Integração TigerBeetle (Fase 2)

**Campos Adicionais:**
- `tigerbeetle_account_id` (128-bit integer)
- `ledger_code` (código contábil)
- `flags` (débito/crédito permitido)

**Mock Service (Fase 1):**
```go
type MockLedgerService struct {}

func (s *MockLedgerService) CreateAccount(ctx, req) (*Account, error) {
    // Simula criação, retorna ID fictício
    return &Account{
        ID: generateMockID(),
        Balance: 0,
    }, nil
}
```

**Entregáveis Fase 1.2:**
- ✅ CRUD de contas
- ✅ Regras de negócio Betting
- ✅ Workflows de ativação/bloqueio
- ✅ Mock service para Ledger

---

### FASE 1.3: MÓDULO DE CONFIGURAÇÃO DA IP (2 semanas)

**Objetivo:** Configurações do sistema e dados da IP

#### 1.3.1. Dados Cadastrais da IP

**Informações:**
- Razão Social da IP
- CNPJ da IP
- Código ISPB (PIX)
- Logo (upload)
- Cores do tema (primary, secondary)
- Contatos (suporte, compliance)

#### 1.3.2. Configurações do Sistema

**Categorias:**

**Segurança:**
- Timeout de sessão (minutos)
- Tentativas de login antes bloqueio
- Política de senha (complexidade)
- 2FA obrigatório (sim/não)

**Workflows:**
- Timeout de aprovação KYC (dias)
- Requisitos de dupla aprovação

**Integrações:**
- Credenciais Serpro (API key)
- Endpoints configuráveis
- Timeouts de APIs

**Notificações:**
- SMTP settings
- Templates de email
- Canais ativos (email, SMS, push)

**Armazenamento:**
```sql
CREATE TABLE system_settings (
    id UUID PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    key VARCHAR(100) NOT NULL,
    value JSONB NOT NULL,
    value_type VARCHAR(20) NOT NULL,
    description TEXT,
    is_sensitive BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES users(id),
    UNIQUE(category, key)
);
```

**Entregáveis Fase 1.3:**
- ✅ Configurações do sistema
- ✅ Gestão de dados da IP
- ✅ Interface de parametrização

---

### FASE 2: INTEGRAÇÃO COM BACKEND EXISTENTE (4-6 semanas)

**Objetivo:** Integração real com módulos de negócio já implementados

#### Integrações Planejadas:
- TigerBeetleWorkflow (ledger real)
- PIXTransactionWorkflow (PIX IN/OUT)
- DICTKeyWorkflow (gestão de chaves)
- ClaimWorkflow (portabilidade)
- Integração com gateways existentes

**Nota:** Esta fase será planejada em detalhe após conclusão da Fase 1.x

---

## 🧬 EXEMPLO DETALHADO: Fluxo Completo de Criação de Cliente

### Cenário Real
1. PJ "Bet123" (já aprovada no KYC)
2. Quer criar cliente para operar PIX
3. Sendo do setor Betting, precisa 2 contas (Transacional + Proprietária)
4. Ambas contas precisam ser criadas no TigerBeetle (Ledger)
5. Apenas usuário com role "Operator" pode fazer isso

### Fluxo de Workflows + Sinais

```
ATOR: Operador João (role: Operator) no Portal

1. Portal → API: POST /api/v1/customers
   ├─ API valida JWT (Keycloak)
   ├─ API checa permissão (Cerbos): "Operator pode criar customer?" ✅
   ├─ API inicia CustomerWorkflow no Temporal

2. CustomerWorkflow inicia:
   ├─ Query EntityWorkflow: "Entity está APPROVED?" ✅
   ├─ Consulta OPA: "PJ pode criar customer?" ✅
   ├─ Persiste customer no PostgreSQL (via Activity)
   ├─ Consulta OPA: "PJ é Betting?" ✅ → precisa 2 contas
   │
   ├─ Inicia 2 Child Workflows em paralelo:
   │   │
   │   ├─── AccountWorkflow #1 (PROPRIETARIA)
   │   │    ├─ Valida OPA: "Conta pode ser criada?" ✅
   │   │    ├─ Persiste conta PostgreSQL
   │   │    ├─ Signal → TigerBeetleWorkflow: "create_ledger_account"
   │   │    ├─ Aguarda resposta
   │   │    ├─ TigerBeetleWorkflow responde: account_id = 123456
   │   │    ├─ Atualiza conta com tigerbeetle_account_id
   │   │    ├─ Muda estado para ATIVA
   │   │    └─ Retorna sucesso
   │   │
   │   └─── AccountWorkflow #2 (TRANSACIONAL)
   │        └─ (mesmo fluxo)
   │
   ├─ CustomerWorkflow recebe sucesso de ambos
   ├─ Ativa customer no PostgreSQL
   ├─ Signal → EntityWorkflow: "customer_activated"
   ├─ Signal → NotificationWorkflow: "send_email_welcome"
   │
   └─ Retorna customerID para API

3. API responde ao Portal:
   { "customer_id": "uuid", "workflow_id": "CustomerWorkflow-uuid" }

4. Portal atualiza UI:
   ├─ Recarrega lista de customers (query PostgreSQL)
   ├─ Exibe notificação: "Cliente criado com sucesso"
   └─ Navega para tela do cliente
```

---

## 📊 MODELO DE DADOS (Principais Tabelas)

### Tabela: users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    keycloak_id UUID UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url VARCHAR(500),
    preferred_language VARCHAR(5) DEFAULT 'pt-BR',
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_secret VARCHAR(32),
    last_login_at TIMESTAMPTZ,
    password_changed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
```

### Tabela: roles
```sql
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(150) NOT NULL,
    description TEXT,
    is_system_role BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabela: permissions
```sql
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    display_name VARCHAR(150) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(resource, action)
);
```

### Tabela: menu_items
```sql
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    label_key VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    route VARCHAR(255),
    external_url VARCHAR(500),
    order_index INTEGER NOT NULL DEFAULT 0,
    badge_type VARCHAR(20) CHECK (badge_type IN ('static', 'query', 'api')),
    badge_value TEXT,
    badge_api_endpoint VARCHAR(255),
    is_visible BOOLEAN DEFAULT true,
    required_permissions TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabela: workflow_state
```sql
CREATE TABLE workflow_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id VARCHAR(255) UNIQUE NOT NULL,
    workflow_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    current_state VARCHAR(50) NOT NULL,
    previous_state VARCHAR(50),
    input_data JSONB,
    current_data JSONB,
    started_at TIMESTAMPTZ NOT NULL,
    last_updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabela: entities_pj
```sql
CREATE TABLE entities_pj (
    id UUID PRIMARY KEY,
    cnpj VARCHAR(14) UNIQUE NOT NULL,
    razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255),
    cnae VARCHAR(10),
    data_abertura DATE,
    is_betting BOOLEAN DEFAULT false,

    -- Endereço
    logradouro VARCHAR(255),
    numero VARCHAR(20),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    uf CHAR(2),
    cep VARCHAR(8),

    -- Workflow
    workflow_id VARCHAR(255) REFERENCES workflow_state(workflow_id),
    current_state VARCHAR(50) NOT NULL,
    kyc_status VARCHAR(30),
    kyc_approved_at TIMESTAMPTZ,
    kyc_approved_by UUID REFERENCES users(id),

    -- Relações
    customers UUID[] DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabela: customers
```sql
CREATE TABLE customers (
    id UUID PRIMARY KEY,
    entity_id UUID NOT NULL REFERENCES entities_pj(id),
    workflow_id VARCHAR(255) REFERENCES workflow_state(workflow_id),
    current_state VARCHAR(50) NOT NULL,
    accounts UUID[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabela: accounts
```sql
CREATE TABLE accounts (
    id UUID PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES customers(id),
    account_type VARCHAR(50) NOT NULL,
    account_name VARCHAR(150),

    -- Workflow
    workflow_id VARCHAR(255) REFERENCES workflow_state(workflow_id),
    current_state VARCHAR(50) NOT NULL,

    -- TigerBeetle (Fase 2)
    tigerbeetle_account_id BIGINT,
    ledger_code VARCHAR(50),

    is_active BOOLEAN DEFAULT false,
    blocked_at TIMESTAMPTZ,
    block_reason TEXT,
    daily_limit DECIMAL(15,2),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabela: audit_logs
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES users(id),
    actor_email VARCHAR(255),
    actor_ip INET,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    description TEXT,
    old_values JSONB,
    new_values JSONB,
    metadata JSONB,
    occurred_at TIMESTAMPTZ DEFAULT NOW(),
    success BOOLEAN DEFAULT true,
    error_message TEXT
);

CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id, occurred_at DESC);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id, occurred_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action, occurred_at DESC);
```

---

## 🔐 SEGURANÇA

### Fluxo Completo de Autorização

```
1. PORTAL (Frontend):
   ├─ usePermissions() checa Cerbos client-side
   └─ Esconde/desabilita botões sem permissão

2. API GATEWAY (Backend):
   ├─ Valida JWT (Keycloak)
   ├─ Checa permissão (Cerbos): "User pode executar ação?"
   └─ Se permitido, continua

3. WORKFLOW (Temporal Activity):
   ├─ Valida com OPA: "Entity/Resource pode executar ação?"
   └─ Aplica regras de negócio

4. AUDITORIA:
   └─ Toda ação registrada (quem, o que, quando, resultado)
```

### Checklist de Segurança

- [ ] Todas as senhas hasheadas (bcrypt/argon2)
- [ ] Tokens JWT com expiração curta (15min)
- [ ] Refresh token rotation
- [ ] Rate limiting em APIs críticas
- [ ] CORS configurado restritivamente
- [ ] CSP headers configurados
- [ ] SQL injection: Prepared statements 100%
- [ ] XSS: Input sanitization + output encoding
- [ ] CSRF tokens em formulários
- [ ] Secrets em variáveis de ambiente (nunca hardcoded)
- [ ] HTTPS obrigatório (redirect HTTP → HTTPS)
- [ ] Security headers (HSTS, X-Frame-Options, etc)
- [ ] Dependency scanning (Snyk, Dependabot)
- [ ] Penetration testing antes de produção

---

## 📋 MÓDULOS DE BACKOFFICE

### Cadastro de PJ e PF
- Permitir cadastro completo de pessoas físicas e jurídicas
- Validações CPF/CNPJ
- Upload de documentos
- Implementação legada: Temporal Workflow, Cerbos, OPA

### Módulo de KYC (Manual)
- Validação documental manual
- Integração com Serpro (validação CNPJ)
- Workflow de aprovação baseado em Temporal
- Checklist de compliance Bacen
- Interface de aprovação/rejeição

### Módulo de Contas do Setor de Betting
- Se empresa do setor Betting:
  - Cria duas contas: uma transacional e outra proprietária
- Se empresa for do Betting:
  - Cria apenas conta proprietária

### Workflow Account
- Baseado em Temporal Workflow
- Criação e ativação de contas
- Bloqueio de contas
- Workflow para gerenciar estados da conta

### Autenticação
- Solução de autenticação 2FA
- Gestão de usuários com diferentes níveis de acesso
- Baseado em Keycloak e Cerbos

### Criação dos Dados da Organização da IP
- Dados cadastrais da IP
- Escolha de entidade organizacional
- Conta proprietária de recebimento de fees
- Relacionamento com outras funcionalidades

### Dentro das Contas
- Apresentar extrato da conta
- Saldo
- Opções de pesquisa de transações entre outras funcionalidades

---

## 🚀 ROADMAP DE IMPLEMENTAÇÃO

### Cronograma Resumido

| Fase | Duração | Equipe Sugerida |
|------|---------|----------------|
| **FASE 0: Foundations** | 6-8 semanas | 2 BE, 2 FE, 1 DevOps |
| **FASE 1.1: Cadastro + KYC** | 4-5 semanas | 2 BE, 1 FE |
| **FASE 1.2: Contas** | 3-4 semanas | 2 BE, 1 FE |
| **FASE 1.3: Config IP** | 2 semanas | 1 BE, 1 FE |
| **Finalização** | 2 semanas | Full team |
| **TOTAL FASE 0 + 1.x** | **17-21 semanas (4-5 meses)** | |
| **FASE 2: Integrações** | 4-6 semanas | Full team |

### Equipe Recomendada
- 1 Tech Lead (Full-stack sênior)
- 2 Backend Engineers (Go)
- 2 Frontend Engineers (React/Next.js)
- 1 DevOps Engineer
- 1 QA/Security Specialist (part-time)
- 1 Product Owner/Compliance (stakeholder)

---

## ✅ CRITÉRIOS DE ACEITE

### Fase 0 - Foundations

**Must Have:**
- [ ] Usuário consegue fazer login com 2FA
- [ ] Menus aparecem de acordo com permissões do usuário
- [ ] Menus podem ser gerenciados via interface (CRUD)
- [ ] Sistema suporta pt-BR e en-US (troca sem reload)
- [ ] Toda ação crítica gera audit log
- [ ] Logs estruturados visíveis no Grafana
- [ ] Layout responsivo (desktop, tablet, mobile)
- [ ] Tema claro/escuro funcional
- [ ] Documentação técnica completa

**Nice to Have:**
- [ ] SSO com Google/Microsoft
- [ ] Notificações em tempo real (WebSocket)
- [ ] Modo offline (PWA)

### Fase 1.1 - Cadastro + KYC

**Must Have:**
- [ ] CRUD de PF/PJ funcionando
- [ ] Upload de documentos (PDF, PNG, JPG)
- [ ] Integração Serpro validando CNPJ
- [ ] Workflow KYC executando
- [ ] Interface de aprovação KYC operacional
- [ ] Notificações de mudança de estado

### Fase 1.2 - Contas

**Must Have:**
- [ ] CRUD de contas funcionando
- [ ] Regra Betting aplicada (2 contas vs 1)
- [ ] Workflow de ativação/bloqueio
- [ ] Estados visíveis no Portal

### Fase 1.3 - Config IP

**Must Have:**
- [ ] Telas de configuração operacionais
- [ ] Settings salvos e aplicados
- [ ] Dados da IP cadastrados

---

## 📚 DOCUMENTAÇÃO OBRIGATÓRIA

### Para Desenvolvedores
- Architecture Decision Records (ADRs)
- API documentation (OpenAPI/Swagger)
- Database schema diagrams
- Component Storybook
- Setup guides (dev environment)

### Para Usuários
- Manual do usuário (por módulo)
- Tutoriais em vídeo
- FAQs
- Changelog

---

## 🎯 PRINCÍPIOS ARQUITETURAIS

1. **Modularidade** - Cada funcionalidade é um módulo independente
2. **Configurabilidade** - Tudo configurável via interface
3. **Extensibilidade** - Preparado para novos módulos sem refatoração
4. **Multi-tenancy Ready** - Arquitetura preparada para múltiplas organizações
5. **Compliance First** - Auditoria, LGPD e regulamentação Bacen desde o início
6. **Developer Experience** - Padrões claros, documentação completa, fácil onboarding
7. **Event-Driven** - Workflows comunicam via sinais
8. **Resilient** - Estado durável, retries automáticos
9. **Observable** - Logs, métricas, traces desde o dia 1
10. **Secure by Default** - Múltiplas camadas de segurança

---

## 🔄 PERSISTÊNCIA: Dual Write Pattern

### Estratégia

**Temporal (Source of Truth para workflows):**
- Workflow History (eventos imutáveis)
- Estado interno dos workflows
- Sinais entre workflows

**PostgreSQL (Materialized View):**
- Estado atual dos organismos (queries rápidas)
- Relacionamentos (FKs)
- Índices para busca
- Read models para o Portal

### Sincronização

Toda mudança de estado persiste via Temporal Activity:
1. Atualizar PostgreSQL (materialized view)
2. Registrar audit log
3. Retornar sucesso/erro

Portal consulta PostgreSQL para:
- Listagens
- Filtros
- Buscas
- Dashboards

Portal consulta Temporal para:
- Histórico de workflow
- Estados detalhados
- Ações disponíveis

---

## 🌟 BENEFÍCIOS DESTA ARQUITETURA

### Técnicos
1. ✅ **Estado sempre consistente** - Temporal garante durabilidade
2. ✅ **Auditoria completa** - Histórico imutável no Temporal
3. ✅ **Desacoplamento** - Workflows se comunicam via sinais
4. ✅ **Escalabilidade** - Workers podem escalar horizontalmente
5. ✅ **Resiliência** - Retries automáticos, rollbacks declarativos
6. ✅ **Visibilidade** - Portal mostra estados em tempo real
7. ✅ **Flexibilidade** - Fácil adicionar novos workflows/sinais
8. ✅ **Manutenibilidade** - Lógica de negócio isolada em workflows

### Negócio
1. ✅ **Compliance nativo** - Regras centralizadas (OPA), autorizações (Cerbos)
2. ✅ **Time to market rápido** - Componentes reutilizáveis
3. ✅ **Redução de bugs** - Workflows testáveis, estado previsível
4. ✅ **Rastreabilidade total** - Auditoria de todas ações
5. ✅ **Experiência do usuário superior** - UX fluida e responsiva
6. ✅ **Facilita onboarding** - Portal intuitivo, bem documentado

---

## 📞 PRÓXIMOS PASSOS

1. **Validar esta especificação** com stakeholders
2. **Refinar estimativas** com base no time real
3. **Setup do repositório** (monorepo ou multi-repo)
4. **Criar protótipo** de alta fidelidade (Figma)
5. **Iniciar Fase 0 - Sprint 1**: Setup de infraestrutura

---

## 📝 NOTAS ADICIONAIS

### Sobre a Abordagem de Implementação

A arquitetura proposta segue o princípio de **"Organismos Vivos"** onde cada entidade de domínio (Entidade PJ, Cliente, Conta, Usuário, Transação, etc.) é gerenciada por seu próprio Workflow Temporal que:

- Mantém estado durável e auditável
- Recebe e envia sinais para outros workflows
- Valida regras de negócio via OPA
- Respeita permissões via Cerbos
- Persiste dados no PostgreSQL via Activities

Esta abordagem garante:
- **Consistência eventual** entre workflows
- **Rastreabilidade total** de todas as operações
- **Escalabilidade horizontal** via workers Temporal
- **Resiliência** a falhas (workflows retomam de onde pararam)
- **Flexibilidade** para adicionar novos fluxos sem afetar existentes

### Sobre UX/UI

O portal foi concebido para ter:
- **Experiência fluente e agradável** - Animações suaves, feedback imediato
- **Componentes padrão** - DataTable, Tabs, Calendários, Forms
- **Gestão visual de workflows** - Timeline mostrando estados e progresso
- **Permissões visuais** - Botões/ações aparecem conforme RBAC
- **Multi-idioma nativo** - pt-BR, en-US, es-ES
- **Responsivo** - Mobile-first design
- **Acessível** - Radix UI garante WCAG compliance

### Sobre Integrações (Fase 2)

As integrações com módulos de backend existentes (TigerBeetle, PIX/OUT, DICT) serão feitas via:
- **Workflows Temporal** dedicados por módulo
- **Sinais** para comunicação assíncrona
- **Activities** para chamadas HTTP/gRPC
- **Retries configuráveis** para tolerância a falhas
- **Circuit breakers** para proteger serviços downstream

---

**Documento mantido por:** Equipe de Desenvolvimento LBPay
**Última atualização:** 07 de Janeiro de 2025
**Versão:** 1.0
