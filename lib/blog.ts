import type { BlogCard } from "@/lib/blog-card";
import { resolveBlogImage, type BlogImage } from "@/lib/blog-image";
import { loadPage, toLocalAsset } from "@/lib/markdown";
import { getPostEntries, slugForPath, type RouteMapEntry } from "@/lib/route-map";

export type { BlogCard };

export function formatBlogDate(value?: string, style: "short" | "long" = "short") {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: style === "long" ? "long" : "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function blogImageFor(post: RouteMapEntry): BlogImage {
  const src = post.ogImage ? toLocalAsset(post.ogImage) : null;
  const listed = loadPage(slugForPath(post.path))?.frontmatter.images?.find(
    (image) => !image.decorative && image.alt && (!src || toLocalAsset(image.src) === src),
  );
  return resolveBlogImage({ path: post.path, src, alt: listed?.alt });
}

export function blogTopic(post: RouteMapEntry) {
  const haystack = `${post.h1} ${post.path}`.toLowerCase();
  if (haystack.includes("knee")) return "Knee pain";
  if (
    haystack.includes("sciatica") ||
    haystack.includes("disc") ||
    haystack.includes("spine") ||
    haystack.includes("spinal")
  ) {
    return "Spine";
  }
  if (haystack.includes("neuropath")) return "Nerves";
  if (haystack.includes("softwave") || haystack.includes("shockwave")) return "SoftWave";
  if (haystack.includes("red light")) return "Red light";
  if (
    haystack.includes("weight") ||
    haystack.includes("eating") ||
    haystack.includes("nutrition") ||
    haystack.includes("obesity")
  ) {
    return "Weight loss";
  }
  if (
    haystack.includes("exosome") ||
    haystack.includes("stem") ||
    haystack.includes("regenerative") ||
    haystack.includes("prp")
  ) {
    return "Regenerative";
  }
  return "Clinic notes";
}

export function toBlogCard(post: RouteMapEntry): BlogCard {
  return {
    path: post.path,
    h1: post.h1,
    excerpt: post.metaDescription,
    publishedTime: post.publishedTime,
    publishedLabel: formatBlogDate(post.publishedTime),
    ...blogImageFor(post),
    topic: blogTopic(post),
  };
}

export function getBlogCards() {
  return getPostEntries().map(toBlogCard);
}
