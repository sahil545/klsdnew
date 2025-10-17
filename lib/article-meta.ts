export type ArticleMeta = {
  author?: string;
  publishedDate?: string; // ISO string
  updatedDate?: string; // ISO string
  coverImage?: string;
  description?: string;
  title?: string;
  canonical?: string;
};

function tryParseJson(input: string): any | null {
  try {
    return JSON.parse(input);
  } catch {
    return null;
  }
}

function firstString(val: any): string | undefined {
  if (!val) return undefined;
  if (typeof val === "string") return val;
  if (Array.isArray(val)) {
    for (const v of val) {
      const s = firstString(v);
      if (s) return s;
    }
  }
  if (typeof val === "object") {
    // Common image object: { url: "..." }
    if (typeof (val as any).url === "string") return (val as any).url;
  }
  return undefined;
}

function extractFromJsonLd(html: string): ArticleMeta {
  const meta: ArticleMeta = {};
  const scriptRegex =
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;
  while ((match = scriptRegex.exec(html))) {
    const raw = match[1].trim();
    const data = tryParseJson(raw);
    if (!data) continue;

    const candidates: any[] = [];
    if (Array.isArray(data)) candidates.push(...data);
    else candidates.push(data);

    for (const node of candidates) {
      const type = Array.isArray(node?.["@type"])
        ? node["@type"].join(",")
        : node?.["@type"];
      if (!type) continue;
      if (/Article|BlogPosting/i.test(String(type))) {
        if (!meta.publishedDate && typeof node.datePublished === "string")
          meta.publishedDate = node.datePublished;
        if (!meta.updatedDate && typeof node.dateModified === "string")
          meta.updatedDate = node.dateModified;
        if (!meta.author) {
          const author = node.author || node.creator || node.publisher;
          if (typeof author === "string") meta.author = author;
          else if (author && typeof author === "object") {
            if (Array.isArray(author)) {
              const first =
                author.find((a: any) => typeof a?.name === "string") ||
                author[0];
              if (first) meta.author = first?.name || firstString(first);
            } else {
              meta.author = author?.name || firstString(author);
            }
          }
        }
        if (!meta.coverImage)
          meta.coverImage =
            firstString(node.image) || firstString(node.thumbnailUrl);
      }
    }
  }
  return meta;
}

function extractFromMetaTags(html: string, meta: ArticleMeta): ArticleMeta {
  const getMeta = (
    property: string,
    attr: "property" | "name" = "property",
  ): string | undefined => {
    const re = new RegExp(
      `<meta[^>]*${attr}=["']${property}["'][^>]*content=["']([^"']+)["'][^>]*>`,
      "i",
    );
    const m = re.exec(html);
    return m?.[1];
  };
  const ogImage =
    getMeta("og:image") || getMeta("twitter:image") || getMeta("og:image:url");
  if (!meta.coverImage && ogImage) meta.coverImage = ogImage;
  const author =
    getMeta("author", "name") ||
    getMeta("article:author") ||
    getMeta("og:article:author");
  if (!meta.author && author) meta.author = author;
  const pub =
    getMeta("article:published_time") || getMeta("og:article:published_time");
  if (!meta.publishedDate && pub) meta.publishedDate = pub;
  const mod =
    getMeta("article:modified_time") || getMeta("og:article:modified_time");
  if (!meta.updatedDate && mod) meta.updatedDate = mod;
  const desc = getMeta("description", "name") || getMeta("og:description");
  if (!meta.description && desc) meta.description = desc;
  const ogTitle = getMeta("og:title");
  const twTitle = getMeta("twitter:title", "name");
  if (!meta.title && (ogTitle || twTitle)) meta.title = (ogTitle || twTitle)!;
  return meta;
}

export async function fetchArticleMeta(
  url: string,
  timeoutMs = 8000,
): Promise<ArticleMeta> {
  const controller = new AbortController();
  const to = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "user-agent": "MetaSyncBot/1.0 (+https://builder.io)" },
    });
    if (!res.ok) return {};
    const html = await res.text();
    let meta: ArticleMeta = extractFromJsonLd(html);
    meta = extractFromMetaTags(html, meta);
    if (!meta.title) {
      const mt = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      if (mt?.[1]) meta.title = mt[1].trim();
    }
    if (!meta.canonical) {
      const mc = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i);
      if (mc?.[1]) meta.canonical = mc[1].trim();
    }
    // Normalize dates to ISO if parseable
    if (meta.publishedDate) {
      const d = new Date(meta.publishedDate);
      if (!isNaN(d.getTime())) meta.publishedDate = d.toISOString();
    }
    if (meta.updatedDate) {
      const d = new Date(meta.updatedDate);
      if (!isNaN(d.getTime())) meta.updatedDate = d.toISOString();
    }
    return meta;
  } catch {
    return {};
  } finally {
    clearTimeout(to);
  }
}
