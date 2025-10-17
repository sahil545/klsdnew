import type { FAQItem } from "./types";

interface FAQSectionProps {
  items: FAQItem[];
}

export function FAQSection({ items }: FAQSectionProps) {
  if (!items.length) return null;

  return (
    <section className="bg-slate-950 py-20 text-white">
      <div className="mx-auto w-full max-w-5xl px-6 md:px-10 lg:px-12">
        <div className="mb-10 max-w-2xl">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">
            Frequently asked
          </span>
          <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">
            Key Largo dive planning questions
          </h2>
          <p className="mt-3 text-sm text-white/70">
            Answers are pulled from the detailed WordPress content so your landing page always reflects the latest guidance for guests.
          </p>
        </div>
        <div className="space-y-4">
          {items.map((item) => (
            <details
              key={item.question}
              className="group rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur"
            >
              <summary className="cursor-pointer text-lg font-semibold marker:text-cyan-400">
                {item.question}
              </summary>
              <div
                className="prose mt-3 max-w-none text-sm text-white/80 prose-headings:text-white prose-p:text-white/80 prose-strong:text-white"
                dangerouslySetInnerHTML={{ __html: item.answerHtml }}
              />
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
