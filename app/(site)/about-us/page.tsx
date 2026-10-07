import type { Metadata } from "next";

import { AboutPage } from "@/components/about-page";
import { CMSRoute } from "@/components/cms/cms-route";
import { legacyMetadata } from "@/components/legacy-page";
import { cmsMetadata } from "@/lib/cms/metadata";

const SLUG = "about-us";

export async function generateMetadata(): Promise<Metadata> {
  return cmsMetadata("/about-us", legacyMetadata(SLUG));
}

export default function Page() {
  return (
    <CMSRoute path="/about-us">
      <AboutPage />
    </CMSRoute>
  );
}
