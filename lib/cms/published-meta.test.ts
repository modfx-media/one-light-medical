import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { createElement, Fragment } from 'react'

const { resolveTitle } = createRequire(import.meta.url)(
  'next/dist/lib/metadata/resolvers/resolve-title.js',
) as {
  resolveTitle: (title: unknown, template: string | null) => { absolute: string }
}

const TITLE_TEMPLATE = '%s | One Light Medical'

import { childrenAreDesigned, selectRoutedBody } from './designed-page'
import { mergeCmsMetadata, metadataTitleText } from './merge-metadata'
import type { RoutedDoc } from './query'

/**
 * The two Payload pages that are published on production. Values are the
 * SEO tab, not the document title. Regenerative's document title is the
 * old hardcoded title, so a merge that prefers `doc.title` fails this test.
 */
const PUBLISHED = {
  '/regenerative/': {
    path: '/regenerative',
    documentTitle: 'Regenerative Medicine in Amarillo, TX | One Light Medical',
    canonicalUrl: 'https://onelightmedical.com/regenerative/',
    meta: {
      title: 'Regenerative Therapy in Amarillo, TX | One Light Medical',
      description:
        'Find honest care for soft tissue issues with One Light Medical. Explore custom options like regenerative therapy in Amarillo, TX. Call to book today.',
    },
  },
  '/terms-and-conditions/': {
    path: '/terms-and-conditions',
    documentTitle: 'Terms & Conditions | One Light Medical',
    canonicalUrl: 'https://onelightmedical.com/terms-and-conditions/',
    meta: {
      title: 'Terms & Conditions | One Light Medical Site Guidelines',
      description:
        'Understand our patient intake process and clinic liability limits. View the One Light Medical Terms & Conditions. Call us to learn more.',
    },
  },
} as const

type RouteEntry = {
  path: string
  title: string
  metaDescription: string
  canonical: string
  robots: string
}

const routes = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../../content/route-map.json'), 'utf8'),
) as RouteEntry[]

function hardcodedMetadata(path: string) {
  const entry = routes.find((route) => route.path === path)
  if (!entry) throw new Error(`missing route map entry for ${path}`)
  return {
    title: entry.title,
    description: entry.metaDescription,
    robots: entry.robots,
    alternates: { canonical: entry.canonical },
    openGraph: {
      title: entry.title,
      description: entry.metaDescription,
      url: entry.canonical,
      siteName: 'One Light Medical',
      locale: 'en_US',
      type: 'website' as const,
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: entry.title,
      description: entry.metaDescription,
    },
  }
}

function publishedDoc(path: keyof typeof PUBLISHED, extra: Partial<RoutedDoc> = {}): RoutedDoc {
  const page = PUBLISHED[path]
  return {
    id: path,
    title: page.documentTitle,
    path: page.path,
    canonicalUrl: page.canonicalUrl,
    noIndex: false,
    noFollow: false,
    meta: { ...page.meta },
    ...extra,
  }
}

function ogField(meta: ReturnType<typeof mergeCmsMetadata>, field: 'title' | 'description' | 'url') {
  const og = meta.openGraph
  if (!og || Array.isArray(og)) return undefined
  return og[field]
}

function twitterTitle(meta: ReturnType<typeof mergeCmsMetadata>) {
  const twitter = meta.twitter
  if (!twitter || typeof twitter !== 'object') return undefined
  return twitter.title
}

test('published regenerative and terms pages show CMS title, description, and canonical', () => {
  for (const path of ['/regenerative/', '/terms-and-conditions/'] as const) {
    const page = PUBLISHED[path]
    const fallback = hardcodedMetadata(path)
    const merged = mergeCmsMetadata(fallback, publishedDoc(path))

    assert.deepEqual(merged.title, { absolute: page.meta.title }, path)
    assert.equal(resolveTitle(merged.title, TITLE_TEMPLATE).absolute, page.meta.title, path)
    assert.equal(
      resolveTitle(fallback.title, TITLE_TEMPLATE).absolute,
      `${fallback.title} | One Light Medical`,
      path,
    )
    assert.equal(metadataTitleText(merged.title), page.meta.title, path)
    assert.notEqual(metadataTitleText(merged.title), page.documentTitle, path)
    assert.equal(merged.description, page.meta.description, path)
    assert.equal(merged.alternates?.canonical, page.canonicalUrl, path)
    assert.equal(ogField(merged, 'title'), page.meta.title, path)
    assert.equal(ogField(merged, 'description'), page.meta.description, path)
    assert.equal(ogField(merged, 'url'), page.canonicalUrl, path)
    assert.equal(twitterTitle(merged), page.meta.title, path)
    assert.equal(
      merged.twitter && typeof merged.twitter === 'object' ? merged.twitter.description : undefined,
      page.meta.description,
      path,
    )
    assert.equal(merged.robots, fallback.robots, path)
    assert.equal(merged.openGraph && !Array.isArray(merged.openGraph) ? merged.openGraph.siteName : undefined, 'One Light Medical')
  }
})

test('a long CMS title is copied verbatim and an empty SEO tab keeps the hardcoded head', () => {
  const fallback = hardcodedMetadata('/regenerative/')
  const longTitle = `${'Regenerative therapy '.repeat(12)}in Amarillo`
  assert.ok(longTitle.length > 160)
  const merged = mergeCmsMetadata(fallback, {
    id: 'regenerative',
    title: 'Document title that must not become the title tag',
    canonicalUrl: 'https://onelightmedical.com/regenerative/',
    meta: { title: longTitle, description: PUBLISHED['/regenerative/'].meta.description },
  })
  assert.deepEqual(merged.title, { absolute: longTitle })
  assert.equal(ogField(merged, 'title'), longTitle)
  assert.equal(longTitle.endsWith('in Amarillo'), true)

  const empty = mergeCmsMetadata(fallback, {
    id: 'regenerative',
    title: 'Document title that must not become the title tag',
    path: '/regenerative',
    canonicalUrl: '   ',
    noIndex: false,
    noFollow: false,
    meta: { title: '  ', description: '' },
  })
  assert.equal(empty, fallback)

  const canonicalOnly = mergeCmsMetadata(fallback, {
    id: 'regenerative',
    title: 'Document title that must not become the title tag',
    canonicalUrl: '/regenerative-care',
    meta: {},
  })
  assert.equal(canonicalOnly.title, fallback.title)
  assert.equal(canonicalOnly.description, fallback.description)
  assert.equal(canonicalOnly.alternates?.canonical, 'https://onelightmedical.com/regenerative-care/')
  assert.equal(ogField(canonicalOnly, 'url'), 'https://onelightmedical.com/regenerative-care/')
  assert.equal(ogField(canonicalOnly, 'title'), fallback.title)
})

test('designed pages stay designed when the published doc has blocks', () => {
  const regenerative = {
    collection: 'pages' as const,
    doc: publishedDoc('/regenerative/', {
      layout: [{ blockType: 'content' }],
      body: { root: { children: [{ text: 'Imported body that must not replace the page' }] } },
    }),
  }
  const terms = {
    collection: 'pages' as const,
    doc: publishedDoc('/terms-and-conditions/', {
      layout: [{ blockType: 'hero', heading: 'Terms' }],
    }),
  }

  assert.equal(selectRoutedBody({ hasDesignedPage: true, routed: regenerative }), 'designed')
  assert.equal(selectRoutedBody({ hasDesignedPage: true, routed: terms }), 'designed')
  assert.equal(selectRoutedBody({ hasDesignedPage: true, routed: null }), 'designed')
  assert.equal(selectRoutedBody({ hasDesignedPage: false, routed: regenerative }), 'generic')

  const post = {
    collection: 'posts' as const,
    doc: publishedDoc('/regenerative/', { body: { root: { children: [] } }, layout: [] }),
  }
  assert.equal(selectRoutedBody({ hasDesignedPage: true, routed: post }), 'generic')
  assert.equal(
    selectRoutedBody({
      hasDesignedPage: true,
      routed: { collection: 'posts', doc: { id: 'empty', layout: [], body: null } },
    }),
    'designed',
  )
})

test('designed-page detection ignores null and empty fragments', () => {
  assert.equal(childrenAreDesigned(null), false)
  assert.equal(childrenAreDesigned(createElement(Fragment, null, null)), false)
  assert.equal(childrenAreDesigned(createElement('article', null, 'Regenerative Medicine')), true)
})

test('the two published routes read CMS meta and keep their designed page', () => {
  const root = join(dirname(fileURLToPath(import.meta.url)), '../../app/(site)')
  for (const slug of ['regenerative', 'terms-and-conditions']) {
    const source = readFileSync(join(root, slug, 'page.tsx'), 'utf8')
    assert.match(source, new RegExp(`cmsMetadata\\("/${slug}"`))
    assert.match(source, new RegExp(`buildMetadata\\("/${slug}/"\\)`))
    assert.match(source, new RegExp(`<CMSRoute path="/${slug}">`))
    assert.doesNotMatch(source, /<CMSRoute[^>]*>\s*\{null\}\s*<\/CMSRoute>/)
  }
})
