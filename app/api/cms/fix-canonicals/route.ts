import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function updateBuilderItem(model: string, id: string, dataPatch: Record<string, any>, privateKey?: string | null, publicKey?: string | null) {
  const pk = privateKey || process.env.BUILDER_PRIVATE_API_KEY || process.env.BUILDER_WRITE_API_KEY;
  if (!pk) return { ok: false, reason: "missing_private_key" } as const;
  const pub = publicKey || process.env.BUILDER_PUBLIC_API_KEY || process.env.NEXT_PUBLIC_BUILDER_API_KEY || "";
  const url = `https://builder.io/api/v3/content/${encodeURIComponent(model)}/${encodeURIComponent(id)}${pub ? `?apiKey=${encodeURIComponent(pub)}` : ''}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${pk}`,
    },
    body: JSON.stringify({ data: dataPatch }),
    next: { revalidate: 0 },
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const j = await res.json(); msg = `${msg}: ${JSON.stringify(j)}`; } catch {}
    return { ok: false, reason: msg } as const;
  }
  return { ok: true } as const;
}

async function fetchModelItems(model: string, limit = 50, offset = 0, publicKey?: string | null) {
  const apiKey = publicKey || process.env.BUILDER_PUBLIC_API_KEY || process.env.NEXT_PUBLIC_BUILDER_API_KEY;
  if (!apiKey) return [] as any[];
  const url = `https://cdn.builder.io/api/v3/content/${encodeURIComponent(model)}?apiKey=${encodeURIComponent(apiKey)}&limit=${limit}&offset=${offset}&includeUnpublished=true`;
  const res = await fetch(url, { cache: "no-store", next: { revalidate: 0 } });
  if (!res.ok) return [] as any[];
  const json = await res.json();
  return Array.isArray(json?.results) ? json.results : [];
}

export async function POST(req: NextRequest) {
  try {
    let body: any = null;
    try { body = await req.json(); } catch {}
    const overrideModel = (req.headers.get('x-builder-model') || body?.model || '').trim();
    const overridePubKey = (req.headers.get('x-builder-public-key') || body?.publicKey || '').trim() || null;
    const overridePrivKey = (req.headers.get('x-builder-private-key') || body?.privateKey || '').trim() || null;

    // Detect model
    let usedModel: string | null = null;
    let sample: any[] = [];
    const triedModels: string[] = [];
    if (overrideModel) {
      triedModels.push(overrideModel);
      sample = await fetchModelItems(overrideModel, 1, 0, overridePubKey);
      if (sample.length) usedModel = overrideModel;
    }
    if (!usedModel) {
      const candidates = ["page","pages","blog-posts","blog","blogs","blog-post","posts","post","article","articles","builder-blog","builder-blog-posts"];
      for (const m of candidates) {
        triedModels.push(m);
        const r = await fetchModelItems(m, 1, 0, overridePubKey);
        if (r.length) { usedModel = m; break; }
      }
    }
    if (!usedModel) return NextResponse.json({ ok: false, error: "No Builder model found", triedModels }, { status: 200 });

    const limit = Math.max(1, Math.min(100, parseInt(String(body?.limit || ''), 10) || 50));
    const maxTotal = Math.max(limit, Math.min(2000, parseInt(String(body?.maxTotal || ''), 10) || 500));

    let offset = 0;
    let processed = 0;
    let updated = 0;
    let skipped = 0;
    const items: any[] = [];

    while (processed < maxTotal) {
      const batch = await fetchModelItems(usedModel, limit, offset, overridePubKey);
      if (!batch.length) break;
      items.push(...batch);
      processed += batch.length;
      offset += batch.length;
    }

    const results: any[] = [];
    const base = 'https://keylargoscubadiving.com';
    const normalizeCanon = (path: string) => {
      try {
        const u = new URL(path, base);
        let p = u.pathname || '/';
        if (!p.endsWith('/')) p += '/';
        return `${base}${p}`;
      } catch {
        const s = String(path || '').trim();
        const p = s.startsWith('/') ? s : `/${s}`;
        return `${base}${p.endsWith('/') ? p : p + '/'}`;
      }
    };

    for (const item of items) {
      const data = item?.data || {};
      const slug: string | undefined = data.slug;
      if (!slug) { skipped++; results.push({ id: item.id, reason: 'no_slug' }); continue; }
      const desired = normalizeCanon(slug);
      const current = data.canonicalUrl || null;
      if (current === desired) { skipped++; results.push({ id: item.id, slug, canonical: current, reason: 'already_equal' }); continue; }
      const res = await updateBuilderItem(usedModel, item.id, { canonicalUrl: desired }, overridePrivKey, overridePubKey);
      if (res.ok) { updated++; results.push({ id: item.id, slug, from: current, to: desired, updated: true }); }
      else { results.push({ id: item.id, slug, error: res.reason, updated: false }); }
    }

    const missingKey = !((overridePrivKey) || process.env.BUILDER_PRIVATE_API_KEY || process.env.BUILDER_WRITE_API_KEY);
    return NextResponse.json({ ok: true, usedModel, triedModels, total: items.length, updated, skipped, missingPrivateKey: missingKey, results }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed' }, { status: 200 });
  }
}
