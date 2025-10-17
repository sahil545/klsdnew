import { NextRequest, NextResponse } from "next/server";
import {
  requireAdminAuth,
  supabaseAdmin,
} from "../../../../../../lib/supabaseAdmin";

// PATCH /api/supabase/blog/posts/:id
// Updates a blog post row in cms.posts by id. Accepts partial fields.
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const unauth = requireAdminAuth(req as unknown as Request);
  if (unauth) return unauth as unknown as NextResponse;

  const id = params?.id;
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const payload = (await req.json().catch(() => ({}))) as Record<string, any>;
  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  // Only allow known columns to be updated
  const allowed: Record<string, any> = {};
  const fields = [
    "title",
    "status",
    "excerpt",
    "body",
    "tags",
    "author",
    "published_at",
    "post_published_at",
    "route_id",
  ];
  for (const key of fields) {
    if (key in payload) allowed[key] = payload[key];
  }
  // Always update updated_at to now
  allowed.updated_at = new Date().toISOString();

  const sb = supabaseAdmin();
  const { error } = await sb.from("cms.posts").update(allowed).eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
