import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth, supabaseAdmin } from "../../../../lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  const unauth = requireAdminAuth(req);
  if (unauth) return unauth;

  const payload = (await req.json().catch(() => ({}))) as Record<string, any>;
  const {
    route_id,
    name,
    status = "published",
    latitude,
    longitude,
    depth_min_m,
    depth_max_m,
    current_level,
    skill_level,
    highlights,
    hazards,
    seasonality,
    body,
    tenant_id,
  } = payload;

  if (!route_id || !name) {
    return NextResponse.json(
      { error: "route_id and name required" },
      { status: 400 },
    );
  }

  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("cms.dive_sites")
    .insert({
      tenant_id: tenant_id || process.env.DEFAULT_TENANT_ID,
      route_id,
      name,
      status,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      depth_min_m: depth_min_m ?? null,
      depth_max_m: depth_max_m ?? null,
      current_level: current_level ?? null,
      skill_level: skill_level ?? null,
      highlights: highlights ?? [],
      hazards: hazards ?? [],
      seasonality: seasonality ?? null,
      body: body ?? {},
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ site_id: data!.id });
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
  const { error } = await sb
    .from("cms.dive_sites")
    .update(payload)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
