import { PhoneCall } from "lucide-react";

import type { ContactBlock } from "./types";

interface ContactSectionProps {
  data: ContactBlock;
}

export function ContactSection({ data }: ContactSectionProps) {
  return (
    <section className="bg-gradient-to-br from-cyan-500 via-cyan-600 to-emerald-500 py-20 text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 text-center md:px-10 lg:px-12">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-white/20">
          <PhoneCall className="h-7 w-7" />
        </div>
        <h2 className="text-3xl font-semibold sm:text-4xl">{data.title}</h2>
        <p className="text-base text-white/80">{data.description}</p>
        <div className="flex flex-wrap items-center justify-center gap-4 text-lg font-semibold">
          <a href={`tel:${data.phone.replace(/[^\d+]/g, "")}`} className="rounded-full bg-white px-6 py-3 text-cyan-700 shadow-lg">
            Call {data.phone}
          </a>
          {data.email ? (
            <a
              href={`mailto:${data.email}`}
              className="rounded-full border border-white/70 px-6 py-3 text-white transition hover:bg-white/10"
            >
              Email {data.email}
            </a>
          ) : null}
        </div>
        {data.benefits.length ? (
          <ul className="mx-auto grid gap-3 text-sm text-white/80 sm:grid-cols-3">
            {data.benefits.map((benefit) => (
              <li key={benefit} className="rounded-full border border-white/30 px-4 py-2">
                {benefit}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
