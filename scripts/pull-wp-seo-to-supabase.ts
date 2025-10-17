import "dotenv/config";
import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";

type YoastImage = {
  url?: string | null;
  width?: number | null;
  height?: number | null;
  type?: string | null;
};

type YoastRobots = {
  index?: string | null;
  follow?: string | null;
  [key: string]: string | null | undefined;
};

type Yoast = {
  title?: string | null;
  description?: string | null;
  canonical?: string | null;
  robots?: YoastRobots | null;
  og_title?: string | null;
  og_description?: string | null;
  og_image?: YoastImage[] | null;
  og_locale?: string | null;
  og_type?: string | null;
  og_site_name?: string | null;
  og_url?: string | null;
  article_publisher?: string | null;
  article_modified_time?: string | null;
  twitter_card?: string | null;
  twitter_site?: string | null;
  twitter_creator?: string | null;
  primary_category?: string | null;
  schema?: unknown;
};

type WPItem = {
  link: string;
  slug?: string | null;
  title?: {
    rendered?: string | null;
  } | null;
  excerpt?: {
    rendered?: string | null;
  } | null;
  yoast_head_json?: Yoast | null;
};

type StoreProduct = {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  short_description?: string | null;
  description?: string | null;
  sku?: string | null;
  price_html?: string | null;
  stock_status?: string | null;
  stock_quantity?: number | string | null;
  prices?: {
    price?: string | null;
    regular_price?: string | null;
    sale_price?: string | null;
    currency_code?: string | null;
  } | null;
};

type CmsSeoMetaRow = {
  path: string;
  title: string | null;
  description: string | null;
  canonical: string | null;
  robots: string | null;
  og: {
    title: string | null;
    description: string | null;
    image: string | null;
  } | null;
  ld: unknown;
  contentType: string | null;
  extras: Record<string, unknown> | null;
  routeId: string | null;
};

type ExistingSeoRow = {
  path: string;
  route_id: string | null;
  content_type: string | null;
  extras: Record<string, unknown> | null;
  title: string | null;
  meta_description: string | null;
  canonical: string | null;
  robots: string | null;
  og: {
    title: string | null;
    description: string | null;
    image: string | null;
  } | null;
  ld: unknown;
};

type ProductExtrasIndex = {
  bySlug: Map<string, Record<string, unknown>>;
  byPath: Map<string, Record<string, unknown>>;
};

function sanitizeText(value?: string | null): string | null {
  if (!value) return null;
  const withoutTags = value.replace(/<[^>]*>/g, " ");
  const decoded = withoutTags
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#8211;/gi, "—")
    .replace(/&#8212;/gi, "—")
    .replace(/&#8220;/gi, "“")
    .replace(/&#8221;/gi, "”")
    .replace(/&#8230;/gi, "…")
    .replace(/&ldquo;/gi, "“")
    .replace(/&rdquo;/gi, "”")
    .replace(/&lsquo;/gi, "‘")
    .replace(/&rsquo;/gi, "’");
  const normalized = decoded.replace(/\s+/g, " ").trim();
  return normalized.length ? normalized : null;
}

function pickFirstString(
  ...values: Array<string | null | undefined>
): string | null {
  for (const value of values) {
    if (typeof value !== "string") continue;
    const trimmed = value.trim();
    if (trimmed.length) return value;
  }
  return null;
}

function extractExtrasText(
  extras: Record<string, unknown> | null | undefined,
  key: string,
): string | null {
  if (!extras || typeof extras !== "object") return null;
  const value = (extras as Record<string, unknown>)[key];
  if (typeof value !== "string") return null;
  return sanitizeText(value);
}

function truncateMeta(value: string | null, max = 300): string | null {
  if (!value) return null;
  if (value.length <= max) return value;
  const sliced = value.slice(0, max);
  const lastSpace = sliced.lastIndexOf(" ");
  const trimmed = lastSpace > 60 ? sliced.slice(0, lastSpace) : sliced;
  return trimmed.trim().length ? `${trimmed.trim()}…` : sliced;
}

const WP_ORIGIN = process.env.WP_ORIGIN;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;
const WP_USERNAME = process.env.WP_USERNAME || "";
const WP_APP_PASSWORD = (process.env.WP_APP_PASSWORD || "").replace(/\s+/g, "");

if (!WP_ORIGIN) {
  throw new Error("WP_ORIGIN environment variable is required");
}
if (!SUPABASE_URL) {
  throw new Error("SUPABASE_URL environment variable is required");
}
if (!SERVICE_ROLE) {
  throw new Error("SUPABASE_SERVICE_ROLE environment variable is required");
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false },
});

function wpAuthHeader(): Record<string, string> {
  if (!WP_USERNAME || !WP_APP_PASSWORD) {
    return {};
  }
  const token = Buffer.from(`${WP_USERNAME}:${WP_APP_PASSWORD}`).toString(
    "base64",
  );
  return { Authorization: `Basic ${token}` };
}

function wpRequestHeaders(
  additional?: Record<string, string>,
): Record<string, string> {
  return {
    "User-Agent": "KLSD-SEO-Ingest/1.0",
    Accept: "application/json",
    ...wpAuthHeader(),
    ...(additional ?? {}),
  };
}

function buildWpOrigins(): string[] {
  const origins = new Set<string>();
  const primary = (WP_ORIGIN || "").replace(/\/$/, "");
  if (primary) origins.add(primary);
  try {
    const url = new URL(primary);
    if (!url.hostname.startsWith("wp.")) {
      origins.add(`${url.protocol}//wp.${url.hostname}`);
    }
  } catch {}
  return Array.from(origins);
}

const WP_ORIGINS = buildWpOrigins();

async function fetchAll(endpoint: string): Promise<WPItem[]> {
  let page = 1;
  const out: WPItem[] = [];

  if (WP_ORIGINS.length === 0) {
    throw new Error("No WordPress origins available for SEO sync");
  }

  for (;;) {
    let items: WPItem[] | null = null;
    let shouldStop = false;
    let lastError: Error | null = null;

    for (const origin of WP_ORIGINS) {
      const url = new URL(`/wp-json/wp/v2/${endpoint}`, origin);
      url.searchParams.set("per_page", "100");
      url.searchParams.set("page", page.toString());
      url.searchParams.set(
        "_fields",
        "link,slug,title.rendered,excerpt.rendered,yoast_head_json",
      );

      try {
        const res = await fetch(url.toString(), {
          headers: wpRequestHeaders(),
          cache: "no-store",
        });

        if (res.status === 400 || res.status === 404) {
          shouldStop = true;
          items = [];
          break;
        }

        const body = await res.text();

        if (!res.ok) {
          lastError = new Error(
            `${endpoint} fetch failed (${origin}): ${res.status} ${body.slice(0, 200)}`,
          );
          continue;
        }

        let parsed: unknown;
        try {
          parsed = JSON.parse(body);
        } catch (error) {
          lastError = new Error(
            `${endpoint} fetch parse error (${origin}): ${(error as Error).message} :: ${body.slice(0, 200)}`,
          );
          continue;
        }

        if (!Array.isArray(parsed) || parsed.length === 0) {
          shouldStop = true;
          items = [];
          break;
        }

        items = parsed as WPItem[];
        break;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        continue;
      }
    }

    if (items === null) {
      if (lastError) throw lastError;
      break;
    }

    if (shouldStop) {
      break;
    }

    out.push(...items);
    page += 1;
  }

  return out;
}

function toPath(url: string): string {
  const u = new URL(url);
  if (u.pathname.endsWith("/") && u.pathname !== "/") {
    return u.pathname.slice(0, -1);
  }
  return u.pathname || "/";
}

function safeToPath(url?: string | null): string | null {
  if (!url) return null;
  try {
    return toPath(url);
  } catch (error) {
    console.warn("Failed to normalize URL", url, error);
    return null;
  }
}

function normalizeRobots(
  value: Yoast["robots"] | string | null | undefined,
): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    const parts = value
      .map((part) => (typeof part === "string" ? part.trim() : ""))
      .filter(Boolean);
    return parts.length ? parts.join(", ") : null;
  }
  if (typeof value === "object") {
    const parts = Object.entries(value)
      .map(([key, val]) => {
        if (typeof val === "string" && val.trim().length) return val.trim();
        if (val === null) return "";
        return key;
      })
      .filter(Boolean);
    return parts.length ? parts.join(", ") : null;
  }
  return null;
}

function parseYoastSchema(schema: unknown): unknown {
  if (!schema) return null;
  if (typeof schema === "string") {
    try {
      return JSON.parse(schema);
    } catch {
      return null;
    }
  }
  if (typeof schema === "object") return schema;
  return null;
}

function pickOgImage(yoast: Yoast | null | undefined): string | null {
  if (!yoast?.og_image) return null;
  for (const image of yoast.og_image) {
    if (!image) continue;
    const candidate = pickFirstString(
      typeof image.url === "string" ? image.url : null,
      (image as { source_url?: string }).source_url,
    );
    if (candidate) return candidate;
  }
  return null;
}

function pruneExtras(
  extras?: Record<string, unknown> | null,
): Record<string, unknown> | null {
  if (!extras) return null;
  const pruned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(extras)) {
    if (value === undefined || value === null) continue;
    if (typeof value === "string") {
      if (!value.trim().length) continue;
      pruned[key] = value;
      continue;
    }
    pruned[key] = value;
  }
  return Object.keys(pruned).length ? pruned : null;
}

function mergeExtras(
  existing: Record<string, unknown> | null | undefined,
  additions: Record<string, unknown> | null | undefined,
): Record<string, unknown> | null {
  if (!existing && !additions) return null;
  const merged: Record<string, unknown> = { ...(existing ?? {}) };
  if (additions) {
    for (const [key, value] of Object.entries(additions)) {
      if (value === undefined || value === null) continue;
      merged[key] = value;
    }
  }
  return pruneExtras(merged);
}

function combineExtras(
  ...records: Array<Record<string, unknown> | null | undefined>
): Record<string, unknown> | null {
  const combined: Record<string, unknown> = {};
  for (const record of records) {
    if (!record) continue;
    for (const [key, value] of Object.entries(record)) {
      if (value === undefined || value === null) continue;
      combined[key] = value;
    }
  }
  return pruneExtras(combined);
}

function cloneExtras(extras: Record<string, unknown>): Record<string, unknown> {
  return { ...extras };
}

function buildBaseExtras(
  item: WPItem,
  contentType: string,
): Record<string, unknown> | null {
  const extras: Record<string, unknown> = {
    yoast_source: "wordpress",
    wordpress_link: item.link ?? null,
    wordpress_slug: item.slug ?? null,
    wordpress_content_type: contentType,
  };
  const fallbackTitle = sanitizeText(item.title?.rendered ?? null);
  if (fallbackTitle) extras.fallback_title = fallbackTitle;
  const fallbackDescription = sanitizeText(item.excerpt?.rendered ?? null);
  if (fallbackDescription) extras.fallback_description = fallbackDescription;
  return pruneExtras(extras);
}

function buildStoreProductExtras(
  product: StoreProduct,
): Record<string, unknown> | null {
  const extras: Record<string, unknown> = {
    product_id: product.id,
    product_slug: product.slug ?? null,
    product_permalink: product.permalink ?? null,
    product_sku: product.sku ?? null,
    product_price_html: product.price_html ?? null,
    product_stock_status: product.stock_status ?? null,
  };
  if (typeof product.stock_quantity === "number") {
    extras.product_stock_quantity = product.stock_quantity;
  } else if (typeof product.stock_quantity === "string") {
    const parsed = Number.parseInt(product.stock_quantity, 10);
    if (Number.isFinite(parsed)) {
      extras.product_stock_quantity = parsed;
    }
  }
  if (product.prices) {
    if (product.prices.price) extras.product_price = product.prices.price;
    if (product.prices.regular_price)
      extras.product_regular_price = product.prices.regular_price;
    if (product.prices.sale_price)
      extras.product_sale_price = product.prices.sale_price;
    if (product.prices.currency_code)
      extras.product_currency = product.prices.currency_code;
  }
  const name = sanitizeText(product.name ?? null);
  if (name) extras.product_name = name;
  const shortDescription = sanitizeText(product.short_description ?? null);
  if (shortDescription) {
    extras.product_short_description = shortDescription;
    extras.fallback_description = shortDescription;
  }
  const longDescription = sanitizeText(product.description ?? null);
  if (longDescription) extras.product_description = longDescription;
  return pruneExtras(extras);
}

function buildProductExtrasIndex(
  products: StoreProduct[],
): ProductExtrasIndex | null {
  const bySlug = new Map<string, Record<string, unknown>>();
  const byPath = new Map<string, Record<string, unknown>>();
  for (const product of products) {
    const extras = buildStoreProductExtras(product);
    if (!extras) continue;
    if (product.slug) {
      bySlug.set(product.slug.toLowerCase(), cloneExtras(extras));
    }
    const path = safeToPath(product.permalink);
    if (path) {
      byPath.set(path, cloneExtras(extras));
    }
  }
  if (bySlug.size === 0 && byPath.size === 0) return null;
  return { bySlug, byPath };
}

function findProductExtras(
  index: ProductExtrasIndex | null,
  item: WPItem,
): Record<string, unknown> | null {
  if (!index) return null;
  const slug = (item.slug ?? "").trim().toLowerCase();
  if (slug && index.bySlug.has(slug)) {
    return cloneExtras(index.bySlug.get(slug)!);
  }
  const canonicalPath = safeToPath(item.yoast_head_json?.canonical ?? null);
  if (canonicalPath && index.byPath.has(canonicalPath)) {
    return cloneExtras(index.byPath.get(canonicalPath)!);
  }
  const linkPath = safeToPath(item.link);
  if (linkPath && index.byPath.has(linkPath)) {
    return cloneExtras(index.byPath.get(linkPath)!);
  }
  return null;
}

async function fetchStoreProducts(): Promise<StoreProduct[]> {
  const results: StoreProduct[] = [];
  let page = 1;

  while (true) {
    let batch: StoreProduct[] | null = null;
    let lastError: Error | null = null;

    for (const origin of WP_ORIGINS) {
      const url = new URL("/wp-json/wc/store/products", origin);
      url.searchParams.set("per_page", "100");
      url.searchParams.set("page", page.toString());

      try {
        const res = await fetch(url.toString(), {
          headers: wpRequestHeaders(),
          cache: "no-store",
        });

        if (res.status === 400 || res.status === 404) {
          batch = [];
          break;
        }

        const body = await res.text();
        if (!res.ok) {
          lastError = new Error(
            `store products fetch failed (${origin}): ${res.status} ${body.slice(0, 200)}`,
          );
          continue;
        }

        let parsed: unknown;
        try {
          parsed = JSON.parse(body);
        } catch (error) {
          lastError = new Error(
            `store products parse error (${origin}): ${(error as Error).message} :: ${body.slice(0, 200)}`,
          );
          continue;
        }

        if (!Array.isArray(parsed) || parsed.length === 0) {
          batch = [];
          break;
        }

        batch = parsed as StoreProduct[];
        break;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        continue;
      }
    }

    if (batch === null) {
      if (lastError) throw lastError;
      break;
    }

    if (batch.length === 0) break;

    results.push(...batch);
    page += 1;
  }

  return results;
}

async function fetchExistingSeo(
  paths: string[],
): Promise<Map<string, ExistingSeoRow>> {
  const unique = Array.from(new Set(paths.filter(Boolean)));
  const map = new Map<string, ExistingSeoRow>();
  if (!unique.length) return map;

  for (const chunk of chunkArray(unique, 100)) {
    const { data, error } = await supabase
      .from("seo_meta_v")
      .select(
        "path,route_id,content_type,extras,title,meta_description,canonical,robots,og,ld",
      )
      .in("path", chunk);

    if (error) {
      throw new Error(`Failed to load existing SEO rows: ${error.message}`);
    }

    for (const row of data ?? []) {
      const ogPayload = (row.og as ExistingSeoRow["og"]) ?? null;

      map.set(row.path as string, {
        path: row.path as string,
        route_id: (row.route_id as string | null) ?? null,
        content_type: (row.content_type as string | null) ?? null,
        extras: (row.extras as Record<string, unknown> | null) ?? null,
        title: (row.title as string | null) ?? null,
        meta_description: (row.meta_description as string | null) ?? null,
        canonical: (row.canonical as string | null) ?? null,
        robots: (row.robots as string | null) ?? null,
        og: ogPayload,
        ld: row.ld ?? null,
      });
    }
  }

  return map;
}

function mapYoastToRow(
  item: WPItem,
  contentType: string,
  path: string,
  extras: Record<string, unknown> | null,
  existing: ExistingSeoRow | null,
): CmsSeoMetaRow | null {
  const yoast = item.yoast_head_json ?? null;
  const mergedExtras = mergeExtras(existing?.extras ?? null, extras);

  const title = pickFirstString(
    sanitizeText(yoast?.title ?? null),
    extractExtrasText(mergedExtras, "fallback_title"),
    sanitizeText(item.title?.rendered ?? null),
    extractExtrasText(mergedExtras, "product_name"),
    existing?.title ?? null,
  );

  const description = truncateMeta(
    pickFirstString(
      sanitizeText(yoast?.description ?? null),
      extractExtrasText(mergedExtras, "fallback_description"),
      sanitizeText(item.excerpt?.rendered ?? null),
      extractExtrasText(mergedExtras, "product_short_description"),
      extractExtrasText(mergedExtras, "product_description"),
      existing?.meta_description ?? null,
    ),
  );

  const canonical = pickFirstString(
    typeof yoast?.canonical === "string" ? yoast?.canonical : null,
    existing?.canonical ?? null,
    item.link ?? null,
  );

  const robots = normalizeRobots(yoast?.robots) ?? existing?.robots ?? null;

  const ogImage = pickOgImage(yoast) ?? existing?.og?.image ?? null;
  const ogTitle = pickFirstString(
    sanitizeText(yoast?.og_title ?? null),
    title,
    existing?.og?.title ?? null,
  );
  const ogDescription = truncateMeta(
    pickFirstString(
      sanitizeText(yoast?.og_description ?? null),
      description,
      existing?.og?.description ?? null,
    ),
  );
  const og =
    ogTitle || ogDescription || ogImage
      ? {
          title: ogTitle ?? null,
          description: ogDescription ?? null,
          image: ogImage ?? null,
        }
      : null;

  const ld = parseYoastSchema(yoast?.schema) ?? existing?.ld ?? null;

  return {
    path,
    title: title ?? null,
    description: description ?? null,
    canonical: canonical ?? null,
    robots,
    og,
    ld,
    contentType: contentType || existing?.content_type || null,
    extras: mergedExtras,
    routeId: existing?.route_id ?? null,
  };
}

function scoreRow(row: CmsSeoMetaRow): number {
  let score = 0;
  if (row.title) score += 5;
  if (row.description) score += 5;
  if (row.og?.title) score += 2;
  if (row.og?.description) score += 2;
  if (row.og?.image) score += 1;
  if (row.canonical) score += 1;
  if (row.robots) score += 1;
  return score;
}

function dedupeRows(rows: CmsSeoMetaRow[]): CmsSeoMetaRow[] {
  const map = new Map<string, CmsSeoMetaRow>();
  for (const row of rows) {
    const existing = map.get(row.path);
    if (!existing) {
      map.set(row.path, row);
      continue;
    }
    const existingScore = scoreRow(existing);
    const candidateScore = scoreRow(row);
    if (candidateScore >= existingScore) {
      map.set(row.path, row);
    }
  }
  return Array.from(map.values());
}

async function buildRowsForType(
  items: WPItem[],
  contentType: string,
  productExtrasIndex: ProductExtrasIndex | null,
): Promise<CmsSeoMetaRow[]> {
  const candidates = items
    .map((item) => {
      const path =
        safeToPath(item.yoast_head_json?.canonical ?? null) ??
        safeToPath(item.link);
      if (!path) return null;
      const baseExtras = buildBaseExtras(item, contentType);
      const productExtras =
        contentType === "product"
          ? findProductExtras(productExtrasIndex, item)
          : null;
      const extras = combineExtras(baseExtras, productExtras);
      return { item, path, extras };
    })
    .filter(
      (
        candidate,
      ): candidate is {
        item: WPItem;
        path: string;
        extras: Record<string, unknown> | null;
      } => candidate !== null,
    );

  if (!candidates.length) return [];

  const existingMap = await fetchExistingSeo(candidates.map((c) => c.path));
  const rows: CmsSeoMetaRow[] = [];

  for (const candidate of candidates) {
    const existing = existingMap.get(candidate.path) ?? null;
    const row = mapYoastToRow(
      candidate.item,
      contentType,
      candidate.path,
      candidate.extras,
      existing,
    );
    if (row) rows.push(row);
  }

  return rows;
}

function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

async function upsertSeo(rows: CmsSeoMetaRow[]): Promise<void> {
  if (!rows.length) return;
  const errors: string[] = [];
  let success = 0;

  for (const row of rows) {
    const { error } = await supabase.rpc("upsert_seo_meta", {
      p_path: row.path,
      p_title: row.title ?? null,
      p_description: row.description ?? null,
      p_canonical: row.canonical ?? null,
      p_robots: row.robots ?? null,
      p_og: row.og ?? null,
      p_ld: row.ld ?? null,
      p_route_id: row.routeId ?? null,
      p_content_type: row.contentType ?? null,
      p_extras: row.extras ?? null,
    });

    if (error) {
      errors.push(`${row.path}: ${error.message}`);
    } else {
      success += 1;
    }
  }

  console.log(`Upserted ${success} of ${rows.length} SEO rows`);
  if (errors.length) {
    throw new Error(
      `Failed to upsert ${errors.length} SEO rows:\n${errors.join("\n")}`,
    );
  }
}

async function main() {
  console.log("Fetching WordPress content…");
  const [pages, posts, products, storeProducts] = await Promise.all([
    fetchAll("pages"),
    fetchAll("posts"),
    fetchAll("product"),
    fetchStoreProducts(),
  ]);

  console.log(
    `Fetched ${pages.length} pages, ${posts.length} posts, ${products.length} products, ${storeProducts.length} store products`,
  );

  const productExtrasIndex = buildProductExtrasIndex(storeProducts);

  const [pageRows, postRows, productRows] = await Promise.all([
    buildRowsForType(pages, "page", productExtrasIndex),
    buildRowsForType(posts, "post", productExtrasIndex),
    buildRowsForType(products, "product", productExtrasIndex),
  ]);

  const combined = dedupeRows([...pageRows, ...postRows, ...productRows]);
  console.log(`Prepared ${combined.length} SEO rows`);

  await upsertSeo(combined);
  console.log("SEO metadata sync complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
