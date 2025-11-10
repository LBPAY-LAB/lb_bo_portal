import { config } from 'dotenv'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

// Load .env file
config()

async function syncKeycloakRolesToPayload() {
  console.log('🔄 Syncing Keycloak Roles to PayloadCMS...\n')

  const payload = await getPayload({ config: configPromise })

  try {
    // 1. Create roles in PayloadCMS matching Keycloak roles
    console.log('1️⃣  Creating roles in PayloadCMS...')

    const rolesToCreate = [
      {
        name: 'Super Admin',
        slug: 'super_admin',
        description: 'Full system access with all permissions',
        permissions: {
          canAccessAdmin: true,
          canManageUsers: true,
          canManageRoles: true,
          canManageApplications: true,
          canManageMenuItems: true,
          canViewAuditLogs: true,
          canManageSettings: true,
        },
      },
      {
        name: 'Admin',
        slug: 'admin',
        description: 'Administrator with full access',
        permissions: {
          canAccessAdmin: true,
          canManageUsers: true,
          canManageRoles: false,
          canManageApplications: true,
          canManageMenuItems: true,
          canViewAuditLogs: true,
          canManageSettings: false,
        },
      },
      {
        name: 'User',
        slug: 'user',
        description: 'Standard user with basic access',
        permissions: {
          canAccessAdmin: true,
          canManageUsers: false,
          canManageRoles: false,
          canManageApplications: false,
          canManageMenuItems: false,
          canViewAuditLogs: false,
          canManageSettings: false,
        },
      },
      {
        name: 'Operator',
        slug: 'operator',
        description: 'Operational access for daily tasks',
        permissions: {
          canAccessAdmin: true,
          canManageUsers: false,
          canManageRoles: false,
          canManageApplications: false,
          canManageMenuItems: false,
          canViewAuditLogs: false,
          canManageSettings: false,
        },
      },
    ]

    const createdRoles: any[] = []

    for (const roleData of rolesToCreate) {
      try {
        // Check if role already exists
        const existing = await payload.find({
          collection: 'roles',
          where: {
            slug: {
              equals: roleData.slug,
            },
          },
        })

        if (existing.docs.length > 0) {
          console.log(`   ✅ Role '${roleData.name}' already exists (ID: ${existing.docs[0].id})`)
          createdRoles.push(existing.docs[0])
        } else {
          const role = await payload.create({
            collection: 'roles',
            data: roleData,
          })
          console.log(`   ✅ Created role '${roleData.name}' (ID: ${role.id})`)
          createdRoles.push(role)
        }
      } catch (error: any) {
        console.error(`   ❌ Failed to create role '${roleData.name}':`, error.message)
      }
    }
    console.log('')

    // 2. Find user by email
    console.log('2️⃣  Finding user jose.silva@lbpay.com.br...')
    const users = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: 'jose.silva@lbpay.com.br',
        },
      },
    })

    if (users.docs.length === 0) {
      console.error('❌ User not found')
      process.exit(1)
    }

    const user = users.docs[0]
    console.log(`✅ User found (ID: ${user.id})`)
    console.log('')

    // 3. Assign roles to user
    console.log('3️⃣  Assigning roles to user...')

    // Find super_admin, admin, and user roles
    const superAdminRole = createdRoles.find((r) => r.slug === 'super_admin')
    const adminRole = createdRoles.find((r) => r.slug === 'admin')
    const userRole = createdRoles.find((r) => r.slug === 'user')

    const roleIds = [superAdminRole?.id, adminRole?.id, userRole?.id].filter(Boolean)

    if (roleIds.length === 0) {
      console.error('❌ No roles found to assign')
      process.exit(1)
    }

    // Update user with roles
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        roles: roleIds,
      },
    })

    console.log(`✅ Assigned ${roleIds.length} roles to user:`)
    console.log(`   - super_admin`)
    console.log(`   - admin`)
    console.log(`   - user`)
    console.log('')

    // 4. Verify
    console.log('4️⃣  Verifying user roles...')
    const updatedUser = await payload.findByID({
      collection: 'users',
      id: user.id,
    })

    console.log('User roles:', updatedUser.roles)
    console.log('')

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🎉 ROLES SYNCED SUCCESSFULLY!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('')
    console.log('User: jose.silva@lbpay.com.br')
    console.log('Roles: super_admin, admin, user')
    console.log('')
    console.log('📝 Next step: Login again to see the roles')

    process.exit(0)
  } catch (error: any) {
    console.error('❌ Sync failed:', error.message)
    console.error(error)
    process.exit(1)
  }
}

syncKeycloakRolesToPayload()
