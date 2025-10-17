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
  Compass,
  CheckCircle2,
  Clock,
  Flashlight,
  LifeBuoy,
  MapPin,
  ShieldCheck,
  Ship,
  Star,
  Waves,
} from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const { yoastMetadataForSlug } = await import("../../../lib/yoast");
  return (await yoastMetadataForSlug(
    "padi-advanced-open-water-diver-certification",
  )) as any;
}

export default async function PadiAdvancedOpenWaterDiverCertificationPage() {
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
    "padi-advanced-open-water-diver-key-largo.jpg",
    "spiegel-grove-wreck-key-largo.jpg",
    "wreck-diving-florida-keys.jpg",
    "florida-keys-learn-to-scuba-dive.jpg",
  ]);

  const wreckImg = await resolveFirst([
    "spiegel-grove-wreck-key-largo.jpg",
    "uscg-duane-wreck-key-largo.jpg",
    "bibb-wreck-key-largo.jpg",
    "wreck-diving-florida-keys.jpg",
  ]);
  const deepImg = await resolveFirst([
    "deep-dive-advanced-open-water.jpg",
    "Florida-keys-try-scuba-diving.jpg",
    "try-scuba-florida-keys-key-largo.jpg",
  ]);
  const navImg = await resolveFirst([
    "underwater-navigation-advanced.jpg",
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
            alt="PADI Advanced Open Water in Key Largo — Wreck & Reef"
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
                <BadgeCheck className="w-3.5 h-3.5" /> PADI Advanced Open Water
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-1">
                <Clock className="w-3.5 h-3.5" /> Typical duration: 2 days
              </span>
            </div>
            <h1 className="mt-4 text-4xl md:text-6xl font-extrabold leading-[1.05] drop-shadow-md">
              PADI Advanced Open Water Diver Certification
            </h1>
            <p className="mt-4 text-lg md:text-xl text-white/90 max-w-2xl">
              Level up your diving with world‑class wrecks and vibrant reefs.
              The Florida Keys are a living classroom for deep, navigation, and
              specialty adventure dives—perfect for your Advanced course.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/trips-tours">
                <Button className="bg-coral hover:bg-coral/90 text-white text-base px-6 py-3">
                  Start Advanced Training
                </Button>
              </Link>
              <Link href="#details">
                <Button
                  variant="outline"
                  className="text-white border-white/60 bg-white/10 hover:bg-white/20"
                >
                  See What’s Included
                </Button>
              </Link>
            </div>
            <div className="mt-6 flex items-center gap-6 text-sm text-white/90">
              <div className="inline-flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-300" /> 4.9/5 from
                advancing divers
              </div>
              <div className="inline-flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-green-300" /> Wreck & deep
                specialists
              </div>
              <div className="inline-flex items-center gap-2">
                <Ship className="w-4 h-4 text-blue-200" /> Spiegel Grove • Duane
                • Bibb
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
                <Ship className="w-5 h-5 text-ocean" />
                <h3 className="font-semibold">World‑Class Wrecks</h3>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Train on iconic wrecks like the Spiegel Grove, USCG Duane, and
                Bibb—ideal sites for deep and wreck adventure dives.
              </p>
            </div>
            <div className="rounded-2xl border p-6">
              <div className="flex items-center gap-3">
                <Compass className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold">Tailored Adventure Dives</h3>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Required: Deep + Navigation. Electives often include Wreck, Peak
                Performance Buoyancy, Night, Drift, or Naturalist.
              </p>
            </div>
            <div className="rounded-2xl border p-6">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-coral" />
                <h3 className="font-semibold">Pro Coaching</h3>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Experienced instructors help you progress safely with modern
                gear and a supportive pace.
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
                Why Advanced in the Keys?
              </h2>
              <p className="mt-4 text-muted-foreground">
                The PADI Advanced Open Water course builds comfort and
                capability through five adventure dives. With calm reefs and
                legendary wrecks, Key Largo offers the perfect environment to
                hone navigation, buoyancy, and deep‑diving skills.
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" /> 5
                  adventure dives over 2 days (Deep + Navigation required)
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />{" "}
                  Popular electives: Wreck, Peak Performance Buoyancy, Night,
                  Drift
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />{" "}
                  Ideal training ground: Spiegel Grove, Duane, Bibb, Benwood
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border p-6 bg-gradient-to-b from-white to-gray-50">
              <h3 className="text-xl font-bold">What’s Included</h3>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="inline-flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-ocean" /> PADI Advanced
                  eLearning
                </div>
                <div className="inline-flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-green-600" /> All premium
                  Scubapro gear
                </div>
                <div className="inline-flex items-center gap-2">
                  <Anchor className="w-4 h-4 text-gray-700" /> Wreck & reef
                  sites (conditions permitting)
                </div>
                <div className="inline-flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-700" /> Flexible 2‑day
                  schedules
                </div>
                <div className="inline-flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-coral" /> Certification
                  processing
                </div>
                <div className="inline-flex items-center gap-2">
                  <Waves className="w-4 h-4 text-blue-600" /> Small groups or
                  private option
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
            How Your Advanced Course Flows
          </h2>
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <div className="rounded-2xl border bg-gradient-to-b from-ocean/10 to-transparent overflow-hidden">
              <div className="relative aspect-[16/9]">
                <img
                  src={navImg}
                  alt="Navigation briefing and buoyancy tune‑up for Advanced"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute top-3 left-3 inline-flex items-center gap-2 bg-white/90 text-gray-900 px-3 py-1 rounded-full text-sm">
                  <Compass className="w-4 h-4 text-ocean" /> Step 1
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold">Briefing + Navigation</h3>
                <p className="mt-3 text-sm text-muted-foreground">
                  Review eLearning, plan dives, then complete the Underwater
                  Navigation adventure dive with compass patterns and natural
                  nav.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border bg-gradient-to-b from-coral/10 to-transparent overflow-hidden">
              <div className="relative aspect-[16/9]">
                <img
                  src={deepImg}
                  alt="Deep adventure dive for Advanced Open Water"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute top-3 left-3 inline-flex items-center gap-2 bg-white/90 text-gray-900 px-3 py-1 rounded-full text-sm">
                  <Anchor className="w-4 h-4 text-gray-700" /> Step 2
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold">Deep + Elective</h3>
                <p className="mt-3 text-sm text-muted-foreground">
                  Make your Deep adventure dive (max 100 ft/30 m) and add a
                  buoyancy or drift elective depending on conditions and goals.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border bg-gradient-to-b from-green-50 to-transparent overflow-hidden">
              <div className="relative aspect-[16/9]">
                <img
                  src={wreckImg}
                  alt="Wreck adventure dive on the Spiegel Grove/Keys"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute top-3 left-3 inline-flex items-center gap-2 bg-white/90 text-gray-900 px-3 py-1 rounded-full text-sm">
                  <Ship className="w-4 h-4 text-ocean" /> Step 3
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold">
                  Wreck/Night + Capstone
                </h3>
                <p className="mt-3 text-sm text-muted-foreground">
                  Finish with a Wreck adventure dive on a famous Keys wreck or
                  opt for a Night dive—your instructor will tailor the plan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course options */}
      <section className="py-14 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Choose Your Course Format
          </h2>
          <div className="mt-6 grid md:grid-cols-3 gap-6">
            <div className="rounded-2xl border p-6 bg-gradient-to-b from-white to-gray-50">
              <h3 className="text-lg font-semibold">Small Group</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Efficient, social, and budget‑friendly—perfect balance of
                coaching and independence.
              </p>
              <p className="mt-3 inline-flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-600" /> Max 4–6 per
                instructor
              </p>
              <div className="mt-5">
                <Link href="/trips-tours">
                  <Button className="w-full bg-ocean hover:bg-ocean/90 text-white">
                    See Dates
                  </Button>
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border p-6 bg-gradient-to-b from-white to-gray-50">
              <h3 className="text-lg font-semibold">Private Course</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Personalized schedule and pace—great for couples, families, or
                specific training goals.
              </p>
              <p className="mt-3 inline-flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-600" /> Tailored
                electives
              </p>
              <div className="mt-5">
                <Link href="/trips-tours">
                  <Button className="w-full bg-ocean hover:bg-ocean/90 text-white">
                    Request Private
                  </Button>
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border p-6 bg-gradient-to-b from-white to-gray-50">
              <h3 className="text-lg font-semibold">Wreck‑Focused Track</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Prioritize Deep, Navigation, and Wreck adventure dives on
                premier Keys wrecks (conditions permitting).
              </p>
              <p className="mt-3 inline-flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-600" /> Spiegel
                Grove • Duane • Bibb
              </p>
              <div className="mt-5">
                <Link href="/trips-tours">
                  <Button className="w-full bg-ocean hover:bg-ocean/90 text-white">
                    Plan Wreck Track
                  </Button>
                </Link>
              </div>
            </div>
          </div>
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
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" /> PADI
              Open Water Diver (or equivalent)
            </li>
            <li className="inline-flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" /> Age 12+
              (Junior Advanced for 12–14)
            </li>
            <li className="inline-flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" /> Good
              health; medical questionnaire (doctor’s clearance may be needed)
            </li>
            <li className="inline-flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" /> Recent
              diving or refresher recommended if it’s been a while
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
              Ready for Advanced Adventures?
            </h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Train on legendary Florida Keys wrecks and reefs with friendly
              pros. Build confidence, extend your limits, and unlock new dive
              sites worldwide.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/trips-tours">
                <Button className="bg-coral hover:bg-coral/90 text-white px-6">
                  Start Advanced
                </Button>
              </Link>
              <Link href="/trips-tours">
                <Button variant="outline">View Schedule</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
