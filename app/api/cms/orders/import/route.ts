import { NextRequest, NextResponse } from "next/server";
import {
  mapWooOrderToSupabaseInput,
  upsertSupabaseOrder,
} from "../../../../../lib/supabase-orders";

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

type ImportOptions = {
  perPage?: number;
  pages?: number;
  status?: string[];
  since?: string;
};

type ImportSummary = {
  total: number;
  upserted: number;
  skipped: number;
  failures: Array<{ orderId: number; error: string }>;
};

function parseOptions(body: unknown): ImportOptions {
  if (!body || typeof body !== "object") return {};
  const source = body as Record<string, unknown>;

  const perPage = Number.isFinite(source.perPage)
    ? Math.min(100, Math.max(1, Number(source.perPage)))
    : undefined;
  const pages = Number.isFinite(source.pages)
    ? Math.max(1, Number(source.pages))
    : undefined;
  const since = typeof source.since === "string" && source.since.trim().length
    ? source.since.trim()
    : undefined;
  const status = Array.isArray(source.status)
    ? source.status.map((value) => String(value).trim()).filter((value) => value.length)
    : typeof source.status === "string"
      ? source.status
          .split(",")
          .map((value) => value.trim())
          .filter((value) => value.length)
      : undefined;

  return { perPage, pages, since, status };
}

function shouldSkipStatus(statusFilters: string[] | undefined, status: string): boolean {
  if (!statusFilters || statusFilters.length === 0) return false;
  const normalized = status.toLowerCase();
  return !statusFilters.some((candidate) => candidate.toLowerCase() === normalized);
}

function shouldSkipSince(sinceIso: string | undefined, payload: ReturnType<typeof mapWooOrderToSupabaseInput>): boolean {
  if (!sinceIso) return false;
  const sinceDate = Date.parse(sinceIso);
  if (!Number.isFinite(sinceDate)) return false;

  const candidates = [payload.modified_at, payload.created_at, payload.date_paid, payload.date_completed]
    .map((value) => (typeof value === "string" ? value : null))
    .filter((value): value is string => typeof value === "string" && value.length > 0);

  if (!candidates.length) return false;

  const latest = candidates
    .map((value) => Date.parse(value))
    .filter((value) => Number.isFinite(value))
    .reduce((max, current) => (current > max ? current : max), -Infinity);

  if (!Number.isFinite(latest) || latest === -Infinity) return false;

  return latest < sinceDate;
}

async function fetchOrders(page: number, perPage: number, baseUrl: string, auth: string) {
  const url = `${baseUrl}/wp-json/wc/v3/orders?per_page=${perPage}&page=${page}&orderby=date&order=desc`;
  const res = await fetch(url, {
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to fetch orders: ${res.status} ${text}`);
  }

  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function POST(req: NextRequest) {
  try {
    const options = parseOptions(await req.json().catch(() => ({})));
    const { url, auth } = wcConfig();

    const perPage = options.perPage ?? 100;
    const pages = options.pages ?? 5000;

    const summary: ImportSummary = {
      total: 0,
      upserted: 0,
      skipped: 0,
      failures: [],
    };

    for (let page = 1; page <= pages; page += 1) {
      const orders = await fetchOrders(page, perPage, url, auth);
      if (!orders.length) {
        break;
      }

      for (const order of orders) {
        summary.total += 1;

        try {
          const payload = mapWooOrderToSupabaseInput(order);

          if (shouldSkipStatus(options.status, payload.status)) {
            summary.skipped += 1;
            continue;
          }

          if (shouldSkipSince(options.since, payload)) {
            summary.skipped += 1;
            continue;
          }

          await upsertSupabaseOrder(payload);
          summary.upserted += 1;
        } catch (error) {
          const orderId = typeof order?.id === "number" ? order.id : Number.parseInt(String(order?.id ?? 0), 10) || 0;
          summary.failures.push({
            orderId,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      if (orders.length < perPage) {
        break;
      }
    }

    return NextResponse.json({ ok: true, summary });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 200 },
    );
  }
}

export function GET() {
  return NextResponse.json({ ok: true, message: "Orders import endpoint ready" });
}
