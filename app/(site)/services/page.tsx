import type { Metadata } from "next";

import { CMSRoute } from "@/components/cms/cms-route";
import { ServicesPage } from "@/components/services-page";
import { cmsMetadata } from "@/lib/cms/metadata";
import { buildMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return cmsMetadata("/services", buildMetadata("/services/"));
}

export default function Page() {
  return (
    <CMSRoute path="/services">
      <ServicesPage />
    </CMSRoute>
  );
}
