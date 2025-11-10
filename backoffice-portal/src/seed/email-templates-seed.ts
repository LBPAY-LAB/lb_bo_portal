import { getPayload } from 'payload'
import config from '@/payload.config'

async function seed() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  console.log('🌱 Seeding default email templates...')

  // Template 1: User Invitation
  await payload.create({
    collection: 'email-templates',
    data: {
      name: 'User Invitation Email',
      slug: 'user_invitation',
      type: 'system',
      subject: 'You have been invited to {{portalName}}',
      htmlBody: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #2563EB; color: white; padding: 20px; text-align: center;">
    <h1>{{portalName}}</h1>
  </div>
  <div style="padding: 30px; background: #f9fafb;">
    <h2>Hi {{username}},</h2>
    <p>You've been invited to join <strong>{{portalName}}</strong> by {{inviterName}}.</p>
    <p>Click the button below to accept and create your account:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{invitationLink}}" style="background: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Accept Invitation</a>
    </div>
    <p style="color: #6B7280; font-size: 14px;">
      This invitation expires in 48 hours ({{expiresAt}}).
    </p>
  </div>
</body>
</html>
      `,
      textBody: 'Hi {{username}}, you have been invited to {{portalName}}. Accept: {{invitationLink}}',
      availableVariables: [
        {
          variable: 'username',
          description: 'User full name',
          example: 'John Doe',
        },
        {
          variable: 'inviterName',
          description: 'Name of admin who sent invitation',
          example: 'Admin User',
        },
        {
          variable: 'invitationLink',
          description: 'Unique invitation acceptance link',
          example: 'https://portal.lbpay.com/accept-invitation?token=...',
        },
        {
          variable: 'portalName',
          description: 'Portal name from settings',
          example: 'LBPAY Portal',
        },
        {
          variable: 'expiresAt',
          description: 'Expiration date/time',
          example: '12/01/2025 18:00',
        },
      ],
      active: true,
      category: 'user_management',
    },
  })

  console.log('✅ Created template: User Invitation Email')

  // Template 2: Welcome Email
  await payload.create({
    collection: 'email-templates',
    data: {
      name: 'Welcome Email',
      slug: 'welcome',
      type: 'system',
      subject: 'Welcome to {{portalName}}!',
      htmlBody: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #2563EB; color: white; padding: 20px; text-align: center;">
    <h1>{{portalName}}</h1>
  </div>
  <div style="padding: 30px; background: #f9fafb;">
    <h2>Welcome, {{username}}!</h2>
    <p>Your account has been created successfully.</p>
    <p>You can now login at: <a href="{{loginLink}}">{{loginLink}}</a></p>
  </div>
</body>
</html>
      `,
      textBody: 'Welcome {{username}}! Login at: {{loginLink}}',
      availableVariables: [
        {
          variable: 'username',
          description: 'User full name',
          example: 'John Doe',
        },
        {
          variable: 'portalName',
          description: 'Portal name',
          example: 'LBPAY Portal',
        },
        {
          variable: 'loginLink',
          description: 'Login page URL',
          example: 'https://portal.lbpay.com/login',
        },
      ],
      active: true,
      category: 'user_management',
    },
  })

  console.log('✅ Created template: Welcome Email')

  // Template 3: Password Reset
  await payload.create({
    collection: 'email-templates',
    data: {
      name: 'Password Reset Notification',
      slug: 'password_reset',
      type: 'system',
      subject: 'Password reset request - {{portalName}}',
      htmlBody: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #2563EB; color: white; padding: 20px; text-align: center;">
    <h1>{{portalName}}</h1>
  </div>
  <div style="padding: 30px; background: #f9fafb;">
    <h2>Hi {{username}},</h2>
    <p>A password reset email has been sent to you by Keycloak.</p>
    <p>Please check your inbox for instructions.</p>
  </div>
</body>
</html>
      `,
      textBody: 'Hi {{username}}, check your email for password reset instructions.',
      availableVariables: [
        {
          variable: 'username',
          description: 'User full name',
          example: 'John Doe',
        },
        {
          variable: 'portalName',
          description: 'Portal name',
          example: 'LBPAY Portal',
        },
      ],
      active: true,
      category: 'security',
    },
  })

  console.log('✅ Created template: Password Reset Notification')

  console.log('\n🎉 Email templates seeded successfully!')
  console.log('\nTemplates created:')
  console.log('  1. user_invitation - User Invitation Email')
  console.log('  2. welcome - Welcome Email')
  console.log('  3. password_reset - Password Reset Notification')

  process.exit(0)
}

seed().catch((error) => {
  console.error('❌ Seed failed:', error)
  process.exit(1)
})
