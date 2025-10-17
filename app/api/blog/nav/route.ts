import { NextRequest, NextResponse } from "next/server";

import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

const DEFAULT_LIMIT = 30;

function normalizeText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function normalizeHref(
  path?: string | null,
  canonicalUrl?: string | null,
): string {
  const canonical = normalizeText(canonicalUrl);
  if (canonical) {
    try {
      const url = new URL(canonical);
      const pathname = url.pathname || "/";
      return pathname.endsWith("/") ? pathname : `${pathname}/`;
    } catch {
      // fall back to other options
    }
  }

  const raw = normalizeText(path) || "/";
  if (!raw.startsWith("/")) {
    return `/${raw}/`;
  }
  return raw.endsWith("/") ? raw : `${raw}/`;
}

export async function GET(req: NextRequest) {
  const searchParams = new URL(req.url).searchParams;
  const limitParam = searchParams.get("limit");
  const limit =
    Number.isFinite(Number(limitParam)) && Number(limitParam) > 0
      ? Math.min(Number(limitParam), 100)
      : DEFAULT_LIMIT;

  try {
    const supabase = supabaseAdmin();
    const { data, error } = await supabase
      .from("cms_blog_posts")
      .select("id,title,excerpt,canonical_url,path,published_at,status")
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(limit);

    if (error) {
      console.error("[api/blog/nav] Failed to load posts", error);
      return NextResponse.json(
        { items: [], error: "Failed to load blog posts" },
        { status: 200 },
      );
    }

    const items = (data || []).map((item) => ({
      id: item.id,
      title: normalizeText(item.title) || "Untitled Post",
      excerpt: normalizeText(item.excerpt),
      href: normalizeHref(item.path, item.canonical_url),
      publishedAt: item.published_at || null,
    }));

    return NextResponse.json(items, {
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("[api/blog/nav] Unexpected error", error);
    return NextResponse.json(
      { items: [], error: "Unexpected error" },
      { status: 200 },
    );
  }
}
