import { toPublicPath } from '@/lib/cms/path'

/**
 * Live preview / admin preview URL. Returns null when the path is missing
 * or would produce `/null` segments.
 */
export function previewFromPath(path: unknown): string | null {
  const secret = process.env.PREVIEW_SECRET
  if (!secret) return null
  if (typeof path !== 'string') return null
  if (path.includes('null') || path.includes('undefined')) return null

  const trimmed = path.trim()
  if (!trimmed.startsWith('/')) return null
  if (trimmed !== '/' && /\/{2,}/.test(trimmed)) return null

  const parts = trimmed.split('/').filter(Boolean)
  if (parts.some((part) => part === 'null' || part === 'undefined')) return null

  const publicPath = toPublicPath(trimmed)
  return `/next/preview?path=${encodeURIComponent(publicPath)}&previewSecret=${encodeURIComponent(secret)}`
}
