/** CMS stores paths without a trailing slash. Home is `/`. */

export function normalizeCmsPath(input: string): string {
  const trimmed = input.trim()
  if (!trimmed || trimmed === '/') return '/'
  return `/${trimmed.replace(/^\/+|\/+$/g, '')}`
}

export function toPublicPath(cmsPath: string): string {
  const normalized = normalizeCmsPath(cmsPath)
  return normalized === '/' ? '/' : `${normalized}/`
}

export function cmsPathFromSlug(slug: string): string {
  if (!slug || slug === 'home') return '/'
  return `/${slug.replace(/^\/+|\/+$/g, '')}`
}

export function queryPathsFor(input: string): string[] {
  const cms = normalizeCmsPath(input)
  return [...new Set([cms, toPublicPath(cms)])]
}
