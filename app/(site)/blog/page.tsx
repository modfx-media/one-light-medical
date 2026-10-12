import type { Metadata } from "next";

import { BlogPage } from "@/components/blog-page";
import { CMSRoute } from "@/components/cms/cms-route";
import { legacyMetadata } from "@/components/legacy-page";
import { cmsMetadata } from "@/lib/cms/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return cmsMetadata("/blog", legacyMetadata("blog"));
}

export default function Page() {
  return (
    <CMSRoute path="/blog">
      <BlogPage />
    </CMSRoute>
  );
}
