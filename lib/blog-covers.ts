import { SITE_URL } from "@/lib/site";

/**
 * Featured images for blog cards, article covers, and social metadata.
 *
 * Most posts store an og:image in content/route-map.json (harvested files under
 * public/). Posts created in Payload store a media URL on meta.image instead.
 * These posts need a code-level image because we cannot edit the production
 * database:
 *
 * - /shockwave-therapy-knee-osteoarthritis/ points at
 *   getty-images-SpaC7NkDIxk-unsplash.jpg. That file is a very light photo of a
 *   person holding their head, so the card reads as a blank white panel and the
 *   subject is not knee pain or shockwave therapy.
 * - /common-neuropathy-causes-and-symptoms-to-recognize-early/ reused the same
 *   file as /understanding-neuropathy-causes-and-symptoms-explained/.
 * - /beyond-opioids-in-amarillo/ points at
 *   road-trip-with-raj-_cbKur5I60A-unsplash.jpg. That upload is a Payload
 *   `/api/media/file/` URL that 404s, so the card would otherwise be blank.
 *
 * Replacement photos are Pexels (free to use, including commercially):
 * - Knee / shockwave cover: Juan Manuel Montejano Lopez,
 *   https://www.pexels.com/photo/leg-of-patient-during-medical-examination-13185367/
 * - Neuropathy cover: Juan Manuel Montejano Lopez,
 *   https://www.pexels.com/photo/leg-of-patient-on-bed-13185359/
 * - Chronic-pain consult: https://www.pexels.com/photo/7579831/
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

const CONSULT_COVER: ResolvedCover = {
  src: "/images/blog/chronic-pain-clinic-consult.jpg",
  alt: "Clinician in a white coat consulting with a patient in a medical office",
};

const COVER_BY_PATH: Record<string, ResolvedCover> = {
  "/shockwave-therapy-knee-osteoarthritis/": KNEE_COVER,
  "/common-neuropathy-causes-and-symptoms-to-recognize-early/": NEUROPATHY_COVER,
  "/beyond-opioids-in-amarillo/": CONSULT_COVER,
};

/** CMS filenames that are missing or show the wrong subject. */
const REPLACEMENT_BY_FILENAME: Record<string, ResolvedCover> = {
  "getty-images-SpaC7NkDIxk-unsplash.jpg": KNEE_COVER,
  "knee-osteoarthritis-shockwave.jpg": KNEE_COVER,
  "road-trip-with-raj-_cbKur5I60A-unsplash.jpg": CONSULT_COVER,
};

export function normalizeBlogPath(path: string): string {
  const stripped = path.trim().replace(/^\/+|\/+$/g, "");
  return stripped ? `/${stripped}/` : "/";
}

/**
 * Payload stores media file URLs with a trailing slash. A HEAD request to that
 * URL is a 404, and the slash is not part of the filename. Static harvest
 * images are self-hosted, so those become local public paths. CMS file URLs
 * stay absolute so next/image can fetch them through remotePatterns.
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
 * Payload's local `/api/media/file/` URLs 404 in production unless blob storage
 * is configured. They are not files in this repo, so callers swap them for a
 * local cover instead of emitting a broken path.
 */
function isUnhostedPayloadMedia(raw: string): boolean {
  return /\/api\/media\/file\/[^/?#]+/i.test(raw);
}

/**
 * The featured image for a post. Path overrides win so a CMS record with an
 * empty or wrong meta image still renders the right cover. Returns null when
 * the post has no image and no override; callers that paint a card use
 * blogCoverOrFallback so the frame is never empty.
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
    if (isUnhostedPayloadMedia(rawSrc)) {
      return { ...CLINIC_FALLBACK, alt: rawAlt?.trim() || CLINIC_FALLBACK.alt };
    }
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

/** Swap a known-bad or unhosted media URL for a local file. Other URLs are unchanged. */
export function replacementForMediaUrl(raw: string | null | undefined): ResolvedCover | null {
  if (!raw) return null;
  const known = replacementForSrc(raw);
  if (known) return known;
  if (isUnhostedPayloadMedia(raw)) return CLINIC_FALLBACK;
  return null;
}
