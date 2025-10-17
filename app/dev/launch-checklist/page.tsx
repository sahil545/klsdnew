"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Navigation } from "../../../client/components/Navigation";
import { Footer } from "../../../client/components/Footer";

type Item = { id: string; label: string; hint?: string; link?: string };
type Section = { id: string; title: string; items: Item[] };

const SECTIONS: Section[] = [
  {
    id: "urls",
    title: "URLs & Redirects",
    items: [
      { id: "urls-same", label: "All URLs unchanged or mapped", hint: "Map legacy → new", link: "/seo-audit" },
      { id: "urls-301", label: "301 redirects deployed", hint: "Netlify/Vercel redirects" },
      { id: "urls-canon", label: "Canonical URLs correct" },
      { id: "urls-robots", label: "robots.txt allows prod; staging noindex" },
      { id: "urls-sitemap", label: "Sitemap.xml up to date", link: "/sitemap.xml" },
    ],
  },
  {
    id: "seo",
    title: "SEO Meta & Schema",
    items: [
      { id: "seo-titles", label: "Unique <title> for key pages" },
      { id: "seo-meta", label: "Unique meta description" },
      { id: "seo-og", label: "OG/Twitter image/title set" },
      { id: "seo-schema", label: "Article/Product schema where relevant" },
      { id: "seo-dates", label: "Blog published/updated dates present" },
    ],
  },
  {
    id: "perf",
    title: "Performance & Caching",
    items: [
      { id: "perf-ssg", label: "Use SSG/ISR for public pages" },
      { id: "perf-images", label: "Images optimized & sized correctly" },
      { id: "perf-cwv", label: "Core Web Vitals good in Lighthouse" },
      { id: "perf-headers", label: "Long-cache headers for static assets" },
    ],
  },
  {
    id: "content",
    title: "Content & Data",
    items: [
      { id: "content-keys", label: "Builder keys point to ONE prod space" },
      { id: "content-models", label: "Models/fields match prod space" },
      { id: "content-blogs", label: "12 blog posts verified on prod" },
      { id: "content-images-alt", label: "Alt text on key hero images" },
    ],
  },
  {
    id: "analytics",
    title: "Analytics & Monitoring",
    items: [
      { id: "ga4", label: "GA4 live on prod" },
      { id: "gsc", label: "GSC verified; sitemap submitted" },
      { id: "error-logs", label: "404/500 monitoring in place" },
      { id: "sentry", label: "Sentry (optional) configured" },
    ],
  },
  {
    id: "accessibility",
    title: "Accessibility & UX",
    items: [
      { id: "a11y-contrast", label: "Color contrast passes" },
      { id: "a11y-focus", label: "Focusable & keyboard nav" },
      { id: "a11y-aria", label: "Landmarks/aria labels" },
    ],
  },
  {
    id: "ops",
    title: "Ops & Release",
    items: [
      { id: "ops-env", label: "Prod env vars set (keys, domains)" },
      { id: "ops-redirects", label: "Redirects deployed and tested" },
      { id: "ops-rollback", label: "Rollback plan documented" },
    ],
  },
];

const STORAGE_KEY = "launch-checklist.v1";

export default function LaunchChecklistPage() {
  const [state, setState] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }, [state]);

  const allIds = useMemo(() => SECTIONS.flatMap(s => s.items.map(i => i.id)), []);
  const completed = allIds.filter(id => state[id]).length;
  const pct = Math.round((completed / Math.max(1, allIds.length)) * 100);

  const toggle = (id: string) => setState(s => ({ ...s, [id]: !s[id] }));
  const setSection = (sec: Section, val: boolean) => setState(s => ({ ...s, ...Object.fromEntries(sec.items.map(i => [i.id, val])) }));
  const reset = () => setState({});

  const copySummary = async () => {
    const lines: string[] = [];
    SECTIONS.forEach(sec => {
      lines.push(`# ${sec.title}`);
      sec.items.forEach(i => {
        lines.push(`${state[i.id] ? "[x]" : "[ ]"} ${i.label}`);
      });
      lines.push("");
    });
    const text = lines.join("\n");
    try { await navigator.clipboard.writeText(text); } catch {}
    alert("Checklist copied to clipboard");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <header className="mb-6">
          <h1 className="text-2xl font-bold">Launch Checklist</h1>
          <p className="text-sm text-muted-foreground">Track pre‑launch tasks without affecting SEO. State persists in your browser.</p>
          <div className="mt-4 flex items-center gap-3">
            <div className="h-2 w-48 rounded bg-muted overflow-hidden">
              <div className="h-full bg-green-500" style={{ width: `${pct}%` }} />
            </div>
            <div className="text-sm">{completed}/{allIds.length} ({pct}%)</div>
            <button onClick={copySummary} className="text-sm rounded border px-3 py-1 hover:bg-muted">Copy summary</button>
            <button onClick={reset} className="text-sm rounded border px-3 py-1 hover:bg-muted">Reset</button>
          </div>
        </header>

        <div className="space-y-6">
          {SECTIONS.map(sec => (
            <section key={sec.id} className="rounded-xl border p-5 bg-card">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">{sec.title}</h2>
                <div className="flex items-center gap-2">
                  <button onClick={() => setSection(sec, true)} className="text-xs rounded border px-2 py-1 hover:bg-muted">Mark all</button>
                  <button onClick={() => setSection(sec, false)} className="text-xs rounded border px-2 py-1 hover:bg-muted">Clear</button>
                </div>
              </div>
              <ul className="space-y-2">
                {sec.items.map(item => (
                  <li key={item.id} className="flex items-start gap-3">
                    <label className="inline-flex items-start gap-2 cursor-pointer select-none">
                      <input type="checkbox" className="mt-1" checked={!!state[item.id]} onChange={() => toggle(item.id)} />
                      <span>
                        <span className="font-medium">{item.label}</span>
                        {item.hint ? <span className="ml-1 text-muted-foreground">— {item.hint}</span> : null}
                        {item.link ? (
                          <a href={item.link} className="ml-2 text-blue-600 underline" target="_blank" rel="noreferrer">Open</a>
                        ) : null}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
