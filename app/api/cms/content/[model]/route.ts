import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { model: string } }) {
  try {
    const { searchParams } = new URL(req.url);
    const overrideHeader = req.headers.get("x-builder-public-key") || "";
    const overrideQuery = searchParams.get("publicKey") || "";
    const apiKey = (overrideHeader || overrideQuery || process.env.BUILDER_PUBLIC_API_KEY || process.env.NEXT_PUBLIC_BUILDER_API_KEY || "").trim();
    if (!apiKey) {
      return NextResponse.json({ ok: false, error: "Missing BUILDER_PUBLIC_API_KEY" }, { status: 200 });
    }
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "20", 10)));
    const model = params.model;
    const url = `https://cdn.builder.io/api/v3/content/${encodeURIComponent(model)}?apiKey=${encodeURIComponent(apiKey)}&limit=${limit}&includeUnpublished=true`;
    const res = await fetch(url, { cache: "no-store" });
    const json = await res.json();
    if (!res.ok) {
      return NextResponse.json({ ok: false, error: `HTTP ${res.status}`, body: json }, { status: 200 });
    }
    return NextResponse.json({ ok: true, model, count: json?.results?.length || 0, results: json?.results || [] }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status: 200 });
  }
}
