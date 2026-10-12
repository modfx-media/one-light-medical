import type { Metadata } from 'next'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
  },
  title: 'Page not found',
}

export default function NotFound() {
  return (
    <article className="wrap">
      <h1>Page not found</h1>
      <p>The page you requested is not available.</p>
    </article>
  )
}
