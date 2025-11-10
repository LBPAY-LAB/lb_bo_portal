// Email Service with editable template support
import nodemailer from 'nodemailer'
import { getPayload } from 'payload'
import config from '@/payload.config'

/**
 * Email Service
 *
 * Sends emails using templates stored in PayloadCMS database.
 * Templates are editable by admins via the Admin UI.
 */

/**
 * Replace variables in template string
 * Supports: {{username}}, {{invitationLink}}, {{portalName}}, etc.
 */
function replaceVariables(template: string, variables: Record<string, string>): string {
  let result = template

  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g')
    result = result.replace(regex, value)
  }

  return result
}

/**
 * Get email template from database
 */
async function getTemplate(slug: string): Promise<{
  subject: string
  htmlBody: string
  textBody?: string
} | null> {
  try {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    const templates = await payload.find({
      collection: 'email-templates',
      where: {
        and: [{ slug: { equals: slug } }, { active: { equals: true } }],
      },
      limit: 1,
    })

    if (templates.docs.length === 0) {
      console.warn(`⚠️ Email template not found: ${slug}`)
      return null
    }

    const template = templates.docs[0] as any

    return {
      subject: template.subject,
      htmlBody: template.htmlBody,
      textBody: template.textBody || null,
    }
  } catch (error) {
    console.error('❌ Failed to get email template:', error)
    return null
  }
}

/**
 * Create nodemailer transporter
 */
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  })
}

/**
 * Send invitation email to new user
 */
export async function sendInvitationEmail(data: {
  to: string
  name: string
  inviterName: string
  invitationToken: string
}): Promise<void> {
  try {
    // Get template from database
    const template = await getTemplate('user_invitation')

    if (!template) {
      throw new Error('Invitation email template not found')
    }

    // Build invitation link
    const invitationLink = `${process.env.NEXT_PUBLIC_SERVER_URL}/accept-invitation?token=${data.invitationToken}`

    // Get portal settings for portal name
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    const portalSettings = await payload.findGlobal({
      slug: 'portal-settings',
    })

    const portalName = (portalSettings?.portalName as string) || 'LBPAY Portal'

    // Replace variables
    const variables = {
      username: data.name,
      name: data.name,
      inviterName: data.inviterName,
      invitationLink,
      portalName,
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toLocaleString('pt-BR'),
    }

    const subject = replaceVariables(template.subject, variables)
    const html = replaceVariables(template.htmlBody, variables)
    const text = template.textBody ? replaceVariables(template.textBody, variables) : undefined

    // Send email
    const transporter = createTransporter()

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"${portalName}" <noreply@lbpay.com.br>`,
      to: data.to,
      subject,
      html,
      text,
    })

    console.log('✅ Invitation email sent to:', data.to)
  } catch (error) {
    console.error('❌ Failed to send invitation email:', error)
    throw error
  }
}

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(data: { to: string; name: string }): Promise<void> {
  try {
    // Get template from database
    const template = await getTemplate('welcome')

    if (!template) {
      // Fallback to simple email if template not found
      console.warn('⚠️ Welcome template not found, using fallback')

      const payloadConfig = await config
      const payload = await getPayload({ config: payloadConfig })

      const portalSettings = await payload.findGlobal({
        slug: 'portal-settings',
      })

      const portalName = (portalSettings?.portalName as string) || 'LBPAY Portal'

      const transporter = createTransporter()

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || `"${portalName}" <noreply@lbpay.com.br>`,
        to: data.to,
        subject: `Welcome to ${portalName}!`,
        html: `
          <h1>Welcome, ${data.name}!</h1>
          <p>Your account has been created successfully.</p>
          <p>You can now login at: <a href="${process.env.NEXT_PUBLIC_SERVER_URL}/login">${process.env.NEXT_PUBLIC_SERVER_URL}/login</a></p>
        `,
        text: `Welcome, ${data.name}! Your account has been created successfully. You can now login at: ${process.env.NEXT_PUBLIC_SERVER_URL}/login`,
      })

      console.log('✅ Welcome email sent (fallback):', data.to)
      return
    }

    // Get portal settings
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    const portalSettings = await payload.findGlobal({
      slug: 'portal-settings',
    })

    const portalName = (portalSettings?.portalName as string) || 'LBPAY Portal'

    // Replace variables
    const variables = {
      username: data.name,
      name: data.name,
      portalName,
      loginLink: `${process.env.NEXT_PUBLIC_SERVER_URL}/login`,
    }

    const subject = replaceVariables(template.subject, variables)
    const html = replaceVariables(template.htmlBody, variables)
    const text = template.textBody ? replaceVariables(template.textBody, variables) : undefined

    // Send email
    const transporter = createTransporter()

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"${portalName}" <noreply@lbpay.com.br>`,
      to: data.to,
      subject,
      html,
      text,
    })

    console.log('✅ Welcome email sent to:', data.to)
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error)
    throw error
  }
}

/**
 * Send password reset email (via Keycloak)
 * Note: This is just a notification, actual reset is done by Keycloak
 */
export async function sendPasswordResetNotification(data: {
  to: string
  name: string
}): Promise<void> {
  try {
    // Get template from database
    const template = await getTemplate('password_reset')

    if (!template) {
      console.warn('⚠️ Password reset template not found, skipping email')
      return
    }

    // Get portal settings
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    const portalSettings = await payload.findGlobal({
      slug: 'portal-settings',
    })

    const portalName = (portalSettings?.portalName as string) || 'LBPAY Portal'

    // Replace variables
    const variables = {
      username: data.name,
      name: data.name,
      portalName,
    }

    const subject = replaceVariables(template.subject, variables)
    const html = replaceVariables(template.htmlBody, variables)
    const text = template.textBody ? replaceVariables(template.textBody, variables) : undefined

    // Send email
    const transporter = createTransporter()

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"${portalName}" <noreply@lbpay.com.br>`,
      to: data.to,
      subject,
      html,
      text,
    })

    console.log('✅ Password reset notification sent to:', data.to)
  } catch (error) {
    console.error('❌ Failed to send password reset notification:', error)
    // Don't throw - this is just a notification
  }
}

/**
 * Test email configuration
 */
export async function testEmailConfiguration(): Promise<boolean> {
  try {
    const transporter = createTransporter()

    await transporter.verify()

    console.log('✅ Email configuration is valid')
    return true
  } catch (error) {
    console.error('❌ Email configuration error:', error)
    return false
  }
}
