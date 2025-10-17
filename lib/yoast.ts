import { loadYoastMetaFallback, persistYoastMeta, YoastStoredMeta } from "./yoast-storage";

export type PartialMetadata = {
  title?: string | null;
  description?: string | null;
  alternates?: { canonical?: string | null };
  openGraph?: {
    title?: string | null;
    description?: string | null;
    images?: { url: string }[] | undefined;
    url?: string | null;
    type?: string | null;
  };
  twitter?: {
    title?: string | null;
    description?: string | null;
    images?: string[] | undefined;
    card?: string | null;
    site?: string | null;
  };
  robots?: any;
};

function getAuthHeader() {
  const username = process.env.WP_USERNAME || "";
  let appPassword = process.env.WP_APP_PASSWORD || "";
  appPassword = appPassword.replace(/\s+/g, "");
  if (!username || !appPassword) return {} as Record<string, string>;
  const token = Buffer.from(`${username}:${appPassword}`).toString("base64");
  return { Authorization: `Basic ${token}` } as Record<string, string>;
}

function parseJsonOrNull(body: string, context: string) {
  if (!body) return null;
  try {
    return JSON.parse(body);
  } catch (error) {
    console.warn(
      `[yoast] Failed to parse JSON from ${context}: ${body.slice(0, 120)}`,
    );
    return null;
  }
}

function extractFromHeadHtml(url: string, headHtml: string) {
  const head = headHtml.substring(0, 200000);
  const pick = (attr: "name" | "property", value: string) => {
    const re1 = new RegExp(
      `<meta[^>]*${attr}=["']${value}["'][^>]*content=["']([\\s\\S]*?)["'][^>]*>`,
      "i",
    );
    const re2 = new RegExp(
      `<meta[^>]*content=["']([\\s\\S]*?)["'][^>]*${attr}=["']${value}["'][^>]*>`,
      "i",
    );
    const m = head.match(re1) || head.match(re2);
    return m && m[1] ? m[1].trim() : null;
  };
  const titleMatch = head.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const canonicalMatch =
    head.match(
      /<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i,
    ) ||
    head.match(
      /<link[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["'][^>]*>/i,
    );
  const resolve = (maybe: string | null) => {
    if (!maybe) return null;
    try {
      return new URL(maybe, url).toString();
    } catch {
      return maybe;
    }
  };
  const title = titleMatch ? titleMatch[1].trim() : null;
  const description = pick("name", "description");
  const canonical = resolve(canonicalMatch ? canonicalMatch[1] : null);
  const ogImage = resolve(pick("property", "og:image"));
  const twImage = resolve(
    pick("name", "twitter:image") || pick("name", "twitter:image:src"),
  );
  return {
    title,
    description,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      title,
      description,
      url: canonical,
      type: pick("property", "og:type"),
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      title: pick("name", "twitter:title") || title,
      description: pick("name", "twitter:description") || description,
      images: twImage ? [twImage] : undefined,
      card: pick("name", "twitter:card"),
      site: pick("name", "twitter:site"),
    },
    robots: pick("name", "robots"),
  } as PartialMetadata;
}

async function wpGet(endpoint: string, headers: Record<string, string>) {
  const WP_BASE = (
    process.env.NEXT_PUBLIC_WORDPRESS_URL || "https://keylargoscubadiving.com"
  ).replace(/\/$/, "");
  const res = await fetch(`${WP_BASE}/wp-json${endpoint}`, {
    headers,
    cache: "no-store",
  });
  if (!res.ok) {
    const snippet = await res.text().catch(() => "");
    console.warn(
      `[yoast] WP ${res.status} ${res.statusText} for ${endpoint}: ${snippet.slice(0, 120)}`,
    );
    return null;
  }
  const body = await res.text();
  return parseJsonOrNull(body, `${WP_BASE}/wp-json${endpoint}`);
}

function fromYoastHeadJson(urlHint: string, y: any): PartialMetadata {
  const canonical = y?.canonical || y?.og_url || null;
  const ogImage = Array.isArray(y?.og_image) ? y.og_image[0]?.url : null;
  const twImage = y?.twitter_image || null;
  return {
    title: y?.title || y?.og_title || null,
    description: y?.description || y?.og_description || null,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      title: y?.og_title || null,
      description: y?.og_description || null,
      url: y?.og_url || canonical,
      type: y?.og_type || null,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      title: y?.twitter_title || null,
      description: y?.twitter_description || null,
      images: twImage ? [twImage] : undefined,
      card: y?.twitter_card || null,
      site: y?.twitter_site || null,
    },
    robots: y?.robots ? stringifyRobots(y.robots) : null,
  } as PartialMetadata;
}

type StoreContext = {
  slug?: string | null;
  url?: string | null;
  path?: string | null;
  canonical?: string | null;
};

function stringifyRobots(value: any): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    const joined = value
      .map((part) => (typeof part === "string" ? part.trim() : ""))
      .filter(Boolean)
      .join(", ");
    return joined.length ? joined : null;
  }
  if (typeof value === "object") {
    const parts = Object.entries(value)
      .filter(([, v]) => Boolean(v))
      .map(([k, v]) => (typeof v === "string" && v.trim().length ? v : k));
    const joined = parts.filter(Boolean).join(", ");
    return joined.length ? joined : null;
  }
  return null;
}

function deriveSlugFromUrl(value?: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return deriveSlugFromPath(url.pathname);
  } catch {
    return deriveSlugFromPath(value);
  }
}

function deriveSlugFromPath(path?: string | null): string | null {
  if (!path) return null;
  const trimmed = path.replace(/^https?:\/\/[^/]+/, "").replace(/^\/+|\/+$/g, "");
  if (!trimmed) return null;
  const parts = trimmed.split("/").filter(Boolean);
  return parts.length ? parts[parts.length - 1] : null;
}

function partialToStored(meta: PartialMetadata): YoastStoredMeta {
  const canonical = meta.alternates?.canonical ?? meta.openGraph?.url ?? null;
  const ogImage = meta.openGraph?.images?.find((img) => typeof img?.url === "string")?.url ?? null;
  const twitterImage = Array.isArray(meta.twitter?.images)
    ? meta.twitter?.images.find((img) => typeof img === "string") ?? null
    : null;

  return {
    title: meta.title ?? null,
    description: meta.description ?? null,
    canonical,
    robots: stringifyRobots(meta.robots),
    og:
      meta.openGraph || canonical || ogImage
        ? {
            title: meta.openGraph?.title ?? meta.title ?? null,
            description: meta.openGraph?.description ?? meta.description ?? null,
            image: ogImage ?? null,
            url: meta.openGraph?.url ?? canonical ?? null,
            type: meta.openGraph?.type ?? null,
          }
        : null,
    twitter: meta.twitter
      ? {
          title: meta.twitter.title ?? null,
          description: meta.twitter.description ?? null,
          image: twitterImage,
          card: meta.twitter.card ?? null,
          site: meta.twitter.site ?? null,
        }
      : null,
  };
}

function storedToPartial(meta: YoastStoredMeta): PartialMetadata {
  return {
    title: meta.title ?? null,
    description: meta.description ?? null,
    alternates: meta.canonical ? { canonical: meta.canonical } : undefined,
    robots: meta.robots ?? undefined,
    openGraph: meta.og
      ? {
          title: meta.og.title ?? undefined,
          description: meta.og.description ?? undefined,
          images: meta.og.image ? [{ url: meta.og.image }] : undefined,
          url: meta.og.url ?? meta.canonical ?? undefined,
          type: meta.og.type ?? undefined,
        }
      : meta.canonical
        ? {
            url: meta.canonical,
          }
        : undefined,
    twitter: meta.twitter
      ? {
          title: meta.twitter.title ?? undefined,
          description: meta.twitter.description ?? undefined,
          images: meta.twitter.image ? [meta.twitter.image] : undefined,
          card: meta.twitter.card ?? undefined,
          site: meta.twitter.site ?? undefined,
        }
      : undefined,
  };
}

async function storePartial(meta: PartialMetadata, context: StoreContext) {
  const stored = partialToStored(meta);
  await persistYoastMeta(stored, {
    slug: context.slug ?? null,
    url: context.url ?? null,
    path: context.path ?? null,
    canonical: context.canonical ?? stored.canonical ?? context.url ?? null,
  });
  return meta;
}

async function storeStored(meta: YoastStoredMeta, context: StoreContext) {
  await persistYoastMeta(meta, {
    slug: context.slug ?? null,
    url: context.url ?? null,
    path: context.path ?? null,
    canonical: context.canonical ?? meta.canonical ?? context.url ?? null,
  });
  return storedToPartial(meta);
}

async function loadFallbackMeta(context: StoreContext) {
  const stored = await loadYoastMetaFallback({
    slug: context.slug ?? null,
    url: context.url ?? null,
    path: context.path ?? null,
    canonical: context.canonical ?? null,
  });
  if (!stored) return null;
  return storedToPartial(stored);
}

function yoastJsonToStored(y: any, permalink: string | null): YoastStoredMeta {
  const canonical = y?.canonical || y?.og_url || permalink || null;
  const ogImage = Array.isArray(y?.og_image)
    ? y.og_image[0]?.url ?? null
    : y?.og_image?.url ?? y?.twitter_image ?? null;
  const twitterMisc = y?.twitter_misc && typeof y.twitter_misc === "object"
    ? y.twitter_misc
    : null;

  return {
    title: y?.title || y?.og_title || null,
    description: y?.description || y?.og_description || null,
    canonical,
    robots: stringifyRobots(y?.robots),
    og: {
      title: y?.og_title || null,
      description: y?.og_description || null,
      image: ogImage || null,
      url: y?.og_url || canonical || null,
      type: y?.og_type || null,
    },
    twitter: {
      title: twitterMisc?.["Title"] || y?.twitter_title || null,
      description: twitterMisc?.["Description"] || y?.twitter_description || null,
      image: y?.twitter_image || null,
      card: y?.twitter_card || null,
      site: y?.twitter_site || null,
    },
  };
}

export async function yoastMetadataForUrl(
  url: string,
): Promise<PartialMetadata> {
  const WP_BASE = (
    process.env.NEXT_PUBLIC_WORDPRESS_URL || "https://keylargoscubadiving.com"
  ).replace(/\/$/, "");
  const headers: Record<string, string> = {
    "User-Agent": "KLSD-NextJS-Yoast/1.0",
    Accept: "application/json",
    ...getAuthHeader(),
  };
  const slug = deriveSlugFromUrl(url);

  try {
    const res = await fetch(
      `${WP_BASE}/wp-json/yoast/v1/get_head?url=${encodeURIComponent(url)}`,
      {
        headers,
        cache: "no-store",
      },
    );
    if (res.ok) {
      const body = await res.text();
      const j = parseJsonOrNull(body, `${WP_BASE}/wp-json/yoast/v1/get_head`);
      if (j && typeof j.head === "string") {
        const meta = extractFromHeadHtml(url, j.head as string);
        return storePartial(meta, {
          url,
          slug,
          canonical: meta.alternates?.canonical ?? url,
        });
      }
    }
  } catch {}

  try {
    const u = new URL(url);
    const parts = u.pathname.replace(/\/$/, "").split("/").filter(Boolean);
    const leafSlug = parts[parts.length - 1] || "";
    if (leafSlug) {
      const endpoints = [
        `/wp/v2/pages?slug=${encodeURIComponent(leafSlug)}`,
        `/wp/v2/posts?slug=${encodeURIComponent(leafSlug)}`,
        `/wp/v2/product?slug=${encodeURIComponent(leafSlug)}`,
      ];
      for (const ep of endpoints) {
        const items = await wpGet(ep, headers);
        const item = Array.isArray(items) ? items[0] : null;
        if (item?.yoast_head_json) {
          const link = item.link || url;
          const meta = fromYoastHeadJson(link, item.yoast_head_json);
          return storePartial(meta, {
            url: link,
            slug: slug ?? deriveSlugFromUrl(link) ?? leafSlug,
            canonical: meta.alternates?.canonical ?? link,
          });
        }
        if (item?.link) {
          const res2 = await fetch(
            `${WP_BASE}/wp-json/yoast/v1/get_head?url=${encodeURIComponent(item.link)}`,
            { headers, cache: "no-store" },
          );
          if (res2.ok) {
            const body2 = await res2.text();
            const j2 = parseJsonOrNull(
              body2,
              `${WP_BASE}/wp-json/yoast/v1/get_head`,
            );
            if (j2 && typeof j2.head === "string") {
              const meta = extractFromHeadHtml(item.link, j2.head as string);
              return storePartial(meta, {
                url: item.link,
                slug: slug ?? deriveSlugFromUrl(item.link) ?? leafSlug,
                canonical: meta.alternates?.canonical ?? item.link,
              });
            }
          }
        }
      }
      const search = await wpGet(
        `/wp/v2/search?search=${encodeURIComponent(leafSlug)}&per_page=1`,
        headers,
      );
      const first = Array.isArray(search) ? search[0] : null;
      const link = first?.url || first?.link || null;
      if (link) {
        const res3 = await fetch(
          `${WP_BASE}/wp-json/yoast/v1/get_head?url=${encodeURIComponent(link)}`,
          { headers, cache: "no-store" },
        );
        if (res3.ok) {
          const body3 = await res3.text();
          const j3 = parseJsonOrNull(
            body3,
            `${WP_BASE}/wp-json/yoast/v1/get_head`,
          );
          if (j3 && typeof j3.head === "string") {
            const meta = extractFromHeadHtml(link, j3.head as string);
            return storePartial(meta, {
              url: link,
              slug: slug ?? deriveSlugFromUrl(link) ?? leafSlug,
              canonical: meta.alternates?.canonical ?? link,
            });
          }
        }
      }
    }
  } catch {}

  const fallback = await loadFallbackMeta({
    url,
    canonical: url,
    slug,
  });
  if (fallback) return fallback;
  return {};
}

export async function yoastMetadataForSlug(
  slug: string,
): Promise<PartialMetadata> {
  const WP_BASE = (
    process.env.NEXT_PUBLIC_WORDPRESS_URL || "https://keylargoscubadiving.com"
  ).replace(/\/$/, "");
  const headers: Record<string, string> = {
    "User-Agent": "KLSD-NextJS-Yoast/1.0",
    Accept: "application/json",
    ...getAuthHeader(),
  };
  const trimmedSlug = slug.trim();

  const tryWpV2 = async (endpoint: string) => {
    try {
      const items = await wpGet(endpoint, headers);
      const item = Array.isArray(items) ? items[0] : null;
      if (item && item.yoast_head_json) {
        return {
          source: "yoast_head_json" as const,
          data: item.yoast_head_json,
          permalink: item.link || null,
        };
      }
      return { source: null, data: null, permalink: item?.link || null };
    } catch {
      return { source: null, data: null, permalink: null };
    }
  };

  let lastPermalink: string | null = null;

  const endpoints = [
    `/wp/v2/pages?slug=${encodeURIComponent(trimmedSlug)}`,
    `/wp/v2/posts?slug=${encodeURIComponent(trimmedSlug)}`,
    `/wp/v2/product?slug=${encodeURIComponent(trimmedSlug)}`,
  ];

  for (const ep of endpoints) {
    const result = await tryWpV2(ep);
    if (result.data) {
      const stored = yoastJsonToStored(result.data, result.permalink || null);
      return storeStored(stored, {
        slug: trimmedSlug,
        url: result.permalink || null,
        canonical: stored.canonical ?? result.permalink ?? null,
      });
    }
    if (result.permalink) {
      lastPermalink = lastPermalink || result.permalink;
      const head = await fetch(
        `${WP_BASE}/wp-json/yoast/v1/get_head?url=${encodeURIComponent(result.permalink)}`,
        { headers, cache: "no-store" },
      ).catch(() => null);
      if (head?.ok) {
        const body = await head.text();
        const j = parseJsonOrNull(body, `${WP_BASE}/wp-json/yoast/v1/get_head`);
        if (j && typeof j.head === "string") {
          const meta = extractFromHeadHtml(result.permalink, j.head as string);
          return storePartial(meta, {
            slug: trimmedSlug,
            url: result.permalink,
            canonical: meta.alternates?.canonical ?? result.permalink,
          });
        }
      }
    }
  }

  if (trimmedSlug) {
    try {
      const search = await wpGet(
        `/wp/v2/search?search=${encodeURIComponent(trimmedSlug)}&per_page=1`,
        headers,
      );
      const first = Array.isArray(search) ? search[0] : null;
      const link = first?.url || first?.link || null;
      if (link) {
        lastPermalink = lastPermalink || link;
        const res3 = await fetch(
          `${WP_BASE}/wp-json/yoast/v1/get_head?url=${encodeURIComponent(link)}`,
          { headers, cache: "no-store" },
        );
        if (res3.ok) {
          const body3 = await res3.text();
          const j3 = parseJsonOrNull(
            body3,
            `${WP_BASE}/wp-json/yoast/v1/get_head`,
          );
          if (j3 && typeof j3.head === "string") {
            const meta = extractFromHeadHtml(link, j3.head as string);
            return storePartial(meta, {
              slug: trimmedSlug,
              url: link,
              canonical: meta.alternates?.canonical ?? link,
            });
          }
        }
      }
    } catch {}
  }

  const fallback = await loadFallbackMeta({
    slug: trimmedSlug,
    url: lastPermalink,
    canonical: lastPermalink,
  });
  if (fallback) return fallback;
  return {};
}
