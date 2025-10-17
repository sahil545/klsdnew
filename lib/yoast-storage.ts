import type { PostgrestError } from "@supabase/supabase-js";
import { supabaseAdmin } from "./supabaseAdmin";

export type YoastStoredMeta = {
  title?: string | null;
  description?: string | null;
  canonical?: string | null;
  robots?: string | null;
  og?: {
    title?: string | null;
    description?: string | null;
    image?: string | null;
    url?: string | null;
    type?: string | null;
  } | null;
  twitter?: {
    title?: string | null;
    description?: string | null;
    image?: string | null;
    card?: string | null;
    site?: string | null;
  } | null;
};

export type YoastPersistContext = {
  slug?: string | null;
  url?: string | null;
  path?: string | null;
  canonical?: string | null;
};

type SupabaseSeoRow = {
  path?: string | null;
  route_id?: string | null;
  content_type?: string | null;
  title?: string | null;
  meta_description?: string | null;
  canonical?: string | null;
  robots?: string | null;
  og?: {
    title?: string | null;
    description?: string | null;
    image?: string | null;
  } | null;
  og_title?: string | null;
  og_description?: string | null;
  og_image_url?: string | null;
  extras?: Record<string, unknown> | null;
};

const SUPABASE_READY = Boolean(
  (process.env.SUPABASE_URL || "").trim() &&
    (process.env.SUPABASE_SERVICE_ROLE || "").trim(),
);

export async function persistYoastMeta(
  meta: YoastStoredMeta,
  context: YoastPersistContext,
): Promise<void> {
  if (!SUPABASE_READY) return;
  if (!hasMeaningfulMeta(meta)) return;

  const path =
    normalizePath(context.path) ??
    normalizePath(context.canonical ?? meta.canonical) ??
    normalizePath(context.url);

  if (!path) return;

  try {
    const sb = supabaseAdmin();
    const existing = await fetchSeoRowByPath(sb, path);
    const robots = normalizeRobots(meta.robots);
    const extras = mergeExtras(existing?.extras, buildExtras(context));
    const ogPayload = buildOgPayload(meta.og);

    const { error } = await sb.rpc("upsert_seo_meta", {
      p_path: path,
      p_title: meta.title ?? null,
      p_description: meta.description ?? null,
      p_canonical: meta.canonical ?? context.canonical ?? null,
      p_robots: robots,
      p_og: ogPayload,
      p_ld: null,
      p_route_id: existing?.route_id ?? null,
      p_content_type: existing?.content_type ?? null,
      p_extras: extras ?? existing?.extras ?? null,
    });

    if (error) {
      logSupabaseWarning("persist", error);
    }
  } catch (error) {
    console.warn("[yoast] Failed to persist Supabase SEO", error);
  }
}

export async function loadYoastMetaFallback(
  context: YoastPersistContext,
): Promise<YoastStoredMeta | null> {
  if (!SUPABASE_READY) return null;

  const attempted = new Set<string>();
  const candidates = new Set<string>();

  const addCandidate = (value?: string | null) => {
    const path = normalizePath(value);
    if (path) candidates.add(path);
  };

  addCandidate(context.path);
  addCandidate(context.canonical);
  addCandidate(context.url);

  try {
    const sb = supabaseAdmin();

    const tryPaths = async (): Promise<YoastStoredMeta | null> => {
      for (const path of candidates) {
        if (attempted.has(path)) continue;
        attempted.add(path);
        const row = await fetchSeoRowByPath(sb, path);
        if (row) return convertRow(row);
      }
      return null;
    };

    const direct = await tryPaths();
    if (direct) return direct;

    if (context.slug) {
      const slug = context.slug.trim();
      if (slug.length) {
        const byExtras = await fetchSeoRowBySlugExtra(sb, slug);
        if (byExtras) return convertRow(byExtras);

        const variants = buildRouteLookups(slug);

        if (variants.slug.length) {
          const { data: slugRows, error } = await sb
            .from("routes_v")
            .select("path")
            .in("slug", variants.slug);
          if (!error && Array.isArray(slugRows)) {
            for (const item of slugRows) {
              addCandidate(item?.path as string | null);
            }
          }
        }

        if (variants.path.length) {
          const { data: pathRows, error } = await sb
            .from("routes_v")
            .select("path")
            .in("path", variants.path);
          if (!error && Array.isArray(pathRows)) {
            for (const item of pathRows) {
              addCandidate(item?.path as string | null);
            }
          }
        }

        const fallback = await tryPaths();
        if (fallback) return fallback;
      }
    }
  } catch (error) {
    console.warn("[yoast] Failed to load Supabase SEO fallback", error);
  }

  return null;
}

function buildOgPayload(
  og: YoastStoredMeta["og"],
): { title?: string | null; description?: string | null; image?: string | null } | null {
  if (!og) return null;
  const payload = {
    title: og.title ?? null,
    description: og.description ?? null,
    image: og.image ?? null,
  };
  if (!payload.title && !payload.description && !payload.image) {
    return null;
  }
  return payload;
}

function buildExtras(context: YoastPersistContext): Record<string, unknown> | null {
  const extras: Record<string, unknown> = {};
  if (context.slug) extras.yoast_slug = context.slug;
  if (context.url) extras.yoast_last_url = context.url;
  if (Object.keys(extras).length === 0) return null;
  return extras;
}

function mergeExtras(
  existing: Record<string, unknown> | null | undefined,
  additions: Record<string, unknown> | null,
): Record<string, unknown> | null {
  if (!existing && !additions) return null;
  return { ...(existing ?? {}), ...(additions ?? {}) };
}

function normalizeRobots(value: YoastStoredMeta["robots"]): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    const joined = value
      .map((part) => (typeof part === "string" ? part.trim() : ""))
      .filter(Boolean)
      .join(", ");
    return joined.length ? joined : null;
  }
  if (typeof value === "object") {
    const parts = Object.entries(value)
      .filter(([, v]) => Boolean(v))
      .map(([k, v]) => (typeof v === "string" && v.trim().length ? v : k));
    const joined = parts.filter(Boolean).join(", ");
    return joined.length ? joined : null;
  }
  return null;
}

function normalizePath(value?: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    return trimPath(url.pathname);
  } catch {
    return trimPath(trimmed.startsWith("/") ? trimmed : `/${trimmed}`);
  }
}

function trimPath(path: string): string {
  if (!path) return "/";
  if (path !== "/" && path.endsWith("/")) {
    return path.replace(/\/+/g, "/").replace(/\/$/, "");
  }
  return path.replace(/\/+/g, "/");
}

function hasMeaningfulMeta(meta: YoastStoredMeta): boolean {
  return Boolean(
    meta.title ||
      meta.description ||
      meta.canonical ||
      meta.og?.title ||
      meta.og?.description ||
      meta.og?.image,
  );
}

function buildRouteLookups(slug: string) {
  const trimmed = slug.replace(/^\/+|\/+$/g, "");
  const slugLookups = new Set<string>();
  const pathLookups = new Set<string>();

  if (trimmed.length) {
    slugLookups.add(trimmed);
    if (!trimmed.endsWith("/")) slugLookups.add(`${trimmed}/`);
    if (!trimmed.startsWith("/")) slugLookups.add(`/${trimmed}`);
    const asPath = `/${trimmed}`;
    pathLookups.add(asPath);
    if (!asPath.endsWith("/")) pathLookups.add(`${asPath}/`);
  } else {
    slugLookups.add("");
    slugLookups.add("/");
    slugLookups.add("home");
    slugLookups.add("index");
    pathLookups.add("/");
  }

  return {
    slug: Array.from(slugLookups),
    path: Array.from(pathLookups),
  };
}

async function fetchSeoRowByPath(sb: ReturnType<typeof supabaseAdmin>, path: string) {
  const { data, error } = await sb
    .from("seo_meta_v")
    .select("*")
    .eq("path", path)
    .maybeSingle<SupabaseSeoRow>();
  if (error && !isNoRowsError(error)) {
    logSupabaseWarning("load:path", error);
  }
  return (data as SupabaseSeoRow | null) ?? null;
}

async function fetchSeoRowBySlugExtra(
  sb: ReturnType<typeof supabaseAdmin>,
  slug: string,
) {
  const { data, error } = await sb
    .from("seo_meta_v")
    .select("*")
    .filter("extras->>yoast_slug", "eq", slug)
    .limit(1)
    .maybeSingle<SupabaseSeoRow>();
  if (error && !isNoRowsError(error)) {
    logSupabaseWarning("load:slug", error);
  }
  return (data as SupabaseSeoRow | null) ?? null;
}

function convertRow(row: SupabaseSeoRow): YoastStoredMeta | null {
  if (!row) return null;
  const ogSource = row.og ?? {
    title: row.og_title ?? null,
    description: row.og_description ?? null,
    image: row.og_image_url ?? null,
  };
  const ogImage = ogSource?.image ?? row.og_image_url ?? null;
  const ogTitle = ogSource?.title ?? row.og_title ?? row.title ?? null;
  const ogDescription =
    ogSource?.description ?? row.og_description ?? row.meta_description ?? null;

  const og = ogTitle || ogDescription || ogImage
    ? {
        title: ogTitle,
        description: ogDescription,
        image: ogImage,
        url: row.canonical ?? null,
        type: null,
      }
    : null;

  return {
    title: row.title ?? null,
    description: row.meta_description ?? null,
    canonical: row.canonical ?? null,
    robots: row.robots ?? null,
    og,
  };
}

function logSupabaseWarning(scope: string, error: PostgrestError) {
  console.warn(`[yoast] Supabase ${scope} warning`, error.message);
}

function isNoRowsError(error: PostgrestError): boolean {
  return error.code === "PGRST116" || error.details?.includes("Results contain 0 rows");
}
