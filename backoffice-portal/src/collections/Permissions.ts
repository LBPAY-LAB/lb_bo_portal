import type { CollectionConfig } from 'payload'

export const Permissions: CollectionConfig = {
  slug: 'permissions',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'resource', 'action', 'scope', 'updatedAt'],
    group: 'Access Control',
    description: 'Granular permissions (resource.action)',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Permission name (e.g., users:create)',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Human-readable description',
      },
    },
    {
      name: 'resource',
      type: 'select',
      required: true,
      options: [
        { label: 'Users', value: 'users' },
        { label: 'Roles', value: 'roles' },
        { label: 'Permissions', value: 'permissions' },
        { label: 'Applications', value: 'applications' },
        { label: 'Menu Items', value: 'menu_items' },
        { label: 'Audit Logs', value: 'audit_logs' },
        { label: 'Notifications', value: 'notifications' },
        { label: 'API Keys', value: 'api_keys' },
        { label: 'Portal Settings', value: 'portal_settings' },
        { label: 'All', value: '*' },
      ],
      admin: {
        description: 'Resource type',
      },
    },
    {
      name: 'action',
      type: 'select',
      required: true,
      hasMany: true,
      options: [
        { label: 'Create', value: 'create' },
        { label: 'Read', value: 'read' },
        { label: 'Update', value: 'update' },
        { label: 'Delete', value: 'delete' },
        { label: 'Export', value: 'export' },
        { label: 'Import', value: 'import' },
        { label: 'All', value: '*' },
      ],
      admin: {
        description: 'Allowed actions',
      },
    },
    {
      name: 'scope',
      type: 'select',
      required: true,
      defaultValue: 'global',
      options: [
        { label: 'Global', value: 'global' },
        { label: 'Own', value: 'own' },
        { label: 'Team', value: 'team' },
        { label: 'Org', value: 'org' },
      ],
      admin: {
        description: 'Scope of permission (e.g., own = only own records)',
      },
    },
    {
      name: 'conditions',
      type: 'json',
      admin: {
        description: 'Additional conditions (JSON format)',
        placeholder: '{ "field": "status", "value": "active" }',
      },
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Portal Management', value: 'portal' },
        { label: 'User Management', value: 'users' },
        { label: 'Security', value: 'security' },
        { label: 'Compliance', value: 'compliance' },
        { label: 'Business', value: 'business' },
      ],
      admin: {
        description: 'Permission category for organization',
      },
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
  timestamps: true,
}
