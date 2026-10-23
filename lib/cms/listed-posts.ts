import { getPayload } from "payload";
import config from "@payload-config";

import type { BlogCard } from "@/lib/blog-card";
import { blogTopic, formatBlogDate } from "@/lib/blog";
import { blogCoverOrFallback } from "@/lib/blog-covers";
import { loadPublicPosts, publicPostFallbackEnabled, type PublicPostDoc } from "@/lib/cms/public-posts";
import type { RouteMapEntry } from "@/lib/route-map";

const strip = (p: string) => p.replace(/^\/+|\/+$/g, "");

type CmsPostFields = PublicPostDoc;

function cardFromPost(doc: CmsPostFields): BlogCard | null {
  const slug = doc.slug || strip(doc.path ?? "");
  const h1 = doc.h1 || doc.title || "";
  if (!slug || !h1) return null;
  const path = `/${strip(doc.path || slug)}/`;
  const image = doc.meta?.image;
  const rawSrc = image && typeof image === "object" ? image.url ?? null : null;
  const rawAlt = image && typeof image === "object" ? image.alt ?? null : null;
  const cover = blogCoverOrFallback(path, rawSrc, rawAlt || h1);
  return {
    path,
    h1,
    excerpt: doc.meta?.description ?? "",
    publishedTime: doc.publishedAt ?? undefined,
    publishedLabel: formatBlogDate(doc.publishedAt ?? undefined),
    src: cover.src,
    alt: cover.alt,
    topic: blogTopic({ h1, path } as RouteMapEntry),
  };
}

/**
 * Published posts from Payload (future-dated ones stay hidden by the
 * scheduled-publish guard). Card image = the post's SEO meta image, after
 * cover overrides and the clinic fallback.
 *
 * With no database configured, the public read API is used instead so the
 * listing can be rendered without connecting to production.
 */
export async function getCmsBlogCards(): Promise<BlogCard[]> {
  try {
    if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL && publicPostFallbackEnabled()) {
      return (await loadPublicPosts()).map(cardFromPost).filter((card): card is BlogCard => Boolean(card));
    }
    const payload = await getPayload({ config });
    const res = await payload.find({
      collection: "posts",
      draft: false,
      overrideAccess: false,
      depth: 1,
      limit: 200,
      sort: "-publishedAt",
      where: { _status: { equals: "published" } },
    });
    return res.docs
      .map((doc) => cardFromPost(doc as unknown as CmsPostFields))
      .filter((card): card is BlogCard => Boolean(card));
  } catch {
    return [];
  }
}

/** Static cards plus CMS-only posts, newest first. */
export async function mergeCmsCards(staticCards: BlogCard[]): Promise<BlogCard[]> {
  const known = new Set(staticCards.map((c) => strip(c.path)));
  const extra = (await getCmsBlogCards()).filter((c) => !known.has(strip(c.path)));
  if (extra.length === 0) return staticCards;
  return [...extra, ...staticCards].sort((a, b) =>
    String(b.publishedTime ?? "").localeCompare(String(a.publishedTime ?? "")),
  );
}
