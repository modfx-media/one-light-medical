import { RichText } from '@payloadcms/richtext-lexical/react'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { BlogImage } from '@/components/blog-image'
import { blogCoverOrFallback, replacementForMediaUrl } from '@/lib/blog-covers'
import { toPublicPath } from '@/lib/cms/path'
import type { RoutedDoc } from '@/lib/cms/query'

function mediaUrl(value: unknown): string | null {
  if (value && typeof value === 'object' && 'url' in value && typeof value.url === 'string') {
    return value.url
  }
  return null
}

function mediaAlt(value: unknown): string | null {
  if (value && typeof value === 'object' && 'alt' in value && typeof value.alt === 'string') {
    return value.alt
  }
  return null
}

/** Point known-bad CMS files at the local replacement before rich text renders. */
function rewriteUploadUrls(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(rewriteUploadUrls)
  if (!value || typeof value !== 'object') return value
  const record = value as Record<string, unknown>
  const next: Record<string, unknown> = {}
  for (const [key, child] of Object.entries(record)) {
    next[key] = rewriteUploadUrls(child)
  }
  if (next.type === 'upload' && next.value && typeof next.value === 'object') {
    const upload = { ...(next.value as Record<string, unknown>) }
    const url = typeof upload.url === 'string' ? upload.url : null
    const replacement = replacementForMediaUrl(url)
    if (replacement) {
      upload.url = replacement.src
      upload.alt = replacement.alt
    }
    next.value = upload
  }
  return next
}

function stripLeadingCoverUpload(body: unknown, coverSrc: string): unknown {
  if (!body || typeof body !== 'object') return body
  const root = (body as { root?: { children?: unknown[] } }).root
  if (!root || !Array.isArray(root.children) || root.children.length === 0) return body
  const [first, ...rest] = root.children
  if (!first || typeof first !== 'object' || (first as { type?: string }).type !== 'upload') return body
  const upload = (first as { value?: unknown }).value
  const url = mediaUrl(upload)
  const replacement = url ? replacementForMediaUrl(url) : null
  const shown = replacement?.src ?? url
  if (shown !== coverSrc && replacement?.src !== coverSrc) return body
  return { ...(body as object), root: { ...root, children: rest } }
}

function hasRenderableContent(doc: RoutedDoc): boolean {
  const layout = Array.isArray(doc.layout) ? doc.layout : []
  if (layout.length > 0) return true
  if (doc.body) return true
  return false
}

function BlockLayout({ layout }: { layout: unknown[] }) {
  return (
    <>
      {layout.map((block, index) => {
        if (!block || typeof block !== 'object' || !('blockType' in block)) return null
        const item = block as Record<string, unknown>
        const key = typeof item.id === 'string' ? item.id : `block-${index}`

        if (item.blockType === 'hero') {
          const image = mediaUrl(item.image)
          return (
            <section key={key} className="cms-hero wrap">
              {typeof item.heading === 'string' ? <h1>{item.heading}</h1> : null}
              {typeof item.subheading === 'string' ? <p>{item.subheading}</p> : null}
              {/* CMS media URLs are absolute (Blob/local); next/image needs per-host allowlisting. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {image ? <img src={image} alt="" /> : null}
            </section>
          )
        }

        if (item.blockType === 'content' && item.body) {
          return (
            <div key={key} className="cms-richtext wrap">
              <RichText data={item.body as never} />
            </div>
          )
        }

        if (item.blockType === 'mediaBlock') {
          const image = mediaUrl(item.media)
          if (!image) return null
          return (
            <figure key={key} className="wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt={typeof item.caption === 'string' ? item.caption : ''} />
              {typeof item.caption === 'string' ? <figcaption>{item.caption}</figcaption> : null}
            </figure>
          )
        }

        if (item.blockType === 'cta') {
          const href = typeof item.href === 'string' ? item.href : '/contact/'
          return (
            <section key={key} className="wrap cms-cta">
              {typeof item.heading === 'string' ? <h2>{item.heading}</h2> : null}
              {typeof item.body === 'string' ? <p>{item.body}</p> : null}
              <Link href={href} className="btn btn-gradient">
                {typeof item.label === 'string' ? item.label : 'Book An Appointment'}
              </Link>
            </section>
          )
        }

        return null
      })}
    </>
  )
}

export function RenderRoutedContent({
  doc,
  fallback,
  cover = false,
}: {
  doc: RoutedDoc
  fallback: ReactNode
  /** Blog posts always paint a featured image, matching the listing card. */
  cover?: boolean
}) {
  if (!hasRenderableContent(doc)) return fallback

  const heading = doc.h1 || doc.title
  const layout = Array.isArray(doc.layout) ? doc.layout : []
  const path = toPublicPath(doc.path || '/')
  const metaImage = doc.meta?.image
  const featured = cover
    ? blogCoverOrFallback(path, mediaUrl(metaImage), mediaAlt(metaImage) || heading)
    : null
  const body = featured ? stripLeadingCoverUpload(rewriteUploadUrls(doc.body), featured.src) : doc.body

  return (
    <article className="cms-doc wrap">
      {heading ? <h1>{heading}</h1> : null}
      {featured ? (
        <figure className="blog-article-cover">
          <BlogImage
            src={featured.src}
            alt={featured.alt}
            sizes="(max-width: 800px) 100vw, 40rem"
            preload
          />
        </figure>
      ) : null}
      {layout.length > 0 ? <BlockLayout layout={layout} /> : null}
      {layout.length === 0 && body ? (
        <div className="cms-richtext">
          <RichText data={body as never} />
        </div>
      ) : null}
    </article>
  )
}
