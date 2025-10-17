"use client";

import Image from "next/image";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar, MapPin, Star, Users, Shield, Clock } from "lucide-react";

function RatingStars({ count = 5 }: { count?: number }) {
  return (
    <div className="flex items-center gap-1 text-white/90">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-current" />
      ))}
      <span className="text-sm ml-1">4.9/5 • 2,500+ reviews</span>
    </div>
  );
}

// Variant A: Bold full-bleed background with centered CTA
function HeroVariantA() {
  return (
    <section className="relative w-screen min-h-screen pt-20 text-white">
      <Image
        src="https://cdn.builder.io/api/v1/image/assets%2F2a778920e8d54a37b1576086f79dd676%2F0bddff050630406c9e73b7be081d7b85?format=webp&width=3840&quality=90"
        alt="Key Largo reef backdrop"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 h-[calc(100vh-5rem)] flex items-center">
        <div className="w-full text-center">
          <div className="flex gap-3 justify-center mb-6">
            <Badge className="bg-white/90 text-ocean">
              #1 Rated in the Keys
            </Badge>
            <Badge className="bg-white/90 text-coral">Best Seller</Badge>
            <Badge className="bg-white/90 text-sage">Free Gear Included</Badge>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold leading-tight drop-shadow-lg mb-4">
            Key Largo Scuba & Snorkel Adventures
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto mb-8">
            Daily departures • Small groups • Pro captains • World‑famous reefs
            and the Christ of the Abyss statue
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild size="lg" className="bg-coral hover:bg-coral/90">
              <Link href="/christ-statue-tour">
                <Calendar className="w-5 h-5 mr-2" /> Book Your Spot
              </Link>
            </Button>
            <Button
              asChild
              variant="secondary"
              size="lg"
              className="bg-white/90 text-ocean hover:bg-white"
            >
              <Link href="/snorkeling-tours">See All Tours</Link>
            </Button>
          </div>
          <div className="mt-6 flex items-center justify-center gap-6 text-sm">
            <RatingStars />
            <div className="hidden md:flex items-center gap-2 text-white/90">
              <Shield className="w-4 h-4" /> Free cancellations up to 24h
            </div>
            <div className="hidden md:flex items-center gap-2 text-white/90">
              <Clock className="w-4 h-4" /> Trips depart every day
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Variant B: Left‑aligned copy with product overlay card CTA
function HeroVariantB() {
  return (
    <section className="relative w-screen min-h-screen pt-20 text-white">
      <Image
        src="https://cdn.builder.io/api/v1/image/assets%2F2a778920e8d54a37b1576086f79dd676%2F04a13ecb14db49a29892aec49c9d3466?format=webp&width=2400"
        alt="Snorkeling over coral"
        fill
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 h-[calc(100vh-5rem)] flex items-center">
        <div className="max-w-2xl">
          <h2 className="text-4xl md:text-6xl font-bold leading-tight mb-4">
            Christ of the Abyss Snorkeling Tour
          </h2>
          <p className="text-lg md:text-xl text-white/90 mb-6">
            Calm waters, crystal visibility, and a friendly crew. Perfect for
            families and first‑timers.
          </p>
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <Badge className="bg-white/90 text-ocean">Daily Departures</Badge>
            <Badge className="bg-white/90 text-sage">All Gear Included</Badge>
            <span className="flex items-center gap-2 text-white/90">
              <MapPin className="w-4 h-4" /> Key Largo, FL
            </span>
          </div>
          <div className="flex gap-3">
            <Button asChild size="lg">
              <Link href="/christ-statue-tour">Book From $89</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="bg-transparent"
            >
              <Link href="/snorkeling-tours">More Snorkeling</Link>
            </Button>
          </div>
          <div className="mt-6">
            <RatingStars />
          </div>
        </div>

        <div className="hidden lg:block absolute bottom-8 right-8 w-[400px] rounded-2xl bg-white/90 text-foreground backdrop-blur shadow-2xl p-5">
          <div className="text-sm text-foreground/70">Most Popular Tour</div>
          <div className="flex items-center justify-between mt-1">
            <div className="font-semibold">Christ of the Abyss</div>
            <div className="text-ocean font-bold">$89</div>
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground/70 mt-1">
            <Users className="w-4 h-4" /> Small groups • Free gear
          </div>
          <Button asChild className="mt-4 w-full">
            <Link href="/christ-statue-tour">Book Now</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

// Variant C: Conversion‑focused with inline availability check
function HeroVariantC() {
  return (
    <section className="relative w-screen min-h-screen pt-20 bg-gradient-to-br from-ocean to-deep-water text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.10),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.08),transparent_40%)]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 h-[calc(100vh-5rem)] flex items-center">
        <div className="w-full">
          <h2 className="text-4xl md:text-6xl font-bold leading-tight mb-4">
            Check Real‑Time Availability
          </h2>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mb-8">
            Instant confirmation. Honest pricing. No surprise add‑ons at
            checkout.
          </p>

          <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-4 md:p-6 shadow-2xl max-w-3xl">
            <form action="/trips-tours" className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <div className="md:col-span-2">
                <label htmlFor="date" className="block text-sm text-white/80 mb-1">
                  Date
                </label>
                <Input id="date" name="date" type="date" className="bg-white text-foreground" />
              </div>
              <div>
                <label htmlFor="guests" className="block text-sm text-white/80 mb-1">
                  Guests
                </label>
                <select id="guests" name="guests" className="w-full h-10 rounded-md border bg-white px-3 text-foreground">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
              </div>
              <Button type="submit" size="lg" className="w-full md:w-auto">Check Availability</Button>
            </form>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-white/90">
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4" /> Free cancellations up to 24h
              </span>
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4" /> Small groups
              </span>
              <span className="flex items-center gap-2">
                <Star className="w-4 h-4 fill-current" /> 4.9/5 Average
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HeroDesignsDevPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main>
        <HeroVariantA />
        <HeroVariantB />
        <HeroVariantC />
      </main>
    </div>
  );
}
