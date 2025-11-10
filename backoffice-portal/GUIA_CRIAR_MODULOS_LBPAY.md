# 🎯 Guia: Criar Seção "Módulos LBPAY" no Menu

Este guia mostra como criar uma estrutura de menu hierárquica com a seção **"Módulos LBPAY"** contendo submódulos (Cadastro, Contas, Billing, etc.).

## 📋 Estrutura Final

```
🏠 Home
📦 Módulos LBPAY (Grupo)
├── 🏢 Cadastro PJ
├── 💳 Contas
├── 📊 Billing
├── ⚡ DICT/PIX
├── 📈 Relatórios
└── 🛡️ Fraudes
━━━━━━━━━━━━━━━━ (Divider)
⚙️ Administração (Grupo)
├── 👥 Usuários
├── 🎯 Aplicações
├── 📋 Menu
└── ⚙️ Configurações
```

---

## 🚀 Passo a Passo

### **Parte 1: Criar Aplicações**

Acesse **Portal Management → Applications** e crie 6 aplicações:

#### 1. Gestão de Cadastro PJ
```
Name: Gestão de Cadastro PJ
Slug: gestao-cadastro-pj
Description: Gestão de cadastro de Pessoas Jurídicas (CNPJ, Sócios, Documentos)
URL: https://cadastro-pj.lbpay.local
Icon: Building2
Status: Active
Open in New Tab: ❌ (usar iframe)
Iframe Settings:
  - Sandbox: allow-scripts, allow-forms, allow-same-origin
  - Allow Fullscreen: ❌
```

#### 2. Gestão de Contas
```
Name: Gestão de Contas
Slug: gestao-contas
Description: Gestão de contas de pagamento (Abertura, Consulta, Bloqueio)
URL: https://contas.lbpay.local
Icon: Wallet
Status: Active
```

#### 3. Billing & Cobrança
```
Name: Billing & Cobrança
Slug: billing
Description: Gestão de cobranças, faturas e tarifas
URL: https://billing.lbpay.local
Icon: Receipt
Status: Active
```

#### 4. DICT/PIX
```
Name: DICT/PIX
Slug: dict-pix
Description: Gerenciamento de chaves PIX e consultas DICT
URL: https://dict-pix.lbpay.local
Icon: Zap
Status: Active
```

#### 5. Relatórios & Analytics
```
Name: Relatórios & Analytics
Slug: relatorios
Description: Dashboards, relatórios gerenciais e analytics
URL: https://reports.lbpay.local
Icon: BarChart3
Status: Active
Iframe Settings:
  - Allow Fullscreen: ✅ (para dashboards)
```

#### 6. Gestão de Fraudes
```
Name: Gestão de Fraudes
Slug: fraudes
Description: Monitoramento e prevenção de fraudes
URL: https://fraudes.lbpay.local
Icon: Shield
Status: Active
```

---

### **Parte 2: Criar Estrutura de Menu**

Acesse **Portal Management → Menu Items**

#### 1. Criar Menu "Home"
```
Label: Home
Type: External Link
External URL: /admin
Icon: Home
Order: 0
Visible: ✅
```

#### 2. Criar Grupo "Módulos LBPAY"
```
Label: Módulos LBPAY
Type: Group
Icon: Boxes
Order: 10
Visible: ✅
```

#### 3. Criar Submenu "Cadastro PJ" (dentro de Módulos LBPAY)
```
Label: Cadastro PJ
Type: Application
Application: Gestão de Cadastro PJ (selecione da lista)
Icon: Building2
Parent: Módulos LBPAY (selecione o grupo criado)
Order: 11
Visible: ✅
Badge:
  - Enabled: ✅
  - Type: Static
  - Text: New
  - Variant: Primary
```

#### 4. Criar Submenu "Contas" (dentro de Módulos LBPAY)
```
Label: Contas
Type: Application
Application: Gestão de Contas
Icon: Wallet
Parent: Módulos LBPAY
Order: 12
Visible: ✅
Badge:
  - Enabled: ✅
  - Type: Dynamic API
  - API Endpoint: /api/contas/pending-count
  - Variant: Warning
```

#### 5. Criar Submenu "Billing" (dentro de Módulos LBPAY)
```
Label: Billing
Type: Application
Application: Billing & Cobrança
Icon: Receipt
Parent: Módulos LBPAY
Order: 13
Visible: ✅
```

#### 6. Criar Submenu "DICT/PIX" (dentro de Módulos LBPAY)
```
Label: DICT/PIX
Type: Application
Application: DICT/PIX
Icon: Zap
Parent: Módulos LBPAY
Order: 14
Visible: ✅
```

#### 7. Criar Submenu "Relatórios" (dentro de Módulos LBPAY)
```
Label: Relatórios
Type: Application
Application: Relatórios & Analytics
Icon: BarChart3
Parent: Módulos LBPAY
Order: 15
Visible: ✅
```

#### 8. Criar Submenu "Fraudes" (dentro de Módulos LBPAY)
```
Label: Fraudes
Type: Application
Application: Gestão de Fraudes
Icon: Shield
Parent: Módulos LBPAY
Order: 16
Visible: ✅
Badge:
  - Enabled: ✅
  - Type: Static
  - Text: !
  - Variant: Error
```

#### 9. Criar Divider
```
Label: divider-1
Type: Divider
Order: 20
Visible: ✅
```

#### 10. Criar Grupo "Administração"
```
Label: Administração
Type: Group
Icon: Settings
Order: 30
Visible: ✅
```

#### 11. Criar Submenu "Usuários" (dentro de Administração)
```
Label: Usuários
Type: External Link
External URL: /admin/collections/users
Icon: Users
Parent: Administração
Order: 31
Visible: ✅
```

#### 12. Criar Submenu "Aplicações" (dentro de Administração)
```
Label: Aplicações
Type: External Link
External URL: /admin/collections/applications
Icon: AppWindow
Parent: Administração
Order: 32
Visible: ✅
```

#### 13. Criar Submenu "Menu" (dentro de Administração)
```
Label: Menu
Type: External Link
External URL: /admin/collections/menu-items
Icon: Menu
Parent: Administração
Order: 33
Visible: ✅
```

#### 14. Criar Submenu "Configurações" (dentro de Administração)
```
Label: Configurações
Type: External Link
External URL: /admin/globals/portal-settings
Icon: Settings
Parent: Administração
Order: 34
Visible: ✅
```

---

## ✅ Resultado Final

Após criar todos os itens, refresh a página do admin (`http://localhost:3002/admin`).

Você verá o menu lateral estruturado hierarquicamente com:

1. **Home** - Link para dashboard
2. **Módulos LBPAY** (expandível)
   - Cadastro PJ (com badge "New")
   - Contas (com badge dinâmico)
   - Billing
   - DICT/PIX
   - Relatórios
   - Fraudes (com badge "!")
3. **━━━━━━━━━━** (Divider)
4. **Administração** (expandível)
   - Usuários
   - Aplicações
   - Menu
   - Configurações

---

## 🎨 Ícones Disponíveis (Lucide Icons)

- `Home` - Casa
- `Boxes` - Caixa múltipla
- `Building2` - Prédio
- `Wallet` - Carteira
- `Receipt` - Recibo
- `Zap` - Raio (PIX)
- `BarChart3` - Gráfico de barras
- `Shield` - Escudo
- `Settings` - Engrenagem
- `Users` - Pessoas
- `AppWindow` - Janela de app
- `Menu` - Menu hamburger

Ver lista completa em: https://lucide.dev

---

## 🔧 Troubleshooting

**Problema**: Menu não aparece hierarquicamente
**Solução**: Verifique se o campo `Parent` está corretamente preenchido com o grupo pai

**Problema**: Badge não aparece
**Solução**: Certifique-se que `Badge → Enabled` está marcado

**Problema**: App não abre no iframe
**Solução**: Verifique se a URL está correta e se `Open in New Tab` está **desmarcado**

---

## 📝 Próximos Passos

1. ✅ Configurar **Portal Settings** (logo, cores, idioma)
2. ✅ Criar **Roles** (SuperAdmin, Admin, Operador)
3. ✅ Criar **Permissions** (users:read, applications:create, etc.)
4. ✅ Testar navegação entre apps
5. ✅ Implementar health checks para monitorar apps

---

**Documentado em**: 2025-01-09
**Versão**: 1.0
