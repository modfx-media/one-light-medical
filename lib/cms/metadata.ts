import type { Metadata } from 'next'

import { toPublicPath } from '@/lib/cms/path'
import { queryRoutedContentByPath, type RoutedDoc } from '@/lib/cms/query'
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

export async function cmsMetadata(path: string, fallback: Metadata): Promise<Metadata> {
  const routed = await queryRoutedContentByPath(path)
  if (!routed) return fallback
  return {
    ...fallback,
    ...cmsMetadataFromDoc(routed.doc),
  }
}
