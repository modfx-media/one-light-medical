import { SITE_URL } from '@/lib/site'

export function getServerURL(): string {
  const site = (process.env.NEXT_PUBLIC_SITE_URL || SITE_URL).replace(/\/$/, '')
  const server = process.env.NEXT_PUBLIC_SERVER_URL?.replace(/\/$/, '')
  const onVercel = Boolean(process.env.VERCEL)

  if (onVercel) {
    if (!server || /localhost|127\.0\.0\.1/.test(server)) return site
    return server
  }

  return server || 'http://localhost:3000'
}

export function getCorsOrigins(): string[] {
  const origins = new Set<string>([
    'https://onelightmedical.com',
    'https://www.onelightmedical.com',
    getServerURL(),
  ])

  if (process.env.VERCEL_URL) {
    origins.add(`https://${process.env.VERCEL_URL}`)
  }

  const extra = process.env.NEXT_PUBLIC_SERVER_URL?.replace(/\/$/, '')
  if (extra) origins.add(extra)

  return [...origins].filter(Boolean)
}
