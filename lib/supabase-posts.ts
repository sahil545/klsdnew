import { supabaseAdmin } from "./supabaseAdmin";

export type SupabasePostRow = {
  id: string;
  route_id: string;
  title: string;
  excerpt: string | null;
  body: Record<string, unknown> | null;
  tags: string[] | null;
  author: string | null;
  published_at: string | null;
  updated_at: string | null;
};

export type UpsertRouteInput = {
  tenant_id: string;
  route_type: "post" | "page" | "dive_site" | string;
  slug: string;
  path?: string | null;
  canonical_url?: string | null;
  is_published?: boolean;
  published_at?: string | number | Date | null;
};

export type UpsertRouteResult = {
  id: string;
};

export async function upsertSupabaseRoute(
  input: UpsertRouteInput,
): Promise<UpsertRouteResult> {
  const tenantId = input.tenant_id?.trim();
  if (!tenantId) {
    throw new Error("tenant_id is required to upsert a route");
  }

  const slug = normalizeSlug(input.slug);
  if (!slug) {
    throw new Error("slug is required to upsert a route");
  }

  const path = normalizePath(input.path ?? slug);
  const publishedAtIso = input.is_published
    ? toIsoDate(input.published_at) ?? new Date().toISOString()
    : null;

  const payload = {
    tenant_id: tenantId,
    route_type: input.route_type,
    slug,
    path,
    canonical_url: input.canonical_url ?? null,
    is_published: Boolean(input.is_published),
    published_at: Boolean(input.is_published) ? publishedAtIso : null,
    updated_at: new Date().toISOString(),
  } satisfies Record<string, unknown>;

  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("cms.routes")
    .upsert(payload, { onConflict: "tenant_id,slug", ignoreDuplicates: false })
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to upsert route: ${error.message}`);
  }

  if (!data) {
    throw new Error("Supabase route upsert did not return a record");
  }

  return { id: data.id };
}

export type UpsertPostInput = {
  tenant_id: string;
  route_id: string;
  status: "draft" | "published" | "archived" | string;
  title: string;
  excerpt?: string | null;
  body?: Record<string, unknown> | null;
  tags?: string[] | null;
  author?: string | null;
  published_at?: string | number | Date | null;
  updated_at?: string | number | Date | null;
};

export type UpsertPostResult = {
  id: string;
};

export async function upsertSupabasePost(
  input: UpsertPostInput,
): Promise<UpsertPostResult> {
  if (!input.tenant_id?.trim()) {
    throw new Error("tenant_id is required to upsert a post");
  }
  if (!input.route_id?.trim()) {
    throw new Error("route_id is required to upsert a post");
  }
  if (!input.title?.trim()) {
    throw new Error("title is required to upsert a post");
  }

  const payload = {
    tenant_id: input.tenant_id.trim(),
    route_id: input.route_id,
    status: input.status || "draft",
    title: input.title.trim(),
    excerpt: normalizeText(input.excerpt),
    body: normalizeRecord(input.body ?? null),
    tags: Array.isArray(input.tags)
      ? Array.from(
          new Set(
            input.tags
              .map((tag) => (typeof tag === "string" ? tag.trim() : ""))
              .filter((tag) => tag.length > 0),
          ),
        )
      : [],
    author: normalizeText(input.author),
    published_at: toIsoDate(input.published_at),
    updated_at: toIsoDate(input.updated_at) ?? new Date().toISOString(),
  } satisfies Record<string, unknown>;

  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("cms.posts")
    .upsert(payload, { onConflict: "tenant_id,route_id", ignoreDuplicates: false })
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to upsert post: ${error.message}`);
  }

  if (!data) {
    throw new Error("Supabase post upsert did not return a record");
  }

  return { id: data.id };
}

export function normalizeSlug(input: string): string {
  const value = (input || "").trim();
  if (!value) return "";
  const stripped = value.replace(/^https?:\/\//i, "");
  const parts = stripped.split("/").filter(Boolean);
  return parts.join("/");
}

export function normalizePath(input: string): string {
  const slug = normalizeSlug(input);
  if (!slug) return "/";
  return `/${slug}${slug.endsWith("/") ? "" : "/"}`;
}

export function toIsoDate(value: string | number | Date | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return null;
    if (value > 1_000_000_000_000) {
      return new Date(value).toISOString();
    }
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

function normalizeText(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function normalizeRecord(value: Record<string, unknown> | null): Record<string, unknown> | null {
  if (!value) return null;
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return null;
  }
}
