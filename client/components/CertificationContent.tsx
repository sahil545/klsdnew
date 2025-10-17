import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Users,
  MapPin,
  CheckCircle,
  Star,
  Shield,
  Camera,
  Fish,
  Waves,
  Award,
  Phone,
  Calendar,
  ArrowRight,
  BookOpen,
  Target,
  Zap,
  Heart,
  Mountain,
  Anchor,
} from "lucide-react";

const itinerary = [
  {
    day: "Day 1",
    title: "Pool & Skills Immersion",
    description:
      "Morning orientation followed by confined water training in our on-site pool to master core buoyancy and safety drills.",
  },
  {
    day: "Day 2",
    title: "Reef Dive One & Two",
    description:
      "Board our dedicated dive vessel for two shallow reef dives with instructor-led skill checks and marine life briefings.",
  },
  {
    day: "Day 3",
    title: "Open Water Mastery",
    description:
      "Complete advanced drills, navigation exercises, and enjoy a celebratory drift dive over the Key Largo coral gardens.",
  },
  {
    day: "Day 4",
    title: "Certification & Photo Moment",
    description:
      "Finalize paperwork, review achievements, and capture your underwater milestone at the Christ of the Abyss statue.",
  },
];

const addOns = [
  {
    title: "Private Underwater Photo Session",
    price: "$149",
    description:
      "Professional photographer joins your final dive and delivers an edited gallery within 48 hours.",
  },
  {
    title: "Nitrox Upgrade",
    price: "$89",
    description:
      "Extend bottom time and feel refreshed between dives with enriched air certification add-on.",
  },
  {
    title: "Gear Ownership Starter Pack",
    price: "$329",
    description:
      "Mask, snorkel, fins, and mesh bag fitted by our pro shop so you surface with gear you love.",
  },
];

export default function CertificationContent() {
  const scrollToBooking = () => {
    const bookingSection = document.getElementById(
      "certification-booking-section",
    );
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const [courseLevel, setCourseLevel] = useState("Beginner");
  useEffect(() => {
    if (typeof window !== "undefined") {
      const p =
        new URLSearchParams(window.location.search).get("course") ||
        "open-water";
      const map: Record<string, string> = {
        "open-water": "Beginner",
        "advanced-open-water": "Intermediate",
        "rescue-diver": "Advanced",
      };
      setCourseLevel(map[p] || "Beginner");
    }
  }, []);

  return (
    <div className="bg-white">
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-50/70" />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='600' height='600' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%2359D6D6' stroke-width='1' opacity='0.7'%3E%3Cpath d='M80,120 C120,100 180,110 220,130 C260,150 290,140 320,120 C350,100 380,110 400,130 C420,150 400,170 380,180 C360,190 340,185 320,175 C300,165 280,170 260,180 C240,190 220,185 200,175 C180,165 160,160 140,150 C120,140 100,135 80,120 Z'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "300px 300px",
            backgroundRepeat: "repeat",
          }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Training Journey Overview
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Timeline cards describe each training day with space for copy, photography, or embedded video. Designed so marketing can rearrange or duplicate steps without developer support.
            </p>
          </div>
          <div className="max-w-6xl mx-auto grid gap-12 lg:grid-cols-2 lg:items-stretch">
            <div className="flex h-full flex-col">
              <div className="flex-1 rounded-3xl bg-white p-6 shadow-md shadow-slate-900/5">
                <ol className="relative space-y-6 border-l border-slate-200 pl-6">
                  {itinerary.map((step, index) => (
                    <li key={step.day} className="ml-4">
                      <div className="absolute -left-[10px] mt-2 h-2 w-2 rounded-full bg-sky-500" />
                      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-900/5">
                      <div className="flex items-center justify-between text-sm font-medium uppercase tracking-wide text-sky-600">
                        <span>{step.day}</span>
                        <span>Module {index + 1}</span>
                      </div>
                      <h3 className="mt-3 text-xl font-semibold text-slate-900">
                        {step.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        {step.description}
                      </p>
                    </div>
                  </li>
                  ))}
                </ol>
              </div>
            </div>

            <aside className="flex h-full flex-col gap-6 rounded-3xl bg-white p-6 shadow-md shadow-slate-900/5">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
                <p className="text-sm font-semibold text-sky-600">Design Intent</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">
                  Pricing Snapshot
                </h3>
                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Course Tuition</span>
                    <span>$499</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Digital Materials</span>
                    <span>$129</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Boat Fees</span>
                    <span>$89</span>
                  </div>
                  <hr className="border-dashed border-slate-200" />
                  <div className="flex items-center justify-between text-base font-semibold text-slate-900">
                    <span>Total Package</span>
                    <span>$717</span>
                  </div>
                </div>
                <button className="mt-6 w-full rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-sky-600/30 transition hover:bg-sky-500">
                  Mock Primary CTA
                </button>
              </div>

              <div className="rounded-2xl border border-slate-100 p-6">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Content Blocks
                </h3>
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  <li>• FAQ accordion or policies</li>
                  <li>• Testimonial carousel</li>
                  <li>• Certification checklist download</li>
                  <li>• Lead capture modal trigger</li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="rounded-3xl bg-white p-8 shadow-sm shadow-slate-900/5">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">
                    Upsell &amp; Experience Add-Ons
                  </h2>
                  <p className="mt-2 max-w-xl text-sm text-slate-600">
                    Card grid shows optional upgrades with copy slots for value propositions. Add or remove cards without touching layout utilities.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900">
                    Toggle Layouts
                  </button>
                  <button className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">
                    Duplicate Section
                  </button>
                </div>
              </div>

              <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {addOns.map((addOn) => (
                  <div
                    key={addOn.title}
                    className="flex h-full flex-col justify-between rounded-2xl border border-slate-100 bg-slate-50/60 p-6 transition hover:-translate-y-1 hover:border-sky-200 hover:bg-white"
                  >
                    <div>
                      <p className="text-sm font-semibold text-sky-600">
                        {addOn.price}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-slate-900">
                        {addOn.title}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-slate-600">
                        {addOn.description}
                      </p>
                    </div>
                    <button className="mt-6 w-full rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-700">
                      Placeholder CTA
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Overview Section */}
      <section
        id="course-overview"
        className="py-20 bg-gradient-to-b from-gray-50 to-white relative"
      >
        {/* Ocean Background with Contour Lines */}
        <div className="absolute inset-0 bg-blue-50/70" />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='600' height='600' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%2359D6D6' stroke-width='1' opacity='0.7'%3E%3Cpath d='M80,120 C120,100 180,110 220,130 C260,150 290,140 320,120 C350,100 380,110 400,130 C420,150 400,170 380,180 C360,190 340,185 320,175 C300,165 280,170 260,180 C240,190 220,185 200,175 C180,165 160,160 140,150 C120,140 100,135 80,120 Z'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "300px 300px",
            backgroundRepeat: "repeat",
          }}
        />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Why Choose PADI Certification in Key Largo?
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Learn to scuba dive in the crystal-clear waters of the Florida
                Keys with experienced PADI instructors and world-class dive
                sites
              </p>
            </div>

            {/* Course Level and PADI Standards */}
            <div className="grid md:grid-cols-2 gap-6 mb-16">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                    <h3 className="text-xl font-semibold">Course Level</h3>
                  </div>
                  <div className="text-gray-900 text-2xl font-bold mb-2">
                    {courseLevel}
                  </div>
                  <p className="text-sm text-gray-600">
                    {courseLevel === "Beginner"
                      ? "Perfect for starting your diving journey"
                      : courseLevel === "Intermediate"
                        ? "Ideal for advancing your skills"
                        : "Designed to master rescue techniques"}
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src="https://cdn.builder.io/api/v1/image/assets%2F2a778920e8d54a37b1576086f79dd676%2F68f4a1ac67f04a54a4e3914e4b66253f?format=webp&width=800"
                      alt="PADI Logo"
                      className="w-8 h-8 object-contain"
                    />
                    <h3 className="text-xl font-semibold">PADI Standards</h3>
                  </div>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Internationally recognized certification</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Lifetime certification validity</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Digital certification card included</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Key Benefits Grid */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">
                    PADI 5★ Dive Center
                  </h3>
                  <p className="text-gray-600">
                    Learn from the highest-rated PADI dive center in Key Largo
                    with over 25 years of experience training safe, confident
                    divers.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">
                    Small Class Sizes
                  </h3>
                  <p className="text-gray-600">
                    Maximum 6 students per instructor ensures personalized
                    attention and faster skill development in a safe learning
                    environment.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">
                    World-Class Location
                  </h3>
                  <p className="text-gray-600">
                    Train in the pristine waters of John Pennekamp Coral Reef
                    State Park, America's first underwater preserve.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Course Curriculum */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
              <h3 className="text-2xl font-bold text-center mb-8">
                Complete PADI Open Water Curriculum
              </h3>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Knowledge Development */}
                <div>
                  <h4 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    Knowledge Development
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Equipment overview and selection</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Dive planning and safety procedures</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Underwater physics and physiology</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Marine environment and conservation</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Dive computer operation and tables</span>
                    </li>
                  </ul>
                </div>

                {/* Practical Skills */}
                <div>
                  <h4 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Waves className="w-5 h-5 text-blue-600" />
                    Practical Skills Training
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Equipment assembly and pre-dive checks</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Mask clearing and regulator recovery</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Buoyancy control and hovering</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Emergency procedures and rescue techniques</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Underwater navigation and communication</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="text-center mt-8">
                <Badge className="bg-blue-100 text-blue-800 px-4 py-2">
                  All skills practiced in pool and open water environments
                </Badge>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
              <h3 className="text-2xl font-bold text-center mb-6">Important Requirements</h3>
              <ul className="space-y-3 max-w-3xl mx-auto">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>All students must meet minimum medical requirements and/or obtain physician approval. Complete the PADI Medical Questionnaire; physician clearance may be required based on answers.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Swim test: swim 200 meters/yards continuously (any stroke), or 300 meters/yards with mask, fins, and snorkel; plus a 10‑minute float/tread without aids.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Course Schedule and Structure */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Your 4-Day Certification Journey
              </h2>
              <p className="text-xl text-gray-600">
                Structured learning path from classroom to open water
                certification
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Day 1 */}
              <Card className="relative overflow-hidden">
                <CardContent className="p-6">
                  <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 text-sm font-semibold">
                    Day 1
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-3">
                      Knowledge & Pool
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>8:00 AM - 4:00 PM</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        <span>PADI theory and classroom</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Waves className="w-4 h-4" />
                        <span>Pool skills development</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Day 2 */}
              <Card className="relative overflow-hidden">
                <CardContent className="p-6">
                  <div className="absolute top-0 right-0 bg-green-600 text-white px-3 py-1 text-sm font-semibold">
                    Day 2
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-3">
                      Advanced Pool
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>8:00 AM - 12:00 PM</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        <span>Master essential skills</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        <span>Emergency procedures</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Day 3 */}
              <Card className="relative overflow-hidden">
                <CardContent className="p-6">
                  <div className="absolute top-0 right-0 bg-orange-600 text-white px-3 py-1 text-sm font-semibold">
                    Day 3
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-3">
                      First Ocean Dive
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>8:00 AM - 4:00 PM</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Anchor className="w-4 h-4" />
                        <span>Shallow reef dives</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Fish className="w-4 h-4" />
                        <span>Apply skills in ocean</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Day 4 */}
              <Card className="relative overflow-hidden">
                <CardContent className="p-6">
                  <div className="absolute top-0 right-0 bg-purple-600 text-white px-3 py-1 text-sm font-semibold">
                    Day 4
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-3">
                      Certification Dives
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>8:00 AM - 4:00 PM</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        <span>Final skill demonstration</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4" />
                        <span>Celebrate your certification!</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Everything Included in Your Course
              </h2>
              <p className="text-xl text-gray-600">
                No hidden fees - complete certification package
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Equipment */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    Professional Equipment
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>BCD (buoyancy control device)</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Regulator and octopus</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Wetsuit, mask, fins, and snorkel</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Weight system and weights</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Tank and air fills</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Materials */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    Learning Materials
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>PADI Open Water manual and eLearning</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Digital certification card</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>PADI logbook and slate</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Dive tables and planning materials</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Certificate processing fees</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-8">
              <Badge className="bg-green-100 text-green-800 px-6 py-3 text-lg">
                $399 - No Additional Fees or Equipment Rental Charges
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-600">
                Everything you need to know about PADI certification
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  question:
                    "What is the minimum age for PADI Open Water certification?",
                  answer:
                    "Students must be at least 12 years old for Open Water certification. We also offer PADI Bubblemaker for kids 8+ and Seal Team for ages 8-12.",
                },
                {
                  question: "Do I need to know how to swim before starting?",
                  answer:
                    "Yes, you must be able to swim 200 meters (any stroke) and tread water for 10 minutes. We can assess your swimming ability during your first session.",
                },
                {
                  question: "How long is my PADI certification valid?",
                  answer:
                    "Your PADI Open Water certification never expires! However, if you haven't dived in a while, we recommend a refresher course to brush up on your skills.",
                },
                {
                  question: "What if weather conditions prevent diving?",
                  answer:
                    "Safety is our priority. If conditions are unsafe, we'll reschedule your open water dives at no additional cost. Pool sessions can usually continue regardless of weather.",
                },
                {
                  question:
                    "Can I complete the course if I have medical concerns?",
                  answer:
                    "Most people can safely learn to dive. You'll complete a medical questionnaire, and some conditions may require physician approval before participation.",
                },
                {
                  question:
                    "What's the difference between Open Water and Advanced certification?",
                  answer:
                    "Open Water allows diving to 60 feet with a certified buddy. Advanced Open Water extends this to 100 feet and includes specialty dive training like night diving and deep diving.",
                },
              ].map((faq, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-3 text-gray-900">
                      {faq.question}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Start Your Underwater Adventure?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Join thousands of satisfied students who earned their PADI
              certification in the beautiful waters of Key Largo
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <div className="flex items-center gap-2 text-blue-100">
                <CheckCircle className="w-5 h-5" />
                <span>
                  Small classes • Expert instruction • All equipment included
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={scrollToBooking}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 text-lg rounded-xl shadow-lg"
              >
                Start Your Certification - $399
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600 font-bold py-4 px-8 text-lg rounded-xl"
              >
                <Phone className="w-5 h-5 mr-2" />
                Call (305) 451-4040
              </Button>
            </div>

            <div className="mt-6 text-blue-200 text-sm">
              Questions? Call us at (305) 451-4040 or book online above
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
