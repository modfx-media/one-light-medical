import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogPost } from "@/components/blog-post";
import { CMSRoute } from "@/components/cms/cms-route";
import { legacyMetadata } from "@/components/legacy-page";
import { cmsMetadata } from "@/lib/cms/metadata";
import { getPostEntries, slugForPath } from "@/lib/route-map";

/**
 * All blog posts, which the legacy site serves at the flat root rather than
 * under /blog/. The 13 static page routes sit alongside this segment and win
 * during resolution, so this route only ever handles post slugs.
 */
function postSlugs() {
  return getPostEntries().map((entry) => slugForPath(entry.path));
}

export function generateStaticParams() {
  return postSlugs().map((slug) => ({ slug }));
}

// CMS-only posts (created in Payload) are not in the static route map, so
// unknown slugs are resolved at request time and 404 only without a published doc.
export const dynamicParams = true;
export const revalidate = 300;

function MissingPost(): never {
  notFound();
}

export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  if (!postSlugs().includes(slug)) return cmsMetadata(`/${slug}`, {});
  return cmsMetadata(`/${slug}`, legacyMetadata(slug));
}

export default async function BlogPostPage({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  if (!postSlugs().includes(slug)) {
    return (
      <CMSRoute path={`/${slug}`}>
        <MissingPost />
      </CMSRoute>
    );
  }

  return (
    <CMSRoute path={`/${slug}`}>
      <BlogPost slug={slug} />
    </CMSRoute>
  );
}
