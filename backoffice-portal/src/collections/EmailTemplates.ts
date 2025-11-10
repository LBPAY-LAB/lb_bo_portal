import type { CollectionConfig } from 'payload'

export const EmailTemplates: CollectionConfig = {
  slug: 'email-templates',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'subject', 'active', 'updatedAt'],
    group: 'System',
    description: 'Email templates with dynamic variables ({{username}}, {{invitationLink}}, etc.)',
  },
  access: {
    read: ({ req: { user } }) => {
      // Only authenticated users can read templates
      return !!user
    },
    create: ({ req: { user } }) => {
      // TODO: Only SuperAdmin can create templates
      return !!user
    },
    update: ({ req: { user } }) => {
      // TODO: Only SuperAdmin/Admin can update templates
      return !!user
    },
    delete: ({ req: { user } }) => {
      // TODO: Only SuperAdmin can delete system templates
      return !!user
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Template display name (e.g., User Invitation Email)',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description:
          'Template identifier used in code (e.g., user_invitation, welcome, password_reset)',
        readOnly: true,
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'System', value: 'system' },
        { label: 'Custom', value: 'custom' },
      ],
      admin: {
        description: 'System templates cannot be deleted',
      },
    },
    {
      name: 'subject',
      type: 'text',
      required: true,
      admin: {
        description: 'Email subject line (supports variables: {{username}}, {{portalName}})',
      },
    },
    {
      name: 'htmlBody',
      type: 'textarea',
      required: true,
      admin: {
        description: 'HTML email body with variable support',
        rows: 20,
      },
    },
    {
      name: 'textBody',
      type: 'textarea',
      admin: {
        description: 'Plain text version (fallback for email clients without HTML support)',
        rows: 10,
      },
    },
    {
      name: 'availableVariables',
      type: 'array',
      admin: {
        description: 'Available variables for this template',
        readOnly: true,
      },
      fields: [
        {
          name: 'variable',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'text',
          required: true,
        },
        {
          name: 'example',
          type: 'text',
        },
      ],
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Enable/disable template',
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'User Management', value: 'user_management' },
        { label: 'Notifications', value: 'notifications' },
        { label: 'Security', value: 'security' },
        { label: 'System', value: 'system' },
      ],
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional metadata (sender, reply-to, etc.)',
      },
    },
  ],
  timestamps: true,
  hooks: {
    beforeDelete: [
      ({ req }) => {
        const data = req.data as any
        // Prevent deletion of system templates
        if (data?.type === 'system') {
          throw new Error('System email templates cannot be deleted')
        }
      },
    ],
  },
}
