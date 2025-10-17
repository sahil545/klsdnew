"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Newspaper, Clock, Share2, Twitter, Linkedin, Bookmark } from "lucide-react";

export function AuthorityBlogLayout({
  title,
  author,
  dateLabel,
  hero,
  excerpt,
  takeaways = [],
  body,
  sidebar = null,
}: {
  title: string;
  author?: string | null;
  dateLabel?: string | null;
  hero?: { src: string; alt?: string } | null;
  excerpt?: string | null;
  takeaways?: { title: string; description?: string | null; href?: string | null }[];
  body: React.ReactNode;
  sidebar?: React.ReactNode;
}) {
  return (
    <div className="relative">
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

      <header className="max-w-3xl mr-auto">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full bg-black/5 px-2 py-1"><Newspaper className="w-3.5 h-3.5" /> Blog</span>
          {dateLabel ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-black/5 px-2 py-1"><Clock className="w-3.5 h-3.5" /> {dateLabel}</span>
          ) : null}
        </div>
        <h1 className="mt-3 text-5xl font-extrabold tracking-tight leading-tight">{title}</h1>
        {excerpt ? <p className="mt-3 text-lg text-muted-foreground">{excerpt}</p> : null}
        <div className="flex items-center gap-2 text-sm mt-4">
          {author ? <span className="text-muted-foreground">{author}</span> : null}
          <button className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 hover:bg-muted">
            <Bookmark className="w-4 h-4" /> Save
          </button>
          <button className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 hover:bg-muted">
            <Share2 className="w-4 h-4" /> Share
          </button>
        </div>
      </header>

      {hero?.src ? (
        <div className="relative mt-8 overflow-hidden rounded-3xl border max-w-3xl mr-auto">
          <Image src={hero.src} alt={hero.alt || ""} width={1920} height={960} className="w-full h-auto max-h-[360px] object-cover" />
        </div>
      ) : null}

      {Array.isArray(takeaways) && takeaways.length > 0 ? (
        <section className="mt-8 max-w-3xl mr-auto">
          <div className="rounded-2xl border bg-card p-6 sm:p-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Key Takeaways</h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              {takeaways.map((t, i) => (
                <div
                  key={`${t.title}-${i}`}
                  className="rounded-xl border bg-card p-5 transition hover:shadow-sm"
                >
                  <h3 className="text-xl font-semibold leading-snug">
                    {t.title}
                  </h3>
                  {t.description ? (
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {t.description}
                    </p>
                  ) : null}
                  {t.href ? (
                    <a
                      href={t.href}
                      className="mt-3 inline-block text-sm font-medium text-ocean-600 hover:underline"
                    >
                      Read section
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <div className="mt-8 flex flex-col lg:flex-row lg:items-start lg:gap-8">
        <article className="flex-1 min-w-0">
          <div className="mt-6 space-y-10 leading-7">
            {body}
          </div>
        </article>
        <aside className="w-full lg:w-[320px] lg:sticky lg:top-24 space-y-6">
          {sidebar}
          <div className="rounded-xl border p-5 bg-card">
            <h3 className="font-semibold">Subscribe</h3>
            <p className="text-sm text-muted-foreground mt-1">Get the latest dive guides and gear picks.</p>
            <form className="mt-3 flex gap-2">
              <input className="flex-1 rounded-md border px-3 py-2 text-sm" placeholder="Email address" />
              <button className="rounded-md bg-ocean-500 text-white px-3 py-2 text-sm hover:bg-ocean-600">Join</button>
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
}
