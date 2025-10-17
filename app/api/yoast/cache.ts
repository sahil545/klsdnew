export const TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

export type CacheEntry = { expires: number; data: any };

// Singleton in-memory cache (per runtime instance)
export const yoastCache = new Map<string, CacheEntry>();

export function makeKey(params: URLSearchParams) {
  const type = (params.get("type") || "").toLowerCase();
  const slug = (params.get("slug") || "").trim();
  const url = (params.get("url") || "").trim();
  return url ? `url:${url}` : `${type}:${slug}`;
}

export function getCache(key: string) {
  const hit = yoastCache.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expires) {
    yoastCache.delete(key);
    return null;
  }
  return hit.data;
}

export function setCache(key: string, data: any, ttlMs = TTL_MS) {
  yoastCache.set(key, { expires: Date.now() + ttlMs, data });
}

export function clearCache(key?: string) {
  if (key) return yoastCache.delete(key);
  yoastCache.clear();
  return true;
}
