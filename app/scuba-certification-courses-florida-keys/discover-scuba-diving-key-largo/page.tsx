import Link from "next/link";
import { Navigation } from "../../../client/components/Navigation";
import { Footer } from "../../../client/components/Footer";
import StickyPackagesBar from "../../components/StickyPackagesBar";
import { SupabaseImage } from "../../../components/SupabaseImage";
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
  Users,
  Waves,
} from "lucide-react";

const STATIC_MEDIA_FALLBACKS: Record<string, string> = {
  "try-scuba-diving-in-florida-keys.jpg":
    "https://keylargoscubadiving.com/wp-content/uploads/2023/03/try-scuba-diving-in-florida-keys.jpg",
  "florida-keys-learn-to-scuba-dive.jpg":
    "https://keylargoscubadiving.com/wp-content/uploads/2023/03/florida-keys-learn-to-scuba-dive.jpg",
  "discover-scuba-diving-try-scuba.jpg":
    "https://keylargoscubadiving.com/wp-content/uploads/2023/03/discover-scuba-diving-try-scuba.jpg",
  "florida-keys-try-scuba-diving.jpg":
    "https://keylargoscubadiving.com/wp-content/uploads/2023/03/florida-keys-try-scuba-diving.jpg",
  "try-scuba-florida-keys-key-largo.jpg":
    "https://keylargoscubadiving.com/wp-content/uploads/2023/03/try-scuba-florida-keys-key-largo.jpg",
  "try-scuba-diving-diver-key-largo.jpg":
    "https://keylargoscubadiving.com/wp-content/uploads/2023/03/try-scuba-diving-diver-key-largo.jpg",
  "dive-in-one-day-molasses-reef-key-largo-florida.jpg":
    "https://keylargoscubadiving.com/wp-content/uploads/2023/03/dive-in-one-day-molasses-reef-key-largo-florida.jpg",
  "discover-scuba-diving-french-reef-key-largo-florida.jpg":
    "https://keylargoscubadiving.com/wp-content/uploads/2023/03/discover-scuba-diving-french-reef-key-largo-florida.jpg",
  "try-scuba-diving-pickles-reef-key-largo-florida.jpg":
    "https://keylargoscubadiving.com/wp-content/uploads/2023/03/try-scuba-diving-pickles-reef-key-largo-florida.jpg",
  "try-scuba-diving-sand-island-key-largo-florida.jpg":
    "https://keylargoscubadiving.com/wp-content/uploads/2023/03/try-scuba-diving-sand-island-key-largo-florida.jpg",
};

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const { yoastMetadataForSlug } = await import("../../../lib/yoast");
  return (await yoastMetadataForSlug("discover-scuba-diving-key-largo")) as any;
}

export default async function DiscoverScubaDivingKeyLargoPage() {
  const { getWpImageUrlByFilename } = await import(
    "../../../client/lib/wp-media"
  );
  const heroSrc =
    (await getWpImageUrlByFilename("try-scuba-diving-key-largo.jpg")) ||
    "https://keylargoscubadiving.com/wp-content/uploads/2023/08/try-scuba-diving-key-largo.jpg";

  async function resolveFirst(filenames: string[]): Promise<string> {
    for (const f of filenames) {
      const u = await getWpImageUrlByFilename(f);
      if (u) return u;
    }
    for (const f of filenames) {
      const fallback = STATIC_MEDIA_FALLBACKS[f.toLowerCase()];
      if (fallback) return fallback;
    }
    return "/placeholder.svg";
  }

  const poolImg = await resolveFirst([
    "try-scuba-diving-in-florida-keys.jpg",
    "florida-keys-learn-to-scuba-dive.jpg",
    "discover-scuba-diving-try-scuba.jpg",
  ]);
  const oceanImg = await resolveFirst([
    "Florida-keys-try-scuba-diving.jpg",
    "try-scuba-florida-keys-key-largo.jpg",
    "Try-scuba-diving-diver-key-largo.jpg",
  ]);
  const preArrivalImg = await resolveFirst([
    "discover-scuba-diving-try-scuba.jpg",
    "try-scuba-florida-keys-key-largo.jpg",
    "try-scuba-diving-in-florida-keys.jpg",
  ]);
  const classroomImg = await resolveFirst([
    "florida-keys-learn-to-scuba-dive.jpg",
    "Try-scuba-diving-diver-key-largo.jpg",
    "Florida-keys-try-scuba-diving.jpg",
  ]);

  // Package card images
  const pkgStandardImg = await resolveFirst([
    "discover-scuba-diving-try-scuba.jpg",
    "try-scuba-diving-in-florida-keys.jpg",
    "florida-keys-learn-to-scuba-dive.jpg",
  ]);
  const pkgPrivateImg = await resolveFirst([
    "Try-scuba-diving-diver-key-largo.jpg",
    "try-scuba-florida-keys-key-largo.jpg",
    "Florida-keys-try-scuba-diving.jpg",
  ]);
  const pkgPrivateBoatImg = await resolveFirst([
    "Florida-keys-try-scuba-diving.jpg",
    "try-scuba-florida-keys-key-largo.jpg",
    "discover-scuba-diving-try-scuba.jpg",
  ]);

  // Beginner-friendly sites images from WordPress
  const molassesSiteImg = await resolveFirst([
    "dive-in-one-day-molasses-reef-key-largo-florida.jpg",
    "Dive-in-one-day-molasses-reef-key-largo-florida.jpg",
  ]);
  const frenchReefImg = await resolveFirst([
    "Discover-scuba-diving-French-Reef-Key-Largo-Florida.jpg",
    "discover-scuba-diving-french-reef-key-largo-florida.jpg",
  ]);
  const picklesReefImg = await resolveFirst([
    "try-scuba-diving-pickles-reef-key-largo-florida.jpg",
    "Try-scuba-diving-pickles-reef-key-largo-florida.jpg",
  ]);
  const sandIslandImg = await resolveFirst([
    "Try-scuba-diving-Sand-Island-key-largo-florida.jpg",
    "try-scuba-diving-sand-island-key-largo-florida.jpg",
  ]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      {/* Hero */}
      <section className="relative z-0 overflow-hidden pt-28 pb-16 min-h-[60vh]">
        <div className="absolute inset-0 z-0">
          <SupabaseImage
            sourceUrl={heroSrc}
            alt="Discover Scuba Diving in Key Largo"
            width={1920}
            height={1080}
            className="h-full w-full object-cover"
            priority
            sizes="100vw"
            namespace="wordpress"
            breakpoints={[640, 1024, 1440, 1920]}
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
                <BadgeCheck className="w-3.5 h-3.5" /> No experience required
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-1">
                <Clock className="w-3.5 h-3.5" /> Half‑day experience
              </span>
            </div>
            <h1 className="mt-4 text-4xl md:text-6xl font-extrabold leading-[1.05] drop-shadow-md">
              Discover Scuba Diving in Key Largo
            </h1>
            <p className="mt-4 text-lg md:text-xl text-white/90 max-w-2xl">
              Try scuba in the “Dive Capital of the World.” Learn basics in
              shallow water, then explore vibrant coral reefs with a pro—no
              certification required.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="#packages">
                <Button className="bg-coral hover:bg-coral/90 text-white text-base px-6 py-3">
                  View Packages
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

      {/* Social proof & guarantees */}
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border p-6">
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-yellow-500" />
                <h3 className="font-semibold">Top‑Rated in the Keys</h3>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                5‑star reviews from first‑time divers and families from all
                around the world.
              </p>
            </div>
            <div className="rounded-2xl border p-6">
              <div className="flex items-center gap-3">
                <LifeBuoy className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold">Safety First</h3>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Small groups, New Scubapro Gear, and Professional PADI Scuba
                Instructors with you the entire way.
              </p>
            </div>
            <div className="rounded-2xl border p-6">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-ocean" />
                <h3 className="font-semibold">Trusted PADI Partner</h3>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Start your PADI Journey here and easily continue to Open Water
                Scuba Certification.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What is Discover Scuba + What’s included */}
      <section id="details" className="py-14 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-10 items-start">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                What Is Discover Scuba Diving?
              </h2>
              <p className="mt-4 text-muted-foreground">
                It’s a beginner friendly introduction to scuba diving. You’ll
                practice essential skills in the pool that include breathing
                underwater, equalizing, mask clearing, buoyancy, and more. After
                the pool you and your instructor will head out to the coral
                reefs for 2 supervised dives with your instructor. No exams, No
                Previous Experience, No Gear Purchases, No Pressure! Choose to
                snorkel at anytime,
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />{" "}
                  Ages 10+ welcome (great for families)
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />{" "}
                  Small groups or private options
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" /> All
                  premium Scubapro gear included
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border p-6 bg-gradient-to-b from-white to-gray-50">
              <h3 className="text-xl font-bold">What’s Included</h3>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="inline-flex items-center gap-2">
                  <Users className="w-4 h-4 text-ocean" /> Pro instructor
                </div>
                <div className="inline-flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-green-600" /> All gear &
                  safety briefing
                </div>
                <div className="inline-flex items-center gap-2">
                  <Waves className="w-4 h-4 text-blue-600" /> Pool or
                  shallow‑water practice
                </div>
                <div className="inline-flex items-center gap-2">
                  <Anchor className="w-4 h-4 text-gray-700" /> Boat trip to reef
                </div>
                <div className="inline-flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-700" /> 3–4 hours total
                </div>
                <div className="inline-flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-700" /> Daily
                  departures
                </div>
              </div>
              <div className="mt-6">
                <Link href="#packages">
                  <Button className="w-full bg-ocean hover:bg-ocean/90 text-white">
                    View Packages
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How Your Day Flows - moved above pool/ocean */}
      <section className="py-14 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            How Your Day Flows
          </h2>
          <div className="mt-6 grid md:grid-cols-4 gap-6">
            {[
              {
                title: "Check‑in & Gear",
                text: "Meet your instructor, get fitted with your gear, and learn the plan.",
                icon: <BadgeCheck className="w-5 h-5 text-ocean" />,
              },
              {
                title: "Basics in Shallow Water",
                text: "Practice breathing, buoyancy, and hand signals in calm, shallow water.",
                icon: <LifeBuoy className="w-5 h-5 text-green-600" />,
              },
              {
                title: "Reef Dive",
                text: "Head to a nearby reef—see colorful fish, corals, and maybe a turtle!",
                icon: <Waves className="w-5 h-5 text-blue-600" />,
              },
              {
                title: "Wrap‑up & Next Steps",
                text: "Debrief with your instructor and get guidance on full certification.",
                icon: <Award className="w-5 h-5 text-coral" />,
              },
            ].map((s) => (
              <div key={s.title} className="rounded-2xl border p-5 bg-white">
                <div className="flex items-center gap-3">
                  {s.icon}
                  <h3 className="font-semibold">{s.title}</h3>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Try Scuba Packages */}
      <section id="packages" className="py-14 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Choose Your Try Scuba Experience
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Choose the option that fits your day and budget.
          </p>
          <div className="mt-6 grid md:grid-cols-3 gap-6">
            <div className="rounded-2xl border p-6 bg-gradient-to-b from-white to-gray-50">
              <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-4">
                <SupabaseImage
                  sourceUrl={pkgStandardImg}
                  alt="Standard Class — Try Scuba in Key Largo"
                  width={960}
                  height={540}
                  className="absolute inset-0 h-full w-full object-cover"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  namespace="wordpress"
                  breakpoints={[480, 768, 1024, 1440]}
                />
              </div>
              <h3 className="text-lg font-semibold">Standard Class</h3>
              <p className="mt-1 text-2xl font-bold text-ocean">
                $225
                <span className="text-base font-semibold text-foreground">
                  /person
                </span>
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Great value and greater experience with this all‑inclusive scuba
                experience.
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />{" "}
                  Small group with other first‑timers
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" /> All
                  premium Scubapro gear included
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />{" "}
                  Pool practice + 2 reef dives
                </li>
              </ul>
              <div className="mt-5">
                <Link href="/scuba-certification-courses-florida-keys/discover-scuba-diving-key-largo/">
                  <Button className="w-full bg-ocean hover:bg-ocean/90 text-white">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border p-6 bg-gradient-to-b from-white to-gray-50">
              <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-4">
                <div className="absolute right-3 top-3 text-xs font-semibold bg-coral text-white rounded-full px-2 py-1">
                  Most Popular
                </div>
                <SupabaseImage
                  sourceUrl={pkgPrivateImg}
                  alt="Private Instructor — Try Scuba in Key Largo"
                  width={960}
                  height={540}
                  className="absolute inset-0 h-full w-full object-cover"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  namespace="wordpress"
                  breakpoints={[480, 768, 1024, 1440]}
                />
              </div>
              <h3 className="text-lg font-semibold">Private Instructor</h3>
              <p className="mt-1 text-2xl font-bold text-ocean">$379</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Ideal for families, couples, kids, or friends. Add others at the
                standard rate.
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />{" "}
                  Personalized pace and attention
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" /> Add
                  extra guests at $225/person
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />{" "}
                  Great for kids and nervous swimmers
                </li>
              </ul>
              <div className="mt-5">
                <Link href="/product/try-scuba-private-instructor?ref=discover-hub">
                  <Button className="w-full bg-ocean hover:bg-ocean/90 text-white">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border p-6 bg-gradient-to-b from-white to-gray-50">
              <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-4">
                <SupabaseImage
                  sourceUrl={pkgPrivateBoatImg}
                  alt="Private Instructor & Private Boat — Try Scuba in Key Largo"
                  width={960}
                  height={540}
                  className="absolute inset-0 h-full w-full object-cover"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  namespace="wordpress"
                  breakpoints={[480, 768, 1024, 1440]}
                />
              </div>
              <h3 className="text-lg font-semibold">
                Private Instructor & Private Boat
              </h3>
              <p className="mt-1 text-2xl font-bold text-ocean">
                $649{" "}
                <span className="text-base font-semibold text-foreground">
                  for 2 divers
                </span>
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Your own boat and dedicated instructor(s) for a truly private
                experience.
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />{" "}
                  Private vessel—no other guests
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />{" "}
                  Flexible pace and site selection
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />{" "}
                  Best for couples and celebrations
                </li>
              </ul>
              <div className="mt-5">
                <Link href="/product/try-scuba-private-boat?ref=discover-hub">
                  <Button className="w-full bg-ocean hover:bg-ocean/90 text-white">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pool practice and Ocean reef dive */}
      <section className="py-14 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Dive into the Details
          </h2>
          <p className="mt-3 text-muted-foreground max-w-3xl">
            All-inclusive scuba diving experience that will expose you to the
            amazing underwater world.
          </p>
          <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-2xl border bg-gradient-to-b from-gray-50 to-transparent overflow-hidden">
              <div className="relative aspect-[16/9]">
                <SupabaseImage
                  sourceUrl={preArrivalImg}
                  alt="Pre-arrival planning for Discover Scuba Diving in Key Largo"
                  width={960}
                  height={540}
                  className="absolute inset-0 h-full w-full object-cover"
                  sizes="(max-width: 1280px) 50vw, 25vw"
                  namespace="wordpress"
                  breakpoints={[480, 768, 1024, 1440]}
                />
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute top-3 left-3 inline-flex items-center gap-2 bg-white/90 text-gray-900 px-3 py-1 rounded-full text-sm">
                  <Calendar className="w-4 h-4 text-gray-700" /> Pre‑Arrival
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold">Get Set for the Day</h3>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />{" "}
                    Complete quick waiver & check‑in
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />{" "}
                    Gear sizing and fit confirmed
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />{" "}
                    Overview of plan and safety
                  </li>
                </ul>
              </div>
            </div>

            <div className="rounded-2xl border bg-gradient-to-b from-ocean/10 to-transparent overflow-hidden">
              <div className="relative aspect-[16/9]">
                <SupabaseImage
                  sourceUrl={classroomImg}
                  alt="Classroom briefing for Discover Scuba Diving in Key Largo"
                  width={960}
                  height={540}
                  className="absolute inset-0 h-full w-full object-cover"
                  sizes="(max-width: 1280px) 50vw, 25vw"
                  namespace="wordpress"
                  breakpoints={[480, 768, 1024, 1440]}
                />
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute top-3 left-3 inline-flex items-center gap-2 bg-white/90 text-gray-900 px-3 py-1 rounded-full text-sm">
                  <BadgeCheck className="w-4 h-4 text-ocean" /> Classroom
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold">Know Before You Go</h3>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />{" "}
                    Hand signals & gear basics
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />{" "}
                    Safety procedures & equalizing
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />{" "}
                    Reef etiquette & marine life
                  </li>
                </ul>
              </div>
            </div>

            <div className="rounded-2xl border bg-gradient-to-b from-green-50 to-transparent overflow-hidden">
              <div className="relative aspect-[16/9]">
                <SupabaseImage
                  sourceUrl={poolImg}
                  alt="Pool training for Discover Scuba Diving in Key Largo"
                  width={960}
                  height={540}
                  className="absolute inset-0 h-full w-full object-cover"
                  sizes="(max-width: 1280px) 50vw, 25vw"
                  namespace="wordpress"
                  breakpoints={[480, 768, 1024, 1440]}
                />
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute top-3 left-3 inline-flex items-center gap-2 bg-white/90 text-gray-900 px-3 py-1 rounded-full text-sm">
                  <LifeBuoy className="w-4 h-4 text-green-600" /> Pool Training
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold">Learn the Essentials</h3>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />{" "}
                    Breathing through a regulator
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />{" "}
                    Mask/regulator clearing
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />{" "}
                    Equalizing & buoyancy basics
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />{" "}
                    Hand signals & buddy checks
                  </li>
                </ul>
                <p className="mt-3 text-sm text-muted-foreground">
                  Guided at your pace—perfect for first‑timers and refreshers.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border bg-gradient-to-b from-coral/10 to-transparent overflow-hidden">
              <div className="relative aspect-[16/9]">
                <SupabaseImage
                  sourceUrl={oceanImg}
                  alt="Ocean dives in the Florida Keys National Marine Sanctuary"
                  width={960}
                  height={540}
                  className="absolute inset-0 h-full w-full object-cover"
                  sizes="(max-width: 1280px) 50vw, 25vw"
                  namespace="wordpress"
                  breakpoints={[480, 768, 1024, 1440]}
                />
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute top-3 left-3 inline-flex items-center gap-2 bg-white/90 text-gray-900 px-3 py-1 rounded-full text-sm">
                  <Waves className="w-4 h-4 text-blue-600" /> Ocean Dives
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold">
                  Explore Sanctuary Reefs
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />{" "}
                    Boat ride to protected reefs
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />{" "}
                    Shallow, calm sites and clear water
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />{" "}
                    Colorful corals, reef fish, possible turtles
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />{" "}
                    Small groups for comfort and safety
                  </li>
                </ul>
                <p className="mt-3 text-sm text-muted-foreground">
                  Your pro stays by your side from start to finish.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dive sites */}
      <section className="py-14 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Beginner‑Friendly Dive Sites
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            We select calm, shallow reefs based on conditions—common sites
            include Christ of the Abyss, Grecian Rocks, Molasses Reef, and North
            Dry Rocks.
          </p>
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {[
              {
                title: "Molasses Reef",
                tag: "Best Reef in the USA",
                img: molassesSiteImg,
                blurb:
                  "With over 20 different dive sites, Molasses Reef is the go‑to location when conditions permit.",
              },
              {
                title: "French Reef",
                tag: "Known for Big Fish!",
                img: frenchReefImg,
                blurb:
                  "Explore endless runs of reef formations, swim‑throughs, and ledges filled with tropical fish and many surprises.",
              },
              {
                title: "Pickles Reef",
                tag: "Coral Restoration Project",
                img: picklesReefImg,
                blurb:
                  "Check out a real‑life coral restoration project and see schools of fish, sea fans, and tagged coral.",
              },
              {
                title: "Sand Island",
                tag: "One of the best displays of Elkhorn Coral in the Keys",
                img: sandIslandImg,
                blurb:
                  "Great site for beginning with plenty of sand and beautiful reef with Elkhorn coral.",
              },
            ].map((d) => (
              <div
                key={d.title}
                className="flex items-start gap-4 rounded-2xl border p-4 bg-white"
              >
                <div className="relative w-28 h-24 sm:w-32 sm:h-24 rounded-xl overflow-hidden shrink-0">
                  <SupabaseImage
                    sourceUrl={d.img}
                    alt={d.title}
                    width={512}
                    height={384}
                    className="absolute inset-0 h-full w-full object-cover"
                    sizes="(max-width: 768px) 40vw, 12vw"
                    namespace="wordpress"
                    breakpoints={[320, 480, 640, 960]}
                  />
                </div>
                <div>
                  <h3 className="font-semibold">{d.title}</h3>
                  {d.tag ? (
                    <div className="text-xs font-semibold text-coral mt-0.5">
                      {d.tag}
                    </div>
                  ) : null}
                  <p className="mt-2 text-sm text-muted-foreground">
                    {d.blurb}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Options / Variations */}
      <section className="py-14 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Optional Try Scuba Upgrades
          </h2>
          <div className="mt-6 grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Dive More Than 1 Day",
                desc: "Complete your pool training and dive with an instructor for up to 7 additional days.",
                perk: "4-1 Maximum Ratio",
              },
              {
                title: "Upgrade to PADI Open Water Certification",
                desc: "Portions of your pool training & ocean dives count towards certification.",
              },
              {
                title: "Private Photo/Video Add-On",
                desc: "Capture your first descent down to the coral reef and have amazing memories forever.",
              },
            ].map((o) => (
              <div
                key={o.title}
                className="rounded-2xl border p-6 bg-gradient-to-b from-white to-gray-50"
              >
                <h3 className="font-semibold text-lg">{o.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{o.desc}</p>
                {o.perk ? (
                  <p className="mt-3 inline-flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600" /> {o.perk}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Link href="/trips-tours">
              <Button className="bg-coral hover:bg-coral/90 text-white">
                See Dates & Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Requirements & Prerequisites */}
      <section className="py-14 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Requirements & Prerequisites
          </h2>
          <ul className="mt-6 grid sm:grid-cols-2 gap-3 text-sm">
            <li className="inline-flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" /> Age 10+
              (Junior Open Water 10–14; 15+ earns full Open Water)
            </li>
            <li className="inline-flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" /> Comfort
              in water; 200‑meter swim and 10‑minute float/tread
            </li>
            <li className="inline-flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />{" "}
              Complete PADI Medical Questionnaire; physician clearance if
              required
            </li>
            <li className="inline-flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />{" "}
              eLearning complete before in‑person training (we’ll help you get
              set up)
            </li>
          </ul>
          <div className="mt-6">
            <Link href="/trips-tours">
              <Button variant="outline" className="">
                Questions? Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-14 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Frequently Asked Questions
          </h2>
          <div className="mt-6 grid md:grid-cols-2 gap-6">
            {[
              {
                q: "Do I need to know how to swim?",
                a: "Comfort in water is helpful; basic swimming ability is recommended. Your instructor is with you at all times.",
              },
              {
                q: "How deep will we go?",
                a: "Typically 15–30 ft depending on comfort and conditions; always within beginner limits.",
              },
              {
                q: "Is this a certification?",
                a: "No—this is an introduction. You can upgrade to PADI Open Water with credit toward your course.",
              },
              {
                q: "What should I bring?",
                a: "Swimsuit, towel, sunscreen. We provide all scuba gear. Water and light snacks recommended.",
              },
            ].map((f) => (
              <div key={f.q} className="rounded-2xl border p-5">
                <h3 className="font-semibold">{f.q}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-14 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Compare Packages
          </h2>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-3 pr-4">Feature</th>
                  <th className="py-3 pr-4">Standard</th>
                  <th className="py-3 pr-4">Private Instructor</th>
                  <th className="py-3">Private Boat</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    feature: "Group size",
                    std: "Small group",
                    priv: "1–4 private",
                    boat: "Private charter",
                  },
                  {
                    feature: "Instructor attention",
                    std: "Shared",
                    priv: "Dedicated",
                    boat: "Dedicated",
                  },
                  {
                    feature: "Boat exclusivity",
                    std: "Shared",
                    priv: "Shared",
                    boat: "Private",
                  },
                  {
                    feature: "Ideal for",
                    std: "Budget & social",
                    priv: "Families & kids",
                    boat: "Couples & celebrations",
                  },
                ].map((r) => (
                  <tr key={r.feature} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium">{r.feature}</td>
                    <td className="py-3 pr-4">{r.std}</td>
                    <td className="py-3 pr-4">{r.priv}</td>
                    <td className="py-3">{r.boat}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-14 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            What Divers Say
          </h2>
          <div className="mt-6 grid md:grid-cols-2 gap-6">
            {[
              {
                quote:
                  "Amazing first dive—our instructor was patient and made us feel safe the whole time.",
                author: "Sarah M.",
              },
              {
                quote:
                  "Perfect family day. The kids loved seeing the reef and we got great photos!",
                author: "The Jensen Family",
              },
            ].map((t) => (
              <div
                key={t.author}
                className="rounded-2xl border p-6 bg-gradient-to-b from-white to-gray-50"
              >
                <p className="text-gray-800">“{t.quote}”</p>
                <div className="mt-3 text-sm text-muted-foreground">
                  — {t.author}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-gradient-to-b from-ocean to-coral text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-extrabold leading-tight">
              Ready to Try Scuba in Key Largo?
            </h2>
            <p className="mt-3 text-white/90">
              Secure your spot—sessions fill daily. Our team makes it easy,
              safe, and unforgettable.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/trips-tours">
                <Button className="bg-white text-gray-900 hover:bg-white/90">
                  Book Discover Scuba
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  variant="outline"
                  className="border-white/70 text-white hover:bg-white/10"
                >
                  Talk to a Specialist
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <StickyPackagesBar target="#packages" />
      <Footer />
    </div>
  );
}
