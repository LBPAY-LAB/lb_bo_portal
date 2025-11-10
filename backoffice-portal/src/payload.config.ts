// storage-adapter-import-placeholder
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

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

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      logout: {
        Button: '@/components/admin/LogoutButton#LogoutButton',
      },
      beforeNavLinks: ['@/components/admin/UserInfo#UserInfo'],
    },
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
  endpoints: [usersMeEndpoint],
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
