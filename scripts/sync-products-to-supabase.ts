import "dotenv/config";

import type { WooCommerceProduct } from "../client/lib/woocommerce";
import { wooCommerce } from "../client/lib/woocommerce";
import { convertWooCommerceToTourData } from "../lib/woo-to-tour-data";
import { supabaseAdmin } from "../lib/supabaseAdmin";

const supabase = supabaseAdmin();

type MetaEntry = { key?: string | null; value?: any };
type SyncOptions = { ids: number[]; slugs: string[]; pageSize: number };

type SyncResult = {
  productId: number;
  templateId?: string;
  name?: string;
  error?: string;
};

function parseArgs(args: string[]): SyncOptions {
  const ids: number[] = [];
  const slugs: string[] = [];
  let pageSize = 50;

  for (const arg of args) {
    if (arg.startsWith("--ids=")) {
      const value = arg.slice("--ids=".length);
      value
        .split(",")
        .map((token) => token.trim())
        .filter(Boolean)
        .forEach((token) => {
          const parsed = Number.parseInt(token, 10);
          if (Number.isFinite(parsed)) ids.push(parsed);
        });
    } else if (arg.startsWith("--slugs=")) {
      const value = arg.slice("--slugs=".length);
      value
        .split(",")
        .map((token) => token.trim())
        .filter(Boolean)
        .forEach((token) => slugs.push(token));
    } else if (arg.startsWith("--pageSize=")) {
      const value = Number.parseInt(arg.slice("--pageSize=".length), 10);
      if (Number.isFinite(value) && value > 0) {
        pageSize = value;
      }
    }
  }

  return {
    ids: Array.from(new Set(ids)),
    slugs: Array.from(new Set(slugs)),
    pageSize,
  };
}

function buildMetaMap(meta: MetaEntry[]): Map<string, any> {
  const map = new Map<string, any>();
  for (const entry of meta) {
    if (!entry || typeof entry.key !== "string") continue;
    map.set(entry.key, entry.value);
  }
  return map;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
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

function getMapString(map: Map<string, any>, key: string): string | null {
  const value = map.get(key);
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  return null;
}

function parseJsonArray(value: unknown): any[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function parseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : null))
      .filter(isNonEmptyString);
  }
  if (typeof value === "string") {
    return value
      .split(/\r?\n|,/)
      .map((token) => token.trim())
      .filter(isNonEmptyString);
  }
  return [];
}

function slugifyToken(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

type TemplateSlugRegistry = {
  bySlug: Map<string, number>;
  byProduct: Map<number, string>;
};

function buildTemplateSlugRegistry(
  rows: Array<{ product_id: number | null; slug: string | null }>,
): TemplateSlugRegistry {
  const registry: TemplateSlugRegistry = {
    bySlug: new Map<string, number>(),
    byProduct: new Map<number, string>(),
  };

  rows.forEach((row) => {
    if (typeof row.product_id !== "number") return;
    if (!isNonEmptyString(row.slug)) return;
    registry.bySlug.set(row.slug, row.product_id);
    registry.byProduct.set(row.product_id, row.slug);
  });

  return registry;
}

function assignTemplateSlug(
  desiredSlug: string | null | undefined,
  productId: number,
  registry: TemplateSlugRegistry,
): string {
  const baseInput =
    typeof desiredSlug === "string" && desiredSlug.trim().length > 0
      ? desiredSlug
      : `product-${productId}`;
  let baseSlug = slugifyToken(baseInput);
  if (!isNonEmptyString(baseSlug)) {
    baseSlug = `product-${productId}`;
  }

  const existingSlug = registry.byProduct.get(productId);
  if (existingSlug === baseSlug) {
    return existingSlug;
  }

  if (existingSlug && existingSlug !== baseSlug) {
    registry.bySlug.delete(existingSlug);
  }

  let attempt = 0;
  while (true) {
    const candidateInput =
      attempt === 0
        ? baseSlug
        : attempt === 1
          ? `${baseSlug}-${productId}`
          : `${baseSlug}-${productId}-${attempt}`;
    let candidate = slugifyToken(candidateInput);
    if (!isNonEmptyString(candidate)) {
      candidate = `product-${productId}-${attempt}`;
    }
    const currentOwner = registry.bySlug.get(candidate);
    if (!currentOwner || currentOwner === productId) {
      registry.bySlug.set(candidate, productId);
      registry.byProduct.set(productId, candidate);
      return candidate;
    }
    attempt += 1;
  }
}

function buildCategories(
  product: WooCommerceProduct,
): Array<{ id: number | null; name: string | null; slug: string | null }> {
  if (!Array.isArray(product.categories)) return [];
  return product.categories.map((cat) => ({
    id: typeof cat?.id === "number" ? cat.id : null,
    name: typeof cat?.name === "string" ? cat.name : null,
    slug: typeof cat?.slug === "string" ? cat.slug : null,
  }));
}

function mapShippingPromises(raw: any[]): Array<{
  product_id: number;
  label: string;
  detail: string | null;
  badge: string | null;
  position: number;
  meta: Record<string, unknown> | null;
}> {
  return raw
    .map((entry, index) => {
      if (typeof entry !== "object" || entry === null) return null;
      const label = isNonEmptyString(
        (entry as Record<string, unknown>).label as string,
      )
        ? ((entry as Record<string, unknown>).label as string).trim()
        : null;
      if (!label) return null;
      const detailRaw = (entry as Record<string, unknown>).detail;
      const badgeRaw = (entry as Record<string, unknown>).badge;
      return {
        product_id: 0,
        label,
        detail: isNonEmptyString(detailRaw as string)
          ? (detailRaw as string).trim()
          : null,
        badge: isNonEmptyString(badgeRaw as string)
          ? (badgeRaw as string).trim()
          : null,
        position:
          toInteger((entry as Record<string, unknown>).position) ?? index,
        meta:
          typeof (entry as Record<string, unknown>).meta === "object" &&
          (entry as Record<string, unknown>).meta !== null
            ? ((entry as Record<string, unknown>).meta as Record<
                string,
                unknown
              >)
            : null,
      };
    })
    .filter(
      (
        row,
      ): row is {
        product_id: number;
        label: string;
        detail: string | null;
        badge: string | null;
        position: number;
        meta: Record<string, unknown> | null;
      } => row !== null,
    );
}

function mapPaymentPlans(raw: any[]): Array<{
  product_id: number;
  provider: string | null;
  message: string | null;
  details: string | null;
  position: number;
  meta: Record<string, unknown> | null;
}> {
  return raw
    .map((entry, index) => {
      if (typeof entry !== "object" || entry === null) return null;
      const providerRaw = (entry as Record<string, unknown>).provider;
      const messageRaw = (entry as Record<string, unknown>).message;
      const detailsRaw = (entry as Record<string, unknown>).details;
      return {
        product_id: 0,
        provider: isNonEmptyString(providerRaw as string)
          ? (providerRaw as string).trim()
          : null,
        message: isNonEmptyString(messageRaw as string)
          ? (messageRaw as string).trim()
          : null,
        details: isNonEmptyString(detailsRaw as string)
          ? (detailsRaw as string).trim()
          : null,
        position:
          toInteger((entry as Record<string, unknown>).position) ?? index,
        meta:
          typeof (entry as Record<string, unknown>).meta === "object" &&
          (entry as Record<string, unknown>).meta !== null
            ? ((entry as Record<string, unknown>).meta as Record<
                string,
                unknown
              >)
            : null,
      };
    })
    .filter(
      (
        row,
      ): row is {
        product_id: number;
        provider: string | null;
        message: string | null;
        details: string | null;
        position: number;
        meta: Record<string, unknown> | null;
      } => row !== null,
    );
}

function collectOptionValueMeta(
  metaMap: Map<string, any>,
  optionCode: string,
  valueLabel: string | null,
): {
  hexColor: string | null;
  badge: string | null;
  shipsIn: string | null;
  inventoryStatus: string | null;
  image: string | null;
} {
  const tokens = [optionCode];
  if (isNonEmptyString(valueLabel)) tokens.push(slugifyToken(valueLabel));

  const result = {
    hexColor: null as string | null,
    badge: null as string | null,
    shipsIn: null as string | null,
    inventoryStatus: null as string | null,
    image: null as string | null,
  };

  for (const token of tokens) {
    const hex = getMapString(metaMap, `_wcf_option_${token}_hex`);
    if (hex && !result.hexColor) result.hexColor = hex;
    const badge = getMapString(metaMap, `_wcf_option_${token}_badge`);
    if (badge && !result.badge) result.badge = badge;
    const ships = getMapString(metaMap, `_wcf_option_${token}_ships`);
    if (ships && !result.shipsIn) result.shipsIn = ships;
    const inventory = getMapString(metaMap, `_wcf_option_${token}_inventory`);
    if (inventory && !result.inventoryStatus)
      result.inventoryStatus = inventory;
    const image = getMapString(metaMap, `_wcf_option_${token}_image`);
    if (image && !result.image) result.image = image;
  }

  return result;
}

async function fetchProducts(options: SyncOptions): Promise<any[]> {
  const results: any[] = [];

  if (options.ids.length > 0 || options.slugs.length > 0) {
    for (const id of options.ids) {
      try {
        const product = await wooCommerce.makeRequest(`/products/${id}`);
        if (product) results.push(product);
      } catch (error) {
        console.error(`Failed to fetch product ${id}:`, error);
      }
    }

    for (const slug of options.slugs) {
      try {
        const list = await wooCommerce.makeRequest(
          `/products?slug=${encodeURIComponent(slug)}&per_page=1`,
        );
        if (Array.isArray(list) && list[0]) {
          results.push(list[0]);
        }
      } catch (error) {
        console.error(`Failed to fetch product slug ${slug}:`, error);
      }
    }

    return results;
  }

  let page = 1;
  while (true) {
    try {
      const batch = await wooCommerce.makeRequest(
        `/products?per_page=${options.pageSize}&page=${page}`,
      );
      if (!Array.isArray(batch) || batch.length === 0) {
        break;
      }
      results.push(...batch);
      if (batch.length < options.pageSize) {
        break;
      }
      page += 1;
    } catch (error) {
      console.error(`Failed to fetch products page ${page}:`, error);
      break;
    }
  }

  return results;
}

async function syncProduct(
  product: any,
  slugRegistry: TemplateSlugRegistry,
): Promise<SyncResult> {
  const productId = typeof product?.id === "number" ? product.id : null;
  if (!productId) {
    return { productId: -1, error: "Product missing numeric id" };
  }

  const metaEntries: MetaEntry[] = Array.isArray(product.meta_data)
    ? (product.meta_data as MetaEntry[])
    : [];
  const metaMap = buildMetaMap(metaEntries);
  const tourData = convertWooCommerceToTourData(product as WooCommerceProduct);

  const desiredSlugSource =
    (typeof product.slug === "string" && product.slug.trim().length > 0
      ? product.slug
      : null) ??
    (isNonEmptyString(tourData.name) ? tourData.name : null) ??
    (typeof product.name === "string" ? product.name : null);

  const templateSlug = assignTemplateSlug(
    desiredSlugSource,
    productId,
    slugRegistry,
  );

  const heroBadges = [
    getMapString(metaMap, "_wcf_hero_badge_1"),
    getMapString(metaMap, "_wcf_hero_badge_2"),
    getMapString(metaMap, "_wcf_hero_badge_3"),
  ].filter(isNonEmptyString);

  const primaryCtaLabel = getMapString(metaMap, "_wcf_cta_label");
  const primaryCtaLink = getMapString(metaMap, "_wcf_cta_link");

  const pricingBase =
    tourData.pricing?.basePrice ?? toNumber(product.regular_price);
  const pricingTax =
    tourData.pricing?.taxRate ?? toNumber(metaMap.get("_wcf_pricing_tax"));
  const pricingCurrency =
    tourData.pricing?.currency ??
    getMapString(metaMap, "_wcf_pricing_currency") ??
    (typeof product.prices?.currency_code === "string"
      ? product.prices.currency_code
      : "USD");

  const categories = buildCategories(product as WooCommerceProduct);

  const shippingRaw = parseJsonArray(metaMap.get("_wcf_shipping_promises"));
  const paymentRaw = parseJsonArray(metaMap.get("_wcf_payment_plans"));

  const breadcrumbLabel = getMapString(metaMap, "_wcf_breadcrumb_label");

  const templatePayload = {
    product_id: productId,
    slug: templateSlug,
    name: tourData.name || product.name || `Product ${productId}`,
    description:
      tourData.description ||
      product.short_description ||
      product.description ||
      null,
    breadcrumb_label: breadcrumbLabel,
    hero_image: tourData.images?.hero || product.images?.[0]?.src || null,
    hero_gallery:
      tourData.images?.gallery ??
      (Array.isArray(product.images)
        ? product.images.map((img: any) => img?.src).filter(isNonEmptyString)
        : []),
    hero_badges: heroBadges,
    rating:
      tourData.details?.rating ??
      toNumber(metaMap.get("_wcf_rating")) ??
      toNumber(product.average_rating) ??
      null,
    review_count:
      tourData.details?.reviewCount ??
      toInteger(metaMap.get("_wcf_review_count")) ??
      toInteger(product.rating_count) ??
      null,
    duration: tourData.details?.duration ?? null,
    group_size: tourData.details?.groupSize ?? null,
    location: tourData.details?.location ?? null,
    gear_included: tourData.details?.gearIncluded ?? true,
    highlights: tourData.highlights ?? [],
    cta_label: primaryCtaLabel,
    cta_link: primaryCtaLink,
    experience_title: tourData.experience?.title ?? null,
    experience_description: tourData.experience?.description ?? null,
    experience_features: tourData.experience?.features ?? [],
    included_title: tourData.included?.title ?? null,
    included_items: tourData.included?.items ?? [],
    included_award: tourData.included?.award ?? null,
    journey_title: tourData.journey?.title ?? null,
    journey_description: tourData.journey?.description ?? null,
    journey_steps: tourData.journey?.steps ?? [],
    marine_title: tourData.marineLife?.title ?? null,
    marine_description: tourData.marineLife?.description ?? null,
    marine_categories: tourData.marineLife?.categories ?? [],
    trust_title: tourData.trustIndicators?.title ?? null,
    trust_subtitle: tourData.trustIndicators?.subtitle ?? null,
    trust_stats: tourData.trustIndicators?.stats ?? [],
    pricing_base: pricingBase ?? null,
    pricing_tax: pricingTax ?? null,
    pricing_currency: pricingCurrency ?? "USD",
    final_title: tourData.finalCTA?.title ?? null,
    final_description: tourData.finalCTA?.description ?? null,
    final_phone: tourData.finalCTA?.phone ?? null,
    final_benefits: tourData.finalCTA?.benefits ?? [],
    nextjs_override: toBoolean(metaMap.get("_wcf_nextjs_override")),
    nextjs_base_url: getMapString(metaMap, "_wcf_nextjs_base_url"),
    categories,
    product_permalink:
      typeof product.permalink === "string" ? product.permalink : null,
  };

  const { data: templateRow, error: templateError } = await supabase
    .from("product_templates")
    .upsert(templatePayload, { onConflict: "product_id" })
    .select("id")
    .single();

  if (templateError) {
    throw new Error(
      `Supabase product_templates upsert failed: ${templateError.message}`,
    );
  }

  const templateId: string = templateRow?.id;

  const productMeta: Record<string, unknown> = {};
  if (tourData.name) productMeta.heroHeadline = tourData.name;
  const heroSubheadline = getMapString(metaMap, "_wcf_hero_subheadline");
  if (heroSubheadline) productMeta.heroSubheadline = heroSubheadline;
  if (heroBadges.length) productMeta.heroBadges = heroBadges;

  const productPayload = {
    id: productId,
    slug: templateSlug,
    name: product.name ?? tourData.name ?? `Product ${productId}`,
    sku: typeof product.sku === "string" ? product.sku : null,
    status: typeof product.status === "string" ? product.status : null,
    type: typeof product.type === "string" ? product.type : null,
    permalink: typeof product.permalink === "string" ? product.permalink : null,
    short_description:
      typeof product.short_description === "string"
        ? product.short_description
        : null,
    description:
      typeof product.description === "string" ? product.description : null,
    price: toNumber(product.price),
    regular_price: toNumber(product.regular_price),
    sale_price: toNumber(product.sale_price),
    currency: pricingCurrency,
    stock_status:
      typeof product.stock_status === "string" ? product.stock_status : null,
    stock_quantity: toInteger(product.stock_quantity),
    backorders:
      typeof product.backorders === "string" ? product.backorders : null,
    manage_stock: toBoolean(product.manage_stock),
    low_stock_amount: toInteger(product.low_stock_amount),
    last_synced_at: new Date().toISOString(),
    meta: Object.keys(productMeta).length ? productMeta : null,
    raw_payload: product,
    template_id: templateId,
  };

  const { error: productError } = await supabase
    .from("products")
    .upsert(productPayload, { onConflict: "id" });

  if (productError) {
    throw new Error(`Supabase products upsert failed: ${productError.message}`);
  }

  // Categories
  await supabase
    .from("product_categories")
    .delete()
    .eq("product_id", productId);
  const categoryRows = categories
    .map((cat, index) => ({
      product_id: productId,
      category_id: cat.id ?? index,
      category_slug: cat.slug,
      category_name: cat.name,
      position: index,
    }))
    .filter(
      (row) =>
        isNonEmptyString(row.category_name || "") ||
        isNonEmptyString(row.category_slug || ""),
    );

  if (categoryRows.length) {
    const { error } = await supabase
      .from("product_categories")
      .insert(categoryRows);
    if (error) {
      throw new Error(`Failed inserting product categories: ${error.message}`);
    }
  }

  // Media
  await supabase.from("product_media").delete().eq("product_id", productId);
  const mediaRows = Array.isArray(product.images)
    ? product.images
        .map((img: any, index: number) => {
          if (
            !img ||
            typeof img.src !== "string" ||
            img.src.trim().length === 0
          )
            return null;
          return {
            product_id: productId,
            media_type: "image",
            src: img.src,
            alt: typeof img.alt === "string" ? img.alt : null,
            position: index,
            is_primary: index === 0,
            meta: null,
          };
        })
        .filter(
          (
            row,
          ): row is {
            product_id: number;
            media_type: string;
            src: string;
            alt: string | null;
            position: number;
            is_primary: boolean;
            meta: null;
          } => row !== null,
        )
    : [];

  const uniqueMediaRows = [] as typeof mediaRows;
  const seenMediaSources = new Set<string>();
  for (const row of mediaRows) {
    if (seenMediaSources.has(row.src)) continue;
    seenMediaSources.add(row.src);
    uniqueMediaRows.push(row);
  }

  const normalizedMediaRows = uniqueMediaRows.map((row, index) => ({
    ...row,
    position: index,
    is_primary: index === 0,
  }));

  if (normalizedMediaRows.length) {
    const { error } = await supabase
      .from("product_media")
      .insert(normalizedMediaRows);
    if (error) {
      throw new Error(`Failed inserting product media: ${error.message}`);
    }
  }

  // Options & values
  await supabase.from("product_options").delete().eq("product_id", productId);

  const attributes: any[] = Array.isArray(product.attributes)
    ? product.attributes
    : [];
  type OptionRow = {
    product_id: number;
    option_type: string;
    code: string;
    label: string;
    allow_multiple: boolean;
    position: number;
    meta: {
      attributeId: number | string | null;
      visible: boolean | null;
      variation: boolean | null;
    };
  };

  const optionRows = attributes
    .map<OptionRow | null>((attribute, index) => {
      if (!attribute || typeof attribute.name !== "string") return null;
      const label = attribute.name.trim();
      const code = slugifyToken(label) || `option-${index}`;
      return {
        product_id: productId,
        option_type: attribute.name.toLowerCase().includes("color")
          ? "color"
          : attribute.name.toLowerCase().includes("size")
            ? "size"
            : "option",
        code,
        label,
        allow_multiple: Boolean(attribute.variation),
        position:
          typeof attribute.position === "number" ? attribute.position : index,
        meta: {
          attributeId: attribute.id ?? null,
          visible:
            typeof attribute.visible === "boolean" ? attribute.visible : null,
          variation:
            typeof attribute.variation === "boolean"
              ? attribute.variation
              : null,
        },
      };
    })
    .filter((row): row is OptionRow => row !== null);

  if (optionRows.length) {
    const { data, error } = await supabase
      .from("product_options")
      .insert(optionRows)
      .select("id");
    if (error) {
      throw new Error(`Failed inserting product options: ${error.message}`);
    }
    const optionIds = (data ?? []).map((row) => row.id as string);

    const valueRows: Array<{
      option_id: string;
      value: string | null;
      label: string | null;
      hex_color: string | null;
      image: string | null;
      badge: string | null;
      ships_in: string | null;
      inventory_status: string | null;
      is_default: boolean;
      position: number;
      meta: Record<string, unknown> | null;
    }> = [];

    attributes.forEach((attribute, attributeIndex) => {
      if (!attribute || typeof attribute.name !== "string") return;
      const code =
        slugifyToken(attribute.name.trim()) || `option-${attributeIndex}`;
      const optionId = optionIds[attributeIndex];
      if (!optionId) return;
      const optionsArray: unknown[] = Array.isArray(attribute.options)
        ? attribute.options
        : [];

      optionsArray.forEach((value, valueIndex) => {
        const label = typeof value === "string" ? value.trim() : null;
        const metaForValue = collectOptionValueMeta(metaMap, code, label);
        valueRows.push({
          option_id: optionId,
          value: label,
          label,
          hex_color: metaForValue.hexColor,
          image: metaForValue.image,
          badge: metaForValue.badge,
          ships_in: metaForValue.shipsIn,
          inventory_status: metaForValue.inventoryStatus,
          is_default: valueIndex === 0,
          position: valueIndex,
          meta: null,
        });
      });
    });

    if (valueRows.length) {
      const { error } = await supabase
        .from("product_option_values")
        .insert(valueRows);
      if (error) {
        throw new Error(
          `Failed inserting product option values: ${error.message}`,
        );
      }
    }
  }

  // Shipping promises
  const shippingPromises = mapShippingPromises(shippingRaw);
  await supabase
    .from("product_shipping_promises")
    .delete()
    .eq("product_id", productId);
  if (shippingPromises.length) {
    const rows = shippingPromises.map((row, index) => ({
      ...row,
      product_id: productId,
      position: index,
    }));
    const { error } = await supabase
      .from("product_shipping_promises")
      .insert(rows);
    if (error) {
      throw new Error(`Failed inserting shipping promises: ${error.message}`);
    }
  }

  // Payment plans
  const paymentPlans = mapPaymentPlans(paymentRaw);
  await supabase
    .from("product_payment_plans")
    .delete()
    .eq("product_id", productId);
  if (paymentPlans.length) {
    const rows = paymentPlans.map((row, index) => ({
      ...row,
      product_id: productId,
      position: index,
    }));
    const { error } = await supabase.from("product_payment_plans").insert(rows);
    if (error) {
      throw new Error(`Failed inserting payment plans: ${error.message}`);
    }
  }

  return {
    productId,
    templateId,
    name: product.name,
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const products = await fetchProducts(options);

  if (!products.length) {
    console.log("No WooCommerce products available to sync.");
    return;
  }

  console.log(`Syncing ${products.length} WooCommerce products to Supabase...`);

  const { data: existingTemplates, error: existingTemplatesError } = await supabase
    .from("product_templates")
    .select("product_id, slug");
  if (existingTemplatesError) {
    throw new Error(
      `Failed to load existing product template slugs: ${existingTemplatesError.message}`,
    );
  }
  const slugRegistry = buildTemplateSlugRegistry(existingTemplates ?? []);

  const results: SyncResult[] = [];

  for (const product of products) {
    try {
      const result = await syncProduct(product, slugRegistry);
      console.log(
        `✔ Synced product ${result.productId}${result.name ? ` (${result.name})` : ""}`,
      );
      results.push(result);
    } catch (error) {
      const productId = typeof product?.id === "number" ? product.id : -1;
      const message = error instanceof Error ? error.message : String(error);
      console.error(`✖ Failed to sync product ${productId}: ${message}`);
      results.push({ productId, error: message });
    }
  }

  const successCount = results.filter((result) => !result.error).length;
  const failureCount = results.length - successCount;

  console.log(
    `Finished syncing products. Success: ${successCount}, Failed: ${failureCount}.`,
  );

  if (failureCount > 0) {
    const failed = results.filter((result) => result.error);
    console.log("Failures:");
    failed.forEach((result) => {
      console.log(` - ${result.productId}: ${result.error}`);
    });
  }
}

main().catch((error) => {
  console.error("Unexpected product sync failure:", error);
  process.exit(1);
});
