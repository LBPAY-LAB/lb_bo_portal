// storage-adapter-import-placeholder
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

// Import all translations
import { translations } from '@payloadcms/translations/all'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Applications } from './collections/Applications'
import { MenuItems } from './collections/MenuItems'
import { PortalSettings } from './collections/PortalSettings'
import { AuditLogs } from './collections/AuditLogs'
import { Roles } from './collections/Roles'
import { Permissions } from './collections/Permissions'
import { Notifications } from './collections/Notifications'
import { ApiKeys } from './collections/ApiKeys'
import { EmailTemplates } from './collections/EmailTemplates'
import { UserInvitations } from './collections/UserInvitations'
import { usersMeEndpoint } from './endpoints/users-me'
import { syncKeycloakRolesEndpoint } from './endpoints/sync-keycloak-roles'
import { createKeycloakRoleEndpoint } from './endpoints/create-keycloak-role'
import { createKeycloakUserEndpoint } from './endpoints/create-keycloak-user'
import { syncUserToKeycloakEndpoint } from './endpoints/sync-user-to-keycloak'
import { testKeycloakConnectionEndpoint } from './endpoints/test-keycloak-connection'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      graphics: {
        Logo: '@/components/payload/Logo#Logo',
        Icon: '@/components/payload/Logo#Icon',
      },
      logout: {
        Button: '@/components/admin/LogoutButton#LogoutButton',
      },
      actions: ['@/components/admin/HeaderRight#HeaderRight'],
      account: [],
      providers: ['@/providers/ThemeProvider#ThemeProvider'],
    },
  },
  i18n: {
    supportedLanguages: {
      pt: translations.pt,
      en: translations.en,
      es: translations.es,
    },
    fallbackLanguage: 'pt',
  },
  collections: [
    Roles,           // Referenced by Users, UserInvitations
    UserInvitations, // Referenced by Users
    Users,
    Media,
    Applications,
    MenuItems,
    Permissions,
    AuditLogs,
    Notifications,
    ApiKeys,
    EmailTemplates,
  ],
  globals: [PortalSettings],
  endpoints: [
    usersMeEndpoint,
    syncKeycloakRolesEndpoint,
    createKeycloakRoleEndpoint,
    createKeycloakUserEndpoint,
    syncUserToKeycloakEndpoint,
    testKeycloakConnectionEndpoint,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  sharp,
  plugins: [
    // storage-adapter-placeholder
  ],
})
