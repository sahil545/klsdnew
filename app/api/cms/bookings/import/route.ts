import { NextRequest, NextResponse } from "next/server";
import {
  mapWooBookingToSupabaseInput,
  upsertSupabaseBooking,
} from "../../../../../lib/supabase-bookings";

export const dynamic = "force-dynamic";

function wcConfig() {
  const url = (process.env.NEXT_PUBLIC_WOOCOMMERCE_URL || "https://keylargoscubadiving.com").replace(/\/$/, "");
  const key = process.env.NEXT_PUBLIC_WOOCOMMERCE_KEY || "";
  const secret = process.env.WOOCOMMERCE_SECRET || "";
  const fallbackKey = key || "ck_d0e9e6f20a1ecc40f797058c27e46aee21bf10b9";
  const fallbackSecret = secret || "cs_3d3aa1c520bd3687d83ae3932b70683a7126af28";
  const auth = Buffer.from(`${fallbackKey}:${fallbackSecret}`).toString("base64");
  return { url, auth };
}

async function fetchBookings(page: number, perPage: number, baseUrl: string, auth: string) {
  const url = `${baseUrl}/wp-json/wc-bookings/v1/bookings?per_page=${perPage}&page=${page}`;
  const res = await fetch(url, { headers: { Authorization: `Basic ${auth}` }, cache: "no-store" });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Failed WC bookings (HTTP ${res.status}) ${t}`);
  }
  const json = await res.json();
  return Array.isArray(json) ? json : [];
}

function mapBookingToData(b: any) {
  const persons = (() => {
    if (typeof b.persons === 'number') return b.persons;
    if (b.persons && typeof b.persons === 'object') {
      try { return Object.values(b.persons).reduce((a:any, v:any)=> a + (parseInt(String(v),10)||0), 0); } catch { return 0; }
    }
    return 0;
  })();
  const startMs = Number.isFinite(b.start) ? (b.start * 1000) : (typeof b.start === 'string' ? Date.parse(b.start) : undefined);
  const endMs = Number.isFinite(b.end) ? (b.end * 1000) : (typeof b.end === 'string' ? Date.parse(b.end) : undefined);
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
    cost: typeof b.cost === 'string' || typeof b.cost === 'number' ? String(b.cost) : undefined,
    created_gmt: (b.date_created_gmt ?? b.created) ?? undefined,
    modified_gmt: (b.date_modified_gmt ?? b.modified) ?? undefined,
    order_id: b.order_id ?? undefined,
    product_name: b.product_name ?? undefined,
    metadata: b.meta_data || b.metadata || undefined,
  } as Record<string, any>;
}

async function getExistingByBookingId(model: string, bookingId: number, apiKey: string) {
  const url = `https://cdn.builder.io/api/v3/content/${encodeURIComponent(model)}?apiKey=${encodeURIComponent(apiKey)}&limit=1&includeUnpublished=true&query.data.booking_id=${encodeURIComponent(String(bookingId))}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  const json = await res.json();
  const item = Array.isArray(json?.results) && json.results[0] ? json.results[0] : null;
  return item;
}

export async function POST(req: NextRequest) {
  try {
    let body: any = null; try { body = await req.json(); } catch {}
    const model = (body?.model || 'bookings').trim();
    const perPage = Math.max(1, Math.min(100, parseInt(String(body?.perPage ?? 50), 10) || 50));
    const maxPages = Math.max(1, Math.min(1000, parseInt(String(body?.pages ?? 100), 10) || 100));
    const pubKey = (body?.publicKey || req.headers.get('x-builder-public-key') || process.env.BUILDER_PUBLIC_API_KEY || process.env.NEXT_PUBLIC_BUILDER_API_KEY || '').trim();
    const privKey = (body?.privateKey || req.headers.get('x-builder-private-key') || process.env.BUILDER_PRIVATE_API_KEY || process.env.BUILDER_WRITE_API_KEY || '').trim();
    if (!pubKey) return NextResponse.json({ ok: false, error: 'Missing public key' }, { status: 200 });
    if (!privKey) return NextResponse.json({ ok: false, error: 'Missing private key' }, { status: 200 });

    const { url: siteUrl, auth } = wcConfig();

    let page = 1;
    const all: any[] = [];
    while (page <= maxPages) {
      const arr = await fetchBookings(page, perPage, siteUrl, auth);
      if (!arr.length) break;
      all.push(...arr);
      if (arr.length < perPage) break;
      page++;
    }

    let created = 0, updated = 0; const results: any[] = [];

    for (const b of all) {
      const data = mapBookingToData(b);
      const existing = await getExistingByBookingId(model, b.id, pubKey);
      const payload = {
        name: `Booking #${b.id}`,
        data,
        published: false,
      };

      let supabaseStatus: "synced" | "failed" = "synced";
      let supabaseError: string | undefined;
      try {
        await upsertSupabaseBooking(mapWooBookingToSupabaseInput(b));
      } catch (error) {
        supabaseStatus = "failed";
        supabaseError = error instanceof Error ? error.message : String(error);
      }

      if (existing?.id) {
        const res = await fetch(`https://builder.io/api/v3/content/${encodeURIComponent(model)}/${encodeURIComponent(existing.id)}?apiKey=${encodeURIComponent(pubKey)}` ,{
          method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${privKey}` }, body: JSON.stringify(payload), cache: 'no-store'
        });
        if (res.ok) { updated++; results.push({ id: existing.id, booking_id: b.id, action: 'updated', supabase: supabaseStatus, supabase_error: supabaseError }); }
        else { let err=''; try { err = await res.text(); } catch{} results.push({ booking_id: b.id, action:'update_failed', error: err, supabase: supabaseStatus, supabase_error: supabaseError }); }
      } else {
        const res = await fetch(`https://builder.io/api/v3/content/${encodeURIComponent(model)}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${privKey}` }, body: JSON.stringify(payload), cache: 'no-store'
        });
        if (res.ok) { let id: string | undefined; try { const j = await res.json(); id = j?.id || j?.data?.id; } catch{} created++; results.push({ id, booking_id: b.id, action: 'created', supabase: supabaseStatus, supabase_error: supabaseError }); }
        else { let err=''; try { err = await res.text(); } catch{} results.push({ booking_id: b.id, action:'create_failed', error: err, supabase: supabaseStatus, supabase_error: supabaseError }); }
      }
    }

    return NextResponse.json({ ok: true, count: all.length, created, updated, model, results }, { status: 200 });
  } catch (e:any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed' }, { status: 200 });
  }
}
