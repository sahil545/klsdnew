import { z } from "zod";
import { supabaseAdmin } from "./supabaseAdmin";
import type { TourData } from "../app/snorkeling-tours-template/data";

const categorySchema = z
  .object({
    id: z.number().nullable().optional(),
    name: z.string().nullable().optional(),
    slug: z.string().nullable().optional(),
  })
  .passthrough();

const featureSchema = z
  .object({
    icon: z.string().nullable().optional(),
    title: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
  })
  .passthrough();

const journeyStepSchema = z
  .object({
    step: z.number().nullable().optional(),
    title: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    time: z.string().nullable().optional(),
    color: z.string().nullable().optional(),
  })
  .passthrough();

const marineCategorySchema = z
  .object({
    title: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    color: z.string().nullable().optional(),
    features: z.array(z.string()).nullable().optional(),
  })
  .passthrough();

const trustStatSchema = z
  .object({
    value: z.string().nullable().optional(),
    label: z.string().nullable().optional(),
  })
  .passthrough();

const mediaSchema = z
  .object({
    id: z.string().nullable().optional(),
    type: z.string().nullable().optional(),
    src: z.string().nullable().optional(),
    alt: z.string().nullable().optional(),
    position: z.number().nullable().optional(),
    is_primary: z.boolean().nullable().optional(),
    meta: z.record(z.unknown()).nullable().optional(),
  })
  .passthrough();

const optionValueSchema = z
  .object({
    id: z.string().nullable().optional(),
    value: z.string().nullable().optional(),
    label: z.string().nullable().optional(),
    hex_color: z.string().nullable().optional(),
    image: z.string().nullable().optional(),
    badge: z.string().nullable().optional(),
    ships_in: z.string().nullable().optional(),
    inventory_status: z.string().nullable().optional(),
    is_default: z.boolean().nullable().optional(),
    position: z.number().nullable().optional(),
    meta: z.record(z.unknown()).nullable().optional(),
  })
  .passthrough();

const optionSchema = z
  .object({
    id: z.string().nullable().optional(),
    option_type: z.string().nullable().optional(),
    code: z.string().nullable().optional(),
    label: z.string().nullable().optional(),
    allow_multiple: z.boolean().nullable().optional(),
    position: z.number().nullable().optional(),
    meta: z.record(z.unknown()).nullable().optional(),
    values: z.array(optionValueSchema).nullable().optional(),
  })
  .passthrough();

const shippingPromiseSchema = z
  .object({
    id: z.string().nullable().optional(),
    label: z.string().nullable().optional(),
    detail: z.string().nullable().optional(),
    badge: z.string().nullable().optional(),
    position: z.number().nullable().optional(),
    meta: z.record(z.unknown()).nullable().optional(),
  })
  .passthrough();

const paymentPlanSchema = z
  .object({
    id: z.string().nullable().optional(),
    provider: z.string().nullable().optional(),
    message: z.string().nullable().optional(),
    details: z.string().nullable().optional(),
    position: z.number().nullable().optional(),
    meta: z.record(z.unknown()).nullable().optional(),
  })
  .passthrough();

const productInfoSchema = z
  .object({
    id: z.union([z.number(), z.string()]).nullable().optional(),
    slug: z.string().nullable().optional(),
    sku: z.string().nullable().optional(),
    status: z.string().nullable().optional(),
    type: z.string().nullable().optional(),
    name: z.string().nullable().optional(),
    price: z.number().nullable().optional(),
    regular_price: z.number().nullable().optional(),
    sale_price: z.number().nullable().optional(),
    currency: z.string().nullable().optional(),
    stock_status: z.string().nullable().optional(),
    stock_quantity: z.number().nullable().optional(),
    permalink: z.string().nullable().optional(),
    last_synced_at: z.string().nullable().optional(),
    route_id: z.string().nullable().optional(),
    template_id: z.string().nullable().optional(),
    meta: z.record(z.unknown()).nullable().optional(),
  })
  .passthrough();

const productTemplateSchema = z.object({
  id: z.string(),
  product_id: z.number(),
  slug: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  breadcrumb_label: z.string().nullable(),
  images: z
    .object({
      hero: z.string().nullable().optional(),
      gallery: z.array(z.string()).default([]),
    })
    .nullable()
    .default(null),
  hero_badges: z.array(z.string()).nullable().default(null),
  categories: z.array(categorySchema).nullable().default(null),
  details: z
    .object({
      duration: z.string().nullable().optional(),
      groupSize: z.string().nullable().optional(),
      location: z.string().nullable().optional(),
      gearIncluded: z.boolean().nullable().optional(),
      rating: z.number().nullable().optional(),
      reviewCount: z.number().nullable().optional(),
    })
    .nullable()
    .default(null),
  highlights: z.array(z.string()).nullable().default(null),
  pricing: z
    .object({
      basePrice: z.number().nullable().optional(),
      taxRate: z.number().nullable().optional(),
      currency: z.string().nullable().optional(),
    })
    .nullable()
    .default(null),
  experience: z
    .object({
      title: z.string().nullable().optional(),
      description: z.string().nullable().optional(),
      features: z.array(featureSchema).nullable().optional(),
    })
    .nullable()
    .default(null),
  included: z
    .object({
      title: z.string().nullable().optional(),
      items: z.array(z.string()).nullable().optional(),
      award: z.string().nullable().optional(),
    })
    .nullable()
    .default(null),
  journey: z
    .object({
      title: z.string().nullable().optional(),
      description: z.string().nullable().optional(),
      steps: z.array(journeyStepSchema).nullable().optional(),
    })
    .nullable()
    .default(null),
  marine_life: z
    .object({
      title: z.string().nullable().optional(),
      description: z.string().nullable().optional(),
      categories: z.array(marineCategorySchema).nullable().optional(),
    })
    .nullable()
    .default(null),
  trust_indicators: z
    .object({
      title: z.string().nullable().optional(),
      subtitle: z.string().nullable().optional(),
      stats: z.array(trustStatSchema).nullable().optional(),
    })
    .nullable()
    .default(null),
  final_cta: z
    .object({
      title: z.string().nullable().optional(),
      description: z.string().nullable().optional(),
      phone: z.string().nullable().optional(),
      benefits: z.array(z.string()).nullable().optional(),
    })
    .nullable()
    .default(null),
  primary_cta: z
    .object({
      label: z.string().nullable().optional(),
      href: z.string().nullable().optional(),
    })
    .nullable()
    .default(null),
  product: productInfoSchema.nullable().default(null),
  media_assets: z.array(mediaSchema).nullable().default(null),
  options: z.array(optionSchema).nullable().default(null),
  shipping_promises: z.array(shippingPromiseSchema).nullable().default(null),
  payment_plans: z.array(paymentPlanSchema).nullable().default(null),
  nextjs_override: z.boolean().nullable().default(null),
  nextjs_base_url: z.string().nullable().default(null),
  product_permalink: z.string().nullable().default(null),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
});

type ProductTemplateRecord = z.infer<typeof productTemplateSchema>;

type Category = z.infer<typeof categorySchema>;

type ProductInfo = {
  id: number;
  slug: string | null;
  sku: string | null;
  status: string | null;
  type: string | null;
  name: string | null;
  price: number | null;
  regularPrice: number | null;
  salePrice: number | null;
  currency: string | null;
  stockStatus: string | null;
  stockQuantity: number | null;
  permalink: string | null;
  lastSyncedAt: string | null;
  routeId: string | null;
  templateId: string | null;
  meta: Record<string, unknown> | null;
};

type ProductMedia = {
  id: string | null;
  type: string | null;
  src: string | null;
  alt: string | null;
  position: number;
  isPrimary: boolean;
  meta: Record<string, unknown> | null;
};

type ProductOptionValue = {
  id: string | null;
  value: string | null;
  label: string | null;
  hexColor: string | null;
  image: string | null;
  badge: string | null;
  shipsIn: string | null;
  inventoryStatus: string | null;
  isDefault: boolean;
  position: number;
  meta: Record<string, unknown> | null;
};

type ProductOption = {
  id: string | null;
  optionType: string | null;
  code: string | null;
  label: string | null;
  allowMultiple: boolean;
  position: number;
  meta: Record<string, unknown> | null;
  values: ProductOptionValue[];
};

type ShippingPromise = {
  id: string | null;
  label: string | null;
  detail: string | null;
  badge: string | null;
  position: number;
  meta: Record<string, unknown> | null;
};

type PaymentPlan = {
  id: string | null;
  provider: string | null;
  message: string | null;
  details: string | null;
  position: number;
  meta: Record<string, unknown> | null;
};

type ProductTemplateResult = {
  productId: number;
  slug: string;
  permalink: string | null;
  categories: Category[];
  tourData: Partial<TourData>;
  heroBadges: string[];
  productInfo: ProductInfo | null;
  mediaAssets: ProductMedia[];
  options: ProductOption[];
  shippingPromises: ShippingPromise[];
  paymentPlans: PaymentPlan[];
  record: ProductTemplateRecord;
};

function ensureArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

function sanitizeString(value: string | null | undefined) {
  return typeof value === "string" && value.trim().length > 0
    ? value
    : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function toInteger(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value))
    return Math.trunc(value);
  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function toBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1" || normalized === "yes";
  }
  return false;
}

function sanitizeProductInfo(raw: unknown): ProductInfo | null {
  if (!isRecord(raw)) return null;
  const numericId = toInteger(raw.id);
  if (numericId === null) {
    return null;
  }
  const stockQuantity = toInteger(raw.stock_quantity);
  return {
    id: numericId,
    slug: sanitizeString(raw.slug as string | undefined) ?? null,
    sku: sanitizeString(raw.sku as string | undefined) ?? null,
    status: sanitizeString(raw.status as string | undefined) ?? null,
    type: sanitizeString(raw.type as string | undefined) ?? null,
    name: sanitizeString(raw.name as string | undefined) ?? null,
    price: toNumber(raw.price) ?? null,
    regularPrice: toNumber(raw.regular_price) ?? null,
    salePrice: toNumber(raw.sale_price) ?? null,
    currency: sanitizeString(raw.currency as string | undefined) ?? null,
    stockStatus: sanitizeString(raw.stock_status as string | undefined) ?? null,
    stockQuantity: stockQuantity,
    permalink: sanitizeString(raw.permalink as string | undefined) ?? null,
    lastSyncedAt:
      sanitizeString(raw.last_synced_at as string | undefined) ?? null,
    routeId: sanitizeString(raw.route_id as string | undefined) ?? null,
    templateId: sanitizeString(raw.template_id as string | undefined) ?? null,
    meta: isRecord(raw.meta) ? (raw.meta as Record<string, unknown>) : null,
  };
}

function ensureMediaAssets(value: unknown): ProductMedia[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry, index) => {
      if (!isRecord(entry)) return null;
      const position = toInteger(entry.position) ?? index;
      return {
        id: sanitizeString(entry.id as string | undefined) ?? null,
        type: sanitizeString(entry.type as string | undefined) ?? null,
        src: sanitizeString(entry.src as string | undefined) ?? null,
        alt: sanitizeString(entry.alt as string | undefined) ?? null,
        position,
        isPrimary: toBoolean(entry.is_primary),
        meta: isRecord(entry.meta)
          ? (entry.meta as Record<string, unknown>)
          : null,
      } satisfies ProductMedia;
    })
    .filter((item): item is ProductMedia => item !== null);
}

function ensureOptionValues(value: unknown): ProductOptionValue[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry, index) => {
      if (!isRecord(entry)) return null;
      return {
        id: sanitizeString(entry.id as string | undefined) ?? null,
        value: sanitizeString(entry.value as string | undefined) ?? null,
        label: sanitizeString(entry.label as string | undefined) ?? null,
        hexColor: sanitizeString(entry.hex_color as string | undefined) ?? null,
        image: sanitizeString(entry.image as string | undefined) ?? null,
        badge: sanitizeString(entry.badge as string | undefined) ?? null,
        shipsIn: sanitizeString(entry.ships_in as string | undefined) ?? null,
        inventoryStatus:
          sanitizeString(entry.inventory_status as string | undefined) ?? null,
        isDefault: toBoolean(entry.is_default),
        position: toInteger(entry.position) ?? index,
        meta: isRecord(entry.meta)
          ? (entry.meta as Record<string, unknown>)
          : null,
      } satisfies ProductOptionValue;
    })
    .filter((item): item is ProductOptionValue => item !== null);
}

function ensureOptions(value: unknown): ProductOption[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry, index) => {
      if (!isRecord(entry)) return null;
      return {
        id: sanitizeString(entry.id as string | undefined) ?? null,
        optionType:
          sanitizeString(entry.option_type as string | undefined) ?? null,
        code: sanitizeString(entry.code as string | undefined) ?? null,
        label: sanitizeString(entry.label as string | undefined) ?? null,
        allowMultiple: toBoolean(entry.allow_multiple),
        position: toInteger(entry.position) ?? index,
        meta: isRecord(entry.meta)
          ? (entry.meta as Record<string, unknown>)
          : null,
        values: ensureOptionValues(entry.values),
      } satisfies ProductOption;
    })
    .filter((item): item is ProductOption => item !== null);
}

function ensureShippingPromises(value: unknown): ShippingPromise[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry, index) => {
      if (!isRecord(entry)) return null;
      return {
        id: sanitizeString(entry.id as string | undefined) ?? null,
        label: sanitizeString(entry.label as string | undefined) ?? null,
        detail: sanitizeString(entry.detail as string | undefined) ?? null,
        badge: sanitizeString(entry.badge as string | undefined) ?? null,
        position: toInteger(entry.position) ?? index,
        meta: isRecord(entry.meta)
          ? (entry.meta as Record<string, unknown>)
          : null,
      } satisfies ShippingPromise;
    })
    .filter((item): item is ShippingPromise => item !== null);
}

function ensurePaymentPlans(value: unknown): PaymentPlan[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry, index) => {
      if (!isRecord(entry)) return null;
      return {
        id: sanitizeString(entry.id as string | undefined) ?? null,
        provider: sanitizeString(entry.provider as string | undefined) ?? null,
        message: sanitizeString(entry.message as string | undefined) ?? null,
        details: sanitizeString(entry.details as string | undefined) ?? null,
        position: toInteger(entry.position) ?? index,
        meta: isRecord(entry.meta)
          ? (entry.meta as Record<string, unknown>)
          : null,
      } satisfies PaymentPlan;
    })
    .filter((item): item is PaymentPlan => item !== null);
}

function mapRecordToTourData(record: ProductTemplateRecord): Partial<TourData> {
  const images = record.images;
  const details = record.details;
  const pricing = record.pricing;
  const experience = record.experience;
  const included = record.included;
  const journey = record.journey;
  const marine = record.marine_life;
  const trust = record.trust_indicators;
  const finalCta = record.final_cta;

  return {
    name: record.name,
    description: sanitizeString(record.description),
    images: {
      hero: sanitizeString(images?.hero ?? undefined),
      gallery: ensureArray(images?.gallery).filter(
        (item) => typeof item === "string" && item.length > 0,
      ),
    },
    categories: ensureArray(record.categories)
      .map((cat) => sanitizeString(cat?.name ?? undefined))
      .filter(
        (name): name is string => typeof name === "string" && name.length > 0,
      ),
    details: {
      duration: sanitizeString(details?.duration ?? undefined),
      groupSize: sanitizeString(details?.groupSize ?? undefined),
      location: sanitizeString(details?.location ?? undefined),
      gearIncluded:
        typeof details?.gearIncluded === "boolean"
          ? details.gearIncluded
          : undefined,
      rating: typeof details?.rating === "number" ? details.rating : undefined,
      reviewCount:
        typeof details?.reviewCount === "number"
          ? details.reviewCount
          : undefined,
    },
    highlights: ensureArray(record.highlights).filter(
      (item) => typeof item === "string" && item.length > 0,
    ),
    pricing: {
      basePrice:
        typeof pricing?.basePrice === "number" ? pricing.basePrice : undefined,
      taxRate:
        typeof pricing?.taxRate === "number" ? pricing.taxRate : undefined,
      currency: sanitizeString(pricing?.currency ?? undefined),
    },
    experience: {
      title: sanitizeString(experience?.title ?? undefined),
      description: sanitizeString(experience?.description ?? undefined),
      features: ensureArray(experience?.features)
        .map((feature) => {
          const icon = sanitizeString(feature?.icon ?? undefined) ?? "Fish";
          const title = sanitizeString(feature?.title ?? undefined) ?? "";
          const description =
            sanitizeString(feature?.description ?? undefined) ?? "";
          if (!title && !description) return null;
          return { icon, title, description };
        })
        .filter(
          (feature): feature is TourData["experience"]["features"][number] =>
            feature !== null,
        ),
    },
    included: {
      title: sanitizeString(included?.title ?? undefined),
      items: ensureArray(included?.items).filter(
        (item) => typeof item === "string" && item.length > 0,
      ),
      award: sanitizeString(included?.award ?? undefined),
    },
    journey: {
      title: sanitizeString(journey?.title ?? undefined),
      description: sanitizeString(journey?.description ?? undefined),
      steps: ensureArray(journey?.steps)
        .map((step, index) => {
          const title = sanitizeString(step?.title ?? undefined) ?? "";
          const description =
            sanitizeString(step?.description ?? undefined) ?? "";
          const time = sanitizeString(step?.time ?? undefined) ?? "";
          const color = sanitizeString(step?.color ?? undefined) ?? "blue";
          if (!title && !description && !time) return null;
          return {
            step: typeof step?.step === "number" ? step.step : index + 1,
            title,
            description,
            time,
            color:
              (color as TourData["journey"]["steps"][number]["color"]) ||
              "blue",
          };
        })
        .filter(
          (step): step is TourData["journey"]["steps"][number] => step !== null,
        ),
    },
    marineLife: {
      title: sanitizeString(marine?.title ?? undefined),
      description: sanitizeString(marine?.description ?? undefined),
      categories: ensureArray(marine?.categories)
        .map((category) => {
          const title = sanitizeString(category?.title ?? undefined) ?? "";
          const description =
            sanitizeString(category?.description ?? undefined) ?? "";
          const color = sanitizeString(category?.color ?? undefined) ?? "blue";
          const features = ensureArray(category?.features).filter(
            (item) => typeof item === "string" && item.length > 0,
          );
          if (!title && !description && features.length === 0) return null;
          return {
            title,
            description,
            color:
              (color as TourData["marineLife"]["categories"][number]["color"]) ||
              "blue",
            features,
          };
        })
        .filter(
          (
            category,
          ): category is TourData["marineLife"]["categories"][number] =>
            category !== null,
        ),
    },
    trustIndicators: {
      title: sanitizeString(trust?.title ?? undefined),
      subtitle: sanitizeString(trust?.subtitle ?? undefined),
      stats: ensureArray(trust?.stats)
        .map((stat) => {
          const value = sanitizeString(stat?.value ?? undefined) ?? "";
          const label = sanitizeString(stat?.label ?? undefined) ?? "";
          if (!value && !label) return null;
          return { value, label };
        })
        .filter(
          (stat): stat is TourData["trustIndicators"]["stats"][number] =>
            stat !== null,
        ),
    },
    finalCTA: {
      title: sanitizeString(finalCta?.title ?? undefined),
      description: sanitizeString(finalCta?.description ?? undefined),
      phone: sanitizeString(finalCta?.phone ?? undefined),
      benefits: ensureArray(finalCta?.benefits).filter(
        (item) => typeof item === "string" && item.length > 0,
      ),
    },
  };
}

function buildResult(record: ProductTemplateRecord): ProductTemplateResult {
  const categories = ensureArray(record.categories)
    .map((cat) => (cat && typeof cat === "object" ? (cat as Category) : null))
    .filter((cat): cat is Category => cat !== null);

  const heroBadges = ensureArray(record.hero_badges).filter(
    (badge): badge is string =>
      typeof badge === "string" && badge.trim().length > 0,
  );

  return {
    productId: record.product_id,
    slug: record.slug,
    permalink: record.product_permalink ?? null,
    categories,
    tourData: mapRecordToTourData(record),
    heroBadges,
    productInfo: sanitizeProductInfo(record.product),
    mediaAssets: ensureMediaAssets(record.media_assets),
    options: ensureOptions(record.options),
    shippingPromises: ensureShippingPromises(record.shipping_promises),
    paymentPlans: ensurePaymentPlans(record.payment_plans),
    record,
  };
}

async function fetchSingleTemplate(filter: {
  slug?: string;
  product_id?: number;
}) {
  const supabase = supabaseAdmin();
  const query = supabase.from("products_v").select("*").limit(1);

  if (filter.slug) {
    query.eq("slug", filter.slug);
  }
  if (typeof filter.product_id === "number") {
    query.eq("product_id", filter.product_id);
  }

  const { data, error } = await query.maybeSingle();
  if (error || !data) {
    return null;
  }

  const parsed = productTemplateSchema.parse(data);
  return buildResult(parsed);
}

export async function loadProductTemplateBySlug(slug: string) {
  return fetchSingleTemplate({ slug });
}

export async function loadProductTemplateByProductId(productId: number) {
  return fetchSingleTemplate({ product_id: productId });
}

export type {
  ProductTemplateResult,
  ProductInfo,
  ProductMedia,
  ProductOption,
  ProductOptionValue,
  ShippingPromise,
  PaymentPlan,
};
