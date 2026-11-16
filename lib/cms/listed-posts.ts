import { getPayload } from "payload";
import config from "@payload-config";

import type { BlogCard } from "@/lib/blog-card";
import { blogTopic, formatBlogDate } from "@/lib/blog";
import { blogCoverOrFallback } from "@/lib/blog-covers";
import { loadPublicPosts, publicPostFallbackEnabled, type PublicPostDoc } from "@/lib/cms/public-posts";
import type { RouteMapEntry } from "@/lib/route-map";

const strip = (p: string) => p.replace(/^\/+|\/+$/g, "");

type CmsPostFields = PublicPostDoc;

type CmsCard = BlogCard & { editorImage: boolean };

function cardFromPost(doc: CmsPostFields): CmsCard | null {
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
    editorImage: Boolean(rawSrc),
  };
}

function toPublicCard(card: CmsCard): BlogCard {
  return {
    path: card.path,
    h1: card.h1,
    excerpt: card.excerpt,
    publishedTime: card.publishedTime,
    publishedLabel: card.publishedLabel,
    src: card.src,
    alt: card.alt,
    topic: card.topic,
  };
}

/**
 * Published posts from Payload (future-dated ones stay hidden by the
 * scheduled-publish guard). Card image = the editor's SEO image. Known-bad
 * filenames still use their local cover. An empty image uses the clinic photo.
 *
 * With no database configured, the public read API is used instead so the
 * listing can be rendered without connecting to production.
 */
async function loadCmsCards(): Promise<CmsCard[]> {
  try {
    if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL && publicPostFallbackEnabled()) {
      return (await loadPublicPosts()).map(cardFromPost).filter((card): card is CmsCard => Boolean(card));
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
      .filter((card): card is CmsCard => Boolean(card));
  } catch {
    return [];
  }
}

export async function getCmsBlogCards(): Promise<BlogCard[]> {
  return (await loadCmsCards()).map(toPublicCard);
}

/** Static cards plus CMS-only posts, newest first. An editor image wins. */
export async function mergeCmsCards(staticCards: BlogCard[]): Promise<BlogCard[]> {
  const cmsCards = await loadCmsCards();
  const cmsByPath = new Map(cmsCards.map((card) => [strip(card.path), card]));
  const withEditorImages = staticCards.map((card) => {
    const fromCms = cmsByPath.get(strip(card.path));
    if (!fromCms?.editorImage) return card;
    return { ...card, src: fromCms.src, alt: fromCms.alt };
  });
  const known = new Set(staticCards.map((card) => strip(card.path)));
  const extra = cmsCards.filter((card) => !known.has(strip(card.path))).map(toPublicCard);
  const imagesChanged = withEditorImages.some(
    (card, index) => card.src !== staticCards[index]?.src || card.alt !== staticCards[index]?.alt,
  );
  if (extra.length === 0 && !imagesChanged) return staticCards;
  return [...extra, ...withEditorImages].sort((a, b) =>
    String(b.publishedTime ?? "").localeCompare(String(a.publishedTime ?? "")),
  );
}
