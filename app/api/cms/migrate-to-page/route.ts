import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function ensureLeadingSlash(path: string) {
  const s = `/${String(path || "").trim()}`.replace(/\/+/, "/");
  return s === "/" ? "/" : s.replace(/\/$/, "");
}

async function fetchAll<T = any>(model: string, apiKey: string, limit = 100): Promise<T[]> {
  const items: T[] = [];
  let offset = 0;
  while (true) {
    const url = `https://cdn.builder.io/api/v3/content/${encodeURIComponent(model)}?apiKey=${encodeURIComponent(apiKey)}&includeUnpublished=true&limit=${Math.min(50, limit)}&offset=${offset}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) break;
    const json = await res.json();
    const arr = Array.isArray(json?.results) ? json.results : [];
    items.push(...arr);
    if (arr.length < Math.min(50, limit)) break;
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

export async function POST(req: NextRequest) {
  try {
    let body: any = null;
    try { body = await req.json(); } catch {}

    const pubKey = (body?.publicKey || req.headers.get("x-builder-public-key") || process.env.BUILDER_PUBLIC_API_KEY || process.env.NEXT_PUBLIC_BUILDER_API_KEY || "").trim();
    const privKey = (body?.privateKey || req.headers.get("x-builder-private-key") || process.env.BUILDER_PRIVATE_API_KEY || process.env.BUILDER_WRITE_API_KEY || "").trim();
    if (!pubKey) return NextResponse.json({ ok: false, error: "Missing public key" }, { status: 200 });
    if (!privKey) return NextResponse.json({ ok: false, error: "Missing private key (required to create Page entries)" }, { status: 200 });

    const names: string[] = Array.isArray(body?.names) ? body.names.map((s: any) => String(s).trim()).filter(Boolean) : [];
    const includePrefixes: string[] = Array.isArray(body?.includePrefixes) ? body.includePrefixes.map((s: any) => ensureLeadingSlash(s)).filter(Boolean) : [];
    const remap: Record<string, string> = (body?.remap && typeof body.remap === 'object') ? body.remap : {};
    const limit: number = Math.max(1, Math.min(500, parseInt(String(body?.limit ?? 200), 10) || 200));
    const publish: boolean = !!body?.publish;

    // Load all structured pages
    const structured = await fetchAll<any>("pages", pubKey, limit);

    const wanted: any[] = [];
    for (const it of structured) {
      const d = (it?.data || {}) as Record<string, any>;
      const name = String(it?.name || d?.title || "");
      let slug = d?.slug ? ensureLeadingSlash(d.slug) : (it?.url ? ensureLeadingSlash(it.url) : "");
      if (!slug) continue;
      const noFilters = names.length === 0 && includePrefixes.length === 0;
      const matchName = names.length ? names.some(n => name.toLowerCase().includes(n.toLowerCase())) : false;
      const matchPrefix = includePrefixes.some(p => slug === p || slug.startsWith(p + "/"));
      if (noFilters || matchName || matchPrefix) {
        for (const [from, to] of Object.entries(remap)) {
          const f = ensureLeadingSlash(from);
          const t = ensureLeadingSlash(to);
          if (slug === f) slug = t;
          else if (slug.startsWith(f + "/")) slug = t + slug.slice(f.length);
        }
        wanted.push({ id: it.id, name, slug, data: d });
      }
    }

    const results: any[] = [];

    for (const w of wanted) {
      const existing = await getPageByUrl(w.slug, pubKey);
      const payload: any = {
        name: w.name || w.slug,
        url: w.slug,
        data: {
          title: w.data?.title || w.name || w.slug,
          seoTitle: w.data?.seoTitle || w.data?.title || w.name,
          metaDescription: w.data?.metaDescription || w.data?.excerpt || "",
          author: w.data?.author || undefined,
          publishedAtUtcMs: w.data?.publishedAtUtcMs || w.data?.publishedDate || undefined,
        },
        published: publish,
      };
      if (existing?.id) {
        const res = await fetch(`https://builder.io/api/v3/content/page/${encodeURIComponent(existing.id)}?apiKey=${encodeURIComponent(pubKey)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${privKey}` },
          body: JSON.stringify({ name: payload.name, url: payload.url, data: payload.data, ...(publish ? { published: true } : {}) }),
          cache: "no-store",
        });
        const ok = res.ok;
        let err: string | undefined;
        if (!ok) { try { const j = await res.json(); err = JSON.stringify(j); } catch { err = `HTTP ${res.status}`; } }
        results.push({ slug: w.slug, action: ok ? "updated" : "update_failed", id: existing.id, error: err });
      } else {
        const res = await fetch("https://builder.io/api/v3/content/page", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${privKey}` },
          body: JSON.stringify(payload),
          cache: "no-store",
        });
        let id: string | undefined;
        let err: string | undefined;
        if (res.ok) {
          try { const j = await res.json(); id = j?.id || j?.data?.id || undefined; } catch {}
        } else {
          try { const j = await res.json(); err = JSON.stringify(j); } catch { err = `HTTP ${res.status}`; }
        }
        results.push({ slug: w.slug, action: res.ok ? "created" : "create_failed", id, error: err });
      }
    }

    return NextResponse.json({ ok: true, count: results.length, results }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status: 200 });
  }
}
