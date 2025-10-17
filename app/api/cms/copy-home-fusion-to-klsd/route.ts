import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function ensureLeadingSlash(path: string) {
  const s = `/${String(path || "").trim()}`.replace(/\/+/, "/");
  return s === "/" ? "/" : s.replace(/\/$/, "");
}

async function getFrom(model: string, slug: string, apiKey: string) {
  const norm = ensureLeadingSlash(slug);
  const tries = [norm, norm.endsWith('/') ? norm.slice(0,-1) : norm + '/'];
  for (const p of tries) {
    const urls = [
      `https://cdn.builder.io/api/v3/content/${encodeURIComponent(model)}?apiKey=${encodeURIComponent(apiKey)}&includeUnpublished=true&limit=1&query.url=${encodeURIComponent(p)}`,
      `https://cdn.builder.io/api/v3/content/${encodeURIComponent(model)}?apiKey=${encodeURIComponent(apiKey)}&includeUnpublished=true&limit=1&query.data.slug=${encodeURIComponent(p)}`,
    ];
    for (const u of urls) {
      const res = await fetch(u, { cache: 'no-store' });
      if (!res.ok) continue;
      const j = await res.json();
      const item = Array.isArray(j?.results) && j.results[0] ? j.results[0] : null;
      if (item) return item;
    }
  }
  return null as any;
}

export async function GET(_req: NextRequest) {
  try {
    const fromPublic = "2a778920e8d54a37b1576086f79dd676"; // Fusion public key provided by user
    const toPublic = (process.env.BUILDER_PUBLIC_API_KEY || process.env.NEXT_PUBLIC_BUILDER_API_KEY || '').trim();
    const toPrivate = (process.env.BUILDER_PRIVATE_API_KEY || process.env.BUILDER_WRITE_API_KEY || '').trim();
    const slug = "/";
    const publish = true;

    if (!toPublic || !toPrivate) {
      return NextResponse.json({ ok: false, error: 'Missing KLSD Builder API keys on server' }, { status: 200 });
    }

    // load from Fusion (page or pages)
    let src = await getFrom('page', slug, fromPublic);
    if (!src?.id) src = await getFrom('pages', slug, fromPublic);
    if (!src?.id) return NextResponse.json({ ok: false, error: 'Source page not found at / in Fusion' }, { status: 200 });

    const payload = {
      name: src.name || 'Home',
      url: ensureLeadingSlash(slug),
      data: src.data || {},
      published: publish,
    } as any;

    // upsert into KLSD
    const check = await getFrom('page', slug, toPublic);
    if (check?.id) {
      const r = await fetch(`https://builder.io/api/v3/content/page/${encodeURIComponent(check.id)}?apiKey=${encodeURIComponent(toPublic)}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${toPrivate}` }, body: JSON.stringify(payload), cache: 'no-store'
      });
      const ok = r.ok; let err: string | undefined; if (!ok) { try { err = await r.text(); } catch {} }
      return NextResponse.json({ ok, action: ok ? 'updated' : 'update_failed', id: check.id, slug, error: err }, { status: 200 });
    } else {
      const r = await fetch('https://builder.io/api/v3/content/page', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${toPrivate}` }, body: JSON.stringify(payload), cache: 'no-store'
      });
      const ok = r.ok; let id: string | undefined; let err: string | undefined; if (ok) { try { const j = await r.json(); id = j?.id || j?.data?.id; } catch {} } else { try { err = await r.text(); } catch {} }
      return NextResponse.json({ ok, action: ok ? 'created' : 'create_failed', id, slug, error: err }, { status: 200 });
    }
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed' }, { status: 200 });
  }
}
