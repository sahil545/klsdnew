/**
 * Template Mapper - Maps WooCommerce product categories to specific templates
 * This system determines which template to use based on product categories
 */

export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
  parent?: number;
}

export interface TemplateMapping {
  templatePath: string;
  templateName: string;
  description: string;
  categories: string[];
  parentCategories: string[];
}

// Template mappings configuration
export const TEMPLATE_MAPPINGS: TemplateMapping[] = [
  // Put Certification FIRST so it wins when products are in both tours and certification categories
  {
    templatePath: "/certification-template",
    templateName: "Certification Template",
    description:
      "Applied only when category is exactly 'certification-courses'",
    categories: ["certification-courses"],
    parentCategories: ["certification-courses"],
  },
  {
    templatePath: "/christ-statue-tour",
    templateName: "Christ Statue Tour (Snorkeling Template)",
    description: "For snorkeling tours, diving trips, and water activities",
    categories: [
      "snorkeling",
      "snorkel",
      "tours",
      "trips",
      "diving",
      "dive",
      "water-activities",
      "marine-tours",
    ],
    parentCategories: ["all-tours-trips", "tours-trips", "all-tours-and-trips"],
  },
  {
    templatePath: "/dev/ecommerce-scuba-gear-product-mockup",
    templateName: "Ecommerce Scuba Gear Product Mockup",
    description:
      "High impact ecommerce layout for premium scuba gear and accessories",
    categories: [
      "scuba-mask-accessories",
      "scuba-weights",
      "bcd",
      "bcd-accessories",
      "computer-accessories",
      "console-computers",
      "dive-apparel",
      "dive-bags",
      "dive-boots",
      "dive-fins",
      "dive-gauges",
      "dive-gloves",
      "dive-knife",
      "dive-lights",
      "knives",
      "octos",
      "rash-guards",
      "regulator-accessories",
      "regulators",
      "scuba-masks",
      "snorkels",
      "wetsuits",
      "wrist-computers",
      "underwater-communication",
      "hardwired-communication",
      "wireless-communication",
      "full-face-masks",
      "mounting-attachments",
      "accessories",
      "snorkeling-gear",
      "snorkeling-communications",
      "snorkeling-fins",
      "snorkeling-masks",
      "scuba-gear",
      "diving-gear",
      "diving-equipment",
      "underwater-gear",
    ],
    parentCategories: [
      "scuba-gear",
      "diving-gear",
      "equipment",
      "snorkeling-gear",
      "dive-gear",
    ],
  },
];

/**
 * Get template mapping for a product based on its categories
 * @param categories Array of product categories
 * @returns Template mapping or null if no match found
 */
export function getTemplateForProduct(
  categories: ProductCategory[],
): TemplateMapping | null {
  if (!categories || categories.length === 0) {
    return null;
  }

  // Convert category names to lowercase for comparison
  const categoryNames = categories.map((cat) => cat.name.toLowerCase());
  const categorySlugs = categories.map((cat) => cat.slug.toLowerCase());

  // Find parent categories (categories with no parent or parent = 0)
  const parentCategories = categories
    .filter((cat) => !cat.parent || cat.parent === 0)
    .map((cat) => (cat.name || cat.slug).toLowerCase());

  // Check each template mapping
  for (const mapping of TEMPLATE_MAPPINGS) {
    // Check if any category matches the template's category patterns
    const categoryMatch = mapping.categories.some(
      (pattern) =>
        categoryNames.some((name) => name === pattern) ||
        categorySlugs.some((slug) => slug === pattern),
    );

    // Check if any parent category matches the template's parent category patterns
    const parentCategoryMatch = mapping.parentCategories.some((pattern) =>
      parentCategories.some((name) => name === pattern),
    );

    if (categoryMatch || parentCategoryMatch) {
      return mapping;
    }
  }

  return null;
}

/**
 * Check if a product belongs to Tours & Trips category (enhanced version)
 * @param categories Array of product categories
 * @returns boolean
 */
export function isTourProduct(categories: ProductCategory[]): boolean {
  const mapping = getTemplateForProduct(categories);
  return mapping?.templatePath === "/christ-statue-tour";
}

/**
 * Check if a product belongs to Scuba Gear category
 * @param categories Array of product categories
 * @returns boolean
 */
export function isScubaGearProduct(categories: ProductCategory[]): boolean {
  const mapping = getTemplateForProduct(categories);
  return mapping?.templatePath === "/dev/ecommerce-scuba-gear-product-mockup";
}

/**
 * Check if a product belongs to Certification category
 * @param categories Array of product categories
 * @returns boolean
 */
export function isCertificationProduct(categories: ProductCategory[]): boolean {
  const mapping = getTemplateForProduct(categories);
  return mapping?.templatePath === "/certification-template";
}

/**
 * Get all available templates
 * @returns Array of all template mappings
 */
export function getAllTemplates(): TemplateMapping[] {
  return TEMPLATE_MAPPINGS;
}

/**
 * Get template by path
 * @param templatePath Template path to search for
 * @returns Template mapping or null
 */
export function getTemplateByPath(
  templatePath: string,
): TemplateMapping | null {
  return (
    TEMPLATE_MAPPINGS.find(
      (mapping) => mapping.templatePath === templatePath,
    ) || null
  );
}
