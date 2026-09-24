import type { Metadata } from "next";

import { BlogPost } from "@/components/blog-post";
import { legacyMetadata } from "@/components/legacy-page";

const SLUG = "shockwave-therapy-in-amarillo-key-questions-to-ask";

export function generateMetadata(): Metadata {
  return legacyMetadata(SLUG);
}

export default function Page() {
  return <BlogPost slug={SLUG} />;
}
