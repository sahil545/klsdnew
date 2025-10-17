import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const origin = request.nextUrl.origin;
    const results: Record<string, any> = {};

    // Reset trips API cache
    try {
      const res = await fetch(`${origin}/api/trips?reset=1`, { cache: "no-store" });
      const json = await res.json();
      results.trips = { ok: res.ok, status: res.status, data: json };
    } catch (err: any) {
      results.trips = { ok: false, error: err?.message || String(err) };
    }

    return NextResponse.json(
      {
        status: "ok",
        reset: results,
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: error?.message || "Failed to reset",
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  // Allow GET for convenience
  return POST(request);
}
