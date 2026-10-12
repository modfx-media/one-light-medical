import type { Metadata } from "next";

import { CMSRoute } from "@/components/cms/cms-route";
import { ServicePage } from "@/components/service-page";
import { SERVICES } from "@/content/services";
import { cmsMetadata } from "@/lib/cms/metadata";
import { buildMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return cmsMetadata("/why-exosomes", buildMetadata("/why-exosomes/"));
}

export default function Page() {
  return (
    <CMSRoute path="/why-exosomes">
      <ServicePage service={SERVICES["why-exosomes"]} />
    </CMSRoute>
  );
}
