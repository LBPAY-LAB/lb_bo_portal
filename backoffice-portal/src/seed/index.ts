import { Payload } from 'payload'

export async function seed(payload: Payload) {
  console.log('🌱 Starting seed process...')

  try {
    // 1. Create Applications
    console.log('📦 Creating Applications...')
    const applications = await createApplications(payload)

    // 2. Create Menu Structure
    console.log('📋 Creating Menu Structure...')
    await createMenuStructure(payload, applications)

    // 3. Create Roles & Permissions
    console.log('👤 Creating Roles & Permissions...')
    await createRolesAndPermissions(payload)

    console.log('✅ Seed process completed successfully!')
  } catch (error) {
    console.error('❌ Seed process failed:', error)
    throw error
  }
}

// ============================================
// 1. CREATE APPLICATIONS
// ============================================
async function createApplications(payload: Payload) {
  const apps = [
    {
      name: 'Gestão de Cadastro PJ',
      slug: 'gestao-cadastro-pj',
      description: 'Gestão de cadastro de Pessoas Jurídicas (CNPJ, Sócios, Documentos)',
      url: 'https://cadastro-pj.lbpay.local',
      icon: 'Building2',
      status: 'active',
      openInNewTab: false,
      iframeSettings: {
        sandbox: ['allow-scripts', 'allow-forms', 'allow-same-origin'],
        allowFullscreen: false,
      },
      healthCheck: {
        enabled: true,
        endpoint: '/health',
        intervalSeconds: 60,
      },
    },
    {
      name: 'Gestão de Contas',
      slug: 'gestao-contas',
      description: 'Gestão de contas de pagamento (Abertura, Consulta, Bloqueio)',
      url: 'https://contas.lbpay.local',
      icon: 'Wallet',
      status: 'active',
      openInNewTab: false,
      iframeSettings: {
        sandbox: ['allow-scripts', 'allow-forms', 'allow-same-origin'],
        allowFullscreen: false,
      },
      healthCheck: {
        enabled: true,
        endpoint: '/health',
        intervalSeconds: 60,
      },
    },
    {
      name: 'Billing & Cobrança',
      slug: 'billing',
      description: 'Gestão de cobranças, faturas e tarifas',
      url: 'https://billing.lbpay.local',
      icon: 'Receipt',
      status: 'active',
      openInNewTab: false,
      iframeSettings: {
        sandbox: ['allow-scripts', 'allow-forms', 'allow-same-origin'],
        allowFullscreen: false,
      },
    },
    {
      name: 'DICT/PIX',
      slug: 'dict-pix',
      description: 'Gerenciamento de chaves PIX e consultas DICT',
      url: 'https://dict-pix.lbpay.local',
      icon: 'Zap',
      status: 'active',
      openInNewTab: false,
      iframeSettings: {
        sandbox: ['allow-scripts', 'allow-forms', 'allow-same-origin'],
        allowFullscreen: false,
      },
    },
    {
      name: 'Relatórios & Analytics',
      slug: 'relatorios',
      description: 'Dashboards, relatórios gerenciais e analytics',
      url: 'https://reports.lbpay.local',
      icon: 'BarChart3',
      status: 'active',
      openInNewTab: false,
      iframeSettings: {
        sandbox: ['allow-scripts', 'allow-forms', 'allow-same-origin'],
        allowFullscreen: true,
      },
    },
    {
      name: 'Gestão de Fraudes',
      slug: 'fraudes',
      description: 'Monitoramento e prevenção de fraudes',
      url: 'https://fraudes.lbpay.local',
      icon: 'Shield',
      status: 'active',
      openInNewTab: false,
      iframeSettings: {
        sandbox: ['allow-scripts', 'allow-forms', 'allow-same-origin'],
        allowFullscreen: false,
      },
    },
  ]

  const createdApps: Record<string, any> = {}

  for (const app of apps) {
    const created = await payload.create({
      collection: 'applications',
      data: app,
    })
    createdApps[app.slug] = created
    console.log(`  ✓ Created: ${app.name}`)
  }

  return createdApps
}

// ============================================
// 2. CREATE MENU STRUCTURE
// ============================================
async function createMenuStructure(payload: Payload, applications: Record<string, any>) {
  // Create Home menu item
  const home = await payload.create({
    collection: 'menu-items',
    data: {
      label: 'Home',
      type: 'external',
      externalUrl: '/admin',
      icon: 'Home',
      order: 0,
      visible: true,
    },
  })
  console.log('  ✓ Created: Home')

  // Create "Módulos LBPAY" group
  const modulosGroup = await payload.create({
    collection: 'menu-items',
    data: {
      label: 'Módulos LBPAY',
      type: 'group',
      icon: 'Boxes',
      order: 10,
      visible: true,
    },
  })
  console.log('  ✓ Created: Módulos LBPAY (group)')

  // Create menu items for each application under "Módulos LBPAY"
  const menuItems = [
    {
      label: 'Cadastro PJ',
      application: applications['gestao-cadastro-pj'].id,
      icon: 'Building2',
      order: 11,
      badge: {
        enabled: true,
        type: 'static',
        text: 'New',
        variant: 'primary',
      },
    },
    {
      label: 'Contas',
      application: applications['gestao-contas'].id,
      icon: 'Wallet',
      order: 12,
      badge: {
        enabled: true,
        type: 'api',
        apiEndpoint: '/api/contas/pending-count',
        variant: 'warning',
      },
    },
    {
      label: 'Billing',
      application: applications['billing'].id,
      icon: 'Receipt',
      order: 13,
    },
    {
      label: 'DICT/PIX',
      application: applications['dict-pix'].id,
      icon: 'Zap',
      order: 14,
    },
    {
      label: 'Relatórios',
      application: applications['relatorios'].id,
      icon: 'BarChart3',
      order: 15,
    },
    {
      label: 'Fraudes',
      application: applications['fraudes'].id,
      icon: 'Shield',
      order: 16,
      badge: {
        enabled: true,
        type: 'static',
        text: '!',
        variant: 'error',
      },
    },
  ]

  for (const item of menuItems) {
    await payload.create({
      collection: 'menu-items',
      data: {
        ...item,
        type: 'application',
        parent: modulosGroup.id,
        visible: true,
      },
    })
    console.log(`  ✓ Created: ${item.label} (under Módulos LBPAY)`)
  }

  // Create Divider
  await payload.create({
    collection: 'menu-items',
    data: {
      label: 'divider-1',
      type: 'divider',
      order: 20,
      visible: true,
    },
  })
  console.log('  ✓ Created: Divider')

  // Create "Administração" group
  const adminGroup = await payload.create({
    collection: 'menu-items',
    data: {
      label: 'Administração',
      type: 'group',
      icon: 'Settings',
      order: 30,
      visible: true,
    },
  })
  console.log('  ✓ Created: Administração (group)')

  // Create admin submenu items
  const adminItems = [
    {
      label: 'Usuários',
      externalUrl: '/admin/collections/users',
      icon: 'Users',
      order: 31,
    },
    {
      label: 'Aplicações',
      externalUrl: '/admin/collections/applications',
      icon: 'AppWindow',
      order: 32,
    },
    {
      label: 'Menu',
      externalUrl: '/admin/collections/menu-items',
      icon: 'Menu',
      order: 33,
    },
    {
      label: 'Configurações',
      externalUrl: '/admin/globals/portal-settings',
      icon: 'Settings',
      order: 34,
    },
  ]

  for (const item of adminItems) {
    await payload.create({
      collection: 'menu-items',
      data: {
        ...item,
        type: 'external',
        parent: adminGroup.id,
        visible: true,
      },
    })
    console.log(`  ✓ Created: ${item.label} (under Administração)`)
  }
}

// ============================================
// 3. CREATE ROLES & PERMISSIONS
// ============================================
async function createRolesAndPermissions(payload: Payload) {
  // Create basic permissions
  const permissions = [
    {
      name: 'users:read',
      description: 'Read users',
      resource: 'users',
      action: ['read'],
      scope: 'global',
      category: 'users',
    },
    {
      name: 'users:create',
      description: 'Create users',
      resource: 'users',
      action: ['create'],
      scope: 'global',
      category: 'users',
    },
    {
      name: 'applications:read',
      description: 'Read applications',
      resource: 'applications',
      action: ['read'],
      scope: 'global',
      category: 'portal',
    },
    {
      name: 'all:all',
      description: 'Full access to all resources',
      resource: '*',
      action: ['*'],
      scope: 'global',
      category: 'security',
    },
  ]

  const createdPermissions: Record<string, any> = {}

  for (const perm of permissions) {
    const created = await payload.create({
      collection: 'permissions',
      data: perm,
    })
    createdPermissions[perm.name] = created
    console.log(`  ✓ Created: ${perm.name}`)
  }

  // Create roles
  const roles = [
    {
      name: 'Super Admin',
      slug: 'super_admin',
      description: 'Full access to all portal features',
      type: 'system',
      permissions: [createdPermissions['all:all'].id],
      priority: 100,
      active: true,
    },
    {
      name: 'Admin',
      slug: 'admin',
      description: 'Administrative access to portal management',
      type: 'system',
      permissions: [
        createdPermissions['users:read'].id,
        createdPermissions['users:create'].id,
        createdPermissions['applications:read'].id,
      ],
      priority: 80,
      active: true,
    },
    {
      name: 'Operator',
      slug: 'operator',
      description: 'Read-only access to portal',
      type: 'custom',
      permissions: [
        createdPermissions['users:read'].id,
        createdPermissions['applications:read'].id,
      ],
      priority: 50,
      active: true,
    },
  ]

  for (const role of roles) {
    await payload.create({
      collection: 'roles',
      data: role,
    })
    console.log(`  ✓ Created: ${role.name}`)
  }
}
