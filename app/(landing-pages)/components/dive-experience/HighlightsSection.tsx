interface HighlightsSectionProps {
  items: string[];
  title?: string;
  subtitle?: string;
}

export function HighlightsSection({ items, title, subtitle }: HighlightsSectionProps) {
  if (!items.length) return null;

  return (
    <section className="bg-slate-50 py-16">
      <div className="mx-auto w-full max-w-6xl px-6 md:px-10 lg:px-12">
        <div className="mb-10 max-w-2xl">
          {title ? (
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
              {title}
            </h2>
          ) : null}
          {subtitle ? (
            <p className="mt-3 text-base text-slate-600">{subtitle}</p>
          ) : null}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <span className="mt-1 inline-flex size-2 flex-none rounded-full bg-cyan-500" />
              <p className="text-base font-medium text-slate-800">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
