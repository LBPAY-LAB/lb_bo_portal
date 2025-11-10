import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { seed } from './index'

async function run() {
  console.log('🚀 Payload Seed Script')
  console.log('========================\n')

  try {
    // Initialize Payload
    console.log('📦 Initializing Payload...')
    const config = await configPromise
    const payload = await getPayload({ config })
    console.log('✓ Payload initialized\n')

    // Run seed
    await seed(payload)

    console.log('\n🎉 Seed completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Seed failed:', error)
    process.exit(1)
  }
}

run()
