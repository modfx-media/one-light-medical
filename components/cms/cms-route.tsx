import { draftMode } from 'next/headers'
import type { ReactNode } from 'react'

import { LivePreviewListener } from '@/components/cms/live-preview-listener'
import { RenderRoutedContent } from '@/components/cms/render-routed-content'
import { childrenAreDesigned, selectRoutedBody } from '@/lib/cms/designed-page'
import { queryRoutedContentByPath } from '@/lib/cms/query'

export async function CMSRoute({
  path,
  children,
}: {
  path: string
  children: ReactNode
}) {
  const [routed, draft] = await Promise.all([queryRoutedContentByPath(path), draftMode()])

  // Designed pages always render `children`. A published doc contributes
  // title, description, and canonical through generateMetadata. Posts with
  // a body still use the generic article renderer.
  const body = selectRoutedBody({
    hasDesignedPage: childrenAreDesigned(children),
    routed,
  })

  if (body !== 'generic' || !routed) {
    return (
      <>
        {draft.isEnabled && routed ? <LivePreviewListener /> : null}
        {children}
      </>
    )
  }

  return (
    <>
      {draft.isEnabled ? <LivePreviewListener /> : null}
      <RenderRoutedContent
        doc={routed.doc}
        fallback={children}
        cover={routed.collection === 'posts'}
      />
    </>
  )
}
