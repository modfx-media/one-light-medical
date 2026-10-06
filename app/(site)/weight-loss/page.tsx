import type { Metadata } from "next";

import { CMSRoute } from "@/components/cms/cms-route";
import { legacyMetadata } from "@/components/legacy-page";
import { ServicePage } from "@/components/service-page";
import { SERVICES } from "@/content/services";
import { cmsMetadata } from "@/lib/cms/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return cmsMetadata("/weight-loss", legacyMetadata("weight-loss"));
}

export default function Page() {
  return (
    <CMSRoute path="/weight-loss">
      <ServicePage service={SERVICES["weight-loss"]} />
    </CMSRoute>
  );
}
