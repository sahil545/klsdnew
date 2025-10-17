import type { Metadata } from "next";
import type { Metadata } from "next";

import Navigation from "../../client/components/Navigation";
import Footer from "../../client/components/Footer";
import HeroAlt from "./HeroAlt";
import ExperienceSection from "../snorkeling-tours-template/sections/ExperienceSection";
import JourneySection from "../snorkeling-tours-template/sections/JourneySection";
import MarineLifeSection from "../snorkeling-tours-template/sections/MarineLifeSection";
import TrustSection from "../snorkeling-tours-template/sections/TrustSection";
import FinalCTASection from "../snorkeling-tours-template/sections/FinalCTASection";
import {
  tourData as base,
  type TourData,
} from "../snorkeling-tours-template/data";
import ClientTrips from "../snorkeling-trips/ClientTrips";
import FAQSection from "./FAQSection";
import FeaturedProducts from "./FeaturedProducts";
import { HOME_IMAGES } from "../../lib/generated/home-images";

const HERO_IMAGE = HOME_IMAGES.wpSnorkelingHero;

export async function generateMetadata(): Promise<Metadata> {
  const canonical =
    "https://keylargoscubadiving.com/key-largo-snorkeling-tours/";
  const title =
    "Key Largo Snorkeling Tours | Best Reefs, Christ of the Abyss, Family-Friendly Trips";
  const description =
    "Plan the perfect Key Largo snorkeling trip. What to expect, best reef sites, Christ of the Abyss, gear, pricing, FAQs, and expert tips. Free cancellation.";
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
      images: HERO_IMAGE ? [{ url: HERO_IMAGE }] : undefined,
    },
    twitter: {
      title,
      description,
      card: "summary_large_image",
      images: HERO_IMAGE ? [HERO_IMAGE] : undefined,
    },
  } as any;
}

function buildData(): TourData {
  return {
    ...base,
    name: "Key Largo Snorkeling Tours",
    description:
      "Everything you need to know to plan the perfect snorkeling adventure in Key Largo — top reef sites, what to expect, professional guides, and how to book.",
    images: {
      hero: HERO_IMAGE,
      gallery: base.images.gallery,
    },
    categories: ["Snorkeling"],
    details: {
      ...base.details,
      duration: "Half‑day (4 hours)",
      groupSize: "Up to 25 per boat",
      location: "Key Largo • John Pennekamp State Park",
      gearIncluded: true,
    },
    highlights: [
      "Crystal‑clear reefs with 60–80 ft visibility",
      "Visit the famous Christ of the Abyss statue",
      "All gear included • Family‑friendly",
      "Expert PADI guides focused on safety",
    ],
    experience: {
      title: "What to Expect on Your Key Largo Snorkeling Trip",
      description:
        "From seamless check‑in to world‑class reef sites, our team handles every detail so you can relax and enjoy an unforgettable day on the water.",
      features: [
        {
          icon: "Waves",
          title: "Iconic Reef Sites",
          description:
            "Explore legendary reefs like Grecian Rocks, Christ of the Abyss, and the nearby coral gardens known for abundant fish life.",
        },
        {
          icon: "Shield",
          title: "Pro Safety Briefings",
          description:
            "Clear, friendly orientation for every guest with gear fitting, snorkeling tips, and site overview before entering the water.",
        },
        {
          icon: "Fish",
          title: "Family‑Friendly Boats",
          description:
            "Spacious boats with shade, ladders, and fresh water rinse. Perfect for beginners, kids, and experienced snorkelers alike.",
        },
      ],
    },
    included: {
      title: "What���s Included",
      items: [
        "Premium mask, snorkel, and fins",
        "USCG‑inspected vessel with shade",
        "Professional guide & safety briefing",
        "Floatation aids available on request",
        "Park entrance and parking guidance",
      ],
      award: base.included.award,
    },
    journey: {
      title: "Your Half‑Day Itinerary",
      description: "Simple schedule designed for comfort and maximum reef time",
      steps: [
        {
          step: 1,
          title: "Check‑in & Gear Fitting",
          description:
            "Arrive at John Pennekamp. Meet your crew and get fitted with sanitized gear.",
          time: "30 minutes",
          color: "blue",
        },
        {
          step: 2,
          title: "Cruise to Reefs",
          description:
            "Short boat ride to the day’s best reef sites selected by your captain.",
          time: "20–30 minutes",
          color: "teal",
        },
        {
          step: 3,
          title: "Two Reef Stops",
          description:
            "Guided snorkeling sessions with tips from your crew and plenty of photo moments.",
          time: "2–2.5 hours",
          color: "orange",
        },
        {
          step: 4,
          title: "Return & Wrap‑Up",
          description:
            "Fresh water rinse, gear return, and local tips for lunch and beaches.",
          time: "20 minutes",
          color: "green",
        },
      ],
    },
    marineLife: {
      ...base.marineLife,
      title: "Marine Life You’ll See",
      description:
        "Encounter angelfish, parrotfish, turtles, rays, and vibrant corals inside America’s first underwater park.",
    },
    trustIndicators: {
      title: "Why Choose Key Largo Scuba Diving",
      subtitle: "Florida Keys’ most trusted snorkeling operator",
      stats: [
        { value: "50,000+", label: "Happy Guests" },
        { value: "4.9/5", label: "Average Rating" },
        { value: "25+", label: "Years Operating" },
        { value: "100%", label: "Safety Record" },
      ],
    },
    finalCTA: {
      title: "Ready to Snorkel Key Largo?",
      description:
        "Talk with our local experts or browse trips to find the perfect time for your group.",
      phone: "(305) 391-4040",
      benefits: ["Free cancellation", "Best price guarantee", "Local crew"],
    },
  };
}

export default function KeyLargoSnorkelingToursPage() {
  const data = buildData();
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navigation />
      <main>
        <HeroAlt data={data} />
        {/* Featured snorkeling products above What to Expect */}
        <FeaturedProducts ids={[252, 2425, 13747, 8921]} />
        {/* No booking widget on informational page */}
        <ExperienceSection data={data} />
        <JourneySection data={data} />
        <MarineLifeSection data={data} />
        <TrustSection data={data} />
        {/* All snorkeling products */}
        <section id="tours" className="py-16 bg-gray-50 border-t">
          <div className="container mx-auto px-4">
            <div className="mb-8 text-center">
              <h2 className="text-3xl md:text-4xl font-bold">
                All Snorkeling Tours
              </h2>
              <p className="text-muted-foreground">
                Browse our most popular snorkeling trips in Key Largo
              </p>
            </div>
            <ClientTrips />
          </div>
        </section>
        <FinalCTASection data={data} />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
}
