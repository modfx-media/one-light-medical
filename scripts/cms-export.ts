import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import faqs from '../content/faqs.json'
import { markdownNodesToLexical } from '../lib/cms/lexical'
import { cmsPathFromSlug, toPublicPath } from '../lib/cms/path'
import { loadPage } from '../lib/markdown'
import { getRouteMap, slugForPath } from '../lib/route-map'
import {
  BUSINESS,
  FOOTER_QUICK_LINKS,
  FOOTER_SERVICE_NAV,
  PRIMARY_NAV,
  SITE_URL,
} from '../lib/site'

type ExportRecord = {
  collection: 'pages' | 'posts' | 'faqs'
  legacyId: string
  sourceUrl: string
  data: Record<string, unknown>
}

function publicUrl(routePath: string) {
  return `${SITE_URL}${routePath}`
}

function main() {
  const records: ExportRecord[] = []

  for (const [index, item] of faqs.items.entries()) {
    records.push({
      collection: 'faqs',
      legacyId: `faq-${index + 1}`,
      sourceUrl: `${SITE_URL}/#faq-${index + 1}`,
      data: {
        question: item.q,
        answer: item.a,
        _status: 'draft',
      },
    })
  }

  for (const entry of getRouteMap()) {
    const slug = slugForPath(entry.path)
    const document = loadPage(slug)
    const cmsPath = cmsPathFromSlug(slug)
    const collection = entry.type === 'post' ? 'posts' : 'pages'

    records.push({
      collection,
      legacyId: slug,
      sourceUrl: publicUrl(entry.path),
      data: {
        title: entry.title,
        h1: entry.h1 || document?.frontmatter.h1 || entry.title,
        slug,
        path: cmsPath,
        sourceUrl: publicUrl(entry.path),
        sourceUpdatedAt: entry.modifiedTime || entry.publishedTime || null,
        publishedAt: entry.publishedTime || null,
        canonicalUrl: `${SITE_URL}${toPublicPath(cmsPath)}`,
        noIndex: /\bnoindex\b/i.test(entry.robots),
        noFollow: /\bnofollow\b/i.test(entry.robots),
        excludeFromSitemap: /\bnoindex\b/i.test(entry.robots),
        meta: {
          title: entry.title,
          description: entry.metaDescription,
        },
        body: document ? markdownNodesToLexical(document.nodes) : null,
        _status: 'draft',
      },
    })
  }

  const payload = {
    version: 1,
    records,
    globals: {
      header: {
        navItems: PRIMARY_NAV.map((item) => ({ label: item.label, href: item.href })),
      },
      footer: {
        quickLinks: FOOTER_QUICK_LINKS.map((item) => ({ label: item.label, href: item.href })),
        serviceLinks: FOOTER_SERVICE_NAV.map((item) => ({ label: item.label, href: item.href })),
      },
      'site-settings': {
        siteName: BUSINESS.name,
        phone: BUSINESS.phone,
        email: BUSINESS.email,
        address: `${BUSINESS.streetAddress}, ${BUSINESS.addressLocality}, ${BUSINESS.addressRegion} ${BUSINESS.postalCode}`,
      },
    },
  }

  const outDir = path.join(process.cwd(), 'data')
  mkdirSync(outDir, { recursive: true })
  const outFile = path.join(outDir, 'content-export.json')
  writeFileSync(outFile, `${JSON.stringify(payload, null, 2)}\n`)
  console.log(`Wrote ${records.length} records to ${outFile}`)
}

main()
