import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    let body: any = null;
    try { body = await req.json(); } catch {}

    const headerPriv = (req.headers.get("x-builder-private-key") || "").trim();
    const headerPub = (req.headers.get("x-builder-public-key") || "").trim();
    const headerSite = (req.headers.get("x-site") || "").trim();

    const privateKey = (body?.privateKey || headerPriv || undefined) as string | undefined;
    const publicKey = (body?.publicKey || headerPub || undefined) as string | undefined;
    const site = (body?.site || headerSite || undefined) as string | undefined;
    const limit = Math.max(1, Math.min(50, parseInt(String(body?.limit ?? 10), 10) || 10));
    const fields = Array.isArray(body?.fields) ? body.fields : [];

    const proto = (req.headers.get("x-forwarded-proto") || "https").split(",")[0].trim();
    const host = (req.headers.get("x-forwarded-host") || req.headers.get("host") || "").split(",")[0].trim();
    if (!host) return NextResponse.json({ ok: false, error: "Cannot determine host" }, { status: 200 });
    const origin = `${proto}://${host}`;

    const runOne = async (model: string) => {
      const res = await fetch(`${origin}/api/cms/sync-blog-metadata`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(privateKey ? { "x-builder-private-key": privateKey } : {}),
          ...(publicKey ? { "x-builder-public-key": publicKey } : {}),
          ...(site ? { "x-site": site } : {}),
          "x-builder-model": model,
        },
        body: JSON.stringify({ model, limit, fields, privateKey, publicKey, site }),
        cache: "no-store",
      });
      const text = await res.text();
      let json: any = {};
      try { json = text ? JSON.parse(text) : {}; } catch { json = { ok: false, error: `Invalid JSON (${res.status})`, raw: text?.slice(0, 500) }; }
      return { status: res.status, ok: !!json?.ok, result: json };
    };

    const pages = await runOne("pages");
    const blogs = await runOne("blog-posts");

    const ok = pages.ok || blogs.ok;
    return NextResponse.json({ ok, pages, blogs }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status: 200 });
  }
}
