import React from "react";
import Link from "next/link";
import { Navigation } from "../../client/components/Navigation";
import { Footer } from "../../client/components/Footer";
import { Badge } from "../../client/components/ui/badge";
import { Button } from "../../client/components/ui/button";

export const dynamic = "force-dynamic";

function computeReadingTime(text: string) {
  const words = String(text || "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

function formatUpdated(d: Date = new Date()) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  });
  return `Updated ${fmt.format(d)}`;
}

function MetaChips({ readTime, date }: { readTime: string; date?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs justify-center">
      <span className="inline-flex items-center gap-1 rounded-full bg-black/10 px-2 py-1 text-white/90">
        Blog
      </span>
      <span className="inline-flex items-center gap-1 rounded-full bg-black/10 px-2 py-1 text-white/90">
        {readTime}
      </span>
      {date ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-black/10 px-2 py-1 text-white/90">
          {date}
        </span>
      ) : null}
    </div>
  );
}

export async function generateMetadata() {
  const base = (
    process.env.NEXT_PUBLIC_WORDPRESS_URL || "https://keylargoscubadiving.com"
  ).replace(/\/$/, "");
  const url = `${base}/christ-of-the-abyss-statue-snorkeling-key-largo/`;
  const { yoastMetadataForUrl } = await import("../../lib/yoast");
  const meta = await yoastMetadataForUrl(url);
  return meta as any;
}

function JsonLd() {
  const json = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: "Christ of the Abyss Statue",
    description:
      "Iconic underwater bronze statue located at Dry Rocks reef in Key Largo, Florida Keys, popular for snorkeling and scuba diving.",
    touristType: ["Snorkeling", "Scuba Diving"],
    isAccessibleForFree: false,
    openingHours: "Mo-Su",
    areaServed: "Key Largo, Florida Keys",
    geo: { "@type": "GeoCoordinates", latitude: 25.0784, longitude: -80.2937 },
    sameAs: ["https://floridakeys.noaa.gov"],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}

export default function ChristOfTheAbyssPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-r from-ocean to-ocean/80 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-3 bg-coral/20 text-coral border-coral/30 text-lg px-4 py-2">
              World-Class Snorkeling
            </Badge>
            {(() => {
              const text = [
                "The Christ of the Abyss Statue is one of the Florida Keys’ most famous attractions. Visitors venture to Key Largo from around the world to view the underwater monument on a snorkeling or dive trip. The statue sits at Dry Rocks reef in approximately 25 ft of water, offering exceptional aerial views for snorkelers and close-up exploration for certified divers.",
                "Christ of the Abyss is located just a few miles off the coast of Key Largo on the seaward side of southern Dry Rocks reef. Dry Rocks is part of the Florida Keys Reef Tract (the Great Florida Reef), the third-largest living barrier reef in the world and the only one in the continental United States.",
                "The site lies within the Florida Keys National Marine Sanctuary and within John Pennekamp Coral Reef State Park, America’s first underwater park. Depths range from roughly 10–25 ft, with excellent visibility on most days. Common corals include elkhorn, boulder, and soft corals; marine life includes parrotfish, barracuda, rays, lobsters, eels, and sea turtles.",
                "The original bronze statue, “Il Cristo degli Abissi,” was erected in 1954 by Italian sculptor Guido Galletti to memorialize dive pioneer Dario Gonzatti. A second casting was placed in St. George’s, Grenada in 1961. Key Largo’s statue—the third and final cast—was commissioned in 1961 by Egidio Cressi and later donated to the Underwater Society of America. After an exhibition tour through Chicago and Orlando, the statue was placed at Dry Rocks in late summer of 1965 and dedicated on June 29, 1966.",
                "Dry Rocks is a Sanctuary Preservation Area. Please do not touch, stand on, or collect coral or marine life. Keep fins away from the reef, secure dangling gear, and wear reef-safe sunscreen. These simple steps protect fragile corals and preserve this iconic site for future generations.",
                "The best way to see Christ of the Abyss is by boat on a guided tour. Trips typically include a second shallow reef stop inside John Pennekamp Coral Reef State Park.",
              ].join(" ");
              const rt = computeReadingTime(text);
              const updated = formatUpdated();
              return <MetaChips readTime={rt} date={updated} />;
            })()}
            <h1 className="text-5xl md:text-6xl font-bold mt-3 mb-6 leading-tight">
              Christ of the Abyss Statue – Key Largo
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Explore Dry Rocks reef and the world-famous underwater Christ
              statue in the protected waters of John Pennekamp Coral Reef State
              Park and the Florida Keys National Marine Sanctuary.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/christ-statue-tour">
                <Button className="bg-coral hover:bg-coral/90 text-white">
                  Book Christ Statue Snorkeling Tour
                </Button>
              </Link>
              <Link href="/key-largo-snorkeling">
                <Button
                  variant="outline"
                  className="border-foam text-white hover:bg-white/10"
                >
                  Key Largo Snorkeling Guide
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl prose prose-neutral">
            <h2>Overview</h2>
            <p>
              The Christ of the Abyss Statue is one of the Florida Keys’ most
              famous attractions. Visitors venture to Key Largo from around the
              world to view the underwater monument on a snorkeling or dive
              trip. The statue sits at Dry Rocks reef in approximately 25 ft of
              water, offering exceptional aerial views for snorkelers and
              close-up exploration for certified divers.
            </p>

            <h2>Location and Conditions</h2>
            <p>
              Christ of the Abyss is located just a few miles off the coast of
              Key Largo on the seaward side of southern Dry Rocks reef. Dry
              Rocks is part of the Florida Keys Reef Tract (the Great Florida
              Reef), the third-largest living barrier reef in the world and the
              only one in the continental United States.
            </p>
            <p>
              The site lies within the Florida Keys National Marine Sanctuary
              and within John Pennekamp Coral Reef State Park, America’s first
              underwater park. Depths range from roughly 10–25 ft, with
              excellent visibility on most days. Common corals include elkhorn,
              boulder, and soft corals; marine life includes parrotfish,
              barracuda, rays, lobsters, eels, and sea turtles.
            </p>

            <h2>History</h2>
            <p>
              The original bronze statue, “Il Cristo degli Abissi,” was erected
              in 1954 by Italian sculptor Guido Galletti to memorialize dive
              pioneer Dario Gonzatti. A second casting was placed in St.
              George’s, Grenada in 1961. Key Largo’s statue—the third and final
              cast—was commissioned in 1961 by Egidio Cressi and later donated
              to the Underwater Society of America. After an exhibition tour
              through Chicago and Orlando, the statue was placed at Dry Rocks in
              late summer of 1965 and dedicated on June 29, 1966.
            </p>

            <h2>Reef Etiquette and Protection</h2>
            <p>
              Dry Rocks is a Sanctuary Preservation Area. Please do not touch,
              stand on, or collect coral or marine life. Keep fins away from the
              reef, secure dangling gear, and wear reef-safe sunscreen. These
              simple steps protect fragile corals and preserve this iconic site
              for future generations.
            </p>

            <h2>How to Visit</h2>
            <p>
              The best way to see Christ of the Abyss is by boat on a guided
              tour. Trips typically include a second shallow reef stop inside
              John Pennekamp Coral Reef State Park. Book a dedicated tour here:{" "}
              <Link href="/christ-statue-tour">
                Christ of the Abyss Snorkeling Tour
              </Link>
              .
            </p>

            <h3>Related Guides</h3>
            <ul>
              <li>
                <Link href="/key-largo-snorkeling">
                  Key Largo Snorkeling – Conditions, Temps, and Tips
                </Link>
              </li>
              <li>
                <Link href="/john-pennekamp-coral-reef-state-park">
                  John Pennekamp Coral Reef State Park
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <Footer />
      <JsonLd />
    </div>
  );
}
