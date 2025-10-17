import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function fetchModelItems(model: string, limit = 50, offset = 0, publicKey?: string | null) {
  const apiKey = publicKey || process.env.BUILDER_PUBLIC_API_KEY || process.env.NEXT_PUBLIC_BUILDER_API_KEY;
  if (!apiKey) return [] as any[];
  const url = `https://cdn.builder.io/api/v3/content/${encodeURIComponent(model)}?apiKey=${encodeURIComponent(apiKey)}&limit=${limit}&offset=${offset}&includeUnpublished=true`;
  const res = await fetch(url, { cache: "no-store", next: { revalidate: 0 } });
  if (!res.ok) return [] as any[];
  const json = await res.json();
  return Array.isArray(json?.results) ? json.results : [];
}

async function updateBuilderItem(model: string, id: string, dataPatch: Record<string, any>, privateKey?: string | null, publicKey?: string | null) {
  const pk = privateKey || process.env.BUILDER_PRIVATE_API_KEY || process.env.BUILDER_WRITE_API_KEY;
  if (!pk) return { ok: false, reason: "missing_private_key" } as const;
  const pub = publicKey || process.env.BUILDER_PUBLIC_API_KEY || process.env.NEXT_PUBLIC_BUILDER_API_KEY || "";
  const url = `https://builder.io/api/v3/content/${encodeURIComponent(model)}/${encodeURIComponent(id)}${pub ? `?apiKey=${encodeURIComponent(pub)}` : ''}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${pk}` },
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

function lastPathSegment(path: string): string | null {
  const parts = path.split("/").filter(Boolean);
  return parts.length ? parts[parts.length - 1] : null;
}

async function fetchWpContent(base: string, segment: string, type: "posts" | "pages") {
  const url = `${base.replace(/\/+$/, '')}/wp-json/wp/v2/${type}?slug=${encodeURIComponent(segment)}&_fields=content,title,excerpt,date,modified`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  const arr = await res.json();
  return Array.isArray(arr) && arr[0] ? arr[0] : null;
}

export async function POST(req: NextRequest) {
  try {
    let body: any = null;
    try { body = await req.json(); } catch {}
    const overrideModel = (req.headers.get('x-builder-model') || body?.model || '').trim();
    const overridePubKey = (req.headers.get('x-builder-public-key') || body?.publicKey || '').trim() || null;
    const overridePrivKey = (req.headers.get('x-builder-private-key') || body?.privateKey || '').trim() || null;
    const wpBase = (process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://keylargoscubadiving.com').replace(/\/+$/, '');

    let usedModel: string | null = null;
    if (overrideModel) usedModel = overrideModel;
    else usedModel = 'blog-posts';
    const limit = Math.max(1, Math.min(100, parseInt(String(body?.limit || ''), 10) || 50));
    const maxTotal = Math.max(limit, Math.min(1000, parseInt(String(body?.maxTotal || ''), 10) || 200));

    // Load items
    const items: any[] = [];
    for (let off = 0; items.length < maxTotal; off += limit) {
      const batch = await fetchModelItems(usedModel, limit, off, overridePubKey);
      if (!batch.length) break;
      items.push(...batch);
    }

    let updated = 0, skipped = 0;
    const results: any[] = [];

    for (const item of items) {
      const d = item?.data || {};
      const slugPath: string | undefined = d.slug;
      const canonical: string | undefined = d.canonicalUrl;
      const path = slugPath || (canonical ? new URL(canonical).pathname : undefined);
      if (!path) { skipped++; results.push({ id: item.id, reason: 'no_slug_or_canonical' }); continue; }
      const seg = lastPathSegment(path);
      if (!seg) { skipped++; results.push({ id: item.id, reason: 'no_last_segment', path }); continue; }
      const type: "posts" | "pages" = usedModel === 'pages' ? 'pages' : 'posts';
      const wp = await fetchWpContent(wpBase, seg, type);
      const html = wp?.content?.rendered;
      if (!html) { skipped++; results.push({ id: item.id, slug: seg, reason: 'wp_no_content' }); continue; }
      const res = await updateBuilderItem(usedModel, item.id, { body: String(html) }, overridePrivKey, overridePubKey);
      if (res.ok) { updated++; results.push({ id: item.id, slug: seg, updated: true }); }
      else { results.push({ id: item.id, slug: seg, updated: false, error: res.reason }); }
    }

    return NextResponse.json({ ok: true, model: usedModel, total: items.length, updated, skipped, results }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed' }, { status: 200 });
  }
}
