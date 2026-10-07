import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { Faqs } from './collections/Faqs'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Users } from './collections/Users'
import { Footer, Header, SiteSettings } from './globals/Site'
import { toPublicPath } from './lib/cms/path'
import { getCorsOrigins, getServerURL } from './lib/cms/url'

const dirname = process.cwd()

const disablePush =
  Boolean(process.env.VERCEL) ||
  process.env.CMS_IMPORT_APPLY === '1' ||
  process.env.PAYLOAD_PUSH === 'false'

const blobToken = process.env.BLOB_READ_WRITE_TOKEN

export default buildConfig({
  admin: {
    importMap: {
      baseDir: path.resolve(/* turbopackIgnore: true */ dirname),
      importMapFile: path.resolve(dirname, 'app/(payload)/admin/importMap.js'),
    },
    livePreview: {
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 375, height: 667 },
        { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
    user: Users.slug,
  },
  collections: [Users, Media, Pages, Posts, Faqs],
  cors: getCorsOrigins(),
  csrf: getCorsOrigins(),
  db: vercelPostgresAdapter({
    forceUseVercelPostgres: true,
    pool: {
      connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL || '',
    },
    push: !disablePush,
  }),
  editor: lexicalEditor(),
  globals: [Header, Footer, SiteSettings],
  plugins: [
    seoPlugin({
      collections: ['pages', 'posts'],
      fields: ({ defaultFields }) => defaultFields,
      generateTitle: ({ doc }) => (typeof doc?.title === 'string' ? doc.title : ''),
      generateURL: ({ doc }) => {
        const pathValue = typeof doc?.path === 'string' ? doc.path : ''
        if (!pathValue) return getServerURL()
        return `${getServerURL()}${toPublicPath(pathValue)}`
      },
      tabbedUI: true,
      uploadsCollection: 'media',
    }),
    ...(blobToken
      ? [
          vercelBlobStorage({
            collections: {
              media: true,
            },
            token: blobToken,
          }),
        ]
      : []),
  ],
  secret: process.env.PAYLOAD_SECRET || '',
  serverURL: getServerURL(),
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
