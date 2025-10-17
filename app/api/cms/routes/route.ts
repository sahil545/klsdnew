import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth, supabaseAdmin } from "../../../../lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  const unauth = requireAdminAuth(req as unknown as Request);
  if (unauth) return unauth as unknown as NextResponse;

  const payload = (await req.json().catch(() => ({}))) as Record<string, any>;
  const headerTenant = req.headers.get("x-tenant-id")?.trim() || null;
  const {
    tenant_id,
    route_type,
    slug,
    path,
    canonical_url,
    is_published,
    published_at,
  } = payload;

  const tenantId = headerTenant || tenant_id || null;
  if (!tenantId || !route_type || !slug) {
    return NextResponse.json(
      { error: "tenant_id, route_type, slug required" },
      { status: 400 },
    );
  }

  const normalizedSlug = String(slug)
    .replace(/^https?:\/\//i, "")
    .split("/")
    .filter(Boolean)
    .join("/");
  const normalizedPath = path
    ? String(path)
        .trim()
        .replace(/^\/+|\/+$/g, "")
    : normalizedSlug;
  const pathWithTrailingSlash = `/${normalizedPath}${normalizedPath.endsWith("/") ? "" : "/"}`;

  const row = {
    tenant_id: tenantId,
    route_type,
    slug: normalizedSlug,
    path: pathWithTrailingSlash,
    canonical_url: canonical_url ?? null,
    is_published: Boolean(is_published),
    published_at: is_published
      ? (toIso(published_at) ?? new Date().toISOString())
      : null,
    updated_at: new Date().toISOString(),
  } as const;

  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("cms.routes")
    .upsert(row as any, {
      onConflict: "tenant_id,slug",
      ignoreDuplicates: false,
    })
    .select("id")
    .maybeSingle();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data)
    return NextResponse.json({ error: "No route returned" }, { status: 500 });

  return NextResponse.json({ route_id: data.id });
}

export async function GET(req: NextRequest) {
  const unauth = requireAdminAuth(req as unknown as Request);
  if (unauth) return unauth as unknown as NextResponse;

  const url = new URL(req.url);
  const headerTenant = req.headers.get("x-tenant-id")?.trim() || null;
  const tenant_id = headerTenant || url.searchParams.get("tenant_id");
  const slug = url.searchParams.get("slug");
  const path = url.searchParams.get("path");

  if (!tenant_id || (!slug && !path)) {
    return NextResponse.json(
      { error: "tenant_id and slug or path required" },
      { status: 400 },
    );
  }

  const sb = supabaseAdmin();
  let query = sb
    .from("cms.routes")
    .select("id, slug, path, route_type, is_published, published_at")
    .eq("tenant_id", tenant_id)
    .limit(1);
  if (slug) query = query.eq("slug", normalizeSlug(slug));
  if (path) query = query.eq("path", normalizePath(path));

  const { data, error } = await query.maybeSingle();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ route: data });
}

function toIso(value: any): string | null {
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

function normalizeSlug(input: string): string {
  const value = (input || "").trim();
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
