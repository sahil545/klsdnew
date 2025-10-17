"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { Navigation } from "../../../client/components/Navigation";
import { Footer } from "../../../client/components/Footer";
import Link from "next/link";
import { ThermometerSun, Clock, Share2, Bookmark, Newspaper, Quote, Twitter, Linkedin } from "lucide-react";

type Section = { heading: string; paragraphs: string[]; image?: { src: string; alt: string } };

const demo = {
  title: "Scuba Diving in Key Largo",
  category: "Key Largo",
  readTime: "6 min read",
  date: "Updated Sep 2025",
  author: { name: "KLSD Editorial", role: "Dive Experts" },
  hero: {
    src: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=2000&q=80",
    alt: "Scuba Diving in Key Largo",
  },
  sections: [
    {
      heading: "Key Largo Weather",
      paragraphs: [
        "Key Largo has great weather year‑round. The hottest month is July and the coolest is February.",
        "Summer days regularly reach the upper 80s to low 90s. In winter, air temps are generally mid‑70s, with frequent warm spells.",
        "Water temps stay warm thanks to the Gulf Stream: May–Oct are typically above 80°F at depth; winter is usually mid‑70s (a thin wetsuit is plenty).",
      ],
      image: {
        src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
        alt: "Key Largo weather overview",
      },
    },
    {
      heading: "Key Largo Scuba Diving Sites",
      paragraphs: [
        "Home to John Pennekamp Coral Reef State Park and within the Florida Keys National Marine Sanctuary, Key Largo borders the world’s third‑largest living barrier reef.",
        "There are 100+ dive sites accessible from Key Largo. Reef dives generally range 30–50 ft; wreck dives are 70–130+ ft, offering options for every skill level.",
        "Visibility is typically excellent (40–100+ ft) with abundant coral and marine life. Plan ahead to lock in the exact sites you want to visit.",
      ],
      image: {
        src: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1600&q=80",
        alt: "Reefs and wrecks in Key Largo",
      },
    },
    {
      heading: "Key Largo Activities",
      paragraphs: [
        "Beyond diving, enjoy jet ski and boat rentals, fishing charters, snorkeling trips, and attractions like Aquarium Encounters, Theater of the Sea, and the History of Diving Museum.",
        "Sunset cruises, kayaking, and paddle boarding are popular. Many hotels have great pools—sometimes the best plan is a pool day with drinks.",
      ],
    },
    {
      heading: "Key Largo Restaurants & Bars",
      paragraphs: [
        "Most bars and restaurants are waterfront with great food, tropical drinks, and live music. It’s laid back—casual dress is standard. End your day bayside for sunset views; some spots will even cook your catch.",
      ],
    },
  ] as Section[],
};

type Variant = "Editorial" | "Magazine" | "Focus" | "Authority";

export default function BlogTemplatesDev() {

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <div className="mx-auto max-w-7xl px-6 py-10">
        <header className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">Authority Blog Template</h1>
            <p className="text-muted-foreground">Professional SEO layout with takeaways, numbered sections, and right sidebar.</p>
          </div>
        </header>

        <AuthorityLayout />
      </div>
      <Footer />
    </div>
  );
}

function MetaChips({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-2 text-xs ${className}`}>
      <span className="inline-flex items-center gap-1 rounded-full bg-black/5 px-2 py-1">
        <Newspaper className="w-3.5 h-3.5" /> Blog
      </span>
      <span className="inline-flex items-center gap-1 rounded-full bg-black/5 px-2 py-1">
        <Clock className="w-3.5 h-3.5" /> {demo.readTime}
      </span>
      <span className="inline-flex items-center gap-1 rounded-full bg-black/5 px-2 py-1">
        <ThermometerSun className="w-3.5 h-3.5" /> {demo.date}
      </span>
    </div>
  );
}

function ShareBar() {
  return (
    <div className="flex items-center justify-between border-t mt-10 pt-6">
      <div className="text-sm text-muted-foreground">Enjoyed this article? Share it:</div>
      <div className="flex gap-2">
        <Link href="#" className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-muted">
          <Share2 className="w-4 h-4" /> Twitter
        </Link>
        <Link href="#" className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-muted">
          <Share2 className="w-4 h-4" /> Facebook
        </Link>
      </div>
    </div>
  );
}

function AdSlot({ label = "Advertisement" }: { label?: string }) {
  return (
    <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground bg-white">
      {label}
    </div>
  );
}

function EditorialLayout() {
  return (
    <div className="relative">
      <div className="relative overflow-hidden rounded-2xl border mb-8">
        <Image
          src={demo.hero.src}
          alt={demo.hero.alt}
          width={1600}
          height={800}
          className="h-72 w-full object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <MetaChips className="text-white" />
          <h1 className="mt-3 text-4xl font-extrabold text-white drop-shadow-sm">
            {demo.title}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="hidden lg:block lg:col-span-3">
          <div className="sticky top-20 space-y-6">
            <div className="rounded-xl border p-5 bg-card">
              <h3 className="text-sm font-semibold mb-3">On this page</h3>
              <nav>
                <ul className="space-y-2 text-sm">
                  {demo.sections.map((s) => (
                    <li key={s.heading}>
                      <a href={`#${slugify(s.heading)}`} className="text-muted-foreground hover:text-foreground">
                        {s.heading}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
            <div className="rounded-xl border p-5 bg-card">
              <h3 className="text-sm font-semibold mb-2">Plan a Dive</h3>
              <p className="text-sm text-muted-foreground">Explore reefs and wrecks with our pro guides.</p>
              <div className="mt-3 flex gap-2">
                <Link href="/trips-tours" className="inline-flex items-center rounded-md bg-ocean-500 px-3 py-2 text-white hover:bg-ocean-600">Book Trip</Link>
                <Link href="/contact-us" className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-muted">Contact</Link>
              </div>
            </div>
            <AdSlot />
          </div>
        </aside>

        <article className="lg:col-span-9">
          <AuthorHeader />
          <div className="mt-6 space-y-10 leading-7">
            {demo.sections.map((s) => (
              <section id={slugify(s.heading)} key={s.heading} className="scroll-mt-24">
                <h2 className="text-3xl font-semibold mb-3">{s.heading}</h2>
                {s.image ? (
                  <figure className="my-6">
                    <Image src={s.image.src} alt={s.image.alt} width={1600} height={900} className="rounded-xl border w-full object-cover max-h-[360px]" />
                  </figure>
                ) : null}
                {s.paragraphs.map((p, i) => (
                  <p key={i} className="text-foreground/90 mt-4">
                    {p}
                  </p>
                ))}
                {s.heading === "Best Time to Visit" ? (
                  <PullQuote text="Warm summer waters and mellow winter seas make Key Largo a year‑round destination." />
                ) : null}
              </section>
            ))}
          </div>
          <ShareBar />
        </article>
      </div>
    </div>
  );
}

function MagazineLayout() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <article className="lg:col-span-8">
        <MetaChips />
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight">{demo.title}</h1>
        <div className="relative mt-6 overflow-hidden rounded-2xl border">
          <Image src={demo.hero.src} alt={demo.hero.alt} width={1600} height={800} className="h-96 w-full object-cover" />
        </div>

        <div className="mt-8 grid sm:grid-cols-2 gap-6">
          {demo.sections.map((s) => (
            <div key={s.heading} className="rounded-xl border p-5 bg-card hover:shadow-sm transition">
              <h3 className="text-xl font-semibold">{s.heading}</h3>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-4">{s.paragraphs[0]}</p>
              <Link href={`#${slugify(s.heading)}`} className="inline-block mt-3 text-ocean-600 hover:underline">
                Read section
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-10 space-y-10">
          {demo.sections.map((s) => (
            <section id={slugify(s.heading)} key={s.heading}>
              <h2 className="text-3xl font-semibold mb-3">{s.heading}</h2>
              {s.paragraphs.map((p, i) => (
                <p key={i} className="text-foreground/90 mt-4">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>
        <ShareBar />
      </article>

      <aside className="lg:col-span-4 space-y-6">
        <div className="rounded-xl border p-5 bg-card">
          <h3 className="font-semibold">Subscribe</h3>
          <p className="text-sm text-muted-foreground mt-1">Get the latest dive guides and gear picks.</p>
          <form className="mt-3 flex gap-2">
            <input className="flex-1 rounded-md border px-3 py-2 text-sm" placeholder="Email address" />
            <button className="rounded-md bg-ocean-500 text-white px-3 py-2 text-sm hover:bg-ocean-600">Join</button>
          </form>
        </div>
        <AdSlot />
        <div className="rounded-xl border p-5 bg-card">
          <h3 className="font-semibold">Popular Guides</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="#" className="hover:underline">Molasses Reef: What to Know</Link></li>
            <li><Link href="#" className="hover:underline">Spiegel Grove Wreck Guide</Link></li>
            <li><Link href="#" className="hover:underline">Snorkeling the Christ of the Abyss</Link></li>
          </ul>
        </div>
      </aside>
    </div>
  );
}

function FocusLayout() {
  const body = useMemo(() => (
    <>
      {demo.sections.map((s) => (
        <section id={slugify(s.heading)} key={s.heading} className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-semibold tracking-tight mb-4">{s.heading}</h2>
          {s.paragraphs.map((p, i) => (
            <p key={i} className="mt-6 text-lg leading-8 text-foreground/90">{p}</p>
          ))}
        </section>
      ))}
    </>
  ), []);

  return (
    <div>
      <div>
        <MetaChips />
        <h1 className="mt-3 text-5xl font-extrabold tracking-tight">{demo.title}</h1>
      </div>
      <div className="relative mt-8 overflow-hidden rounded-3xl border">
        <Image src={demo.hero.src} alt={demo.hero.alt} width={1920} height={960} className="h-[480px] w-full object-cover" />
      </div>

      <AuthorHeader className="max-w-3xl mx-auto" />

      <div className="mt-6 space-y-12">{body}</div>

      <div className="max-w-3xl mx-auto mt-8">
        <PullQuote text="Crystal‑clear water and short rides to the reef make Key Largo the easiest way to fall in love with diving." />
      </div>

      <div className="max-w-3xl mx-auto"><ShareBar /></div>
    </div>
  );
}

function AuthorHeader({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-ocean-500 text-white flex items-center justify-center font-semibold">KL</div>
        <div className="text-sm">
          <div className="font-medium">{demo.author.name}</div>
          <div className="text-muted-foreground">{demo.author.role}</div>
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <button className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 hover:bg-muted">
          <Bookmark className="w-4 h-4" /> Save
        </button>
        <button className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 hover:bg-muted">
          <Share2 className="w-4 h-4" /> Share
        </button>
      </div>
    </div>
  );
}

function PullQuote({ text }: { text: string }) {
  return (
    <blockquote className="rounded-2xl border bg-gradient-to-br from-ocean-50 to-white p-6 text-lg text-foreground/90">
      <div className="flex items-start gap-3">
        <div className="shrink-0 rounded-full bg-ocean-500/20 p-2"><Quote className="w-5 h-5 text-ocean-600" /></div>
        <p className="italic">{text}</p>
      </div>
    </blockquote>
  );
}

function AuthorityLayout() {
  return (
    <div className="relative">
      {/* Sticky share rail on desktop */}
      <div className="hidden xl:block sticky top-24 float-left mr-6">
        <div className="flex flex-col gap-2">
          <Link href="#" className="inline-flex items-center justify-center w-10 h-10 rounded-full border hover:bg-muted" aria-label="Share on X/Twitter">
            <Twitter className="w-4 h-4" />
          </Link>
          <Link href="#" className="inline-flex items-center justify-center w-10 h-10 rounded-full border hover:bg-muted" aria-label="Share on LinkedIn">
            <Linkedin className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Header */}
      <header className="max-w-3xl mr-auto">
        <MetaChips />
        <h1 className="mt-3 text-5xl font-extrabold tracking-tight leading-tight">{demo.title}</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          A strategic guide to planning dives, picking seasons, and choosing sites around Key Largo — optimized for clarity and results.
        </p>
        <AuthorHeader className="mt-6" />
      </header>

      {/* Hero */}
      <div className="relative mt-8 overflow-hidden rounded-3xl border max-w-3xl mr-auto">
        <Image src={demo.hero.src} alt={demo.hero.alt} width={1920} height={960} className="w-full h-auto max-h-[360px] object-cover" />
      </div>

      {/* Main + Right Sidebar */}
      <div className="mt-8 flex flex-col lg:flex-row lg:items-start lg:gap-8">
        {/* Main column */}
        <div className="flex-1 min-w-0">
          {/* Key takeaways */}
          <section>
            <div className="rounded-2xl border bg-card p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Key Takeaways</h2>
              <div className="mt-4 grid sm:grid-cols-2 gap-6">
            <div className="rounded-xl border p-5 bg-card hover:shadow-sm transition">
              <h3 className="text-xl font-semibold">Summer water ≥ 80°F</h3>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-4">Winter mid‑70s with a light wetsuit.</p>
              <Link href={`#${slugify('Key Largo Weather')}`} className="inline-block mt-3 text-ocean-600 hover:underline">Read section</Link>
            </div>
            <div className="rounded-xl border p-5 bg-card hover:shadow-sm transition">
              <h3 className="text-xl font-semibold">Reefs 30–50 ft</h3>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-4">Wrecks 70–130+ ft for advanced divers.</p>
              <Link href={`#${slugify('Key Largo Scuba Diving Sites')}`} className="inline-block mt-3 text-ocean-600 hover:underline">Read section</Link>
            </div>
            <div className="rounded-xl border p-5 bg-card hover:shadow-sm transition">
              <h3 className="text-xl font-semibold">Mix reefs + wrecks</h3>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-4">Book morning and afternoon charters.</p>
              <Link href={`#${slugify('Key Largo Activities')}`} className="inline-block mt-3 text-ocean-600 hover:underline">Read section</Link>
            </div>
            <div className="rounded-xl border p-5 bg-card hover:shadow-sm transition">
              <h3 className="text-xl font-semibold">Visibility 40–100+ ft</h3>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-4">Calm seas, great for all levels.</p>
              <Link href={`#${slugify('Key Largo Restaurants & Bars')}`} className="inline-block mt-3 text-ocean-600 hover:underline">Read section</Link>
            </div>
          </div>
            </div>
          </section>

          {/* Numbered sections */}
          <main className="mt-10">
            <div className="space-y-12">
              {demo.sections.map((s, idx) => (
                <section key={s.heading}>
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <h2 id={slugify(s.heading)} className="scroll-mt-24 text-3xl font-semibold tracking-tight">
                        {s.heading}
                      </h2>
                      {s.image ? (
                        <figure className="my-6">
                          <Image src={s.image.src} alt={s.image.alt} width={1600} height={900} className="rounded-xl border w-full object-cover max-h-[360px]" />
                        </figure>
                      ) : null}
                      {s.paragraphs.map((p, i) => (
                        <p key={i} className="mt-5 leading-7 text-foreground/90">{p}</p>
                      ))}
                    </div>
                  </div>
                </section>
              ))}
            </div>

            {/* Inline CTA */}
            <div className="mt-12 rounded-2xl border p-6 bg-gradient-to-br from-ocean-50 to-white">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold">Plan your Key Largo dive day</h3>
                  <p className="text-sm text-muted-foreground">Speak with our team to tailor reefs, wrecks, and timing to your level.</p>
                </div>
                <div className="flex gap-2">
                  <Link href="/trips-tours" className="inline-flex items-center rounded-md bg-ocean-500 px-3 py-2 text-white hover:bg-ocean-600">Book Now</Link>
                  <Link href="/contact-us" className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-muted">Contact</Link>
                </div>
              </div>
            </div>

            <ShareBar />
          </main>
        </div>

        {/* Right sidebar */}
        <aside className="w-full lg:w-[320px] lg:sticky lg:top-24 space-y-6">
          <div className="rounded-xl border p-5 bg-card">
            <h3 className="font-semibold">Subscribe</h3>
            <p className="text-sm text-muted-foreground mt-1">Get the latest dive guides and gear picks.</p>
            <form className="mt-3 flex gap-2">
              <input className="flex-1 rounded-md border px-3 py-2 text-sm" placeholder="Email address" />
              <button className="rounded-md bg-ocean-500 text-white px-3 py-2 text-sm hover:bg-ocean-600">Join</button>
            </form>
          </div>
          <div className="rounded-xl border p-5 bg-card">
            <h3 className="font-semibold">On this page</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {demo.sections.map((s) => (
                <li key={s.heading}><a href={`#${slugify(s.heading)}`} className="text-muted-foreground hover:underline">{s.heading}</a></li>
              ))}
            </ul>
          </div>
          <AdSlot />
        </aside>
      </div>
    </div>
  );
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}
