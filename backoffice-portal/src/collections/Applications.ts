import type { CollectionConfig } from 'payload'

export const Applications: CollectionConfig = {
  slug: 'applications',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'url', 'status', 'updatedAt'],
    group: 'Portal Management',
    description: 'Manage external applications registered in the portal',
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
        description: 'Display name of the application',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Unique identifier (URL-friendly)',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Brief description of the application',
      },
    },
    {
      name: 'url',
      type: 'text',
      required: true,
      admin: {
        description: 'Full URL of the application (will be loaded in iframe)',
      },
    },
    {
      name: 'icon',
      type: 'text',
      admin: {
        description: 'Icon name (Lucide icon)',
        placeholder: 'LayoutDashboard',
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
        { label: 'Maintenance', value: 'maintenance' },
      ],
      admin: {
        description: 'Current status of the application',
      },
    },
    {
      name: 'openInNewTab',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Open application in new tab instead of iframe',
      },
    },
    {
      name: 'iframeSettings',
      type: 'group',
      admin: {
        description: 'Iframe rendering settings',
        condition: (data) => !data.openInNewTab,
      },
      fields: [
        {
          name: 'sandbox',
          type: 'select',
          hasMany: true,
          options: [
            { label: 'Allow Scripts', value: 'allow-scripts' },
            { label: 'Allow Forms', value: 'allow-forms' },
            { label: 'Allow Same Origin', value: 'allow-same-origin' },
            { label: 'Allow Popups', value: 'allow-popups' },
            { label: 'Allow Modals', value: 'allow-modals' },
          ],
          admin: {
            description: 'Iframe sandbox permissions',
          },
        },
        {
          name: 'allowFullscreen',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },
    {
      name: 'healthCheck',
      type: 'group',
      admin: {
        description: 'Health check configuration',
      },
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'endpoint',
          type: 'text',
          admin: {
            condition: (data, siblingData) => siblingData?.enabled,
            placeholder: '/health',
          },
        },
        {
          name: 'intervalSeconds',
          type: 'number',
          defaultValue: 60,
          admin: {
            condition: (data, siblingData) => siblingData?.enabled,
          },
        },
      ],
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional metadata (JSON format)',
      },
    },
  ],
  timestamps: true,
}
