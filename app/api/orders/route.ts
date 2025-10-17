import { NextRequest, NextResponse } from "next/server";

import {
  fetchSupabaseOrders,
  type FetchSupabaseOrdersOptions,
  type SupabaseOrderRow,
} from "../../../lib/supabase-orders";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const options = buildFetchOptions(searchParams);
    const orders = await fetchSupabaseOrders(options);

    return NextResponse.json(
      {
        success: true,
        count: orders.length,
        orders: orders.map(formatOrderResponse),
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

function buildFetchOptions(params: URLSearchParams): FetchSupabaseOrdersOptions {
  const limit = clampLimit(params.get("limit"));
  const status = parseStringList(params.get("status"));
  const since = parseDate(params.get("since"));
  const orderId = parseInteger(params.get("orderId"));
  const customerId = parseInteger(params.get("customerId"));
  const customerEmail = sanitizeString(params.get("customerEmail"));
  const fromCreatedAt = parseDate(params.get("fromCreated"));
  const toCreatedAt = parseDate(params.get("toCreated"));

  const options: FetchSupabaseOrdersOptions = {};
  if (limit !== null) options.limit = limit;
  if (status?.length) options.status = status;
  if (since) options.since = since;
  if (typeof orderId === "number") options.orderId = orderId;
  if (typeof customerId === "number") options.customerId = customerId;
  if (customerEmail) options.customerEmail = customerEmail;
  if (fromCreatedAt) options.fromCreatedAt = fromCreatedAt;
  if (toCreatedAt) options.toCreatedAt = toCreatedAt;

  return options;
}

function formatOrderResponse(row: SupabaseOrderRow) {
  return {
    id: row.id,
    order_id: row.order_id,
    number: row.number,
    status: row.status,
    currency: row.currency,
    total: row.total,
    subtotal: row.subtotal,
    discount_total: row.discount_total,
    total_tax: row.total_tax,
    shipping_total: row.shipping_total,
    payment_method: row.payment_method,
    payment_method_title: row.payment_method_title,
    customer_id: row.customer_id,
    customer_email: row.customer_email,
    customer_first_name: row.customer_first_name,
    customer_last_name: row.customer_last_name,
    customer_phone: row.customer_phone,
    billing: row.billing,
    shipping: row.shipping,
    line_items: row.line_items,
    fee_lines: row.fee_lines,
    coupon_lines: row.coupon_lines,
    meta_data: row.meta_data,
    created_at: row.created_at,
    modified_at: row.modified_at,
    date_paid: row.date_paid,
    date_completed: row.date_completed,
    source: row.source,
    raw_payload: row.raw_payload,
    inserted_at: row.inserted_at,
    updated_at: row.updated_at,
    line_item_count: row.line_item_count,
    primary_product_id: row.primary_product_id,
    primary_product_name: row.primary_product_name,
  };
}

function summarizeFilters(options: FetchSupabaseOrdersOptions) {
  return {
    limit: options.limit ?? null,
    status: options.status ?? null,
    orderId: options.orderId ?? null,
    customerId: options.customerId ?? null,
    customerEmail: options.customerEmail ?? null,
    since: options.since?.toISOString() ?? null,
    fromCreatedAt: options.fromCreatedAt?.toISOString() ?? null,
    toCreatedAt: options.toCreatedAt?.toISOString() ?? null,
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

function sanitizeString(value: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
