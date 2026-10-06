import type { Metadata } from "next";

import { CMSRoute } from "@/components/cms/cms-route";
import { LegacyPage, legacyMetadata } from "@/components/legacy-page";
import { cmsMetadata } from "@/lib/cms/metadata";

const SLUG = "human-cellular-tissue-products-a-guide-for-healthcare-providers";

export async function generateMetadata(): Promise<Metadata> {
  return cmsMetadata(
    "/human-cellular-tissue-products-a-guide-for-healthcare-providers",
    legacyMetadata(SLUG),
  );
}

export default function Page() {
  return (
    <CMSRoute path="/human-cellular-tissue-products-a-guide-for-healthcare-providers">
      <LegacyPage slug={SLUG} />
    </CMSRoute>
  );
}
