import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";

import type { ValuePropCard } from "./types";

interface ValuePropsSectionProps {
  cards: ValuePropCard[];
}

const iconMap: Record<string, ReactNode> = {
  Waves: <Sparkles className="h-6 w-6" />,
};

export function ValuePropsSection({ cards }: ValuePropsSectionProps) {
  if (!cards.length) return null;

  return (
    <section className="bg-slate-950 py-20 text-white">
      <div className="mx-auto w-full max-w-6xl px-6 md:px-10 lg:px-12">
        <div className="grid gap-6 md:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.title}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur"
            >
              <div className="flex items-center justify-between">
                <div className="rounded-full bg-white/10 p-3 text-cyan-200">
                  {iconMap[card.icon] ?? <Sparkles className="h-6 w-6" />}
                </div>
                <div className="size-16 rounded-full bg-cyan-400/20 blur-2xl transition-all group-hover:bg-cyan-300/40" />
              </div>
              <h3 className="mt-6 text-2xl font-semibold text-white">{card.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/80">{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
