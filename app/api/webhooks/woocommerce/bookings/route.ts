import { NextRequest, NextResponse } from "next/server";

import {
  deleteSupabaseBookingById,
  mapWooBookingToSupabaseInput,
  upsertSupabaseBooking,
} from "../../../../../lib/supabase-bookings";
import {
  verifyWooWebhook,
  type WooWebhookVerificationResult,
} from "../../../../../lib/webhooks/woocommerce";

export const dynamic = "force-dynamic";

const ERROR_STATUS = 400;

export async function POST(req: NextRequest) {
  const secret = resolveWebhookSecret("WC_WEBHOOK_SECRET_BOOKINGS");
  if (!secret) {
    return NextResponse.json(
      {
        ok: false,
        error: "WooCommerce booking webhook secret is not configured",
      },
      { status: ERROR_STATUS },
    );
  }

  const verification = await verifyWooWebhook(req, { secret });
  if (!verification.success) {
    return NextResponse.json(
      {
        ok: false,
        error: verification.reason ?? "Invalid webhook signature",
        topic: verification.topic,
        delivery_id: verification.deliveryId,
      },
      { status: 401 },
    );
  }

  const booking = extractBookingPayload(verification);
  if (!booking || typeof booking.id === "undefined") {
    return NextResponse.json(
      {
        ok: false,
        error: "Webhook payload did not include a booking object with id",
        topic: verification.topic,
        delivery_id: verification.deliveryId,
      },
      { status: ERROR_STATUS },
    );
  }

  const bookingId = parseNumericId(booking.id);
  if (typeof bookingId !== "number") {
    return NextResponse.json(
      {
        ok: false,
        error: "Booking id was not a valid number",
        topic: verification.topic,
        delivery_id: verification.deliveryId,
      },
      { status: ERROR_STATUS },
    );
  }

  const deleteIntent = isDeleteEvent(verification.topic, booking);

  if (deleteIntent) {
    try {
      const deleted = await deleteSupabaseBookingById(bookingId);
      return NextResponse.json(
        {
          ok: true,
          action: deleted > 0 ? "deleted" : "noop",
          booking_id: bookingId,
          topic: verification.topic,
          delivery_id: verification.deliveryId,
        },
        { status: 200 },
      );
    } catch (error) {
      return NextResponse.json(
        {
          ok: false,
          error: error instanceof Error ? error.message : String(error),
          topic: verification.topic,
          delivery_id: verification.deliveryId,
        },
        { status: ERROR_STATUS },
      );
    }
  }

  try {
    const result = await upsertSupabaseBooking(
      mapWooBookingToSupabaseInput(booking as Record<string, unknown> & { id?: number | string }),
    );
    return NextResponse.json(
      {
        ok: true,
        action: "upserted",
        booking_id: result.booking_id,
        supabase_id: result.id,
        topic: verification.topic,
        delivery_id: verification.deliveryId,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
        booking_id: bookingId,
        topic: verification.topic,
        delivery_id: verification.deliveryId,
      },
      { status: ERROR_STATUS },
    );
  }
}

export function GET() {
  return NextResponse.json({ ok: true });
}

function resolveWebhookSecret(envKey: string): string | null {
  const specific = (process.env[envKey] || "").trim();
  if (specific) return specific;
  const fallback = (process.env.WC_WEBHOOK_SECRET || "").trim();
  return fallback || null;
}

function extractBookingPayload(verification: WooWebhookVerificationResult):
  | (Record<string, unknown> & { id?: number | string })
  | null {
  const payload = verification.payload;
  if (!payload || typeof payload !== "object") return null;

  const candidates: Array<Record<string, unknown> | null> = [];
  if (isRecord(payload)) candidates.push(payload);

  const payloadRecord = payload as Record<string, unknown>;
  for (const key of ["booking", "data", "resource", "payload"]) {
    const maybe = payloadRecord[key];
    if (isRecord(maybe)) {
      candidates.push(maybe);
    }
  }

  for (const candidate of candidates) {
    if (candidate && typeof candidate.id !== "undefined") {
      return candidate;
    }
  }

  return null;
}

function isDeleteEvent(topic: string | undefined, booking: Record<string, unknown> | null): boolean {
  if (topic && /deleted|trash|removed/i.test(topic)) {
    return true;
  }
  if (!booking) return false;
  const status = typeof booking.status === "string" ? booking.status.toLowerCase() : "";
  return status === "trash" || status === "deleted";
}

function parseNumericId(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value);
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number.parseInt(value.trim(), 10);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
