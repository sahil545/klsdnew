import { NextRequest, NextResponse } from "next/server";
import {
  mapWooBookingToSupabaseInput,
  upsertSupabaseBooking,
} from "../../../../../lib/supabase-bookings";

export const dynamic = "force-dynamic";

function ensureKeys() {
  const pub = (
    process.env.BUILDER_PUBLIC_API_KEY ||
    process.env.NEXT_PUBLIC_BUILDER_API_KEY ||
    ""
  ).trim();
  const priv = (
    process.env.BUILDER_PRIVATE_API_KEY ||
    process.env.BUILDER_WRITE_API_KEY ||
    ""
  ).trim();
  return { pub, priv };
}

function mapBookingToData(b: any) {
  const persons = (() => {
    if (typeof b.persons === "number") return b.persons;
    if (b.persons && typeof b.persons === "object") {
      try {
        return Object.values(b.persons).reduce(
          (a: any, v: any) => a + (parseInt(String(v), 10) || 0),
          0,
        );
      } catch {
        return 0;
      }
    }
    return 0;
  })();
  const startMs = Number.isFinite(b.start)
    ? b.start * 1000
    : typeof b.start === "string"
      ? Date.parse(b.start)
      : undefined;
  const endMs = Number.isFinite(b.end)
    ? b.end * 1000
    : typeof b.end === "string"
      ? Date.parse(b.end)
      : undefined;
  return {
    booking_id: b.id,
    status: b.status,
    product_id: b.product_id ?? b.product ?? undefined,
    resource_id: b.resource_id ?? undefined,
    order_item_id: b.order_item_id ?? undefined,
    parent_id: b.parent_id ?? undefined,
    customer_id: b.customer_id ?? undefined,
    start_utc_ms: Number.isFinite(startMs) ? startMs : undefined,
    end_utc_ms: Number.isFinite(endMs) ? endMs : undefined,
    all_day: !!b.all_day,
    timezone: b.timezone || b.timezone_offset || undefined,
    persons,
    persons_detail: b.persons ?? undefined,
    cost:
      typeof b.cost === "string" || typeof b.cost === "number"
        ? String(b.cost)
        : undefined,
    created_gmt: (b.date_created_gmt || b.created) ?? undefined,
    modified_gmt: (b.date_modified_gmt || b.modified) ?? undefined,
    order_id: b.order_id ?? undefined,
    product_name: b.product_name ?? undefined,
    metadata: b.meta_data || b.metadata || undefined,
  } as Record<string, any>;
}

async function findExisting(model: string, bookingId: number, apiKey: string) {
  const url = `https://cdn.builder.io/api/v3/content/${encodeURIComponent(model)}?apiKey=${encodeURIComponent(apiKey)}&limit=1&includeUnpublished=true&query.data.booking_id=${encodeURIComponent(String(bookingId))}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  const j = await res.json();
  return Array.isArray(j?.results) && j.results[0] ? j.results[0] : null;
}

export async function POST(req: NextRequest) {
  try {
    const model = "bookings";
    const { pub, priv } = ensureKeys();
    const overridePub = (req.headers.get("x-builder-public-key") || "").trim();
    const overridePriv = (
      req.headers.get("x-builder-private-key") || ""
    ).trim();
    const apiKey = overridePub || pub;
    const writeKey = overridePriv || priv;
    if (!apiKey || !writeKey)
      return NextResponse.json(
        { ok: false, error: "Missing Builder API keys" },
        { status: 200 },
      );

    let body: any = null;
    const text = await req.text();
    try {
      body = text ? JSON.parse(text) : {};
    } catch {
      body = {};
    }

    const booking = body?.id ? body : body?.booking || body?.data || body;
    if (!booking || typeof booking !== "object" || !booking.id) {
      return NextResponse.json(
        { ok: false, error: "Invalid booking payload" },
        { status: 200 },
      );
    }

    const data = mapBookingToData(booking);
    const existing = await findExisting(model, booking.id, apiKey);
    const payload = { name: `Booking #${booking.id}`, data, published: false };

    let supabaseStatus: "synced" | "failed" = "synced";
    let supabaseError: string | undefined;
    try {
      await upsertSupabaseBooking(mapWooBookingToSupabaseInput(booking));
    } catch (error) {
      supabaseStatus = "failed";
      supabaseError = error instanceof Error ? error.message : String(error);
    }

    if (existing?.id) {
      const res = await fetch(
        `https://builder.io/api/v3/content/${encodeURIComponent(model)}/${encodeURIComponent(existing.id)}?apiKey=${encodeURIComponent(apiKey)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${writeKey}`,
          },
          body: JSON.stringify(payload),
          cache: "no-store",
        },
      );
      const ok = res.ok;
      let err: string | undefined;
      if (!ok) {
        try {
          err = await res.text();
        } catch {}
      }
      return NextResponse.json(
        {
          ok,
          action: ok ? "updated" : "update_failed",
          id: existing.id,
          error: err,
          supabase: supabaseStatus,
          supabase_error: supabaseError,
        },
        { status: 200 },
      );
    } else {
      const res = await fetch(
        `https://builder.io/api/v3/content/${encodeURIComponent(model)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${writeKey}`,
          },
          body: JSON.stringify(payload),
          cache: "no-store",
        },
      );
      const ok = res.ok;
      let id: string | undefined;
      let err: string | undefined;
      if (ok) {
        try {
          const j = await res.json();
          id = j?.id || j?.data?.id;
        } catch {}
      } else {
        try {
          err = await res.text();
        } catch {}
      }
      return NextResponse.json(
        {
          ok,
          action: ok ? "created" : "create_failed",
          id,
          error: err,
          supabase: supabaseStatus,
          supabase_error: supabaseError,
        },
        { status: 200 },
      );
    }
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed" },
      { status: 200 },
    );
  }
}
