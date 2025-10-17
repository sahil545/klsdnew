"use client";

"use client";

export const dynamic = "force-dynamic";

import React, { useState } from "react";
import { Navigation } from "../../client/components/Navigation";
import { Footer } from "../../client/components/Footer";
import { Button } from "../../client/components/ui/button";
import { Badge } from "../../client/components/ui/badge";
import { Card, CardContent } from "../../client/components/ui/card";
import { MapPin, Anchor, Compass } from "lucide-react";
import DiveSitesLeafletMapWrapper from "../../client/components/DiveSitesLeafletMapWrapper";
import { DiveSiteData } from "../../client/components/DiveSitesLeafletMap";
import { ErrorBoundary } from "../components/ErrorBoundary";

import Image from "next/image";

export default function DiveSites() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedSite, setSelectedSite] = useState<number | null>(null);
  const [cmsSites, setCmsSites] = useState<DiveSiteData[] | null>(null);

  const filters = ["All", "Reef", "Wreck", "Shallow", "Deep", "Night Dive"];

  const fallbackSites: DiveSiteData[] = [
    {
      id: 1,
      name: "Christ of the Abyss",
      location: "John Pennekamp Coral Reef State Park",
      depth: "25 feet",
      type: "Reef",
      difficulty: "Beginner",
      description:
        "World-famous 9-foot bronze Christ statue surrounded by marine life",
      image:
        "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      highlights: [
        "Bronze Christ statue",
        "Excellent visibility",
        "Perfect for snorkeling",
      ],
      marineLife: ["Angelfish", "Parrotfish", "Sergeant Major", "Yellow Tangs"],
      coordinates: [25.0784, -80.2937], // Christ of the Abyss actual coordinates
    },
    {
      id: 2,
      name: "Spiegel Grove",
      location: "Key Largo Marine Sanctuary",
      depth: "130 feet",
      type: "Wreck",
      difficulty: "Advanced",
      description:
        "Massive 510-foot Navy ship wreck, one of the largest artificial reefs",
      image:
        "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      highlights: [
        "510-foot Navy ship",
        "Penetration opportunities",
        "Goliath grouper sightings",
      ],
      marineLife: [
        "Goliath Grouper",
        "Barracuda",
        "Nurse Sharks",
        "Moray Eels",
      ],
      coordinates: [25.0711, -80.2825], // Spiegel Grove actual coordinates
    },
    {
      id: 3,
      name: "Molasses Reef",
      location: "Key Largo Marine Sanctuary",
      depth: "40 feet",
      type: "Reef",
      difficulty: "Intermediate",
      description:
        "Pristine coral reef with diverse marine life and excellent underwater photography",
      image:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      highlights: [
        "Pristine coral formations",
        "Excellent for photography",
        "Diverse marine ecosystem",
      ],
      marineLife: ["Sea Turtles", "Eagle Rays", "Reef Sharks", "Tropical Fish"],
      coordinates: [25.0117, -80.3767], // Molasses Reef actual coordinates
    },
    {
      id: 4,
      name: "French Reef",
      location: "Key Largo Marine Sanctuary",
      depth: "35 feet",
      type: "Reef",
      difficulty: "Intermediate",
      description:
        "Large coral reef system with swim-throughs, caves, and abundant marine life",
      image:
        "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      highlights: [
        "Swim-through formations",
        "Cave systems",
        "Large school of fish",
      ],
      marineLife: ["Grouper", "Snappers", "Angelfish", "Lobsters"],
      coordinates: [25.0378, -80.3497], // French Reef coordinates
    },
    {
      id: 5,
      name: "Benwood Wreck",
      location: "Key Largo Marine Sanctuary",
      depth: "45 feet",
      type: "Wreck",
      difficulty: "Intermediate",
      description:
        "Historic freighter wreck from WWII, now home to abundant marine life",
      image:
        "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      highlights: ["WWII history", "Easy penetration", "Shallow wreck diving"],
      marineLife: [
        "Sergeant Majors",
        "Yellowtail Snappers",
        "Barracuda",
        "Jacks",
      ],
      coordinates: [25.0547, -80.3281], // Benwood Wreck coordinates
    },
    {
      id: 6,
      name: "Grecian Rocks",
      location: "Key Largo Marine Sanctuary",
      depth: "25 feet",
      type: "Reef",
      difficulty: "Beginner",
      description:
        "Shallow reef perfect for beginners with excellent snorkeling opportunities",
      image:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      highlights: ["Perfect for beginners", "Great snorkeling", "Calm waters"],
      marineLife: ["Parrotfish", "Angelfish", "Grunts", "Blue Tangs"],
      coordinates: [25.0664, -80.3072], // Grecian Rocks coordinates
    },
  ];

  // Load from Builder CMS if available
  React.useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await fetch("/api/cms/content/dive-site?limit=100", {
          cache: "no-store",
        });
        const json = await res.json();
        if (json?.results && Array.isArray(json.results) && !ignore) {
          const mapped: DiveSiteData[] = json.results.map(
            (item: any, idx: number) => {
              const d = item?.data || {};
              const coords: [number, number] | undefined =
                Array.isArray(d.coordinates) && d.coordinates.length === 2
                  ? [Number(d.coordinates[0]), Number(d.coordinates[1])]
                  : undefined;
              return {
                id: d.id || idx + 1,
                name: d.name || item.name || "Dive Site",
                location: d.location || "Key Largo Marine Sanctuary",
                depth: d.depth || "25 feet",
                type: d.type || "Reef",
                difficulty: d.difficulty || "Beginner",
                description: d.description || "",
                image:
                  d.image?.src ||
                  d.image ||
                  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80",
                highlights: Array.isArray(d.highlights) ? d.highlights : [],
                marineLife: Array.isArray(d.marineLife) ? d.marineLife : [],
                coordinates: coords || [25.0664, -80.3072],
              } as DiveSiteData;
            },
          );
          if (mapped.length) setCmsSites(mapped);
        }
      } catch {
        // ignore, fallback stays
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  const sites = cmsSites ?? fallbackSites;

  const filteredSites =
    activeFilter === "All"
      ? sites
      : sites.filter(
          (site) =>
            site.type === activeFilter || site.difficulty === activeFilter,
        );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Map Section */}
      <section className="relative pt-24">
        <ErrorBoundary>
          <DiveSitesLeafletMapWrapper
            diveSites={filteredSites}
            selectedSite={selectedSite}
            onSiteSelect={setSelectedSite}
            className="h-[70vh] w-full"
          />
        </ErrorBoundary>
      </section>


      {/* Filter Section */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-ocean mb-2">
              Filter Dive Sites
            </h2>
            <p className="text-gray-600">
              Find the perfect dive site for your skill level and interests
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {filters.map((filter) => (
              <Button
                key={filter}
                variant="outline"
                className={`${
                  activeFilter === filter
                    ? "bg-ocean text-white border-ocean"
                    : "border-ocean text-ocean hover:bg-ocean hover:text-white"
                }`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Dive Sites Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredSites.map((site) => (
              <Card
                key={site.id}
                className={`overflow-hidden hover:shadow-xl transition-all cursor-pointer ${
                  selectedSite === site.id
                    ? "ring-2 ring-ocean shadow-xl border-ocean"
                    : "border-ocean/20"
                }`}
                onClick={() =>
                  setSelectedSite(selectedSite === site.id ? null : site.id)
                }
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    width={500}
                    height={500}
                    src={site.image}
                    alt={site.name}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-4 left-4 bg-white/90 text-ocean">
                    {site.type}
                  </Badge>
                  <Badge className="absolute top-4 right-4 bg-coral text-white">
                    {site.difficulty}
                  </Badge>
                </div>

                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-ocean mb-2">
                    {site.name}
                  </h3>

                  <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-ocean" />
                    <span>{site.location}</span>
                  </div>

                  <div className="flex items-center gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Anchor className="w-4 h-4 text-ocean" />
                      <span>{site.depth}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Compass className="w-4 h-4 text-ocean" />
                      <span>{site.type}</span>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4">{site.description}</p>

                  <div className="space-y-2 mb-4">
                    <h4 className="font-semibold text-sm text-ocean">
                      Highlights:
                    </h4>
                    {site.highlights.slice(0, 2).map((highlight, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm text-gray-600"
                      >
                        <span className="text-coral">✓</span>
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 mb-6">
                    <h4 className="font-semibold text-sm text-ocean">
                      Marine Life:
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {site.marineLife.slice(0, 3).map((animal, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs border-sage text-sage"
                        >
                          {animal}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full bg-coral hover:bg-coral/90 text-white">
                    Dive This Site
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
