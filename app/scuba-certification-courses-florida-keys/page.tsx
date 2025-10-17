import Link from "next/link";
import { Navigation } from "../../client/components/Navigation";
import { Footer } from "../../client/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Anchor,
  Award,
  BadgeCheck,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  FlagTriangleRight,
  LifeBuoy,
  MapPin,
  Ship,
  ShieldCheck,
  Star,
  Waves,
} from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const { yoastMetadataForSlug } = await import("../../lib/yoast");
  return (await yoastMetadataForSlug("scuba-certification-courses-florida-keys")) as any;
}

export default async function AllCoursesPage() {
  const { getWpImageUrlByFilename } = await import(
    "../../client/lib/wp-media"
  );

  async function resolveFirst(filenames: string[]): Promise<string> {
    for (const f of filenames) {
      const u = await getWpImageUrlByFilename(f);
      if (u) return u;
    }
    return "/placeholder.svg";
  }

  const heroSrc = await resolveFirst([
    "key-largo-scuba-training-hero.jpg",
    "florida-keys-learn-to-scuba-dive.jpg",
    "wreck-diving-florida-keys.jpg",
    "discover-scuba-diving-try-scuba.jpg",
  ]);

  const shallowReefImg = await resolveFirst([
    "try-scuba-diving-in-florida-keys.jpg",
    "discover-scuba-diving-try-scuba.jpg",
    "Florida-keys-try-scuba-diving.jpg",
  ]);
  const varietyImg = await resolveFirst([
    "florida-keys-learn-to-scuba-dive.jpg",
    "Try-scuba-diving-diver-key-largo.jpg",
    "discover-scuba-diving-try-scuba.jpg",
  ]);
  const wreckImg = await resolveFirst([
    "spiegel-grove-wreck-key-largo.jpg",
    "uscg-duane-wreck-key-largo.jpg",
    "bibb-wreck-key-largo.jpg",
  ]);

  const courses: Array<{
    title: string;
    href: string;
    blurb: string;
    img: string;
    tag?: string;
    duration: string;
    dives: string;
    highlights: string[];
  }> = [
    {
      title: "Try Scuba Diving (Discover)",
      href: "/scuba-certification-courses-florida-keys/discover-scuba-diving-key-largo/",
      blurb:
        "Beginner‑friendly intro: practice in shallow water, then explore reefs with a pro.",
      img: shallowReefImg,
      tag: "No experience required",
      duration: "Half‑day",
      dives: "2 reef dives",
      highlights: ["No experience required", "All gear included"],
    },
    {
      title: "Open Water Scuba Certification",
      href: "/scuba-certification-courses-florida-keys/open-water-scuba-certification/",
      blurb:
        "Earn the world’s most recognized certification—pool skills + four ocean training dives.",
      img: varietyImg,
      tag: "Most popular",
      duration: "2–3 days",
      dives: "4 training dives",
      highlights: ["PADI eLearning", "All gear included"],
    },
    {
      title: "Open Water Referral Dives",
      href: "/scuba-certification-courses-florida-keys/open-water-referral-dives/",
      blurb:
        "Finished eLearning and pool at home? Complete your 4 checkout dives here.",
      img: shallowReefImg,
      tag: "All gear included",
      duration: "1–2 days",
      dives: "4 checkout dives",
      highlights: ["All gear included", "PADI referral accepted"],
    },
    {
      title: "Refresher Course",
      href: "/scuba-certification-courses-florida-keys/refresher-course/",
      blurb:
        "Get back into diving with a focused skills tune‑up and optional reef dives.",
      img: varietyImg,
      tag: "Confidence rebuild",
      duration: "Half‑ or full‑day",
      dives: "0–2 optional",
      highlights: ["Skills tune‑up", "Optional reef dives"],
    },
    {
      title: "PADI Advanced Open Water",
      href: "/scuba-certification-courses-florida-keys/padi-advanced-open-water-diver-certification/",
      blurb:
        "Five adventure dives—Deep, Navigation, plus electives like Wreck or Night.",
      img: wreckImg,
      tag: "Wreck & deep specialists",
      duration: "2 days",
      dives: "5 adventure dives",
      highlights: ["Deep+Nav required", "Wreck/Night electives"],
    },
    {
      title: "Rescue Diver Certification",
      href: "/scuba-certification-courses-florida-keys/rescue-diver-certification/",
      blurb:
        "Prevent problems and respond effectively—scenario‑based training for real confidence.",
      img: varietyImg,
      tag: "Build leadership",
      duration: "2 days (+ EFR)",
      dives: "Scenario‑based",
      highlights: ["Real‑world scenarios", "Build leadership"],
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      {/* Hero */}
      <section className="relative z-0 overflow-hidden pt-28 pb-16 min-h-[60vh]">
        <div className="absolute inset-0 z-0">
          <img
            src={heroSrc}
            alt="Scuba Certification Courses in Key Largo"
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
                <BadgeCheck className="w-3.5 h-3.5" /> PADI Training for All
                Levels
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-1">
                <Calendar className="w-3.5 h-3.5" /> Available Daily
              </span>
            </div>
            <h1 className="mt-4 text-4xl md:text-6xl font-extrabold leading-[1.05] drop-shadow-md">
              PADI Certification Key Largo
            </h1>
            <p className="mt-4 text-lg md:text-xl text-white/90 max-w-2xl">
              Train in the Dive Capital of the World. Shallow reefs for
              beginners, endless site variety for practice, and world‑class
              wrecks for advanced skills—our PADI courses run daily, year‑round.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="#courses">
                <Button className="bg-coral hover:bg-coral/90 text-white text-base px-6 py-3">
                  Browse Courses
                </Button>
              </Link>
              <Link href="#why">
                <Button
                  variant="outline"
                  className="text-white border-white/60 bg-white/10 hover:bg-white/20"
                >
                  Why Train Here
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

      {/* Why Train Here */}
      <section
        id="why"
        className="py-16 bg-gradient-to-b from-white to-gray-50"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Why Key Largo is Perfect for Training
          </h2>
          <p className="mt-3 text-muted-foreground max-w-3xl">
            Shallow reefs for first skills, diverse sites for practice, and
            legendary wrecks for advanced specialties—plus warm water and great
            visibility most of the year.
          </p>

          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <div className="rounded-xl border bg-white p-6">
              <div className="h-10 w-10 rounded-full bg-green-50 text-green-700 flex items-center justify-center mb-3">
                <LifeBuoy className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold">Shallow, Calm Reefs</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Sandy bottoms and gentle conditions create a comfortable
                environment to build confidence.
              </p>
            </div>
            <div className="rounded-xl border bg-white p-6">
              <div className="h-10 w-10 rounded-full bg-ocean/10 text-ocean flex items-center justify-center mb-3">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold">Tons of Site Variety</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Navigation lines, drift routes, night options, coral gardens,
                and sandy practice areas.
              </p>
            </div>
            <div className="rounded-xl border bg-white p-6">
              <div className="h-10 w-10 rounded-full bg-coral/10 text-coral flex items-center justify-center mb-3">
                <Ship className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold">World‑Class Wrecks</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Spiegel Grove, USCG Duane, and Bibb—ideal for deep and wreck
                adventure dives.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {[
              "Calm, clear water",
              "60+ dive sites",
              "Protected reefs",
              "Legendary wrecks",
              "Daily classes",
            ].map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-2 rounded-full bg-white border px-3 py-1 text-sm text-foreground"
              >
                <BadgeCheck className="w-4 h-4 text-ocean" /> {t}
              </span>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-4 rounded-xl border bg-white p-5">
            <div className="h-10 w-10 rounded-full bg-ocean/10 text-ocean flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="font-semibold">Daily PADI Classes</div>
              <div className="text-sm text-muted-foreground">
                Courses run every day, year‑round. Specialty exceptions: Ice,
                Altitude, Dry Suit.
              </div>
            </div>
            <Link href="/contact">
              <Button variant="outline">Ask About Scheduling</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Course Grid */}
      <section id="courses" className="py-14 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Explore Courses
          </h2>
          <div className="mt-6 grid md:grid-cols-3 gap-6">
            {courses.map((c) => (
              <div
                key={c.title}
                className="rounded-2xl border p-6 bg-gradient-to-b from-white to-gray-50"
              >
                <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-4">
                  <img
                    src={c.img}
                    alt={c.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-semibold">{c.title}</h3>
                {c.tag ? (
                  <div className="text-xs font-semibold text-coral mt-0.5">
                    {c.tag}
                  </div>
                ) : null}
                <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {c.duration}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Anchor className="w-3.5 h-3.5" /> {c.dives}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {c.highlights.map((h) => (
                    <span
                      key={h}
                      className="inline-flex items-center gap-1 rounded-full bg-ocean/5 text-ocean px-2 py-1 text-xs"
                    >
                      <BadgeCheck className="w-3.5 h-3.5" /> {h}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{c.blurb}</p>
                <div className="mt-5">
                  <Link href={c.href}>
                    <Button className="w-full bg-ocean hover:bg-ocean/90 text-white">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-14 bg-white">
        <div className="container mx-auto px-4">
          <div className="rounded-2xl border p-8 text-center bg-gradient-to-b from-gray-50 to-white">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Ready to Start or Level Up?
            </h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              From first bubbles to advanced wrecks, our team makes it safe,
              easy, and unforgettable—365 days a year.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/trips-tours">
                <Button className="bg-coral hover:bg-coral/90 text-white px-6">
                  See Dates & Pricing
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline">Talk to a Specialist</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
