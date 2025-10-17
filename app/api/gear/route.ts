import { NextRequest, NextResponse } from "next/server";
import { wooCommerce } from "../../../client/lib/woocommerce";
import { convertWooToGearItem } from "../../../shared/gear";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Simple per-key cache: key = `${cats}|${limit}|${featured}`
const CACHE = new Map<string, { items: any[]; ts: number }>();
let FAIL_COUNT = 0;
let BREAKER_UNTIL = 0;

const STALE_MS = 1000 * 60 * 3; // 3 minutes
const REVALIDATE_MS = 1000 * 60 * 10; // 10 minutes
const BREAKER_COOLDOWN_MS = 1000 * 60 * 1; // 1 minute

const WC_FIELDS = [
  "id",
  "name",
  "slug",
  "type",
  "price",
  "regular_price",
  "sale_price",
  "price_html",
  "short_description",
  "description",
  "stock_status",
  "in_stock",
  "permalink",
  "categories",
  "images",
  "average_rating",
  "rating_count",
  "attributes",
  "featured",
  "on_sale",
  "meta_data",
].join(",");

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const to = setTimeout(() => reject(new Error("API_TIMEOUT")), ms);
    p.then((v) => {
      clearTimeout(to);
      resolve(v);
    }).catch((e) => {
      clearTimeout(to);
      reject(e);
    });
  });
}

async function fetchProductsByCategories(catIds: number[], pageSize: number) {
  const TIMEOUT_MS = 2500;
  const MAX_ATTEMPTS = 3;

  // Woo allows category filter by ID (term id), comma-separated returns ANY of those categories
  const categoryParam = catIds.filter(Boolean).join(",");
  const endpoint = `/products?per_page=${pageSize}&status=publish${categoryParam ? `&category=${categoryParam}` : ""}&_fields=${WC_FIELDS}`;

  let attempt = 0;
  let delay = 250;
  while (attempt < MAX_ATTEMPTS) {
    attempt++;
    try {
      const res = await withTimeout(wooCommerce.makeRequest(endpoint), TIMEOUT_MS);
      if (Array.isArray(res)) return res;
      // Unexpected shape; bail
      return [];
    } catch (e) {
      if (attempt >= MAX_ATTEMPTS) break;
      await new Promise((r) => setTimeout(r, delay));
      delay *= 2;
    }
  }
  throw new Error("UPSTREAM_TIMEOUT");
}

export async function GET(req: NextRequest) {
  const now = Date.now();
  try {
    const { searchParams } = new URL(req.url);

    // Controls
    const reset = searchParams.get("reset");
    const breaker = searchParams.get("breaker");
    if (reset === "1") {
      CACHE.clear();
      FAIL_COUNT = 0;
      BREAKER_UNTIL = 0;
      return NextResponse.json({ reset: true, timestamp: now }, { status: 200 });
    }
    if (breaker === "open") {
      BREAKER_UNTIL = Date.now() + BREAKER_COOLDOWN_MS;
      return NextResponse.json({ breaker: "opened", until: BREAKER_UNTIL }, { status: 200 });
    }

    const limit = parseInt(searchParams.get("limit") || "6", 10);
    const pageSize = Math.min(Math.max(limit, 24), 50);
    const featuredOnly = searchParams.get("featured") === "1";
    const catsParam = searchParams.get("category") || searchParams.get("categories") || "";
    const catIds = catsParam
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => Number.isFinite(n) && n > 0);

    const key = `${catIds.join("+")}|${limit}|${featuredOnly ? 1 : 0}`;

    // Circuit breaker: serve stale
    if (now < BREAKER_UNTIL && CACHE.has(key)) {
      const c = CACHE.get(key)!;
      return NextResponse.json({ items: c.items, count: c.items.length, cached: true, breaker: true }, { status: 200 });
    }

    // Serve fresh-enough cache and revalidate in background
    const cached = CACHE.get(key);
    if (cached) {
      const age = now - cached.ts;
      if (age < STALE_MS && cached.items.length >= Math.min(limit, cached.items.length)) {
        if (age > REVALIDATE_MS) {
          void (async () => {
            try {
              const products = await fetchProductsByCategories(catIds, pageSize);
              let items = products.map(convertWooToGearItem);
              if (featuredOnly) items = items.filter((i: any) => i.featured || i.featured_product);
              if (items.length > 0) CACHE.set(key, { items, ts: Date.now() });
            } catch {}
          })();
        }
        return NextResponse.json({ items: cached.items.slice(0, limit), count: cached.items.length, cached: true, normalized: true }, { status: 200 });
      }
    }

    // Fetch upstream
    const products = await fetchProductsByCategories(catIds, pageSize);
    let items = products.map(convertWooToGearItem);
    if (featuredOnly) items = items.filter((i: any) => i.featured || i.featured_product);
    if (items.length === 0 && cached) {
      return NextResponse.json({ items: cached.items.slice(0, limit), count: cached.items.length, cached: true, normalized: true }, { status: 200 });
    }

    if (items.length > 0) {
      CACHE.set(key, { items, ts: now });
      FAIL_COUNT = 0;
    }

    return NextResponse.json({ items: items.slice(0, limit), count: items.length, normalized: true }, { status: 200 });
  } catch (error: any) {
    FAIL_COUNT++;
    BREAKER_UNTIL = Date.now() + BREAKER_COOLDOWN_MS;
    // Serve any cached entries for any key (fallback best-effort)
    const latest = Array.from(CACHE.values()).sort((a, b) => b.ts - a.ts)[0];
    if (latest) {
      return NextResponse.json({ items: latest.items, count: latest.items.length, cached: true, normalized: true }, { status: 200 });
    }
    const message = error?.message || "Failed to load gear";
    return NextResponse.json({ error: message }, { status: message.includes("TIMEOUT") ? 504 : 500 });
  }
}
