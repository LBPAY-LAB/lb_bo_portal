import type { CollectionConfig } from 'payload'

export const Notifications: CollectionConfig = {
  slug: 'notifications',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'recipient', 'read', 'createdAt'],
    group: 'Communications',
    description: 'In-app notifications for users',
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      // Users can only read their own notifications
      return {
        recipient: {
          equals: user.id,
        },
      }
    },
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => {
      if (!user) return false
      // Users can only update their own notifications (mark as read)
      return {
        recipient: {
          equals: user.id,
        },
      }
    },
    delete: ({ req: { user } }) => {
      if (!user) return false
      // Users can delete their own notifications
      return {
        recipient: {
          equals: user.id,
        },
      }
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Notification title',
      },
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Notification message',
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'info',
      options: [
        { label: 'Info', value: 'info' },
        { label: 'Success', value: 'success' },
        { label: 'Warning', value: 'warning' },
        { label: 'Error', value: 'error' },
      ],
      admin: {
        description: 'Notification type (affects icon and color)',
      },
    },
    {
      name: 'recipient',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'User who will receive the notification',
      },
    },
    {
      name: 'read',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Has the user read this notification?',
      },
    },
    {
      name: 'readAt',
      type: 'date',
      admin: {
        description: 'Timestamp when notification was read',
        condition: (data) => data.read,
      },
    },
    {
      name: 'action',
      type: 'group',
      admin: {
        description: 'Optional action (link, button)',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          admin: {
            placeholder: 'View Details',
          },
        },
        {
          name: 'url',
          type: 'text',
          admin: {
            placeholder: '/admin/collections/applications/123',
          },
        },
        {
          name: 'openInNewTab',
          type: 'checkbox',
          defaultValue: false,
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
    {
      name: 'expiresAt',
      type: 'date',
      admin: {
        description: 'Auto-delete notification after this date',
      },
    },
  ],
  timestamps: true,
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        // Auto-set readAt timestamp when marked as read
        if (operation === 'update' && data.read && !data.readAt) {
          data.readAt = new Date().toISOString()
        }
        return data
      },
    ],
  },
}
