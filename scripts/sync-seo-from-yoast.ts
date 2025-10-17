#!/usr/bin/env tsx
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { yoastMetadataForUrl } from "../lib/yoast";

const SUPABASE_URL = process.env.SUPABASE_URL as string;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE as string;
const SITE_ORIGIN = (
  process.env.PUBLIC_SITE_ORIGIN || "https://keylargoscubadiving.com"
).replace(/\/$/, "");

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  console.error("Missing Supabase envs");
  process.exit(1);
}
const sbPublic = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
  auth: { persistSession: false },
  db: { schema: "public" },
});

async function listRoutes(limit = 500, offset = 0) {
  const { data, error } = await sbPublic
    .from("routes_v")
    .select("id,path")
    .order("path", { ascending: true })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return (data || []) as { id: string; path: string }[];
}

function pathToUrl(path: string) {
  if (!path) return SITE_ORIGIN;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_ORIGIN}${p}`;
}

async function upsertSeo(row: {
  route_id: string;
  path: string;
  title?: string | null;
  meta_description?: string | null;
  canonical?: string | null;
  robots?: string | null;
  og_title?: string | null;
  og_description?: string | null;
  og_image_url?: string | null;
  schema_json?: any | null;
}) {
  const { error } = await sbPublic.rpc("upsert_seo_meta", {
    p_route_path: row.path,
    p_route_id: row.route_id,
    p_title: row.title ?? null,
    p_meta_description: row.meta_description ?? null,
    p_canonical: row.canonical ?? null,
    p_robots: row.robots ?? null,
    p_og_title: row.og_title ?? null,
    p_og_description: row.og_description ?? null,
    p_og_image_url: row.og_image_url ?? null,
    p_schema_json: row.schema_json ?? null,
  });
  if (error) throw error;
}

async function main() {
  const limit = parseInt(
    process.argv.find((a) => a.startsWith("--limit="))?.split("=")[1] || "500",
    10,
  );
  let offset = 0;
  let totalUpserts = 0;

  while (true) {
    const routes = await listRoutes(limit, offset);
    if (!routes.length) break;

    for (const r of routes) {
      const url = pathToUrl(r.path);
      try {
        const meta = await yoastMetadataForUrl(url);
        // Normalize
        const title = (meta as any)?.title || null;
        const description = (meta as any)?.description || null;
        const canonical = (meta as any)?.alternates?.canonical || url;
        const og = (meta as any)?.openGraph || {};
        const ld = (meta as any)?.other
          ? (meta as any).other["script:ld+json"]
          : (meta as any)?.ld || null;
        const ogTitle = og?.title || null;
        const ogDescription = og?.description || null;
        const ogImage = Array.isArray(og?.images)
          ? og.images[0]?.url
          : og?.image || null;

        await upsertSeo({
          route_id: r.id,
          path: r.path,
          title,
          meta_description: description,
          canonical,
          robots: (meta as any)?.robots || null,
          og_title: ogTitle,
          og_description: ogDescription,
          og_image_url: ogImage || null,
          schema_json: ld
            ? (() => {
                try {
                  return typeof ld === "string" ? JSON.parse(ld) : ld;
                } catch {
                  return null;
                }
              })()
            : null,
        });
        totalUpserts++;
        console.log(`✓ SEO synced for ${r.path}`);
      } catch (e: any) {
        console.warn(`! Failed SEO for ${r.path}: ${e?.message || e}`);
      }
    }

    offset += routes.length;
    if (routes.length < limit) break;
  }

  console.log(`Done. Upserts: ${totalUpserts}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
