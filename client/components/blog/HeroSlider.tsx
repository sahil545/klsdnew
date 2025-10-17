"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type Slide = {
  image: string;
  title: string;
  href: string;
  category?: string;
  meta?: string;
};

export function HeroSlider({ slides, interval = 7000 }: { slides: Slide[]; interval?: number }) {
  const [index, setIndex] = useState(0);
  const count = slides.length;

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % count), interval);
    return () => clearInterval(id);
  }, [count, interval]);

  const go = (dir: -1 | 1) => setIndex((i) => (i + dir + count) % count);

  const s = slides[index];

  return (
    <div className="relative rounded-none overflow-hidden">
      {/* Slide */}
      <Link href={s.href} className="block relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={s.image} alt={s.title} className="w-full h-[420px] sm:h-[520px] object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center px-4">
          {s.category ? (
            <div className="mb-3 flex items-center justify-center gap-2 text-emerald-400 text-[11px] font-semibold tracking-wide uppercase">
              <span className="w-2 h-2 bg-emerald-400 inline-block rounded-sm" />
              {s.category}
            </div>
          ) : null}
          <h1 className="text-white text-2xl sm:text-4xl md:text-5xl font-extrabold max-w-3xl leading-tight drop-shadow-lg">
            {s.title}
          </h1>
          {s.meta ? (
            <div className="mt-2 text-white/80 text-xs">{s.meta}</div>
          ) : null}
        </div>
      </Link>

      {/* Arrows */}
      <div className="absolute inset-0 flex items-center justify-between px-2 sm:px-4">
        <Button aria-label="Previous" variant="secondary" size="icon" className="bg-white/80 hover:bg-white rounded-full" onClick={() => go(-1)}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <Button aria-label="Next" variant="secondary" size="icon" className="bg-white/80 hover:bg-white rounded-full" onClick={() => go(1)}>
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-white" : "w-3 bg-white/60"}`}
          />
        ))}
      </div>
    </div>
  );
}

export default HeroSlider;
