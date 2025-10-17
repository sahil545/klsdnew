import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth, supabaseAdmin } from "../../../../lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  const unauth = requireAdminAuth(req);
  if (unauth) return unauth;

  const payload = (await req.json().catch(() => ({}))) as Record<string, any>;
  const headerTenant = req.headers.get("x-tenant-id")?.trim() || null;
  const {
    route_id,
    title,
    status,
    excerpt,
    body,
    tags,
    author,
    published_at,
    tenant_id,
  } = payload;

  if (!route_id || !title || !status) {
    return NextResponse.json(
      { error: "route_id, title, status required" },
      { status: 400 },
    );
  }

  const tenantId = headerTenant || tenant_id || process.env.DEFAULT_TENANT_ID;
  if (!tenantId) {
    return NextResponse.json(
      { error: "tenant_id or x-tenant-id required" },
      { status: 400 },
    );
  }

  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("cms.posts")
    .insert({
      tenant_id: tenantId,
      route_id,
      title,
      status,
      excerpt: excerpt ?? null,
      body: body ?? {},
      tags: tags ?? [],
      author: author ?? null,
      published_at: published_at ?? null,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ post_id: data!.id });
}

export async function PATCH(req: NextRequest) {
  const unauth = requireAdminAuth(req);
  if (unauth) return unauth;

  const id = new URL(req.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const payload = (await req.json().catch(() => ({}))) as Record<string, any>;

  const sb = supabaseAdmin();
  const { error } = await sb.from("cms.posts").update(payload).eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
