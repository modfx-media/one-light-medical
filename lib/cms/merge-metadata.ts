import type { Metadata } from 'next'

import { toPublicPath } from '@/lib/cms/path'
import type { RoutedDoc } from '@/lib/cms/query'
import { SITE_URL } from '@/lib/site'

/** Non-empty editor text. Blank, "null", and "undefined" stay unset. */
export function publishedMetaText(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return undefined
  return trimmed
}

/** Document title as Next will print it, including `{ absolute }`. */
export function metadataTitleText(title: Metadata['title']): string | undefined {
  if (typeof title === 'string') return publishedMetaText(title)
  if (title && typeof title === 'object' && 'absolute' in title) {
    return publishedMetaText(title.absolute)
  }
  return undefined
}

function canonicalHref(value: string): string {
  if (value.startsWith('https://') || value.startsWith('http://')) return value
  const path = value.startsWith('/') ? value : `/${value}`
  return `${SITE_URL}${toPublicPath(path)}`
}

function patchOpenGraph(
  current: Metadata['openGraph'],
  patch: { title?: string; description?: string; url?: string },
): Metadata['openGraph'] {
  if (current && typeof current === 'object' && !Array.isArray(current)) {
    return { ...current, ...patch }
  }
  return { type: 'website', ...patch }
}

function patchTwitter(
  current: Metadata['twitter'],
  patch: { title?: string; description?: string },
): Metadata['twitter'] {
  if (current && typeof current === 'object') return { ...current, ...patch }
  return { card: 'summary_large_image', ...patch }
}

function patchRobots(
  current: Metadata['robots'],
  noIndex: boolean,
  noFollow: boolean,
): Metadata['robots'] {
  if (typeof current === 'string') {
    const kept = current
      .split(',')
      .map((part) => part.trim())
      .filter((part) => part && !/^(no)?index$/i.test(part) && !/^(no)?follow$/i.test(part))
    return [noIndex ? 'noindex' : 'index', noFollow ? 'nofollow' : 'follow', ...kept].join(', ')
  }

  const base =
    current && typeof current === 'object' ? { ...current } : { index: true, follow: true }
  if (noIndex) base.index = false
  if (noFollow) base.follow = false
  if (base.googleBot && typeof base.googleBot === 'object') {
    base.googleBot = {
      ...base.googleBot,
      ...(noIndex ? { index: false as const } : {}),
      ...(noFollow ? { follow: false as const } : {}),
    }
  }
  return base
}

/**
 * Overlay only SEO fields an editor actually set. `meta.title` is the
 * absolute document title, so a layout template cannot append a brand
 * suffix, and the same string is used for og:title and twitter:title.
 * The document title and excerpt are not SEO fields. Empty fields keep
 * the hardcoded fallback, including robots when noIndex and noFollow
 * are unchecked.
 */
export function mergeCmsMetadata(fallback: Metadata, doc: RoutedDoc | null | undefined): Metadata {
  if (!doc) return fallback

  const title = publishedMetaText(doc.meta?.title)
  const description = publishedMetaText(doc.meta?.description)
  const canonical = publishedMetaText(doc.canonicalUrl)
  const noIndex = doc.noIndex === true
  const noFollow = doc.noFollow === true
  if (!title && !description && !canonical && !noIndex && !noFollow) return fallback

  let next: Metadata = { ...fallback }

  if (title) {
    next = {
      ...next,
      title: { absolute: title },
      openGraph: patchOpenGraph(next.openGraph, { title }),
      twitter: patchTwitter(next.twitter, { title }),
    }
  }
  if (description) {
    next = {
      ...next,
      description,
      openGraph: patchOpenGraph(next.openGraph, { description }),
      twitter: patchTwitter(next.twitter, { description }),
    }
  }
  if (canonical) {
    const href = canonicalHref(canonical)
    next = {
      ...next,
      alternates: { ...next.alternates, canonical: href },
      openGraph: patchOpenGraph(next.openGraph, { url: href }),
    }
  }
  if (noIndex || noFollow) {
    next = { ...next, robots: patchRobots(next.robots, noIndex, noFollow) }
  }

  return next
}
