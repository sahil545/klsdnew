import "server-only";

import { cache } from "react";

import { HOME_IMAGES } from "../../../../lib/generated/home-images";
import { fetchWordPressPageContent } from "./wp-content";
import type {
  DiveLandingContent,
  FAQItem,
  GalleryImage,
  WordPressSection,
} from "./types";

const PHONE = "(305) 391-4040";
const EMAIL = "info@keylargoscuba.com";
const DISCOVERY_PATH = "/trips-tours/";

const MEDIA_FALLBACKS: Record<
  string,
  {
    hero: string;
    gallery: string[];
  }
> = {
  "key-largo-dive-trips": {
    hero: HOME_IMAGES.heroPrimary,
    gallery: [
      HOME_IMAGES.unsplashDiversWide,
      HOME_IMAGES.wpTryScuba,
      HOME_IMAGES.wpDiveInOneDay,
      HOME_IMAGES.wpHydrosPro,
    ],
  },
  "key-largo-reef-dive-trips": {
    hero: HOME_IMAGES.unsplashReefWide,
    gallery: [
      HOME_IMAGES.unsplashReefWide,
      HOME_IMAGES.unsplashCoralPortrait,
      HOME_IMAGES.wpTryScuba,
      HOME_IMAGES.wpDiveInOneDay,
    ],
  },
  "key-largo-wreck-dive-trips": {
    hero: HOME_IMAGES.heroProduct,
    gallery: [
      HOME_IMAGES.unsplashDiversWide,
      HOME_IMAGES.wpHydrosPro,
      HOME_IMAGES.wpTryScuba,
      HOME_IMAGES.unsplashReefWide,
    ],
  },
  "key-largo-sunset-cruise-snorkeling-florida-keys": {
    hero: HOME_IMAGES.unsplashCoralPortrait,
    gallery: [
      HOME_IMAGES.heroPrimary,
      HOME_IMAGES.unsplashDiversWide,
      HOME_IMAGES.wpDiveInOneDay,
      HOME_IMAGES.wpHowToScuba,
    ],
  },
};

function getMediaFallback(slug: string) {
  return (
    MEDIA_FALLBACKS[slug] ?? {
      hero: HOME_IMAGES.heroPrimary,
      gallery: [
        HOME_IMAGES.heroPrimary,
        HOME_IMAGES.unsplashDiversWide,
        HOME_IMAGES.wpTryScuba,
        HOME_IMAGES.wpDiveInOneDay,
      ],
    }
  );
}

function truncate(value: string, length = 160) {
  if (value.length <= length) return value;
  const truncated = value.slice(0, length);
  const lastSpace = truncated.lastIndexOf(" ");
  return `${truncated.slice(0, Math.max(lastSpace, 0))}…`;
}

function buildHighlights(source: string[], fallback: string[]): string[] {
  const cleaned = source
    .map((item) => item.replace(/\s+/g, " ").trim())
    .filter((item) => item.length > 18 && !/placeholder/i.test(item));
  const highlights = Array.from(new Set([...cleaned, ...fallback]));
  return highlights.slice(0, 6);
}

function selectSections(
  sections: WordPressSection[],
  desired: string[],
  fallbackCount = 4,
): WordPressSection[] {
  const normalized = sections.map((section) => ({
    ...section,
    titleNormalized: section.title.toLowerCase(),
  }));
  const picked: WordPressSection[] = [];

  for (const title of desired) {
    const match = normalized.find((section) =>
      section.titleNormalized.includes(title.toLowerCase()),
    );
    if (match) {
      picked.push({ title: match.title, html: match.html });
    }
  }

  if (picked.length >= fallbackCount) {
    return picked.slice(0, fallbackCount);
  }

  const extras = sections.filter(
    (section) =>
      !picked.some((pickedSection) => pickedSection.title === section.title),
  );

  return picked
    .concat(extras.slice(0, Math.max(fallbackCount - picked.length, 0)))
    .slice(0, fallbackCount);
}

function createFaq(sections: WordPressSection[], limit = 6): FAQItem[] {
  const faqs = sections
    .filter((section) => /\?/.test(section.title))
    .map((section) => ({
      question: section.title,
      answerHtml: section.html || "<p>We update this answer soon.</p>",
    }))
    .slice(0, limit);

  if (faqs.length) return faqs;

  return sections.slice(0, limit).map((section) => ({
    question: section.title,
    answerHtml: section.html,
  }));
}

function createGallery(
  images: string[],
  label: string,
  hero?: string | null,
): GalleryImage[] {
  const filtered = images.filter(
    (src) => src && !/woocommerce-placeholder/.test(src),
  );
  const unique = Array.from(new Set(filtered));
  const withHero = hero ? [hero, ...unique] : unique;

  return withHero.slice(0, 9).map((src, index) => ({
    src,
    alt: `${label} photo ${index + 1}`,
  }));
}

function baseContact(description: string): DiveLandingContent["contact"] {
  return {
    title: "Talk with a Key Largo dive travel specialist",
    description,
    phone: PHONE,
    email: EMAIL,
    benefits: [
      "Live local experts",
      "Free date changes",
      "Best price guarantee",
    ],
  };
}

export async function buildKeyLargoDiveTripsPage(): Promise<DiveLandingContent> {
  const slug = "key-largo-dive-trips";
  const page = await fetchWordPressPageContent(slug);
  const mediaFallback = getMediaFallback(slug);
  const heroBackground = page.featuredImage ?? mediaFallback.hero;
  const gallerySources = page.galleries.length
    ? page.galleries
    : mediaFallback.gallery;

  const highlights = buildHighlights(page.bulletPoints, [
    "Small-group concierge boats with premium service",
    "Tanks and weights included on every charter",
    "Customize your day with reefs, wrecks, and night dives",
    "Upgrade with Nitrox, full-face masks, and pro video gear",
  ]);

  const sections = selectSections(page.sections, [
    "most popular dive trips",
    "dive trip information",
    "dive sites",
    "reef dives",
  ]);

  const faq = createFaq(page.sections, 6);
  const gallery = createGallery(
    gallerySources,
    "Key Largo dive trip",
    heroBackground,
  );

  return {
    slug,
    seo: {
      title: "Key Largo Dive Trips | Concierge Reefs & Wrecks Daily",
      description: truncate(
        page.introText ||
          "Plan world-class Key Largo scuba adventures with concierge crews, premium rental gear, and daily departures to reefs and wrecks.",
      ),
      canonical: "https://keylargoscubadiving.com/key-largo-dive-trips/",
      image: heroBackground,
    },
    hero: {
      eyebrow: "Key Largo • Florida Keys",
      title: "Key Largo Dive Trips",
      subtitle:
        page.introText ||
        "Concierge two-tank charters to the reefs and wrecks you want, including tanks, weights, and expert local crews.",
      backgroundImage: heroBackground,
      highlights,
      stats: [
        { label: "Happy Divers", value: "50,000+" },
        { label: "Dive Sites", value: "100+" },
        { label: "Boats", value: "25" },
        { label: "Safety Rating", value: "4.9★" },
      ],
      ctas: [
        { label: "Browse trips", href: DISCOVERY_PATH },
        {
          label: "Call to plan",
          href: `tel:${PHONE.replace(/[^\d+]/g, "")}`,
          variant: "secondary",
        },
      ],
    },
    quickInfo: [
      { label: "Trip Length", value: "4 hour charter" },
      { label: "Daily Departures", value: "7:30 AM & 12:30 PM" },
      { label: "Experience", value: "Open Water Certified+" },
      { label: "Included", value: "Tanks & weights" },
    ],
    valueProps: [
      {
        title: "Concierge crews",
        description:
          "Certified guides manage gear set-up, site briefings, and in-water support so you can focus on your dives.",
        icon: "Waves",
      },
      {
        title: "Flexible itineraries",
        description:
          "Pick from Molasses Reef, Christ of the Abyss, Spiegel Grove, and more based on conditions and your goals.",
        icon: "Waves",
      },
      {
        title: "Premium upgrades",
        description:
          "Reserve Nitrox, Hydros Pro BCDs, full-face masks, and photo packages before you arrive.",
        icon: "Waves",
      },
    ],
    itinerary: {
      title: "Your concierge two-tank dive day",
      description:
        "A seamless flow from dockside welcome through custom reef and wreck pairings picked for the day’s conditions.",
      steps: [
        {
          title: "Arrive & personalize",
          description:
            "Meet your crew, confirm skill levels, and pick focus sites while we assemble and check your gear.",
          duration: "30 minutes",
        },
        {
          title: "Cruise to first site",
          description:
            "Short ride offshore with captain updates on visibility, currents, and marine life highlights to watch for.",
          duration: "20 minutes",
        },
        {
          title: "Guided first dive",
          description:
            "Follow your guide on vibrant reefs or iconic wreck swim-throughs with safety support every moment.",
          duration: "45 minutes",
        },
        {
          title: "Surface interval & second tank",
          description:
            "Hydrate, swap cylinders, and continue to a complementary second site before returning to the dock.",
          duration: "60 minutes",
        },
      ],
    },
    featuredList: highlights,
    gallery,
    wordpressSections: sections,
    faq,
    contact: baseContact(
      "Call, text, or email to secure your preferred boat, dive guide, and rental gear before dates fill up.",
    ),
  };
}

export async function buildKeyLargoReefDiveTripsPage(): Promise<DiveLandingContent> {
  const slug = "key-largo-reef-dive-trips";
  const page = await fetchWordPressPageContent(slug);
  const mediaFallback = getMediaFallback(slug);
  const heroBackground = page.featuredImage ?? mediaFallback.hero;
  const gallerySources = page.galleries.length
    ? page.galleries
    : mediaFallback.gallery;

  const highlights = buildHighlights(page.bulletPoints, [
    "Access Molasses, French, and Elbow Reef on one charter",
    "Live coral gardens with 20��35 ft depths and 80 ft visibility",
    "Rental gear and private crew options available",
    "Perfect for photographers and families alike",
  ]);

  const sections = selectSections(page.sections, [
    "reef dive trips",
    "molasses reef",
    "french reef",
    "elbow reef",
  ]);

  const faq = createFaq(page.sections, 6);
  const gallery = createGallery(
    gallerySources,
    "Key Largo reef dive",
    heroBackground,
  );

  return {
    slug,
    seo: {
      title: "Key Largo Reef Dive Trips | Molasses, French & Elbow Reefs",
      description: truncate(
        page.introText ||
          "Explore the top Key Largo reef dives with concierge boats, pro guides, and full gear support.",
      ),
      canonical: "https://keylargoscubadiving.com/key-largo-reef-dive-trips/",
      image: heroBackground,
    },
    hero: {
      eyebrow: "Key Largo Barrier Reef",
      title: "Key Largo Reef Dive Trips",
      subtitle:
        page.introText ||
        "Dive the third-largest living barrier reef with vibrant coral gardens, swim-throughs, and endless marine life.",
      backgroundImage: heroBackground,
      highlights,
      stats: [
        { label: "Reef Sites", value: "75" },
        { label: "Avg. Visibility", value: "80 ft" },
        { label: "Depth Range", value: "20–35 ft" },
        { label: "Reef Health", value: "Protected" },
      ],
      ctas: [
        { label: "Plan your reef dives", href: DISCOVERY_PATH },
        {
          label: "Call for custom charter",
          href: `tel:${PHONE.replace(/[^\d+]/g, "")}`,
          variant: "secondary",
        },
      ],
    },
    quickInfo: [
      { label: "Trip Length", value: "4 hours" },
      { label: "Sites", value: "Molasses, French, Elbow" },
      { label: "Skill Level", value: "All certified divers" },
      { label: "Boat Style", value: "Shaded dive catamarans" },
    ],
    valueProps: [
      {
        title: "Iconic coral formations",
        description:
          "Swim above brain coral, spur-and-groove structures, and shallow swim-throughs ideal for relaxed diving.",
        icon: "Waves",
      },
      {
        title: "Wildlife encounters",
        description:
          "Spot turtles, rays, parrotfish, and cleaner stations with guidance from dive pros on every drop.",
        icon: "Waves",
      },
      {
        title: "Flexible charter options",
        description:
          "Join shared departures or book a private six-pack charter with rental gear and guide included.",
        icon: "Waves",
      },
    ],
    itinerary: {
      title: "Two-tank Key Largo reef itinerary",
      description:
        "Designed for relaxed macro photography, buoyancy practice, and unforgettable coral encounters.",
      steps: [
        {
          title: "Dockside welcome",
          description:
            "Check in, fit rental gear, and review the day’s reef selection with your captain.",
          duration: "25 minutes",
        },
        {
          title: "First reef drop",
          description:
            "Descend onto Molasses Reef or French Reef for 45 minutes of guided exploration and photography.",
          duration: "45 minutes",
        },
        {
          title: "Surface interval",
          description:
            "Enjoy refreshments while cruising to a complementary second reef with new coral formations.",
          duration: "35 minutes",
        },
        {
          title: "Second tank & return",
          description:
            "Finish with shallow ledges or coral fingers before heading back to the marina at sunset.",
          duration: "45 minutes",
        },
      ],
    },
    featuredList: highlights,
    gallery,
    wordpressSections: sections,
    faq,
    contact: baseContact(
      "Let us match your group with the best crew, reef sites, and rental gear for an unforgettable day on the water.",
    ),
  };
}

export async function buildKeyLargoWreckDiveTripsPage(): Promise<DiveLandingContent> {
  const slug = "key-largo-wreck-dive-trips";
  const page = await fetchWordPressPageContent(slug);
  const mediaFallback = getMediaFallback(slug);
  const heroBackground = page.featuredImage ?? mediaFallback.hero;
  const gallerySources = page.galleries.length
    ? page.galleries
    : mediaFallback.gallery;

  const highlights = buildHighlights(page.bulletPoints, [
    "Descend on Spiegel Grove, Duane, Bibb, and Benwood wrecks",
    "Guided penetration routes with redundant safety briefings",
    "Nitrox and tech guide add-ons available",
    "Pair wrecks with reef drifts for mixed itineraries",
  ]);

  const sections = selectSections(page.sections, [
    "wreck dive trips",
    "spiegel grove",
    "duane",
    "benwood",
  ]);

  const faq = createFaq(page.sections, 6);
  const gallery = createGallery(
    gallerySources,
    "Key Largo wreck dive",
    heroBackground,
  );

  return {
    slug,
    seo: {
      title: "Key Largo Wreck Dive Trips | Spiegel Grove, Duane & Benwood",
      description: truncate(
        page.introText ||
          "Experience the Florida Keys’ legendary wrecks with advanced crews, detailed penetrations, and Nitrox upgrades.",
      ),
      canonical: "https://keylargoscubadiving.com/key-largo-wreck-dive-trips/",
      image: heroBackground,
    },
    hero: {
      eyebrow: "Advanced Wreck Adventures",
      title: "Key Largo Wreck Dive Trips",
      subtitle:
        page.introText ||
        "Guided dives on Spiegel Grove, Duane, Bibb, and Vandenberg with pro crews trained for safe penetrations.",
      backgroundImage: heroBackground,
      highlights,
      stats: [
        { label: "Signature Wrecks", value: "5" },
        { label: "Max Depth", value: "130 ft" },
        { label: "Guides", value: "PADI Pros" },
        { label: "Certification", value: "Advanced" },
      ],
      ctas: [
        { label: "Secure your wreck charter", href: DISCOVERY_PATH },
        {
          label: "Call for tech options",
          href: `tel:${PHONE.replace(/[^\d+]/g, "")}`,
          variant: "secondary",
        },
      ],
    },
    quickInfo: [
      { label: "Trip Length", value: "5 hours" },
      { label: "Depth", value: "60–130 ft" },
      { label: "Required", value: "Advanced Open Water" },
      { label: "Upgrades", value: "Nitrox & guides" },
    ],
    valueProps: [
      {
        title: "Purpose-built wreck ops",
        description:
          "Crew-led line deployment, redundant safety checks, and hot drop options tailored to each wreck.",
        icon: "Waves",
      },
      {
        title: "Historic steel giants",
        description:
          "Explore Spiegel Grove’s helicopter bay, Duane’s crow’s nest, and Benwood’s torpedo scars.",
        icon: "Waves",
      },
      {
        title: "Custom tech support",
        description:
          "Add personal divemasters, pony bottles, mixed gas, or trimix introductions depending on your goals.",
        icon: "Waves",
      },
    ],
    itinerary: {
      title: "Signature Key Largo wreck itinerary",
      description:
        "Carefully paced dives with advanced briefings, line plans, and redundant safety to keep the focus on exploration.",
      steps: [
        {
          title: "Pro-level briefing",
          description:
            "Review schematics, currents, and planned penetration routes before boarding with your wreck guide.",
          duration: "30 minutes",
        },
        {
          title: "Hot drop & descent",
          description:
            "Negative entry positioning puts you directly on the wreck with guide-managed descent and buddy checks.",
          duration: "15 minutes",
        },
        {
          title: "Primary penetration",
          description:
            "Follow lighted guide lines through Spiegel Grove rooms, Duane passageways, or Benwood ribs.",
          duration: "35 minutes",
        },
        {
          title: "Safety stops & second site",
          description:
            "Complete ascent protocols, hydrate, then proceed to a second wreck or drift reef pairing.",
          duration: "45 minutes",
        },
      ],
    },
    featuredList: highlights,
    gallery,
    wordpressSections: sections,
    faq,
    contact: baseContact(
      "Reach out for wreck pairings, penetration requirements, and to reserve Nitrox or personal divemaster support.",
    ),
  };
}

export async function buildKeyLargoSunsetCruisePage(): Promise<DiveLandingContent> {
  const slug = "key-largo-sunset-cruise-snorkeling-florida-keys";
  const page = await fetchWordPressPageContent(slug);
  const mediaFallback = getMediaFallback(slug);
  const heroBackground = page.featuredImage ?? mediaFallback.hero;
  const gallerySources = page.galleries.length
    ? page.galleries
    : mediaFallback.gallery;

  const highlights = buildHighlights(page.bulletPoints, [
    "1-hour snorkeling session before sunset",
    "Sail a 50 ft catamaran with shaded lounge nets",
    "Rum punch and refreshments included",
    "All gear, noodles, and crew-led briefing provided",
  ]);

  const sections = selectSections(page.sections, [
    "best key largo sunset cruise",
    "sunset cruise, sail",
    "sunset cruise reefs",
    "snorkeling tour",
  ]);

  const faq = createFaq(page.sections, 5);
  const gallery = createGallery(
    gallerySources,
    "Key Largo sunset cruise",
    heroBackground,
  );

  return {
    slug,
    seo: {
      title: "Key Largo Sunset Cruise & Snorkeling | Florida Keys Catamaran",
      description: truncate(
        page.introText ||
          "Sail into golden hour with an all-inclusive Key Largo sunset cruise featuring snorkeling, refreshments, and live crew.",
      ),
      canonical:
        "https://keylargoscubadiving.com/key-largo-sunset-cruise-snorkeling-florida-keys/",
      image: heroBackground,
    },
    hero: {
      eyebrow: "Sunset Sail • Snorkel • Sip",
      title: "Key Largo Sunset Cruise & Snorkeling",
      subtitle:
        page.introText ||
        "Board a sailing catamaran for snorkeling over coral reefs followed by an unforgettable Florida Keys sunset.",
      backgroundImage: heroBackground,
      highlights,
      stats: [
        { label: "Duration", value: "3 hours" },
        { label: "Snorkel Time", value: "1 hour" },
        { label: "Beverages", value: "Rum punch" },
        { label: "Capacity", value: "38 guests" },
      ],
      ctas: [
        { label: "Reserve your sunset sail", href: DISCOVERY_PATH },
        {
          label: "Call for availability",
          href: `tel:${PHONE.replace(/[^\d+]/g, "")}`,
          variant: "secondary",
        },
      ],
    },
    quickInfo: [
      { label: "Departure", value: "Daily • 4:30 PM" },
      { label: "Includes", value: "Gear & refreshments" },
      { label: "Boat", value: "Sailing catamaran" },
      { label: "Family Friendly", value: "Ages 5+" },
    ],
    valueProps: [
      {
        title: "Golden hour snorkeling",
        description:
          "Slip into warm reef waters before sunset with guided snorkel support and easy stair access back aboard.",
        icon: "Waves",
      },
      {
        title: "Relaxed sailing experience",
        description:
          "Stretch out on trampolines, lounge seating, and shaded deck space as the captain sets a scenic sunset course.",
        icon: "Waves",
      },
      {
        title: "All-inclusive hospitality",
        description:
          "Enjoy rum punch, sodas, light bites, and crew storytelling that captures Florida Keys history.",
        icon: "Waves",
      },
    ],
    itinerary: {
      title: "Sunset sail & snorkel timeline",
      description:
        "An easy-going evening itinerary that combines reef exploration with an unforgettable Keys sunset cruise.",
      steps: [
        {
          title: "Welcome aboard",
          description:
            "Check in at the marina, meet your crew, and receive snorkeling gear along with safety orientation.",
          duration: "20 minutes",
        },
        {
          title: "Snorkel session",
          description:
            "Anchor at a protected reef for a 60-minute guided snorkel with noodles, marine stairs, and photographer tips.",
          duration: "60 minutes",
        },
        {
          title: "Sunset sail",
          description:
            "Hoist the sails, grab a rum punch, and enjoy golden hour views as music and crew stories set the mood.",
          duration: "60 minutes",
        },
        {
          title: "Twilight return",
          description:
            "Cruise back beneath pastel skies with refreshments, local recommendations, and photo opportunities.",
          duration: "40 minutes",
        },
      ],
    },
    featuredList: highlights,
    gallery,
    wordpressSections: sections,
    faq,
    contact: baseContact(
      "Call or email to arrange private charters, group celebrations, or to bundle with daytime reef snorkeling trips.",
    ),
  };
}

export const getKeyLargoDiveTripsPage = cache(buildKeyLargoDiveTripsPage);
export const getKeyLargoReefDiveTripsPage = cache(
  buildKeyLargoReefDiveTripsPage,
);
export const getKeyLargoWreckDiveTripsPage = cache(
  buildKeyLargoWreckDiveTripsPage,
);
export const getKeyLargoSunsetCruisePage = cache(buildKeyLargoSunsetCruisePage);
