import "server-only";

export interface WordPressSection {
  title: string;
  html: string;
}

export interface WordPressPageContent {
  title: string;
  slug: string;
  featuredImage: string | null;
  introHtml: string;
  introText: string;
  sections: WordPressSection[];
  galleries: string[];
  bulletPoints: string[];
  rawHtml: string;
}

export interface HeroContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  backgroundImage: string | null;
  highlights: string[];
  stats: Array<{ label: string; value: string }>;
  ctas: Array<{ label: string; href: string; variant?: "primary" | "secondary" }>;
}

export interface QuickInfoItem {
  label: string;
  value: string;
}

export interface ValuePropCard {
  title: string;
  description: string;
  icon: string;
}

export interface ItineraryStep {
  title: string;
  description: string;
  duration: string;
}

export interface GalleryImage {
  src: string;
  alt: string;
}

export interface ContactBlock {
  title: string;
  description: string;
  phone: string;
  email?: string;
  benefits: string[];
}

export interface FAQItem {
  question: string;
  answerHtml: string;
}

export interface DiveLandingContent {
  slug: string;
  seo: {
    title: string;
    description: string;
    canonical: string;
    image?: string | null;
  };
  hero: HeroContent;
  quickInfo: QuickInfoItem[];
  valueProps: ValuePropCard[];
  itinerary: {
    title: string;
    description: string;
    steps: ItineraryStep[];
  };
  featuredList: string[];
  gallery: GalleryImage[];
  wordpressSections: WordPressSection[];
  faq: FAQItem[];
  contact: ContactBlock;
}
