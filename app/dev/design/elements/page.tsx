import Link from "next/link";
import { Star, Shield, Anchor, Users, CheckCircle } from "lucide-react";

export default function DesignElementsPage() {
  return (
    <main className="py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">Design Elements</h1>
        {/* Ultimate Day on the Water - reference block */}
        <section className="py-10">
          <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-ocean/5 via-white to-coral/5">
            <div
              className="absolute -top-10 -left-10 w-60 h-60 bg-ocean/10 rounded-full blur-3xl"
              aria-hidden="true"
            />
            <div
              className="absolute -bottom-10 -right-10 w-72 h-72 bg-coral/10 rounded-full blur-3xl"
              aria-hidden="true"
            />

            <div className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div className="max-w-2xl">
                <div className="text-ocean text-xs font-semibold uppercase tracking-wider">
                  Florida Keys • Key Largo
                </div>
                <h3 className="mt-1 text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">
                  Ultimate Day on the Water
                </h3>
                <p className="mt-2 text-gray-700 text-sm md:text-base">
                  Small groups, honest weather calls, and expert PADI pros.
                  Reef, wrecks, or statue—we’ll match you to the perfect plan.
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs md:text-sm">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-gray-200 px-3 py-1">
                    <Shield className="w-4 h-4 text-amber-600" /> Safety‑first
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-gray-200 px-3 py-1">
                    <Anchor className="w-4 h-4 text-ocean" /> Christ Statue
                    Daily
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-gray-200 px-3 py-1">
                    <Users className="w-4 h-4 text-sage" /> Private or Shared
                  </span>
                </div>
                <div className="mt-3 inline-flex items-center gap-2 text-sm text-gray-800">
                  <div
                    className="flex items-center gap-0.5 text-amber-500"
                    aria-label="Average rating 4.9 out of 5"
                  >
                    <Star className="w-4 h-4" fill="currentColor" />
                    <Star className="w-4 h-4" fill="currentColor" />
                    <Star className="w-4 h-4" fill="currentColor" />
                    <Star className="w-4 h-4" fill="currentColor" />
                    <Star className="w-4 h-4" fill="currentColor" />
                  </div>
                  <span>4.9/5 • 1,200+ reviews</span>
                </div>
              </div>

              <div className="w-full md:w-auto">
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm min-w-[260px]">
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-extrabold text-gray-900">
                      From $199
                    </span>
                    <span className="text-xs text-gray-500 mb-1">
                      per diver
                    </span>
                  </div>
                  <ul className="mt-3 space-y-1 text-sm text-gray-700">
                    <li className="inline-flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-sage" /> All gear
                      available
                    </li>
                    <li className="inline-flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-sage" /> Flexible
                      rebooking
                    </li>
                    <li className="inline-flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-sage" /> 7am–11pm
                      planning help
                    </li>
                  </ul>
                  <div className="mt-4 flex gap-2">
                    <Link
                      href="/trips-tours"
                      className="inline-flex items-center justify-center rounded-md bg-ocean text-white px-4 py-2 text-sm font-semibold hover:opacity-95"
                    >
                      Explore Trips
                    </Link>
                    <Link
                      href="/contact"
                      className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
                    >
                      Plan My Day
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
