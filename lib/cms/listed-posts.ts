import { getPayload } from "payload";
import config from "@payload-config";

import type { BlogCard } from "@/lib/blog-card";
import { blogTopic, formatBlogDate } from "@/lib/blog";
import type { RouteMapEntry } from "@/lib/route-map";

const strip = (p: string) => p.replace(/^\/+|\/+$/g, "");

/**
 * Published posts from Payload (future-dated ones stay hidden by the
 * scheduled-publish guard). Card image = the post's SEO meta image.
 */
export async function getCmsBlogCards(): Promise<BlogCard[]> {
  try {
    if (!process.env.DATABASE_URL) return [];
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
      .map((doc) => {
        const d = doc as unknown as {
          slug?: string | null;
          path?: string | null;
          title?: string | null;
          h1?: string | null;
          publishedAt?: string | null;
          meta?: { description?: string | null; image?: { url?: string | null } | number | null } | null;
        };
        const slug = d.slug || strip(d.path ?? "");
        const h1 = d.h1 || d.title || "";
        if (!slug || !h1) return null;
        const path = `/${strip(d.path || slug)}/`;
        const image = d.meta?.image && typeof d.meta.image === "object" ? d.meta.image.url ?? null : null;
        const card: BlogCard = {
          path,
          h1,
          excerpt: d.meta?.description ?? "",
          publishedTime: d.publishedAt ?? undefined,
          publishedLabel: formatBlogDate(d.publishedAt ?? undefined),
          src: image,
          topic: blogTopic({ h1, path } as RouteMapEntry),
        } as BlogCard;
        return card;
      })
      .filter((c): c is BlogCard => Boolean(c));
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
