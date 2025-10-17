"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Clock, Filter, Search, Star, Users } from "lucide-react";

export type TripItem = {
  id: number;
  name: string;
  slug: string;
  price: number;
  image: string;
  categories: { id: number | null; name: string | null; slug: string | null }[];
  categoryDisplay: string;
  average_rating: number;
  rating_count: number;
  duration: string | number | null;
  permalink: string | null;
  short_description: string | null;
  description: string | null;
};

const CATEGORY_ORDER: { slug: string; label: string }[] = [
  { slug: "reef-dives", label: "Reef Dives" },
  { slug: "wreck-dives", label: "Wreck Dives" },
  { slug: "snorkeling-trips", label: "Snorkeling Trips" },
  { slug: "private-dive-charters", label: "Private Dive Charters" },
  { slug: "night-dive", label: "Night Dives" },
  { slug: "spearfishing", label: "Spearfishing" },
  { slug: "private-snorkeling-trips", label: "Private Snorkeling Trips" },
  { slug: "sunset-cruise", label: "Sunset Cruise" },
];

const ALLOWED_TRIP_SLUGS = new Set(CATEGORY_ORDER.map((c) => c.slug));

function toNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = parseFloat(value);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function parseDurationToHours(value: unknown): number | null {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const hrs = value.match(/(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour)/i);
    if (hrs) return parseFloat(hrs[1]);
    const num = parseFloat(value);
    return Number.isFinite(num) ? num : null;
  }
  return null;
}

export default function TripsToursClient() {
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState<TripItem[]>([]);
  const [searchText, setSearchText] = useState("");
  const [activeCategories, setActiveCategories] = useState<string[]>([]);

  // Read categories from URL on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    const raw = sp.get("categories");
    if (raw) {
      const cats = raw.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
      const allowed = cats.filter((c) => ALLOWED_TRIP_SLUGS.has(c));
      if (allowed.length) setActiveCategories(allowed);
    }
  }, []);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(500);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("recommended");

  // Load trips from internal API (Supabase-backed)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`/api/trips?limit=120`, { cache: "no-store" });
        const json = await res.json();
        const items: TripItem[] = (json?.trips ?? []).filter((t: TripItem) =>
          (t.categories || []).some(
            (c) => c?.slug && ALLOWED_TRIP_SLUGS.has(c.slug),
          ),
        );
        if (!mounted) return;
        setTrips(items);
        const prices = items.map((t) => toNumber(t.price)).filter((n) => n > 0);
        const pmin = prices.length ? Math.min(...prices) : 0;
        const pmax = prices.length ? Math.max(...prices) : 500;
        setMinPrice(pmin);
        setMaxPrice(pmax);
        setPriceRange([pmin, pmax]);
        setLoading(false);
      } catch (e) {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Derived filtered list
  const filtered = useMemo(() => {
    let list = trips.slice();

    // Always restrict to allowed trip/tour categories
    list = list.filter((t) =>
      (t.categories || []).some(
        (c) => c?.slug && ALLOWED_TRIP_SLUGS.has(c.slug),
      ),
    );

    if (activeCategories.length) {
      const wanted = new Set(activeCategories);
      list = list.filter((t) =>
        (t.categories || []).some((c) => (c.slug ? wanted.has(c.slug) : false)),
      );
    }

    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          (t.short_description || "").toLowerCase().includes(q) ||
          (t.description || "").toLowerCase().includes(q),
      );
    }

    // Price
    list = list.filter((t) => {
      const p = toNumber(t.price);
      return p >= priceRange[0] && p <= priceRange[1];
    });

    // Rating
    if (minRating > 0) {
      list = list.filter((t) => toNumber(t.average_rating) >= minRating);
    }

    // Sort
    switch (sortBy) {
      case "price-asc":
        list.sort((a, b) => toNumber(a.price) - toNumber(b.price));
        break;
      case "price-desc":
        list.sort((a, b) => toNumber(b.price) - toNumber(a.price));
        break;
      case "rating-desc":
        list.sort(
          (a, b) => toNumber(b.average_rating) - toNumber(a.average_rating),
        );
        break;
      default:
        // recommended: rating then reviews
        list.sort((a, b) => {
          const r = toNumber(b.average_rating) - toNumber(a.average_rating);
          if (r !== 0) return r;
          return toNumber(b.rating_count) - toNumber(a.rating_count);
        });
    }

    return list;
  }, [trips, activeCategories, searchText, priceRange, minRating, sortBy]);

  // Category facet list based on constant order but only show those present
  const categoryFacet = useMemo(() => {
    const present = new Set<string>();
    for (const t of trips) {
      for (const c of t.categories || []) {
        if (c?.slug) present.add(c.slug);
      }
    }
    return CATEGORY_ORDER.filter((c) => present.has(c.slug));
  }, [trips]);

  const toggleCategory = (slug: string) => {
    setActiveCategories((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  };

  // Layout
  return (
    <section className="py-10">
      <div className="container mx-auto px-4">
        {/* Controls */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2 w-full lg:max-w-md">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search trips (reef, christ statue, certification...)"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recommended">Recommended</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="rating-desc">Top Rated</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="lg:hidden">
              <Filter className="w-4 h-4 mr-2" /> Filters
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-8">
          {/* Sidebar filters */}
          <aside className="hidden lg:block">
            <div className="rounded-xl border p-5 space-y-6">
              <div>
                <h3 className="text-sm font-semibold mb-3">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {categoryFacet.map((c) => (
                    <Button
                      key={c.slug}
                      variant={
                        activeCategories.includes(c.slug)
                          ? "default"
                          : "outline"
                      }
                      className={
                        activeCategories.includes(c.slug)
                          ? "bg-ocean text-white"
                          : ""
                      }
                      size="sm"
                      onClick={() => toggleCategory(c.slug)}
                    >
                      {c.label}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-semibold mb-4">Price</h3>
                <div className="px-1">
                  <Slider
                    min={minPrice}
                    max={maxPrice}
                    step={1}
                    value={priceRange}
                    onValueChange={(v) =>
                      setPriceRange([v[0] ?? minPrice, v[1] ?? maxPrice])
                    }
                  />
                  <div className="mt-2 text-sm text-muted-foreground">
                    ${priceRange[0]} – ${priceRange[1]}
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-semibold mb-3">Minimum rating</h3>
                <div className="space-y-2">
                  {[0, 4, 4.5].map((r) => (
                    <label key={r} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={minRating === r}
                        onCheckedChange={() => setMinRating(r)}
                      />
                      <span>{r === 0 ? "Any" : `${r}+ stars`}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Grid */}
          <div>
            {loading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-80 rounded-xl border animate-pulse bg-muted"
                  />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center text-muted-foreground py-20">
                No trips match your filters.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filtered.map((trip) => (
                  <Card
                    key={trip.id}
                    className="overflow-hidden hover:shadow-xl transition-shadow border-ocean/20"
                  >
                    <Link
                      href={(() => {
                        let slug = trip.slug || `${trip.id}`;
                        const titleLc = (trip.name || "").toLowerCase();
                        if (
                          titleLc.includes("christ") &&
                          titleLc.includes("statue") &&
                          !/key-largo-christ-statue-snorkeling-tour/.test(slug)
                        ) {
                          slug = "key-largo-christ-statue-snorkeling-tour";
                        }
                        return `/product/${slug}`;
                      })()}
                    >
                      <div className="relative h-44 overflow-hidden">
                        <Image
                          src={trip.image || "/placeholder.svg"}
                          alt={trip.name}
                          width={800}
                          height={600}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-white/90 text-ocean">
                            {trip.categoryDisplay}
                          </Badge>
                        </div>
                        <div className="absolute top-3 right-3 bg-coral text-white px-3 py-1 rounded-full font-semibold">
                          ${toNumber(trip.price)}
                        </div>
                      </div>
                    </Link>

                    <CardContent className="p-4">
                      <h3 className="text-lg font-bold text-ocean mb-1 line-clamp-2">
                        {trip.name}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < Math.floor(toNumber(trip.average_rating)) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium">
                          {toNumber(trip.average_rating).toFixed(1)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({toNumber(trip.rating_count)} reviews)
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {trip.short_description || trip.description || ""}
                      </p>
                      <div className="grid grid-cols-2 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-ocean" />
                          {parseDurationToHours(trip.duration)
                            ? `${parseDurationToHours(trip.duration)} hrs`
                            : ""}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-ocean" />
                          Small groups
                        </div>
                      </div>
                      <Link
                        href={(() => {
                          let slug = trip.slug || `${trip.id}`;
                          const titleLc = (trip.name || "").toLowerCase();
                          if (
                            titleLc.includes("christ") &&
                            titleLc.includes("statue") &&
                            !/key-largo-christ-statue-snorkeling-tour/.test(
                              slug,
                            )
                          ) {
                            slug = "key-largo-christ-statue-snorkeling-tour";
                          }
                          return `/product/${slug}`;
                        })()}
                        className="block"
                      >
                        <Button className="w-full bg-coral hover:bg-coral/90 text-white">
                          Book This Trip
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
