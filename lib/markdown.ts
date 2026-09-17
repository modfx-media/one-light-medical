import { readFileSync } from "node:fs";
import path from "node:path";

import { SITE_URL } from "@/lib/site";

export interface PageFrontmatter {
  path: string;
  type: "page" | "post";
  title: string;
  metaDescription: string;
  canonical: string;
  ogImage?: string;
  schemaTypes: string[];
  h1: string;
  publishedTime?: string;
  modifiedTime?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: string;
  images?: { src: string; alt: string; role: string; decorative: boolean }[];
  internalLinks?: string[];
}

export type MarkdownNode =
  | { kind: "heading"; level: number; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "quote"; text: string }
  | { kind: "list"; ordered: boolean; items: string[] }
  | { kind: "image"; src: string; alt: string };

export interface PageDocument {
  frontmatter: PageFrontmatter;
  nodes: MarkdownNode[];
}

const PAGES_DIR = path.join(process.cwd(), "content", "pages");
const cache = new Map<string, PageDocument>();

/**
 * Parse the frontmatter written by scripts/harvest.py.
 *
 * Every value is emitted through json.dumps, so each scalar and inline array is
 * valid JSON and needs no YAML library. Lists of objects appear as "  - {json}".
 */
function parseFrontmatter(raw: string): PageFrontmatter {
  const result: Record<string, unknown> = {};
  let currentListKey: string | null = null;

  for (const line of raw.split("\n")) {
    if (!line.trim()) continue;

    const listItem = line.match(/^ {2}- (.+)$/);
    if (listItem && currentListKey) {
      (result[currentListKey] as unknown[]).push(JSON.parse(listItem[1]));
      continue;
    }

    const emptyKey = line.match(/^([A-Za-z][\w]*):\s*$/);
    if (emptyKey) {
      currentListKey = emptyKey[1];
      result[currentListKey] = [];
      continue;
    }

    const pair = line.match(/^([A-Za-z][\w]*): (.+)$/);
    if (pair) {
      currentListKey = null;
      result[pair[1]] = JSON.parse(pair[2]);
    }
  }

  return result as unknown as PageFrontmatter;
}

/**
 * Parse the markdown subset emitted by the harvester: ATX headings, paragraphs,
 * bullet and numbered lists, blockquotes and standalone images.
 */
function parseBody(body: string): MarkdownNode[] {
  const nodes: MarkdownNode[] = [];
  const lines = body.split("\n");
  let index = 0;

  const isBullet = (line: string) => /^- /.test(line);
  const isNumbered = (line: string) => /^\d+\. /.test(line);
  const isBlockStart = (line: string) =>
    !line.trim() ||
    line.startsWith("#") ||
    line.startsWith("> ") ||
    isBullet(line) ||
    isNumbered(line) ||
    /^!\[.*\]\(.*\)$/.test(line);

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    const image = line.match(/^!\[(.*)\]\((.+)\)$/);
    if (image) {
      nodes.push({ kind: "image", alt: image[1], src: image[2] });
      index += 1;
      continue;
    }

    const heading = line.match(/^(#{1,6}) (.+)$/);
    if (heading) {
      nodes.push({ kind: "heading", level: heading[1].length, text: heading[2] });
      index += 1;
      continue;
    }

    if (line.startsWith("> ")) {
      const parts: string[] = [];
      while (index < lines.length && lines[index].startsWith("> ")) {
        parts.push(lines[index].slice(2));
        index += 1;
      }
      nodes.push({ kind: "quote", text: parts.join(" ") });
      continue;
    }

    if (isBullet(line) || isNumbered(line)) {
      const ordered = isNumbered(line);
      const items: string[] = [];
      while (index < lines.length && lines[index].trim()) {
        const current = lines[index];
        if (isBullet(current) || isNumbered(current)) {
          items.push(current.replace(/^(?:- |\d+\. )/, ""));
        } else if (items.length > 0) {
          // A legacy list item can carry a continuation line after a <br>.
          items[items.length - 1] += ` ${current.trim()}`;
        } else {
          break;
        }
        index += 1;
      }
      nodes.push({ kind: "list", ordered, items });
      continue;
    }

    const parts: string[] = [];
    while (index < lines.length && !isBlockStart(lines[index])) {
      parts.push(lines[index].trim());
      index += 1;
    }
    if (parts.length > 0) {
      nodes.push({ kind: "paragraph", text: parts.join(" ") });
    } else {
      index += 1;
    }
  }

  return nodes;
}

export function loadPage(slug: string): PageDocument | null {
  const cached = cache.get(slug);
  if (cached) return cached;

  let raw: string;
  try {
    raw = readFileSync(path.join(PAGES_DIR, `${slug}.md`), "utf8");
  } catch {
    return null;
  }

  raw = raw.replace(/\r\n/g, "\n");
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return null;

  const document: PageDocument = {
    frontmatter: parseFrontmatter(match[1]),
    nodes: parseBody(match[2]),
  };
  cache.set(slug, document);
  return document;
}

/**
 * Images are harvested as absolute legacy URLs but self-hosted in public/ at the
 * same path, so serve the local copy.
 */
export function toLocalAsset(src: string): string {
  return src.startsWith(SITE_URL) ? src.slice(SITE_URL.length) : src;
}
