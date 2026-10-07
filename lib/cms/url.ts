import { SITE_URL } from '@/lib/site'

const LOCALHOST = /localhost|127\.0\.0\.1/i

function stripSlash(value: string): string {
  return value.replace(/\/$/, '')
}

/** Public https origin on Vercel; localhost is never copied into production. */
export function getServerURL(): string {
  const explicit = process.env.NEXT_PUBLIC_SERVER_URL
  if (explicit && !LOCALHOST.test(explicit)) return stripSlash(explicit)

  const site = process.env.NEXT_PUBLIC_SITE_URL || SITE_URL
  if (site && !LOCALHOST.test(site)) return stripSlash(site)

  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`

  return stripSlash(explicit || site || 'http://localhost:3000')
}

export function getCorsOrigins(): string[] {
  const origins = new Set<string>()
  const add = (value?: string | null) => {
    if (!value) return
    origins.add(stripSlash(value.startsWith('http') ? value : `https://${value}`))
  }

  add('https://onelightmedical.com')
  add('https://www.onelightmedical.com')
  add(process.env.NEXT_PUBLIC_SITE_URL)
  add(process.env.NEXT_PUBLIC_SERVER_URL)
  if (process.env.VERCEL_URL) add(`https://${process.env.VERCEL_URL}`)
  add('http://localhost:3000')

  return [...origins]
}
