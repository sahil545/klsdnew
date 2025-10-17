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
  LifeBuoy,
  MapPin,
  ShieldCheck,
  Siren,
  Star,
  Users,
  Waves,
} from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const { yoastMetadataForSlug } = await import("../../../lib/yoast");
  return (await yoastMetadataForSlug("rescue-diver-certification")) as any;
}

export default async function RescueDiverCertificationPage() {
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
    "padi-rescue-diver-key-largo.jpg",
    "rescue-diver-training-key-largo.jpg",
    "florida-keys-learn-to-scuba-dive.jpg",
  ]);

  const confinedImg = await resolveFirst([
    "rescue-skills-confined-water.jpg",
    "try-scuba-diving-in-florida-keys.jpg",
    "discover-scuba-diving-try-scuba.jpg",
  ]);
  const scenarioImg = await resolveFirst([
    "open-water-rescue-scenario.jpg",
    "Florida-keys-try-scuba-diving.jpg",
    "try-scuba-florida-keys-key-largo.jpg",
  ]);
  const oxygenImg = await resolveFirst([
    "oxygen-kit-rescue-diver.jpg",
    "florida-keys-learn-to-scuba-dive.jpg",
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
            alt="PADI Rescue Diver in Key Largo"
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
                <BadgeCheck className="w-3.5 h-3.5" /> PADI Rescue Diver
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-1">
                <Clock className="w-3.5 h-3.5" /> Typical duration: 2 days (+
                EFR if needed)
              </span>
            </div>
            <h1 className="mt-4 text-4xl md:text-6xl font-extrabold leading-[1.05] drop-shadow-md">
              Rescue Diver Certification
            </h1>
            <p className="mt-4 text-lg md:text-xl text-white/90 max-w-2xl">
              Become the buddy everyone wants to dive with. Learn to prevent
              problems, manage stress, and respond effectively���building real
              confidence for every dive.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/trips-tours">
                <Button className="bg-coral hover:bg-coral/90 text-white text-base px-6 py-3">
                  Start Rescue Training
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
                graduates
              </div>
              <div className="inline-flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-green-300" />{" "}
                Scenario‑based coaching
              </div>
              <div className="inline-flex items-center gap-2">
                <LifeBuoy className="w-4 h-4 text-blue-200" /> Skills you’ll
                actually use
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
                <Users className="w-5 h-5 text-ocean" />
                <h3 className="font-semibold">Real‑World Confidence</h3>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Learn to recognize stress, prevent incidents, and assist calmly
                and effectively in the water.
              </p>
            </div>
            <div className="rounded-2xl border p-6">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-coral" />
                <h3 className="font-semibold">Scenario Training</h3>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Practice missing‑diver searches, panicked diver assists, exits,
                tows, and unresponsive diver response.
              </p>
            </div>
            <div className="rounded-2xl border p-6">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold">Safety‑First Approach</h3>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Patient instructors, clear briefings, and a supportive pace
                tailored to you.
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
                What You’ll Learn
              </h2>
              <p className="mt-4 text-muted-foreground">
                The PADI Rescue Diver course teaches self‑rescue, recognizing
                and managing diver stress, assisting tired/panicked divers,
                responding to unresponsive divers, and organizing emergency
                response at the surface and underwater.
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />{" "}
                  Surface and underwater problem management
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />{" "}
                  Missing‑diver search patterns and lifts
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />{" "}
                  Tows, exits, and oxygen/first‑aid considerations
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border p-6 bg-gradient-to-b from-white to-gray-50">
              <h3 className="text-xl font-bold">What’s Included</h3>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="inline-flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-ocean" /> PADI eLearning
                </div>
                <div className="inline-flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-green-600" /> All premium
                  Scubapro gear
                </div>
                <div className="inline-flex items-center gap-2">
                  <LifeBuoy className="w-4 h-4 text-green-600" /> Confined‑water
                  skill sessions
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
                  <Waves className="w-4 h-4 text-blue-600" /> Optional add‑on:
                  EFR (First Aid/CPR)
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
            How Your Rescue Course Flows
          </h2>
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <div className="rounded-2xl border bg-gradient-to-b from-ocean/10 to-transparent overflow-hidden">
              <div className="relative aspect-[16/9]">
                <img
                  src={oxygenImg}
                  alt="Rescue Diver eLearning and EFR overview"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute top-3 left-3 inline-flex items-center gap-2 bg-white/90 text-gray-900 px-3 py-1 rounded-full text-sm">
                  <BookOpen className="w-4 h-4 text-ocean" /> Step 1
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold">
                  eLearning + EFR (Optional Add‑On)
                </h3>
                <p className="mt-3 text-sm text-muted-foreground">
                  Complete Rescue eLearning. If you need current first‑aid/CPR,
                  add the EFR course (required within 24 months).
                </p>
              </div>
            </div>

            <div className="rounded-2xl border bg-gradient-to-b from-green-50 to-transparent overflow-hidden">
              <div className="relative aspect-[16/9]">
                <img
                  src={confinedImg}
                  alt="Confined‑water rescue skills and practice"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute top-3 left-3 inline-flex items-center gap-2 bg-white/90 text-gray-900 px-3 py-1 rounded-full text-sm">
                  <LifeBuoy className="w-4 h-4 text-green-600" /> Step 2
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold">Confined‑Water Skills</h3>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />{" "}
                    Assists, tows, exits, and stress recognition
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />{" "}
                    Unresponsive diver at surface practice
                  </li>
                </ul>
              </div>
            </div>

            <div className="rounded-2xl border bg-gradient-to-b from-coral/10 to-transparent overflow-hidden">
              <div className="relative aspect-[16/9]">
                <img
                  src={scenarioImg}
                  alt="Open‑water rescue scenarios and search patterns"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute top-3 left-3 inline-flex items-center gap-2 bg-white/90 text-gray-900 px-3 py-1 rounded-full text-sm">
                  <Siren className="w-4 h-4 text-coral" /> Step 3
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold">Open‑Water Scenarios</h3>
                <p className="mt-3 text-sm text-muted-foreground">
                  Conduct missing‑diver searches, manage unresponsive diver
                  scenarios, coordinate help, and debrief with your instructor.
                </p>
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
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />{" "}
              Advanced Open Water (or Adventure Diver with Navigation)
            </li>
            <li className="inline-flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" /> EFR
              Primary & Secondary Care within 24 months (can be taken with us)
            </li>
            <li className="inline-flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" /> Age 12+
              (Junior Rescue for 12–14)
            </li>
            <li className="inline-flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" /> Good
              health; medical questionnaire (doctor’s clearance may be needed)
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
              Ready to Lead with Confidence?
            </h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Build skills that make every dive safer and more enjoyable—for you
              and your buddies. Train with supportive pros in the Florida Keys.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/trips-tours">
                <Button className="bg-coral hover:bg-coral/90 text-white px-6">
                  Start Rescue
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
