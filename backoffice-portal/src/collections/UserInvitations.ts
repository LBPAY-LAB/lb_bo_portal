import type { CollectionConfig } from 'payload'
import crypto from 'crypto'

export const UserInvitations: CollectionConfig = {
  slug: 'user-invitations',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'status', 'expiresAt', 'invitedBy', 'createdAt'],
    group: 'User Management',
    description: 'Email-based user invitations with time-limited tokens',
  },
  access: {
    read: ({ req: { user } }) => {
      // TODO: Only SuperAdmin/Admin can read invitations
      return !!user
    },
    create: ({ req: { user } }) => {
      // TODO: Only SuperAdmin/Admin can create invitations
      return !!user
    },
    update: () => {
      // Only system can update (via hooks/endpoints)
      return false
    },
    delete: ({ req: { user } }) => {
      // TODO: Only SuperAdmin can delete invitations
      return !!user
    },
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Email address of invited user (one active invitation per email)',
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Full name of invited user',
      },
    },
    {
      name: 'roles',
      type: 'relationship',
      relationTo: 'roles',
      hasMany: true,
      required: true,
      admin: {
        description: 'Roles to assign when user accepts invitation',
      },
    },
    {
      name: 'token',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Secure random token (auto-generated)',
        readOnly: true,
        hidden: true, // Don't show in UI for security
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Accepted', value: 'accepted' },
        { label: 'Expired', value: 'expired' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      admin: {
        description: 'Invitation status',
      },
    },
    {
      name: 'expiresAt',
      type: 'date',
      required: true,
      admin: {
        description: 'Invitation expires 48 hours after creation',
        readOnly: true,
      },
    },
    {
      name: 'invitedBy',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'Admin who sent the invitation',
      },
    },
    {
      name: 'acceptedAt',
      type: 'date',
      admin: {
        description: 'When user accepted invitation',
        readOnly: true,
      },
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional metadata (IP, user-agent, etc.)',
      },
    },
  ],
  timestamps: true,
  hooks: {
    beforeChange: [
      async ({ operation, data, req }) => {
        // Auto-generate token and expiration on create
        if (operation === 'create') {
          // Generate secure 32-byte token
          data.token = crypto.randomBytes(32).toString('hex')

          // Set expiration to 48 hours from now
          const expiresAt = new Date()
          expiresAt.setHours(expiresAt.getHours() + 48)
          data.expiresAt = expiresAt.toISOString()

          // Set invitedBy to current user
          if (req.user) {
            data.invitedBy = req.user.id
          }

          // Default status
          data.status = 'pending'

          console.log('✅ User invitation created:', {
            email: data.email,
            token: data.token.substring(0, 8) + '...',
            expiresAt: data.expiresAt,
          })
        }

        return data
      },
    ],
    afterChange: [
      async ({ operation, doc, req }) => {
        // Send invitation email after creation
        if (operation === 'create' && doc.status === 'pending') {
          try {
            // Import email service dynamically to avoid circular dependencies
            const { sendInvitationEmail } = await import('@/lib/email')

            await sendInvitationEmail({
              to: doc.email,
              name: doc.name,
              inviterName: req.user?.name || req.user?.email || 'Admin',
              invitationToken: doc.token,
            })

            console.log('✅ Invitation email sent to:', doc.email)
          } catch (error) {
            console.error('❌ Failed to send invitation email:', error)
            // Don't throw error - invitation was created, email can be resent
          }
        }

        return doc
      },
    ],
    beforeRead: [
      async ({ doc }) => {
        // Auto-expire invitations past their expiration date
        if (doc.status === 'pending' && new Date(doc.expiresAt) < new Date()) {
          // Update status to expired
          doc.status = 'expired'

          // Persist the change
          try {
            const { getPayload } = await import('payload')
            const { default: config } = await import('@/payload.config')
            const payload = await getPayload({ config: await config })

            await payload.update({
              collection: 'user-invitations',
              id: doc.id,
              data: {
                status: 'expired',
              },
            })

            console.log('⏰ Invitation auto-expired:', doc.email)
          } catch (error) {
            console.error('❌ Failed to auto-expire invitation:', error)
          }
        }

        return doc
      },
    ],
  },
}
