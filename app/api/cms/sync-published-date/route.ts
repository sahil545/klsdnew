import { NextRequest, NextResponse } from "next/server";
import type { BlogPost } from "../../../../lib/builder-cms";

export const dynamic = "force-dynamic";

const MIN_VALID = Date.UTC(2000, 0, 1);
const MS_THRESHOLD = 1_000_000_000_000;
function toUtcMs(input: string | number | null | undefined): number | null {
  if (input == null) return null;
  if (typeof input === "number") {
    const ms = input < MS_THRESHOLD ? input * 1000 : input;
    return Number.isFinite(ms) && ms >= MIN_VALID ? ms : null;
  }
  const s = String(input).trim();
  if (!s) return null;
  const ms = Date.parse(s);
  return Number.isFinite(ms) && ms >= MIN_VALID ? ms : null;
}

async function fetchModelItems(model: string, limit = 50, overridePublicKey?: string | null) {
  const apiKey = overridePublicKey || process.env.BUILDER_PUBLIC_API_KEY || process.env.NEXT_PUBLIC_BUILDER_API_KEY;
  if (!apiKey) return [] as any[];
  const url = `https://cdn.builder.io/api/v3/content/${encodeURIComponent(model)}?apiKey=${encodeURIComponent(apiKey)}&limit=${limit}&includeUnpublished=true`;
  const res = await fetch(url, { cache: "no-store", next: { revalidate: 0 } });
  if (!res.ok) return [] as any[];
  const json = await res.json();
  return Array.isArray(json?.results) ? json.results : [];
}

async function updateBuilderItem(
  model: string,
  id: string,
  dataPatch: Partial<BlogPost>,
  overrideKey?: string | null,
  overridePublicKey?: string | null,
) {
  const privateKey = overrideKey || process.env.BUILDER_PRIVATE_API_KEY || process.env.BUILDER_WRITE_API_KEY;
  if (!privateKey) return { ok: false, reason: "missing_private_key" } as const;
  const pubKey = overridePublicKey || process.env.BUILDER_PUBLIC_API_KEY || process.env.NEXT_PUBLIC_BUILDER_API_KEY || "";
  const url = `https://builder.io/api/v3/content/${encodeURIComponent(model)}/${encodeURIComponent(id)}${pubKey ? `?apiKey=${encodeURIComponent(pubKey)}` : ''}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${privateKey}`,
    },
    body: JSON.stringify({ data: dataPatch }),
    next: { revalidate: 0 },
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const j = await res.json();
      msg = `${msg}: ${JSON.stringify(j)}`;
    } catch {}
    return { ok: false, reason: msg } as const;
  }
  return { ok: true } as const;
}

function getOrigin(url: string): string | null { try { return new URL(url).origin; } catch { return null; } }
function getSlug(url: string): string | null {
  try { const u = new URL(url); const parts = u.pathname.split('/').filter(Boolean); return parts[parts.length - 1] || null; } catch { return null; }
}

function buildDatePatch(existing: Record<string, any>, publishedAtUtcMs: number | null, updatedAtUtcMs: number | null) {
  const patch: Record<string, any> = {};
  const keysToSet: string[] = [];
  const iso = (ms: number) => new Date(ms).toISOString();
  if (publishedAtUtcMs) {
    const numberKeys = ["publishedAtUtcMs","publishedDate"]; // Builder date field expects ms
    const stringKeys = ["datePublished","publishedAt","publishedOn","date","date_published"];
    const otherKeys = ["published_at","published_on","publish_date"];
    for (const key of numberKeys) { patch[key] = publishedAtUtcMs; keysToSet.push(key); }
    for (const key of stringKeys) { patch[key] = iso(publishedAtUtcMs); keysToSet.push(key); }
    for (const key of otherKeys) { patch[key] = publishedAtUtcMs; keysToSet.push(key); }
  }
  if (updatedAtUtcMs) {
    const numberKeys = ["updatedAtUtcMs"];
    const stringKeys = ["updatedDate","dateModified","modified","modifiedAt"];
    const otherKeys = ["modified_at"];
    for (const key of numberKeys) { patch[key] = updatedAtUtcMs; keysToSet.push(key); }
    for (const key of stringKeys) { patch[key] = iso(updatedAtUtcMs); keysToSet.push(key); }
    for (const key of otherKeys) { patch[key] = updatedAtUtcMs; keysToSet.push(key); }
  }
  return { patch, keys: Array.from(new Set(keysToSet)) } as const;
}

async function fetchWpDates(origin: string, slug: string) {
  const endpoints = [
    `${origin}/wp-json/wp/v2/posts?slug=${encodeURIComponent(slug)}&_fields=date_gmt,modified_gmt,date,modified&per_page=1`,
    `${origin}/wp-json/wp/v2/pages?slug=${encodeURIComponent(slug)}&_fields=date_gmt,modified_gmt,date,modified&per_page=1`,
  ];
  for (let i = 0; i < endpoints.length; i++) {
    try {
      const controller = new AbortController();
      const to = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(endpoints[i], { signal: controller.signal, cache: "no-store", next: { revalidate: 0 }, headers: { "user-agent": "MetaSyncBot/1.0 (+https://builder.io)" } });
      clearTimeout(to);
      if (!res.ok) continue;
      const arr = await res.json();
      const p = Array.isArray(arr) ? arr[0] : null;
      if (!p) continue;
      const publishedAtUtcMs = toUtcMs(p?.date_gmt) ?? toUtcMs(p?.date) ?? null;
      const updatedAtUtcMs = toUtcMs(p?.modified_gmt) ?? toUtcMs(p?.modified) ?? null;
      return { publishedAtUtcMs, updatedAtUtcMs, source: i === 0 ? 'posts' : 'pages' } as const;
    } catch {}
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    let body: any = null; try { body = await req.json(); } catch {}
    const headerKey = (req.headers.get("x-builder-private-key") || "").trim() || undefined;
    const bodyKey = typeof body?.privateKey === 'string' ? body.privateKey.trim() : undefined;
    const headerPubKey = req.headers.get('x-builder-public-key');
    const bodyPubKey = body?.publicKey as string | undefined;
    const overridePubKey = (headerPubKey || bodyPubKey || '').trim() || null;
    const overrideModel = (req.headers.get('x-builder-model') || body?.model || '').trim();
    const siteOverride = (req.headers.get('x-site') || body?.site || '').trim();
    const maxToProcess = Math.max(1, Math.min(50, parseInt(String(body?.limit || ''), 10) || 20));

    let usedModel: string | null = null;
    let items: any[] = [];
    const triedModels: string[] = [];

    if (overrideModel) {
      triedModels.push(overrideModel);
      const r = await fetchModelItems(overrideModel, maxToProcess, overridePubKey);
      if (r.length) { usedModel = overrideModel; items = r; }
    }
    if (!usedModel) {
      const candidates = ["page","pages","blog-posts","blog","blogs","blog-post","posts","post","article","articles","builder-blog","builder-blog-posts"];
      for (const m of candidates) {
        triedModels.push(m);
        const r = await fetchModelItems(m, maxToProcess, overridePubKey);
        if (r.length) { usedModel = m; items = r; break; }
      }
    }

    const results: any[] = [];
    for (const it of items) {
      const d = (it.data || {}) as BlogPost & { canonicalUrl?: string; slug?: string };
      const url = d.canonicalUrl || (d.slug ? `https://keylargoscubadiving.com${d.slug}` : undefined);
      if (!url) { results.push({ id: it.id, slug: d.slug, updated: false, error: 'no_url' }); continue; }
      const origin = siteOverride || getOrigin(url) || 'https://keylargoscubadiving.com';
      const slug = getSlug(url);
      if (!slug) { results.push({ id: it.id, url, updated: false, error: 'no_slug' }); continue; }

      const wp = await fetchWpDates(origin, slug);
      if (!wp || !wp.publishedAtUtcMs) { results.push({ id: it.id, url, updated: false, error: 'wp_dates_missing' }); continue; }

      const { patch, keys } = buildDatePatch((it.data || {}) as Record<string, any>, wp.publishedAtUtcMs, wp.updatedAtUtcMs);

      const res = await updateBuilderItem(usedModel || 'blog-posts', it.id, patch as any, bodyKey || headerKey, overridePubKey);
      const found = {
        publishedDate: wp.publishedAtUtcMs ? new Date(wp.publishedAtUtcMs).toISOString() : undefined,
        updatedDate: wp.updatedAtUtcMs ? new Date(wp.updatedAtUtcMs).toISOString() : undefined,
      };
      results.push({ id: it.id, slug, url, wp, patch, targetKeys: keys, found, updated: !!res.ok, updateError: res.ok ? undefined : res.reason });
    }

    const missingKey = !((bodyKey || headerKey) || process.env.BUILDER_PRIVATE_API_KEY || process.env.BUILDER_WRITE_API_KEY);
    return NextResponse.json({ ok: true, count: results.length, usedModel, triedModels, missingPrivateKey: missingKey, results }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed' }, { status: 200 });
  }
}
