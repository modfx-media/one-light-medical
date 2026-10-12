import type { Metadata } from "next";

import { CMSRoute } from "@/components/cms/cms-route";
import { LegacyPage, legacyMetadata } from "@/components/legacy-page";
import { cmsMetadata } from "@/lib/cms/metadata";

const SLUG = "chiropractic-care";

export async function generateMetadata(): Promise<Metadata> {
  return cmsMetadata("/chiropractic-care", legacyMetadata(SLUG));
}

export default function Page() {
  return (
    <CMSRoute path="/chiropractic-care">
      <LegacyPage slug={SLUG} />
    </CMSRoute>
  );
}
