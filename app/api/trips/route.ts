import { NextRequest, NextResponse } from "next/server";
import {
  fetchSupabaseProducts,
  SupabaseProductListItem,
} from "../../../lib/supabase-products";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TripCategory = {
  id: number | null;
  name: string | null;
  slug: string | null;
};

type TripItem = {
  id: number;
  name: string;
  slug: string;
  price: number;
  image: string;
  categories: TripCategory[];
  categoryDisplay: string;
  average_rating: number;
  rating_count: number;
  duration: string | number | null;
  permalink: string | null;
  short_description: string | null;
  description: string | null;
};

type CacheEntry = {
  trips: TripItem[];
  ts: number;
};

const CACHE = new Map<string, CacheEntry>();
const STALE_MS = 1000 * 60 * 3;
const SUPABASE_PAGE_SIZE = 200;
const MAX_SUPABASE_PAGES = 5;
const TRIP_CATEGORY_SLUGS = [
  "snorkeling-trips",
  "snorkeling-tours",
  "dive-trips",
  "reef-dives",
  "wreck-dives",
  "spearfishing",
  "night-dive",
  "sunset-cruise",
  "shark-dive",
  "coral-restoration-dives",
  "private-snorkeling-trips",
  "private-dive-charters",
];
const TRIP_CATEGORY_SET = new Set(
  TRIP_CATEGORY_SLUGS.map((slug) => slug.toLowerCase()),
);

function parseSlugs(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((slug) => slug.trim().toLowerCase())
    .filter((slug) => slug.length > 0);
}

function cacheKey(limit: number, categories: string[]) {
  return `${limit}|${categories.sort().join(",")}`;
}

function toDisplayCategory(slug?: string | null): string {
  if (!slug) return "All";
  return slug
    .split("-")
    .map((part) =>
      part.length > 0 ? part.charAt(0).toUpperCase() + part.slice(1) : part,
    )
    .join(" ");
}

function toNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.length === 0) return 0;
    const parsed = Number.parseFloat(trimmed);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function getCategorySlugs(product: SupabaseProductListItem): string[] {
  return (product.categories || [])
    .map((cat) => (cat?.slug ? cat.slug.toLowerCase() : ""))
    .filter((slug) => slug.length > 0);
}

function isPublishedTrip(product: SupabaseProductListItem): boolean {
  const supabaseProduct = (product.supabase_product ?? {}) as Record<string, unknown>;
  const rawStatus =
    (typeof product.status === "string" && product.status) ||
    (typeof supabaseProduct.status === "string" && supabaseProduct.status) ||
    (typeof (supabaseProduct as any)?.post_status === "string" && (supabaseProduct as any).post_status) ||
    null;
  if (!rawStatus) return false;
  const normalized = rawStatus.trim().toLowerCase();
  return normalized === "publish" || normalized === "published";
}

function matchesTripCategory(
  product: SupabaseProductListItem,
  slugFilters: string[],
): boolean {
  const catSlugs = getCategorySlugs(product);
  if (slugFilters.length > 0 && !slugFilters.some((slug) => catSlugs.includes(slug))) {
    return false;
  }

  if (catSlugs.some((slug) => TRIP_CATEGORY_SET.has(slug))) {
    return true;
  }

  return catSlugs.some((slug) =>
    slug.includes("dive") ||
    slug.includes("snorkel") ||
    slug.includes("charter") ||
    slug.includes("trip"),
  );
}

function mapSupabaseTrip(product: SupabaseProductListItem): TripItem {
  const supabaseProduct = (product.supabase_product ?? {}) as Record<string, unknown>;
  const categories: TripCategory[] = (product.categories || []).map((cat) => ({
    id: typeof cat?.id === "number" ? cat.id : cat?.id ?? null,
    name: typeof cat?.name === "string" ? cat.name : null,
    slug: typeof cat?.slug === "string" ? cat.slug : null,
  }));
  const catSlugs = getCategorySlugs(product);

  const meta = product.meta_data || [];
  const durationMeta = meta.find((entry) => entry?.key === "_wc_booking_duration")?.value ?? null;
  const duration =
    typeof durationMeta === "string" || typeof durationMeta === "number"
      ? durationMeta
      : null;

  const heroImage = product.template?.hero?.hero;
  const galleryImage = product.template?.hero?.gallery?.[0];
  const primaryImage = product.images?.find((img) => img?.is_primary)?.src;
  const fallbackImage = product.images?.[0]?.src;

  const averageRating = toNumber(supabaseProduct.average_rating ?? (supabaseProduct as any)?.rating);
  const ratingCount = toNumber(supabaseProduct.rating_count ?? (supabaseProduct as any)?.review_count);

  const priceSource =
    product.price ??
    (typeof supabaseProduct.price === "string" ? supabaseProduct.price : undefined) ??
    (typeof (supabaseProduct as any)?.regular_price === "string"
      ? (supabaseProduct as any).regular_price
      : undefined);

  const permalink =
    product.permalink ??
    (typeof supabaseProduct.permalink === "string" ? supabaseProduct.permalink : null);

  const shortDescription =
    product.short_description ??
    (typeof supabaseProduct.short_description === "string"
      ? supabaseProduct.short_description
      : null);

  const description =
    product.description ??
    (typeof supabaseProduct.description === "string"
      ? supabaseProduct.description
      : null);

  const categoryDisplaySlug = catSlugs[0] ?? categories[0]?.slug ?? null;
  const categoryDisplayName = categories[0]?.name ?? toDisplayCategory(categoryDisplaySlug);

  return {
    id: product.id,
    name:
      product.name ??
      (typeof supabaseProduct.name === "string" ? supabaseProduct.name : "Unnamed Trip"),
    slug: product.slug || (typeof supabaseProduct.slug === "string" ? supabaseProduct.slug : `${product.id}`),
    price: toNumber(priceSource),
    image:
      (typeof primaryImage === "string" && primaryImage.length > 0 && primaryImage) ||
      (typeof fallbackImage === "string" && fallbackImage.length > 0 && fallbackImage) ||
      (typeof heroImage === "string" && heroImage.length > 0 && heroImage) ||
      (typeof galleryImage === "string" && galleryImage.length > 0 && galleryImage) ||
      "",
    categories,
    categoryDisplay: categoryDisplayName,
    average_rating: averageRating,
    rating_count: ratingCount,
    duration,
    permalink,
    short_description: shortDescription,
    description,
  };
}

async function loadSupabaseTrips(limit: number, slugFilters: string[]): Promise<TripItem[]> {
  const aggregated: SupabaseProductListItem[] = [];
  let page = 1;

  while (page <= MAX_SUPABASE_PAGES) {
    const { data } = await fetchSupabaseProducts({ limit: SUPABASE_PAGE_SIZE, page });
    if (!data || data.length === 0) {
      break;
    }
    aggregated.push(...data);
    if (data.length < SUPABASE_PAGE_SIZE) {
      break;
    }
    page += 1;
  }

  const trips = aggregated
    .filter((product) => isPublishedTrip(product))
    .filter((product) => matchesTripCategory(product, slugFilters))
    .map((product) => mapSupabaseTrip(product))
    .sort((a, b) => {
      if (b.average_rating !== a.average_rating) {
        return b.average_rating - a.average_rating;
      }
      return b.rating_count - a.rating_count;
    });

  return trips.slice(0, limit);
}

export async function GET(req: NextRequest) {
  try {
    const now = Date.now();
    const { searchParams } = new URL(req.url);

    if (searchParams.get("reset") === "1") {
      CACHE.clear();
      return NextResponse.json({ reset: true, timestamp: now }, { status: 200 });
    }

    const perPage = Math.max(
      1,
      Math.min(Number.parseInt(searchParams.get("limit") ?? "24", 10) || 24, 200),
    );
    const slugFilters = parseSlugs(searchParams.get("categories"));
    const key = cacheKey(perPage, slugFilters);

    const cached = CACHE.get(key);
    if (cached && now - cached.ts < STALE_MS) {
      return NextResponse.json(
        {
          trips: cached.trips,
          count: cached.trips.length,
          cached: true,
          source: "supabase",
        },
        { status: 200 },
      );
    }

    const trips = await loadSupabaseTrips(perPage, slugFilters);
    CACHE.set(key, { trips, ts: now });

    return NextResponse.json(
      {
        trips,
        count: trips.length,
        cached: false,
        source: "supabase",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Trips API Supabase fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to load trips from Supabase" },
      { status: 500 },
    );
  }
}
