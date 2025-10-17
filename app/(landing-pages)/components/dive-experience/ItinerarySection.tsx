import type { ItineraryStep } from "./types";

interface ItinerarySectionProps {
  title: string;
  description: string;
  steps: ItineraryStep[];
}

export function ItinerarySection({ title, description, steps }: ItinerarySectionProps) {
  if (!steps.length) return null;

  return (
    <section className="bg-white py-20">
      <div className="mx-auto w-full max-w-6xl px-6 md:px-10 lg:px-12">
        <div className="mb-12 max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            {title}
          </h2>
          <p className="mt-3 text-base text-slate-600">{description}</p>
        </div>
        <div className="relative">
          <div className="absolute inset-0 left-4 hidden border-l-2 border-dashed border-cyan-200 md:block" />
          <div className="space-y-10">
            {steps.map((step, index) => (
              <div key={step.title} className="relative flex flex-col gap-4 rounded-3xl bg-slate-50 p-6 md:flex-row md:items-center md:gap-8">
                <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500 text-xl font-semibold text-white shadow-lg">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <h3 className="text-2xl font-semibold text-slate-900">{step.title}</h3>
                    <span className="inline-flex items-center rounded-full bg-white px-4 py-1 text-sm font-medium text-cyan-600">
                      {step.duration}
                    </span>
                  </div>
                  <p className="mt-3 text-base text-slate-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
