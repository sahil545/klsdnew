import Link from "next/link";
import { Navigation } from "../../../client/components/Navigation";
import { Footer } from "../../../client/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Anchor,
  Award,
  BadgeCheck,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  FileCheck2,
  LifeBuoy,
  MapPin,
  ShieldCheck,
  Star,
  Users,
  Waves,
} from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const { yoastMetadataForSlug } = await import("../../../lib/yoast");
  return (await yoastMetadataForSlug("open-water-referral-dives")) as any;
}

export default async function OpenWaterReferralDivesPage() {
  const { getWpImageUrlByFilename } = await import(
    "../../../client/lib/wp-media"
  );

  async function resolveFirst(filenames: string[]): Promise<string> {
    for (const f of filenames) {
      const u = await getWpImageUrlByFilename(f);
      if (u) return u;
    }
    return "/placeholder.svg";
  }

  const preferredHeroLocal = "/Open-water-referral-check-out-dives.jpg";
  const heroResolved = await resolveFirst([
    "Open-water-referral-check-out-dives.jpg",
    "open-water-referral-dives-key-largo.jpg",
    "padi-open-water-diver-key-largo.jpg",
    "florida-keys-learn-to-scuba-dive.jpg",
  ]);
  const heroSrc = heroResolved === "/placeholder.svg" ? preferredHeroLocal : heroResolved;

  const paperworkImg = await resolveFirst([
    "padi-referral-paperwork.jpg",
    "florida-keys-learn-to-scuba-dive.jpg",
    "discover-scuba-diving-try-scuba.jpg",
  ]);
  const oceanImg = await resolveFirst([
    "Florida-keys-try-scuba-diving.jpg",
    "try-scuba-florida-keys-key-largo.jpg",
    "Try-scuba-diving-diver-key-largo.jpg",
  ]);
  const gearImg = await resolveFirst([
    "try-scuba-diving-in-florida-keys.jpg",
    "discover-scuba-diving-try-scuba.jpg",
    "florida-keys-learn-to-scuba-dive.jpg",
  ]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      {/* Hero */}
      <section className="relative z-0 overflow-hidden pt-28 pb-16 min-h-[60vh]">
        <div className="absolute inset-0 z-0">
          <img
            src={heroSrc}
            alt="Open Water Referral Dives in Key Largo"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl text-white">
            <div className="flex flex-wrap items-center gap-2 text-xs text-white/90">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-1">
                <MapPin className="w-3.5 h-3.5" /> Key Largo, Florida Keys
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-1">
                <BadgeCheck className="w-3.5 h-3.5" /> PADI Referral Dives
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-1">
                <Calendar className="w-3.5 h-3.5" /> 365 days per year
              </span>
            </div>
            <h1 className="mt-4 text-4xl md:text-6xl font-extrabold leading-[1.05] drop-shadow-md">
              Open Water Referral Dives
            </h1>
            <p className="mt-4 text-lg md:text-xl text-white/90 max-w-2xl">
              Finish your PADI Open Water certification in the Dive Capital of
              the World. We partner with PADI shops worldwide—bring your
              referral paperwork and complete your four ocean checkout dives on
              our coral reefs. All rental gear included.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/trips-tours">
                <Button className="bg-coral hover:bg-coral/90 text-white text-base px-6 py-3">
                  See Dates & Availability
                </Button>
              </Link>
              <Link href="#details">
                <Button
                  variant="outline"
                  className="text-white border-white/60 bg-white/10 hover:bg-white/20"
                >
                  What’s Included
                </Button>
              </Link>
            </div>
            <div className="mt-6 flex items-center gap-6 text-sm text-white/90">
              <div className="inline-flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-300" /> 4.9/5 from 1,000+
                divers
              </div>
              <div className="inline-flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-green-300" />{" "}
                PADI‑certified pros
              </div>
              <div className="inline-flex items-center gap-2">
                <Waves className="w-4 h-4 text-blue-200" /> Calm, clear reef
                sites
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof & highlights */}
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border p-6">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-ocean" />
                <h3 className="font-semibold">Global PADI Partnerships</h3>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                We work with PADI shops around the world—bring your Referral
                Form and we’ll complete your checkout dives.
              </p>
            </div>
            <div className="rounded-2xl border p-6">
              <div className="flex items-center gap-3">
                <LifeBuoy className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold">All Gear Included</h3>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Premium Scubapro rental gear for every diver—no extra fees for
                basics.
              </p>
            </div>
            <div className="rounded-2xl border p-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-coral" />
                <h3 className="font-semibold">Daily Scheduling</h3>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Check‑out dives available 365 days per year—finish in as little
                as two days.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What it is + What’s included */}
      <section id="details" className="py-14 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-10 items-start">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                What Are Referral Dives?
              </h2>
              <p className="mt-4 text-muted-foreground">
                If you’ve already finished the PADI eLearning and confined‑water
                sessions with your local shop, you can complete the four
                required open‑water checkout dives with us in Key Largo. We’ll
                verify your Referral paperwork, review key skills, and guide you
                through ocean dives on protected reefs.
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />{" "}
                  Accepted from any PADI shop worldwide
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />{" "}
                  Typically completed over 2 days (2 dives/day)
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />{" "}
                  Friendly, pro instructors focused on comfort and safety
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border p-6 bg-gradient-to-b from-white to-gray-50">
              <h3 className="text-xl font-bold">What’s Included</h3>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="inline-flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-ocean" /> Referral
                  paperwork review
                </div>
                <div className="inline-flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-green-600" /> All
                  Scubapro rental gear
                </div>
                <div className="inline-flex items-center gap-2">
                  <LifeBuoy className="w-4 h-4 text-green-600" /> Skill refresh
                  & briefing
                </div>
                <div className="inline-flex items-center gap-2">
                  <Anchor className="w-4 h-4 text-gray-700" /> Four ocean
                  checkout dives
                </div>
                <div className="inline-flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-700" /> Flexible daily
                  schedules
                </div>
                <div className="inline-flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-coral" /> Certification
                  processing
                </div>
              </div>
              <div className="mt-6">
                <Link href="/trips-tours">
                  <Button className="w-full bg-ocean hover:bg-ocean/90 text-white">
                    See Dates & Pricing
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-14 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            How It Works
          </h2>
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <div className="rounded-2xl border bg-gradient-to-b from-ocean/10 to-transparent overflow-hidden">
              <div className="relative aspect-[16/9]">
                <img
                  src={paperworkImg}
                  alt="PADI Referral paperwork check"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute top-3 left-3 inline-flex items-center gap-2 bg-white/90 text-gray-900 px-3 py-1 rounded-full text-sm">
                  <BookOpen className="w-4 h-4 text-ocean" /> Step 1
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold">
                  Bring Your Referral Form
                </h3>
                <p className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <span className="block">
                    We’ll verify your PADI Referral paperwork and confirm
                    completed skills.
                  </span>
                  <span className="block">
                    Meet your instructor and get fitted for gear.
                  </span>
                </p>
              </div>
            </div>

            <div className="rounded-2xl border bg-gradient-to-b from-green-50 to-transparent overflow-hidden">
              <div className="relative aspect-[16/9]">
                <img
                  src={gearImg}
                  alt="Gear fitting and skills review"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute top-3 left-3 inline-flex items-center gap-2 bg-white/90 text-gray-900 px-3 py-1 rounded-full text-sm">
                  <LifeBuoy className="w-4 h-4 text-green-600" /> Step 2
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold">
                  Briefing & Skill Refresh
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />{" "}
                    Buoyancy, equalizing, mask/regulator skills
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />{" "}
                    Safety procedures & local site orientation
                  </li>
                </ul>
              </div>
            </div>

            <div className="rounded-2xl border bg-gradient-to-b from-coral/10 to-transparent overflow-hidden">
              <div className="relative aspect-[16/9]">
                <img
                  src={oceanImg}
                  alt="Ocean checkout dives on Key Largo reefs"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute top-3 left-3 inline-flex items-center gap-2 bg-white/90 text-gray-900 px-3 py-1 rounded-full text-sm">
                  <Anchor className="w-4 h-4 text-gray-700" /> Step 3
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold">
                  Make Four Ocean Checkout Dives
                </h3>
                <p className="mt-3 text-sm text-muted-foreground">
                  Complete two dives per day over two days. Once finished, we
                  process your certification so you’re a certified PADI Open
                  Water Diver.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dive into the Details */}
      <section className="py-14 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Dive into the Details</h2>
          <p className="mt-3 text-muted-foreground">These are the skills that you will practice in the pool and then complete with us in the ocean.</p>
          <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              "Scuba Mask Clearing",
              "Gear Kit Assembly",
              "Predive Safety Check",
              "Buoyancy Check",
              "Weight Check",
              "Regulator Recovery",
              "Regulator Recovery",
              "Emergency Ascent",
              "Remove & Replace Weights",
              "Remove & Replace Gear",
              "Controlled Descent",
              "Controlled Ascent",
              "Alternate Air Source Use",
              "Free Descent",
              "Cramp Removal",
              "Tired Diver Tow",
              "Surface Swim With Compass",
              "Snorkel Regulator Exchange",
              "Underwater Compass Navigation",
            ].map((item) => (
              <li key={item} className="inline-flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Prerequisites */}
      <section className="py-14 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Requirements & Prerequisites
          </h2>
          <ul className="mt-6 grid sm:grid-cols-2 gap-3 text-sm">
            <li className="inline-flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />{" "}
              Completed PADI eLearning and confined‑water sessions
            </li>
            <li className="inline-flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" /> PADI
              Referral paperwork from your originating shop
            </li>
            <li className="inline-flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" /> Age 10+
              (Junior Open Water 10–14; 15+ earns full Open Water)
            </li>
            <li className="inline-flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" /> PADI
              Medical Questionnaire; physician clearance if required
            </li>
          </ul>
          <div className="mt-6">
            <Link href="/contact">
              <Button variant="outline">Questions? Contact Us</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-14 bg-white">
        <div className="container mx-auto px-4">
          <div className="rounded-2xl border p-8 text-center bg-gradient-to-b from-gray-50 to-white">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Ready to Finish Your Certification?
            </h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Join us in Key Largo to complete your checkout dives with friendly
              PADI pros. We make the process smooth, safe, and fun—year‑round.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/trips-tours">
                <Button className="bg-coral hover:bg-coral/90 text-white px-6">
                  See Availability
                </Button>
              </Link>
              <Link href="/trips-tours">
                <Button variant="outline">Plan Your Trip</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
