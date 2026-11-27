import { Fragment, isValidElement, type ReactNode } from 'react'

import type { RoutedContent } from '@/lib/cms/query'

export type RoutedBody = 'designed' | 'generic' | 'none'

/** A real page component, not null or an empty fragment. */
export function childrenAreDesigned(children: ReactNode): boolean {
  if (children == null || typeof children === 'boolean') return false
  if (typeof children === 'string') return children.trim().length > 0
  if (typeof children === 'number') return true
  if (Array.isArray(children)) return children.some((child) => childrenAreDesigned(child))
  if (isValidElement(children) && children.type === Fragment) {
    const nested = (children.props as { children?: ReactNode }).children
    return childrenAreDesigned(nested)
  }
  return isValidElement(children)
}

/** Real body copy or blocks. A title alone is not content. */
export function pageHasRealContent(doc: { body?: unknown; layout?: unknown[] | null }): boolean {
  if (Array.isArray(doc.layout) && doc.layout.length > 0) return true
  return Boolean(doc.body)
}

/**
 * Designed pages always render their own component, even when a published
 * doc has layout blocks. Payload supplies SEO for those routes and must
 * not swap in the generic renderer. Posts still use that renderer when
 * the article body exists, including CMS-only posts.
 */
export function selectRoutedBody(input: {
  hasDesignedPage: boolean
  routed: RoutedContent | null
}): RoutedBody {
  if (input.hasDesignedPage && input.routed?.collection !== 'posts') return 'designed'
  if (!input.routed) return 'none'
  if (pageHasRealContent(input.routed.doc)) return 'generic'
  return input.hasDesignedPage ? 'designed' : 'none'
}
