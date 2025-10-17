import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function ensureLeadingSlash(path: string) {
  const s = `/${String(path || "").trim()}`.replace(/\/+/, "/");
  return s === "/" ? "/" : s.replace(/\/$/, "");
}

async function getPageByUrlFrom(model: string, urlPath: string, apiKey: string) {
  const norm = ensureLeadingSlash(urlPath);
  const tries = [norm, norm.endsWith('/') ? norm.slice(0, -1) : norm + '/'];
  for (const p of tries) {
    // try by url
    const urlA = `https://cdn.builder.io/api/v3/content/${encodeURIComponent(model)}?apiKey=${encodeURIComponent(apiKey)}&includeUnpublished=true&limit=1&query.url=${encodeURIComponent(p)}`;
    let res = await fetch(urlA, { cache: 'no-store' });
    if (res.ok) {
      const j = await res.json();
      const item = Array.isArray(j?.results) && j.results[0] ? j.results[0] : null;
      if (item) return item;
    }
    // try by data.slug
    const urlB = `https://cdn.builder.io/api/v3/content/${encodeURIComponent(model)}?apiKey=${encodeURIComponent(apiKey)}&includeUnpublished=true&limit=1&query.data.slug=${encodeURIComponent(p)}`;
    res = await fetch(urlB, { cache: 'no-store' });
    if (res.ok) {
      const j = await res.json();
      const item = Array.isArray(j?.results) && j.results[0] ? j.results[0] : null;
      if (item) return item;
    }
  }
  return null as any;
}

async function getTargetPageByUrl(urlPath: string, apiKey: string) {
  return getPageByUrlFrom('page', urlPath, apiKey);
}

export async function POST(req: NextRequest) {
  try {
    let body: any = null; try { body = await req.json(); } catch {}
    const fromPublic = (body?.fromPublicKey || req.headers.get('x-from-public') || '').trim();
    const toPublic = (body?.toPublicKey || req.headers.get('x-to-public') || process.env.BUILDER_PUBLIC_API_KEY || process.env.NEXT_PUBLIC_BUILDER_API_KEY || '').trim();
    const toPrivate = (body?.toPrivateKey || req.headers.get('x-to-private') || process.env.BUILDER_PRIVATE_API_KEY || process.env.BUILDER_WRITE_API_KEY || '').trim();
    const slug = ensureLeadingSlash(body?.slug || '/');
    const publish = !!body?.publish;

    if (!fromPublic) return NextResponse.json({ ok: false, error: 'Missing fromPublicKey' }, { status: 200 });
    if (!toPublic) return NextResponse.json({ ok: false, error: 'Missing target public key' }, { status: 200 });
    if (!toPrivate) return NextResponse.json({ ok: false, error: 'Missing target private key' }, { status: 200 });

    // Load source page (Fusion space) from either Page model or structured pages
    let src = await getPageByUrlFrom('page', slug, fromPublic);
    if (!src?.id) src = await getPageByUrlFrom('pages', slug, fromPublic);
    if (!src?.id) return NextResponse.json({ ok: false, error: `Source page not found for ${slug}` }, { status: 200 });

    // Prepare payload: copy name, url, and data (including blocks)
    const payload: any = {
      name: src.name || 'Home',
      url: slug,
      data: src.data || {},
      published: publish,
    };

    // Upsert into target (KLSD)
    const existing = await getTargetPageByUrl(slug, toPublic);
    if (existing?.id) {
      const res = await fetch(`https://builder.io/api/v3/content/page/${encodeURIComponent(existing.id)}?apiKey=${encodeURIComponent(toPublic)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${toPrivate}` },
        body: JSON.stringify(payload),
        cache: 'no-store',
      });
      const ok = res.ok; let err: string | undefined; if (!ok) { try { err = await res.text(); } catch {} }
      return NextResponse.json({ ok, action: ok ? 'updated' : 'update_failed', id: existing.id, slug, error: err }, { status: 200 });
    } else {
      const res = await fetch('https://builder.io/api/v3/content/page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${toPrivate}` },
        body: JSON.stringify(payload),
        cache: 'no-store',
      });
      let id: string | undefined; let err: string | undefined; const ok = res.ok;
      if (ok) { try { const j = await res.json(); id = j?.id || j?.data?.id; } catch {} } else { try { err = await res.text(); } catch {} }
      return NextResponse.json({ ok, action: ok ? 'created' : 'create_failed', id, slug, error: err }, { status: 200 });
    }
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed' }, { status: 200 });
  }
}
