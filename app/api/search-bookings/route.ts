import { NextRequest, NextResponse } from "next/server";

import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import type { SupabaseOrderRow } from "../../../lib/supabase-orders";

export const dynamic = "force-dynamic";

const DEFAULT_LIMIT = 40;
const FAST_LIMIT = 20;

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  try {
    const searchParams = request.nextUrl.searchParams;
    const queryParam = searchParams.get("q")?.trim();
    const fastMode = searchParams.get("fast") === "true";

    if (!queryParam || queryParam.length < 2) {
      return NextResponse.json({
        success: true,
        results: [],
        message: "Please enter at least 2 characters to search",
      });
    }

    const supabase = supabaseAdmin();
    const searchPattern = buildSearchPattern(queryParam);
    const numericQuery = parseNumeric(queryParam);

    const orFilters = buildOrFilters(searchPattern, numericQuery);

    const max = fastMode ? FAST_LIMIT : DEFAULT_LIMIT;

    const { data, error } = await supabase
      .from("orders_v")
      .select("*")
      .or(orFilters.join(","))
      .limit(max)
      .order("created_at", { ascending: false })
      .order("order_id", { ascending: false });

    if (error) {
      throw new Error(`Supabase search failed: ${error.message}`);
    }

    const orders = Array.isArray(data) ? data : [];
    const results = orders.map((order) => mapOrderToSearchResult(order, queryParam));

    return NextResponse.json({
      success: true,
      results,
      total_found: results.length,
      total_searched: orders.length,
      query: queryParam,
      elapsed_ms: Date.now() - startTime,
      message:
        results.length === 0
          ? `No results found for "${queryParam}"`
          : `Found ${results.length} result${results.length === 1 ? "" : "s"} for "${queryParam}"`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        success: false,
        error: message,
        results: [],
        message: "Failed to search bookings",
      },
      { status: 500 },
    );
  }
}

function buildSearchPattern(query: string): string {
  const escaped = query.replace(/[%_]/g, (match) => `\\${match}`);
  return `%${escaped}%`;
}

function parseNumeric(value: string): number | null {
  const numeric = Number.parseInt(value, 10);
  return Number.isFinite(numeric) ? numeric : null;
}

function buildOrFilters(pattern: string, numeric: number | null): string[] {
  const filters = [
    `customer_email.ilike.${pattern}`,
    `customer_first_name.ilike.${pattern}`,
    `customer_last_name.ilike.${pattern}`,
    `customer_phone.ilike.${pattern}`,
    `number.ilike.${pattern}`,
  ];

  if (typeof numeric === "number") {
    filters.push(`order_id.eq.${numeric}`);
  }

  return filters;
}

function mapOrderToSearchResult(order: SupabaseOrderRow, query: string) {
  return {
    id: order.order_id,
    number: order.number,
    status: order.status,
    date_created: order.created_at,
    total: order.total,
    currency: order.currency,
    customer_name: buildCustomerName(order),
    customer_email: order.customer_email,
    customer_phone: order.customer_phone,
    booking_details: buildBookingDetails(order),
    is_booking: isBookingOrder(order),
    search_relevance: calculateSearchRelevance(order, query),
    raw_order: order,
  };
}

function buildCustomerName(order: SupabaseOrderRow): string {
  const first = order.customer_first_name || "";
  const last = order.customer_last_name || "";
  return `${first} ${last}`.trim();
}

function buildBookingDetails(order: SupabaseOrderRow) {
  const lineItems = Array.isArray(order.line_items) ? order.line_items : [];
  return lineItems.map((item) => {
    if (!item || typeof item !== "object") {
      return { service_name: String(item ?? ""), quantity: null, total: null, booking_metadata: [] };
    }

    const record = item as Record<string, unknown>;
    const meta = Array.isArray(record.meta_data)
      ? (record.meta_data as Array<Record<string, unknown>>)
      : [];

    return {
      service_name: typeof record.name === "string" ? record.name : null,
      quantity: typeof record.quantity === "number" ? record.quantity : null,
      total: typeof record.total === "string" ? record.total : null,
      booking_metadata: meta
        .filter((entry) => Boolean(entry?.key))
        .map((entry) => ({
          key: typeof entry.key === "string" ? entry.key : String(entry.key ?? ""),
          value: entry.value ?? null,
        })),
    };
  });
}

function isBookingOrder(order: SupabaseOrderRow): boolean {
  const keywords = [
    "tour",
    "diving",
    "snorkeling",
    "booking",
    "scuba",
    "certification",
    "charter",
    "trip",
    "excursion",
  ];

  const items = Array.isArray(order.line_items) ? order.line_items : [];
  return items.some((item) => {
    if (!item || typeof item !== "object") return false;
    const name = (item as Record<string, unknown>).name;
    if (typeof name !== "string") return false;
    const lower = name.toLowerCase();
    return keywords.some((keyword) => lower.includes(keyword));
  });
}

function calculateSearchRelevance(order: SupabaseOrderRow, query: string): number {
  const lowerQuery = query.toLowerCase();
  let score = 0;

  const name = buildCustomerName(order).toLowerCase();
  const email = (order.customer_email || "").toLowerCase();
  const phone = (order.customer_phone || "").toLowerCase();
  const orderNumber = (order.number || "").toLowerCase();
  const orderId = String(order.order_id || "").toLowerCase();

  score += matchScore(name, lowerQuery, 120, 60, 25);
  score += matchScore(email, lowerQuery, 120, 60, 25);
  score += matchScore(phone, lowerQuery, 80, 40, 20);
  score += matchScore(orderNumber, lowerQuery, 120, 60, 20);
  score += matchScore(orderId, lowerQuery, 100, 50, 15);

  if (isBookingOrder(order)) {
    score += 25;
  }

  return score;
}

function matchScore(target: string, query: string, exact: number, prefix: number, contains: number): number {
  if (!target) return 0;
  if (target === query) return exact;
  if (target.startsWith(query)) return prefix;
  if (target.includes(query)) return contains;
  return 0;
}
