import Link from "next/link";
import { Navigation } from "../../../client/components/Navigation";
import { Footer } from "../../../client/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Anchor,
  Award,
  BadgeCheck,
  Calendar,
  CheckCircle2,
  Clock,
  LifeBuoy,
  MapPin,
  ShieldCheck,
  Star,
  Target,
  Waves,
} from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const { yoastMetadataForSlug } = await import("../../../lib/yoast");
  return (await yoastMetadataForSlug("refresher-course")) as any;
}

export default async function RefresherCoursePage() {
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

  const heroSrc = await resolveFirst([
    "padi-refresher-course-key-largo.jpg",
    "florida-keys-learn-to-scuba-dive.jpg",
    "discover-scuba-diving-try-scuba.jpg",
  ]);

  const poolImg = await resolveFirst([
    "try-scuba-diving-in-florida-keys.jpg",
    "discover-scuba-diving-try-scuba.jpg",
    "florida-keys-learn-to-scuba-dive.jpg",
  ]);
  const skillsImg = await resolveFirst([
    "florida-keys-learn-to-scuba-dive.jpg",
    "Try-scuba-diving-diver-key-largo.jpg",
    "Florida-keys-try-scuba-diving.jpg",
  ]);
  const oceanImg = await resolveFirst([
    "Florida-keys-try-scuba-diving.jpg",
    "try-scuba-florida-keys-key-largo.jpg",
    "Try-scuba-diving-diver-key-largo.jpg",
  ]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      {/* Hero */}
      <section className="relative z-0 overflow-hidden pt-28 pb-16 min-h-[60vh]">
        <div className="absolute inset-0 z-0">
          <img
            src={heroSrc}
            alt="Scuba Refresher Course in Key Largo"
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
                <Target className="w-3.5 h-3.5" /> Refresh Your Skills
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-1">
                <Clock className="w-3.5 h-3.5" /> Half‑day or full‑day options
              </span>
            </div>
            <h1 className="mt-4 text-4xl md:text-6xl font-extrabold leading-[1.05] drop-shadow-md">
              Refresher Course
            </h1>
            <p className="mt-4 text-lg md:text-xl text-white/90 max-w-2xl">
              Get back into diving with confidence. Our pro instructors tailor a
              focused skill review and buoyancy tune‑up—then take you for
              relaxed reef dives to rediscover the magic of the Keys.
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
                <Star className="w-4 h-4 text-yellow-300" /> 4.9/5 from
                returning divers
              </div>
              <div className="inline-flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-green-300" /> Patient,
                safety‑first coaching
              </div>
              <div className="inline-flex items-center gap-2">
                <Waves className="w-4 h-4 text-blue-200" /> Calm, clear reef
                sites
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border p-6">
              <div className="flex items-center gap-3">
                <LifeBuoy className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold">Confidence Rebuilt</h3>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Hands‑on skills review with an experienced instructor at your
                pace.
              </p>
            </div>
            <div className="rounded-2xl border p-6">
              <div className="flex items-center gap-3">
                <BadgeCheck className="w-5 h-5 text-ocean" />
                <h3 className="font-semibold">Buoyancy & Trim Tune‑Up</h3>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Dial in weighting and buoyancy for effortless, enjoyable dives.
              </p>
            </div>
            <div className="rounded-2xl border p-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-coral" />
                <h3 className="font-semibold">Flexible Scheduling</h3>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Available year‑round with half‑day pool + ocean options.
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
                What Is the Refresher?
              </h2>
              <p className="mt-4 text-muted-foreground">
                Haven’t been diving in a while? This focused program gets you
                comfortable and current again. Review essential skills in calm,
                shallow water, fine‑tune buoyancy and gear setup, then enjoy
                relaxed reef dives with your instructor.
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />{" "}
                  Ideal if it’s been 6–12+ months since your last dive
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />{" "}
                  Personalized coaching at an easy pace
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />{" "}
                  Optional ocean dives to ease back in
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border p-6 bg-gradient-to-b from-white to-gray-50">
              <h3 className="text-xl font-bold">What’s Included</h3>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="inline-flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-green-600" /> Pro
                  instructor guidance
                </div>
                <div className="inline-flex items-center gap-2">
                  <LifeBuoy className="w-4 h-4 text-green-600" />{" "}
                  Pool/Confined‑water skills tune‑up
                </div>
                <div className="inline-flex items-center gap-2">
                  <Waves className="w-4 h-4 text-blue-600" /> Optional ocean
                  dives
                </div>
                <div className="inline-flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-700" /> Half‑day or
                  full‑day format
                </div>
                <div className="inline-flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-coral" /> Safety & gear
                  review
                </div>
                <div className="inline-flex items-center gap-2">
                  <Anchor className="w-4 h-4 text-gray-700" /> Premium Scubapro
                  rental gear
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

      {/* Flow */}
      <section className="py-14 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            How Your Refresher Flows
          </h2>
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <div className="rounded-2xl border bg-gradient-to-b from-green-50 to-transparent overflow-hidden">
              <div className="relative aspect-[16/9]">
                <img
                  src={poolImg}
                  alt="Pool skills review and buoyancy tune-up"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute top-3 left-3 inline-flex items-center gap-2 bg-white/90 text-gray-900 px-3 py-1 rounded-full text-sm">
                  <LifeBuoy className="w-4 h-4 text-green-600" /> Step 1
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold">
                  Skill Review in Confined Water
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />{" "}
                    Mask/regulator clearing, sharing air, buoyancy drills
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />{" "}
                    Weights and trim for comfort
                  </li>
                </ul>
              </div>
            </div>

            <div className="rounded-2xl border bg-gradient-to-b from-ocean/10 to-transparent overflow-hidden">
              <div className="relative aspect-[16/9]">
                <img
                  src={skillsImg}
                  alt="Gear setup and safety review"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute top-3 left-3 inline-flex items-center gap-2 bg-white/90 text-gray-900 px-3 py-1 rounded-full text-sm">
                  <BadgeCheck className="w-4 h-4 text-ocean" /> Step 2
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold">Gear & Safety Check</h3>
                <p className="mt-3 text-sm text-muted-foreground">
                  Refresh pre‑dive checks, hand signals, ascent procedures, and
                  local site briefing.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border bg-gradient-to-b from-coral/10 to-transparent overflow-hidden">
              <div className="relative aspect-[16/9]">
                <img
                  src={oceanImg}
                  alt="Optional ocean dives on Florida Keys reefs"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute top-3 left-3 inline-flex items-center gap-2 bg-white/90 text-gray-900 px-3 py-1 rounded-full text-sm">
                  <Anchor className="w-4 h-4 text-gray-700" /> Step 3
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold">Optional Ocean Dives</h3>
                <p className="mt-3 text-sm text-muted-foreground">
                  Put refreshed skills into practice with relaxed reef dives
                  alongside your instructor.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-14 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Who It’s For
          </h2>
          <ul className="mt-6 grid sm:grid-cols-2 gap-3 text-sm">
            <li className="inline-flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />{" "}
              Certified divers looking to get back in the water
            </li>
            <li className="inline-flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" /> Great
              before a trip or after time away
            </li>
            <li className="inline-flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" /> Bring
              your certification card (or number)
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
              Ready to Get Back Into Diving?
            </h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              We’ll get you comfortable, confident, and excited for your next
              dive—at your pace, with a friendly pro by your side.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/trips-tours">
                <Button className="bg-coral hover:bg-coral/90 text-white px-6">
                  See Availability
                </Button>
              </Link>
              <Link href="/trips-tours">
                <Button variant="outline">Plan Your Refresher</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
