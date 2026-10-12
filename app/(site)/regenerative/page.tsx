import type { Metadata } from "next";

import { CMSRoute } from "@/components/cms/cms-route";
import { RegenerativePage } from "@/components/regenerative-page";
import { cmsMetadata } from "@/lib/cms/metadata";
import { buildMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return cmsMetadata("/regenerative", buildMetadata("/regenerative/"));
}

export default function Page() {
  return (
    <CMSRoute path="/regenerative">
      <RegenerativePage />
    </CMSRoute>
  );
}
