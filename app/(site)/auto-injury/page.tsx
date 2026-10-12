import type { Metadata } from "next";

import { CMSRoute } from "@/components/cms/cms-route";
import { LegacyPage, legacyMetadata } from "@/components/legacy-page";
import { cmsMetadata } from "@/lib/cms/metadata";

const SLUG = "auto-injury";

export async function generateMetadata(): Promise<Metadata> {
  return cmsMetadata("/auto-injury", legacyMetadata(SLUG));
}

export default function Page() {
  return (
    <CMSRoute path="/auto-injury">
      <LegacyPage slug={SLUG} />
    </CMSRoute>
  );
}
