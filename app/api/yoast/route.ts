import { NextRequest, NextResponse } from "next/server";
import { getCache, setCache, makeKey } from "./cache";
import {
  loadYoastMetaFallback,
  persistYoastMeta,
  YoastStoredMeta,
} from "../../../lib/yoast-storage";

// Build Basic auth header using WP Application Password
function getAuthHeader() {
  const username = process.env.WP_USERNAME || "";
  let appPassword = process.env.WP_APP_PASSWORD || "";
  // WP shows spaces in the password UI; strip them for HTTP auth
  appPassword = appPassword.replace(/\s+/g, "");
  if (!username || !appPassword) return {} as Record<string, string>;
  const token = Buffer.from(`${username}:${appPassword}`).toString("base64");
  return { Authorization: `Basic ${token}` } as Record<string, string>;
}

const WP_BASE = (
  process.env.NEXT_PUBLIC_WORDPRESS_URL || "https://keylargoscubadiving.com"
).replace(/\/$/, "");

function parseJsonOrThrow(body: string, context: string) {
  try {
    return JSON.parse(body);
  } catch (error) {
    throw new Error(`WP invalid JSON for ${context}: ${body.slice(0, 200)}`);
  }
}

async function wpGet(endpoint: string, init: RequestInit = {}) {
  if (!WP_BASE) throw new Error("NEXT_PUBLIC_WORDPRESS_URL not configured");
  const headers: Record<string, string> = {
    "User-Agent": "KLSD-NextJS-Yoast/1.0",
    Accept: "application/json",
    ...getAuthHeader(),
    ...(init.headers as Record<string, string>),
  };
  const res = await fetch(`${WP_BASE}/wp-json${endpoint}`, {
    ...init,
    headers,
    // Avoid caching challenges
    cache: "no-store",
  });
  const body = await res.text().catch(() => "");
  if (!res.ok) {
    throw new Error(
      `WP error ${res.status} ${res.statusText} for ${endpoint}: ${body.slice(0, 200)}`,
    );
  }
  return parseJsonOrThrow(body, `${WP_BASE}/wp-json${endpoint}`);
}

async function yoastHeadByUrl(url: string) {
  try {
    const data = await wpGet(
      `/yoast/v1/get_head?url=${encodeURIComponent(url)}`,
    );
    if (data && typeof data.head === "string")
      return { source: "yoast_head", head: data.head as string };
  } catch {}
  return null;
}

// Extract common fields from either yoast_head_json or raw <head> HTML
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
  return {
    title: titleMatch ? titleMatch[1].trim() : null,
    description: pick("name", "description"),
    canonical: resolve(canonicalMatch ? canonicalMatch[1] : null),
    robots: pick("name", "robots"),
    og: {
      title: pick("property", "og:title"),
      description: pick("property", "og:description"),
      image: resolve(pick("property", "og:image")),
      url: resolve(pick("property", "og:url")),
      type: pick("property", "og:type"),
    },
    twitter: {
      title: pick("name", "twitter:title"),
      description: pick("name", "twitter:description"),
      image: resolve(
        pick("name", "twitter:image") || pick("name", "twitter:image:src"),
      ),
      card: pick("name", "twitter:card"),
      site: pick("name", "twitter:site"),
    },
  };
}

function toRobotsString(value: unknown): string | null {
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
    const parts = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => Boolean(v))
      .map(([k, v]) => (typeof v === "string" && v.trim().length ? v : k));
    const joined = parts.filter(Boolean).join(", ");
    return joined.length ? joined : null;
  }
  return null;
}

function toStoredMeta(data: any): YoastStoredMeta | null {
  if (!data) return null;
  const canonical = data.canonical ?? data?.og?.url ?? null;
  const ogSource = data.og ?? null;
  let ogImage: string | null = null;
  if (ogSource) {
    if (typeof ogSource.image === "string") ogImage = ogSource.image;
    else if (Array.isArray(ogSource.images)) {
      const firstWithUrl = ogSource.images.find(
        (item: any) => item && typeof item.url === "string",
      );
      ogImage = firstWithUrl?.url ?? null;
    }
  }
  let twitterImage: string | null = null;
  if (data.twitter) {
    if (typeof data.twitter.image === "string")
      twitterImage = data.twitter.image;
    else if (Array.isArray(data.twitter.images)) {
      twitterImage =
        data.twitter.images.find(
          (item: any) => typeof item === "string" && item.trim().length,
        ) ?? null;
    }
  }

  const robots = toRobotsString(data.robots);
  const hasMeaningful = Boolean(
    data.title ||
      data.description ||
      canonical ||
      (ogSource && (ogSource.title || ogSource.description || ogImage)),
  );
  if (!hasMeaningful) return null;

  return {
    title: data.title ?? null,
    description: data.description ?? null,
    canonical,
    robots,
    og:
      ogSource || canonical
        ? {
            title: ogSource?.title ?? null,
            description: ogSource?.description ?? null,
            image: ogImage ?? null,
            url: ogSource?.url ?? canonical ?? null,
            type: ogSource?.type ?? null,
          }
        : null,
    twitter: data.twitter
      ? {
          title: data.twitter.title ?? null,
          description: data.twitter.description ?? null,
          image: twitterImage,
          card: data.twitter.card ?? null,
          site: data.twitter.site ?? null,
        }
      : null,
  };
}

function storedToPayload(meta: YoastStoredMeta) {
  return {
    title: meta.title ?? null,
    description: meta.description ?? null,
    canonical: meta.canonical ?? null,
    robots: meta.robots ?? null,
    og: meta.og
      ? {
          title: meta.og.title ?? null,
          description: meta.og.description ?? null,
          image: meta.og.image ?? null,
          url: meta.og.url ?? meta.canonical ?? null,
          type: meta.og.type ?? null,
        }
      : null,
    twitter: meta.twitter
      ? {
          title: meta.twitter.title ?? null,
          description: meta.twitter.description ?? null,
          image: meta.twitter.image ?? null,
          card: meta.twitter.card ?? null,
          site: meta.twitter.site ?? null,
        }
      : null,
  };
}

function slugFromPath(path?: string | null): string | null {
  if (!path) return null;
  const trimmed = path.replace(/^\/+|\/+$/g, "");
  if (!trimmed) return null;
  const parts = trimmed.split("/").filter(Boolean);
  return parts.length ? parts[parts.length - 1] : null;
}

function slugFromUrl(url?: string | null): string | null {
  if (!url) return null;
  try {
    const { pathname } = new URL(url);
    return slugFromPath(pathname);
  } catch {
    return slugFromPath(url);
  }
}

function normalizePath(value?: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const withLeading = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  if (withLeading === "/") return "/";
  return withLeading.replace(/\/+/g, "/").replace(/\/$/, "");
}

function pathFromSlug(slug?: string | null): string | null {
  if (!slug) return null;
  return normalizePath(slug);
}

function pathFromUrl(url?: string | null): string | null {
  if (!url) return null;
  try {
    return normalizePath(new URL(url).pathname);
  } catch {
    return normalizePath(url);
  }
}

async function respondWithPayload(
  key: string,
  payload: { ok: true; source: string; data: any },
  context: {
    slug?: string | null;
    url?: string | null;
    canonical?: string | null;
    path?: string | null;
  },
) {
  const stored = toStoredMeta(payload.data);
  if (stored) {
    await persistYoastMeta(stored, {
      slug: context.slug ?? null,
      url: context.url ?? null,
      canonical: context.canonical ?? stored.canonical ?? null,
      path: context.path ?? null,
    });
  }
  setCache(key, payload);
  return NextResponse.json(payload);
}

async function respondWithFallback(
  key: string,
  context: {
    slug?: string | null;
    url?: string | null;
    canonical?: string | null;
    path?: string | null;
  },
) {
  const stored = await loadYoastMetaFallback({
    slug: context.slug ?? null,
    url: context.url ?? null,
    canonical: context.canonical ?? null,
    path: context.path ?? null,
  });
  if (!stored) return null;
  const payload = {
    ok: true as const,
    source: "supabase_fallback",
    data: storedToPayload(stored),
  };
  setCache(key, payload);
  return NextResponse.json(payload);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = (searchParams.get("type") || "").toLowerCase(); // post | page | product | url
  const slug = (searchParams.get("slug") || "").trim();
  const directUrl = (searchParams.get("url") || "").trim();

  const key = makeKey(searchParams);
  const cached = getCache(key);
  if (cached) return NextResponse.json(cached);

  const slugPath = pathFromSlug(slug);
  const slugOrNull = slug.length ? slug : null;
  let lastPermalink: string | null = directUrl || null;

  try {
    if (directUrl) {
      const head = await yoastHeadByUrl(directUrl);
      if (head) {
        const data = extractFromHeadHtml(directUrl, head.head);
        return await respondWithPayload(
          key,
          {
            ok: true,
            source: head.source,
            data,
          },
          {
            slug: slugOrNull ?? slugFromUrl(directUrl),
            url: directUrl,
            canonical: data.canonical ?? directUrl,
            path: slugPath ?? pathFromUrl(directUrl),
          },
        );
      }

      const fallback = await respondWithFallback(key, {
        slug: slugOrNull ?? slugFromUrl(directUrl),
        url: directUrl,
        canonical: directUrl,
        path: slugPath ?? pathFromUrl(directUrl),
      });
      if (fallback) return fallback;

      return NextResponse.json(
        { ok: false, error: "yoast/v1/get_head not available or blocked" },
        { status: 502 },
      );
    }

    if (!slug && !directUrl) {
      return NextResponse.json(
        {
          error:
            "Provide ?slug=... or ?url=... (optional ?type=post|page|product)",
        },
        { status: 400 },
      );
    }

    const tryWpV2 = async (endpoint: string) => {
      try {
        const items = await wpGet(endpoint);
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

    let result: {
      source: "yoast_head_json" | null;
      data: any;
      permalink: string | null;
    } | null = null;

    if (!type && slug) {
      const endpoints = [
        `/wp/v2/pages?slug=${encodeURIComponent(slug)}`,
        `/wp/v2/posts?slug=${encodeURIComponent(slug)}`,
        `/wp/v2/product?slug=${encodeURIComponent(slug)}`,
      ];
      for (const ep of endpoints) {
        result = await tryWpV2(ep);
        if (result?.permalink)
          lastPermalink = lastPermalink || result.permalink;
        if (result?.data || result?.permalink) break;
      }
      if (!result?.data && !result?.permalink) {
        try {
          const search = await wpGet(
            `/wp/v2/search?search=${encodeURIComponent(slug)}&per_page=1`,
          );
          const first = Array.isArray(search) ? search[0] : null;
          const link = first?.url || first?.link || null;
          if (link) {
            lastPermalink = lastPermalink || link;
            const head = await yoastHeadByUrl(link);
            if (head) {
              const data = extractFromHeadHtml(link, head.head);
              return await respondWithPayload(
                key,
                {
                  ok: true,
                  source: head.source,
                  data,
                },
                {
                  slug: slugOrNull ?? slugFromUrl(link),
                  url: link,
                  canonical: data.canonical ?? link,
                  path: slugPath ?? pathFromUrl(link),
                },
              );
            }
          }
        } catch {}
      }
    } else if (type === "page") {
      result = await tryWpV2(`/wp/v2/pages?slug=${encodeURIComponent(slug)}`);
      if (result?.permalink) lastPermalink = lastPermalink || result.permalink;
    } else if (type === "post") {
      result = await tryWpV2(`/wp/v2/posts?slug=${encodeURIComponent(slug)}`);
      if (result?.permalink) lastPermalink = lastPermalink || result.permalink;
    } else if (type === "product") {
      result = await tryWpV2(`/wp/v2/product?slug=${encodeURIComponent(slug)}`);
      if (result?.permalink) lastPermalink = lastPermalink || result.permalink;
      if (!result?.data) {
        try {
          const wc = await wpGet(
            `/wc/v3/products?slug=${encodeURIComponent(slug)}`,
          );
          const product = Array.isArray(wc) ? wc[0] : null;
          if (product?.yoast_head_json) {
            result = {
              source: "yoast_head_json",
              data: product.yoast_head_json,
              permalink: product.permalink || null,
            };
            if (result.permalink)
              lastPermalink = lastPermalink || result.permalink;
          } else if (product?.permalink) {
            lastPermalink = lastPermalink || product.permalink;
            const head = await yoastHeadByUrl(product.permalink);
            if (head) {
              const data = extractFromHeadHtml(product.permalink, head.head);
              return await respondWithPayload(
                key,
                {
                  ok: true,
                  source: head.source,
                  data,
                },
                {
                  slug: slugOrNull ?? slugFromUrl(product.permalink),
                  url: product.permalink,
                  canonical: data.canonical ?? product.permalink,
                  path: slugPath ?? pathFromUrl(product.permalink),
                },
              );
            }
          }
        } catch {}
      }
    }

    if (result?.data) {
      const y = result.data;
      const canonical = y.canonical || y.og_url || result.permalink || null;
      const data = {
        title: y.title || y.og_title || null,
        description: y.description || y.og_description || null,
        canonical,
        robots: y.robots
          ? Object.entries(y.robots)
              .filter(([_, v]) => v)
              .map(([k]) => k)
              .join(", ")
          : null,
        og: {
          title: y.og_title || null,
          description: y.og_description || null,
          image:
            (Array.isArray(y.og_image) && y.og_image[0]?.url) ||
            y.og_image?.[0]?.url ||
            y.twitter_image ||
            null,
          url: y.og_url || canonical,
          type: y.og_type || null,
        },
        twitter: {
          title: y.twitter_misc?.["Title"] || y.twitter_title || null,
          description:
            y.twitter_misc?.["Description"] || y.twitter_description || null,
          image: y.twitter_image || null,
          card: y.twitter_card || null,
          site: y.twitter_site || null,
        },
      };
      return await respondWithPayload(
        key,
        {
          ok: true,
          source: "yoast_head_json",
          data,
        },
        {
          slug: slugOrNull,
          url: result.permalink || lastPermalink,
          canonical,
          path: slugPath ?? pathFromUrl(result.permalink || lastPermalink),
        },
      );
    }

    if (result?.permalink) {
      lastPermalink = lastPermalink || result.permalink;
      const head = await yoastHeadByUrl(result.permalink);
      if (head) {
        const data = extractFromHeadHtml(result.permalink, head.head);
        return await respondWithPayload(
          key,
          {
            ok: true,
            source: head.source,
            data,
          },
          {
            slug: slugOrNull ?? slugFromUrl(result.permalink),
            url: result.permalink,
            canonical: data.canonical ?? result.permalink,
            path: slugPath ?? pathFromUrl(result.permalink),
          },
        );
      }
    }

    const fallback = await respondWithFallback(key, {
      slug: slugOrNull,
      url: lastPermalink,
      canonical: lastPermalink,
      path: slugPath ?? pathFromUrl(lastPermalink),
    });
    if (fallback) return fallback;

    return NextResponse.json(
      { ok: false, error: "Yoast meta not available for the requested item" },
      { status: 404 },
    );
  } catch (e: any) {
    const fallback = await respondWithFallback(key, {
      slug: slugOrNull,
      url: lastPermalink,
      canonical: lastPermalink,
      path: slugPath ?? pathFromUrl(lastPermalink),
    });
    if (fallback) return fallback;

    return NextResponse.json(
      { ok: false, error: e?.message || String(e) },
      { status: 500 },
    );
  }
}
