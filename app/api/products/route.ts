import { NextRequest, NextResponse } from "next/server";

import { wooCommerce } from "../../../client/lib/woocommerce";
import {
  fetchSupabaseProducts,
  SupabaseProductListItem,
} from "../../../lib/supabase-products";

export const dynamic = "force-dynamic";

type CacheSource = "supabase" | "woocommerce" | "demo";

type CacheEntry = {
  data: any[];
  ts: number;
  source: CacheSource;
};

const CACHE = new Map<string, CacheEntry>();
const STALE_MS = 1000 * 60 * 3; // 3 minutes
const REVALIDATE_MS = 1000 * 60 * 10;

function cacheKey(limit: number, page: number, category: string | null) {
  return `limit:${limit}|page:${page}|category:${category ?? "all"}`;
}

async function fetchWooProducts(
  limit: number,
  category: string | null,
  page: number,
) {
  const query = `/products?per_page=${limit}${
    category ? `&category=${encodeURIComponent(category)}` : ""
  }&page=${page}`;
  const timeoutPromise = new Promise((_, reject) => {
    const timer = setTimeout(() => {
      clearTimeout(timer as unknown as number);
      reject(new Error("API_TIMEOUT"));
    }, 7000);
  });
  const result = await Promise.race([
    wooCommerce.makeRequest(query),
    timeoutPromise,
  ]);
  return Array.isArray(result) ? result : [];
}

export async function GET(request: NextRequest) {
  const now = Date.now();
  const searchParams = request.nextUrl.searchParams;
  const limit = Math.min(
    Number.parseInt(searchParams.get("limit") ?? "50", 10),
    100,
  );
  const category = searchParams.get("category");
  const page = Math.max(
    Number.parseInt(searchParams.get("page") ?? "1", 10),
    1,
  );
  const key = cacheKey(limit, page, category);

  const cached = CACHE.get(key);
  if (cached) {
    const age = now - cached.ts;
    if (age < STALE_MS) {
      return NextResponse.json({
        success: true,
        source: cached.source,
        count: cached.data.length,
        products: cached.data,
        message: `Found ${cached.data.length} products (${cached.source} cache)`,
      });
    }
    if (age > REVALIDATE_MS) {
      CACHE.delete(key);
    }
  }

  try {
    const { data } = await fetchSupabaseProducts({ limit, page, category });
    const products: SupabaseProductListItem[] = data;
    CACHE.set(key, { data: products, ts: now, source: "supabase" });
    return NextResponse.json({
      success: true,
      source: "supabase",
      count: products.length,
      products,
      message: `Found ${products.length} products from Supabase`,
    });
  } catch (error) {
    console.error("Supabase products fetch error:", error);
  }

  try {
    const products = await fetchWooProducts(limit, category, page);
    CACHE.set(key, { data: products, ts: now, source: "woocommerce" });
    return NextResponse.json({
      success: true,
      source: "woocommerce",
      count: products.length,
      products,
      message: `Found ${products.length} products (WooCommerce fallback)`,
      isWooFallback: true,
    });
  } catch (error) {
    console.error("Products API WooCommerce fallback error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    if (cached) {
      return NextResponse.json({
        success: true,
        source: cached.source,
        count: cached.data.length,
        products: cached.data,
        message: `Serving ${cached.source} cache after fallback error`,
      });
    }

    if (
      errorMessage.includes("API_TIMEOUT") ||
      errorMessage.includes("Failed to fetch")
    ) {
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          message: "Upstream product API unreachable",
        },
        { status: 504 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        message: "Failed to fetch products",
      },
      { status: 200 },
    );
  }
}
