import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth, supabaseAdmin } from "../../../../lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  const unauth = requireAdminAuth(req);
  if (unauth) return unauth;

  const body = (await req.json().catch(() => ({}))) as Record<string, any>;
  const { route_id } = body;

  if (!route_id) {
    return NextResponse.json({ error: "route_id required" }, { status: 400 });
  }

  const sb = supabaseAdmin();

  const { error } = await sb.from("cms.seo_meta").upsert(
    {
      route_id,
      title: body.title ?? null,
      meta_description: body.meta_description ?? null,
      og_title: body.og_title ?? null,
      og_description: body.og_description ?? null,
      og_image_url: body.og_image_url ?? null,
      schema_json: body.schema_json ?? null,
      noindex: body.noindex ?? false,
    },
    { onConflict: "route_id" },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  const unauth = requireAdminAuth(req);
  if (unauth) return unauth;

  const { searchParams } = new URL(req.url);
  const route_id = searchParams.get("route_id");

  if (!route_id) {
    return NextResponse.json({ error: "route_id required" }, { status: 400 });
  }

  const payload = (await req.json().catch(() => ({}))) as Record<string, any>;

  const sb = supabaseAdmin();
  const { error } = await sb
    .from("cms.seo_meta")
    .update(payload)
    .eq("route_id", route_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
