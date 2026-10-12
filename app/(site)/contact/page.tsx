import type { Metadata } from "next";

import { CMSRoute } from "@/components/cms/cms-route";
import { ContactPage } from "@/components/contact-page";
import { legacyMetadata } from "@/components/legacy-page";
import { cmsMetadata } from "@/lib/cms/metadata";

const SLUG = "contact";

export async function generateMetadata(): Promise<Metadata> {
  return cmsMetadata("/contact", legacyMetadata(SLUG));
}

export default function Page() {
  return (
    <CMSRoute path="/contact">
      <ContactPage />
    </CMSRoute>
  );
}
