import { supabaseAdmin } from "../lib/supabaseAdmin";
import { normalizePath, normalizeSlug } from "../lib/supabase-posts";

const DEFAULT_WORDPRESS_ORIGIN =
  process.env.WP_ORIGIN?.trim() || "https://keylargoscubadiving.com";
const DEFAULT_TENANT_ID =
  process.env.DEFAULT_TENANT_ID?.trim() ||
  "90a5bce0-7752-4941-bef3-5f205f1cdfdd";

const PER_PAGE = 100;
const MAX_PAGES = 200;

interface WpRenderedField {
  rendered: string;
}

interface WpTerm {
  taxonomy?: string;
  name?: string;
  slug?: string;
}

interface WpPost {
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
  author?: number;
  _embedded?: {
    author?: Array<{ name?: string }>;
    "wp:term"?: WpTerm[][];
  };
}

function assertEnv() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE) {
    throw new Error(
      "Supabase environment variables are required to run this script.",
    );
  }
}

function resolveSlugPath(
  slug: string,
  link: string,
): { slug: string; path: string; canonical: string } {
  const url = safeUrl(link);
  const normalizedSlug = normalizeSlug(slug || (url ? url.pathname : ""));
  const path = normalizePath(url ? url.pathname : normalizedSlug);
  const canonical = url ? url.toString() : `${DEFAULT_WORDPRESS_ORIGIN}${path}`;
  return { slug: normalizedSlug, path, canonical };
}

function safeUrl(value: string | null | undefined): URL | null {
  if (!value) return null;
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

async function fetchWpPosts(): Promise<WpPost[]> {
  const posts: WpPost[] = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const url = new URL("/wp-json/wp/v2/posts", DEFAULT_WORDPRESS_ORIGIN);
    url.searchParams.set("per_page", String(PER_PAGE));
    url.searchParams.set("page", String(page));
    url.searchParams.set("_embed", "1");
    url.searchParams.set("orderby", "date");
    url.searchParams.set("order", "desc");

    const res = await fetch(url.toString(), {
      headers: { "User-Agent": "SupabaseSyncBot/1.0" },
    });

    if (res.status === 400 || res.status === 404) {
      break;
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(
        `Failed to fetch posts page ${page}: ${res.status} ${text}`,
      );
    }

    const pagePosts = (await res.json()) as WpPost[];
    if (!Array.isArray(pagePosts) || pagePosts.length === 0) {
      break;
    }

    posts.push(...pagePosts);
    if (pagePosts.length < PER_PAGE) {
      break;
    }
  }
  return posts;
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

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function buildExcerpt(html: string, maxLength = 280): string | null {
  const raw = decodeHtmlEntities(stripTags(html));
  if (!raw) return null;
  if (raw.length <= maxLength) return raw;
  return `${raw.slice(0, maxLength).trimEnd()}…`;
}

function collectTags(post: WpPost): string[] {
  const tags = new Set<string>();
  const embedded = post._embedded?.["wp:term"] || [];
  for (const group of embedded) {
    for (const term of group || []) {
      if (term?.name && typeof term.name === "string") {
        tags.add(term.name.trim());
      }
    }
  }
  return Array.from(tags);
}

type SyncSummary = {
  total: number;
  upserted: number;
  skipped: number;
  failures: Array<{ slug: string; error: string }>;
};

async function run() {
  assertEnv();

  const tenantId = DEFAULT_TENANT_ID;
  if (!tenantId) {
    throw new Error(
      "DEFAULT_TENANT_ID is not configured and no fallback is available.",
    );
  }

  console.log("Fetching WordPress posts…");
  const posts = await fetchWpPosts();
  console.log(`Fetched ${posts.length} posts from WordPress.`);

  const supabase = supabaseAdmin();

  const summary: SyncSummary = {
    total: posts.length,
    upserted: 0,
    skipped: 0,
    failures: [],
  };

  for (const post of posts) {
    const slugData = resolveSlugPath(post.slug, post.link);
    const slug = slugData.slug;

    if (!slug) {
      summary.skipped += 1;
      summary.failures.push({ slug: post.slug, error: "missing_slug" });
      continue;
    }

    try {
      const status = (post.status || "publish").toLowerCase();
      const isPublished = status === "publish";
      const publishedAt = toIso(post.date_gmt || post.date) ?? null;
      const updatedAt = toIso(post.modified_gmt || post.modified) ?? null;

      const title = decodeHtmlEntities(post.title?.rendered || slug);
      const excerpt = buildExcerpt(post.excerpt?.rendered || "");
      const bodyHtmlRaw = post.content?.rendered || "";
      const bodyHtml = sanitizeHtml(bodyHtmlRaw, slugData.canonical);
      const author = decodeHtmlEntities(
        post._embedded?.author?.[0]?.name || "",
      );
      const tags = collectTags(post);

      const payload = {
        tenant_id: tenantId,
        route_type: "post",
        slug,
        path: slugData.path,
        canonical_url: slugData.canonical,
        is_published: isPublished,
        published_at: publishedAt,
        status: isPublished ? "published" : "draft",
        title,
        excerpt,
        body: {
          sections: [
            {
              type: "richText",
              html: bodyHtml,
            },
          ],
        },
        tags,
        author: author || null,
        post_published_at: isPublished ? publishedAt : null,
        updated_at: updatedAt,
      };

      const { error } = await supabase.rpc("cms_upsert_post", { payload });
      if (error) {
        throw new Error(error.message);
      }
      summary.upserted += 1;
    } catch (error) {
      summary.failures.push({
        slug: slugData.slug,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  console.log(
    JSON.stringify(
      {
        ok: summary.failures.length === 0,
        summary,
      },
      null,
      2,
    ),
  );
}

function toIso(value: string | null | undefined): string | null {
  if (!value) return null;
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? new Date(ms).toISOString() : null;
}

void run().catch((error) => {
  console.error(
    JSON.stringify({
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    }),
  );
  process.exitCode = 1;
});
