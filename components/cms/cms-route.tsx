import { draftMode } from 'next/headers'
import type { ReactNode } from 'react'

import { LivePreviewListener } from '@/components/cms/live-preview-listener'
import { RenderRoutedContent } from '@/components/cms/render-routed-content'
import { queryRoutedContentByPath } from '@/lib/cms/query'

export async function CMSRoute({
  path,
  children,
}: {
  path: string
  children: ReactNode
}) {
  const [routed, draft] = await Promise.all([queryRoutedContentByPath(path), draftMode()])

  if (!routed) return children

  return (
    <>
      {draft.isEnabled ? <LivePreviewListener /> : null}
      <RenderRoutedContent doc={routed.doc} fallback={children} />
    </>
  )
}
