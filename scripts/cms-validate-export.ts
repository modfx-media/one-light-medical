import { readFileSync } from 'node:fs'
import path from 'node:path'

import { cmsPathFromSlug, toPublicPath } from '../lib/cms/path'
import { getRouteMap, slugForPath } from '../lib/route-map'
import { SITE_URL } from '../lib/site'

type ExportFile = {
  version: number
  records: Array<{
    collection: string
    sourceUrl?: string
    data?: { path?: string }
  }>
}

function main() {
  const file = path.join(process.cwd(), 'data', 'content-export.json')
  const exported = JSON.parse(readFileSync(file, 'utf8')) as ExportFile

  if (exported.version !== 1) {
    throw new Error(`Unexpected export version ${exported.version}`)
  }

  const covered = new Set<string>()
  for (const record of exported.records) {
    if (record.collection !== 'pages' && record.collection !== 'posts') continue
    if (record.sourceUrl) {
      covered.add(record.sourceUrl)
      continue
    }
    if (record.data?.path) {
      covered.add(`${SITE_URL}${toPublicPath(record.data.path)}`)
    }
  }

  const missing: string[] = []
  for (const entry of getRouteMap()) {
    const url = `${SITE_URL}${entry.path}`
    const alt = `${SITE_URL}${toPublicPath(cmsPathFromSlug(slugForPath(entry.path)))}`
    if (!covered.has(url) && !covered.has(alt)) missing.push(entry.path)
  }

  if (missing.length > 0) {
    console.error(`Export is missing ${missing.length} sitemap paths:`)
    for (const item of missing) console.error(`  ${item}`)
    process.exit(1)
  }

  console.log(`Export covers all ${getRouteMap().length} sitemap paths`)
}

main()
