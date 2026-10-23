import { RichText, type JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { BlogPhoto } from '@/components/blog-photo'
import { resolveBlogImage, type BlogImage } from '@/lib/blog-image'
import type { RoutedDoc } from '@/lib/cms/query'

function mediaFields(value: unknown): { url: string | null; alt: string | null } {
  if (!value || typeof value !== 'object') return { url: null, alt: null }
  const record = value as { url?: unknown; alt?: unknown }
  return {
    url: typeof record.url === 'string' ? record.url : null,
    alt: typeof record.alt === 'string' ? record.alt : null,
  }
}

function hasUpload(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false
  if (Array.isArray(value)) return value.some(hasUpload)
  const record = value as Record<string, unknown>
  if (record.type === 'upload') return true
  return Object.values(record).some(hasUpload)
}

export function routedDocHasImage(doc: RoutedDoc): boolean {
  const layout = Array.isArray(doc.layout) ? doc.layout : []
  for (const block of layout) {
    if (!block || typeof block !== 'object') continue
    const item = block as Record<string, unknown>
    if (item.blockType === 'hero' && mediaFields(item.image).url) return true
    if (item.blockType === 'mediaBlock' && mediaFields(item.media).url) return true
  }
  return hasUpload(doc.body)
}

function uploadConverters(path?: string | null): JSXConvertersFunction {
  return ({ defaultConverters }) => ({
    ...defaultConverters,
    upload: ({ node }) => {
      const uploadNode = node as {
        value?: unknown
        fields?: { alt?: string | null }
      }
      if (!uploadNode.value || typeof uploadNode.value !== 'object') return null
      const upload = uploadNode.value as {
        url?: string | null
        alt?: string | null
        mimeType?: string | null
        filename?: string | null
        width?: number | null
        height?: number | null
      }
      const alt = uploadNode.fields?.alt || upload.alt || ''
      if (!upload.url) return null
      if (upload.mimeType && !upload.mimeType.startsWith('image')) {
        return (
          <a href={upload.url} rel="noopener noreferrer">
            {upload.filename || 'Download'}
          </a>
        )
      }
      const image = resolveBlogImage({ path, src: upload.url, alt })
      return (
        <BlogPhoto
          image={image}
          sizes="(max-width: 800px) 100vw, 48rem"
          className="cms-inline-photo"
        />
      )
    },
  })
}

function BlockLayout({ layout, path }: { layout: unknown[]; path?: string | null }) {
  return (
    <>
      {layout.map((block, index) => {
        if (!block || typeof block !== 'object' || !('blockType' in block)) return null
        const item = block as Record<string, unknown>
        const key = typeof item.id === 'string' ? item.id : `block-${index}`

        if (item.blockType === 'hero') {
          const media = mediaFields(item.image)
          const image = media.url ? resolveBlogImage({ path, src: media.url, alt: media.alt }) : null
          return (
            <section key={key} className="cms-hero wrap">
              {typeof item.heading === 'string' ? <h1>{item.heading}</h1> : null}
              {typeof item.subheading === 'string' ? <p>{item.subheading}</p> : null}
              {image ? (
                <BlogPhoto image={image} sizes="(max-width: 800px) 100vw, 48rem" />
              ) : null}
            </section>
          )
        }

        if (item.blockType === 'content' && item.body) {
          return (
            <div key={key} className="cms-richtext wrap">
              <RichText converters={uploadConverters(path)} data={item.body as never} />
            </div>
          )
        }

        if (item.blockType === 'mediaBlock') {
          const media = mediaFields(item.media)
          if (!media.url) return null
          const image = resolveBlogImage({
            path,
            src: media.url,
            alt: media.alt || (typeof item.caption === 'string' ? item.caption : null),
          })
          return (
            <figure key={key} className="wrap">
              <BlogPhoto image={image} sizes="(max-width: 800px) 100vw, 48rem" />
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
  cover,
}: {
  doc: RoutedDoc
  fallback: ReactNode
  cover?: BlogImage | null
}) {
  const layout = Array.isArray(doc.layout) ? doc.layout : []
  const hasBody = Boolean(doc.body)
  if (layout.length === 0 && !hasBody) return fallback

  const heading = doc.h1 || doc.title
  const showCover = Boolean(cover) && !routedDocHasImage(doc)

  return (
    <article className="cms-doc wrap">
      {heading ? <h1>{heading}</h1> : null}
      {showCover && cover ? (
        <figure className="blog-article-cover">
          <BlogPhoto image={cover} sizes="(max-width: 800px) 100vw, 48rem" />
        </figure>
      ) : null}
      {layout.length > 0 ? <BlockLayout layout={layout} path={doc.path} /> : null}
      {layout.length === 0 && doc.body ? (
        <div className="cms-richtext">
          <RichText converters={uploadConverters(doc.path)} data={doc.body as never} />
        </div>
      ) : null}
    </article>
  )
}
