import type { WordPressSection } from "./types";

interface WordPressSectionsProps {
  sections: WordPressSection[];
  limit?: number;
}

export function WordPressSections({ sections, limit }: WordPressSectionsProps) {
  if (!sections.length) return null;

  const slice = typeof limit === "number" ? sections.slice(0, limit) : sections;

  return (
    <section className="bg-white py-20">
      <div className="mx-auto w-full max-w-6xl space-y-12 px-6 md:px-10 lg:px-12">
        {slice.map((section) => (
          <article
            key={section.title}
            className="rounded-3xl border border-slate-100 bg-slate-50/50 p-8 shadow-sm"
          >
            <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl">
              {section.title}
            </h2>
            <div
              className="prose mt-4 max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-li:text-slate-700"
              dangerouslySetInnerHTML={{ __html: section.html }}
            />
          </article>
        ))}
      </div>
    </section>
  );
}
