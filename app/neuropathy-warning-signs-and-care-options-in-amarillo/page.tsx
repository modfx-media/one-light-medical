import type { Metadata } from "next";

import { BlogPost } from "@/components/blog-post";
import { legacyMetadata } from "@/components/legacy-page";

const SLUG = "neuropathy-warning-signs-and-care-options-in-amarillo";

export function generateMetadata(): Metadata {
  return legacyMetadata(SLUG);
}

export default function Page() {
  return <BlogPost slug={SLUG} />;
}
