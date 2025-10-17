import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function ensureLeadingSlash(path: string) {
  const s = `/${String(path || "").trim()}`.replace(/\/+/, "/");
  return s === "/" ? "/" : s.replace(/\/$/, "");
}

async function fetchJson(url: string, init?: RequestInit) {
  const res = await fetch(url, { cache: "no-store", ...(init || {}) });
  const text = await res.text();
  let json: any = {};
  try { json = text ? JSON.parse(text) : {}; } catch { json = { ok: false, error: `Invalid JSON (HTTP ${res.status})`, raw: text }; }
  return { res, json };
}

async function getPageByUrl(urlPath: string, apiKey: string) {
  const norm = ensureLeadingSlash(urlPath);
  const tries = [norm, norm.endsWith('/') ? norm.slice(0,-1) : norm + '/'];
  const endpoints = [
    (p: string) => `https://cdn.builder.io/api/v3/content/page?apiKey=${encodeURIComponent(apiKey)}&includeUnpublished=true&limit=1&query.url=${encodeURIComponent(p)}`,
  ];
  for (const p of tries) {
    for (const mk of endpoints) {
      const url = mk(p);
      try {
        const r = await fetch(url, { cache: "no-store" });
        if (!r.ok) continue;
        const j = await r.json();
        const item = Array.isArray(j?.results) && j.results[0] ? j.results[0] : null;
        if (item) return item;
      } catch {}
    }
  }
  return null as any;
}

export async function POST(req: NextRequest) {
  try {
    const { searchParams, origin } = new URL(req.url);
    let body: any = null; try { body = await req.json(); } catch {}

    const domainParam = (body?.domain || searchParams.get("domain") || process.env.NEXT_PUBLIC_WORDPRESS_URL || "").trim();
    if (!domainParam) return NextResponse.json({ ok: false, error: "Missing domain (provide body.domain or ?domain=)" }, { status: 200 });

    const limit = Math.max(1, Math.min(1000, parseInt(String(body?.limit ?? searchParams.get("limit") ?? "300"), 10) || 300));
    const publish = !!(body?.publish ?? (searchParams.get("publish") === "true"));
    const includePrefixes: string[] = Array.isArray(body?.includePrefixes) ? body.includePrefixes.map((s: any) => ensureLeadingSlash(String(s))) : [];

    const publicKey = (body?.publicKey || req.headers.get("x-builder-public-key") || process.env.BUILDER_PUBLIC_API_KEY || process.env.NEXT_PUBLIC_BUILDER_API_KEY || "").trim();
    const privateKey = (body?.privateKey || req.headers.get("x-builder-private-key") || process.env.BUILDER_PRIVATE_API_KEY || process.env.BUILDER_WRITE_API_KEY || "").trim();
    if (!publicKey) return NextResponse.json({ ok: false, error: "Missing Builder public key" }, { status: 200 });
    if (!privateKey) return NextResponse.json({ ok: false, error: "Missing Builder private key (required to create Page entries)" }, { status: 200 });

    const domain = domainParam.startsWith("http") ? domainParam : `https://${domainParam}`;

    // Use internal seo-audit endpoint to collect URLs and meta
    const auditUrl = `${origin}/api/seo-audit?domain=${encodeURIComponent(domain)}&limit=${limit}&concurrency=6`;
    const { json: audit } = await fetchJson(auditUrl);
    if (!audit?.ok) return NextResponse.json({ ok: false, error: audit?.error || "Failed to collect URLs from SEO audit" }, { status: 200 });

    const results: Array<{ slug: string; action: string; id?: string; error?: string }> = [];

    const urls: string[] = Array.isArray(audit?.results) ? audit.results.map((r: any) => r?.url).filter((u: any) => typeof u === 'string' && !!u) : [];
    const bySlug: string[] = [];
    const originUrl = new URL(domain).origin;
    for (const u of urls) {
      try {
        const urlObj = new URL(String(u));
        if (urlObj.origin !== originUrl) continue;
        const path = urlObj.pathname || "/";
        const slug = ensureLeadingSlash(path);
        if (includePrefixes.length > 0) {
          const ok = includePrefixes.some((p) => slug === p || slug.startsWith(p + "/"));
          if (!ok) continue;
        }
        if (!bySlug.includes(slug)) bySlug.push(slug);
      } catch {}
    }

    // Map audit meta by slug for better initial data
    const metaBySlug = new Map<string, any>();
    for (const row of (audit?.results || [])) {
      try {
        const u = new URL(String(row?.url));
        const slug = ensureLeadingSlash(u.pathname || "/");
        if (!metaBySlug.has(slug)) metaBySlug.set(slug, row);
      } catch {}
    }

    for (const slug of bySlug) {
      try {
        const existing = await getPageByUrl(slug, publicKey);
        const meta = metaBySlug.get(slug) || {};
        const title: string | undefined = (meta.title || meta.ogTitle || null) || undefined;
        const description: string | undefined = (meta.metaDescription || meta.ogDescription || null) || undefined;
        if (existing?.id) {
          // Update basic SEO fields if missing
          const patch: any = { data: {} as any };
          if (title && !(existing.data?.seoTitle || existing.data?.title)) patch.data.seoTitle = title;
          if (description && !(existing.data?.metaDescription)) patch.data.metaDescription = description;
          if (Object.keys(patch.data).length > 0) {
            const url = `https://builder.io/api/v3/content/page/${encodeURIComponent(existing.id)}?apiKey=${encodeURIComponent(publicKey)}`;
            const res = await fetch(url, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${privateKey}` }, body: JSON.stringify(patch), cache: "no-store" });
            if (!res.ok) {
              let err: string | undefined; try { err = await res.text(); } catch {}
              results.push({ slug, action: "update_failed", id: existing.id, error: err || `HTTP ${res.status}` });
              continue;
            }
          }
          results.push({ slug, action: "skipped_exists", id: existing.id });
        } else {
          const payload: any = {
            name: title || slug.replace(/\/(\w)/g, (_: any, c: string) => ` ${c.toUpperCase()}`).replace(/\//g, " ").trim() || slug,
            url: slug,
            data: {
              title: title || undefined,
              seoTitle: title || undefined,
              metaDescription: description || undefined,
            },
            published: publish,
          };
          const res = await fetch("https://builder.io/api/v3/content/page", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${privateKey}` },
            body: JSON.stringify(payload),
            cache: "no-store",
          });
          if (res.ok) {
            let id: string | undefined; try { const j = await res.json(); id = j?.id || j?.data?.id; } catch {}
            results.push({ slug, action: "created", id });
          } else {
            let err: string | undefined; try { err = await res.text(); } catch {}
            results.push({ slug, action: "create_failed", error: err || `HTTP ${res.status}` });
          }
        }
      } catch (e: any) {
        results.push({ slug, action: "error", error: e?.message || "Failed" });
      }
    }

    return NextResponse.json({ ok: true, domain, total: bySlug.length, results }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status: 200 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams, origin } = new URL(req.url);
    const domain = (searchParams.get("domain") || process.env.NEXT_PUBLIC_WORDPRESS_URL || "").trim();
    if (!domain) return NextResponse.json({ ok: false, error: "Missing domain (use ?domain=)" }, { status: 200 });
    const limit = Math.max(1, Math.min(1000, parseInt(searchParams.get("limit") || "300", 10)));
    const publish = searchParams.get("publish") === "true";
    const include = (searchParams.get("includePrefixes") || "").split(/[\,]/).map(s=>s.trim()).filter(Boolean);

    // Forward as POST to reuse the logic above
    const body = { domain, limit, publish, includePrefixes: include };
    const res = await fetch(`${origin}/api/cms/bulk-create-from-seo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const text = await res.text();
    let json: any = {}; try { json = text ? JSON.parse(text) : {}; } catch { json = { ok: false, error: `Invalid JSON (HTTP ${res.status})`, raw: text }; }
    return NextResponse.json(json, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status: 200 });
  }
}
