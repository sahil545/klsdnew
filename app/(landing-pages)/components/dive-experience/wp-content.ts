import "server-only";

import { HOME_IMAGES } from "../../../../lib/generated/home-images";
import { WordPressPageContent, WordPressSection } from "./types";

const WORDPRESS_BASE =
  process.env.WP_ORIGIN || process.env.NEXT_PUBLIC_WORDPRESS_URL;
const WORDPRESS_USER =
  process.env.WP_USERNAME || process.env.NEXT_PUBLIC_WORDPRESS_USERNAME;
const WORDPRESS_PASSWORD =
  process.env.WP_APP_PASSWORD || process.env.NEXT_PUBLIC_WORDPRESS_PASSWORD;

if (!WORDPRESS_BASE) {
  throw new Error("Missing WordPress base URL configuration");
}

const WORDPRESS_BASE_URL = new URL(WORDPRESS_BASE);

const WORDPRESS_IMAGE_OVERRIDES: Record<string, string> = {
  "key-largo-scuba-diving.jpg": HOME_IMAGES.heroPrimary,
};

function extractFileName(value: string): string | null {
  try {
    const pathname = new URL(value).pathname;
    const name = pathname.split("/").pop();
    return name ? name.toLowerCase() : null;
  } catch {
    const segments = value.split("/");
    const name = segments[segments.length - 1];
    return name ? name.toLowerCase() : null;
  }
}

function applyImageOverride(url: string | null): string | null {
  if (!url) return null;
  const filename = extractFileName(url);
  if (filename && WORDPRESS_IMAGE_OVERRIDES[filename]) {
    return WORDPRESS_IMAGE_OVERRIDES[filename];
  }
  return url;
}

function decodeHtml(value: string) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&ldquo;/g, "\u201C")
    .replace(/&rdquo;/g, "\u201D")
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCharCode(Number.parseInt(code, 10)),
    )
    .replace(/&#x([\da-f]+);/gi, (_, code: string) =>
      String.fromCharCode(Number.parseInt(code, 16)),
    )
    .trim();
}

function stripTags(html: string) {
  return decodeHtml(html.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function dedupe<T>(values: T[]) {
  return Array.from(new Set(values));
}

function resolveWordPressAssetUrl(
  src: string | null | undefined,
): string | null {
  if (!src) return null;

  const trimmed = src.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return applyImageOverride(trimmed);
  if (trimmed.startsWith("//")) {
    return applyImageOverride(`${WORDPRESS_BASE_URL.protocol}${trimmed}`);
  }

  try {
    return applyImageOverride(new URL(trimmed, WORDPRESS_BASE_URL).toString());
  } catch {
    return applyImageOverride(trimmed);
  }
}

function normalizeWordPressSrcset(value: string): string {
  return value
    .split(",")
    .map((part) => {
      const trimmed = part.trim();
      if (!trimmed) return "";
      const [url, descriptor] = trimmed.split(/\s+/, 2);
      const resolved = resolveWordPressAssetUrl(url);
      if (!resolved) return "";
      return descriptor ? `${resolved} ${descriptor}` : resolved;
    })
    .filter(Boolean)
    .join(", ");
}

function normalizeWordPressHtml(html: string): string {
  if (!html) return html;

  let normalized = html;
  normalized = normalized.replace(
    /(<img[^>]+src=["'])([^"']+)(["'])/gi,
    (match, prefix: string, value: string, suffix: string) => {
      const resolved = resolveWordPressAssetUrl(value);
      return resolved ? `${prefix}${resolved}${suffix}` : match;
    },
  );
  normalized = normalized.replace(
    /(<img[^>]+data-src=["'])([^"']+)(["'])/gi,
    (match, prefix: string, value: string, suffix: string) => {
      const resolved = resolveWordPressAssetUrl(value);
      return resolved ? `${prefix}${resolved}${suffix}` : match;
    },
  );
  normalized = normalized.replace(
    /(<img[^>]+srcset=["'])([^"']+)(["'])/gi,
    (match, prefix: string, value: string, suffix: string) => {
      const resolved = normalizeWordPressSrcset(value);
      return resolved ? `${prefix}${resolved}${suffix}` : match;
    },
  );
  normalized = normalized.replace(
    /(<img[^>]+data-srcset=["'])([^"']+)(["'])/gi,
    (match, prefix: string, value: string, suffix: string) => {
      const resolved = normalizeWordPressSrcset(value);
      return resolved ? `${prefix}${resolved}${suffix}` : match;
    },
  );
  normalized = normalized.replace(
    /(<source[^>]+src=["'])([^"']+)(["'])/gi,
    (match, prefix: string, value: string, suffix: string) => {
      const resolved = resolveWordPressAssetUrl(value);
      return resolved ? `${prefix}${resolved}${suffix}` : match;
    },
  );
  normalized = normalized.replace(
    /(<source[^>]+srcset=["'])([^"']+)(["'])/gi,
    (match, prefix: string, value: string, suffix: string) => {
      const resolved = normalizeWordPressSrcset(value);
      return resolved ? `${prefix}${resolved}${suffix}` : match;
    },
  );

  return normalized;
}

function splitSections(contentHtml: string): {
  introHtml: string;
  sections: WordPressSection[];
} {
  const headingRegex = /<(h[23])[^>]*>([\s\S]*?)<\/\1>/gi;
  const sections: WordPressSection[] = [];
  let introHtml = "";
  let match: RegExpExecArray | null;
  let previousHeading: { title: string; bodyStart: number } | null = null;

  while ((match = headingRegex.exec(contentHtml))) {
    const headingStart = match.index;
    const headingEnd = headingRegex.lastIndex;
    const title = decodeHtml(match[2].replace(/<[^>]+>/g, ""));

    if (!previousHeading && headingStart > 0) {
      const before = contentHtml.slice(0, headingStart).trim();
      if (before) {
        introHtml = before;
      }
    }

    if (previousHeading) {
      const body = contentHtml
        .slice(previousHeading.bodyStart, headingStart)
        .trim();
      sections.push({ title: previousHeading.title, html: body });
    }

    previousHeading = { title, bodyStart: headingEnd };
  }

  if (previousHeading) {
    const tail = contentHtml.slice(previousHeading.bodyStart).trim();
    sections.push({ title: previousHeading.title, html: tail });
  } else {
    introHtml = contentHtml;
  }

  return { introHtml, sections };
}

export async function fetchWordPressPageContent(
  slug: string,
): Promise<WordPressPageContent> {
  const url = `${WORDPRESS_BASE.replace(/\/$/, "")}/wp-json/wp/v2/pages?slug=${encodeURIComponent(
    slug,
  )}&_embed=1`;

  const headers: HeadersInit = {
    Accept: "application/json",
    "User-Agent": "Builder-Fusion-Agent/1.0",
  };

  if (WORDPRESS_USER && WORDPRESS_PASSWORD) {
    const token = Buffer.from(
      `${WORDPRESS_USER}:${WORDPRESS_PASSWORD}`,
    ).toString("base64");
    headers["Authorization"] = `Basic ${token}`;
  }

  const response = await fetch(url, { headers, cache: "no-store" });
  if (!response.ok) {
    throw new Error(
      `Failed to fetch WordPress page for slug ${slug}: ${response.status}`,
    );
  }

  const payload = (await response.json()) as Array<any>;
  if (!Array.isArray(payload) || payload.length === 0) {
    throw new Error(`No WordPress page found for slug ${slug}`);
  }

  const page = payload[0];
  const rawHtml: string = page?.content?.rendered || "";
  const normalizedHtml = normalizeWordPressHtml(rawHtml);
  const { introHtml, sections } = splitSections(normalizedHtml);

  const bulletMatches = normalizedHtml.match(/<li[^>]*>[\s\S]*?<\/li>/gi) || [];
  const bulletPoints = dedupe(
    bulletMatches
      .map((item) => decodeHtml(item.replace(/<[^>]+>/g, " ")))
      .map((item) => item.replace(/\s+/g, " ").trim())
      .filter(Boolean),
  );

  const imageMatches =
    normalizedHtml.match(/<img[^>]+src=\"([^\"]+)\"/gi) || [];
  const galleriesRaw = dedupe(
    imageMatches
      .map((match) => {
        const srcMatch = /src=\"([^\"]+)\"/.exec(match);
        return srcMatch ? srcMatch[1] : null;
      })
      .filter((src): src is string => Boolean(src)),
  );
  const galleries = galleriesRaw
    .map((src) => resolveWordPressAssetUrl(src))
    .filter((src): src is string => Boolean(src));

  const featuredMediaSrc =
    page?._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
  const resolvedFeaturedImage = resolveWordPressAssetUrl(featuredMediaSrc);
  const featuredImage = resolvedFeaturedImage ?? galleries[0] ?? null;

  return {
    title: page?.title?.rendered || slug,
    slug,
    featuredImage,
    introHtml,
    introText: stripTags(introHtml),
    sections: sections.map((section) => ({
      title: section.title,
      html: section.html,
    })),
    galleries,
    bulletPoints,
    rawHtml: normalizedHtml,
  };
}
