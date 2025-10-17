export const dynamic = "force-dynamic";

import { Navigation } from "../../client/components/Navigation";
import { Footer } from "../../client/components/Footer";
import ScubaGear from "../../client/pages/ScubaGear";

type BuilderItem = {
  id: string;
  name?: string;
  data?: any;
  url?: string;
};

async function fetchBuilderPageBySlug(pathname: string): Promise<BuilderItem | null> {
  const apiKey = process.env.BUILDER_PUBLIC_API_KEY || process.env.NEXT_PUBLIC_BUILDER_API_KEY;
  const privKey = process.env.BUILDER_PRIVATE_API_KEY || process.env.BUILDER_WRITE_API_KEY || "";
  if (!apiKey) return null;
  const normWith = `/${pathname.replace(/^\/+|\/+$/g, "")}/`;
  const normNo = normWith.replace(/\/$/, "");
  const tries = [
    `https://cdn.builder.io/api/v3/content/page?apiKey=${encodeURIComponent(apiKey)}&limit=1&includeUnpublished=true&query.url=${encodeURIComponent(normWith)}`,
    `https://cdn.builder.io/api/v3/content/page?apiKey=${encodeURIComponent(apiKey)}&limit=1&includeUnpublished=true&query.url=${encodeURIComponent(normNo)}`,
    `https://cdn.builder.io/api/v3/content/page?apiKey=${encodeURIComponent(apiKey)}&limit=1&includeUnpublished=true&query.data.slug=${encodeURIComponent(normWith)}`,
    `https://cdn.builder.io/api/v3/content/page?apiKey=${encodeURIComponent(apiKey)}&limit=1&includeUnpublished=true&query.data.slug=${encodeURIComponent(normNo)}`,
  ];
  for (const u of tries) {
    try {
      const res = await fetch(u, { cache: "no-store" });
      if (!res.ok) continue;
      const j = await res.json();
      const item = Array.isArray(j?.results) ? j.results[0] : null;
      if (item) return item as BuilderItem;
    } catch {}
  }
  // If not found, attempt to create a draft page automatically (server-side only)
  if (privKey) {
    const humanTitle = pathname
      .split("/")
      .filter(Boolean)
      .map((s) => s.replace(/-/g, " "))
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ") || "Page";
    const payload = {
      name: humanTitle,
      url: normNo,
      data: {
        title: humanTitle,
        seoTitle: humanTitle,
        slug: normNo,
      },
      published: false,
    } as any;
    try {
      await fetch("https://builder.io/api/v3/content/page", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${privKey}` },
        body: JSON.stringify(payload),
        cache: "no-store",
      });
      // Re-try fetch after creating
      for (const u of tries) {
        try {
          const res = await fetch(u, { cache: "no-store" });
          if (!res.ok) continue;
          const j = await res.json();
          const item = Array.isArray(j?.results) ? j.results[0] : null;
          if (item) return item as BuilderItem;
        } catch {}
      }
    } catch {}
  }
  return null;
}

function renderBody(body: any) {
  if (!body) return null;
  if (typeof body === "string") return <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: body }} />;
  return null;
}

export async function generateMetadata() {
  const item = await fetchBuilderPageBySlug("scuba-gear");
  const d = (item?.data || {}) as any;
  if (!item) return {} as any;
  return {
    title: d.seoTitle || d.title || "Scuba Gear",
    description: d.metaDescription || d.excerpt || undefined,
    alternates: d.canonicalUrl ? { canonical: d.canonicalUrl } : undefined,
    openGraph: {
      title: d.seoTitle || d.title || "Scuba Gear",
      description: d.metaDescription || d.excerpt || undefined,
      type: "website",
      url: "/scuba-gear/",
    },
  } as any;
}

export default async function ScubaGearPage() {
  const item = await fetchBuilderPageBySlug("scuba-gear");
  if (item?.data) {
    const d = item.data as any;
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <main className="mx-auto max-w-7xl px-6 py-10">
          <header>
            <h1 className="mt-2 text-4xl font-extrabold tracking-tight leading-tight">{d.title || "Scuba Gear"}</h1>
            {d.excerpt ? <p className="mt-3 text-lg text-muted-foreground">{d.excerpt}</p> : null}
          </header>
          <article className="mt-8">
            {renderBody(d.body)}
          </article>
        </main>
        <Footer />
      </div>
    );
  }
  return <ScubaGear />;
}
