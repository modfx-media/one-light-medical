import type { MetadataRoute } from "next";

import { queryPublishedSitemapDocs } from "@/lib/cms/query";
import { toPublicPath } from "@/lib/cms/path";
import { getRouteMap } from "@/lib/route-map";
import { SITE_URL } from "@/lib/site";

/**
 * Generated from content/route-map.json, so adding a route to the harvest is
 * enough to list it here. Published CMS documents can skip themselves via
 * noIndex / excludeFromSitemap and can supply a fresher lastModified.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cmsDocs = await queryPublishedSitemapDocs();
  const byPublicPath = new Map<string, (typeof cmsDocs)[number]>();

  for (const item of cmsDocs) {
    if (!item.doc.path) continue;
    if (item.doc.noIndex || item.doc.excludeFromSitemap) continue;
    byPublicPath.set(toPublicPath(item.doc.path), item);
  }

  return getRouteMap()
    .filter((entry) => {
      const cms = byPublicPath.get(entry.path);
      if (!cms) return true;
      return !cms.doc.noIndex && !cms.doc.excludeFromSitemap;
    })
    .map((entry) => {
      const cms = byPublicPath.get(entry.path);
      const lastModified =
        cms?.doc.sourceUpdatedAt ||
        cms?.doc.updatedAt ||
        entry.modifiedTime ||
        entry.publishedTime;

      return {
        url: `${SITE_URL}${entry.path}`,
        ...(lastModified ? { lastModified: new Date(lastModified) } : {}),
      };
    });
}
