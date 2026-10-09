import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'

import { CacheEntries } from './collections/CacheEntries'
import { CacheEvents } from './collections/CacheEvents'
import { MetricSnapshots } from './collections/MetricSnapshots'
import { PromptVersions } from './collections/PromptVersions'
import { SecurityAlerts } from './collections/SecurityAlerts'
import { Tenants } from './collections/Tenants'
import { Users } from './collections/Users'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    components: {
      afterNavLinks: ['/components/MimirNavLink/index.tsx#default'],
      views: {
        mimirDashboard: {
          Component: '/components/MimirDashboard/index.tsx#default',
          path: '/mimir',
        },
      },
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      description: 'MIMIR — Adaptive Predictive Semantic Cache analytics dashboard',
      titleSuffix: '- MIMIR',
    },
    user: Users.slug,
  },
  collections: [
    Users,
    Tenants,
    CacheEntries,
    CacheEvents,
    MetricSnapshots,
    SecurityAlerts,
    PromptVersions,
  ],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
