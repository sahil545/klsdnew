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
  GraduationCap,
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
  return (await yoastMetadataForSlug("open-water-scuba-certification")) as any;
}

export default async function OpenWaterScubaCertificationPage() {
  const { getWpImageUrlByFilename } = await import("../../../client/lib/wp-media");

  async function resolveFirst(filenames: string[]): Promise<string> {
    for (const f of filenames) {
      const u = await getWpImageUrlByFilename(f);
      if (u) return u;
    }
    return "/placeholder.svg";
  }

  const heroSrc = await resolveFirst([
    "open-water-scuba-certification-key-largo.jpg",
    "padi-open-water-diver-key-largo.jpg",
    "florida-keys-learn-to-scuba-dive.jpg",
    "discover-scuba-diving-try-scuba.jpg",
  ]);

  const classroomImg = await resolveFirst([
    "florida-keys-learn-to-scuba-dive.jpg",
    "Try-scuba-diving-diver-key-largo.jpg",
    "Florida-keys-try-scuba-diving.jpg",
  ]);
  const poolImg = await resolveFirst([
    "try-scuba-diving-in-florida-keys.jpg",
    "discover-scuba-diving-try-scuba.jpg",
    "florida-keys-learn-to-scuba-dive.jpg",
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
          <img src={heroSrc} alt="Open Water Scuba Certification in Key Largo" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl text-white">
            <div className="flex flex-wrap items-center gap-2 text-xs text-white/90">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-1">
                <MapPin className="w-3.5 h-3.5" /> Key Largo, Florida Keys
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-1">
                <GraduationCap className="w-3.5 h-3.5" /> PADI Open Water Diver
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-1">
                <Clock className="w-3.5 h-3.5" /> Typical duration: 2–3 days
              </span>
            </div>
            <h1 className="mt-4 text-4xl md:text-6xl font-extrabold leading-[1.05] drop-shadow-md">
              Open Water Scuba Certification
            </h1>
            <p className="mt-4 text-lg md:text-xl text-white/90 max-w-2xl">
              Earn the world’s most recognized scuba certification with expert PADI instructors, modern gear, and clear Florida Keys reefs.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/trips-tours">
                <Button className="bg-coral hover:bg-coral/90 text-white text-base px-6 py-3">
                  Start Your Certification
                </Button>
              </Link>
              <Link href="#details">
                <Button variant="outline" className="text-white border-white/60 bg-white/10 hover:bg-white/20">
                  See What’s Included
                </Button>
              </Link>
            </div>
            <div className="mt-6 flex items-center gap-6 text-sm text-white/90">
              <div className="inline-flex items-center gap-2"><Star className="w-4 h-4 text-yellow-300" /> 4.9/5 from 1,000+ divers</div>
              <div className="inline-flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-green-300" /> PADI‑certified pros</div>
              <div className="inline-flex items-center gap-2"><Waves className="w-4 h-4 text-blue-200" /> Calm, clear reef sites</div>
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
                Exceptional reviews from new and returning divers. Trusted by families and travelers worldwide.
              </p>
            </div>
            <div className="rounded-2xl border p-6">
              <div className="flex items-center gap-3">
                <LifeBuoy className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold">Safety First</h3>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Small class sizes, professional instruction, and premium Scubapro gear included.
              </p>
            </div>
            <div className="rounded-2xl border p-6">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-ocean" />
                <h3 className="font-semibold">PADI Partner</h3>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Train with certified pros and earn a certification that’s valid worldwide for life.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What is Open Water + What’s included */}
      <section id="details" className="py-14 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-10 items-start">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">What Is the Open Water Diver Course?</h2>
              <p className="mt-4 text-muted-foreground">
                The PADI Open Water Diver course teaches you the skills, knowledge, and confidence to dive independently with a buddy to 60 ft/18 m. You’ll complete interactive eLearning, master essential skills in a pool or confined water, and finish with four open‑water training dives on our local coral reefs.
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                <li className="flex items-start gap-2"><CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" /> Ages 10+ welcome (Junior Open Water for ages 10–14)</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" /> Basic swim skills and comfort in water required</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" /> Medical questionnaire—doctor’s clearance may be needed</li>
              </ul>
            </div>
            <div className="rounded-2xl border p-6 bg-gradient-to-b from-white to-gray-50">
              <h3 className="text-xl font-bold">What’s Included</h3>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="inline-flex items-center gap-2"><BookOpen className="w-4 h-4 text-ocean" /> PADI eLearning access</div>
                <div className="inline-flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-green-600" /> All premium Scubapro gear</div>
                <div className="inline-flex items-center gap-2"><LifeBuoy className="w-4 h-4 text-green-600" /> Confined‑water skill sessions</div>
                <div className="inline-flex items-center gap-2"><Anchor className="w-4 h-4 text-gray-700" /> Four open‑water training dives</div>
                <div className="inline-flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-700" /> Flexible schedules—daily starts</div>
                <div className="inline-flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-coral" /> Certification processing</div>
              </div>
              <div className="mt-6">
                <Link href="/trips-tours">
                  <Button className="w-full bg-ocean hover:bg-ocean/90 text-white">See Dates & Availability</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course flow */}
      <section className="py-14 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">How Your Course Flows</h2>
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <div className="rounded-2xl border bg-gradient-to-b from-ocean/10 to-transparent overflow-hidden">
              <div className="relative aspect-[16/9]">
                <img src={classroomImg} alt="PADI eLearning for Open Water Diver" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute top-3 left-3 inline-flex items-center gap-2 bg-white/90 text-gray-900 px-3 py-1 rounded-full text-sm">
                  <BookOpen className="w-4 h-4 text-ocean" /> Step 1
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold">Complete eLearning at Your Pace</h3>
                <p className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <span className="block">Finish knowledge development online—most divers take 6–8 hours total.</span>
                  <span className="block">Review with your instructor before pool training.</span>
                </p>
              </div>
            </div>

            <div className="rounded-2xl border bg-gradient-to-b from-green-50 to-transparent overflow-hidden">
              <div className="relative aspect-[16/9]">
                <img src={poolImg} alt="Confined‑water pool training for Open Water" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute top-3 left-3 inline-flex items-center gap-2 bg-white/90 text-gray-900 px-3 py-1 rounded-full text-sm">
                  <LifeBuoy className="w-4 h-4 text-green-600" /> Step 2
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold">Master Core Skills in Confined Water</h3>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" /> Buoyancy, equalizing, and trim</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" /> Mask and regulator skills</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" /> Out‑of‑air drills and safety ascents</li>
                </ul>
              </div>
            </div>

            <div className="rounded-2xl border bg-gradient-to-b from-coral/10 to-transparent overflow-hidden">
              <div className="relative aspect-[16/9]">
                <img src={oceanImg} alt="Open‑water training dives on Florida Keys reefs" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute top-3 left-3 inline-flex items-center gap-2 bg-white/90 text-gray-900 px-3 py-1 rounded-full text-sm">
                  <Anchor className="w-4 h-4 text-gray-700" /> Step 3
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold">Make Four Open‑Water Dives</h3>
                <p className="mt-3 text-sm text-muted-foreground">
                  Demonstrate your skills in the ocean with your instructor over two days—then you’re certified for life.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course options */}
      <section className="py-14 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Choose Your Course Format</h2>
          <div className="mt-6 grid md:grid-cols-3 gap-6">
            <div className="rounded-2xl border p-6 bg-gradient-to-b from-white to-gray-50">
              <h3 className="text-lg font-semibold">Small Group Course</h3>
              <p className="mt-2 text-sm text-muted-foreground">Learn with other new divers—great value and lots of fun in a focused setting.</p>
              <p className="mt-3 inline-flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-green-600" /> Max 4–6 students per instructor</p>
              <div className="mt-5"><Link href="/trips-tours"><Button className="w-full bg-ocean hover:bg-ocean/90 text-white">See Dates</Button></Link></div>
            </div>
            <div className="rounded-2xl border p-6 bg-gradient-to-b from-white to-gray-50">
              <h3 className="text-lg font-semibold">Private Course</h3>
              <p className="mt-2 text-sm text-muted-foreground">One‑on‑one instruction or a private group at your pace—ideal for families and couples.</p>
              <p className="mt-3 inline-flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-green-600" /> Personalized schedule</p>
              <div className="mt-5"><Link href="/trips-tours"><Button className="w-full bg-ocean hover:bg-ocean/90 text-white">Request Private</Button></Link></div>
            </div>
            <div className="rounded-2xl border p-6 bg-gradient-to-b from-white to-gray-50">
              <h3 className="text-lg font-semibold">Referral Dives Only</h3>
              <p className="mt-2 text-sm text-muted-foreground">Finish your four ocean dives in Key Largo after completing eLearning and pool training elsewhere.</p>
              <p className="mt-3 inline-flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-green-600" /> Quick 1–2 day schedule</p>
              <div className="mt-5"><Link href="/trips-tours"><Button className="w-full bg-ocean hover:bg-ocean/90 text-white">Finish Here</Button></Link></div>
            </div>
          </div>
        </div>
      </section>

      {/* Prerequisites */}
      <section className="py-14 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Requirements & Prerequisites</h2>
          <ul className="mt-6 grid sm:grid-cols-2 gap-3 text-sm">
            <li className="inline-flex items-start gap-2"><CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" /> Age 10+ (Junior Open Water 10–14; 15+ earns full Open Water)</li>
            <li className="inline-flex items-start gap-2"><CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" /> Comfort in water; 200‑meter swim and 10‑minute float/tread</li>
            <li className="inline-flex items-start gap-2"><CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" /> Complete PADI Medical Questionnaire; physician clearance if required</li>
            <li className="inline-flex items-start gap-2"><CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" /> eLearning complete before in‑person training (we’ll help you get set up)</li>
          </ul>
          <div className="mt-6"><Link href="/trips-tours"><Button variant="outline" className="">Questions? Contact Us</Button></Link></div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-14 bg-white">
        <div className="container mx-auto px-4">
          <div className="rounded-2xl border p-8 text-center bg-gradient-to-b from-gray-50 to-white">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Ready to Get Certified?</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">Join the world’s most popular scuba course in the Dive Capital of the World. Start online today and finish in Key Largo with our friendly, experienced team.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/trips-tours"><Button className="bg-coral hover:bg-coral/90 text-white px-6">Start eLearning</Button></Link>
              <Link href="/trips-tours"><Button variant="outline">View Schedule</Button></Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
