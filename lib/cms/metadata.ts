import type { Metadata } from 'next'

import { blogCoverOrFallback } from '@/lib/blog-covers'
import { metadataTitleText, mergeCmsMetadata } from '@/lib/cms/merge-metadata'
import { toPublicPath } from '@/lib/cms/path'
import { queryRoutedContentByPath, type RoutedContent } from '@/lib/cms/query'

function imageFields(value: unknown): { url: string | null; alt: string | null } {
  if (!value || typeof value !== 'object') return { url: null, alt: null }
  const image = value as { url?: unknown; alt?: unknown }
  return {
    url: typeof image.url === 'string' ? image.url : null,
    alt: typeof image.alt === 'string' ? image.alt : null,
  }
}

function withPostCover(routed: RoutedContent, metadata: Metadata): Metadata {
  if (routed.collection !== 'posts') return metadata
  const doc = routed.doc
  const image = imageFields(doc.meta?.image)
  const path = toPublicPath(doc.path || '/')
  const cover = blogCoverOrFallback(path, image.url, image.alt || doc.h1 || doc.title)
  const openGraph = metadata.openGraph && typeof metadata.openGraph === 'object' ? metadata.openGraph : {}
  const twitter = metadata.twitter && typeof metadata.twitter === 'object' ? metadata.twitter : {}
  const title = metadataTitleText(metadata.title)
  const description = typeof metadata.description === 'string' ? metadata.description : undefined
  return {
    ...metadata,
    openGraph: {
      ...openGraph,
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      images: [{ url: cover.src, alt: cover.alt }],
    },
    twitter: {
      ...twitter,
      card: 'summary_large_image',
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      images: [cover.src],
    },
  }
}

export async function cmsMetadata(path: string, fallback: Metadata): Promise<Metadata> {
  const routed = await queryRoutedContentByPath(path)
  if (!routed) return fallback
  return withPostCover(routed, mergeCmsMetadata(fallback, routed.doc))
}
