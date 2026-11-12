import { queryPathsFor, toPublicPath } from "@/lib/cms/path";

/**
 * Read-only copy of published Payload posts from the public site.
 *
 * Used only when this process has no database configured, so local preview and
 * builds can render CMS-only posts (and their image overrides) without opening
 * a connection or writing to production.
 */
const PUBLIC_CMS_ORIGIN = "https://one-light-medical.vercel.app";

/** Skip the network fallback on Vercel so a database-less deploy cannot call itself. */
export function publicPostFallbackEnabled(): boolean {
  return !process.env.VERCEL;
}

export type PublicPostDoc = {
  id?: number | string;
  slug?: string | null;
  path?: string | null;
  title?: string | null;
  h1?: string | null;
  publishedAt?: string | null;
  body?: unknown;
  layout?: unknown[] | null;
  canonicalUrl?: string | null;
  noIndex?: boolean | null;
  noFollow?: boolean | null;
  excludeFromSitemap?: boolean | null;
  sourceUpdatedAt?: string | null;
  updatedAt?: string;
  meta?: {
    title?: string | null;
    description?: string | null;
    image?: { url?: string | null; alt?: string | null } | number | null;
  } | null;
};

let pending: Promise<PublicPostDoc[]> | null = null;

export function loadPublicPosts(): Promise<PublicPostDoc[]> {
  if (!pending) {
    pending = fetchPublicPosts().catch((error: unknown) => {
      pending = null;
      console.error("[cms] public post fallback failed", error);
      return [];
    });
  }
  return pending;
}

async function fetchPublicPosts(): Promise<PublicPostDoc[]> {
  const url = `${PUBLIC_CMS_ORIGIN}/api/posts?limit=100&depth=1&sort=-publishedAt`;
  const response = await fetch(url, {
    signal: AbortSignal.timeout(8000),
    next: { revalidate: 300 },
  });
  if (!response.ok) return [];
  const data = (await response.json()) as { docs?: PublicPostDoc[] };
  return Array.isArray(data.docs) ? data.docs : [];
}

export async function findPublicPost(path: string): Promise<PublicPostDoc | null> {
  const posts = await loadPublicPosts();
  const wanted = new Set(queryPathsFor(path));
  return (
    posts.find((post) => {
      const raw = post.path || (post.slug ? `/${post.slug}` : "");
      if (!raw) return false;
      return wanted.has(raw) || wanted.has(toPublicPath(raw));
    }) ?? null
  );
}
