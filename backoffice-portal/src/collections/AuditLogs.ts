import type { CollectionConfig } from 'payload'

export const AuditLogs: CollectionConfig = {
  slug: 'audit-logs',
  admin: {
    useAsTitle: 'action',
    defaultColumns: ['action', 'user', 'resource', 'createdAt'],
    group: 'Compliance & Security',
    description: 'Immutable audit logs for compliance (LGPD, BACEN)',
    disableDuplicate: true,
  },
  access: {
    read: ({ req: { user } }) => {
      // Only admins can read audit logs
      if (!user) return false
      // TODO: Check if user has 'audit_viewer' role
      return true
    },
    create: () => false, // Only created via hooks
    update: () => false, // Immutable (append-only)
    delete: () => false, // Never delete (compliance requirement)
  },
  fields: [
    {
      name: 'action',
      type: 'select',
      required: true,
      options: [
        { label: 'Create', value: 'create' },
        { label: 'Read', value: 'read' },
        { label: 'Update', value: 'update' },
        { label: 'Delete', value: 'delete' },
        { label: 'Login', value: 'login' },
        { label: 'Logout', value: 'logout' },
        { label: 'Failed Login', value: 'failed_login' },
        { label: 'Password Change', value: 'password_change' },
        { label: 'Export Data', value: 'export_data' },
        { label: 'Import Data', value: 'import_data' },
      ],
      admin: {
        description: 'Type of action performed',
      },
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'User who performed the action',
      },
    },
    {
      name: 'resource',
      type: 'text',
      required: true,
      admin: {
        description: 'Resource affected (e.g., users, applications)',
      },
    },
    {
      name: 'resourceId',
      type: 'text',
      admin: {
        description: 'ID of the resource',
      },
    },
    {
      name: 'details',
      type: 'json',
      admin: {
        description: 'Additional details (changes, metadata)',
      },
    },
    {
      name: 'ipAddress',
      type: 'text',
      admin: {
        description: 'IP address of the client',
      },
    },
    {
      name: 'userAgent',
      type: 'text',
      admin: {
        description: 'Browser/client user agent',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'success',
      options: [
        { label: 'Success', value: 'success' },
        { label: 'Failed', value: 'failed' },
        { label: 'Error', value: 'error' },
      ],
    },
    {
      name: 'errorMessage',
      type: 'textarea',
      admin: {
        description: 'Error message if status is failed/error',
        condition: (data) => data.status !== 'success',
      },
    },
  ],
  timestamps: true,
  hooks: {
    beforeChange: [
      ({ operation }) => {
        // Prevent any updates or deletes (append-only)
        if (operation === 'update' || operation === 'delete') {
          throw new Error('Audit logs are immutable and cannot be modified')
        }
      },
    ],
  },
}
