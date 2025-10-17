import type { TourData } from "../app/snorkeling-tours-template/data";

type WooProduct = {
  name?: string;
  description?: string;
  short_description?: string;
  images?: Array<{ src?: string | null }> | null;
  categories?: Array<{ name?: string | null } | null> | null;
  meta_data?: Array<{ key?: string | null; value?: any } | null> | null;
  average_rating?: number | string | null;
  rating_count?: number | string | null;
  price?: string | number | null;
  regular_price?: string | number | null;
};

type WooMeta = NonNullable<WooProduct["meta_data"]>;

function getMeta(meta: WooMeta | undefined | null, key: string) {
  if (!Array.isArray(meta)) return undefined;
  const match = meta.find((entry) => entry?.key === key);
  return match?.value;
}

function ensureStringArray(value: unknown, fallback: string[] = []) {
  if (Array.isArray(value)) {
    return value.filter(
      (item): item is string =>
        typeof item === "string" && item.trim().length > 0,
    );
  }
  return fallback;
}

function ensureFeatureArray(value: unknown) {
  if (!Array.isArray(value)) return [] as TourData["experience"]["features"];
  return value
    .map((raw) => {
      if (!raw || typeof raw !== "object") return null;
      const icon =
        typeof (raw as any).icon === "string" ? (raw as any).icon : "Fish";
      const title =
        typeof (raw as any).title === "string" ? (raw as any).title : "";
      const description =
        typeof (raw as any).description === "string"
          ? (raw as any).description
          : "";
      if (!title && !description) return null;
      return { icon, title, description };
    })
    .filter(
      (feature): feature is TourData["experience"]["features"][number] =>
        feature !== null,
    );
}

function ensureJourneySteps(value: unknown) {
  if (!Array.isArray(value)) return [] as TourData["journey"]["steps"];
  return value
    .map((raw, index) => {
      if (!raw || typeof raw !== "object") return null;
      const title =
        typeof (raw as any).title === "string" ? (raw as any).title : "";
      const description =
        typeof (raw as any).description === "string"
          ? (raw as any).description
          : "";
      const time =
        typeof (raw as any).time === "string" ? (raw as any).time : "";
      const color =
        typeof (raw as any).color === "string" ? (raw as any).color : "blue";
      if (!title && !description && !time) return null;
      return {
        step: index + 1,
        title,
        description,
        time,
        color: color as TourData["journey"]["steps"][number]["color"],
      };
    })
    .filter(
      (step): step is TourData["journey"]["steps"][number] => step !== null,
    );
}

function ensureMarineCategories(value: unknown) {
  if (!Array.isArray(value)) return [] as TourData["marineLife"]["categories"];
  return value
    .map((raw) => {
      if (!raw || typeof raw !== "object") return null;
      const title =
        typeof (raw as any).title === "string" ? (raw as any).title : "";
      const description =
        typeof (raw as any).description === "string"
          ? (raw as any).description
          : "";
      const color =
        typeof (raw as any).color === "string" ? (raw as any).color : "blue";
      const features = ensureStringArray((raw as any).features);
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
      (cat): cat is TourData["marineLife"]["categories"][number] =>
        cat !== null,
    );
}

function ensureTrustStats(value: unknown) {
  if (!Array.isArray(value)) return [] as TourData["trustIndicators"]["stats"];
  return value
    .map((raw) => {
      if (!raw || typeof raw !== "object") return null;
      const statValue =
        typeof (raw as any).value === "string" ? (raw as any).value : "";
      const label =
        typeof (raw as any).label === "string" ? (raw as any).label : "";
      if (!statValue && !label) return null;
      return { value: statValue, label };
    })
    .filter(
      (stat): stat is TourData["trustIndicators"]["stats"][number] =>
        stat !== null,
    );
}

export function convertWooCommerceToTourData(wooProduct: WooProduct): TourData {
  const meta = wooProduct.meta_data ?? [];
  const heroHeadline = getMeta(meta, "_wcf_hero_headline");
  const heroSubheadline = getMeta(meta, "_wcf_hero_subheadline");
  const breadcrumbLabel = getMeta(meta, "_wcf_breadcrumb_label");
  const durationRaw =
    getMeta(meta, "_wcf_duration") ??
    getMeta(meta, "_klsd_test_duration") ??
    getMeta(meta, "_wc_booking_duration") ??
    getMeta(meta, "_booking_duration");
  const duration = durationRaw ? String(durationRaw) : "4 Hours";

  const groupRaw =
    getMeta(meta, "_wcf_group_size") ??
    getMeta(meta, "_wc_booking_max_persons_group") ??
    getMeta(meta, "_booking_capacity");
  const groupSize = groupRaw ? String(groupRaw) : "25 Max";

  const location = (getMeta(meta, "_wcf_location") as string) || "Key Largo";
  const gearIncludedRaw = getMeta(meta, "_wcf_gear_included");
  const gearIncluded =
    gearIncludedRaw === undefined || gearIncludedRaw === null
      ? true
      : String(gearIncludedRaw) === "1" || gearIncludedRaw === true;

  const ratingValue =
    getMeta(meta, "_wcf_rating") ?? wooProduct.average_rating ?? 4.9;
  const rating = Number.parseFloat(String(ratingValue)) || 4.9;

  const reviewCountValue =
    getMeta(meta, "_wcf_review_count") ?? wooProduct.rating_count ?? 487;
  const reviewCount = Number.parseInt(String(reviewCountValue), 10) || 487;

  const basePriceRaw =
    getMeta(meta, "_wcf_pricing_base") ??
    wooProduct.regular_price ??
    wooProduct.price ??
    70;
  const basePrice = Number.parseFloat(String(basePriceRaw)) || 70;
  const taxRate =
    Number.parseFloat(String(getMeta(meta, "_wcf_pricing_tax") ?? 0.07)) ||
    0.07;
  const currency = (getMeta(meta, "_wcf_pricing_currency") as string) || "USD";

  const heroImage =
    (getMeta(meta, "_wcf_hero_bg_image") as string) ||
    wooProduct.images?.[0]?.src ||
    "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=600&fit=crop";
  const galleryImages = Array.isArray(wooProduct.images)
    ? wooProduct.images
        .map((img) => img?.src)
        .filter(
          (src): src is string => typeof src === "string" && src.length > 0,
        )
    : [heroImage];

  const expTitle =
    (getMeta(meta, "_wcf_exp_title") as string) ||
    "What Makes This Experience Special";
  const expDesc =
    (getMeta(meta, "_wcf_exp_desc") as string) ||
    wooProduct.short_description ||
    "";
  const expFeaturesRaw = getMeta(meta, "_wcf_exp_features");
  const expFeatures = ensureFeatureArray(expFeaturesRaw);

  const incTitle =
    (getMeta(meta, "_wcf_inc_title") as string) || "What's Included";
  const incItems = ensureStringArray(getMeta(meta, "_wcf_inc_items"), [
    "Professional snorkeling equipment",
    "PADI certified dive guide",
    "John Pennekamp park entrance",
    "Marine life identification guide",
    "Safety equipment & briefing",
    "Free parking",
  ]);
  const incAward =
    (getMeta(meta, "_wcf_inc_award") as string) ||
    "Florida Keys Excellence Award Winner";

  const journeyTitle =
    (getMeta(meta, "_wcf_journey_title") as string) ||
    `Your ${duration} Journey`;
  const journeyDesc =
    (getMeta(meta, "_wcf_journey_desc") as string) ||
    "From arrival to unforgettable memories";
  const journeySteps = ensureJourneySteps(getMeta(meta, "_wcf_journey_steps"));

  const marineTitle =
    (getMeta(meta, "_wcf_marine_title") as string) ||
    "Discover Incredible Marine Life";
  const marineDesc =
    (getMeta(meta, "_wcf_marine_desc") as string) ||
    "John Pennekamp Coral Reef State Park hosts over 65 species of tropical fish and 40 species of coral in this protected underwater sanctuary.";
  const marineCategories = ensureMarineCategories(
    getMeta(meta, "_wcf_marine_categories"),
  );

  const trustTitle =
    (getMeta(meta, "_wcf_trust_title") as string) ||
    "Why Key Largo Scuba Diving";
  const trustSubtitle =
    (getMeta(meta, "_wcf_trust_subtitle") as string) ||
    "The Florida Keys' most trusted diving experience";
  const trustStats = ensureTrustStats(getMeta(meta, "_wcf_trust_stats"));

  const finalTitle =
    (getMeta(meta, "_wcf_final_title") as string) ||
    "Ready for Your Underwater Adventure?";
  const finalDesc =
    (getMeta(meta, "_wcf_final_desc") as string) ||
    "Book your Christ of the Abyss experience today and create memories that will last a lifetime.";
  const finalPhone =
    (getMeta(meta, "_wcf_final_phone") as string) || "(305) 391-4040";
  const finalBenefits = ensureStringArray(
    getMeta(meta, "_wcf_final_benefits"),
    ["Instant confirmation", "Free cancellation", "Best price guarantee"],
  );

  const highlights = ensureStringArray(getMeta(meta, "_wcf_highlights"), [
    "Famous 9-foot bronze Christ statue in crystal-clear water",
    "All snorkeling equipment included",
    "PADI certified guides",
    "Small group experience",
  ]);

  const resolvedName =
    typeof heroHeadline === "string" && heroHeadline.trim().length > 0
      ? heroHeadline
      : wooProduct.name || "Live WooCommerce Product";

  const resolvedDescription =
    typeof heroSubheadline === "string" && heroSubheadline.trim().length > 0
      ? heroSubheadline
      : wooProduct.short_description || wooProduct.description || "";

  const resolvedCategories = Array.isArray(wooProduct.categories)
    ? wooProduct.categories
        .map((cat) => (typeof cat?.name === "string" ? cat.name : null))
        .filter(
          (name): name is string => typeof name === "string" && name.length > 0,
        )
    : [];

  if (
    typeof breadcrumbLabel === "string" &&
    breadcrumbLabel.trim().length > 0
  ) {
    const label = breadcrumbLabel.trim();
    if (!resolvedCategories.includes(label)) {
      resolvedCategories.unshift(label);
    }
  }

  if (resolvedCategories.length === 0) {
    resolvedCategories.push("Tours");
  }

  return {
    name: resolvedName,
    description: resolvedDescription,
    images: { hero: heroImage, gallery: galleryImages },
    categories: resolvedCategories,
    details: {
      duration,
      groupSize,
      location,
      gearIncluded,
      rating,
      reviewCount,
    },
    highlights,
    pricing: { basePrice, taxRate, currency },
    experience: {
      title: expTitle,
      description: expDesc,
      features:
        expFeatures.length > 0
          ? expFeatures
          : [
              {
                icon: "Fish",
                title: "Iconic Underwater Statue",
                description:
                  "Visit the famous 9-foot bronze Christ of the Abyss statue, standing majestically in 25 feet of crystal-clear water as a beacon of peace and wonder.",
              },
              {
                icon: "Waves",
                title: "Pristine Marine Sanctuary",
                description:
                  "Snorkel through vibrant coral gardens teeming with tropical fish in America's first underwater park, protected since 1963.",
              },
              {
                icon: "Shield",
                title: "Expert Guidance",
                description:
                  "Our PADI certified dive masters provide comprehensive safety briefings and marine life education throughout your journey.",
              },
            ],
    },
    included: { title: incTitle, items: incItems, award: incAward },
    journey: {
      title: journeyTitle,
      description: journeyDesc,
      steps:
        journeySteps.length > 0
          ? journeySteps
          : [
              {
                step: 1,
                title: "Welcome & Preparation",
                description:
                  "Meet our team at John Pennekamp State Park for equipment fitting and comprehensive safety briefing.",
                time: "8:00 AM - 30 minutes",
                color: "blue",
              },
              {
                step: 2,
                title: "Scenic Boat Journey",
                description:
                  "Cruise through crystal-clear waters to the statue location while learning about the area's history.",
                time: "8:30 AM - 30 minutes",
                color: "teal",
              },
              {
                step: 3,
                title: "Underwater Adventure",
                description:
                  "Snorkel around the iconic Christ statue and explore the vibrant coral reef ecosystem.",
                time: "9:00 AM - 2.5 hours",
                color: "orange",
              },
              {
                step: 4,
                title: "Return & Reflection",
                description:
                  "Relax on the return journey while sharing your experience and planning future adventures.",
                time: "11:30 AM - 30 minutes",
                color: "green",
              },
            ],
    },
    marineLife: {
      title: marineTitle,
      description: marineDesc,
      categories:
        marineCategories.length > 0
          ? marineCategories
          : [
              {
                title: "Tropical Fish Paradise",
                description:
                  "Swim alongside vibrant parrotfish, graceful angelfish, curious sergeant majors, and over 60 other colorful species that call these reefs home.",
                color: "blue",
                features: [
                  "Queen Angelfish",
                  "Stoplight Parrotfish",
                  "Yellowtail Snapper",
                ],
              },
              {
                title: "Living Coral Gardens",
                description:
                  "Explore thriving coral formations including massive brain corals, delicate sea fans, and the iconic elkhorn coral structures.",
                color: "teal",
                features: [
                  "Brain Coral Colonies",
                  "Sea Fan Gardens",
                  "Staghorn Formations",
                ],
              },
              {
                title: "Underwater Photography",
                description:
                  "Capture stunning images of the Christ statue surrounded by marine life with crystal-clear 60-80 foot visibility perfect for photography.",
                color: "orange",
                features: [
                  "Professional Photo Tips",
                  "Camera Rental Available",
                  "Perfect Lighting Conditions",
                ],
              },
            ],
    },
    trustIndicators: {
      title: trustTitle,
      subtitle: trustSubtitle,
      stats:
        trustStats.length > 0
          ? trustStats
          : [
              { value: "25+", label: "Years Experience" },
              { value: "50,000+", label: "Happy Guests" },
              { value: "4.9/5", label: "Average Rating" },
              { value: "100%", label: "Safety Record" },
            ],
    },
    finalCTA: {
      title: finalTitle,
      description: finalDesc,
      phone: finalPhone,
      benefits: finalBenefits,
    },
  };
}
