import { NextRequest, NextResponse } from "next/server";
import {
  fetchBlogPosts,
  type BlogPost,
  type BuilderContent,
} from "../../../../lib/builder-cms";
import { fetchArticleMeta } from "../../../../lib/article-meta";

export const dynamic = "force-dynamic";

const MIN_VALID = Date.UTC(2000, 0, 1);
const MS_THRESHOLD = 1_000_000_000_000; // ~2001 in ms
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

function buildDatePatch(existing: Record<string, any>, publishedAtUtcMs: number | null, updatedAtUtcMs: number | null) {
  const patch: Record<string, any> = {};
  const keysToSet: string[] = [];
  const iso = (ms: number) => new Date(ms).toISOString();
  if (publishedAtUtcMs) {
    const numberKeys = ["publishedAtUtcMs","publishedDate"]; // Builder date field expects ms
    const stringKeys = ["datePublished","publishedAt","publishedOn","date","date_published"];
    const otherKeys = ["published_at","published_on","publish_date"]; // unknown types; set ms for safety
    for (const key of numberKeys) { patch[key] = publishedAtUtcMs; keysToSet.push(key); }
    for (const key of stringKeys) { patch[key] = iso(publishedAtUtcMs); keysToSet.push(key); }
    for (const key of otherKeys) { patch[key] = publishedAtUtcMs; keysToSet.push(key); }
  }
  if (updatedAtUtcMs) {
    const numberKeys = ["updatedAtUtcMs"];
    const stringKeys = ["updatedDate","dateModified","modified","modifiedAt"]; // write ISO strings
    const otherKeys = ["modified_at"]; // keep ms
    for (const key of numberKeys) { patch[key] = updatedAtUtcMs; keysToSet.push(key); }
    for (const key of stringKeys) { patch[key] = iso(updatedAtUtcMs); keysToSet.push(key); }
    for (const key of otherKeys) { patch[key] = updatedAtUtcMs; keysToSet.push(key); }
  }
  return { patch, keys: Array.from(new Set(keysToSet)) } as const;
}

async function updateBuilderItem(
  model: string,
  id: string,
  dataPatch: Partial<BlogPost>,
  overrideKey?: string | null,
  overridePublicKey?: string | null,
) {
  const privateKey =
    overrideKey ||
    process.env.BUILDER_PRIVATE_API_KEY ||
    process.env.BUILDER_WRITE_API_KEY;
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

async function fetchModelItems(model: string, limit = 50, overridePublicKey?: string | null) {
  const apiKey = overridePublicKey || process.env.BUILDER_PUBLIC_API_KEY || process.env.NEXT_PUBLIC_BUILDER_API_KEY;
  if (!apiKey) return [] as any[];
  const url = `https://cdn.builder.io/api/v3/content/${encodeURIComponent(model)}?apiKey=${encodeURIComponent(apiKey)}&limit=${limit}&includeUnpublished=true`;
  const res = await fetch(url, { cache: "no-store", next: { revalidate: 0 } });
  if (!res.ok) return [] as any[];
  const json = await res.json();
  return Array.isArray(json?.results) ? json.results : [];
}

function getWpOriginFromUrl(url: string): string | null {
  try { return new URL(url).origin; } catch { return null; }
}

function getSlugFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    const slug = parts[parts.length - 1] || "";
    return slug || null;
  } catch { return null; }
}

async function fetchWpDates(origin: string, slug: string): Promise<{ publishedAtUtcMs: number | null; updatedAtUtcMs: number | null; source: "posts" | "pages" | null; } | null> {
  if (!origin || !slug) return null;
  const endpoints = [
    `${origin}/wp-json/wp/v2/posts?slug=${encodeURIComponent(slug)}&_fields=date_gmt,modified_gmt,date,modified&per_page=1`,
    `${origin}/wp-json/wp/v2/pages?slug=${encodeURIComponent(slug)}&_fields=date_gmt,modified_gmt,date,modified&per_page=1`,
  ];
  for (let i = 0; i < endpoints.length; i++) {
    try {
      const controller = new AbortController();
      const to = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(endpoints[i], {
        signal: controller.signal,
        cache: "no-store",
        next: { revalidate: 0 },
        headers: { "user-agent": "MetaSyncBot/1.0 (+https://builder.io)" },
      });
      clearTimeout(to);
      if (!res.ok) continue;
      const arr = await res.json();
      const p = Array.isArray(arr) ? arr[0] : null;
      if (!p) continue;
      const publishedAtUtcMs = toUtcMs(p?.date_gmt) ?? toUtcMs(p?.date);
      const updatedAtUtcMs = toUtcMs(p?.modified_gmt) ?? toUtcMs(p?.modified);
      return { publishedAtUtcMs: publishedAtUtcMs ?? null, updatedAtUtcMs: updatedAtUtcMs ?? null, source: i === 0 ? "posts" : "pages" };
    } catch {}
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    let body: any = null;
    try { body = await req.json(); } catch {}
    const headerKey = (req.headers.get("x-builder-private-key") || "").trim() || undefined;
    const bodyKey = typeof body?.privateKey === 'string' ? body.privateKey.trim() : undefined;
    const overrideModel = (req.headers.get('x-builder-model') || body?.model || '').trim();
    const headerPubKey = req.headers.get('x-builder-public-key');
    const bodyPubKey = body?.publicKey as string | undefined;
    const overridePubKey = (headerPubKey || bodyPubKey || '').trim() || null;
    const siteOverride = (req.headers.get('x-site') || body?.site || '').trim();

    // Field selection controls
    const only = typeof body?.only === 'string' ? body.only : '';
    const fields = Array.isArray(body?.fields) ? body.fields.map((s:any)=>String(s)) : [];
    const includeAuthor = only ? only === 'author' : (fields.length ? fields.includes('author') : true);
    const includeDate = only ? only === 'publishedDate' : (fields.length ? fields.includes('publishedDate') : true);
    const includeImage = only ? only === 'coverImage' : (fields.length ? fields.includes('coverImage') : true);
    const includeMetaDesc = only ? only === 'metaDescription' : (fields.length ? fields.includes('metaDescription') : true);
    const includeSeoTitle = only ? only === 'seoTitle' : (fields.length ? fields.includes('seoTitle') : false);
    const includeCanonical = only ? only === 'canonicalUrl' : (fields.length ? fields.includes('canonicalUrl') : false);

    let usedModel: string | null = null;
    let posts: any[] = [];
    const triedModels: string[] = [];
    const maxToProcess = Math.max(1, Math.min(50, parseInt(String(body?.limit || ''), 10) || 20));

    if (overrideModel) {
      triedModels.push(overrideModel);
      const items = await fetchModelItems(overrideModel, maxToProcess, overridePubKey);
      if (items.length > 0) { usedModel = overrideModel; posts = items; }
    }

    if (!usedModel) {
      const candidates = [
        "page","pages",
        "blog-posts","blog","blogs","blog-post","posts","post","article","articles","builder-blog","builder-blog-posts"
      ];
      for (const m of candidates) {
        triedModels.push(m);
        const items = await fetchModelItems(m, maxToProcess, overridePubKey);
        if (items.length > 0) { usedModel = m; posts = items; break; }
      }
    }

    const results: any[] = [];
    for (const item of posts) {
      const d = (item.data || {}) as BlogPost;
      const url = d.canonicalUrl || (d.slug ? `https://keylargoscubadiving.com${d.slug}` : undefined);
      if (!url) {
        results.push({ id: item.id, slug: d.slug, url: null, found: {}, patch: {}, updated: false, updateError: "no_slug_or_canonical" });
        continue;
      }

      // REST-first date sourcing
      const origin = siteOverride || getWpOriginFromUrl(url) || 'https://keylargoscubadiving.com';
      const slug = getSlugFromUrl(url);
      const wp = includeDate && slug ? await fetchWpDates(origin, slug) : null;

      // Fallback: parse live HTML for JSON-LD/meta
      let meta: any = {};
      const needsMeta = (includeAuthor || includeImage || includeMetaDesc || includeSeoTitle || includeCanonical || (includeDate && !wp?.publishedAtUtcMs));
      if (needsMeta) {
        meta = await fetchArticleMeta(url);
      }
      if (includeDate && !slug) {
        results.push({ id: item.id, slug: d.slug, url, found: { ...(meta || {}) }, patch: {}, updated: false, updateError: "no_slug_for_wp" });
        continue;
      }

      const patch: Partial<BlogPost> = {};
      if (includeAuthor && meta.author && !d.author) patch.author = meta.author;

      if (includeDate) {
        const restPublished = wp?.publishedAtUtcMs ?? null;
        const restUpdated = wp?.updatedAtUtcMs ?? null;
        let publishedAtUtcMs = restPublished;
        let updatedAtUtcMs = restUpdated;

        if (!publishedAtUtcMs) {
          // Fallback to JSON-LD/meta
          const ldPub = toUtcMs(meta.publishedDate);
          const ldMod = toUtcMs((meta as any).updatedDate);
          if (ldPub) publishedAtUtcMs = ldPub;
          if (ldMod) updatedAtUtcMs = ldMod;
        }

        if (publishedAtUtcMs) {
          const { patch: datePatch } = buildDatePatch((item.data || {}) as Record<string, any>, publishedAtUtcMs, updatedAtUtcMs ?? null);
          Object.assign(patch as any, datePatch);
        }
      }

      if (includeImage && meta.coverImage && !d.coverImage) patch.coverImage = meta.coverImage;
      if (includeMetaDesc && meta.description) (patch as any).metaDescription = meta.description;
      if (includeSeoTitle && meta.title) (patch as any).seoTitle = meta.title;
      if (includeCanonical && meta.canonical) (patch as any).canonicalUrl = meta.canonical;
      let updated = false;
      let updateError: string | undefined;
      if (Object.keys(patch).length) {
        const res = await updateBuilderItem(usedModel || "blog-posts", item.id, patch, bodyKey || headerKey, overridePubKey);
        if (res.ok) updated = true; else updateError = res.reason;
      }
      results.push({ id: item.id, slug: d.slug, url, found: { ...(meta || {}), wp }, patch, updated, updateError });
    }
    const missingKey = !((bodyKey || headerKey) || process.env.BUILDER_PRIVATE_API_KEY || process.env.BUILDER_WRITE_API_KEY);
    return NextResponse.json({ ok: true, count: results.length, missingPrivateKey: missingKey, usedModel, triedModels, results }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status: 200 });
  }
}
