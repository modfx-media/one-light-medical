import type { Metadata } from "next";

import { CMSRoute } from "@/components/cms/cms-route";
import { legacyMetadata } from "@/components/legacy-page";
import { ServicePage } from "@/components/service-page";
import { SERVICES } from "@/content/services";
import { cmsMetadata } from "@/lib/cms/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return cmsMetadata("/softwave-trt-treatment", legacyMetadata("softwave-trt-treatment"));
}

export default function Page() {
  return (
    <CMSRoute path="/softwave-trt-treatment">
      <ServicePage service={SERVICES["softwave-trt-treatment"]} />
    </CMSRoute>
  );
}
