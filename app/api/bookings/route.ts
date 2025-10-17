import { NextRequest, NextResponse } from "next/server";

import {
  fetchSupabaseBookings,
  type FetchSupabaseBookingsOptions,
  type SupabaseBookingRow,
} from "../../../lib/supabase-bookings";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const options = buildFetchOptions(searchParams);
    const bookings = await fetchSupabaseBookings(options);

    return NextResponse.json(
      {
        success: true,
        count: bookings.length,
        bookings: bookings.map(formatBookingResponse),
        filters: summarizeFilters(options),
      },
      { status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 },
    );
  }
}

function buildFetchOptions(params: URLSearchParams): FetchSupabaseBookingsOptions {
  const limit = clampLimit(params.get("limit"));
  const status = parseStringList(params.get("status"));
  const productId = parseInteger(params.get("productId"));
  const orderId = parseInteger(params.get("orderId"));
  const customerId = parseInteger(params.get("customerId"));
  const since = parseDate(params.get("since"));
  const fromStartAt = parseDate(params.get("fromStart"));
  const toStartAt = parseDate(params.get("toStart"));

  const options: FetchSupabaseBookingsOptions = {};
  if (limit !== null) options.limit = limit;
  if (since) options.since = since;
  if (status?.length) options.status = status;
  if (typeof productId === "number") options.productId = productId;
  if (typeof orderId === "number") options.orderId = orderId;
  if (typeof customerId === "number") options.customerId = customerId;
  if (fromStartAt) options.fromStartAt = fromStartAt;
  if (toStartAt) options.toStartAt = toStartAt;

  return options;
}

function formatBookingResponse(row: SupabaseBookingRow) {
  return {
    id: row.id,
    booking_id: row.booking_id,
    status: row.status,
    product_id: row.product_id,
    product_slug: row.product_slug,
    product_title: row.product_title,
    resource_id: row.resource_id,
    order_id: row.order_id,
    order_item_id: row.order_item_id,
    parent_id: row.parent_id,
    customer_id: row.customer_id,
    start_at: row.start_at,
    end_at: row.end_at,
    all_day: row.all_day,
    timezone: row.timezone,
    persons: row.persons,
    persons_detail: row.persons_detail,
    cost: row.cost,
    metadata: row.metadata,
    created_at_gmt: row.created_at_gmt,
    modified_at_gmt: row.modified_at_gmt,
    source: row.source,
    raw_payload: row.raw_payload,
    inserted_at: row.inserted_at,
    updated_at: row.updated_at,
  };
}

function summarizeFilters(options: FetchSupabaseBookingsOptions) {
  return {
    limit: options.limit ?? null,
    status: options.status ?? null,
    productId: options.productId ?? null,
    orderId: options.orderId ?? null,
    customerId: options.customerId ?? null,
    since: options.since?.toISOString() ?? null,
    fromStartAt: options.fromStartAt?.toISOString() ?? null,
    toStartAt: options.toStartAt?.toISOString() ?? null,
  };
}

function clampLimit(value: string | null): number | null {
  if (!value) return 10;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return 10;
  return Math.min(100, parsed);
}

function parseInteger(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseDate(value: string | null): Date | null {
  if (!value) return null;
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return null;
  return new Date(parsed);
}

function parseStringList(value: string | null): string[] | null {
  if (!value) return null;
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}
