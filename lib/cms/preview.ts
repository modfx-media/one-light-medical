import { cmsPathFromSlug, normalizeCmsPath, toPublicPath } from '@/lib/cms/path'

/**
 * Live preview / admin preview URL. Returns null when the path is missing
 * or would produce `/null` segments.
 */
export function previewFromPath(path?: unknown, slug?: unknown): string | null {
  const secret = process.env.PREVIEW_SECRET
  if (!secret) return null

  const fromPath =
    typeof path === 'string' && path.trim() && !path.includes('null') && !path.includes('undefined')
      ? normalizeCmsPath(path)
      : null

  const fromSlug =
    typeof slug === 'string' && slug.trim() && slug !== 'null' && slug !== 'undefined'
      ? cmsPathFromSlug(slug)
      : null

  const resolved = fromPath ?? fromSlug
  if (!resolved) return null
  if (resolved.includes('null') || resolved.includes('undefined')) return null

  const parts = resolved.split('/').filter(Boolean)
  if (parts.some((part) => part === 'null' || part === 'undefined')) return null

  const publicPath = toPublicPath(resolved)
  return `/next/preview?path=${encodeURIComponent(publicPath)}&previewSecret=${encodeURIComponent(secret)}`
}
