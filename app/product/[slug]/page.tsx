import { notFound } from "next/navigation";
import { headers } from "next/headers";

import Link from "next/link";
import CertificationTemplateEmbedded from "../../../client/pages/CertificationTemplateEmbedded";
import SnorkelingToursTemplate from "../../snorkeling-tours-template/SnorkelingToursTemplate";
import {
  EcommerceScubaGearProductTemplate,
  type ColorOption,
  type SizeOption,
} from "../../dev/ecommerce-scuba-gear-product-mockup/EcommerceTemplate";
import type { TourData } from "../../snorkeling-tours-template/data";
import { wooCommerce } from "../../../client/lib/woocommerce";
import { getTemplateForProduct } from "@/lib/template-mapper";
import { Navigation } from "../../../client/components/Navigation";
import { Footer } from "../../../client/components/Footer";

export const dynamic = "force-dynamic";

type WooCategory = { id: number; slug: string; name?: string; parent?: number };
type WooImage = { src?: string; alt?: string };

type WooProductAttribute = {
  id?: number;
  name?: string;
  slug?: string;
  options?: string[];
  variation?: boolean;
};

type WooProductVariationAttribute = {
  id?: number;
  name?: string;
  option?: string;
};

type WooProductVariation = {
  id: number;
  price?: string;
  regular_price?: string;
  sale_price?: string;
  stock_status?: string;
  stock_quantity?: number | null;
  image?: WooImage;
  attributes?: WooProductVariationAttribute[];
};

type WooProduct = {
  id: number;
  name: string;
  permalink?: string;
  type?: string;
  categories?: WooCategory[];
  images?: WooImage[];
  wcf_tour_data?: TourData | null;
  price?: string;
  regular_price?: string;
  sale_price?: string;
  short_description?: string;
  description?: string;
  stock_status?: string;
  stock_quantity?: number | null;
  attributes?: WooProductAttribute[];
};

function absoluteUrl(path: string) {
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const proto =
    h.get("x-forwarded-proto") ??
    (process.env.NODE_ENV === "development" ? "http" : "https");
  return `${proto}://${host}${path}`;
}

async function getProductBySlug(slug: string): Promise<WooProduct | null> {
  try {
    const products = await wooCommerce.makeRequest(
      `/products?slug=${encodeURIComponent(
        slug,
      )}&per_page=1&_fields=id,name,permalink,type,categories,images,wcf_tour_data,price,regular_price,sale_price,short_description,description,stock_status,stock_quantity,attributes`,
    );
    if (Array.isArray(products) && products.length > 0) return products[0];
  } catch (error) {
    console.error("Failed to fetch product by slug", error);
  }
  return null;
}

async function getProductVariations(
  productId: number,
): Promise<WooProductVariation[]> {
  try {
    const variations = await wooCommerce.makeRequest(
      `/products/${productId}/variations?per_page=100&_fields=id,price,regular_price,sale_price,stock_status,stock_quantity,image,attributes`,
    );
    return Array.isArray(variations) ? variations : [];
  } catch (error) {
    console.error("Failed to fetch product variations", productId, error);
    return [];
  }
}

function stripHtml(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatCurrency(
  value: string | number | null | undefined,
): string | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  const numeric =
    typeof value === "number" ? value : Number.parseFloat(String(value));
  if (!Number.isFinite(numeric)) return undefined;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(numeric);
  } catch {
    return `$${numeric.toFixed(2)}`;
  }
}

const COLOR_KEYWORDS = ["color", "colour", "finish", "shade", "hue"] as const;
const SIZE_KEYWORDS = ["size", "fit"] as const;

const COLOR_SWATCH_MAP: Record<string, string> = {
  black: "#0f172a",
  "midnight black": "#0f172a",
  white: "#f8fafc",
  "arctic white": "#f8fafc",
  seafoam: "#2dd4bf",
  "seafoam teal": "#2dd4bf",
  teal: "#0f766e",
  orange: "#f97316",
  "signal orange": "#f97316",
  blue: "#2563eb",
  navy: "#1e3a8a",
  red: "#dc2626",
  green: "#16a34a",
  emerald: "#10b981",
  yellow: "#facc15",
  gold: "#f59e0b",
  silver: "#94a3b8",
  gray: "#6b7280",
  grey: "#6b7280",
  bronze: "#b45309",
  brown: "#92400e",
  sand: "#f5deb3",
  pink: "#ec4899",
  purple: "#8b5cf6",
};

function normalizeAttributeKey(value?: string): string {
  if (!value) return "";
  return value
    .trim()
    .toLowerCase()
    .replace(/^pa[_-\s]+/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeOptionValue(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
}

function isAttributeKeywordMatch(
  value: string,
  keywords: readonly string[],
): boolean {
  const normalized = normalizeAttributeKey(value);
  if (!normalized) return false;
  return keywords.some((keyword) => normalized.includes(keyword));
}

function collectAttributeKeys(
  attributes: WooProductAttribute[] | undefined,
  keywords: readonly string[],
): Set<string> {
  const keys = new Set<string>();
  if (!Array.isArray(attributes)) return keys;
  for (const attribute of attributes) {
    const candidates = [attribute?.name, attribute?.slug];
    for (const candidate of candidates) {
      if (candidate && isAttributeKeywordMatch(candidate, keywords)) {
        const normalized = normalizeAttributeKey(candidate);
        if (normalized) keys.add(normalized);
      }
    }
  }
  return keys;
}

function resolveColorSwatch(value: string): string | undefined {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;
  const direct = COLOR_SWATCH_MAP[normalized];
  if (direct) return direct;
  const sanitized = normalized.replace(/[^a-z]/g, "");
  for (const [key, hex] of Object.entries(COLOR_SWATCH_MAP)) {
    if (sanitized === key.replace(/[^a-z]/g, "")) return hex;
  }
  const tokens = normalized.split(/[\s\/-]+/);
  for (const token of tokens) {
    const hex = COLOR_SWATCH_MAP[token];
    if (hex) return hex;
  }
  return undefined;
}

function deriveStockMessaging(
  status?: string,
  quantity?: number | null,
): {
  ship?: string;
  badge?: string;
} {
  const normalized = (status ?? "").toLowerCase();
  if (normalized === "instock" || normalized === "in-stock") {
    const badge =
      typeof quantity === "number" && quantity <= 3 ? "Low stock" : undefined;
    return { ship: "In stock", badge };
  }
  if (normalized === "onbackorder" || normalized === "backorder") {
    return { ship: "Backorder", badge: "Ships soon" };
  }
  if (normalized === "outofstock" || normalized === "out-of-stock") {
    return { ship: "Out of stock", badge: "Notify me" };
  }
  return { ship: undefined, badge: undefined };
}

function parsePriceValue(value?: string | null): number | null {
  if (value === null || value === undefined || value === "") return null;
  const numeric = Number.parseFloat(String(value));
  return Number.isFinite(numeric) ? numeric : null;
}

function formatPriceDifference(
  basePrice: number | null,
  variationPrice: number | null,
): string | undefined {
  if (basePrice === null || variationPrice === null) return undefined;
  const diff = variationPrice - basePrice;
  if (Math.abs(diff) < 0.01) return undefined;
  const formatted = formatCurrency(Math.abs(diff));
  if (!formatted) return undefined;
  return diff > 0 ? `+${formatted}` : `-${formatted}`;
}

function isVariableProduct(product: WooProduct): boolean {
  const type = product.type?.toLowerCase();
  if (type === "variable") return true;
  if (Array.isArray(product.attributes)) {
    return product.attributes.some((attribute) => attribute?.variation);
  }
  return false;
}

function buildVariationOptions(
  product: WooProduct,
  variations: WooProductVariation[],
): { colorOptions?: ColorOption[]; sizeOptions?: SizeOption[] } {
  if (!variations.length) {
    return { colorOptions: undefined, sizeOptions: undefined };
  }

  const parentColorKeys = collectAttributeKeys(
    product.attributes,
    COLOR_KEYWORDS,
  );
  const parentSizeKeys = collectAttributeKeys(
    product.attributes,
    SIZE_KEYWORDS,
  );

  const basePrice =
    parsePriceValue(product.sale_price) ??
    parsePriceValue(product.price) ??
    parsePriceValue(product.regular_price) ??
    null;

  const colorMap = new Map<string, ColorOption>();
  const colorBadgeRank = new Map<string, number>();
  const sizeMap = new Map<
    string,
    {
      option: SizeOption;
      badgeRank: number;
    }
  >();
  const badgePriority = new Map<string, number>([
    ["Low stock", 3],
    ["Ships soon", 2],
    ["Notify me", 1],
  ]);

  const fallbackImage = product.images?.find((img) => img?.src)?.src;
  const productStockMessaging = deriveStockMessaging(
    product.stock_status,
    product.stock_quantity,
  );
  const fallbackPrice =
    formatCurrency(product.sale_price) ??
    formatCurrency(product.price) ??
    formatCurrency(product.regular_price);

  for (const variation of variations) {
    const attributes = variation.attributes ?? [];
    const colorAttr = attributes.find((attr) => {
      const normalized = normalizeAttributeKey(attr?.name);
      if (!normalized) return false;
      if (parentColorKeys.has(normalized)) return true;
      return COLOR_KEYWORDS.some((keyword) => normalized.includes(keyword));
    });
    const sizeAttr = attributes.find((attr) => {
      const normalized = normalizeAttributeKey(attr?.name);
      if (!normalized) return false;
      if (parentSizeKeys.has(normalized)) return true;
      return SIZE_KEYWORDS.some((keyword) => normalized.includes(keyword));
    });

    const priceDisplay = formatCurrency(
      variation.sale_price ?? variation.price ?? variation.regular_price,
    );
    const stockMessaging = deriveStockMessaging(
      variation.stock_status,
      variation.stock_quantity,
    );
    const variationImage = variation.image?.src ?? fallbackImage;

    if (colorAttr?.option) {
      const label = colorAttr.option.trim();
      if (label.length > 0) {
        const key = normalizeOptionValue(label);
        const existing = colorMap.get(key) ?? {
          label,
          value: key,
        };
        if (!existing.image && variationImage) {
          existing.image = variationImage;
        }
        if (!existing.price && priceDisplay) {
          existing.price = priceDisplay;
        }
        if (!existing.swatch) {
          const swatch = resolveColorSwatch(label);
          if (swatch) existing.swatch = swatch;
        }
        if (!existing.shipEstimate && stockMessaging.ship) {
          existing.shipEstimate = stockMessaging.ship;
        }
        if (stockMessaging.badge) {
          const nextRank = badgePriority.get(stockMessaging.badge) ?? 0;
          const currentRank = colorBadgeRank.get(key) ?? 0;
          if (nextRank >= currentRank) {
            existing.badge = stockMessaging.badge;
            colorBadgeRank.set(key, nextRank);
          }
        }
        colorMap.set(key, existing);
      }
    }

    if (sizeAttr?.option) {
      const label = sizeAttr.option.trim();
      if (label.length > 0) {
        const key = normalizeOptionValue(label);
        const existing = sizeMap.get(key) ?? {
          option: {
            label,
            value: key,
          },
          badgeRank: 0,
        };

        if (stockMessaging.badge) {
          const nextRank = badgePriority.get(stockMessaging.badge) ?? 0;
          if (nextRank >= existing.badgeRank) {
            existing.option.badge = stockMessaging.badge;
            existing.badgeRank = nextRank;
          }
        }

        const variationPrice = parsePriceValue(
          variation.sale_price ?? variation.price ?? variation.regular_price,
        );
        const priceModifier = formatPriceDifference(basePrice, variationPrice);
        if (priceModifier && !existing.option.priceModifier) {
          existing.option.priceModifier = priceModifier;
        }

        sizeMap.set(key, existing);
      }
    }
  }

  const colorOptions = colorMap.size
    ? Array.from(colorMap.values()).map((option) => ({
        label: option.label,
        value: option.value,
        image: option.image ?? fallbackImage,
        price: option.price ?? fallbackPrice,
        swatch: option.swatch,
        shipEstimate: option.shipEstimate ?? productStockMessaging.ship,
        badge: option.badge ?? productStockMessaging.badge,
      }))
    : undefined;

  const sizeOptions = sizeMap.size
    ? Array.from(sizeMap.values())
        .map(({ option }) => ({
          label: option.label,
          value: option.value,
          badge: option.badge,
          description: option.description,
          priceModifier: option.priceModifier,
        }))
        .sort((a, b) =>
          a.label.localeCompare(b.label, undefined, {
            numeric: true,
            sensitivity: "base",
          }),
        )
    : undefined;

  return { colorOptions, sizeOptions };
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  // Strict: fetch Yoast only for this product slug via internal API; no cross-content fallback
  try {
    const url = absoluteUrl(
      `/api/yoast?type=product&slug=${encodeURIComponent(params.slug)}`,
    );
    const res = await fetch(url, { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      const data = json?.data;
      if (json?.ok && data) {
        return {
          title: data.title ?? null,
          description: data.description ?? null,
          alternates: data.canonical
            ? { canonical: data.canonical }
            : undefined,
          openGraph: {
            title: data.og?.title ?? null,
            description: data.og?.description ?? null,
            images: data.og?.image ? [{ url: data.og.image }] : undefined,
            url: data.og?.url ?? data.canonical ?? null,
            type: data.og?.type ?? null,
          },
          twitter: {
            title: data.twitter?.title ?? null,
            description: data.twitter?.description ?? null,
            images: data.twitter?.image ? [data.twitter.image] : undefined,
            card: data.twitter?.card ?? null,
            site: data.twitter?.site ?? null,
          },
          robots: data.robots ?? null,
        } as any;
      }
    }
  } catch (error) {
    console.error("Failed to generate product metadata (strict)", error);
  }
  // No fallback to other content
  return {} as any;
}

function renderMissingProduct(slug: string) {
  return (
    <div className="bg-white text-slate-900">
      <Navigation />
      <main className="min-h-[60vh] bg-white">
        <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-24 text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Product temporarily unavailable
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            We couldn’t load this product ({slug}) right now
          </h1>
          <p className="text-base text-slate-600">
            Our catalog service didn’t return this item. It may have been unpublished or the
            connection to WooCommerce timed out. Please refresh in a moment or browse our latest
            trips and gear below.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/trips-tours/"
              className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700"
            >
              Explore trips & tours
            </Link>
            <Link
              href="/scuba-gear/"
              className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
            >
              Shop scuba gear
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default async function ProductSSRPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug(params.slug);
  if (!product) {
    console.warn("Product page fallback: no product for slug", params.slug);
    return renderMissingProduct(params.slug);
  }

  const categories: WooCategory[] = Array.isArray(product.categories)
    ? product.categories
    : [];
  const mapping = getTemplateForProduct(
    categories.map((cat) => ({
      id: cat.id,
      name: cat.name ?? cat.slug ?? "",
      slug: cat.slug,
      parent: cat.parent,
    })),
  );

  const hasCertificationCategory = categories.some(
    (c) => (c.slug || "").toLowerCase() === "certification-courses",
  );

  const templatePath = hasCertificationCategory
    ? "/certification-template"
    : (mapping?.templatePath ?? null);

  if (templatePath === "/certification-template") {
    const heroImageUrl =
      product.images && product.images.length > 0
        ? product.images[0]?.src
        : undefined;
    const productId = product.id;
    const initialPrice = (() => {
      const v = product.sale_price || product.price || product.regular_price;
      const n = typeof v === "number" ? v : Number.parseFloat(String(v));
      return Number.isFinite(n) ? n : undefined;
    })();
    return (
      <div className="bg-white text-slate-900">
        <Navigation />
        <main className="min-h-[60vh] bg-white">
          <div id="wcf-embed-root" data-wcf-embed-root="1">
            <CertificationTemplateEmbedded
              heroImageUrl={heroImageUrl}
              productId={productId}
              initialPrice={initialPrice}
              productName={product.name}
              productSlug={params.slug}
            />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (templatePath === "/dev/ecommerce-scuba-gear-product-mockup") {
    const primaryImage = product.images?.find((img) => img?.src);
    const galleryImages = (product.images ?? [])
      .filter((img): img is { src: string; alt?: string } => Boolean(img?.src))
      .map((img, index) => ({
        src: img.src,
        alt:
          img.alt && img.alt.trim().length > 0
            ? img.alt
            : `${product.name} image ${index + 1}`,
      }));

    const priceDisplay =
      formatCurrency(product.sale_price) ??
      formatCurrency(product.price) ??
      formatCurrency(product.regular_price) ??
      undefined;

    const shortDescription =
      stripHtml(product.short_description) ?? stripHtml(product.description);

    let colorOptions: ColorOption[] | undefined;
    let sizeOptions: SizeOption[] | undefined;

    if (isVariableProduct(product)) {
      const variations = await getProductVariations(product.id);
      const variationOptions = buildVariationOptions(product, variations);
      colorOptions = variationOptions.colorOptions;
      sizeOptions = variationOptions.sizeOptions;
    }

    return (
      <div className="bg-white text-slate-900">
        <Navigation />
        <main className="min-h-[60vh] bg-white">
          <div id="wcf-embed-root" data-wcf-embed-root="1">
            <EcommerceScubaGearProductTemplate
              product={{
                name: product.name,
                shortDescription,
                price: priceDisplay,
                heroImage: primaryImage?.src,
                galleryImages,
                colorOptions,
                sizeOptions,
              }}
            />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const productId: number = product.id;
  const tourData: TourData | null = product.wcf_tour_data ?? null;
  const heroImageUrl =
    product.images && product.images.length > 0
      ? product.images[0]?.src
      : undefined;

  let data: Partial<TourData> | undefined;
  if (tourData) {
    data = tourData as TourData;
  } else {
    try {
      const res = await fetch(absoluteUrl(`/api/product-data/${productId}`), {
        cache: "no-store",
      });
      if (res.ok) {
        const json = await res.json();
        data = json?.product?.tourData as Partial<TourData> | undefined;
      }
    } catch (error) {
      console.error("Failed to load supplemental product data", error);
    }
  }

  return (
    <div className="bg-white text-slate-900">
      <Navigation />
      <main className="min-h-[60vh] bg-white">
        <div id="wcf-embed-root" data-wcf-embed-root="1">
          <SnorkelingToursTemplate data={data} productId={productId} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
