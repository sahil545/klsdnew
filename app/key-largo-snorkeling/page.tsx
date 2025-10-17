import React from "react";
import Link from "next/link";
import { Navigation } from "../../client/components/Navigation";
import { Footer } from "../../client/components/Footer";
import { Badge } from "../../client/components/ui/badge";
import { Button } from "../../client/components/ui/button";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const base = (
    process.env.NEXT_PUBLIC_WORDPRESS_URL || "https://keylargoscubadiving.com"
  ).replace(/\/$/, "");
  const url = `${base}/key-largo-snorkeling/`;
  const { yoastMetadataForUrl } = await import("../../lib/yoast");
  const meta = await yoastMetadataForUrl(url);
  return meta as any;
}

function JsonLd() {
  const json = {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: "Key Largo Snorkeling",
    description:
      "Guide to snorkeling sites, conditions, and tours in Key Largo, Florida Keys.",
    areaServed: "Key Largo, Florida Keys",
    url: "/key-largo-snorkeling/",
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}

export default function KeyLargoSnorkelingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-r from-ocean to-ocean/80 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-coral/20 text-coral border-coral/30 text-lg px-4 py-2">
              Florida Keys Reef Guide
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Key Largo Snorkeling
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Experience the Florida Keys National Marine Sanctuary and John
              Pennekamp Coral Reef State Park with panoramic reef views,
              excellent visibility, and abundant sea life.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/christ-statue-tour">
                <Button className="bg-coral hover:bg-coral/90 text-white">
                  View Christ Statue Tours
                </Button>
              </Link>
              <Link href="/snorkeling-trips">
                <Button
                  variant="outline"
                  className="border-foam text-white hover:bg-white/10"
                >
                  All Snorkeling Trips
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
            <h2>What to Expect Snorkeling in Key Largo</h2>
            <p>
              Expect coral gardens, tropical fish, rays, sea turtles, and
              excellent visibility. Water temperatures typically range from
              75–82°F (Dec–Mar) and 80–90°F (Apr–Nov). Many snorkel sites are
              15–25 ft deep with visibility often exceeding 30 ft.
            </p>

            <h2>Best Snorkeling Spots</h2>
            <p>
              The best snorkeling sites in Key Largo include the{" "}
              <Link href="/christ-of-the-abyss-statue-snorkeling-key-largo">
                Christ of the Abyss statue
              </Link>{" "}
              at Dry Rocks, <strong>Molasses Reef</strong>, and{" "}
              <strong>Grecian Rocks</strong>. Each offers shallow depths and
              vibrant marine life in protected waters managed by the Florida
              Keys National Marine Sanctuary.
            </p>

            <h3>Christ of the Abyss (Dry Rocks)</h3>
            <p>
              Depths of ~10–25 ft, statue height ~8.5 ft, surrounded by elkhorn
              and boulder corals. Marine life includes parrotfish, barracuda,
              lobsters, and rays. Tours typically add a second shallow reef
              stop.
            </p>

            <h3>Molasses Reef</h3>
            <p>
              One of the world’s most visited reefs with 30+ moorings. Expect
              15–25 ft depths for snorkeling (sites for divers down to ~90 ft),
              spur-and-groove formations, and frequent eagle ray, turtle, and
              schooling fish sightings.
            </p>

            <h3>Grecian Rocks</h3>
            <p>
              A crescent-shaped, shallow reef (~10–15 ft) that’s naturally
              protected on windier days. Look for brain corals, purple sea fans,
              queen angelfish, and Caribbean blue tangs.
            </p>

            <h2>Getting to the Reef</h2>
            <p>
              Reefs are ~4–6+ miles offshore with a 30–60 minute boat ride.
              Enjoy scenic views and keep an eye out for dolphins, turtles, and
              eagle rays along the way.
            </p>

            <h2>Reef Etiquette</h2>
            <p>
              Do not touch or stand on coral, keep fins away from the reef,
              secure loose gear, and use reef-safe sunscreen. Respect Sanctuary
              rules to protect fragile habitats.
            </p>

            <h2>Plan Your Trip</h2>
            <ul>
              <li>Open daily, extended phone hours to 11pm for assistance</li>
              <li>
                Online booking with instant confirmation and digital waivers
              </li>
              <li>
                Top tours:{" "}
                <Link href="/christ-statue-tour">
                  Christ of the Abyss Snorkeling
                </Link>{" "}
                and Molasses Reef Snorkeling
              </li>
            </ul>

            <h3>Need Help Choosing?</h3>
            <p>
              Tell us your preferred destination and we’ll recommend the best
              trip. You can also browse{" "}
              <Link href="/snorkeling-trips">all snorkeling trips</Link>.
            </p>
          </div>
        </div>
      </section>

      <Footer />
      <JsonLd />
    </div>
  );
}
