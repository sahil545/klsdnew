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
  const url = `${base}/john-pennekamp-coral-reef-state-park/`;
  const { yoastMetadataForUrl } = await import("../../lib/yoast");
  const meta = await yoastMetadataForUrl(url);
  return meta as any;
}

function JsonLd() {
  const json = {
    "@context": "https://schema.org",
    "@type": "Park",
    name: "John Pennekamp Coral Reef State Park",
    description:
      "The first underwater state park in the United States, protecting coral reefs off Key Largo, Florida Keys.",
    areaServed: "Key Largo, Florida Keys",
    url: "/john-pennekamp-coral-reef-state-park/",
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}

export default function PennekampPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-r from-ocean to-ocean/80 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-3 bg-coral/20 text-coral border-coral/30 text-lg px-4 py-2">
              America’s First Underwater Park
            </Badge>
            {(() => {
              const text = [
                "In the early to mid-1900s, discussions began to protect the coral reefs near Key Largo. By the 1950s, damage from unregulated collecting and salvage raised alarm. With advocacy from Miami Herald editor John D. Pennekamp—who also helped establish Everglades National Park—the area received increasing protections.",
                "In 1960, President Eisenhower established the Key Largo Coral Reef Preserve. Land was later purchased and donated for a formal park site. Florida Governor Leroy Collins renamed the area John Pennekamp Coral Reef State Park, which officially opened in 1963.",
                "Today the park covers roughly 70 sq. miles, from Ocean Reef Club in the north to Rodriguez Key (MM 96) in the south, extending ~3.5 miles offshore. The park is surrounded by and works in partnership with the Florida Keys National Marine Sanctuary.",
                "Never touch or stand on coral, secure your gear, and use reef-safe sunscreen. Follow Sanctuary and park rules to minimize impacts on fragile habitats.",
                "Open daily; extended phone support until 11pm",
                "Online booking with instant confirmation and digital waivers",
                "Departures run multiple times daily, weather permitting",
              ].join(" ");
              const rt = computeReadingTime(text);
              const updated = formatUpdated();
              return <MetaChips readTime={rt} date={updated} />;
            })()}
            <h1 className="text-5xl md:text-6xl font-bold mt-3 mb-6 leading-tight">
              John Pennekamp Coral Reef State Park
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Spanning ~70 square miles off Key Largo, Pennekamp protects
              shallow coral reefs and seagrass habitats within the Florida Keys
              National Marine Sanctuary.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/snorkeling-trips">
                <Button className="bg-coral hover:bg-coral/90 text-white">
                  See Snorkeling Trips
                </Button>
              </Link>
              <Link href="/product">
                <Button
                  variant="outline"
                  className="border-foam text-white hover:bg-white/10"
                >
                  Explore All Adventures
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
            <h2>History</h2>
            <p>
              In the early to mid-1900s, discussions began to protect the coral
              reefs near Key Largo. By the 1950s, damage from unregulated
              collecting and salvage raised alarm. With advocacy from Miami
              Herald editor John D. Pennekamp—who also helped establish
              Everglades National Park—the area received increasing protections.
            </p>
            <p>
              In 1960, President Eisenhower established the Key Largo Coral Reef
              Preserve. Land was later purchased and donated for a formal park
              site. Florida Governor Leroy Collins renamed the area John
              Pennekamp Coral Reef State Park, which officially opened in 1963.
            </p>

            <h2>Size and Boundaries</h2>
            <p>
              Today the park covers roughly 70 sq. miles, from Ocean Reef Club
              in the north to Rodriguez Key (MM 96) in the south, extending ~3.5
              miles offshore. The park is surrounded by and works in partnership
              with the Florida Keys National Marine Sanctuary.
            </p>

            <h2>Things To Do</h2>
            <ul>
              <li>
                <strong>World-Class Snorkeling &amp; Diving:</strong> Explore
                shallow coral reefs with excellent visibility. Popular sites
                include{" "}
                <Link href="/christ-of-the-abyss-statue-snorkeling-key-largo">
                  Christ of the Abyss
                </Link>
                , Molasses Reef, and Grecian Rocks.
              </li>
              <li>
                <strong>Try Scuba Diving:</strong> No experience required.
                Complete a morning pool session then dive the reef in the
                afternoon. See <Link href="/product">current offerings</Link>.
              </li>
              <li>
                <strong>Scuba Certification:</strong> Earn Open Water
                certification in Key Largo with e-learning, pool training, and
                reef dives.
              </li>
              <li>
                <strong>Sunset Cruises &amp; Night Dives:</strong> Discover the
                reef after dark—night snorkeling and diving available.
              </li>
            </ul>

            <h2>Responsible Reef Practices</h2>
            <p>
              Never touch or stand on coral, secure your gear, and use reef-safe
              sunscreen. Follow Sanctuary and park rules to minimize impacts on
              fragile habitats.
            </p>

            <h3>Plan Your Visit</h3>
            <ul>
              <li>Open daily; extended phone support until 11pm</li>
              <li>
                Online booking with instant confirmation and digital waivers
              </li>
              <li>Departures run multiple times daily, weather permitting</li>
            </ul>

            <p>
              Ready to go? Browse{" "}
              <Link href="/snorkeling-trips">Key Largo snorkeling trips</Link>{" "}
              or learn about the{" "}
              <Link href="/christ-of-the-abyss-statue-snorkeling-key-largo">
                Christ of the Abyss statue
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <Footer />
      <JsonLd />
    </div>
  );
}
