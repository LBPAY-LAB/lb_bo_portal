import { config } from 'dotenv'

// Load .env file FIRST
config()

async function test() {
  console.log('🧪 Testing Keycloak Admin API...\n')
  console.log('Environment Variables:')
  console.log('  KEYCLOAK_ISSUER:', process.env.KEYCLOAK_ISSUER)
  console.log('  KEYCLOAK_CLIENT_ID:', process.env.KEYCLOAK_CLIENT_ID)
  console.log('  KEYCLOAK_CLIENT_SECRET:', process.env.KEYCLOAK_CLIENT_SECRET ? '***' : 'NOT SET')
  console.log('')

  // Import after .env is loaded
  const { getKeycloakAdmin } = await import('./lib/keycloak-admin')
  const keycloakAdmin = getKeycloakAdmin()

  try {
    // Test 1: Authenticate
    console.log('Test 1: Authenticating with Keycloak...')
    await keycloakAdmin.authenticate()
    console.log('✅ Authentication successful\n')

    // Test 2: Get user by email (should return null if not exists)
    console.log('Test 2: Looking up non-existent user...')
    const user = await keycloakAdmin.getUserByEmail('test@example.com')
    console.log('✅ getUserByEmail:', user ? 'Found user' : 'User not found (expected)\n')

    console.log('🎉 All tests passed!')
    console.log('\n📝 Next steps:')
    console.log('1. Run email templates seed: pnpm exec tsx src/seed/email-templates-seed.ts')
    console.log('2. Test email service (optional)')

    process.exit(0)
  } catch (error: any) {
    console.error('❌ Test failed:', error.message)
    console.error('\n📝 Possible issues:')
    console.error('- Keycloak service account not configured')
    console.error('- Missing KEYCLOAK_CLIENT_SECRET in .env')
    console.error('- Keycloak server not running')
    console.error('\nSee KEYCLOAK_SERVICE_ACCOUNT_SETUP.md for setup instructions')
    process.exit(1)
  }
}

test()
