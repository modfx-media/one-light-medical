import { config as loadEnv } from 'dotenv'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { getPayload } from 'payload'

import config from '../payload.config'

loadEnv({ path: '.env' })
loadEnv({ path: '.env.local', override: true })

type ExportRecord = {
  collection: 'pages' | 'posts' | 'faqs'
  legacyId?: string
  sourceUrl?: string
  data: Record<string, unknown>
}

type ExportFile = {
  version: number
  records: ExportRecord[]
  globals?: Record<string, Record<string, unknown>>
}

function skipRef(value: unknown): unknown {
  if (value && typeof value === 'object' && '$ref' in value) return undefined
  return value
}

async function findExisting(
  payload: Awaited<ReturnType<typeof getPayload>>,
  collection: ExportRecord['collection'],
  record: ExportRecord,
) {
  if (record.legacyId) {
    const byLegacy = await payload.find({
      collection,
      draft: true,
      limit: 1,
      overrideAccess: true,
      pagination: false,
      where: { legacyId: { equals: record.legacyId } },
    })
    if (byLegacy.docs[0]) return byLegacy.docs[0]
  }

  if (record.sourceUrl) {
    const bySource = await payload.find({
      collection,
      draft: true,
      limit: 1,
      overrideAccess: true,
      pagination: false,
      where: { sourceUrl: { equals: record.sourceUrl } },
    })
    if (bySource.docs[0]) return bySource.docs[0]
  }

  return null
}

async function main() {
  const apply = process.argv.includes('--apply') || process.env.CMS_IMPORT_APPLY === '1'
  const file = path.join(process.cwd(), 'data', 'content-export.json')
  const exported = JSON.parse(readFileSync(file, 'utf8')) as ExportFile

  if (exported.version !== 1) {
    throw new Error(`Unexpected export version ${exported.version}`)
  }

  const order = ['faqs', 'pages', 'posts'] as const
  const grouped = new Map<string, ExportRecord[]>()
  for (const record of exported.records) {
    const list = grouped.get(record.collection) ?? []
    list.push(record)
    grouped.set(record.collection, list)
  }

  if (!apply) {
    console.log(
      `Dry run: ${exported.records.length} records. Re-run with --apply (CMS_IMPORT_APPLY=1).`,
    )
    return
  }

  process.env.CMS_IMPORT_APPLY = '1'
  const payload = await getPayload({ config })

  for (const collection of order) {
    for (const record of grouped.get(collection) ?? []) {
      const data: Record<string, unknown> = {
        ...record.data,
        legacyId: record.legacyId || null,
        sourceUrl: record.sourceUrl || record.data.sourceUrl,
        _status: 'draft',
      }

      for (const [key, value] of Object.entries(data)) {
        if (skipRef(value) === undefined) delete data[key]
      }

      const existing = await findExisting(payload, collection, record)
      if (existing) {
        await payload.update({
          id: existing.id,
          collection,
          data: data as never,
          draft: true,
          overrideAccess: true,
        })
        console.log(`updated ${collection} ${record.legacyId ?? record.sourceUrl}`)
      } else {
        await payload.create({
          collection,
          data: data as never,
          draft: true,
          overrideAccess: true,
        })
        console.log(`created ${collection} ${record.legacyId ?? record.sourceUrl}`)
      }
    }
  }

  if (exported.globals) {
    for (const [slug, data] of Object.entries(exported.globals)) {
      await payload.updateGlobal({
        slug: slug as 'header' | 'footer' | 'site-settings',
        data: data as never,
        overrideAccess: true,
      })
      console.log(`updated global ${slug}`)
    }
  }

  console.log('Import complete (drafts only)')
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
