import type { Metadata } from "next";

import { CMSRoute } from "@/components/cms/cms-route";
import { HomePage } from "@/components/home-page";
import { legacyMetadata } from "@/components/legacy-page";
import { cmsMetadata } from "@/lib/cms/metadata";

const SLUG = "home";

export async function generateMetadata(): Promise<Metadata> {
  return cmsMetadata("/", legacyMetadata(SLUG));
}

export default function Page() {
  return (
    <CMSRoute path="/">
      <HomePage />
    </CMSRoute>
  );
}
