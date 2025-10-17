import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function ensureLeadingSlash(path: string) {
  const s = `/${String(path || "").trim()}`.replace(/\/+/g, "/");
  return s === "/" ? "/" : s.replace(/\/$/, "");
}

async function fetchAll<T = any>(model: string, apiKey: string, limit = 500): Promise<T[]> {
  const items: T[] = [];
  let offset = 0;
  const pageSize = 50;
  while (true) {
    const url = `https://cdn.builder.io/api/v3/content/${encodeURIComponent(model)}?apiKey=${encodeURIComponent(apiKey)}&includeUnpublished=true&limit=${Math.min(pageSize, limit)}&offset=${offset}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) break;
    const json = await res.json();
    const arr = Array.isArray(json?.results) ? json.results : [];
    items.push(...arr);
    if (arr.length < Math.min(pageSize, limit)) break;
    offset += arr.length;
    if (items.length >= limit) break;
  }
  return items;
}

async function getPageByUrl(urlPath: string, apiKey: string) {
  const tries = [urlPath, urlPath.endsWith('/') ? urlPath.slice(0, -1) : urlPath + '/'];
  for (const p of tries) {
    const url = `https://cdn.builder.io/api/v3/content/page?apiKey=${encodeURIComponent(apiKey)}&includeUnpublished=true&limit=1&query.url=${encodeURIComponent(p)}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) continue;
    const json = await res.json();
    const item = Array.isArray(json?.results) && json.results[0] ? json.results[0] : null;
    if (item) return item;
  }
  return null as any;
}

function applyRemap(slug: string, remap: Record<string, string>) {
  let s = ensureLeadingSlash(slug);
  for (const [from, to] of Object.entries(remap || {})) {
    const f = ensureLeadingSlash(from);
    const t = ensureLeadingSlash(to);
    if (s === f) s = t;
    else if (s.startsWith(f + "/")) s = t + s.slice(f.length);
  }
  return s;
}

export async function POST(req: NextRequest) {
  try {
    let body: any = null;
    try { body = await req.json(); } catch {}

    const pubKey = (body?.publicKey || req.headers.get("x-builder-public-key") || process.env.BUILDER_PUBLIC_API_KEY || process.env.NEXT_PUBLIC_BUILDER_API_KEY || "").trim();
    const privKey = (body?.privateKey || req.headers.get("x-builder-private-key") || process.env.BUILDER_PRIVATE_API_KEY || process.env.BUILDER_WRITE_API_KEY || "").trim();
    if (!pubKey) return NextResponse.json({ ok: false, error: "Missing public key" }, { status: 200 });
    if (!privKey) return NextResponse.json({ ok: false, error: "Missing private key (required to delete)" }, { status: 200 });

    const names: string[] = Array.isArray(body?.names) ? body.names.map((s: any) => String(s).trim()).filter(Boolean) : [];
    const includePrefixes: string[] = Array.isArray(body?.includePrefixes) ? body.includePrefixes.map((s: any) => ensureLeadingSlash(s)).filter(Boolean) : [];
    const remap: Record<string, string> = (body?.remap && typeof body.remap === 'object') ? body.remap : { "/certification": "/scuba-certification-courses-florida-keys" };
    const limit: number = Math.max(1, Math.min(1000, parseInt(String(body?.limit ?? 500), 10) || 500));
    const dryRun: boolean = !!body?.dryRun;

    // Load all structured model items (model: "pages")
    const structured = await fetchAll<any>("pages", pubKey, limit);

    const candidates: { id: string; name: string; slug: string; remapped: string }[] = [];
    for (const it of structured) {
      const d = (it?.data || {}) as Record<string, any>;
      const name = String(it?.name || d?.title || "");
      let slug = d?.slug ? ensureLeadingSlash(d.slug) : (it?.url ? ensureLeadingSlash(it.url) : "");
      if (!slug) continue;
      const noFilters = names.length === 0 && includePrefixes.length === 0;
      const matchName = names.length ? names.some(n => name.toLowerCase().includes(n.toLowerCase())) : false;
      const matchPrefix = includePrefixes.some(p => slug === p || slug.startsWith(p + "/"));
      if (noFilters || matchName || matchPrefix) {
        const remapped = applyRemap(slug, remap);
        candidates.push({ id: it.id, name, slug, remapped });
      }
    }

    const toDelete: { id: string; name: string; slug: string; remapped: string; pageId?: string }[] = [];

    for (const c of candidates) {
      const existing = await getPageByUrl(c.remapped, pubKey);
      if (existing?.id) {
        toDelete.push({ ...c, pageId: existing.id });
      }
    }

    const results: any[] = [];
    if (!dryRun) {
      for (const del of toDelete) {
        const url = `https://builder.io/api/v3/content/pages/${encodeURIComponent(del.id)}?apiKey=${encodeURIComponent(pubKey)}`;
        const res = await fetch(url, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${privKey}` },
          cache: "no-store",
        });
        let err: string | undefined;
        if (!res.ok) {
          try { const j = await res.json(); err = JSON.stringify(j); } catch { err = `HTTP ${res.status}`; }
        }
        results.push({ id: del.id, slug: del.slug, remapped: del.remapped, pageId: del.pageId, deleted: res.ok, error: err });
      }
    }

    return NextResponse.json({ ok: true, dryRun, candidates: candidates.length, deletable: toDelete.length, results: dryRun ? toDelete : results }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status: 200 });
  }
}
