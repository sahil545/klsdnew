import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type PageMetrics = {
  url: string;
  status: number;
  loadMs: number;
  title: string | null;
  titleLength: number;
  metaDescription: string | null;
  descriptionLength: number;
  canonical: string | null;
  robotsMeta: string | null;
  xRobotsTag: string | null;
  indexable: boolean;
  robotsNoindex: boolean;
  robotsNofollow: boolean;
  robotsNoarchive: boolean;
  robotsNosnippet: boolean;
  h1: string | null;
  h1Count: number;
  wordCount: number;
  images: number;
  imagesMissingAlt: number;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  twitterTitle: string | null;
  twitterDescription: string | null;
  twitterImage: string | null;
  schemaLdCount: number;
  htmlLang: string | null;
  hreflangCount: number;
  hreflangs: string[];
};

function extractBetween(text: string, regex: RegExp): string | null {
  const m = text.match(regex);
  return m && m[1] ? m[1].trim() : null;
}

function extractAll(text: string, regex: RegExp): string[] {
  const out: string[] = [];
  let m: RegExpExecArray | null;
  const r = new RegExp(regex.source, regex.flags.includes("g") ? regex.flags : regex.flags + "g");
  while ((m = r.exec(text))) {
    if (m[1]) out.push(m[1]);
  }
  return out;
}

function stripTags(html: string): string {
  return html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ");
}

function countWords(text: string): number {
  return (text.trim().match(/\b\w+\b/g) || []).length;
}

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
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

function resolveUrl(base: string, maybeRelative: string | null): string | null {
  if (!maybeRelative) return null;
  try {
    return new URL(maybeRelative, base).toString();
  } catch {
    return maybeRelative;
  }
}

function parseSitemapUrls(xml: string): string[] {
  return extractAll(xml, /<loc>\s*([^<\s]+)\s*<\/loc>/gi);
}

async function getAllPagesFromDomain(domain: string, limit: number): Promise<string[]> {
  const base = domain.replace(/\/$/, "");
  const candidates = [
    `${base}/robots.txt`,
    `${base}/sitemap_index.xml`,
    `${base}/sitemap.xml`,
  ];

  const sitemaps: string[] = [];

  // Try robots.txt for sitemap hints
  try {
    const res = await fetchWithTimeout(candidates[0], 5000);
    if (res.ok) {
      const txt = await res.text();
      const lines = txt.split(/\r?\n/);
      for (const line of lines) {
        const m = line.match(/sitemap:\s*(https?:[^\s]+)/i);
        if (m) sitemaps.push(m[1].trim());
      }
    }
  } catch {}

  // Fallbacks
  sitemaps.push(candidates[1], candidates[2]);

  const discoveredUrls: string[] = [];

  // Resolve sitemap indexes and URL sitemaps
  for (const sm of unique(sitemaps)) {
    try {
      const res = await fetchWithTimeout(sm, 8000);
      if (!res.ok) continue;
      const xml = await res.text();
      const urls = parseSitemapUrls(xml);
      // If it looks like a sitemap index (URLs ending with .xml), fetch those
      const sitemapChildren = urls.filter((u) => /\.xml(\?|$)/i.test(u));
      if (sitemapChildren.length > 0) {
        for (const child of sitemapChildren) {
          try {
            const cr = await fetchWithTimeout(child, 8000);
            if (!cr.ok) continue;
            const cxml = await cr.text();
            discoveredUrls.push(...parseSitemapUrls(cxml));
            if (discoveredUrls.length >= limit) break;
          } catch {}
        }
      } else {
        discoveredUrls.push(...urls);
      }
      if (discoveredUrls.length >= limit) break;
    } catch {}
  }

  const filtered = unique(discoveredUrls)
    .filter((u) => typeof u === "string" && u.startsWith(base))
    .slice(0, limit);

  // If nothing found, at least include homepage
  return filtered.length > 0 ? filtered : [`${base}/`];
}

function extractMetaContent(head: string, key: { attr: "name" | "property"; value: string }): string | null {
  // Match with attr then content OR content then attr
  const re1 = new RegExp(`<meta[^>]*${key.attr}=["']${key.value}["'][^>]*content=["']([\s\S]*?)["'][^>]*>`, "i");
  const re2 = new RegExp(`<meta[^>]*content=["']([\s\S]*?)["'][^>]*${key.attr}=["']${key.value}["'][^>]*>`, "i");
  return extractBetween(head, re1) || extractBetween(head, re2);
}

function analyzeHtml(url: string, html: string): Omit<PageMetrics, "url" | "status" | "loadMs" | "xRobotsTag" | "indexable" | "robotsNoindex" | "robotsNofollow" | "robotsNoarchive" | "robotsNosnippet"> {
  const head = html.substring(0, 200000);
  const title = extractBetween(head, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const metaDesc = extractMetaContent(head, { attr: "name", value: "description" });
  const canonical = resolveUrl(
    url,
    extractBetween(head, /<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i) ||
      extractBetween(head, /<link[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["'][^>]*>/i),
  );
  const robotsMeta = extractMetaContent(head, { attr: "name", value: "robots" });
  const htmlLang = extractBetween(html, /<html[^>]*lang=["']([^"']+)["'][^>]*>/i);

  const h1s = extractAll(html, /<h1[^>]*>([\s\S]*?)<\/h1>/gi);
  const firstH1 = h1s[0] ? h1s[0].replace(/<[^>]*>/g, " ").trim() : null;
  const text = stripTags(html);
  const wordCount = countWords(text);

  const imgTags = extractAll(html, /<img\b[^>]*>/gi);
  let images = imgTags.length;
  let imagesMissingAlt = 0;
  for (const tag of imgTags) {
    const hasAlt = /\balt\s*=\s*["'][^"']*["']/i.test(tag);
    if (!hasAlt) imagesMissingAlt++;
  }

  const ogTitle = extractMetaContent(head, { attr: "property", value: "og:title" });
  const ogDescription = extractMetaContent(head, { attr: "property", value: "og:description" });
  const ogImage = resolveUrl(url, extractMetaContent(head, { attr: "property", value: "og:image" }));
  const twitterTitle = extractMetaContent(head, { attr: "name", value: "twitter:title" });
  const twitterDescription = extractMetaContent(head, { attr: "name", value: "twitter:description" });
  const twitterImage = resolveUrl(url, extractMetaContent(head, { attr: "name", value: "twitter:image" }) || extractMetaContent(head, { attr: "name", value: "twitter:image:src" }));

  const schemaLdCount = extractAll(head, /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi).length;

  const hreflangTags = extractAll(head, /<link[^>]*rel=["']alternate["'][^>]*hreflang=["']([^"']+)["'][^>]*>/gi);
  const hreflangs = unique(hreflangTags.map((v) => v.toLowerCase()));

  return {
    title: title,
    titleLength: title ? title.replace(/\s+/g, " ").trim().length : 0,
    metaDescription: metaDesc,
    descriptionLength: metaDesc ? metaDesc.replace(/\s+/g, " ").trim().length : 0,
    canonical,
    robotsMeta,
    h1: firstH1,
    h1Count: h1s.length,
    wordCount,
    images,
    imagesMissingAlt,
    ogTitle,
    ogDescription,
    ogImage,
    twitterTitle,
    twitterDescription,
    twitterImage,
    schemaLdCount,
    htmlLang,
    hreflangCount: hreflangs.length,
    hreflangs,
  };
}

function parseRobotsDirectives(...values: Array<string | null | undefined>) {
  const combined = values.filter(Boolean).join(", ").toLowerCase();
  const has = (token: string) => new RegExp(`(?:^|,|\s)${token}(?:$|,|;|\s)`).test(combined);
  const noindex = has("noindex") || has("none");
  const nofollow = has("nofollow") || has("none");
  const noarchive = has("noarchive");
  const nosnippet = has("nosnippet");
  const indexable = !noindex;
  return { combined, noindex, nofollow, noarchive, nosnippet, indexable };
}

async function auditUrl(url: string, timeoutMs: number): Promise<PageMetrics> {
  const start = Date.now();
  try {
    const res = await fetchWithTimeout(url, timeoutMs, { headers: { "User-Agent": "KLSD-SEO-Audit/1.1" } });
    const loadMs = Date.now() - start;
    const status = res.status;
    const xRobotsTag = res.headers.get("x-robots-tag");
    const html = await res.text();
    const base = analyzeHtml(url, html);

    const robotsParsed = parseRobotsDirectives(base.robotsMeta, xRobotsTag);

    return {
      url,
      status,
      loadMs,
      ...base,
      xRobotsTag: xRobotsTag || null,
      indexable: robotsParsed.indexable,
      robotsNoindex: robotsParsed.noindex,
      robotsNofollow: robotsParsed.nofollow,
      robotsNoarchive: robotsParsed.noarchive,
      robotsNosnippet: robotsParsed.nosnippet,
    };
  } catch (e) {
    const loadMs = Date.now() - start;
    return {
      url,
      status: 0,
      loadMs,
      title: null,
      titleLength: 0,
      metaDescription: null,
      descriptionLength: 0,
      canonical: null,
      robotsMeta: null,
      xRobotsTag: null,
      indexable: false,
      robotsNoindex: false,
      robotsNofollow: false,
      robotsNoarchive: false,
      robotsNosnippet: false,
      h1: null,
      h1Count: 0,
      wordCount: 0,
      images: 0,
      imagesMissingAlt: 0,
      ogTitle: null,
      ogDescription: null,
      ogImage: null,
      twitterTitle: null,
      twitterDescription: null,
      twitterImage: null,
      schemaLdCount: 0,
      htmlLang: null,
      hreflangCount: 0,
      hreflangs: [],
    };
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const domainParam = (searchParams.get("domain") || "https://keylargoscubadiving.com").trim();
    const limit = Math.max(1, Math.min(500, parseInt(searchParams.get("limit") || "200", 10)));
    const timeoutMs = Math.max(2000, Math.min(15000, parseInt(searchParams.get("timeout") || "8000", 10)));
    const concurrency = Math.max(1, Math.min(10, parseInt(searchParams.get("concurrency") || "5", 10)));
    const compareParamRaw = (searchParams.get("compareDomain") || "").trim();

    const domain = domainParam.startsWith("http") ? domainParam : `https://${domainParam}`;

    const urls = await getAllPagesFromDomain(domain, limit);

    const normalize = (s: string | null | undefined) => (s || "").replace(/\s+/g, " ").trim();
    const eq = (a?: string | null, b?: string | null) => normalize(a) === normalize(b);
    const eqUrl = (a?: string | null, b?: string | null) => {
      const na = normalize(a);
      const nb = normalize(b);
      if (!na && !nb) return true;
      try {
        return new URL(na).toString() === new URL(nb).toString();
      } catch {
        return na === nb;
      }
    };

    if (compareParamRaw) {
      const compareDomain = compareParamRaw.startsWith("http") ? compareParamRaw : `https://${compareParamRaw}`;
      const originA = new URL(domain).origin;
      const originB = new URL(compareDomain).origin;

      type Combined = { base: PageMetrics; compare: PageMetrics; equal: { title: boolean; description: boolean; canonical: boolean; robots: boolean; og: boolean; twitter: boolean; h1: boolean; lang: boolean } };
      const results: Combined[] = [];

      for (let i = 0; i < urls.length; i += concurrency) {
        const sliceA = urls.slice(i, i + concurrency);
        const sliceB = sliceA.map((u) => u.replace(originA, originB));
        const batchA = await Promise.all(sliceA.map((u) => auditUrl(u, timeoutMs)));
        const batchB = await Promise.all(sliceB.map((u) => auditUrl(u, timeoutMs)));

        for (let j = 0; j < batchA.length; j++) {
          const a = batchA[j];
          const b = batchB[j];
          const robotsEq = a.indexable === b.indexable && a.robotsNoindex === b.robotsNoindex && a.robotsNofollow === b.robotsNofollow && a.robotsNoarchive === b.robotsNoarchive && a.robotsNosnippet === b.robotsNosnippet && normalize(a.robotsMeta).toLowerCase() === normalize(b.robotsMeta).toLowerCase() && normalize(a.xRobotsTag).toLowerCase() === normalize(b.xRobotsTag).toLowerCase();
          const ogEq = eq(a.ogTitle, b.ogTitle) && eq(a.ogDescription, b.ogDescription) && eqUrl(a.ogImage, b.ogImage);
          const twEq = eq(a.twitterTitle, b.twitterTitle) && eq(a.twitterDescription, b.twitterDescription) && eqUrl(a.twitterImage, b.twitterImage);
          results.push({
            base: a,
            compare: b,
            equal: {
              title: eq(a.title, b.title),
              description: eq(a.metaDescription, b.metaDescription),
              canonical: eqUrl(a.canonical, b.canonical),
              robots: robotsEq,
              og: ogEq,
              twitter: twEq,
              h1: eq(a.h1, b.h1),
              lang: normalize(a.htmlLang).toLowerCase() === normalize(b.htmlLang).toLowerCase(),
            },
          });
        }
      }

      return NextResponse.json({
        ok: true,
        domain,
        compareDomain,
        count: results.length,
        results,
        generatedAt: new Date().toISOString(),
      });
    }

    // Single-domain mode
    const results: PageMetrics[] = [];
    for (let i = 0; i < urls.length; i += concurrency) {
      const slice = urls.slice(i, i + concurrency);
      const batch = await Promise.all(slice.map((u) => auditUrl(u, timeoutMs)));
      results.push(...batch);
    }

    return NextResponse.json({
      ok: true,
      domain,
      count: results.length,
      results,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Failed to run SEO audit",
      },
      { status: 500 },
    );
  }
}
