import type { Metadata } from "next";

import { BlogPost } from "@/components/blog-post";
import { CMSRoute } from "@/components/cms/cms-route";
import { legacyMetadata } from "@/components/legacy-page";
import { cmsMetadata } from "@/lib/cms/metadata";

const SLUG = "shockwave-therapy-in-amarillo-key-questions-to-ask";

export async function generateMetadata(): Promise<Metadata> {
  return cmsMetadata(`/${SLUG}`, legacyMetadata(SLUG));
}

export default function Page() {
  return (
    <CMSRoute path={`/${SLUG}`}>
      <BlogPost slug={SLUG} />
    </CMSRoute>
  );
}
