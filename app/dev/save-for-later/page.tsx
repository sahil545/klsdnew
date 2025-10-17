"use client";

import React from "react";
import Image from "next/image";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

const colorOptions = [
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

const SwatchConceptShowcase = () => (
  <section className="space-y-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-500">
          Variant Explorations
        </p>
        <h2 className="text-2xl font-semibold text-slate-900">
          Color swatch concepts library
        </h2>
      </div>
      <p className="max-w-md text-xs text-slate-500">
        Immersive tiles, minimalist rows, and grid-based palettes ready for
        experimentation across PDPs and marketing surfaces.
      </p>
    </div>

    <div className="grid gap-6 lg:grid-cols-3">
      <article className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-slate-900/90 p-6 text-white">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-200">
            Concept 01
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em]">
            Immersive
          </span>
        </div>
        <div className="space-y-3">
          {colorOptions.slice(0, 3).map((option) => (
            <div
              key={`immersive-${option.value}`}
              className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-white/20">
                <Image
                  src={option.image}
                  alt={option.label}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold uppercase tracking-[0.3em] text-slate-200">
                  {option.label}
                </p>
                <p className="text-xs text-slate-300">
                  {option.price} • {option.shipEstimate}
                </p>
              </div>
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 shadow-inner">
                <span
                  className="h-6 w-6 rounded-full border border-white/40"
                  style={{ backgroundColor: option.swatch }}
                />
              </span>
            </div>
          ))}
        </div>
        <p className="text-[11px] uppercase tracking-[0.3em] text-slate-300">
          Best for storytelling hero modules
        </p>
      </article>

      <article className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-slate-50 p-6">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">
            Concept 02
          </span>
          <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-700">
            Minimalist
          </span>
        </div>
        <div className="space-y-2">
          {colorOptions.slice(0, 4).map((option) => (
            <div
              key={`minimal-${option.value}`}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200"
                  style={{ backgroundColor: option.swatch }}
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">
                    {option.label}
                  </p>
                  <p className="text-xs text-slate-500">{option.price}</p>
                </div>
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                {option.badge ?? "Stock"}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500">
          Compact density without sacrificing clarity.
        </p>
      </article>

      <article className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-6">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">
            Concept 03
          </span>
          <span className="rounded-full bg-sky-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-600">
            Interactive
          </span>
        </div>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {colorOptions.map((option) => (
              <button
                key={`chips-${option.value}`}
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-sky-400 hover:text-sky-600"
              >
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: option.swatch }}
                />
                {option.label}
              </button>
            ))}
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
            <p className="font-semibold uppercase tracking-[0.3em] text-slate-500">
              Microcopy slot
            </p>
            <p className="mt-2 text-slate-600">
              Pair chips with contextual copy or motion for mobile-first flows.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">
          <span>Supports tooltips</span>
          <span>Ready for animation</span>
        </div>
      </article>
    </div>

    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-500">
            Horizontal Explorations
          </p>
          <h3 className="text-xl font-semibold text-slate-900">
            Landscape variants for promo bands
          </h3>
        </div>
        <p className="max-w-md text-xs text-slate-500">
          Built for carousel bars, comparison rows, or email modules where
          horizontal real estate drives engagement.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <article className="flex h-full flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-6">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">
              Concept 04
            </span>
            <span className="rounded-full bg-slate-900/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-700">
              Showcase Bar
            </span>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <div className="flex flex-col gap-3 bg-slate-50 p-4">
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-36 overflow-hidden rounded-xl">
                  <Image
                    src={colorOptions[0].image}
                    alt="Gallery"
                    fill
                    sizes="224px"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  <span>Live Preview</span>
                  <span>Swipe</span>
                  <span>360°</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {colorOptions.map((option) => (
                  <button
                    key={`bar-${option.value}`}
                    type="button"
                    className="flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:text-sky-600"
                  >
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: option.swatch }}
                    />
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Wide hero strip with inline controls and preview callouts.
          </p>
        </article>

        <article className="flex h-full flex-col gap-4 rounded-2xl border border-slate-200/80 bg-slate-900/95 p-6 text-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-200">
              Concept 05
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em]">
              Split Rail
            </span>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5">
            <div className="flex flex-col divide-y divide-white/10">
              {colorOptions.slice(0, 3).map((option) => (
                <div
                  key={`rail-${option.value}`}
                  className="flex items-center gap-4 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20"
                      style={{ backgroundColor: option.swatch }}
                    />
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white">
                        {option.label}
                      </p>
                      <p className="text-[11px] text-slate-200">
                        {option.price}
                      </p>
                    </div>
                  </div>
                  <div className="ml-auto flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-200">
                    <span>{option.badge ?? "Stock"}</span>
                    <span className="text-sky-200">{option.shipEstimate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-slate-200">
            Horizontal band that reads like a comparative spec list.
          </p>
        </article>

        <article className="flex h-full flex-col gap-4 rounded-2xl border border-slate-200/80 bg-slate-50 p-6">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">
              Concept 06
            </span>
            <span className="rounded-full bg-sky-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-600">
              Carousel Row
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              <span>Tap to preview</span>
              <span className="flex items-center gap-2 text-sky-600">
                Scroll
                <ArrowRight className="h-3 w-3" />
              </span>
            </div>
            <div className="overflow-x-auto">
              <div className="flex gap-3">
                {colorOptions.map((option) => (
                  <div
                    key={`carousel-${option.value}`}
                    className="min-w-[160px] rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200"
                        style={{ backgroundColor: option.swatch }}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {option.label}
                        </p>
                        <p className="text-xs text-slate-500">{option.price}</p>
                      </div>
                    </div>
                    <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">
                      {option.shipEstimate}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Mobile-friendly horizontal scroll row.
          </p>
        </article>
      </div>
    </div>

    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-500">
            Grid Explorations
          </p>
          <h3 className="text-xl font-semibold text-slate-900">
            Three-up and quad swatches without scrolling
          </h3>
        </div>
        <p className="max-w-md text-xs text-slate-500">
          Drop these into PDPs, comparison tables, or landing CTA bands where
          you need immediate color coverage.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <article className="flex h-full flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-6">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">
              Concept 07
            </span>
            <span className="rounded-full bg-slate-900/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-700">
              Triad Grid
            </span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="grid grid-cols-3 gap-3">
              {colorOptions.slice(0, 3).map((option) => (
                <div
                  key={`triad-${option.value}`}
                  className="rounded-2xl bg-white p-3 text-center shadow-sm"
                >
                  <div
                    className="mx-auto h-10 w-10 rounded-full border border-slate-200"
                    style={{ backgroundColor: option.swatch }}
                  />
                  <p className="mt-2 text-xs font-semibold text-slate-900">
                    {option.label}
                  </p>
                  <p className="text-[11px] text-slate-500">{option.price}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-slate-500">
            All three core colors visible instantly.
          </p>
        </article>

        <article className="flex h-full flex-col gap-4 rounded-2xl border border-slate-200/80 bg-slate-900/95 p-6 text-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-200">
              Concept 08
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em]">
              Ribbon Grid
            </span>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
            <div className="grid grid-cols-3 gap-3">
              {colorOptions.slice(0, 3).map((option) => (
                <div
                  key={`ribbon-${option.value}`}
                  className="flex flex-col items-center gap-2 rounded-xl bg-slate-900/60 p-4"
                >
                  <div className="flex h-16 w-full items-center justify-center rounded-xl bg-white/10">
                    <span
                      className="h-8 w-8 rounded-full border border-white/40"
                      style={{ backgroundColor: option.swatch }}
                    />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white">
                    {option.label}
                  </p>
                  <p className="text-[11px] text-slate-200">
                    {option.shipEstimate}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-slate-200">Premium dark-mode triad.</p>
        </article>

        <article className="flex h-full flex-col gap-4 rounded-2xl border border-slate-200/80 bg-slate-50 p-6">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">
              Concept 09
            </span>
            <span className="rounded-full bg-sky-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-600">
              Quad Spread
            </span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {colorOptions.map((option) => (
                <div
                  key={`quad-${option.value}`}
                  className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 p-3"
                >
                  <span
                    className="h-8 w-8 rounded-full border border-slate-200"
                    style={{ backgroundColor: option.swatch }}
                  />
                  <p className="text-xs font-semibold text-slate-900">
                    {option.label}
                  </p>
                  <p className="text-[11px] text-slate-500">{option.price}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Four-across visibility pre-scroll.
          </p>
        </article>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <article className="flex h-full flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-6">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">
              Concept 10
            </span>
            <span className="rounded-full bg-slate-900/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-700">
              Quad Tile
            </span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {colorOptions.map((option) => (
                <div
                  key={`quad-tile-${option.value}`}
                  className="flex flex-col items-center gap-3 rounded-xl border border-slate-100 p-3 text-center"
                >
                  <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-slate-200">
                    <Image
                      src={option.image}
                      alt={option.label}
                      fill
                      sizes="128px"
                      className="object-cover"
                    />
                  </div>
                  <span
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200"
                    style={{ backgroundColor: option.swatch }}
                  />
                  <p className="text-xs font-semibold text-slate-900">
                    {option.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Hero thumbnail paired with swatch chip.
          </p>
        </article>

        <article className="flex h-full flex-col gap-4 rounded-2xl border border-slate-200/80 bg-slate-900/95 p-6 text-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-200">
              Concept 11
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em]">
              Image Stack
            </span>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="grid grid-cols-3 gap-3">
              {colorOptions.slice(0, 3).map((option) => (
                <div
                  key={`image-stack-${option.value}`}
                  className="flex flex-col items-center gap-3 rounded-xl bg-slate-900/60 p-4"
                >
                  <div className="relative h-14 w-full overflow-hidden rounded-lg">
                    <Image
                      src={option.image}
                      alt={option.label}
                      fill
                      sizes="160px"
                      className="object-cover"
                    />
                  </div>
                  <span
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/30"
                    style={{ backgroundColor: option.swatch }}
                  />
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white">
                    {option.label}
                  </p>
                  <p className="text-[11px] text-slate-200">
                    {option.shipEstimate}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-slate-200">
            Three-up grid with cinematic thumbnail stack.
          </p>
        </article>

        <article className="flex h-full flex-col gap-4 rounded-2xl border border-slate-200/80 bg-slate-50 p-6">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">
              Concept 12
            </span>
            <span className="rounded-full bg-sky-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-600">
              Palette Board
            </span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="grid grid-cols-3 gap-3">
              {colorOptions.slice(0, 3).map((option) => (
                <div
                  key={`palette-${option.value}`}
                  className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 p-3"
                >
                  <div className="relative h-12 w-full overflow-hidden rounded-lg">
                    <Image
                      src={option.image}
                      alt={option.label}
                      fill
                      sizes="160px"
                      className="object-cover"
                    />
                  </div>
                  <span
                    className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200"
                    style={{ backgroundColor: option.swatch }}
                  />
                  <p className="text-xs font-semibold text-slate-900">
                    {option.label}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {option.badge ?? "In Stock"}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Removes price for cleaner visual board while retaining context.
          </p>
        </article>
      </div>
    </div>
  </section>
);

export default function SaveForLaterDevPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Save For Later</h1>
          <p className="text-muted-foreground mb-8">
            A sandbox for small design elements and experiments.
          </p>

          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Buttons</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3 flex-wrap">
                  <Button>Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Badges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 flex-wrap">
                  <Badge>Default</Badge>
                  <Badge className="bg-coral">Coral</Badge>
                  <Badge className="bg-ocean">Ocean</Badge>
                </div>
              </CardContent>
            </Card>
          </section>

          <div className="mt-12 space-y-12">
            <SwatchConceptShowcase />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
