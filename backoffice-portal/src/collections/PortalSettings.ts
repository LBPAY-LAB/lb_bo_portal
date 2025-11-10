import type { GlobalConfig } from 'payload'

export const PortalSettings: GlobalConfig = {
  slug: 'portal-settings',
  admin: {
    group: 'Portal Management',
    description: 'Global portal configuration (branding, i18n, themes)',
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => !!user,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Branding',
          fields: [
            {
              name: 'portalName',
              type: 'text',
              required: true,
              defaultValue: 'LB Portal Container',
              admin: {
                description: 'Portal display name',
              },
            },
            {
              name: 'logo',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Portal logo (shown in header)',
              },
            },
            {
              name: 'favicon',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Browser favicon',
              },
            },
            {
              name: 'primaryColor',
              type: 'text',
              defaultValue: '#0070f3',
              admin: {
                description: 'Primary brand color (hex)',
              },
            },
            {
              name: 'secondaryColor',
              type: 'text',
              defaultValue: '#7928ca',
              admin: {
                description: 'Secondary brand color (hex)',
              },
            },
          ],
        },
        {
          label: 'Internationalization',
          fields: [
            {
              name: 'defaultLanguage',
              type: 'select',
              required: true,
              defaultValue: 'pt-BR',
              options: [
                { label: 'Português (Brasil)', value: 'pt-BR' },
                { label: 'English (US)', value: 'en-US' },
                { label: 'Español', value: 'es-ES' },
              ],
              admin: {
                description: 'Default portal language',
              },
            },
            {
              name: 'enabledLanguages',
              type: 'select',
              hasMany: true,
              required: true,
              defaultValue: ['pt-BR', 'en-US'],
              options: [
                { label: 'Português (Brasil)', value: 'pt-BR' },
                { label: 'English (US)', value: 'en-US' },
                { label: 'Español', value: 'es-ES' },
              ],
              admin: {
                description: 'Enabled languages for users to select',
              },
            },
            {
              name: 'dateFormat',
              type: 'select',
              defaultValue: 'DD/MM/YYYY',
              options: [
                { label: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
                { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
                { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
              ],
            },
            {
              name: 'timeFormat',
              type: 'select',
              defaultValue: '24h',
              options: [
                { label: '24 hours', value: '24h' },
                { label: '12 hours (AM/PM)', value: '12h' },
              ],
            },
          ],
        },
        {
          label: 'Theme',
          fields: [
            {
              name: 'defaultTheme',
              type: 'select',
              defaultValue: 'light',
              options: [
                { label: 'Light', value: 'light' },
                { label: 'Dark', value: 'dark' },
                { label: 'System', value: 'system' },
              ],
              admin: {
                description: 'Default color theme',
              },
            },
            {
              name: 'allowUserThemeSelection',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Allow users to override theme',
              },
            },
          ],
        },
        {
          label: 'Security',
          fields: [
            {
              name: 'sessionTimeout',
              type: 'number',
              defaultValue: 3600,
              admin: {
                description: 'Session timeout in seconds (default: 1 hour)',
              },
            },
            {
              name: 'maxLoginAttempts',
              type: 'number',
              defaultValue: 5,
              admin: {
                description: 'Max failed login attempts before lockout',
              },
            },
            {
              name: 'passwordPolicy',
              type: 'group',
              fields: [
                {
                  name: 'minLength',
                  type: 'number',
                  defaultValue: 8,
                },
                {
                  name: 'requireUppercase',
                  type: 'checkbox',
                  defaultValue: true,
                },
                {
                  name: 'requireLowercase',
                  type: 'checkbox',
                  defaultValue: true,
                },
                {
                  name: 'requireNumbers',
                  type: 'checkbox',
                  defaultValue: true,
                },
                {
                  name: 'requireSpecialChars',
                  type: 'checkbox',
                  defaultValue: false,
                },
              ],
            },
          ],
        },
        {
          label: 'Features',
          fields: [
            {
              name: 'enableAuditLogs',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Enable audit logging for compliance',
              },
            },
            {
              name: 'enableNotifications',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Enable in-app notifications',
              },
            },
            {
              name: 'maintenanceMode',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Enable maintenance mode (blocks user access)',
              },
            },
            {
              name: 'maintenanceMessage',
              type: 'textarea',
              admin: {
                description: 'Message shown during maintenance',
                condition: (data) => data.maintenanceMode,
              },
            },
          ],
        },
      ],
    },
  ],
}
