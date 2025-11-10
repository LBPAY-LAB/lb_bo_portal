import type { CollectionConfig } from 'payload'

export const Roles: CollectionConfig = {
  slug: 'roles',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'type', 'usersCount', 'updatedAt'],
    group: 'Access Control',
    description: 'Role-Based Access Control (RBAC) roles',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => {
      // TODO: Only SuperAdmin can create roles
      return !!user
    },
    update: ({ req: { user } }) => {
      // TODO: Only SuperAdmin can update roles
      return !!user
    },
    delete: ({ req: { user } }) => {
      // TODO: Only SuperAdmin can delete roles
      return !!user
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Role display name (e.g., Super Admin)',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Role identifier (e.g., super_admin)',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Role description and responsibilities',
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
        description: 'System roles cannot be deleted',
      },
    },
    {
      name: 'permissions',
      type: 'relationship',
      relationTo: 'permissions',
      hasMany: true,
      admin: {
        description: 'Permissions granted to this role',
      },
    },
    {
      name: 'inheritsFrom',
      type: 'relationship',
      relationTo: 'roles',
      hasMany: true,
      admin: {
        description: 'Inherit permissions from other roles',
      },
    },
    {
      name: 'priority',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Priority level (higher = more permissions)',
      },
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Active/inactive role',
      },
    },
    {
      name: 'usersCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Number of users with this role (computed)',
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
    beforeDelete: [
      ({ req }) => {
        const data = req.data as any
        // Prevent deletion of system roles
        if (data?.type === 'system') {
          throw new Error('System roles cannot be deleted')
        }
      },
    ],
  },
}
