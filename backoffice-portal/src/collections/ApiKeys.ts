import type { CollectionConfig } from 'payload'

export const ApiKeys: CollectionConfig = {
  slug: 'api-keys',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'application', 'status', 'expiresAt', 'updatedAt'],
    group: 'Compliance & Security',
    description: 'API keys for external applications integration',
  },
  access: {
    read: ({ req: { user } }) => !!user,
    create: ({ req: { user } }) => {
      // TODO: Only admins can create API keys
      return !!user
    },
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Friendly name for this API key',
      },
    },
    {
      name: 'key',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'API key (auto-generated, read-only)',
        readOnly: true,
      },
    },
    {
      name: 'secret',
      type: 'text',
      admin: {
        description: 'API secret (hashed, shown only once on creation)',
        readOnly: true,
      },
    },
    {
      name: 'application',
      type: 'relationship',
      relationTo: 'applications',
      admin: {
        description: 'Application this key belongs to',
      },
    },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'User who created this key',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Revoked', value: 'revoked' },
        { label: 'Expired', value: 'expired' },
      ],
      admin: {
        description: 'API key status',
      },
    },
    {
      name: 'permissions',
      type: 'relationship',
      relationTo: 'permissions',
      hasMany: true,
      admin: {
        description: 'Permissions granted to this API key',
      },
    },
    {
      name: 'rateLimit',
      type: 'group',
      admin: {
        description: 'Rate limiting configuration',
      },
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'requestsPerMinute',
          type: 'number',
          defaultValue: 60,
          admin: {
            condition: (data, siblingData) => siblingData?.enabled,
          },
        },
        {
          name: 'requestsPerHour',
          type: 'number',
          defaultValue: 1000,
          admin: {
            condition: (data, siblingData) => siblingData?.enabled,
          },
        },
      ],
    },
    {
      name: 'ipWhitelist',
      type: 'array',
      admin: {
        description: 'IP addresses allowed to use this key',
      },
      fields: [
        {
          name: 'ip',
          type: 'text',
          required: true,
          admin: {
            placeholder: '192.168.1.1',
          },
        },
      ],
    },
    {
      name: 'expiresAt',
      type: 'date',
      admin: {
        description: 'Expiration date (optional)',
      },
    },
    {
      name: 'lastUsedAt',
      type: 'date',
      admin: {
        description: 'Last time this key was used',
        readOnly: true,
      },
    },
    {
      name: 'usageCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Number of times this key has been used',
        readOnly: true,
      },
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional metadata',
      },
    },
  ],
  timestamps: true,
  hooks: {
    beforeChange: [
      ({ operation, data }) => {
        // Auto-generate API key on creation
        if (operation === 'create' && !data.key) {
          // Generate random 32-char key
          data.key = `pk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
          // Generate random 64-char secret
          data.secret = `sk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
        }

        // Auto-expire if past expiration date
        if (data.expiresAt && new Date(data.expiresAt) < new Date()) {
          data.status = 'expired'
        }

        return data
      },
    ],
  },
}
