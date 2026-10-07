import type { NextConfig } from 'next'
import { withPayload } from '@payloadcms/next/withPayload'

const nextConfig: NextConfig = {
  // The legacy site serves every page at a trailing-slash URL and 301s the
  // non-slash form, so this preserves the exact indexed URLs after cutover.
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.public.blob.vercel-storage.com',
        pathname: '/**',
      },
    ],
  },
  serverExternalPackages: [
    'pg',
    '@payloadcms/db-vercel-postgres',
    '@neondatabase/serverless',
    '@vercel/postgres',
  ],
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
