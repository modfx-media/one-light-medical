"use client";

import Image from "next/image";
import { useState } from "react";

import { CLINIC_FALLBACK } from "@/lib/blog-covers";

/**
 * Featured image for a blog card or article. Fills its positioned parent.
 * A missing src, or a URL that fails to load, swaps to the clinic fallback
 * so the frame is never an empty white box.
 */
export function BlogImage({
  src,
  alt,
  sizes,
  preload = false,
}: {
  src?: string | null;
  alt: string;
  sizes: string;
  preload?: boolean;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const missing = !src;
  const failed = Boolean(src) && failedSrc === src;
  const current = missing || failed ? CLINIC_FALLBACK.src : src;
  const label = missing || failed ? CLINIC_FALLBACK.alt : alt || CLINIC_FALLBACK.alt;

  return (
    <Image
      src={current}
      alt={label}
      fill
      sizes={sizes}
      preload={preload}
      className="blog-fill"
      onError={() => {
        if (src) setFailedSrc(src);
      }}
    />
  );
}
