import Image from "next/image";
import Link from "next/link";
import { Heart, Search, ShoppingCart, User } from "lucide-react";

type ProductCard = {
  sku: string;
  name: string;
  category: string;
  price: string;
  oldPrice?: string;
  rating: number;
  reviews: number;
  shipping: string;
  perks: string[];
  image: string;
  badge: string;
};

type BundleOffer = {
  title: string;
  price: string;
  savings: string;
  items: string[];
  image: string;
  badge: string;
};

type ExpertHighlight = {
  title: string;
  copy: string;
  badge: string;
};

type FAQItem = {
  question: string;
  answer: string;
};

const navLinks: { label: string; href: string }[] = [
  { label: "BCD & Buoyancy", href: "#" },
  { label: "Regulators", href: "#" },
  { label: "Dive Computers", href: "#" },
  { label: "Masks & Snorkels", href: "#" },
  { label: "Fins", href: "#" },
  { label: "Exposure Protection", href: "#" },
  { label: "Underwater Imaging", href: "#" },
  { label: "Accessories", href: "#" },
  { label: "Packages", href: "#" },
];

const heroStats = [
  { label: "Orders Processed", value: "42K+" },
  { label: "Average Delivery", value: "2.4 days" },
  { label: "Customer Rating", value: "4.9/5" },
];

const heroSpotlight: {
  name: string;
  badge: string;
  price: string;
  description: string;
  savings: string;
  image: string;
}[] = [
  {
    name: "Elite Drift Travel Kit",
    badge: "Best Seller",
    price: "$1,199",
    description:
      "Hydros Pro BCD, MK25 EVO/S620 regulator, and G2 dive computer fully assembled and pressure tested.",
    savings: "Save $180 bundle discount",
    image: "https://images.unsplash.com/photo-1528288692140-8bb07c7abe31?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Warm Water Essentials Pack",
    badge: "Campaign Favorite",
    price: "$689",
    description:
      "Mask, snorkel, open-heel fins, lightweight wetsuit, and dive bag curated for tropical liveaboards.",
    savings: "Ships free today",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Cold Water Tech Bundle",
    badge: "Limited Inventory",
    price: "$2,149",
    description:
      "Axiom i3 BCD, Apeks MTX-R regulator set, and 7mm drysuit-ready exposure kit for advanced divers.",
    savings: "Includes free servicing",
    image: "https://images.unsplash.com/photo-1500059853952-0a88c1dcf287?auto=format&fit=crop&w=600&q=80",
  },
];

const featuredDeals: {
  title: string;
  highlight: string;
  description: string;
  ctaLabel: string;
}[] = [
  {
    title: "Dive Week Flash Sale",
    highlight: "Up to 25% off",
    description:
      "Top-performing BCDs and regulators priced for high-intent ad traffic. Valid through Sunday night.",
    ctaLabel: "Shop Flash Sale",
  },
  {
    title: "Bundle & Save Zone",
    highlight: "Avg. $240 savings",
    description:
      "Cross-category gear combos engineered from bestseller data. Auto-applies at checkout—no code needed.",
    ctaLabel: "View Bundles",
  },
  {
    title: "0% APR Financing",
    highlight: "Pre-qualify in 60 sec",
    description:
      "Boost AOV with Klarna and Affirm programs built for action-sport equipment purchases over $299.",
    ctaLabel: "Get Pre-Approved",
  },
];

const productCatalog: ProductCard[] = [
  {
    sku: "SKU-BCD-4821",
    name: "Scubapro Hydros Pro BCD",
    category: "BCD & Buoyancy",
    price: "$1,099",
    oldPrice: "$1,249",
    rating: 4.9,
    reviews: 326,
    shipping: "Free 2-day shipping",
    perks: ["Pre-assembled", "0% APR 6 months"],
    image: "https://images.unsplash.com/photo-1504274066651-8d31a536b11a?auto=format&fit=crop&w=640&q=80",
    badge: "Top Rated",
  },
  {
    sku: "SKU-REG-5732",
    name: "Apeks XTX200 Regulator Set",
    category: "Regulators",
    price: "$899",
    oldPrice: "$999",
    rating: 4.8,
    reviews: 214,
    shipping: "Ships in 24 hours",
    perks: ["Cold-water ready", "Free first service"],
    image: "https://images.unsplash.com/photo-1549194380-ae209378247f?auto=format&fit=crop&w=640&q=80",
    badge: "Dive Pro Pick",
  },
  {
    sku: "SKU-COM-6684",
    name: "Garmin Descent Mk2i Dive Computer",
    category: "Dive Computers",
    price: "$1,499",
    rating: 4.7,
    reviews: 189,
    shipping: "Same-day courier in FL",
    perks: ["Air integration", "Bundle sensor save $100"],
    image: "https://images.unsplash.com/photo-1516924962500-2b4b3b99ea05?auto=format&fit=crop&w=640&q=80",
    badge: "New Arrival",
  },
  {
    sku: "SKU-MASK-2205",
    name: "Atomic Venom Frameless Mask",
    category: "Masks & Snorkels",
    price: "$199",
    rating: 4.8,
    reviews: 641,
    shipping: "Free returns",
    perks: ["Ultra-clear lens", "Anti-fog coating"],
    image: "https://images.unsplash.com/photo-1545160393-8b26420d92c8?auto=format&fit=crop&w=640&q=80",
    badge: "Volume Driver",
  },
  {
    sku: "SKU-FIN-9082",
    name: "Mares Avanti Quattro+ Fins",
    category: "Fins",
    price: "$189",
    oldPrice: "$229",
    rating: 4.6,
    reviews: 512,
    shipping: "Arrives by Friday",
    perks: ["Bonus travel bag", "Buy 2 save 10%"],
    image: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=640&q=80",
    badge: "Bundle & Save",
  },
  {
    sku: "SKU-WET-4130",
    name: "Bare Velocity Ultra Wetsuit 5mm",
    category: "Exposure Protection",
    price: "$439",
    rating: 4.7,
    reviews: 148,
    shipping: "Free fit exchanges",
    perks: ["30-day fit guarantee", "Thermal lined"],
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=640&q=80",
    badge: "Staff Favorite",
  },
];

const assuranceBenefits: { icon: string; title: string; copy: string }[] = [
  {
    icon: "🚚",
    title: "Free 2-Day Shipping",
    copy: "On orders $149+ across the continental US. Optional same-day courier in South Florida.",
  },
  {
    icon: "🛠️",
    title: "Authorized Service Center",
    copy: "Bench-tested regulators and lifetime parts programs with PADI-certified techs.",
  },
  {
    icon: "🔄",
    title: "60-Day Fit Guarantee",
    copy: "Swap sizes fast with prepaid labels and concierge support for pro fit guidance.",
  },
];

const bundleOffers: BundleOffer[] = [
  {
    title: "Pro Diver Essentials Bundle",
    price: "$1,899",
    savings: "Save $260 vs. individual",
    items: ["Hydros Pro BCD", "MK25 EVO Regulator", "G2 Computer", "Aqualung Fins"],
    image: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?auto=format&fit=crop&w=640&q=80",
    badge: "AOV Booster",
  },
  {
    title: "Underwater Imaging Creator Kit",
    price: "$1,259",
    savings: "Bundle bonus light pack",
    items: ["GoPro HERO12", "Dual Video Lights", "Red Filter Set", "Travel Hard Case"],
    image: "https://images.unsplash.com/photo-1516685018646-549198525c1b?auto=format&fit=crop&w=640&q=80",
    badge: "New Traffic Play",
  },
  {
    title: "Family Snorkel 4-Pack",
    price: "$499",
    savings: "Save 18%",
    items: ["4 Tempered Masks", "4 Dry Snorkels", "4 Adjustable Fins", "Mesh Gear Bag"],
    image: "https://images.unsplash.com/photo-1505196298139-8cfce5f36c9a?auto=format&fit=crop&w=640&q=80",
    badge: "Paid Social Hero",
  },
];

const expertHighlights: ExpertHighlight[] = [
  {
    title: "1-on-1 Gear Fitting",
    copy: "Book a 20-minute call with a PADI IDC staff instructor for sizing, configuration, and dive trip packing advice.",
    badge: "Virtual or In-Store",
  },
  {
    title: "Same-Day Assembly",
    copy: "Regulators are oxygen-cleaned, pressure tested, and shipped ready-to-dive with hoses trimmed for your body type.",
    badge: "Bench-Tested",
  },
  {
    title: "Trip Launch Checklist",
    copy: "Download our conversion-optimized packing checklist to cross-sell safety SMBs, save-a-dive tools, and spares.",
    badge: "Increase Attach Rate",
  },
];

const faqs: FAQItem[] = [
  {
    question: "Can I swap sizes if something doesn't fit?",
    answer:
      "Yes. Initiate a free exchange within 60 days and we will ship replacements immediately with a prepaid return label.",
  },
  {
    question: "Do bundles include assembly and testing?",
    answer:
      "Every regulator ships assembled, tuned to manufacturer specs, and includes a test sheet from our service technicians.",
  },
  {
    question: "What financing options are available?",
    answer:
      "Checkout includes Klarna and Affirm installments up to 12 months with 0% APR promos for qualified divers.",
  },
  {
    question: "Can I schedule an in-person demo?",
    answer:
      "Absolutely. Reserve a showroom fitting in Key Largo or request a live video walkthrough of any product.",
  },
];

const StarRating = ({ rating }: { rating: number }) => {
  const rounded = Math.round(rating);

  return (
    <div className="flex items-center gap-2" aria-label={`Rated ${rating.toFixed(1)} out of 5`}>
      <span className="flex" aria-hidden>
        {Array.from({ length: 5 }).map((_, index) => (
          <span
            key={index}
            className={index < rounded ? "text-amber-400" : "text-zinc-600"}
          >
            ★
          </span>
        ))}
      </span>
      <span className="text-xs text-zinc-400">{rating.toFixed(1)}</span>
    </div>
  );
};

const PromoBanner = () => (
  <div className="bg-sky-500 text-zinc-900">
    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] sm:px-6 lg:px-8">
      <span>48-Hour Dive Week Flash: Extra 10% off cart with code DRIFT10</span>
      <button className="rounded-full bg-zinc-950 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-200 transition hover:bg-zinc-900">
        View Offers
      </button>
    </div>
  </div>
);

const SiteHeader = () => (
  <header className="border-b border-zinc-800 bg-zinc-950/85 backdrop-blur">
    <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-5 text-sm sm:px-6 lg:px-8">
      <Link href="/" className="text-2xl font-bold uppercase tracking-[0.25em] text-sky-400">
        DeepCart Dive
      </Link>
      <div className="min-w-[240px] flex-1">
        <label className="flex items-center gap-3 rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2">
          <Search className="h-4 w-4 text-zinc-500" />
          <input
            type="search"
            placeholder="Search BCDs, regulators, fins, snorkels..."
            className="h-9 flex-1 bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
          />
        </label>
      </div>
      <nav className="flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">
        <Link href="#" className="flex items-center gap-2 transition hover:text-sky-300">
          <User className="h-4 w-4" />
          <span>Account</span>
        </Link>
        <Link href="#" className="flex items-center gap-2 transition hover:text-sky-300">
          <Heart className="h-4 w-4" />
          <span>Saved</span>
        </Link>
        <Link href="#" className="flex items-center gap-2 rounded-full bg-sky-400 px-3 py-2 text-zinc-900 transition hover:bg-sky-300">
          <ShoppingCart className="h-4 w-4" />
          <span>Cart</span>
        </Link>
      </nav>
    </div>
  </header>
);

const CategoryNav = () => (
  <nav className="border-b border-zinc-800 bg-zinc-900/70">
    <div className="mx-auto max-w-7xl overflow-x-auto px-4 sm:px-6 lg:px-8">
      <ul className="flex min-w-max items-center gap-6 py-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-zinc-500">
        {navLinks.map((link) => (
          <li key={link.label}>
            <Link href={link.href} className="transition hover:text-sky-300">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  </nav>
);

const HeroSection = () => (
  <section className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
    <div className="relative overflow-hidden rounded-3xl border border-zinc-800">
      <Image
        src="https://images.unsplash.com/photo-1502786129293-79981df4e689?auto=format&fit=crop&w=1600&q=80"
        alt="Diver preparing gear on the dock"
        fill
        priority
        sizes="(min-width: 1024px) 60vw, 100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-950/85 via-zinc-900/70 to-zinc-900/60" />
      <div className="relative flex h-full flex-col justify-between p-10">
        <div className="space-y-4">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-sky-400/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-sky-200">
            Seasonal Spotlight
          </span>
          <h1 className="max-w-xl text-4xl font-semibold leading-tight text-sky-100 sm:text-5xl">
            High-Intent Landing Page for Conversion-Ready Scuba Gear Shoppers
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-zinc-300 sm:text-base">
            Purpose-built for paid social, PLA, and retargeting campaigns. Merchandised hero bundles, urgency messaging, and instant trust signals make checkout the logical next step.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="#"
              className="rounded-full bg-sky-400 px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-zinc-950 shadow-lg shadow-sky-500/40 transition hover:bg-sky-300"
            >
              Shop Campaign Gear
            </Link>
            <Link
              href="#"
              className="rounded-full border border-sky-300/60 px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-sky-200 transition hover:border-sky-300 hover:text-sky-100"
            >
              View Bundle Builder
            </Link>
          </div>
        </div>
        <dl className="mt-8 grid gap-6 text-sm text-zinc-200 sm:grid-cols-3">
          {heroStats.map((stat) => (
            <div key={stat.label}>
              <dt className="uppercase tracking-[0.3em] text-sky-400">{stat.label}</dt>
              <dd className="mt-2 text-2xl font-semibold text-white">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
    <aside className="flex flex-col gap-4 rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6">
      <h2 className="text-lg font-semibold text-white">Featured Kits Ready to Ship</h2>
      <div className="space-y-4">
        {heroSpotlight.map((kit) => (
          <article
            key={kit.name}
            className="flex gap-4 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4"
          >
            <div className="relative h-20 w-20 overflow-hidden rounded-xl">
              <Image
                src={kit.image}
                alt={kit.name}
                fill
                sizes="120px"
                className="object-cover"
              />
            </div>
            <div className="flex-1 space-y-2 text-sm text-zinc-200">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-sky-400/20 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-sky-200">
                  {kit.badge}
                </span>
                <p className="text-sm font-semibold text-white">{kit.price}</p>
              </div>
              <p className="text-xs text-zinc-400">{kit.description}</p>
              <p className="text-xs font-semibold text-sky-300">{kit.savings}</p>
            </div>
          </article>
        ))}
      </div>
      <Link
        href="#"
        className="mt-auto inline-flex items-center justify-center rounded-full border border-sky-400/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-sky-200 transition hover:border-sky-300 hover:text-sky-100"
      >
        See All Campaign Bundles
      </Link>
    </aside>
  </section>
);

const DealsSection = () => (
  <section className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-2xl font-semibold text-white">Deal Zones Built for High-Intent Traffic</h2>
      <Link
        href="#"
        className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300 transition hover:text-sky-200"
      >
        View All Offers
      </Link>
    </div>
    <div className="grid gap-4 md:grid-cols-3">
      {featuredDeals.map((deal) => (
        <article
          key={deal.title}
          className="flex flex-col gap-3 rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-lg shadow-zinc-900/40"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-400">
            {deal.highlight}
          </span>
          <h3 className="text-lg font-semibold text-white">{deal.title}</h3>
          <p className="text-sm leading-relaxed text-zinc-300">{deal.description}</p>
          <Link
            href="#"
            className="mt-auto w-fit rounded-full bg-sky-400 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-zinc-950 transition hover:bg-sky-300"
          >
            {deal.ctaLabel}
          </Link>
        </article>
      ))}
    </div>
  </section>
);

const ProductShowcase = () => (
  <section className="space-y-6">
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-400">
          Hero Product Grid
        </span>
        <h2 className="mt-2 text-2xl font-semibold text-white">Top-Selling Scuba Gear Converting from Ads</h2>
      </div>
      <Link
        href="#"
        className="rounded-full border border-sky-400/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-sky-200 transition hover:border-sky-300 hover:text-sky-100"
      >
        Filter by Category
      </Link>
    </header>
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {productCatalog.map((product) => (
        <article
          key={product.sku}
          className="flex h-full flex-col rounded-3xl border border-zinc-800 bg-zinc-900/70 p-5 shadow-lg shadow-zinc-900/40"
        >
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(min-width: 768px) 33vw, 90vw"
              className="object-cover"
            />
            <span className="absolute left-4 top-4 rounded-full bg-sky-400/25 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-200">
              {product.badge}
            </span>
          </div>
          <div className="flex flex-1 flex-col gap-4 pt-5 text-sm text-zinc-200">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">{product.category}</p>
              <h3 className="text-lg font-semibold text-white">{product.name}</h3>
              <p className="text-xs text-zinc-500">{product.sku}</p>
            </div>
            <div className="space-y-2">
              <StarRating rating={product.rating} />
              <p className="text-xs text-zinc-500">{product.reviews} verified reviews</p>
            </div>
            <div className="flex items-baseline gap-3 text-white">
              <span className="text-xl font-semibold">{product.price}</span>
              {product.oldPrice ? (
                <span className="text-sm text-zinc-500 line-through">{product.oldPrice}</span>
              ) : null}
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">
              {product.shipping}
            </p>
            <ul className="space-y-2 text-xs text-zinc-300">
              {product.perks.map((perk) => (
                <li key={perk} className="flex items-center gap-2">
                  <span className="text-sky-300">•</span>
                  {perk}
                </li>
              ))}
            </ul>
            <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
              <button className="inline-flex items-center gap-2 rounded-full bg-sky-400 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-zinc-950 transition hover:bg-sky-300">
                <ShoppingCart className="h-4 w-4" />
                Add to Cart
              </button>
              <Link
                href="#"
                className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-200 transition hover:text-sky-100"
              >
                Quick View
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  </section>
);

const AssuranceStrip = () => (
  <section className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6">
    <div className="grid gap-6 text-sm text-zinc-200 sm:grid-cols-3">
      {assuranceBenefits.map((benefit) => (
        <article key={benefit.title} className="flex gap-4">
          <span className="text-2xl" aria-hidden>
            {benefit.icon}
          </span>
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-white">{benefit.title}</h3>
            <p className="text-sm leading-relaxed text-zinc-300">{benefit.copy}</p>
          </div>
        </article>
      ))}
    </div>
  </section>
);

const BundleSection = () => (
  <section className="space-y-6">
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-400">
          Bundle Builder
        </span>
        <h2 className="mt-2 text-2xl font-semibold text-white">High-Margin Gear Combos for Paid Traffic</h2>
      </div>
      <Link
        href="#"
        className="rounded-full bg-sky-400 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-zinc-950 transition hover:bg-sky-300"
      >
        Launch Bundle Wizard
      </Link>
    </header>
    <div className="grid gap-6 md:grid-cols-3">
      {bundleOffers.map((bundle) => (
        <article
          key={bundle.title}
          className="flex h-full flex-col gap-4 rounded-3xl border border-zinc-800 bg-zinc-900/70 p-5 shadow-lg shadow-zinc-900/40"
        >
          <div className="relative h-48 overflow-hidden rounded-2xl">
            <Image
              src={bundle.image}
              alt={bundle.title}
              fill
              sizes="(min-width: 768px) 30vw, 100vw"
              className="object-cover"
            />
            <span className="absolute left-4 top-4 rounded-full bg-sky-400/25 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-200">
              {bundle.badge}
            </span>
          </div>
          <div className="flex flex-1 flex-col gap-3 text-sm text-zinc-200">
            <h3 className="text-lg font-semibold text-white">{bundle.title}</h3>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">{bundle.savings}</p>
            <ul className="space-y-2 text-xs text-zinc-300">
              {bundle.items.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="text-sky-300">•</span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-auto flex items-center justify-between">
              <span className="text-xl font-semibold text-white">{bundle.price}</span>
              <Link
                href="#"
                className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-200 transition hover:text-sky-100"
              >
                View Details
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  </section>
);

const ExpertiseSection = () => (
  <section className="grid gap-10 rounded-3xl border border-zinc-800 bg-zinc-900/70 p-8 lg:grid-cols-[1.2fr_0.8fr]">
    <div className="space-y-6 text-sm text-zinc-200">
      <span className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-400">
        Retail Ops Engineered for Conversion
      </span>
      <h2 className="text-3xl font-semibold text-white">Why Divers Trust Our Team for Gear Upgrades</h2>
      <p className="text-base leading-relaxed text-zinc-300">
        Built as a modular layout for CRO testing. Position concierge services, assembly guarantees, and content upgrades near pricing to remove friction while increasing average order value.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {expertHighlights.map((highlight) => (
          <article key={highlight.title} className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-300">
              {highlight.badge}
            </span>
            <h3 className="mt-3 text-base font-semibold text-white">{highlight.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-300">{highlight.copy}</p>
          </article>
        ))}
      </div>
    </div>
    <div className="relative overflow-hidden rounded-3xl border border-zinc-800">
      <Image
        src="https://images.unsplash.com/photo-1526498460520-4c246339dccb?auto=format&fit=crop&w=1200&q=80"
        alt="Dive professional advising customer"
        fill
        sizes="(min-width: 1024px) 35vw, 100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" />
      <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-zinc-950/70 p-5 text-sm text-zinc-200">
        <p className="text-xs uppercase tracking-[0.3em] text-sky-400">Conversion Insight</p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-200">
          Anchor services near premium gear to justify spend and keep high-ticket shoppers on page longer.
        </p>
      </div>
    </div>
  </section>
);

const FAQSection = () => (
  <section className="space-y-6">
    <header className="space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-400">FAQ & Objection Handling</span>
      <h2 className="text-2xl font-semibold text-white">Remove Friction Before Checkout</h2>
      <p className="text-sm leading-relaxed text-zinc-300">
        Place high-value answers where retargeted shoppers land to shorten the decision cycle and reinforce trust.
      </p>
    </header>
    <div className="grid gap-4 lg:grid-cols-2">
      {faqs.map((item) => (
        <details
          key={item.question}
          className="group rounded-2xl border border-zinc-800 bg-zinc-900/70"
        >
          <summary className="cursor-pointer list-none rounded-2xl px-5 py-4 text-sm font-semibold text-white transition group-open:text-sky-300">
            {item.question}
          </summary>
          <div className="border-t border-zinc-800 px-5 py-4 text-sm leading-relaxed text-zinc-300">
            {item.answer}
          </div>
        </details>
      ))}
    </div>
  </section>
);

const BottomCTA = () => (
  <section className="space-y-6 rounded-3xl border border-zinc-800 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 p-10 text-center shadow-lg shadow-zinc-900/40">
    <h2 className="text-3xl font-semibold text-white">Ready to Turn This Concept into a Live Storefront?</h2>
    <p className="mx-auto max-w-2xl text-sm leading-relaxed text-zinc-300">
      This page is a static conversion-first mockup. Wire it to Supabase inventory, Builder.io campaigns, or your preferred commerce engine when you are ready for data. Every section is modular for A/B testing, merchandising swaps, and rapid ad landing experiments.
    </p>
    <div className="flex flex-wrap justify-center gap-4">
      <Link
        href="/dev/product-cards"
        className="rounded-full bg-sky-400 px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-zinc-950 transition hover:bg-sky-300"
      >
        Explore Component Library
      </Link>
      <Link
        href="/dev/design/elements"
        className="rounded-full border border-sky-300/60 px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-sky-200 transition hover:border-sky-300 hover:text-sky-100"
      >
        Review Design System
      </Link>
    </div>
  </section>
);

export default function EcommerceScubaGearMockupPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <PromoBanner />
      <SiteHeader />
      <CategoryNav />
      <main className="mx-auto max-w-7xl space-y-16 px-4 py-12 sm:px-6 lg:px-8">
        <HeroSection />
        <DealsSection />
        <ProductShowcase />
        <AssuranceStrip />
        <BundleSection />
        <ExpertiseSection />
        <FAQSection />
        <BottomCTA />
      </main>
    </div>
  );
}
