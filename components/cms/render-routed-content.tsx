import { RichText } from '@payloadcms/richtext-lexical/react'
import Link from 'next/link'
import type { ReactNode } from 'react'

import type { RoutedDoc } from '@/lib/cms/query'

function mediaUrl(value: unknown): string | null {
  if (value && typeof value === 'object' && 'url' in value && typeof value.url === 'string') {
    return value.url
  }
  return null
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
}: {
  doc: RoutedDoc
  fallback: ReactNode
}) {
  if (!hasRenderableContent(doc)) return fallback

  const heading = doc.h1 || doc.title
  const layout = Array.isArray(doc.layout) ? doc.layout : []

  return (
    <article className="cms-doc wrap">
      {heading ? <h1>{heading}</h1> : null}
      {layout.length > 0 ? <BlockLayout layout={layout} /> : null}
      {layout.length === 0 && doc.body ? (
        <div className="cms-richtext">
          <RichText data={doc.body as never} />
        </div>
      ) : null}
    </article>
  )
}
