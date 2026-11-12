import type { Metadata } from "next";

import { resolveBlogCover } from "@/lib/blog-covers";
import { loadPage } from "@/lib/markdown";
import { getEntryByPath, slugForPath, type RouteMapEntry } from "@/lib/route-map";
import { BUSINESS, SITE_URL } from "@/lib/site";

const OG_LOCALE = "en_US";

/**
 * Fall back to the page's first meaningful content image when the legacy page
 * never set an og:image. Images marked decorative are skipped.
 */
function fallbackImage(path: string): string | null {
  const document = loadPage(slugForPath(path));
  const image = document?.frontmatter.images?.find((candidate) => !candidate.decorative);
  return image?.src ?? null;
}

function socialImage(entry: RouteMapEntry): { url: string; alt?: string } | null {
  const resolved = resolveBlogCover(entry.path, entry.ogImage, entry.h1);
  if (resolved) return { url: resolved.src, alt: resolved.alt };
  const fromContent = fallbackImage(entry.path);
  return fromContent ? { url: fromContent } : null;
}

/**
 * The legacy site serves og:type "article" on ordinary service pages, not just
 * posts, so the harvested value is reused rather than inferred from the type.
 */
function openGraphType(entry: RouteMapEntry): "article" | "website" {
  const harvested = loadPage(slugForPath(entry.path))?.frontmatter.ogType;
  if (harvested === "article" || harvested === "website") return harvested;
  return entry.type === "post" ? "article" : "website";
}

/**
 * Build the head tags for a legacy route from content/route-map.json.
 *
 * Titles and descriptions are passed through exactly as harvested — they are
 * already indexed, so they are never rewritten or templated. The canonical is
 * rebuilt from the path to guarantee the trailing slash.
 */
export function buildMetadata(path: string): Metadata {
  const entry = getEntryByPath(path);
  if (!entry) return {};

  const canonical = `${SITE_URL}${entry.path}`;
  const image = socialImage(entry);
  const ogType = openGraphType(entry);

  return {
    title: entry.title,
    description: entry.metaDescription,
    robots: entry.robots,
    alternates: { canonical },
    openGraph: {
      title: entry.title,
      description: entry.metaDescription,
      url: canonical,
      siteName: BUSINESS.name,
      locale: OG_LOCALE,
      type: ogType,
      ...(image ? { images: [{ url: image.url, alt: image.alt }] } : {}),
      ...(ogType === "article" && entry.publishedTime
        ? {
            publishedTime: entry.publishedTime,
            modifiedTime: entry.modifiedTime ?? entry.publishedTime,
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: entry.title,
      description: entry.metaDescription,
      ...(image ? { images: [image.url] } : {}),
    },
  };
}
