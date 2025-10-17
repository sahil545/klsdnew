import { supabaseAdmin } from "./supabaseAdmin";

type SupabaseCategory = {
  id: number | null;
  name: string | null;
  slug: string | null;
  is_primary: boolean;
  position: number | null;
};

type SupabaseMediaAsset = {
  id: string | null;
  src: string;
  alt: string | null;
  position: number;
  is_primary: boolean;
};

type SupabaseTemplateSummary = {
  hero: { hero: string | null; gallery: string[] };
  heroBadges: string[];
  details: Record<string, unknown> | null;
  highlights: unknown[];
  pricing: Record<string, unknown> | null;
  experience: Record<string, unknown> | null;
  included: Record<string, unknown> | null;
  journey: Record<string, unknown> | null;
  marineLife: Record<string, unknown> | null;
  trustIndicators: Record<string, unknown> | null;
  finalCTA: Record<string, unknown> | null;
  primaryCTA: Record<string, unknown> | null;
};

export type SupabaseProductListItem = {
  id: number;
  slug: string;
  name: string | null;
  description: string | null;
  short_description: string | null;
  price: string | null;
  regular_price: string | null;
  sale_price: string | null;
  currency: string | null;
  status: string | null;
  type: string | null;
  sku: string | null;
  stock_status: string | null;
  stock_quantity: number | null;
  manage_stock: boolean | null;
  permalink: string | null;
  categories: SupabaseCategory[];
  images: SupabaseMediaAsset[];
  meta_data: Array<{ key: string; value: unknown }>;
  template: SupabaseTemplateSummary;
  supabase_product: Record<string, unknown> | null;
  source: "supabase";
};

function ensureArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function toCurrencyString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.length === 0) return null;
    return trimmed;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return value.toFixed(2);
  }
  return null;
}

function toInteger(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function normalizeCategories(raw: unknown): SupabaseCategory[] {
  return ensureArray<any>(raw)
    .map((cat) => {
      if (!cat || typeof cat !== "object") return null;
      const idValue = (cat as any).id;
      const positionValue = (cat as any).position;
      return {
        id:
          typeof idValue === "number"
            ? idValue
            : typeof idValue === "string"
              ? Number.parseInt(idValue, 10) || null
              : null,
        name: typeof (cat as any).name === "string" ? (cat as any).name : null,
        slug: typeof (cat as any).slug === "string" ? (cat as any).slug : null,
        is_primary: Boolean((cat as any).is_primary),
        position:
          typeof positionValue === "number"
            ? positionValue
            : typeof positionValue === "string"
              ? Number.parseInt(positionValue, 10) || null
              : null,
      } satisfies SupabaseCategory;
    })
    .filter((cat): cat is SupabaseCategory => cat !== null);
}

function normalizeMedia(raw: unknown): SupabaseMediaAsset[] {
  return ensureArray<any>(raw)
    .map((asset) => {
      if (!asset || typeof asset !== "object") return null;
      const src = typeof (asset as any).src === "string" ? (asset as any).src : null;
      if (!src || src.trim().length === 0) return null;
      const positionValue = (asset as any).position;
      return {
        id:
          typeof (asset as any).id === "string"
            ? (asset as any).id
            : asset?.id?.toString?.() ?? null,
        src,
        alt: typeof (asset as any).alt === "string" ? (asset as any).alt : null,
        position:
          typeof positionValue === "number"
            ? positionValue
            : typeof positionValue === "string"
              ? Number.parseInt(positionValue, 10) || 0
              : 0,
        is_primary: Boolean((asset as any).is_primary),
      } satisfies SupabaseMediaAsset;
    })
    .filter((asset): asset is SupabaseMediaAsset => asset !== null);
}

function normalizeMeta(meta: unknown): Array<{ key: string; value: unknown }> {
  if (!meta || typeof meta !== "object") return [];
  return Object.entries(meta as Record<string, unknown>).map(([key, value]) => ({
    key,
    value,
  }));
}

function normalizeTemplate(record: any): SupabaseTemplateSummary {
  const images = record?.images && typeof record.images === "object"
    ? record.images
    : { hero: null, gallery: [] };

  return {
    hero: {
      hero:
        typeof (images as any).hero === "string" ? ((images as any).hero as string) : null,
      gallery: ensureArray<string>((images as any).gallery).filter(
        (item): item is string => typeof item === "string" && item.length > 0,
      ),
    },
    heroBadges: ensureArray<string>(record?.hero_badges).filter(
      (badge): badge is string => typeof badge === "string" && badge.trim().length > 0,
    ),
    details:
      record?.details && typeof record.details === "object"
        ? (record.details as Record<string, unknown>)
        : null,
    highlights: ensureArray(record?.highlights),
    pricing:
      record?.pricing && typeof record.pricing === "object"
        ? (record.pricing as Record<string, unknown>)
        : null,
    experience:
      record?.experience && typeof record.experience === "object"
        ? (record.experience as Record<string, unknown>)
        : null,
    included:
      record?.included && typeof record.included === "object"
        ? (record.included as Record<string, unknown>)
        : null,
    journey:
      record?.journey && typeof record.journey === "object"
        ? (record.journey as Record<string, unknown>)
        : null,
    marineLife:
      record?.marine_life && typeof record.marine_life === "object"
        ? (record.marine_life as Record<string, unknown>)
        : null,
    trustIndicators:
      record?.trust_indicators && typeof record.trust_indicators === "object"
        ? (record.trust_indicators as Record<string, unknown>)
        : null,
    finalCTA:
      record?.final_cta && typeof record.final_cta === "object"
        ? (record.final_cta as Record<string, unknown>)
        : null,
    primaryCTA:
      record?.primary_cta && typeof record.primary_cta === "object"
        ? (record.primary_cta as Record<string, unknown>)
        : null,
  } satisfies SupabaseTemplateSummary;
}

export function mapSupabaseProductRecord(record: any): SupabaseProductListItem {
  const product = record?.product && typeof record.product === "object"
    ? (record.product as Record<string, unknown>)
    : {};

  const priceSource =
    product?.price ?? record?.pricing?.basePrice ?? record?.pricing?.price ?? null;

  const regularPriceSource = product?.regular_price ?? null;
  const salePriceSource = product?.sale_price ?? null;

  return {
    id: record?.product_id ?? 0,
    slug: typeof record?.slug === "string" ? record.slug : "",
    name:
      typeof record?.name === "string"
        ? record.name
        : typeof product?.name === "string"
          ? (product.name as string)
          : null,
    description:
      typeof record?.description === "string"
        ? record.description
        : typeof product?.description === "string"
          ? (product.description as string)
          : null,
    short_description:
      typeof product?.short_description === "string"
        ? (product.short_description as string)
        : null,
    price: toCurrencyString(priceSource),
    regular_price: toCurrencyString(regularPriceSource),
    sale_price: toCurrencyString(salePriceSource),
    currency:
      typeof product?.currency === "string"
        ? (product.currency as string)
        : typeof record?.pricing?.currency === "string"
          ? (record.pricing.currency as string)
          : null,
    status:
      typeof product?.status === "string" ? (product.status as string) : null,
    type: typeof product?.type === "string" ? (product.type as string) : null,
    sku: typeof product?.sku === "string" ? (product.sku as string) : null,
    stock_status:
      typeof product?.stock_status === "string"
        ? (product.stock_status as string)
        : null,
    stock_quantity: toInteger(product?.stock_quantity ?? null),
    manage_stock:
      typeof product?.manage_stock === "boolean"
        ? (product.manage_stock as boolean)
        : null,
    permalink:
      typeof record?.product_permalink === "string"
        ? record.product_permalink
        : typeof product?.permalink === "string"
          ? (product.permalink as string)
          : null,
    categories: normalizeCategories(record?.categories),
    images: normalizeMedia(record?.media_assets),
    meta_data: normalizeMeta(product?.meta ?? null),
    template: normalizeTemplate(record),
    supabase_product: product,
    source: "supabase",
  } satisfies SupabaseProductListItem;
}

export async function fetchSupabaseProducts(params: {
  limit: number;
  page?: number;
  offset?: number;
  category?: string | null;
}) {
  const { limit, page = 1, offset, category = null } = params;
  const supabase = supabaseAdmin();
  const safeLimit = Math.max(1, Math.min(limit, 500));
  const start =
    typeof offset === "number" && offset >= 0
      ? offset
      : Math.max(page - 1, 0) * safeLimit;
  const end = start + safeLimit - 1;

  let query = supabase
    .from("products_v")
    .select(
      [
        "product_id",
        "slug",
        "name",
        "description",
        "hero_badges",
        "images",
        "categories",
        "details",
        "highlights",
        "pricing",
        "experience",
        "included",
        "journey",
        "marine_life",
        "trust_indicators",
        "final_cta",
        "primary_cta",
        "product_permalink",
        "product",
        "media_assets",
      ].join(", "),
    )
    .order("updated_at", { ascending: false })
    .range(start, end);

  if (category) {
    if (/^\d+$/.test(category)) {
      query = query.contains("categories", [
        { id: Number.parseInt(category, 10) },
      ]);
    } else {
      query = query.contains("categories", [{ slug: category }]);
    }
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  const items = Array.isArray(data)
    ? data.map((record) => mapSupabaseProductRecord(record))
    : [];

  return { data: items, count: items.length };
}
