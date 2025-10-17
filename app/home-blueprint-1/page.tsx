"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Navigation } from "../../client/components/Navigation";
import { Footer } from "../../client/components/Footer";
import { Button } from "../../client/components/ui/button";
import { Badge } from "../../client/components/ui/badge";
import { Card } from "../../client/components/ui/card";
import {
  Star,
  Award,
  Shield,
  MapPin,
  Users,
  Calendar,
  Waves,
  Ship,
  Anchor,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const reviews = [
  {
    name: "Rob N",
    text: "We did 4 Discover Scuba Diving courses and 2 Refresher Courses. Chad was awesome with our 4 kids—fun but disciplined. Perfect first dive experience.",
  },
  {
    name: "Travis H",
    text: "Great day diving with KLSD. Beau was an awesome instructor and made us comfortable on our first Keys dive. Team is super knowledgeable.",
  },
  {
    name: "Beth E",
    text: "Highly recommend for learning to dive. Instructors were kind, patient, and thorough. I was given time and guidance to become proficient.",
  },
  {
    name: "Kristen P",
    text: "Another beautiful dive! Chad was amazing and patient. Boat ride was great. The whole experience was incredible—coming back again!",
  },
];

export default function HomeBlueprint1() {
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const scroll = (dir: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.9;
    el.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <div className="min-h-screen bg-white text-foreground">
      <Navigation />

      {/* Premium Hero */}
      <section className="relative min-h-[86vh] pt-24 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1536599018102-9f803c140fc1?q=80&w=1920&auto=format&fit=crop"
          alt="Diver exploring vibrant reef in Key Largo"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />

        <div className="relative z-10 container mx-auto px-4">
          <div className="max-w-3xl">
            <Badge className="bg-white/15 text-white border-white/30 backdrop-blur-sm mb-4">
              Market Leader • Key Largo
            </Badge>
            <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight drop-shadow-md">
              World‑Class Diving. PADI 5‑Star Instruction.
            </h1>
            <p className="text-lg lg:text-xl text-white/90 mt-4 max-w-2xl">
              Discover legendary wrecks and living coral reefs with the Florida
              Keys’ top‑rated dive operation. Small groups, pro instructors,
              modern boats.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild className="bg-coral hover:bg-coral/90 text-white">
                <Link href="/booking-calendar">
                  <Calendar className="w-5 h-5 mr-2" /> See Availability
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                <Link href="/certification">Get PADI Certified</Link>
              </Button>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-6 text-white/90">
              <div>
                <div className="text-3xl font-bold">25+</div>
                <div className="text-sm">Years Leading in the Keys</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-3xl font-bold">
                  <Star className="w-6 h-6 text-coral fill-coral" /> 4.9/5
                </div>
                <div className="text-sm">10,000+ Verified Reviews</div>
              </div>
              <div>
                <div className="text-3xl font-bold">365</div>
                <div className="text-sm">Days of Year‑Round Diving</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Authority Strip */}
      <section className="py-6 border-y border-gray-200/60 bg-white/70 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center text-center">
            <div className="flex flex-col items-center">
              <div className="text-xs uppercase tracking-widest text-gray-500 mb-1">
                Accreditation
              </div>
              <div className="inline-flex items-center gap-2 font-semibold text-gray-900">
                <Award className="w-4 h-4 text-ocean" /> PADI 5‑Star IDC
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-xs uppercase tracking-widest text-gray-500 mb-1">
                Safety
              </div>
              <div className="inline-flex items-center gap-2 font-semibold text-gray-900">
                <Shield className="w-4 h-4 text-coral" /> USCG Inspected
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-xs uppercase tracking-widest text-gray-500 mb-1">
                Sites
              </div>
              <div className="inline-flex items-center gap-2 font-semibold text-gray-900">
                <Waves className="w-4 h-4 text-sage" /> NOAA Sanctuary
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-xs uppercase tracking-widest text-gray-500 mb-1">
                Guests
              </div>
              <div className="inline-flex items-center gap-2 font-semibold text-gray-900">
                <Users className="w-4 h-4 text-ocean" /> 10,000+ 5‑Star Reviews
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The KLSD Difference — editorial modules */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 space-y-20">
          {[
            {
              title: "Instruction at the Highest Standard",
              copy: "Our instructor bench blends decades of ocean time with modern pedagogy. Briefings feel like storyboards; skills are sequenced for confidence, not speed.",
              image:
                "https://images.unsplash.com/photo-1526657782461-9fe13402a841?q=80&w=1600&auto=format&fit=crop",
              reverse: false,
            },
            {
              title: "Boats Built for Divers",
              copy: "Low gunwales, wide ladders, and camera‑friendly rinse systems. Every touchpoint—from staging to surface intervals—is engineered for comfort.",
              image:
                "https://images.unsplash.com/photo-1563245372-f21724e3856b?q=80&w=1600&auto=format&fit=crop",
              reverse: true,
            },
            {
              title: "Access to Legendary Sites",
              copy: "From the Spiegel Grove to the living reefs of Molasses, our daily program gets you to the good stuff efficiently and with respect for the sanctuary.",
              image:
                "https://images.unsplash.com/photo-1520547516939-9d6065b9a2bf?q=80&w=1600&auto=format&fit=crop",
              reverse: false,
            },
          ].map((m, i) => (
            <div
              key={i}
              className={`grid lg:grid-cols-12 gap-10 items-center ${m.reverse ? "lg:[&>div:first-child]:order-last" : ""}`}
            >
              <div className="lg:col-span-5">
                <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
                  {m.title}
                </h2>
                <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                  {m.copy}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <Shield className="w-4 h-4" />
                  <span>Small groups</span>
                  <Waves className="w-4 h-4" />
                  <span>Calm entries</span>
                  <Clock className="w-4 h-4" />
                  <span>Unrushed skills</span>
                </div>
              </div>
              <div className="lg:col-span-7">
                <div className="relative h-[420px] rounded-2xl overflow-hidden shadow-xl">
                  <Image
                    src={m.image}
                    alt={m.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Editorial Testimonials */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <Badge className="mb-3 bg-ocean/10 text-ocean border-ocean/20">
              Guest Voices
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900">
              What Our Divers Remember
            </h2>
            <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
              Moments of calm, clarity, and wonder—guided by instructors who
              care.
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-10">
            {reviews.map((r, i) => (
              <div key={i} className="relative">
                <div className="text-6xl leading-none text-coral/30 absolute -top-6 -left-2">
                  “
                </div>
                <blockquote className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                  <div className="mb-4 flex text-coral">
                    <Star className="w-5 h-5 fill-coral" />
                    <Star className="w-5 h-5 fill-coral" />
                    <Star className="w-5 h-5 fill-coral" />
                    <Star className="w-5 h-5 fill-coral" />
                    <Star className="w-5 h-5 fill-coral" />
                  </div>
                  <p className="text-lg text-gray-800 leading-relaxed">
                    {r.text}
                  </p>
                  <footer className="mt-5 text-sm text-gray-500">
                    — {r.name}, Google
                  </footer>
                </blockquote>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PADI Pathways */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-3 bg-sage/10 text-sage border-sage/20">
              PADI Pathways
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900">
              Your Journey Underwater
            </h2>
            <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
              From first bubbles to pro—structured courses with mentorship and
              measurable outcomes.
            </p>
          </div>
          <div className="relative">
            <div className="flex items-center justify-between mb-8">
              {[
                {
                  step: "1",
                  title: "Discover Scuba",
                  link: "/christ-statue-tour",
                },
                { step: "2", title: "Open Water", link: "/certification" },
                { step: "3", title: "Advanced", link: "/certification" },
                {
                  step: "4",
                  title: "Rescue & Specialty",
                  link: "/certification",
                },
              ].map((s, i) => (
                <Link key={i} href={s.link} className="group">
                  <div className="flex flex-col items-center">
                    <div className="w-11 h-11 rounded-full bg-ocean text-white flex items-center justify-center font-semibold shadow-sm group-hover:scale-105 transition-transform">
                      {s.step}
                    </div>
                    <div className="mt-3 text-sm font-medium text-gray-900">
                      {s.title}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="h-px bg-gray-200" />
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-24 bg-gradient-to-br from-ocean/10 via-white to-sage/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
            Ready to Dive Key Largo?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Reserve your spot with the Keys’ market leader. Transparent pricing,
            pro instructors, unforgettable sites.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild className="bg-coral hover:bg-coral/90 text-white">
              <Link href="/booking-calendar">Book Your Dive</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-ocean text-ocean hover:bg-ocean hover:text-white"
            >
              <Link href="/trips-tours">See Trips & Availability</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
