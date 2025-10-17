import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const apiKey = process.env.BUILDER_PUBLIC_API_KEY || process.env.NEXT_PUBLIC_BUILDER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ connected: false, reason: "Missing BUILDER_PUBLIC_API_KEY" }, { status: 200 });
    }
    const url = `https://cdn.builder.io/api/v3/content/page?apiKey=${encodeURIComponent(apiKey)}&limit=1`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json({ connected: false, reason: `HTTP ${res.status}` }, { status: 200 });
    }
    const json = await res.json();
    return NextResponse.json({ connected: true, sample: json, apiKeyPresent: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ connected: false, reason: e?.message || "Unknown error" }, { status: 200 });
  }
}
