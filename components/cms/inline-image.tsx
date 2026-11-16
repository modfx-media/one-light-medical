"use client";

import { useState } from "react";

import { CLINIC_FALLBACK } from "@/lib/blog-covers";

/**
 * Inline CMS image. Shows the editor's file, and the clinic photo if that
 * file fails to load. Width and height match the Payload upload converter
 * so the frame does not change.
 */
export function CmsInlineImage({
  src,
  alt = "",
  width,
  height,
}: {
  src?: string | null;
  alt?: string;
  width?: number | null;
  height?: number | null;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const missing = !src;
  const failed = Boolean(src) && failedSrc === src;
  const current = missing || failed ? CLINIC_FALLBACK.src : src;
  const label = missing || failed ? CLINIC_FALLBACK.alt : alt;

  return (
    // Payload upload nodes render a plain img. next/image would add a wrapper.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={current}
      alt={label}
      width={typeof width === "number" ? width : undefined}
      height={typeof height === "number" ? height : undefined}
      onError={() => {
        if (src) setFailedSrc(src);
      }}
    />
  );
}
