import { NextRequest, NextResponse } from "next/server";
import {
  mapWooOrderToSupabaseInput,
  upsertSupabaseOrder,
} from "../../../../../lib/supabase-orders";

export const dynamic = "force-dynamic";

function extractOrderPayload(body: any): Record<string, unknown> | null {
  if (!body || typeof body !== "object") return null;

  if (typeof body.id !== "undefined") {
    return body as Record<string, unknown>;
  }

  if (body.data && typeof body.data === "object") {
    if (typeof (body.data as any).id !== "undefined") {
      return body.data as Record<string, unknown>;
    }
    if ((body.data as any).order && typeof (body.data as any).order === "object") {
      return (body.data as any).order as Record<string, unknown>;
    }
  }

  if (body.order && typeof body.order === "object") {
    return body.order as Record<string, unknown>;
  }

  if (body.resource && typeof body.resource === "object") {
    return body.resource as Record<string, unknown>;
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const orderPayload = extractOrderPayload(body);

    if (!orderPayload) {
      return NextResponse.json(
        {
          ok: false,
          message: "Request did not include a recognizable order payload",
        },
        { status: 200 },
      );
    }

    let supabaseStatus: "synced" | "failed" = "synced";
    let supabaseError: string | undefined;
    let supabaseId: string | undefined;
    let orderId: number | undefined;

    try {
      const result = await upsertSupabaseOrder(mapWooOrderToSupabaseInput(orderPayload));
      orderId = result.order_id;
      supabaseId = result.id;
    } catch (error) {
      supabaseStatus = "failed";
      supabaseError = error instanceof Error ? error.message : String(error);
    }

    return NextResponse.json(
      {
        ok: true,
        supabase: supabaseStatus,
        supabase_error: supabaseError,
        order_id: orderId ?? orderPayload.id ?? null,
        supabase_id: supabaseId ?? null,
      },
      { status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 200 },
    );
  }
}

export function GET() {
  return NextResponse.json({ ok: true, message: "WooCommerce order webhook ready" });
}
