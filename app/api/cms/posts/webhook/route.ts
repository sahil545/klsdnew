import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth, supabaseAdmin } from "../../../../../lib/supabaseAdmin";
import { buildSupabasePostPayload, fetchWpPosts } from "../../../../../lib/wp-post-sync";
import { normalizeSlug } from "../../../../../lib/supabase-posts";

const DEFAULT_TENANT_ID =
  process.env.DEFAULT_TENANT_ID?.trim() || "90a5bce0-7752-4941-bef3-5f205f1cdfdd";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const unauth = requireAdminAuth(req);
  if (unauth) return unauth;

  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

    const slugInput = typeof body.slug === "string" ? body.slug : undefined;
    const urlInput = typeof body.url === "string" ? body.url : undefined;

    const slug = deriveSlug(slugInput, urlInput);
    if (!slug) {
      return NextResponse.json(
        { ok: false, error: "Slug or URL is required" },
        { status: 400 },
      );
    }

    const posts = await fetchWpPosts({ slugs: [slug] });
    if (!posts.length) {
      return NextResponse.json(
        { ok: false, error: `WordPress post not found for slug ${slug}` },
        { status: 404 },
      );
    }

    const basePayload = buildSupabasePostPayload(posts[0]);
    const payload = applyOverrides(basePayload, body);
    const supabase = supabaseAdmin();
    const { data, error } = await supabase.rpc("cms_upsert_post", {
      payload: { tenant_id: DEFAULT_TENANT_ID, ...payload },
    });

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, result: data, slug: payload.slug });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unexpected error",
      },
      { status: 500 },
    );
  }
}

export function GET() {
  return NextResponse.json({ ok: true, message: "CMS post webhook ready" });
}

function deriveSlug(slugInput?: string, urlInput?: string): string | null {
  if (slugInput) {
    const normalized = normalizeSlug(slugInput);
    if (normalized) return normalized;
  }
  if (urlInput) {
    try {
      const url = new URL(urlInput);
      const slug = normalizeSlug(url.pathname);
      if (slug) return slug;
    } catch {
      return null;
    }
  }
  return null;
}

function applyOverrides(
  payload: ReturnType<typeof buildSupabasePostPayload>,
  overrides: Record<string, unknown>,
) {
  const result = { ...payload };

  if (typeof overrides.title === "string") {
    const title = overrides.title.trim();
    if (title) result.title = title;
  }

  if (typeof overrides.excerpt === "string") {
    const excerpt = overrides.excerpt.trim();
    result.excerpt = excerpt.length ? excerpt : null;
  }

  if (typeof overrides.author === "string") {
    const author = overrides.author.trim();
    result.author = author.length ? author : null;
  }

  if (typeof overrides.html === "string") {
    result.body = {
      sections: [
        {
          type: "richText",
          html: overrides.html,
        },
      ],
    };
  }

  if (Array.isArray(overrides.tags)) {
    const tags = overrides.tags
      .map((tag) => (typeof tag === "string" ? tag.trim() : ""))
      .filter((tag) => tag.length > 0);
    result.tags = Array.from(new Set(tags));
  }

  if (overrides.published_at) {
    const iso = toIso(overrides.published_at);
    result.published_at = iso;
    result.post_published_at = iso;
    result.is_published = Boolean(iso);
    result.status = iso ? "published" : result.status;
  }

  if (overrides.updated_at) {
    result.updated_at = toIso(overrides.updated_at);
  }

  return result;
}

function toIso(value: unknown): string | null {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "number" && Number.isFinite(value)) {
    if (value > 1_000_000_000_000) return new Date(value).toISOString();
    return new Date(value * 1000).toISOString();
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const ms = Date.parse(trimmed);
    return Number.isFinite(ms) ? new Date(ms).toISOString() : null;
  }
  return null;
}
