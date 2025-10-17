import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth, supabaseAdmin } from "../../../../lib/supabaseAdmin";

function normalizeSlug(input: string): string {
  const value = String(input || "").trim();
  if (!value) return "";
  const stripped = value.replace(/^https?:\/\//i, "");
  const parts = stripped.split("/").filter(Boolean);
  return parts.join("/");
}
function normalizePath(input: string): string {
  const slug = normalizeSlug(input);
  if (!slug) return "/";
  return `/${slug}${slug.endsWith("/") ? "" : "/"}`;
}
function toIso(value: unknown): string | null {
  if (value == null) return null;
  try {
    if (value instanceof Date) return value.toISOString();
    if (typeof value === "number") {
      return value > 1_000_000_000_000
        ? new Date(value).toISOString()
        : new Date(value * 1000).toISOString();
    }
    if (typeof value === "string") {
      const ms = Date.parse(value);
      return Number.isFinite(ms) ? new Date(ms).toISOString() : null;
    }
  } catch {}
  return null;
}

// Supabase-only POST to create a blog route and post, avoiding any remote CMS endpoint
export async function POST(req: NextRequest) {
  const unauth = requireAdminAuth(req as unknown as Request);
  if (unauth) return unauth as unknown as NextResponse;

  const payload = (await req.json().catch(() => ({}))) as Record<string, any>;
  const {
    slug,
    path,
    status,
    title,
    excerpt,
    author,
    tags,
    html,
    body,
    is_published,
    published_at,
  } = payload;

  if (!slug || !title || !status) {
    return NextResponse.json(
      { error: "slug, title, status required" },
      { status: 400 },
    );
  }

  const sb = supabaseAdmin();

  const normalizedSlug = normalizeSlug(String(slug));
  const normalizedPath = path
    ? normalizePath(String(path))
    : normalizePath(String(slug));

  const routeRow = {
    tenant_id: process.env.DEFAULT_TENANT_ID || null,
    route_type: "post",
    slug: normalizedSlug,
    path: normalizedPath,
    canonical_url: null,
    is_published: Boolean(is_published),
    published_at: is_published
      ? (toIso(published_at) ?? new Date().toISOString())
      : null,
    updated_at: new Date().toISOString(),
  } as const;

  if (!routeRow.tenant_id) {
    return NextResponse.json(
      { error: "DEFAULT_TENANT_ID not configured" },
      { status: 500 },
    );
  }

  const { data: upsertedRoute, error: routeErr } = await sb
    .from("cms.routes")
    .upsert(routeRow as any, {
      onConflict: "tenant_id,slug",
      ignoreDuplicates: false,
    })
    .select("id")
    .maybeSingle();

  if (routeErr) {
    return NextResponse.json({ error: routeErr.message }, { status: 400 });
  }
  if (!upsertedRoute) {
    return NextResponse.json(
      { error: "Failed to upsert route" },
      { status: 500 },
    );
  }

  const postRow = {
    tenant_id: routeRow.tenant_id,
    route_id: upsertedRoute.id,
    title,
    status,
    excerpt: excerpt ?? null,
    body: body ?? (html ? { html } : {}),
    tags: Array.isArray(tags)
      ? tags
          .map((t: any) => (typeof t === "string" ? t : t?.tag))
          .filter(Boolean)
      : [],
    author: author ?? null,
    published_at: toIso(published_at),
    updated_at: new Date().toISOString(),
  } as const;

  const { data: insertedPost, error: postErr } = await sb
    .from("cms.posts")
    .insert(postRow as any)
    .select("id")
    .single();

  if (postErr) {
    return NextResponse.json({ error: postErr.message }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    route_id: upsertedRoute.id,
    post_id: insertedPost.id,
  });
}

// GET /api/admin/blog?slug=... or ?path=...
export async function GET(req: NextRequest) {
  const unauth = requireAdminAuth(req as unknown as Request);
  if (unauth) return unauth as unknown as NextResponse;

  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");
  const path = url.searchParams.get("path");

  const tenantId = process.env.DEFAULT_TENANT_ID || null;
  if (!tenantId) {
    return NextResponse.json(
      { error: "DEFAULT_TENANT_ID not configured" },
      { status: 500 },
    );
  }
  if (!slug && !path) {
    return NextResponse.json(
      { error: "slug or path required" },
      { status: 400 },
    );
  }

  const sb = supabaseAdmin();
  let query = sb
    .from("cms.routes")
    .select("id, slug, path, route_type, is_published, published_at")
    .eq("tenant_id", tenantId)
    .limit(1);

  if (slug) query = query.eq("slug", normalizeSlug(slug));
  if (path) query = query.eq("path", normalizePath(path));

  const { data: route, error: routeErr } = await query.maybeSingle();
  if (routeErr) {
    return NextResponse.json({ error: routeErr.message }, { status: 400 });
  }
  if (!route) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: post, error: postErr } = await sb
    .from("cms.posts")
    .select(
      "id, title, status, excerpt, body, tags, author, published_at, updated_at",
    )
    .eq("tenant_id", tenantId)
    .eq("route_id", route.id)
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (postErr) {
    return NextResponse.json({ error: postErr.message }, { status: 400 });
  }

  return NextResponse.json({ route, post: post || null });
}
