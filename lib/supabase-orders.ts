import { supabaseAdmin } from "./supabaseAdmin";

export type SupabaseOrderRow = {
  id: string;
  order_id: number;
  number: string | null;
  status: string;
  currency: string | null;
  total: string | null;
  subtotal: string | null;
  discount_total: string | null;
  total_tax: string | null;
  shipping_total: string | null;
  payment_method: string | null;
  payment_method_title: string | null;
  customer_id: number | null;
  customer_email: string | null;
  customer_first_name: string | null;
  customer_last_name: string | null;
  customer_phone: string | null;
  billing: Record<string, unknown> | null;
  shipping: Record<string, unknown> | null;
  line_items: unknown[];
  fee_lines: unknown[];
  coupon_lines: unknown[];
  meta_data: Record<string, unknown> | null;
  created_at: string | null;
  modified_at: string | null;
  date_paid: string | null;
  date_completed: string | null;
  source: string;
  raw_payload: Record<string, unknown>;
  inserted_at: string;
  updated_at: string;
  line_item_count: number;
  primary_product_id: number | null;
  primary_product_name: string | null;
};

export type FetchSupabaseOrdersOptions = {
  limit?: number;
  status?: string[];
  since?: Date;
  customerEmail?: string;
  customerId?: number;
  orderId?: number;
  fromCreatedAt?: Date;
  toCreatedAt?: Date;
};

export async function fetchSupabaseOrders(
  options: FetchSupabaseOrdersOptions = {},
): Promise<SupabaseOrderRow[]> {
  const supabase = supabaseAdmin();
  let query = supabase.from("orders_v").select("*");

  if (options.status?.length) {
    query = query.in("status", options.status);
  }

  if (typeof options.customerId === "number") {
    query = query.eq("customer_id", options.customerId);
  }

  if (options.customerEmail) {
    query = query.ilike("customer_email", options.customerEmail.trim());
  }

  if (typeof options.orderId === "number") {
    query = query.eq("order_id", options.orderId);
  }

  if (options.since) {
    query = query.gte("updated_at", options.since.toISOString());
  }

  if (options.fromCreatedAt) {
    query = query.gte("created_at", options.fromCreatedAt.toISOString());
  }

  if (options.toCreatedAt) {
    query = query.lt("created_at", options.toCreatedAt.toISOString());
  }

  query = query.order("created_at", { ascending: false }).order("order_id", { ascending: false });

  const limit = options.limit && Number.isFinite(options.limit) ? Math.max(1, Math.min(1000, options.limit)) : null;
  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Failed to fetch Supabase orders: ${error.message}`);
  }

  return Array.isArray(data) ? data : [];
}

export type UpsertSupabaseOrderInput = {
  order_id: number;
  number?: string | null;
  status: string;
  currency?: string | null;
  total?: string | number | null;
  subtotal?: string | number | null;
  discount_total?: string | number | null;
  total_tax?: string | number | null;
  shipping_total?: string | number | null;
  payment_method?: string | null;
  payment_method_title?: string | null;
  customer_id?: number | null;
  customer_email?: string | null;
  customer_first_name?: string | null;
  customer_last_name?: string | null;
  customer_phone?: string | null;
  billing?: Record<string, unknown> | null;
  shipping?: Record<string, unknown> | null;
  line_items?: unknown[] | null;
  fee_lines?: unknown[] | null;
  coupon_lines?: unknown[] | null;
  meta_data?: Record<string, unknown> | null;
  created_at?: string | number | Date | null;
  modified_at?: string | number | Date | null;
  date_paid?: string | number | Date | null;
  date_completed?: string | number | Date | null;
  source?: string | null;
  raw_payload?: Record<string, unknown> | null;
};

export type UpsertSupabaseOrderResult = {
  order_id: number;
  id: string;
};

export async function upsertSupabaseOrder(
  input: UpsertSupabaseOrderInput,
): Promise<UpsertSupabaseOrderResult> {
  if (!input || typeof input.order_id !== "number" || !Number.isFinite(input.order_id)) {
    throw new Error("order_id is required to upsert a Supabase order");
  }

  if (!input.status || typeof input.status !== "string") {
    throw new Error("status is required to upsert a Supabase order");
  }

  const payload = normalizeOrderUpsertInput(input);

  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("orders")
    .upsert(payload, { onConflict: "order_id", ignoreDuplicates: false })
    .select("id, order_id")
    .single();

  if (error) {
    throw new Error(`Failed to upsert Supabase order: ${error.message}`);
  }

  if (!data) {
    throw new Error("Supabase order upsert returned no data");
  }

  return { order_id: data.order_id, id: data.id };
}

export async function deleteSupabaseOrderById(orderId: number): Promise<number> {
  if (!Number.isFinite(orderId)) {
    throw new Error("orderId is required to delete a Supabase order");
  }

  const supabase = supabaseAdmin();
  const { error, count } = await supabase
    .from("orders")
    .delete({ count: "exact" })
    .eq("order_id", orderId);

  if (error) {
    throw new Error(`Failed to delete Supabase order: ${error.message}`);
  }

  return typeof count === "number" ? count : 0;
}

export type WooOrderPayload = Record<string, unknown> & { id?: number | string };

export function mapWooOrderToSupabaseInput(order: WooOrderPayload): UpsertSupabaseOrderInput {
  if (!order || typeof order !== "object") {
    throw new Error("Invalid WooCommerce order payload");
  }

  const orderId = parseInteger(order.id);
  if (typeof orderId !== "number") {
    throw new Error("WooCommerce order payload is missing id");
  }

  const status = typeof order.status === "string" && order.status.length > 0 ? order.status : "unknown";

  const billing = extractRecord(order.billing);
  const shipping = extractRecord(order.shipping);

  return {
    order_id: orderId,
    number: typeof order.number === "string" ? order.number : null,
    status,
    currency: typeof order.currency === "string" ? order.currency : null,
    total: extractCurrencyInput(order.total, order.total_price),
    subtotal: extractCurrencyInput(order.subtotal, order.total),
    discount_total: extractCurrencyInput(order.discount_total),
    total_tax: extractCurrencyInput(order.total_tax),
    shipping_total: extractCurrencyInput(order.shipping_total),
    payment_method: typeof order.payment_method === "string" ? order.payment_method : null,
    payment_method_title: typeof order.payment_method_title === "string" ? order.payment_method_title : null,
    customer_id: parseInteger(order.customer_id),
    customer_email: coerceString(order.customer_email) ?? coerceString(billing?.email),
    customer_first_name: coerceString(billing?.first_name),
    customer_last_name: coerceString(billing?.last_name),
    customer_phone: coerceString(billing?.phone),
    billing,
    shipping,
    line_items: extractArray(order.line_items),
    fee_lines: extractArray(order.fee_lines),
    coupon_lines: extractArray(order.coupon_lines),
    meta_data: extractRecord(order.meta_data),
    created_at: toIsoTimestamp(order.date_created ?? order.date_created_gmt),
    modified_at: toIsoTimestamp(order.date_modified ?? order.date_modified_gmt),
    date_paid: toIsoTimestamp(order.date_paid_gmt ?? order.date_paid),
    date_completed: toIsoTimestamp(order.date_completed_gmt ?? order.date_completed),
    source: "woocommerce",
    raw_payload: normalizeRecord(order as Record<string, unknown>) ?? {},
  };
}

function normalizeOrderUpsertInput(input: UpsertSupabaseOrderInput): Record<string, unknown> {
  return {
    order_id: input.order_id,
    number: coerceString(input.number),
    status: input.status,
    currency: coerceString(input.currency),
    total: coerceCurrency(input.total),
    subtotal: coerceCurrency(input.subtotal),
    discount_total: coerceCurrency(input.discount_total),
    total_tax: coerceCurrency(input.total_tax),
    shipping_total: coerceCurrency(input.shipping_total),
    payment_method: coerceString(input.payment_method),
    payment_method_title: coerceString(input.payment_method_title),
    customer_id: coerceNullableNumber(input.customer_id),
    customer_email: coerceString(input.customer_email),
    customer_first_name: coerceString(input.customer_first_name),
    customer_last_name: coerceString(input.customer_last_name),
    customer_phone: coerceString(input.customer_phone),
    billing: normalizeRecord(input.billing ?? null),
    shipping: normalizeRecord(input.shipping ?? null),
    line_items: normalizeArray(input.line_items),
    fee_lines: normalizeArray(input.fee_lines),
    coupon_lines: normalizeArray(input.coupon_lines),
    meta_data: normalizeRecord(input.meta_data ?? null),
    created_at: toIsoTimestamp(input.created_at),
    modified_at: toIsoTimestamp(input.modified_at),
    date_paid: toIsoTimestamp(input.date_paid),
    date_completed: toIsoTimestamp(input.date_completed),
    source: coerceString(input.source) ?? "woocommerce",
    raw_payload: normalizeRecord(input.raw_payload ?? null) ?? {},
    updated_at: new Date().toISOString(),
  };
}

function coerceCurrency(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.round(value * 100) / 100;
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const normalized = value.replace(/[^0-9.\-]/g, "");
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? Math.round(parsed * 100) / 100 : null;
  }
  return null;
}

function coerceString(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  return null;
}

function parseInteger(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value);
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function coerceNullableNumber(value: unknown): number | null {
  const parsed = parseInteger(value);
  return typeof parsed === "number" ? parsed : null;
}

function toIsoTimestamp(value: unknown): string | null {
  if (value === null || value === undefined) return null;

  if (typeof value === "number" && Number.isFinite(value)) {
    if (value > 1_000_000_000_000) {
      return new Date(value).toISOString();
    }
    return new Date(value * 1000).toISOString();
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const trimmed = value.trim();
    const numeric = Number(trimmed);
    if (Number.isFinite(numeric)) {
      return toIsoTimestamp(numeric);
    }
    const parsed = Date.parse(trimmed);
    return Number.isFinite(parsed) ? new Date(parsed).toISOString() : null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return null;
}

function extractRecord(value: unknown): Record<string, unknown> | null {
  if (Array.isArray(value)) {
    const entries = value
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const key = coerceString((item as Record<string, unknown>).key);
        const val = (item as Record<string, unknown>).value;
        if (!key) return null;
        return [key, val] as const;
      })
      .filter((entry): entry is readonly [string, unknown] => Array.isArray(entry));
    if (!entries.length) return null;
    return Object.fromEntries(entries);
  }

  if (value && typeof value === "object") {
    return value as Record<string, unknown>;
  }

  return null;
}

function extractArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>);
  }
  return [];
}

function extractCurrencyInput(primary: unknown, fallback?: unknown): string | number | null {
  const candidate = primary ?? fallback ?? null;
  if (typeof candidate === "number" && Number.isFinite(candidate)) return candidate;
  if (typeof candidate === "string") {
    const trimmed = candidate.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  return null;
}

function normalizeArray(value: unknown[] | null | undefined): unknown[] {
  if (!value) return [];
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return [];
  }
}

function normalizeRecord(value: Record<string, unknown> | null): Record<string, unknown> | null {
  if (!value) return null;
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return null;
  }
}
