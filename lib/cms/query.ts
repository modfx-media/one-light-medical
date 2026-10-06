import { draftMode } from 'next/headers'
import { getPayload } from 'payload'

import { queryPathsFor } from '@/lib/cms/path'
import { withCMS } from '@/lib/cms/safe'
import config from '@payload-config'

function cmsReady() {
  return Boolean(process.env.PAYLOAD_SECRET && (process.env.DATABASE_URL || process.env.POSTGRES_URL))
}

export type RoutedCollection = 'pages' | 'posts'

export type RoutedDoc = {
  id: number | string
  title?: string | null
  h1?: string | null
  path?: string | null
  body?: unknown
  layout?: unknown[] | null
  canonicalUrl?: string | null
  noIndex?: boolean | null
  noFollow?: boolean | null
  excludeFromSitemap?: boolean | null
  sourceUpdatedAt?: string | null
  updatedAt?: string
  publishedAt?: string | null
  meta?: {
    title?: string | null
    description?: string | null
    image?: unknown
  }
}

export type RoutedContent = {
  collection: RoutedCollection
  doc: RoutedDoc
}

async function findByPath(collection: RoutedCollection, paths: string[], draft: boolean) {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection,
    depth: 2,
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      path: {
        in: paths,
      },
    },
  })

  return (result.docs[0] as RoutedDoc | undefined) ?? null
}

export async function queryRoutedContentByPath(path: string): Promise<RoutedContent | null> {
  if (!cmsReady()) return null
  return withCMS(async () => {
    const draft = (await draftMode()).isEnabled
    const paths = queryPathsFor(path)

    const page = await findByPath('pages', paths, draft)
    if (page) return { collection: 'pages', doc: page }

    const post = await findByPath('posts', paths, draft)
    if (post) return { collection: 'posts', doc: post }

    return null
  }, null)
}

export async function queryPublishedSitemapDocs(): Promise<RoutedContent[]> {
  if (!cmsReady()) return []
  return withCMS(async () => {
    const payload = await getPayload({ config })
    const [pages, posts] = await Promise.all([
      payload.find({
        collection: 'pages',
        depth: 0,
        draft: false,
        limit: 1000,
        overrideAccess: false,
        pagination: false,
        where: {
          _status: { equals: 'published' },
        },
      }),
      payload.find({
        collection: 'posts',
        depth: 0,
        draft: false,
        limit: 1000,
        overrideAccess: false,
        pagination: false,
        where: {
          _status: { equals: 'published' },
        },
      }),
    ])

    return [
      ...pages.docs.map((doc) => ({ collection: 'pages' as const, doc: doc as RoutedDoc })),
      ...posts.docs.map((doc) => ({ collection: 'posts' as const, doc: doc as RoutedDoc })),
    ]
  }, [])
}
