const WP_BASE = (process.env.NEXT_PUBLIC_WORDPRESS_URL || "").replace(
  /\/$/,
  "",
);

export type WPMediaSizes = Record<
  string,
  { source_url: string; width: number; height: number }
>;
export type WPMediaDetails = {
  width?: number;
  height?: number;
  sizes?: WPMediaSizes;
};
export type WPMediaItem = {
  id: number;
  source_url: string;
  guid?: { rendered?: string };
  media_type?: string;
  mime_type?: string;
  slug?: string;
  title?: { rendered?: string };
  alt_text?: string;
  media_details?: WPMediaDetails;
};

export type WPResolvedMedia = {
  url: string;
  alt: string;
  title: string;
  width?: number;
  height?: number;
  sizes?: WPMediaSizes;
};

const CACHE_TTL_SUCCESS_MS = 1000 * 60 * 30; // 30 minutes
const CACHE_TTL_FAILURE_MS = 1000 * 60 * 5; // 5 minutes

type CacheEntry<T> = {
  value: T | null;
  expiresAt: number;
};

const urlCache = new Map<string, CacheEntry<string>>();
const mediaCache = new Map<string, CacheEntry<WPResolvedMedia>>();

function getCachedValue<T>(cache: Map<string, CacheEntry<T>>, key: string) {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return undefined;
  }
  return entry.value;
}

function setCachedValue<T>(cache: Map<string, CacheEntry<T>>, key: string, value: T | null) {
  const ttl = value ? CACHE_TTL_SUCCESS_MS : CACHE_TTL_FAILURE_MS;
  cache.set(key, { value, expiresAt: Date.now() + ttl });
}

async function fetchMedia(query: string): Promise<WPMediaItem[]> {
  if (!WP_BASE) return [];
  const url = `${WP_BASE}/wp-json/wp/v2/media?per_page=50&search=${encodeURIComponent(query)}`;

  let res: Response;
  try {
    res = await fetch(url, { headers: { Accept: "application/json" } });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[wp-media] Failed to reach WordPress media endpoint", {
        query,
        error,
      });
    }
    return [];
  }

  if (!res.ok) return [];
  const ct = res.headers.get("content-type") || "";
  if (!/application\/json/i.test(ct)) {
    // WordPress or an upstream might return HTML with 200. Be defensive.
    return [];
  }
  try {
    const data = (await res.json()) as unknown;
    return Array.isArray(data) ? (data as WPMediaItem[]) : [];
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[wp-media] Failed to parse WordPress media payload", {
        query,
        error,
      });
    }
    return [];
  }
}

function chooseItem(
  items: WPMediaItem[],
  filename: string,
): WPMediaItem | null {
  const lower = filename.toLowerCase();
  for (const it of items) {
    const src = it.source_url?.toLowerCase() || "";
    const guid = it.guid?.rendered?.toLowerCase() || "";
    if (src.endsWith(lower) || guid.endsWith(lower)) return it;
  }
  const base = lower.replace(/\.[a-z0-9]+$/, "");
  for (const it of items) {
    const slug = it.slug?.toLowerCase() || "";
    if (slug === base) return it;
  }
  for (const it of items) {
    const src = it.source_url?.toLowerCase() || "";
    if (src.includes(base)) return it;
  }
  return null;
}

export async function getWpImageUrlByFilename(
  filename: string,
): Promise<string | null> {
  const key = filename.trim();
  if (!key) return null;

  const cached = getCachedValue(urlCache, key);
  if (cached !== undefined) return cached;

  let items = await fetchMedia(key);
  let picked = chooseItem(items, key);

  if (!picked) {
    const base = key.replace(/\.[a-z0-9]+$/i, "");
    items = await fetchMedia(base);
    picked = chooseItem(items, key);
  }

  const url = picked?.source_url || null;
  setCachedValue(urlCache, key, url);
  return url;
}

export async function getWpMediaByFilename(
  filename: string,
): Promise<WPResolvedMedia | null> {
  const key = filename.trim();
  if (!key) return null;

  const cached = getCachedValue(mediaCache, key);
  if (cached !== undefined) return cached;

  let items = await fetchMedia(key);
  let picked = chooseItem(items, key);

  if (!picked) {
    const base = key.replace(/\.[a-z0-9]+$/i, "");
    items = await fetchMedia(base);
    picked = chooseItem(items, key);
  }

  const resolved: WPResolvedMedia | null = picked
    ? {
        url: picked.source_url,
        alt: picked.alt_text || picked.title?.rendered || "",
        title: picked.title?.rendered || "",
        width: picked.media_details?.width,
        height: picked.media_details?.height,
        sizes: picked.media_details?.sizes,
      }
    : null;

  setCachedValue(mediaCache, key, resolved);
  return resolved;
}
