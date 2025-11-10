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
import { usersMeEndpoint } from './endpoints/users-me'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Media,
    Applications,
    MenuItems,
    Roles,
    Permissions,
    AuditLogs,
    Notifications,
    ApiKeys,
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
