import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

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
      try {
        const res = await fetch(u, { cache: 'no-store' });
        if (!res.ok) continue;
        const j = await res.json();
        const item = Array.isArray(j?.results) && j.results[0] ? j.results[0] : null;
        if (item) return item;
      } catch {}
    }
  }
  return null as any;
}

async function getTargetPageByUrl(urlPath: string, apiKey: string) {
  const norm = ensureLeadingSlash(urlPath);
  const tries = [norm, norm.endsWith('/') ? norm.slice(0,-1) : norm + '/'];
  for (const p of tries) {
    const url = `https://cdn.builder.io/api/v3/content/page?apiKey=${encodeURIComponent(apiKey)}&includeUnpublished=true&limit=1&query.url=${encodeURIComponent(p)}`;
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) continue;
      const j = await res.json();
      const item = Array.isArray(j?.results) && j.results[0] ? j.results[0] : null;
      if (item) return item;
    } catch {}
  }
  return null as any;
}

export async function POST(req: NextRequest) {
  try {
    let body: any = null; try { body = await req.json(); } catch {}
    const fromPublic = (body?.fromPublicKey || req.headers.get('x-from-public') || '').trim();
    const toPublic = (body?.toPublicKey || req.headers.get('x-to-public') || process.env.BUILDER_PUBLIC_API_KEY || process.env.NEXT_PUBLIC_BUILDER_API_KEY || '').trim();
    const toPrivate = (body?.toPrivateKey || req.headers.get('x-to-private') || process.env.BUILDER_PRIVATE_API_KEY || process.env.BUILDER_WRITE_API_KEY || '').trim();
    const slugs: string[] = Array.isArray(body?.slugs) ? body.slugs.map((s: any) => ensureLeadingSlash(String(s))).filter(Boolean) : [];
    const publish = !!body?.publish;

    if (!fromPublic) return NextResponse.json({ ok: false, error: 'Missing fromPublicKey' }, { status: 200 });
    if (!toPublic) return NextResponse.json({ ok: false, error: 'Missing target public key' }, { status: 200 });
    if (!toPrivate) return NextResponse.json({ ok: false, error: 'Missing target private key' }, { status: 200 });
    if (slugs.length === 0) return NextResponse.json({ ok: false, error: 'Provide slugs: string[]' }, { status: 200 });

    const out: Array<{ slug: string; action: string; id?: string; error?: string }> = [];

    for (const slug of slugs) {
      try {
        // find source in either page or structured pages
        let src = await getFrom('page', slug, fromPublic);
        if (!src?.id) src = await getFrom('pages', slug, fromPublic);
        if (!src?.id) { out.push({ slug, action: 'source_not_found' }); continue; }

        const payload: any = {
          name: src.name || slug,
          url: slug,
          data: src.data || {},
          published: publish,
        };

        const existing = await getTargetPageByUrl(slug, toPublic);
        if (existing?.id) {
          const r = await fetch(`https://builder.io/api/v3/content/page/${encodeURIComponent(existing.id)}?apiKey=${encodeURIComponent(toPublic)}`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${toPrivate}` }, body: JSON.stringify(payload), cache: 'no-store'
          });
          if (r.ok) out.push({ slug, action: 'updated', id: existing.id });
          else { let err: string | undefined; try { err = await r.text(); } catch {} out.push({ slug, action: 'update_failed', id: existing.id, error: err }); }
        } else {
          const r = await fetch('https://builder.io/api/v3/content/page', {
            method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${toPrivate}` }, body: JSON.stringify(payload), cache: 'no-store'
          });
          if (r.ok) { let id: string | undefined; try { const j = await r.json(); id = j?.id || j?.data?.id; } catch {} out.push({ slug, action: 'created', id }); }
          else { let err: string | undefined; try { err = await r.text(); } catch {} out.push({ slug, action: 'create_failed', error: err }); }
        }
      } catch (e: any) {
        out.push({ slug, action: 'error', error: e?.message || 'Failed' });
      }
    }

    return NextResponse.json({ ok: true, count: out.length, results: out }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed' }, { status: 200 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams, origin } = new URL(req.url);
    const fromPublic = (searchParams.get('fromPublicKey') || '').trim();
    const toPublic = (searchParams.get('toPublicKey') || (process.env.BUILDER_PUBLIC_API_KEY || process.env.NEXT_PUBLIC_BUILDER_API_KEY) || '').trim();
    const publish = searchParams.get('publish') === 'true';
    const slugsParam = (searchParams.get('slugs') || '').trim();
    if (!fromPublic) return NextResponse.json({ ok: false, error: 'Missing fromPublicKey' }, { status: 200 });
    const slugs = slugsParam.split(/[,\n]/).map(s=>s.trim()).filter(Boolean);
    if (!slugs.length) return NextResponse.json({ ok: false, error: 'Provide slugs in query (?slugs=/,/about,...)' }, { status: 200 });

    // forward to POST to reuse logic; private key must be on server env
    const res = await fetch(`${origin}/api/cms/bulk-copy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromPublicKey: fromPublic, toPublicKey: toPublic || undefined, publish, slugs }),
      cache: 'no-store',
    });
    const text = await res.text();
    let json: any = {}; try { json = text ? JSON.parse(text) : {}; } catch { json = { ok: false, error: `Invalid JSON (HTTP ${res.status})`, raw: text }; }
    return NextResponse.json(json, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed' }, { status: 200 });
  }
}
