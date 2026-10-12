import type { Metadata } from "next";

import { CMSRoute } from "@/components/cms/cms-route";
import { PaperworkPage } from "@/components/paperwork-page";
import { legacyMetadata } from "@/components/legacy-page";
import { cmsMetadata } from "@/lib/cms/metadata";

const SLUG = "patient-paperwork";

export async function generateMetadata(): Promise<Metadata> {
  return cmsMetadata("/patient-paperwork", legacyMetadata(SLUG));
}

export default function Page() {
  return (
    <CMSRoute path="/patient-paperwork">
      <PaperworkPage />
    </CMSRoute>
  );
}
