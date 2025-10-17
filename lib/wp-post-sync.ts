import { normalizePath, normalizeSlug } from "./supabase-posts";

const DEFAULT_WORDPRESS_ORIGIN =
  process.env.WP_ORIGIN?.trim() || "https://keylargoscubadiving.com";

export interface WpRenderedField {
  rendered: string;
}

export interface WpPost {
  id: number;
  slug: string;
  link: string;
  status: string;
  date?: string;
  date_gmt?: string;
  modified?: string;
  modified_gmt?: string;
  title?: WpRenderedField;
  excerpt?: WpRenderedField;
  content?: WpRenderedField;
  _embedded?: {
    author?: Array<{ name?: string }>;
    "wp:term"?: Array<Array<{ taxonomy?: string; name?: string }>>;
  };
}

export type SupabasePostPayload = {
  route_type: string;
  slug: string;
  canonical_url: string;
  is_published: boolean;
  published_at: string | null;
  status: string;
  title: string;
  excerpt: string | null;
  body: { sections: Array<{ type: "richText"; html: string }> };
  tags: string[];
  author: string | null;
  post_published_at: string | null;
  updated_at: string | null;
};

export async function fetchWpPosts(
  options: {
    origin?: string;
    slugs?: string[];
    perPage?: number;
    maxPages?: number;
  } = {},
): Promise<WpPost[]> {
  const origin = options.origin?.trim() || DEFAULT_WORDPRESS_ORIGIN;
  const perPage = options.perPage ?? 100;
  const maxPages = options.maxPages ?? 200;
  const slugs = options.slugs?.filter(Boolean);

  if (slugs && slugs.length > 0) {
    const results: WpPost[] = [];
    for (const slug of slugs) {
      const url = new URL("/wp-json/wp/v2/posts", origin);
      url.searchParams.set("slug", slug);
      url.searchParams.set("_embed", "1");
      url.searchParams.set("per_page", "1");
      const post = await fetchJson<WpPost[]>(url.toString());
      if (Array.isArray(post) && post[0]) {
        results.push(post[0]);
      }
    }
    return results;
  }

  const posts: WpPost[] = [];
  for (let page = 1; page <= maxPages; page += 1) {
    const url = new URL("/wp-json/wp/v2/posts", origin);
    url.searchParams.set("per_page", String(perPage));
    url.searchParams.set("page", String(page));
    url.searchParams.set("_embed", "1");
    url.searchParams.set("orderby", "date");
    url.searchParams.set("order", "desc");

    const pagePosts = await fetchJson<WpPost[]>(url.toString());
    if (!Array.isArray(pagePosts) || pagePosts.length === 0) {
      break;
    }

    posts.push(...pagePosts);
    if (pagePosts.length < perPage) {
      break;
    }
  }
  return posts;
}

export function buildSupabasePostPayload(post: WpPost): SupabasePostPayload {
  const slugInfo = resolveSlug(post.slug, post.link);
  const isPublished = (post.status || "publish").toLowerCase() === "publish";
  const publishedAt = toIso(post.date_gmt || post.date);
  const updatedAt = toIso(post.modified_gmt || post.modified);
  const author = decodeHtml(post._embedded?.author?.[0]?.name || "");
  const html = sanitizeHtml(post.content?.rendered || "", slugInfo.canonical);

  return {
    route_type: "post",
    slug: slugInfo.slug,
    canonical_url: slugInfo.canonical,
    is_published: isPublished,
    published_at: publishedAt,
    status: isPublished ? "published" : "draft",
    title: decodeHtml(post.title?.rendered || slugInfo.slug),
    excerpt: buildExcerpt(post.excerpt?.rendered || ""),
    body: {
      sections: [
        {
          type: "richText",
          html,
        },
      ],
    },
    tags: collectTags(post),
    author: author ? author : null,
    post_published_at: isPublished ? publishedAt : null,
    updated_at: updatedAt,
  };
}

function resolveSlug(
  slug: string,
  link: string,
): {
  slug: string;
  path: string;
  canonical: string;
} {
  const url = safeUrl(link);
  const normalizedSlug = normalizeSlug(slug || (url ? url.pathname : ""));
  const canonical = url
    ? url.toString()
    : `${DEFAULT_WORDPRESS_ORIGIN}${normalizePath(normalizedSlug)}`;
  return {
    slug: normalizedSlug,
    path: normalizePath(normalizedSlug),
    canonical,
  };
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "User-Agent": "SupabaseSyncBot/1.0" },
  });

  if (!res.ok) {
    if (res.status === 400 || res.status === 404) {
      return [] as unknown as T;
    }
    const text = await res.text();
    throw new Error(`Failed to fetch ${url}: ${res.status} ${text}`);
  }

  return (await res.json()) as T;
}

function safeUrl(value: string | null | undefined): URL | null {
  if (!value) return null;
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function sanitizeHtml(html: string, baseUrl: string): string {
  const withoutScripts = html.replace(/<script[\s\S]*?<\/script>/gi, "");
  // Remove Builder-inserted / WP plugin attributes that React flags during hydration
  const cleaned = withoutScripts
    .replace(
      /\s(?:bis_size|bis-size|bis_[\w-]+|bis-[\w-]+|data-bis-[\w-]+)(?:=(['"]).*?\1|(?=\s|>))/gi,
      "",
    )
    .replace(/\sdata-bis-[\w-]+(?==|(?=\s|>))/gi, "");
  return absolutizeAttributes(cleaned, baseUrl);
}

function absolutizeAttributes(html: string, baseUrl: string): string {
  const base = safeUrl(baseUrl);
  if (!base) return html;
  const origin = `${base.protocol}//${base.host}`;
  return html
    .replace(/\s(href|src)=(["'])(.*?)(\2)/gi, (_match, attr, quote, raw) => {
      try {
        const value = raw.trim();
        if (!value || value.startsWith("#") || value.startsWith("data:")) {
          return ` ${attr}=${quote}${value}${quote}`;
        }
        if (/^https?:\/\//i.test(value)) {
          return ` ${attr}=${quote}${value}${quote}`;
        }
        if (value.startsWith("//")) {
          return ` ${attr}=${quote}${base.protocol}${value}${quote}`;
        }
        if (value.startsWith("/")) {
          return ` ${attr}=${quote}${origin}${value}${quote}`;
        }
        const resolved = new URL(value, base.href).href;
        return ` ${attr}=${quote}${resolved}${quote}`;
      } catch {
        return ` ${attr}=${quote}${raw}${quote}`;
      }
    })
    .replace(/\ssrcset=(["'])(.*?)(\1)/gi, (_match, quote, value) => {
      try {
        const items = value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
          .map((item) => {
            const [url, descriptor] = item.split(/\s+/);
            if (!url) return null;
            let absUrl = url;
            if (url.startsWith("//")) {
              absUrl = `${base.protocol}${url}`;
            } else if (url.startsWith("/")) {
              absUrl = `${origin}${url}`;
            } else if (!/^https?:\/\//i.test(url)) {
              absUrl = new URL(url, base.href).href;
            }
            return descriptor ? `${absUrl} ${descriptor}` : absUrl;
          })
          .filter((item): item is string => Boolean(item));
        return ` srcset=${quote}${items.join(", ")}${quote}`;
      } catch {
        return ` srcset=${quote}${value}${quote}`;
      }
    });
}

function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeHtml(text: string): string {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function buildExcerpt(html: string, maxLength = 280): string | null {
  const raw = decodeHtml(stripTags(html));
  if (!raw) return null;
  if (raw.length <= maxLength) return raw;
  return `${raw.slice(0, maxLength).trimEnd()}…`;
}

function collectTags(post: WpPost): string[] {
  const tags = new Set<string>();
  const embedded = post._embedded?.["wp:term"] || [];
  for (const group of embedded) {
    for (const term of group || []) {
      const name = term?.name;
      if (typeof name === "string" && name.trim().length) {
        tags.add(name.trim());
      }
    }
  }
  return Array.from(tags);
}

function toIso(value: string | null | undefined): string | null {
  if (!value) return null;
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? new Date(ms).toISOString() : null;
}
