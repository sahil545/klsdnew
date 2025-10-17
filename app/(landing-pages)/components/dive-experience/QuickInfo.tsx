import type { QuickInfoItem } from "./types";

interface QuickInfoProps {
  items: QuickInfoItem[];
}

export function QuickInfo({ items }: QuickInfoProps) {
  if (!items.length) return null;

  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-10 md:grid-cols-2 md:px-10 lg:grid-cols-4 lg:px-12">
        {items.map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-100 p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
              {item.label}
            </p>
            <p className="mt-3 text-xl font-semibold text-slate-900">{item.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
