import { draftMode } from 'next/headers'
import type { ReactNode } from 'react'

import { LivePreviewListener } from '@/components/cms/live-preview-listener'
import { RenderRoutedContent } from '@/components/cms/render-routed-content'
import { resolveBlogImage } from '@/lib/blog-image'
import { toPublicPath } from '@/lib/cms/path'
import { queryRoutedContentByPath } from '@/lib/cms/query'
import { getEntryByPath } from '@/lib/route-map'

export async function CMSRoute({
  path,
  children,
}: {
  path: string
  children: ReactNode
}) {
  const [routed, draft] = await Promise.all([queryRoutedContentByPath(path), draftMode()])

  if (!routed) return children

  const publicPath = routed.doc.path ? toPublicPath(routed.doc.path) : toPublicPath(path)
  const media =
    routed.doc.meta?.image && typeof routed.doc.meta.image === 'object'
      ? (routed.doc.meta.image as { url?: string | null; alt?: string | null })
      : null
  const cover =
    routed.collection === 'posts'
      ? resolveBlogImage({
          path: publicPath,
          src: media?.url || getEntryByPath(publicPath)?.ogImage || null,
          alt: media?.alt,
        })
      : null

  return (
    <>
      {draft.isEnabled ? <LivePreviewListener /> : null}
      <RenderRoutedContent doc={routed.doc} fallback={children} cover={cover} />
    </>
  )
}
