import { NextRequest, NextResponse } from "next/server";

import { wooCommerce } from "../../../../client/lib/woocommerce";
import { fetchSupabaseProducts } from "../../../../lib/supabase-products";

export const dynamic = "force-dynamic";

async function fetchAllWooProducts(
  perPage: number,
  maxPages: number,
  category: string | null,
) {
  const products: any[] = [];
  for (let page = 1; page <= maxPages; page += 1) {
    const endpoint = `/products?per_page=${perPage}&page=${page}${
      category ? `&category=${encodeURIComponent(category)}` : ""
    }`;
    let batch: any[] | null = null;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        batch = await wooCommerce.makeRequest(endpoint);
        break;
      } catch (error: any) {
        const message = String(error?.message ?? "");
        const shouldRetry =
          message.includes("500") ||
          message.includes("502") ||
          message.includes("503") ||
          message.includes("504");
        if (!shouldRetry || attempt === 2) throw error;
        await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
      }
    }
    if (!Array.isArray(batch) || batch.length === 0) break;
    products.push(...batch);
    if (batch.length < perPage) break;
  }

  if (products.length === 0) {
    try {
      const one = await wooCommerce.makeRequest(
        `/products?per_page=${perPage}`,
      );
      if (Array.isArray(one) && one.length) products.push(...one);
    } catch {
      // ignore
    }
  }

  return products;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const perPage = Math.min(Number.parseInt(searchParams.get("per_page") ?? "100", 10), 100);
  const maxPages = Math.min(Number.parseInt(searchParams.get("max_pages") ?? "200", 10), 500);
  const category = searchParams.get("category");
  const combinedLimit = Math.min(perPage * maxPages, 1000);

  try {
    const { data } = await fetchSupabaseProducts({
      limit: combinedLimit,
      page: 1,
      category,
    });

    return NextResponse.json({
      success: true,
      source: "supabase",
      count: data.length,
      products: data,
      message: `Found ${data.length} products from Supabase`,
    });
  } catch (error) {
    console.error("Supabase products/all fetch error:", error);
  }

  try {
    const products = await fetchAllWooProducts(perPage, maxPages, category);
    return NextResponse.json({
      success: true,
      source: "woocommerce",
      count: products.length,
      products,
      message: `Found ${products.length} products from WooCommerce (fallback)`,
      isWooFallback: true,
    });
  } catch (error) {
    console.error("Products all fallback error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        products: [],
        message: "Failed to load products",
      },
      { status: 200 },
    );
  }
}
