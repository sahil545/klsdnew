export type GearItem = {
  id: number;
  name: string;
  category: string;
  categoryId: number;
  price: string;
  originalPrice: string | null;
  rating: number;
  reviews: number;
  image: string;
  badges: string[];
  inStock: boolean;
  description: string;
  featured: boolean;
  featured_product: boolean;
  slug?: string;
  permalink?: string;
};

export const FEATURED_GEAR_CATEGORIES: { id: number; name: string }[] = [
  { id: 186, name: "Scuba Gear" },
  { id: 204, name: "BCDs" },
  { id: 203, name: "Regulators" },
  { id: 195, name: "Scuba Masks" },
  { id: 205, name: "Dive Fins" },
  { id: 211, name: "Rash Guards" },
];

export function getCategoryByName(name: string) {
  return FEATURED_GEAR_CATEGORIES.find((c) => c.name === name) || null;
}

export function slugify(input: string) {
  return (input || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function convertWooToGearItem(product: any): GearItem {
  const productName = product?.name || product?.title || "Unknown Product";
  const productType = (product?.type || "").toLowerCase();
  const productPrice = product?.price ?? product?.regular_price ?? "";
  const productSalePrice = product?.sale_price ?? "";
  const productPriceHtml = product?.price_html || "";
  const productImages = product?.images || [];
  const productCategories = product?.categories || [];
  const stockStatusRaw = product?.stock_status; // 'instock' | 'outofstock' | undefined
  const inStockBool = typeof product?.in_stock === "boolean" ? product.in_stock : stockStatusRaw === "instock";
  const finalStockStatus = stockStatusRaw ?? (inStockBool ? "instock" : "outofstock");

  // Robust price parsing with price_html fallback (use lowest number if range)
  function parseFromHtml(html: string): number | null {
    if (!html) return null;
    const text = String(html)
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/,/g, "");
    const nums = (text.match(/[0-9]+(?:\.[0-9]{1,2})?/g) || [])
      .map((n) => Number.parseFloat(n))
      .filter((n) => Number.isFinite(n) && n > 0);
    if (nums.length === 0) return null;
    return Math.min(...nums);
  }

  let parsed: number | null = null;
  let parsedOrig: number | null = null;

  if (productType === "simple" || productType === "external") {
    // Use effective price directly from Woo (already accounts for sales)
    const effStr = String((product?.price ?? "")).trim();
    const regCandidate = (product?.regular_price ?? productPrice);
    const regStr = String(regCandidate || "").trim();
    const saleStr = String((product?.sale_price ?? "")).trim();
    const onSale = Boolean(product?.on_sale);

    const effNum = Number.parseFloat(effStr);
    const regNum = Number.parseFloat(regStr);
    const saleNum = Number.parseFloat(saleStr);

    if (Number.isFinite(effNum)) parsed = effNum;
    else if (onSale && Number.isFinite(saleNum)) parsed = saleNum;
    else if (Number.isFinite(regNum)) parsed = regNum;

    // Show original only when on sale and regular is higher
    if (onSale && Number.isFinite(regNum) && Number.isFinite(parsed as number) && regNum > (parsed as number)) {
      parsedOrig = regNum;
    }
  } else if (productType === "variable") {
    // Derive from price_html (range "From: $X")
    parsed = parseFromHtml(productPriceHtml);
    parsedOrig = parseFromHtml(productPriceHtml);
  } else {
    // Fallback for other types
    const effCandidate = (product?.price ?? productSalePrice ?? productPrice);
    const eff = String(effCandidate || "").trim();
    parsed = Number.parseFloat(eff);
    if (!Number.isFinite(parsed)) parsed = parseFromHtml(productPriceHtml);
    const reg2Candidate = (product?.regular_price ?? productPrice);
    parsedOrig = Number.parseFloat(String((reg2Candidate || "")).trim());
  }

  const isValid = Number.isFinite(parsed as number) && (parsed as number) >= 0;
  const priceStr = isValid ? `$${(parsed as number).toFixed(2)}` : "See price";

  const hasOrig = Number.isFinite(parsedOrig as number) && (parsedOrig as number) > 0 && isValid && (parsedOrig as number) !== (parsed as number);
  const original = hasOrig ? `$${(parsedOrig as number).toFixed(2)}` : null;

  const badges = Array.isArray(product?.attributes)
    ? (product.attributes.find((attr: any) => /brand/i.test(attr?.name))?.options || [])
    : [];

  // Image fallback chain
  const firstImage = productImages?.[0];
  const imageUrl = (firstImage && (firstImage.src || firstImage.url)) || product?.image || "/placeholder.svg";

  return {
    id: Number(product?.id) || 0,
    name: productName,
    category: productCategories?.[0]?.name || "Accessories",
    categoryId: Number(productCategories?.[0]?.id) || 186,
    price: priceStr,
    originalPrice: original,
    rating: parseFloat(product?.average_rating) || 4.5,
    reviews: Number(product?.rating_count) || 0,
    image: imageUrl,
    badges: badges.length ? badges : ["ScubaPro"],
    inStock: finalStockStatus === "instock",
    description: product?.short_description || product?.description || productName,
    featured: !!(product?.featured || product?.featured_product),
    featured_product: !!(product?.featured || product?.featured_product),
    slug: product?.slug,
    permalink: product?.permalink,
  };
}
