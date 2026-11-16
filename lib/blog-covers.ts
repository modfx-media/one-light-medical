import { SITE_URL } from "@/lib/site";

/**
 * Featured images for blog cards, article covers, and social metadata.
 *
 * Most posts store an og:image in content/route-map.json (harvested files under
 * public/). Posts created in Payload store the editor's media URL on
 * meta.image. That URL is shown as saved. A HEAD request to `/api/media/file/`
 * can 404 even when GET returns the image, so a missing HEAD response is not
 * a reason to swap the file.
 *
 * A small denylist still replaces files that are missing or show the wrong
 * subject. Callers keep an onError fallback to the clinic photo when a URL
 * fails in the browser.
 *
 * - getty-images-SpaC7NkDIxk-unsplash.jpg is a very light photo of a person
 *   holding their head, so the knee card reads as a blank white panel and the
 *   subject is not knee pain or shockwave therapy.
 * - knee-osteoarthritis-shockwave.jpg is not served by the media route.
 * - /common-neuropathy-causes-and-symptoms-to-recognize-early/ reused the same
 *   file as /understanding-neuropathy-causes-and-symptoms-explained/.
 *
 * Replacement photos are Pexels (free to use, including commercially):
 * - Knee / shockwave cover: Juan Manuel Montejano Lopez,
 *   https://www.pexels.com/photo/leg-of-patient-during-medical-examination-13185367/
 * - Neuropathy cover: Juan Manuel Montejano Lopez,
 *   https://www.pexels.com/photo/leg-of-patient-on-bed-13185359/
 * - Empty-image fallback: Yan Krukau,
 *   https://www.pexels.com/photo/woman-in-white-dress-up-shirt-touching-the-back-of-knees-of-woman-in-white-t-shirt-5793651/
 */

export type ResolvedCover = {
  src: string;
  alt: string;
};

export const CLINIC_FALLBACK: ResolvedCover = {
  src: "/images/blog/clinic-fallback.jpg",
  alt: "Clinician working with a patient in a bright medical clinic",
};

const KNEE_COVER: ResolvedCover = {
  src: "/images/blog/shockwave-knee-osteoarthritis.jpg",
  alt: "Clinician applying a therapy device to a patient's knee in a medical clinic",
};

const NEUROPATHY_COVER: ResolvedCover = {
  src: "/images/blog/neuropathy-causes-clinic.jpg",
  alt: "Clinician examining a patient's foot for neuropathy symptoms",
};

const COVER_BY_PATH: Record<string, ResolvedCover> = {
  "/shockwave-therapy-knee-osteoarthritis/": KNEE_COVER,
  "/common-neuropathy-causes-and-symptoms-to-recognize-early/": NEUROPATHY_COVER,
};

/** CMS filenames that are missing or show the wrong subject. */
const REPLACEMENT_BY_FILENAME: Record<string, ResolvedCover> = {
  "getty-images-SpaC7NkDIxk-unsplash.jpg": KNEE_COVER,
  "knee-osteoarthritis-shockwave.jpg": KNEE_COVER,
};

export function normalizeBlogPath(path: string): string {
  const stripped = path.trim().replace(/^\/+|\/+$/g, "");
  return stripped ? `/${stripped}/` : "/";
}

/**
 * Payload stores media file URLs with a trailing slash. The slash is not part
 * of the filename. Static harvest images are self-hosted, so those become
 * local public paths. CMS file URLs stay absolute so next/image can fetch
 * them through remotePatterns.
 */
export function normalizeBlogImageSrc(raw: string): string {
  let src = raw.trim();
  src = src.replace(/(\/api\/media\/file\/[^/?#]+?\.[a-z0-9]+)\/+$/i, "$1");
  if (src.startsWith(SITE_URL)) {
    const local = src.slice(SITE_URL.length);
    if (local.startsWith("/api/media/file/")) return src;
    if (local.startsWith("/")) return local;
  }
  return src;
}

function replacementForSrc(raw: string): ResolvedCover | null {
  for (const [filename, cover] of Object.entries(REPLACEMENT_BY_FILENAME)) {
    if (raw.includes(filename)) return cover;
  }
  return null;
}

/**
 * The featured image for a post. Path overrides win so a CMS record with an
 * empty or wrong meta image still renders the right cover. A known-bad file
 * is swapped for its local cover. Every other editor URL is returned as
 * stored. Returns null when the post has no image and no override; callers
 * that paint a card use blogCoverOrFallback so the frame is never empty.
 */
export function resolveBlogCover(
  path: string,
  rawSrc?: string | null,
  rawAlt?: string | null,
): ResolvedCover | null {
  const override = COVER_BY_PATH[normalizeBlogPath(path)];
  if (override) return override;
  if (rawSrc) {
    const replaced = replacementForSrc(rawSrc);
    if (replaced) return replaced;
    const alt = rawAlt?.trim() || "Article image";
    return { src: normalizeBlogImageSrc(rawSrc), alt };
  }
  return null;
}

export function blogCoverOrFallback(
  path: string,
  rawSrc?: string | null,
  rawAlt?: string | null,
): ResolvedCover {
  return resolveBlogCover(path, rawSrc, rawAlt) ?? CLINIC_FALLBACK;
}

/** Swap a known-bad media URL for its local replacement. Other URLs are unchanged. */
export function replacementForMediaUrl(raw: string | null | undefined): ResolvedCover | null {
  if (!raw) return null;
  return replacementForSrc(raw);
}

/** Editor URL, or the local stand-in when the file is on the denylist. */
export function displayBlogImageSrc(raw: string | null | undefined): string | null {
  if (!raw) return null;
  return replacementForMediaUrl(raw)?.src ?? normalizeBlogImageSrc(raw);
}
