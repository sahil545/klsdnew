import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth, supabaseAdmin } from "../../../../lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  const unauth = requireAdminAuth(req);
  if (unauth) return unauth;

  const body = (await req.json().catch(() => ({}))) as Record<string, any>;
  const { route_id, status, tenant_id } = body;

  if (!route_id || !status) {
    return NextResponse.json(
      { error: "route_id and status required" },
      { status: 400 },
    );
  }

  const tenantId =
    (tenant_id as string | undefined) || process.env.DEFAULT_TENANT_ID;
  const sb = supabaseAdmin();

  const { data, error } = await sb
    .from("cms.pages")
    .insert({
      tenant_id: tenantId,
      route_id,
      status,
      body: body.body ?? {},
      data: body.data ?? {},
      author: body.author ?? null,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ page_id: data!.id });
}

export async function PATCH(req: NextRequest) {
  const unauth = requireAdminAuth(req);
  if (unauth) return unauth;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const payload = (await req.json().catch(() => ({}))) as Record<string, any>;

  const sb = supabaseAdmin();
  const { error } = await sb.from("cms.pages").update(payload).eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
