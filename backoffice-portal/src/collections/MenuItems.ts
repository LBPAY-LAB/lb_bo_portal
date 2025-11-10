import type { CollectionConfig } from 'payload'

export const MenuItems: CollectionConfig = {
  slug: 'menu-items',
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'type', 'order', 'visible', 'updatedAt'],
    group: 'Portal Management',
    description: 'Manage portal sidebar menu structure',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
      admin: {
        description: 'Menu item label (supports i18n)',
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Application', value: 'application' },
        { label: 'External Link', value: 'external' },
        { label: 'Divider', value: 'divider' },
        { label: 'Group', value: 'group' },
      ],
      admin: {
        description: 'Type of menu item',
      },
    },
    {
      name: 'application',
      type: 'relationship',
      relationTo: 'applications',
      admin: {
        description: 'Link to registered application',
        condition: (data) => data.type === 'application',
      },
    },
    {
      name: 'externalUrl',
      type: 'text',
      admin: {
        description: 'External URL',
        condition: (data) => data.type === 'external',
      },
    },
    {
      name: 'icon',
      type: 'text',
      admin: {
        description: 'Icon name (Lucide icon)',
        placeholder: 'Home',
        condition: (data) => data.type !== 'divider',
      },
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'menu-items',
      admin: {
        description: 'Parent menu item (for nested menus)',
        condition: (data) => data.type !== 'divider',
      },
    },
    {
      name: 'order',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Display order (lower numbers appear first)',
      },
    },
    {
      name: 'visible',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Show/hide menu item',
      },
    },
    {
      name: 'badge',
      type: 'group',
      admin: {
        description: 'Badge configuration (notifications, counts)',
        condition: (data) => data.type === 'application',
      },
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'type',
          type: 'select',
          options: [
            { label: 'Static Text', value: 'static' },
            { label: 'Dynamic API', value: 'api' },
          ],
          admin: {
            condition: (data, siblingData) => siblingData?.enabled,
          },
        },
        {
          name: 'text',
          type: 'text',
          admin: {
            description: 'Static badge text',
            condition: (data, siblingData) => siblingData?.type === 'static',
          },
        },
        {
          name: 'apiEndpoint',
          type: 'text',
          admin: {
            description: 'API endpoint to fetch badge value',
            condition: (data, siblingData) => siblingData?.type === 'api',
          },
        },
        {
          name: 'variant',
          type: 'select',
          defaultValue: 'default',
          options: [
            { label: 'Default', value: 'default' },
            { label: 'Primary', value: 'primary' },
            { label: 'Success', value: 'success' },
            { label: 'Warning', value: 'warning' },
            { label: 'Error', value: 'error' },
          ],
        },
      ],
    },
    {
      name: 'requiredRoles',
      type: 'array',
      admin: {
        description: 'Roles required to see this menu item (RBAC)',
      },
      fields: [
        {
          name: 'role',
          type: 'text',
        },
      ],
    },
  ],
  timestamps: true,
}
