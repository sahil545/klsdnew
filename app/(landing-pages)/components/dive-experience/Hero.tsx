import NextImage from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { HeroContent } from "./types";

interface HeroProps {
  data: HeroContent;
}

export function Hero({ data }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
      {data.backgroundImage ? (
        <div className="absolute inset-0">
          <NextImage
            src={data.backgroundImage}
            alt={data.title}
            fill
            priority
            className="object-cover opacity-80"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-950/70 to-cyan-900/60" />
        </div>
      ) : null}
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pb-24 pt-32 md:flex-row md:gap-16 md:px-10 lg:px-12">
        <div className="max-w-2xl">
          <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1 text-sm font-semibold uppercase tracking-[0.12em] text-cyan-200">
            {data.eyebrow}
          </span>
          <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            {data.title}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-slate-100/90">
            {data.subtitle}
          </p>
          {data.highlights.length ? (
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {data.highlights.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-xl bg-white/10 p-4 text-sm font-medium text-white backdrop-blur"
                >
                  <span className="mt-1 inline-flex size-2 rounded-full bg-emerald-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : null}
          {data.ctas.length ? (
            <div className="mt-10 flex flex-wrap items-center gap-4">
              {data.ctas.map((cta) => (
                <Button
                  key={cta.label}
                  variant={
                    cta.variant === "secondary" ? "secondary" : "default"
                  }
                  size="lg"
                  asChild
                >
                  <Link href={cta.href}>{cta.label}</Link>
                </Button>
              ))}
            </div>
          ) : null}
        </div>
        {data.stats.length ? (
          <div className="flex flex-1 flex-col justify-end">
            <div className="grid gap-4 rounded-2xl bg-white/10 p-6 backdrop-blur lg:p-8">
              <h2 className="text-lg font-semibold text-white/90">
                Why divers choose us
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {data.stats.map((stat) => (
                  <div
                    key={`${stat.label}-${stat.value}`}
                    className="rounded-xl bg-black/30 p-4"
                  >
                    <p className="text-3xl font-bold text-white lg:text-4xl">
                      {stat.value}
                    </p>
                    <p className="text-sm font-medium uppercase tracking-wide text-white/70">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
