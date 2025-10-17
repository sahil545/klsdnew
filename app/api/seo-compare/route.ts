import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function normalizeWhitespace(s?: string | null) {
  return (s || "").replace(/\s+/g, " ").trim();
}

function urlsEqual(a?: string | null, b?: string | null) {
  const na = normalizeWhitespace(a);
  const nb = normalizeWhitespace(b);
  if (!na && !nb) return true;
  try {
    return new URL(na).toString() === new URL(nb).toString();
  } catch {
    return na === nb;
  }
}

function pathEqual(a?: string | null, b?: string | null) {
  try {
    const pa = new URL(a || "http://x/").pathname.replace(/\/+/g, "/").replace(/\/$/, "");
    const pb = new URL(b || "http://x/").pathname.replace(/\/+/g, "/").replace(/\/$/, "");
    return pa === pb;
  } catch {
    const pa = String(a || "").replace(/^https?:\/\/[^/]+/, "").replace(/\/+/g, "/").replace(/\/$/, "");
    const pb = String(b || "").replace(/^https?:\/\/[^/]+/, "").replace(/\/+/g, "/").replace(/\/$/, "");
    return pa === pb;
  }
}

function extractBetween(text: string, regex: RegExp): string | null {
  const m = text.match(regex);
  return m && m[1] ? m[1].trim() : null;
}

function extractMetaContent(head: string, key: { attr: "name" | "property"; value: string }): string | null {
  const re1 = new RegExp(`<meta[^>]*${key.attr}=["']${key.value}["'][^>]*content=["']([\s\S]*?)["'][^>]*>`, "i");
  const re2 = new RegExp(`<meta[^>]*content=["']([\s\S]*?)["'][^>]*${key.attr}=["']${key.value}["'][^>]*>`, "i");
  return extractBetween(head, re1) || extractBetween(head, re2);
}

function resolveUrl(base: string, maybeRelative: string | null): string | null {
  if (!maybeRelative) return null;
  try {
    return new URL(maybeRelative, base).toString();
  } catch {
    return maybeRelative;
  }
}

async function fetchWithTimeout(url: string, ms: number, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: controller.signal, cache: "no-store" });
  } finally {
    clearTimeout(t);
  }
}

function analyzeHtml(url: string, html: string) {
  const head = html.substring(0, 200000);
  const title = extractBetween(head, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const metaDescription = extractMetaContent(head, { attr: "name", value: "description" });
  const canonical = resolveUrl(
    url,
    extractBetween(head, /<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i) ||
      extractBetween(head, /<link[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["'][^>]*>/i),
  );
  const ogTitle = extractMetaContent(head, { attr: "property", value: "og:title" });
  const articlePublished = extractMetaContent(head, { attr: "property", value: "article:published_time" }) || extractMetaContent(head, { attr: "name", value: "pubdate" });
  return { title, metaDescription, canonical, ogTitle, articlePublished };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const liveUrl = (searchParams.get("liveUrl") || "").trim();
    const timeoutMs = Math.max(2000, Math.min(15000, parseInt(searchParams.get("timeout") || "8000", 10)));
    if (!liveUrl) return NextResponse.json({ ok: false, error: "Missing liveUrl" }, { status: 200 });

    const proto = (req.headers.get("x-forwarded-proto") || "https").split(",")[0].trim();
    const host = (req.headers.get("x-forwarded-host") || req.headers.get("host") || "").split(",")[0].trim();
    if (!host) return NextResponse.json({ ok: false, error: "Cannot determine current host" }, { status: 200 });
    const currentOrigin = `${proto}://${host}`;

    let newUrl: string;
    try {
      const lu = new URL(liveUrl);
      newUrl = `${currentOrigin}${lu.pathname}${lu.search}`;
    } catch {
      return NextResponse.json({ ok: false, error: "Invalid liveUrl" }, { status: 200 });
    }

    const [lr, nr] = await Promise.all([
      fetchWithTimeout(liveUrl, timeoutMs, { headers: { "User-Agent": "KLSD-SEO-Compare/1.0" } }),
      fetchWithTimeout(newUrl, timeoutMs, { headers: { "User-Agent": "KLSD-SEO-Compare/1.0" } }),
    ]);

    const liveHtml = await lr.text();
    const newHtml = await nr.text();

    const liveMeta = analyzeHtml(liveUrl, liveHtml);
    const newMeta = analyzeHtml(newUrl, newHtml);

    const result = {
      slugEqual: pathEqual(liveUrl, newUrl),
      titleEqual: normalizeWhitespace(liveMeta.title) === normalizeWhitespace(newMeta.title),
      metaTitleEqual: normalizeWhitespace(liveMeta.ogTitle) === normalizeWhitespace(newMeta.ogTitle),
      descriptionEqual: normalizeWhitespace(liveMeta.metaDescription) === normalizeWhitespace(newMeta.metaDescription),
      canonicalEqual: urlsEqual(liveMeta.canonical, newMeta.canonical),
      publishedEqual: normalizeWhitespace(liveMeta.articlePublished) === normalizeWhitespace(newMeta.articlePublished),
    };

    const values = {
      slug: { live: new URL(liveUrl).pathname, new: new URL(newUrl).pathname },
      title: { live: liveMeta.title || null, new: newMeta.title || null },
      metaTitle: { live: liveMeta.ogTitle || null, new: newMeta.ogTitle || null },
      description: { live: liveMeta.metaDescription || null, new: newMeta.metaDescription || null },
      canonical: { live: liveMeta.canonical || null, new: newMeta.canonical || null },
      published: { live: liveMeta.articlePublished || null, new: newMeta.articlePublished || null },
    } as const;

    const allEqual = Object.values(result).every(Boolean);

    return NextResponse.json({ ok: true, liveUrl, newUrl, fields: result, values, allEqual }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status: 200 });
  }
}
