import Image from "next/image";
import Link from "next/link";

const heroStats = [
  { label: "Avg. Order Value", value: "$486" },
  { label: "Repeat Customers", value: "64%" },
  { label: "Ships Within", value: "24 hrs" },
];

const sellingPoints = [
  {
    title: "Premium Gear Bundles",
    description:
      "Curated regulator, BCD, and computer kits that save up to 18% compared to buying items individually.",
    icon: "🎒",
  },
  {
    title: "Pro Fitting Concierge",
    description:
      "Live sizing assistance with PADI pros and 30-day fit guarantee on every purchase.",
    icon: "🧑‍🏫",
  },
  {
    title: "Adventure-Ready Financing",
    description:
      "0% APR plans for 6 months and free upgrades when you trade in within two seasons.",
    icon: "💳",
  },
];

const featuredProducts = [
  {
    name: "Scubapro Elite Travel Kit",
    price: "$1,249",
    badge: "Best Seller",
    blurb:
      "Featherweight BCD, balanced reg, and compact console tailored for frequent flyers and liveaboards.",
  },
  {
    name: "Key Largo Reef Starter Pack",
    price: "$699",
    badge: "Bundles Save 15%",
    blurb:
      "Mask, fins, snorkel, wetsuit, and dive computer matched to Florida Keys conditions.",
  },
  {
    name: "Digital Nomad Camera Rig",
    price: "$899",
    badge: "New Arrival",
    blurb:
      "4K action housing kit with dual lights, red filters, and media workflow tutorial for social-ready reels.",
  },
];

const conversionLevers = [
  {
    title: "Instant Savings Calculator",
    copy: "Dynamic callout that shows bundle vs. individual pricing to reinforce value before the CTA.",
  },
  {
    title: "Urgency & Scarcity",
    copy: "Use countdown or low-stock messaging synced to ad campaigns for limited releases.",
  },
  {
    title: "Trust & Proof",
    copy: "Feature review average, warranty badges, and brand logos above the fold for buyer confidence.",
  },
];

const faqs = [
  {
    question: "Can I swap sizes if something doesn\'t fit?",
    answer:
      "Absolutely—initiate a free size exchange within 30 days and we\'ll ship replacements before the return arrives.",
  },
  {
    question: "Do bundles include assembly and testing?",
    answer:
      "Yes, every regulator system is bench-tested by our service techs and arrives ready to dive with hoses configured.",
  },
  {
    question: "What financing options are available?",
    answer:
      "0% APR for qualified buyers, plus seasonal promos for dive pros and returning certification graduates.",
  },
];

export default function ScubaGearMockupPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1518733057094-95b53143d2a7?auto=format&fit=crop&w=1600&q=80"
            alt="Scuba gear hero backdrop"
            fill
            className="object-cover opacity-50"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950/90 to-slate-900/70" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-28 sm:px-8 lg:px-12">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-2xl space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-900/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">
                Conversion Concept • Scuba Gear
              </span>
              <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                Launch Your Next Dive Adventure with <span className="text-sky-300">High-Performance Gear</span>
              </h1>
              <p className="text-base text-slate-200 sm:text-lg">
                Mock layout optimized for paid traffic: immediate value props, bundle-exclusive pricing, and social proof elements positioned for maximum conversions before the fold.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="inline-flex items-center justify-center rounded-full bg-sky-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-400/40 transition hover:-translate-y-0.5 hover:bg-sky-300">
                  Shop Hero Bundles
                </button>
                <button className="inline-flex items-center justify-center rounded-full border border-slate-300/40 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-sky-400 hover:text-sky-300">
                  Explore Financing
                </button>
              </div>
            </div>
            <div className="flex gap-6 rounded-3xl border border-slate-700/60 bg-slate-900/60 p-6 shadow-lg shadow-slate-950/40">
              {heroStats.map((stat) => (
                <div key={stat.label} className="min-w-[120px]">
                  <p className="text-3xl font-semibold text-white">{stat.value}</p>
                  <p className="text-xs uppercase tracking-wider text-slate-400">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-16 px-6 py-16 sm:px-8 lg:px-12">
        <section className="grid gap-6 lg:grid-cols-3">
          {sellingPoints.map((point) => (
            <div
              key={point.title}
              className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-slate-950/40 transition hover:-translate-y-1 hover:border-sky-400/40"
            >
              <span className="text-3xl" aria-hidden>{point.icon}</span>
              <h3 className="text-lg font-semibold text-white">{point.title}</h3>
              <p className="text-sm leading-relaxed text-slate-300">{point.description}</p>
            </div>
          ))}
        </section>

        <section className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 shadow-lg shadow-slate-950/40">
          <div className="grid gap-8 p-8 lg:grid-cols-[1.6fr_1fr] lg:items-center">
            <div className="space-y-6">
              <p className="text-xs uppercase tracking-[0.3em] text-sky-300">
                Product Spotlight Module
              </p>
              <h2 className="text-3xl font-semibold text-white">
                Feature High-Margin Bundles with Story-Driven Value Props
              </h2>
              <p className="text-sm leading-relaxed text-slate-300">
                Hero cards include price anchors, social proof, and copy slots tailored for ad campaign messaging. Swap product info manually while keeping design system consistent.
              </p>
              <div className="grid gap-6 md:grid-cols-3">
                {featuredProducts.map((product) => (
                  <div
                    key={product.name}
                    className="flex h-full flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950/40 p-5"
                  >
                    <span className="text-xs font-semibold uppercase tracking-wider text-sky-300">
                      {product.badge}
                    </span>
                    <div className="mt-3">
                      <h3 className="text-lg font-semibold text-white">{product.name}</h3>
                      <p className="mt-2 text-sm text-slate-300">{product.blurb}</p>
                    </div>
                    <div className="mt-6 flex items-center justify-between text-sm text-white">
                      <span className="text-base font-semibold">{product.price}</span>
                      <button className="rounded-full border border-sky-300/60 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-sky-200 transition hover:bg-sky-300/20">
                        View Concept CTA
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <aside className="flex flex-col gap-5 rounded-2xl border border-slate-800 bg-slate-950/50 p-6">
              <h3 className="text-lg font-semibold text-white">Conversion Toolkit</h3>
              <p className="text-sm text-slate-300">
                Use this column for badges, countdowns, or ad campaign hero copy. The mock shows how to frame urgency without wiring any data.
              </p>
              <ul className="space-y-3 text-sm text-slate-300">
                {conversionLevers.map((lever) => (
                  <li key={lever.title} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-sky-400">
                      {lever.title}
                    </p>
                    <p className="mt-2 leading-relaxed text-slate-300">{lever.copy}</p>
                  </li>
                ))}
              </ul>
              <button className="rounded-full bg-gradient-to-r from-sky-400 via-cyan-400 to-sky-500 px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-sky-500/40 transition hover:brightness-110">
                Mock Checkout CTA
              </button>
            </aside>
          </div>
        </section>

        <section className="grid gap-10 rounded-3xl border border-slate-800 bg-slate-900/60 p-8 shadow-lg shadow-slate-950/40 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-sky-300">
              <span className="h-[2px] w-10 bg-sky-400" />
              <span className="text-xs uppercase tracking-[0.3em]">Trust Signals</span>
            </div>
            <h2 className="text-3xl font-semibold text-white">Proof That Drives High-Intent Traffic to Convert</h2>
            <p className="text-sm leading-relaxed text-slate-300">
              This block highlights review summaries, warranty promises, and partner logos. Swap the placeholders with actual testimonials or brand mark grid when connecting to CMS data.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5 text-sm">
                <p className="text-3xl font-semibold text-white">4.9/5</p>
                <p className="mt-2 text-slate-300">Average rating across 2,100 verified buyers</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5 text-sm">
                <p className="text-lg font-semibold text-white">Lifetime Service Guarantee</p>
                <p className="mt-2 text-slate-300">
                  Free annual inspections and discounted rebuilds for members.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
              <span className="rounded-full border border-slate-700/80 px-4 py-2">Scubapro Platinum Dealer</span>
              <span className="rounded-full border border-slate-700/80 px-4 py-2">PADI 5★ IDC</span>
              <span className="rounded-full border border-slate-700/80 px-4 py-2">Authorized Service Center</span>
            </div>
          </div>

          <aside className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-400">
              Campaign Persona Highlight
            </h3>
            <p className="text-sm leading-relaxed text-slate-300">
              “Insert testimonial or influencer quote along with succinct ROI metric related to the ad group. Keep under 80 words for readability.”
            </p>
            <p className="text-xs font-semibold text-slate-400">— Placeholder Ambassador, Dive Travel Creator</p>
            <Link
              href="/dev/product-cards"
              className="mt-2 w-fit rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-200 transition hover:border-sky-400 hover:text-sky-300"
            >
              Reference Product Card Library
            </Link>
          </aside>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 shadow-lg shadow-slate-950/40">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-start">
            <div>
              <h2 className="text-2xl font-semibold text-white">FAQ & Objection Handling</h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-300">
                Use this accordion to preempt common hesitations before the checkout CTA. Replace copy with actual policy text later.
              </p>
              <div className="mt-6 space-y-4">
                {faqs.map((faq) => (
                  <div
                    key={faq.question}
                    className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5"
                  >
                    <p className="text-sm font-semibold text-white">{faq.question}</p>
                    <p className="mt-2 text-sm text-slate-300">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 text-sm text-slate-300">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                Retargeting Angle
              </p>
              <p className="mt-3">
                Feature a "second chance" discount or reminder for cart abandon flows. Include copy cues that align with ad creative and use gradient CTA below.
              </p>
              <button className="mt-6 w-full rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-cyan-400 px-4 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-emerald-400/30 transition hover:brightness-110">
                Mock Incentive CTA
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 p-10 text-center shadow-lg shadow-slate-950/40">
          <h2 className="text-3xl font-semibold text-white">
            Ready to deploy this layout?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-300">
            This page is a static mockup only. When you\'re ready, wire it to Supabase product data or Builder content. Duplicate sections to test different ad cohorts without engineering effort.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <button className="rounded-full bg-sky-400 px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-sky-500/40 transition hover:bg-sky-300">
              Duplicate Mockup
            </button>
            <Link
              href="/dev/design/elements"
              className="rounded-full border border-slate-300/40 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-sky-400 hover:text-sky-300"
            >
              View Design Elements Library
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
