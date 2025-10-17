import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function ensureLeadingSlash(path: string) {
  const s = `/${String(path || "").trim()}`.replace(/\/+/, "/");
  return s === "/" ? "/" : s.replace(/\/$/, "");
}

async function fetchSourceById(id: string, publicKey: string, privateKey?: string): Promise<any | null> {
  const models = ["page", "pages"]; // try Page model first, then structured pages
  for (const model of models) {
    // Try management API by ID (requires private key)
    if (privateKey) {
      try {
        const urlM = `https://builder.io/api/v3/content/${encodeURIComponent(model)}/${encodeURIComponent(id)}?apiKey=${encodeURIComponent(publicKey)}`;
        const rM = await fetch(urlM, { cache: "no-store", headers: { Authorization: `Bearer ${privateKey}` } });
        if (rM.ok) {
          const jM = await rM.json();
          if (jM && (jM.id || jM.data || jM.name || jM.url)) return { ...jM, __model: model };
        }
      } catch {}
    }
    // Try CDN by ID path (public)
    try {
      const url1 = `https://cdn.builder.io/api/v3/content/${encodeURIComponent(model)}/${encodeURIComponent(id)}?apiKey=${encodeURIComponent(publicKey)}&includeUnpublished=true`;
      const r1 = await fetch(url1, { cache: "no-store" });
      if (r1.ok) {
        const j1 = await r1.json();
        if (j1 && (j1.id || j1.data || j1.name || j1.url)) return { ...j1, __model: model };
      }
    } catch {}
    // Try query by id (management)
    if (privateKey) {
      try {
        const url2m = `https://builder.io/api/v3/content/${encodeURIComponent(model)}?apiKey=${encodeURIComponent(publicKey)}&includeUnpublished=true&limit=1&query.id=${encodeURIComponent(id)}`;
        const r2m = await fetch(url2m, { cache: "no-store", headers: { Authorization: `Bearer ${privateKey}` } });
        if (r2m.ok) {
          const j2m = await r2m.json();
          const itemM = Array.isArray(j2m?.results) && j2m.results[0] ? j2m.results[0] : null;
          if (itemM) return { ...itemM, __model: model };
        }
      } catch {}
    }
    // Try query by id (CDN)
    try {
      const url2 = `https://cdn.builder.io/api/v3/content/${encodeURIComponent(model)}?apiKey=${encodeURIComponent(publicKey)}&includeUnpublished=true&limit=1&query.id=${encodeURIComponent(id)}`;
      const r2 = await fetch(url2, { cache: "no-store" });
      if (r2.ok) {
        const j2 = await r2.json();
        const item = Array.isArray(j2?.results) && j2.results[0] ? j2.results[0] : null;
        if (item) return { ...item, __model: model };
      }
    } catch {}
    // Fallback: scan pages (up to 1000) to find exact id
    try {
      let offset = 0;
      const step = 50;
      for (let scanned = 0; scanned < 1000; ) {
        const url3 = `https://cdn.builder.io/api/v3/content/${encodeURIComponent(model)}?apiKey=${encodeURIComponent(publicKey)}&includeUnpublished=true&limit=${step}&offset=${offset}`;
        const r3 = await fetch(url3, { cache: "no-store" });
        if (!r3.ok) break;
        const j3 = await r3.json();
        const arr = Array.isArray(j3?.results) ? j3.results : [];
        const found = arr.find((it: any) => it?.id === id);
        if (found) return { ...found, __model: model };
        if (arr.length < step) break;
        offset += arr.length;
        scanned += arr.length;
      }
    } catch {}
  }
  return null;
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
    const fromPrivate = (body?.fromPrivateKey || req.headers.get('x-from-private') || '').trim();
    const toPublic = (body?.toPublicKey || req.headers.get('x-to-public') || process.env.BUILDER_PUBLIC_API_KEY || process.env.NEXT_PUBLIC_BUILDER_API_KEY || '').trim();
    const toPrivate = (body?.toPrivateKey || req.headers.get('x-to-private') || process.env.BUILDER_PRIVATE_API_KEY || process.env.BUILDER_WRITE_API_KEY || '').trim();
    const sourceId = (body?.id || body?.sourceId || '').trim();
    const slug = ensureLeadingSlash(body?.slug || '/');
    const publish = !!body?.publish;

    if (!fromPublic) return NextResponse.json({ ok: false, error: 'Missing fromPublicKey' }, { status: 200 });
    if (!toPublic) return NextResponse.json({ ok: false, error: 'Missing target public key' }, { status: 200 });
    if (!toPrivate) return NextResponse.json({ ok: false, error: 'Missing target private key' }, { status: 200 });
    if (!sourceId) return NextResponse.json({ ok: false, error: 'Missing source id' }, { status: 200 });

    const src = await fetchSourceById(sourceId, fromPublic, fromPrivate || undefined);
    if (!src?.id) return NextResponse.json({ ok: false, error: `Source not found by id ${sourceId}` }, { status: 200 });

    const payload: any = {
      name: src.name || slug,
      url: slug,
      data: src.data || {},
      published: publish,
    };

    const existing = await getTargetPageByUrl(slug, toPublic);
    if (existing?.id) {
      const r = await fetch(`https://builder.io/api/v3/content/page/${encodeURIComponent(existing.id)}?apiKey=${encodeURIComponent(toPublic)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${toPrivate}` },
        body: JSON.stringify(payload),
        cache: 'no-store',
      });
      const ok = r.ok; let err: string | undefined; if (!ok) { try { err = await r.text(); } catch {} }
      return NextResponse.json({ ok, action: ok ? 'updated' : 'update_failed', id: existing.id, slug, sourceId, model: src.__model, error: err }, { status: 200 });
    } else {
      const r = await fetch('https://builder.io/api/v3/content/page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${toPrivate}` },
        body: JSON.stringify(payload),
        cache: 'no-store',
      });
      let id: string | undefined; let err: string | undefined; const ok = r.ok;
      if (ok) { try { const j = await r.json(); id = j?.id || j?.data?.id; } catch {} } else { try { err = await r.text(); } catch {} }
      return NextResponse.json({ ok, action: ok ? 'created' : 'create_failed', id, slug, sourceId, model: src.__model, error: err }, { status: 200 });
    }
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed' }, { status: 200 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams, origin } = new URL(req.url);
    const fromPublic = (searchParams.get('fromPublicKey') || '').trim();
    const fromPrivate = (searchParams.get('fromPrivateKey') || '').trim();
    const id = (searchParams.get('id') || searchParams.get('sourceId') || '').trim();
    const slug = ensureLeadingSlash(searchParams.get('slug') || '/');
    const publish = searchParams.get('publish') === 'true';
    if (!fromPublic || !id) return NextResponse.json({ ok: false, error: 'Use ?fromPublicKey=...&id=...&slug=/&publish=true' }, { status: 200 });

    const res = await fetch(`${origin}/api/cms/copy-by-id`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromPublicKey: fromPublic, fromPrivateKey: fromPrivate || undefined, id, slug, publish }),
      cache: 'no-store',
    });
    const text = await res.text();
    let json: any = {}; try { json = text ? JSON.parse(text) : {}; } catch { json = { ok: false, error: `Invalid JSON (HTTP ${res.status})`, raw: text }; }
    return NextResponse.json(json, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed' }, { status: 200 });
  }
}
