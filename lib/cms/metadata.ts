import type { Metadata } from 'next'

import { resolveBlogImage } from '@/lib/blog-image'
import { toPublicPath } from '@/lib/cms/path'
import { queryRoutedContentByPath, type RoutedDoc } from '@/lib/cms/query'
import { getEntryByPath } from '@/lib/route-map'
import { SITE_URL } from '@/lib/site'

function cmsMetadataFromDoc(doc: RoutedDoc): Metadata {
  const title = doc.meta?.title || doc.title || undefined
  const description = doc.meta?.description || undefined
  const canonical =
    doc.canonicalUrl || (doc.path ? `${SITE_URL}${toPublicPath(doc.path)}` : undefined)
  const index = !doc.noIndex
  const follow = !doc.noFollow

  return {
    title,
    description,
    robots: {
      index,
      follow,
    },
    ...(canonical ? { alternates: { canonical } } : {}),
  }
}

function hasOgImage(meta: Metadata): boolean {
  const images = meta.openGraph && 'images' in meta.openGraph ? meta.openGraph.images : undefined
  if (!images) return false
  return Array.isArray(images) ? images.length > 0 : true
}

export async function cmsMetadata(path: string, fallback: Metadata): Promise<Metadata> {
  const routed = await queryRoutedContentByPath(path)
  if (!routed) return fallback
  const base: Metadata = {
    ...fallback,
    ...cmsMetadataFromDoc(routed.doc),
  }
  if (hasOgImage(base) || routed.collection !== 'posts') return base

  const publicPath = routed.doc.path ? toPublicPath(routed.doc.path) : toPublicPath(path)
  const media =
    routed.doc.meta?.image && typeof routed.doc.meta.image === 'object'
      ? (routed.doc.meta.image as { url?: string | null; alt?: string | null })
      : null
  const image = resolveBlogImage({
    path: publicPath,
    src: media?.url || getEntryByPath(publicPath)?.ogImage || null,
    alt: media?.alt,
  })
  const openGraph = base.openGraph && typeof base.openGraph === 'object' ? base.openGraph : {}
  const twitter = base.twitter && typeof base.twitter === 'object' ? base.twitter : {}

  return {
    ...base,
    openGraph: {
      ...openGraph,
      images: [{ url: image.src, alt: image.alt }],
    },
    twitter: {
      ...twitter,
      card: 'summary_large_image',
      images: [image.src],
    },
  }
}
