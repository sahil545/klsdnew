import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { Navigation } from "@/components/Navigation";
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Heart,
  Info,
  Package,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
} from "lucide-react";

export type ColorOption = {
  label: string;
  value: string;
  swatch?: string;
  badge?: string;
  image?: string;
  price?: string;
  shipEstimate?: string;
};

export type SizeOption = {
  label: string;
  value: string;
  description?: string;
  badge?: string;
  priceModifier?: string;
};

export type EcommerceProductContent = {
  name?: string;
  shortDescription?: string;
  price?: string;
  heroImage?: string;
  galleryImages?: Array<{ src: string; alt?: string }>;
  colorOptions?: ColorOption[];
  sizeOptions?: SizeOption[];
};

export type EcommerceScubaGearProductTemplateProps = {
  product?: EcommerceProductContent;
};

type SellingPoint = {
  title: string;
  description: string;
  icon: ReactNode;
};

type BenefitHighlight = {
  label: string;
  copy: string;
};

type ReviewHighlight = {
  title: string;
  body: string;
  author: string;
  rating: number;
};

type Specification = {
  label: string;
  value: string;
};

type CrossSell = {
  name: string;
  description: string;
  price: string;
  image: string;
  tag: string;
};

type HeroImage = { src: string; alt?: string };

type ProductHeroProps = {
  productName: string;
  heroDescription: string;
  priceDisplay: string;
  heroImages: HeroImage[];
  colorOptions: ColorOption[];
  sizeOptions: SizeOption[];
};

type StickyCheckoutBarProps = {
  productName: string;
  priceDisplay: string;
  selectedColorLabel?: string;
  selectedSizeLabel?: string;
};

const defaultColorOptions: ColorOption[] = [
  {
    label: "Midnight Black",
    value: "black",
    swatch: "#0f172a",
    badge: "Most Popular",
    image:
      "https://cdn.builder.io/api/v1/image/assets%2F2a778920e8d54a37b1576086f79dd676%2F23c7a7dcc12240a1b3e37f5b0a591d4d?format=webp&width=600",
    price: "$1,149.00",
    shipEstimate: "Ships today",
  },
  {
    label: "Seafoam Teal",
    value: "seafoam",
    swatch: "#2dd4bf",
    image:
      "https://cdn.builder.io/api/v1/image/assets%2F2a778920e8d54a37b1576086f79dd676%2F848c836e9fd448f989d6ad1e724c6c83?format=webp&width=600",
    price: "$1,189.00",
    shipEstimate: "Ships by Friday",
  },
  {
    label: "Signal Orange",
    value: "orange",
    swatch: "#f97316",
    badge: "Low Stock",
    image:
      "https://cdn.builder.io/api/v1/image/assets%2F2a778920e8d54a37b1576086f79dd676%2F0bddff050630406c9e73b7be081d7b85?format=webp&width=600",
    price: "$1,237.00",
    shipEstimate: "Ships Saturday",
  },
  {
    label: "Arctic White",
    value: "white",
    swatch: "#f8fafc",
    image:
      "https://cdn.builder.io/api/v1/image/assets%2F2a778920e8d54a37b1576086f79dd676%2Fee7fa317614a45dabc84a3a96b05949e?format=webp&width=600",
    price: "$1,199.00",
    shipEstimate: "Ships Monday",
  },
];

const defaultSizeOptions: SizeOption[] = [
  {
    label: "S",
    value: "s",
    description: "Chest 34-38 in",
  },
  {
    label: "M",
    value: "m",
    badge: "Fits 68% of divers",
    description: "Chest 38-42 in",
  },
  {
    label: "L",
    value: "l",
    description: "Chest 42-46 in",
  },
  {
    label: "XL",
    value: "xl",
    priceModifier: "+$40",
    description: "Chest 46-50 in",
  },
];

const sellingPoints: SellingPoint[] = [
  {
    title: "Adaptive Lift System",
    description:
      "Auto-adjusts buoyancy and airflow routing as you change depth for steadier neutral buoyancy.",
    icon: <Package className="h-5 w-5" />,
  },
  {
    title: "CarbonFlex Backplate",
    description:
      "High-strength carbon fiber harness eliminates pressure points during long multi-dive days.",
    icon: <ShieldCheck className="h-5 w-5" />,
  },
  {
    title: "Travel-Ready Build",
    description:
      "Folds into a 17 lb carry setup with quick-release weight pockets and modular accessory rails.",
    icon: <Truck className="h-5 w-5" />,
  },
];

const benefits: BenefitHighlight[] = [
  {
    label: "Ships Today",
    copy: "Order by 3pm ET, leaves our warehouse same-day.",
  },
  {
    label: "Gear Concierge",
    copy: "30-minute setup call with a PADI IDC instructor.",
  },
  {
    label: "Lifetime Service",
    copy: "Free first annual inspection on regulator pairings.",
  },
];

const reviewHighlights: ReviewHighlight[] = [
  {
    title: "Game changer for current diving",
    body: "I upgraded from a jacket-style BCD and immediately felt the difference. The HarnessLock keeps everything tight even in strong drift. Love the modular storage for reels and DSMBs.",
    author: "Taylor P.",
    rating: 5,
  },
  {
    title: "Worth the investment",
    body: "As a dive guide I need gear that takes a beating. The carbon backplate distributes weight perfectly and dries fast between double tank days.",
    author: "Marco D.",
    rating: 5,
  },
];

const specifications: Specification[] = [
  { label: "Lift Capacity", value: "35 lbs (all sizes)" },
  { label: "Weight System", value: "Integrated quick-release, 20 lb total" },
  {
    label: "Material",
    value: "Cordura® 1000D exterior / Carbon composite frame",
  },
  { label: "D-Rings", value: "9 stainless + 4 polymer modular rails" },
  { label: "Travel Weight", value: "7.4 lbs including inflator hose" },
  { label: "Warranty", value: "Limited lifetime on seams and hardware" },
];

const crossSells: CrossSell[] = [
  {
    name: "Apeks XTX200 Regulator Set",
    description: "Bundle to save $120 and qualify for free annual tuning.",
    price: "$899",
    image:
      "https://cdn.builder.io/api/v1/image/assets%2F2a778920e8d54a37b1576086f79dd676%2F0482fc0916204d54bd87feacec174810?format=webp&width=800",
    tag: "Bundle & Save",
  },
  {
    name: "Garmin Descent Mk2i Computer",
    description: "Add for $1,499 and unlock air integration training series.",
    price: "$1,499",
    image:
      "https://cdn.builder.io/api/v1/image/assets%2F2a778920e8d54a37b1576086f79dd676%2Fbd5cade6f9e0413fb9f2e4aa76bb9c9b?format=webp&width=800",
    tag: "Financing eligible",
  },
  {
    name: "Save-A-Dive Pro Kit",
    description:
      "Attach to rear MOLLE rail. Includes spares, tools, and SMB clip.",
    price: "$129",
    image:
      "https://cdn.builder.io/api/v1/image/assets%2F2a778920e8d54a37b1576086f79dd676%2Fad0f299121a04071ae1d868169fe9612?format=webp&width=800",
    tag: "Attach Rate Leader",
  },
];

const defaultProductImages: HeroImage[] = [
  {
    src: "https://cdn.builder.io/api/v1/image/assets%2F2a778920e8d54a37b1576086f79dd676%2F23c7a7dcc12240a1b3e37f5b0a591d4d?format=webp&width=1600",
    alt: "Hydros Apex Elite BCD displayed in Key Largo showroom",
  },
  {
    src: "https://cdn.builder.io/api/v1/image/assets%2F2a778920e8d54a37b1576086f79dd676%2F848c836e9fd448f989d6ad1e724c6c83?format=webp&width=1600",
    alt: "BCD harness and tank setup on charter boat deck",
  },
  {
    src: "https://cdn.builder.io/api/v1/image/assets%2F2a778920e8d54a37b1576086f79dd676%2F0bddff050630406c9e73b7be081d7b85?format=webp&width=1600",
    alt: "BCD profile floating over coral reef at sunset",
  },
  {
    src: "https://cdn.builder.io/api/v1/image/assets%2F2a778920e8d54a37b1576086f79dd676%2Fee7fa317614a45dabc84a3a96b05949e?format=webp&width=1600",
    alt: "BCD laid flat with modular storage accessories and hoses",
  },
  {
    src: "https://cdn.builder.io/api/v1/image/assets%2F2a778920e8d54a37b1576086f79dd676%2F198e7a8298c647d3a3d8a31c569f2887?format=webp&width=1600",
    alt: "BCD paired with regulator set prepared for dive boat",
  },
  {
    src: "https://cdn.builder.io/api/v1/image/assets%2F2a778920e8d54a37b1576086f79dd676%2F2214cf8fb3ff4fcb9356f53c710a4205?format=webp&width=1600",
    alt: "BCD and fins packed in travel case for getaway",
  },
];

const ColorVariants = ({ options }: { options: ColorOption[] }) => {
  if (!options.length) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
          Select Color
        </h3>
        <span className="hidden text-xs font-medium text-slate-400 sm:block">
          Tap to view the studio finish
        </span>
      </div>
      <div
        className="flex gap-4 overflow-x-auto pb-1 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-4 color-variant-cls"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          overflowX: "scroll",
        }}
      >
        {options.map((option) => {
          const previewImage = option.image ?? defaultProductImages[0]?.src ?? "";
          const swatchBadge = option.swatch ? (
            <span
              className="h-5 w-5 rounded-full border border-white/40"
              style={{ backgroundColor: option.swatch }}
            />
          ) : (
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/40 bg-slate-200 text-[10px] font-semibold text-slate-600">
              {option.label.charAt(0).toUpperCase()}
            </span>
          );

          return (
            <button
              key={option.value}
              type="button"
              className="group flex h-full min-w-[160px] shrink-0 flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-[0_12px_32px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:border-sky-400/70 hover:shadow-[0_20px_48px_rgba(14,165,233,0.22)]"
            >
              <div className="relative h-24 w-full max-w-[160px] overflow-hidden rounded-xl border border-slate-200">
                <Image
                  src={previewImage}
                  alt={`${option.label} color preview`}
                  fill
                  sizes="(min-width: 1024px) 200px, (min-width: 768px) 25vw, 160px"
                  className="object-cover transition duration-300 group-hover:scale-105"
                />
                {option.badge && (
                  <span className="absolute left-2 top-2 rounded-full bg-sky-500/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-sky-600">
                    {option.badge}
                  </span>
                )}
              </div>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white shadow-inner">
                {swatchBadge}
              </span>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-900">
                  {option.label}
                </p>
                {option.price && (
                  <p className="text-xs font-semibold text-slate-500">
                    {option.price}
                  </p>
                )}
                {option.shipEstimate && (
                  <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">
                    {option.shipEstimate}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};

const SizeVariants = ({ options }: { options: SizeOption[] }) => {
  if (!options.length) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
          Choose Size
        </h3>
        <span className="hidden text-xs font-medium text-slate-400 sm:block">
          Tailored fit guidance
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className="group relative flex h-full flex-col gap-2 rounded-xl border border-slate-200/80 bg-white p-4 text-left shadow-[0_8px_22px_rgba(15,23,42,0.08)] transition duration-200 hover:-translate-y-1 hover:border-sky-400/70 hover:shadow-[0_16px_36px_rgba(14,165,233,0.18)]"
          >
            <span className="text-lg font-semibold tracking-tight text-slate-900">
              {option.label}
            </span>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">
              {option.badge ?? "In stock"}
            </p>
            {option.priceModifier && (
              <p className="text-xs font-semibold text-slate-500">
                {option.priceModifier}
              </p>
            )}
            {option.description && (
              <p className="text-xs text-slate-500">{option.description}</p>
            )}
            <span
              className="pointer-events-none absolute inset-x-3 bottom-0 h-[3px] rounded-full bg-slate-200 transition duration-200 group-hover:bg-gradient-to-r group-hover:from-sky-400 group-hover:via-sky-300 group-hover:to-sky-500"
              aria-hidden
            />
          </button>
        ))}
      </div>
    </section>
  );
};

const SellingPoints = () => (
  <div className="grid gap-6 sm:grid-cols-3">
    {sellingPoints.map((point) => (
      <article
        key={point.title}
        className="rounded-3xl border border-slate-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.06)] p-6"
      >
        <div className="flex items-center gap-3 text-sky-600">
          {point.icon}
          <span className="text-xs uppercase tracking-[0.3em]">
            Pro Feature
          </span>
        </div>
        <h3 className="mt-3 text-lg font-semibold text-slate-900">
          {point.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {point.description}
        </p>
      </article>
    ))}
  </div>
);

const BenefitsStrip = () => (
  <div className="flex flex-wrap items-center gap-4 rounded-3xl border border-slate-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.06)] p-5 text-sm text-slate-700">
    {benefits.map((benefit) => (
      <div key={benefit.label} className="flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-sky-600" />
        <div>
          <p className="font-semibold text-slate-900">{benefit.label}</p>
          <p className="text-xs text-slate-500">{benefit.copy}</p>
        </div>
      </div>
    ))}
  </div>
);

const ReviewCallouts = () => (
  <div className="grid gap-4 md:grid-cols-2">
    {reviewHighlights.map((review) => (
      <article
        key={review.title}
        className="rounded-3xl border border-slate-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.06)] p-6"
      >
        <div className="flex items-center gap-2 text-amber-300" aria-hidden>
          {Array.from({ length: review.rating }).map((_, index) => (
            <Star key={index} className="h-4 w-4 fill-current" />
          ))}
        </div>
        <h3 className="mt-3 text-base font-semibold text-slate-900">
          {review.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {review.body}
        </p>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
          {review.author}
        </p>
      </article>
    ))}
  </div>
);

const SpecsGrid = () => (
  <dl className="grid gap-3 sm:grid-cols-2">
    {specifications.map((spec) => (
      <div
        key={spec.label}
        className="rounded-2xl border border-slate-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.06)] p-4"
      >
        <dt className="text-xs uppercase tracking-[0.3em] text-slate-500">
          {spec.label}
        </dt>
        <dd className="mt-1 text-sm font-semibold text-slate-900">
          {spec.value}
        </dd>
      </div>
    ))}
  </dl>
);

const CrossSellGrid = () => (
  <div className="grid gap-4 md:grid-cols-3">
    {crossSells.map((item) => (
      <article
        key={item.name}
        className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.06)]"
      >
        <div className="relative h-40 overflow-hidden rounded-t-3xl">
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover"
          />
          <span className="absolute left-4 top-4 rounded-full bg-sky-400/25 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-700">
            {item.tag}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-3 p-5 text-sm text-slate-700">
          <h3 className="text-base font-semibold text-slate-900">
            {item.name}
          </h3>
          <p className="text-xs text-slate-500">{item.description}</p>
          <div className="mt-auto flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-900">
              {item.price}
            </span>
            <Link
              href="#"
              className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-700 transition hover:text-sky-500"
            >
              Add Bundle
            </Link>
          </div>
        </div>
      </article>
    ))}
  </div>
);

const StickyCheckoutBar = ({
  productName,
  priceDisplay,
  selectedColorLabel,
  selectedSizeLabel,
}: StickyCheckoutBarProps) => {
  const selectionSummary = [selectedColorLabel, selectedSizeLabel]
    .filter((value): value is string => Boolean(value && value.trim().length))
    .join(" • ");

  return (
    <div className="sticky bottom-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 text-sm sm:px-6">
        <div className="flex items-center gap-3 text-slate-900">
          <ShoppingBag className="h-5 w-5 text-sky-600" />
          <div>
            <p className="font-semibold">{productName}</p>
            <p className="text-xs text-slate-500">
              {selectionSummary || "Select options to continue"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-900">{priceDisplay}</p>
            <p className="text-xs text-slate-500">Includes free 2-day shipping</p>
          </div>
          <button className="rounded-full bg-sky-400 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-sky-300">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

const PromoBanner = () => (
  <div className="bg-gradient-to-r from-sky-500 to-cyan-400 text-zinc-900">
    <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] sm:px-6">
      <span>
        Flash Bonus: Add a regulator today and get complimentary assembly ($60
        value)
      </span>
      <button className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-slate-800">
        View Bundle Builder
      </button>
    </div>
  </div>
);

const ProductHero = ({
  productName,
  heroDescription,
  priceDisplay,
  heroImages,
  colorOptions,
  sizeOptions,
}: ProductHeroProps) => (
  <section className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.75fr)] xl:gap-12">
    <div className="space-y-6 lg:sticky lg:top-28 lg:self-start">
      <div className="rounded-3xl border border-slate-200 bg-white px-3 py-5 shadow-[0_12px_32px_rgba(15,23,42,0.06)] sm:px-5">
        <div className="lg:flex lg:h-[560px] lg:gap-5">
          <div className="relative h-[420px] overflow-hidden rounded-3xl lg:h-full lg:flex-[1.35]">
            <Image
              src={heroImages[0]?.src ?? defaultProductImages[0].src}
              alt={heroImages[0]?.alt ?? productName}
              fill
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="object-cover"
              priority
            />
          </div>
          <div className="mt-4 flex gap-3 overflow-x-auto lg:mt-0 lg:h-full lg:w-[220px] lg:flex-col lg:overflow-y-auto lg:overflow-x-visible">
            {heroImages.slice(1).map((image) => (
              <div
                key={image.src}
                className="relative h-28 min-w-[180px] overflow-hidden rounded-2xl border border-slate-200 bg-white lg:h-32 lg:min-w-0"
              >
                <Image
                  src={image.src}
                  alt={image.alt ?? productName}
                  fill
                  sizes="(min-width: 1024px) 12vw, 180px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <SellingPoints />
    </div>

    <aside className="flex flex-col gap-6 rounded-3xl border border-slate-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.06)] px-7 py-8 lg:px-9">
      <div className="flex items-start justify-between">
        <span className="rounded-full bg-sky-400/25 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-700">
          Exclusive Launch
        </span>
        <button className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-sky-600">
          <Heart className="h-4 w-4" /> Save for Later
        </button>
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">{productName}</h1>
        <p className="text-sm leading-relaxed text-slate-600">
          {heroDescription}
        </p>
      </div>
      <div className="flex items-center gap-3 text-sm text-slate-600">
        <div className="flex items-center gap-1 text-amber-300" aria-hidden>
          {Array.from({ length: 5 }).map((_, index) => (
            <Star key={index} className="h-4 w-4 fill-current" />
          ))}
        </div>
        <span>4.9 (248 reviews)</span>
        <span className="text-slate-500">•</span>
        <button className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600">
          Read all
        </button>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-2xl font-semibold text-slate-900">{priceDisplay}</p>
            <p className="text-xs uppercase tracking-[0.3em] text-sky-600">
              Free 2-day shipping
            </p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p>Split payments from $104/mo</p>
            <button className="mt-1 inline-flex items-center gap-1 text-sky-600">
              <CreditCard className="h-3.5 w-3.5" /> See options
            </button>
          </div>
        </div>
        <div className="mt-4 space-y-6">
          <ColorVariants options={colorOptions} />
          <SizeVariants options={sizeOptions} />
        </div>
        <div className="mt-6 flex flex-col gap-3">
          <button className="w-full rounded-full bg-sky-400 px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-sky-300">
            Add to Cart
          </button>
          <button className="w-full rounded-full border border-sky-400/60 px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-sky-700 transition hover:border-sky-500 hover:text-sky-600">
            Book Virtual Fitting
          </button>
        </div>
        <div className="mt-4 space-y-3 text-xs text-slate-500">
          <div className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 text-sky-600" />
            <span>
              All orders include 60-day fit guarantee and complimentary hose
              configuration.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <Truck className="mt-0.5 h-4 w-4 text-sky-600" />
            <span>
              Free courier delivery in South Florida. Returns processed in under
              48 hours.
            </span>
          </div>
        </div>
      </div>
      <BenefitsStrip />
    </aside>
  </section>
);

const DetailContent = () => (
  <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.06)] p-6">
        <div className="flex items-center gap-3 text-sky-600">
          <Info className="h-5 w-5" />
          <span className="text-xs uppercase tracking-[0.3em]">
            Why divers choose it
          </span>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          Designed alongside technical instructors in Key Largo drift channels,
          Hydros Apex Elite balances streamlined trim with accessibility.
          Quick-release shoulder ladders make donning effortless, while the
          adaptive wing redistributes lift to keep you neutrally buoyant even
          when gas shifts during multi-tank dives.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-slate-700">
          <li className="flex items-start gap-2">
            <ArrowRight className="mt-1 h-4 w-4 text-sky-600" />
            <span>
              Includes accessory docking rail for DSMB, reel, and camera arms.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <ArrowRight className="mt-1 h-4 w-4 text-sky-600" />
            <span>
              HarnessLock system maintains custom fit between fresh and salt
              water conditions.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <ArrowRight className="mt-1 h-4 w-4 text-sky-600" />
            <span>
              Pair with any DIN or Yoke regulator using included adapter kit.
            </span>
          </li>
        </ul>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.06)] p-6">
        <h2 className="text-lg font-semibold text-slate-900">Customer Proof</h2>
        <p className="text-sm text-slate-600">
          248 reviews • 97% would recommend • Lifetime service center
        </p>
        <ReviewCallouts />
        <Link
          href="#"
          className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-sky-600"
        >
          Read full reviews <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.06)] p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Technical Specifications
        </h2>
        <SpecsGrid />
      </div>
    </div>

    <aside className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.06)] p-6">
        <h2 className="text-lg font-semibold text-slate-900">Bundle Builder</h2>
        <p className="text-sm text-slate-600">
          Boost average order value with pre-configured pairings.
        </p>
        <CrossSellGrid />
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.06)] p-6">
        <h2 className="text-lg font-semibold text-slate-900">Need a hand?</h2>
        <p className="text-sm text-slate-600">
          Schedule a fit consultation or in-store demo in minutes. Perfect for
          ad traffic looking for validation before checkout.
        </p>
        <div className="mt-4 flex flex-col gap-3 text-sm text-slate-700">
          <button className="rounded-full bg-sky-400 px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-sky-300">
            Book 1:1 fitting
          </button>
          <button className="rounded-full border border-sky-400/60 px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-sky-700 transition hover:border-sky-500 hover:text-sky-600">
            Message a dive pro
          </button>
        </div>
        <p className="mt-4 text-xs text-slate-500">
          Response in under 5 minutes daily 8am–10pm ET.
        </p>
      </div>
    </aside>
  </section>
);

const BottomCTA = () => (
  <section className="space-y-6 rounded-3xl border border-slate-200 bg-gradient-to-r from-sky-100 via-white to-sky-100 p-10 text-center">
    <h2 className="text-3xl font-semibold text-slate-900">
      Ready to deploy this product page?
    </h2>
    <p className="mx-auto max-w-2xl text-sm leading-relaxed text-slate-600">
      This is a static concept. When you are ready, connect to Supabase product
      inventory or Builder.io campaigns to drive the pricing, variant
      availability, and reviews dynamically. Every element is modular for rapid
      CRO testing.
    </p>
    <div className="flex flex-wrap justify-center gap-4">
      <Link
        href="/dev/product-cards"
        className="rounded-full bg-sky-400 px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-sky-300"
      >
        Browse Component Library
      </Link>
      <Link
        href="/dev/design/elements"
        className="rounded-full border border-sky-300/60 px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-sky-700 transition hover:border-sky-400 hover:text-sky-600"
      >
        Review Design Tokens
      </Link>
    </div>
  </section>
);

export function EcommerceScubaGearProductTemplate({
  product,
}: EcommerceScubaGearProductTemplateProps) {
  const fallbackProduct: Required<EcommerceProductContent> = {
    name: "Hydros Apex Elite Modular BCD",
    shortDescription:
      "Built for divers who demand adaptability. Modular harness architecture, carbon-reinforced backplate, and auto-balancing lift keep you streamlined from drift dives to wreck penetrations.",
    price: "$1,149",
    heroImage: defaultProductImages[0].src,
    galleryImages: defaultProductImages,
    colorOptions: defaultColorOptions,
    sizeOptions: defaultSizeOptions,
  };

  const resolvedProduct: Required<EcommerceProductContent> = {
    name: product?.name?.trim().length ? product.name : fallbackProduct.name,
    shortDescription:
      product?.shortDescription?.trim().length
        ? product.shortDescription!
        : fallbackProduct.shortDescription,
    price: product?.price?.trim().length ? product.price! : fallbackProduct.price,
    heroImage:
      product?.heroImage?.trim().length
        ? product.heroImage!
        : fallbackProduct.heroImage,
    galleryImages:
      product?.galleryImages?.length
        ? product.galleryImages!.map((image, index) => ({
            src: image.src,
            alt:
              image.alt && image.alt.trim().length > 0
                ? image.alt
                : `${product?.name ?? fallbackProduct.name} image ${index + 1}`,
          }))
        : fallbackProduct.galleryImages,
    colorOptions:
      product?.colorOptions?.length
        ? product.colorOptions
        : fallbackProduct.colorOptions,
    sizeOptions:
      product?.sizeOptions?.length
        ? product.sizeOptions
        : fallbackProduct.sizeOptions,
  };

  const heroImages = resolvedProduct.galleryImages.length
    ? resolvedProduct.galleryImages
    : fallbackProduct.galleryImages;

  const colorOptionsData = resolvedProduct.colorOptions.length
    ? resolvedProduct.colorOptions
    : fallbackProduct.colorOptions;
  const sizeOptionsData = resolvedProduct.sizeOptions.length
    ? resolvedProduct.sizeOptions
    : fallbackProduct.sizeOptions;
  const selectedColorLabel = colorOptionsData[0]?.label;
  const selectedSizeLabel = sizeOptionsData[0]?.label;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navigation />
      <div className="pt-24">
        <PromoBanner />
        <main className="mx-auto max-w-7xl space-y-16 px-3 py-12 sm:px-5 lg:px-6 xl:px-8">
          <ProductHero
            productName={resolvedProduct.name}
            heroDescription={resolvedProduct.shortDescription}
            priceDisplay={resolvedProduct.price}
            heroImages={heroImages}
            colorOptions={colorOptionsData}
            sizeOptions={sizeOptionsData}
          />
          <DetailContent />
          <BottomCTA />
        </main>
        <StickyCheckoutBar
          productName={resolvedProduct.name}
          priceDisplay={resolvedProduct.price}
          selectedColorLabel={selectedColorLabel}
          selectedSizeLabel={selectedSizeLabel}
        />
      </div>
    </div>
  );
}

export default EcommerceScubaGearProductTemplate;
