import { toLocalAsset } from "@/lib/markdown";

/**
 * Featured images for posts whose Payload media file is not actually hosted.
 *
 * Those uploads were stored with Payload's local `/api/media/file/` URL. Blob
 * storage is off unless BLOB_READ_WRITE_TOKEN is set, and the files are not in
 * this repo, so production returns 404 and the card renders as an empty frame.
 * The replacements below are the pictures the card, the article, and the OG tag
 * share. Sources (Pexels License, free to use):
 * - knee-osteoarthritis-shockwave.jpg — Pexels 13185367, Juan Manuel Montejano Lopez
 *   https://www.pexels.com/photo/13185367/
 * - chronic-pain-clinic-consult.jpg — Pexels 7579831
 *   https://www.pexels.com/photo/7579831/
 * - clinic-care-fallback.jpg — Pexels 4506109
 *   https://www.pexels.com/photo/4506109/
 */
export type BlogImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

const KNEE: BlogImage = {
  src: "/images/blog/knee-osteoarthritis-shockwave.jpg",
  alt: "Clinician applying a handheld therapy device to a patient's knee in a medical clinic",
  width: 1600,
  height: 1066,
};

const CONSULT: BlogImage = {
  src: "/images/blog/chronic-pain-clinic-consult.jpg",
  alt: "Clinician in a white coat consulting with a patient in a medical office",
  width: 1600,
  height: 1066,
};

const FALLBACK: BlogImage = {
  src: "/images/blog/clinic-care-fallback.jpg",
  alt: "Clinician examining a patient on an exam table in a medical office",
  width: 1600,
  height: 1066,
};

const NEUROPATHY: BlogImage = {
  src: "/wp-content/uploads/2024/10/Neuropathy-iStock-893912334.jpg",
  alt: "Close-up of a foot and ankle held during a clinical exam",
  width: 1920,
  height: 1080,
};

const KNOWN = [KNEE, CONSULT, FALLBACK, NEUROPATHY];

/** Broken Payload filenames -> the local photo that should replace them. */
const FILE_IMAGES: Record<string, BlogImage> = {
  "getty-images-SpaC7NkDIxk-unsplash.jpg": KNEE,
  "road-trip-with-raj-_cbKur5I60A-unsplash.jpg": CONSULT,
};

/** Used when a post has no working image at all. */
const DEDICATED: Record<string, BlogImage> = {
  "/shockwave-therapy-knee-osteoarthritis/": KNEE,
  "/beyond-opioids-in-amarillo/": CONSULT,
  "/common-neuropathy-causes-and-symptoms-to-recognize-early/": NEUROPATHY,
};

export function publicBlogPath(path?: string | null): string | null {
  if (!path) return null;
  const withoutOrigin = path.replace(/^https?:\/\/[^/]+/i, "");
  const stripped = withoutOrigin.replace(/^\/+|\/+$/g, "");
  if (!stripped) return "/";
  return `/${stripped}/`;
}

/** Payload local-disk media. These URLs 404 in production. */
export function payloadMediaFilename(src: string): string | null {
  const path = src.startsWith("http") ? safePathname(src) : src;
  if (!path) return null;
  const match = path.match(/\/api\/media\/file\/([^/?#]+)\/?$/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function isUnhostedPayloadMedia(src?: string | null): boolean {
  if (!src) return false;
  return payloadMediaFilename(src) !== null;
}

function safePathname(src: string): string | null {
  try {
    return new URL(src).pathname;
  } catch {
    return null;
  }
}

function knownBySrc(src: string): BlogImage | undefined {
  return KNOWN.find((image) => image.src === src);
}

/**
 * A card image is never null. A real hosted URL is kept. A missing field or an
 * unhosted `/api/media/file/` URL becomes the post's photo, or the clinic fallback.
 */
export function resolveBlogImage(input: {
  path?: string | null;
  src?: string | null;
  alt?: string | null;
}): BlogImage {
  const path = publicBlogPath(input.path);
  const src = input.src?.trim() || null;
  const dedicated = path ? DEDICATED[path] : undefined;

  if (src && !isUnhostedPayloadMedia(src)) {
    const local = toLocalAsset(src);
    const known = knownBySrc(local);
    return {
      src: local,
      alt: input.alt?.trim() || known?.alt || dedicated?.alt || "",
      width: known?.width ?? dedicated?.width ?? 1600,
      height: known?.height ?? dedicated?.height ?? 1000,
    };
  }

  const filename = src ? payloadMediaFilename(src) : null;
  if (filename && FILE_IMAGES[filename]) return FILE_IMAGES[filename];
  if (dedicated) return dedicated;
  return { ...FALLBACK, alt: input.alt?.trim() || FALLBACK.alt };
}
