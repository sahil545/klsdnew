import { supabaseAdmin } from "./supabaseAdmin";

export type SupabaseBookingRow = {
  id: string;
  booking_id: number;
  status: string;
  product_id: number | null;
  product_slug: string | null;
  product_title: string | null;
  resource_id: number | null;
  order_id: number | null;
  order_item_id: number | null;
  parent_id: number | null;
  customer_id: number | null;
  start_at: string | null;
  end_at: string | null;
  all_day: boolean;
  timezone: string | null;
  persons: number | null;
  persons_detail: Record<string, unknown> | null;
  cost: string | null;
  created_at_gmt: string | null;
  modified_at_gmt: string | null;
  metadata: Record<string, unknown> | null;
  source: string;
  raw_payload: Record<string, unknown>;
  inserted_at: string;
  updated_at: string;
};

export type FetchSupabaseBookingsOptions = {
  limit?: number;
  since?: Date;
  status?: string[];
  productId?: number;
  orderId?: number;
  customerId?: number;
  fromStartAt?: Date;
  toStartAt?: Date;
};

export async function fetchSupabaseBookings(
  options: FetchSupabaseBookingsOptions = {},
): Promise<SupabaseBookingRow[]> {
  const supabase = supabaseAdmin();
  let query = supabase.from("booking_v").select("*");

  if (options.status?.length) {
    query = query.in("status", options.status);
  }

  if (typeof options.productId === "number") {
    query = query.eq("product_id", options.productId);
  }

  if (typeof options.orderId === "number") {
    query = query.eq("order_id", options.orderId);
  }

  if (typeof options.customerId === "number") {
    query = query.eq("customer_id", options.customerId);
  }

  if (options.since) {
    query = query.gte("updated_at", options.since.toISOString());
  }

  if (options.fromStartAt) {
    query = query.gte("start_at", options.fromStartAt.toISOString());
  }

  if (options.toStartAt) {
    query = query.lt("start_at", options.toStartAt.toISOString());
  }

  query = query.order("start_at", { ascending: true }).order("booking_id", { ascending: true });

  const limit = options.limit && Number.isFinite(options.limit) ? Math.max(1, Math.min(1000, options.limit)) : null;
  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Failed to fetch Supabase bookings: ${error.message}`);
  }

  return Array.isArray(data) ? data : [];
}

export type UpsertSupabaseBookingInput = {
  booking_id: number;
  status: string;
  product_id?: number | null;
  resource_id?: number | null;
  order_item_id?: number | null;
  parent_id?: number | null;
  customer_id?: number | null;
  start_at?: string | number | Date | null;
  end_at?: string | number | Date | null;
  all_day?: boolean;
  timezone?: string | null;
  persons?: number | null;
  persons_detail?: Record<string, unknown> | null;
  cost?: string | number | null;
  created_at?: string | number | Date | null;
  modified_at?: string | number | Date | null;
  order_id?: number | null;
  product_name?: string | null;
  metadata?: Record<string, unknown> | null;
  source?: string | null;
  raw_payload?: Record<string, unknown> | null;
};

export type UpsertSupabaseBookingResult = {
  booking_id: number;
  id: string;
};

export async function upsertSupabaseBooking(
  input: UpsertSupabaseBookingInput,
): Promise<UpsertSupabaseBookingResult> {
  if (!input || typeof input.booking_id !== "number" || !Number.isFinite(input.booking_id)) {
    throw new Error("booking_id is required to upsert a Supabase booking");
  }

  if (!input.status || typeof input.status !== "string") {
    throw new Error("status is required to upsert a Supabase booking");
  }

  const payload = normalizeBookingUpsertInput(input);

  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("bookings")
    .upsert(payload, { onConflict: "booking_id", ignoreDuplicates: false })
    .select("id, booking_id")
    .single();

  if (error) {
    throw new Error(`Failed to upsert Supabase booking: ${error.message}`);
  }

  if (!data) {
    throw new Error("Supabase upsert succeeded without returning data");
  }

  return { booking_id: data.booking_id, id: data.id };
}

export async function deleteSupabaseBookingById(bookingId: number): Promise<number> {
  if (!Number.isFinite(bookingId)) {
    throw new Error("bookingId is required to delete a Supabase booking");
  }

  const supabase = supabaseAdmin();
  const { error, count } = await supabase
    .from("bookings")
    .delete({ count: "exact" })
    .eq("booking_id", bookingId);

  if (error) {
    throw new Error(`Failed to delete Supabase booking: ${error.message}`);
  }

  return typeof count === "number" ? count : 0;
}

export type WooBookingPayload = Record<string, unknown> & { id?: number | string };

export function mapWooBookingToSupabaseInput(booking: WooBookingPayload): UpsertSupabaseBookingInput {
  if (!booking || typeof booking !== "object") {
    throw new Error("Invalid WooCommerce booking payload");
  }

  const numericBookingId = parseInteger(booking.id);
  if (typeof numericBookingId !== "number") {
    throw new Error("WooCommerce booking payload is missing id");
  }

  const status = typeof booking.status === "string" && booking.status.length > 0 ? booking.status : "unknown";

  return {
    booking_id: numericBookingId,
    status,
    product_id: parseInteger(booking.product_id ?? booking.product),
    resource_id: parseInteger(booking.resource_id),
    order_item_id: parseInteger(booking.order_item_id),
    parent_id: parseInteger(booking.parent_id),
    customer_id: parseInteger(booking.customer_id),
    start_at: toTimestampValue(booking.start),
    end_at: toTimestampValue(booking.end),
    all_day: Boolean(booking.all_day),
    timezone: typeof booking.timezone === "string" && booking.timezone.length > 0
      ? booking.timezone
      : typeof booking.timezone_offset === "string" && booking.timezone_offset.length > 0
        ? booking.timezone_offset
        : null,
    persons: extractPersonCount(booking.persons),
    persons_detail: normalizePersonsDetail(booking.persons),
    cost: parseCost(booking.cost),
    created_at: toTimestampValue(booking.date_created_gmt ?? booking.created),
    modified_at: toTimestampValue(booking.date_modified_gmt ?? booking.modified),
    order_id: parseInteger(booking.order_id),
    product_name: typeof booking.product_name === "string" ? booking.product_name : null,
    metadata: normalizeRecord(toRecord(booking.meta_data ?? booking.metadata)),
    source: "woocommerce",
    raw_payload: normalizeRecord(booking as Record<string, unknown>),
  };
}

function normalizeBookingUpsertInput(input: UpsertSupabaseBookingInput) {
  const costNumeric = parseCost(input.cost);

  return {
    booking_id: input.booking_id,
    status: input.status,
    product_id: coerceNullableNumber(input.product_id),
    resource_id: coerceNullableNumber(input.resource_id),
    order_item_id: coerceNullableNumber(input.order_item_id),
    parent_id: coerceNullableNumber(input.parent_id),
    customer_id: coerceNullableNumber(input.customer_id),
    start_at: toIsoTimestamp(input.start_at),
    end_at: toIsoTimestamp(input.end_at),
    all_day: Boolean(input.all_day),
    timezone: typeof input.timezone === "string" ? input.timezone : null,
    persons: coerceNullableNumber(input.persons),
    persons_detail: normalizeRecord(input.persons_detail ?? null),
    cost: typeof costNumeric === "number" ? costNumeric : null,
    created_at: toIsoTimestamp(input.created_at),
    modified_at: toIsoTimestamp(input.modified_at),
    order_id: coerceNullableNumber(input.order_id),
    product_name: typeof input.product_name === "string" ? input.product_name : null,
    metadata: normalizeRecord(input.metadata ?? null),
    source: typeof input.source === "string" && input.source.length > 0 ? input.source : "woocommerce",
    raw_payload: normalizeRecord(input.raw_payload ?? null),
    updated_at: new Date().toISOString(),
  } satisfies Record<string, unknown>;
}

function parseInteger(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return Math.trunc(value);
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
  const timestamp = toTimestampValue(value);
  return typeof timestamp === "number" ? new Date(timestamp).toISOString() : timestamp;
}

function toTimestampValue(value: unknown): string | number | null {
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
      return toTimestampValue(numeric);
    }
    const parsed = Date.parse(trimmed);
    return Number.isFinite(parsed) ? new Date(parsed).toISOString() : null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return null;
}

function parseCost(value: unknown): number | null {
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

function extractPersonCount(persons: unknown): number | null {
  if (typeof persons === "number" && Number.isFinite(persons)) {
    return Math.max(0, Math.trunc(persons));
  }
  if (persons && typeof persons === "object") {
    try {
      const total = Object.values(persons as Record<string, unknown>).reduce<number>((acc, value) => {
        const parsed = parseInteger(value);
        return acc + (typeof parsed === "number" ? parsed : 0);
      }, 0);
      return Math.max(0, total);
    } catch {
      return null;
    }
  }
  return null;
}

function normalizePersonsDetail(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null;
  if (Array.isArray(value)) {
    return value.reduce<Record<string, unknown>>((acc, item, index) => {
      acc[String(index)] = item as unknown;
      return acc;
    }, {});
  }
  return normalizeRecord(toRecord(value));
}

function toRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null;
  return value as Record<string, unknown>;
}

function normalizeRecord(value: Record<string, unknown> | null): Record<string, unknown> | null {
  if (!value) return null;
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return null;
  }
}
