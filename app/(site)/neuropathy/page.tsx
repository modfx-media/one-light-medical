import type { Metadata } from "next";

import { CMSRoute } from "@/components/cms/cms-route";
import { legacyMetadata } from "@/components/legacy-page";
import { ServicePage } from "@/components/service-page";
import { SERVICES } from "@/content/services";
import { cmsMetadata } from "@/lib/cms/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return cmsMetadata("/neuropathy", legacyMetadata("neuropathy"));
}

export default function Page() {
  return (
    <CMSRoute path="/neuropathy">
      <ServicePage service={SERVICES.neuropathy} />
    </CMSRoute>
  );
}
