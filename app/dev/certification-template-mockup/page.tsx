import Link from "next/link";

export default function CertificationTemplateMockupPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-800 to-slate-900 text-white">
        <div className="absolute inset-0">
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-900/80 to-transparent" />
        </div>
        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:px-8 lg:px-12">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium uppercase tracking-wide text-sky-100">
            Certification Template Mockup
          </p>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            PADI Open Water Certification
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-sky-100">
            A polished hero concept for showcasing the certification experience. The supporting sections now power the live template experience.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/certification-template"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-base font-semibold text-slate-900 shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-slate-100"
            >
              View Live Certification Page
            </Link>
            <Link
              href="/dev/hero-designs"
              className="inline-flex items-center justify-center rounded-full border border-white/40 px-6 py-3 text-base font-semibold text-white transition hover:bg-white/10"
            >
              Browse Other Concepts
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-16 sm:px-8 lg:px-12">
        <div className="space-y-6 rounded-3xl bg-white p-8 shadow-sm shadow-slate-900/5">
          <h2 className="text-2xl font-semibold text-slate-900">
            Where to Find the Full Layout
          </h2>
          <p className="text-sm leading-relaxed text-slate-600">
            The training journey, pricing snapshot, add-on merchandising, and key message panels from this mockup were migrated into the production <Link href="/certification-template" className="text-sky-600 underline-offset-2 hover:underline">certification template</Link>. Review that route for the complete experience wired into the real booking flow.
          </p>
          <p className="text-sm leading-relaxed text-slate-600">
            This hero remains available as a creative reference. Duplicate it when experimenting with new above-the-fold concepts or localized promotions.
          </p>
        </div>
      </main>
    </div>
  );
}
