import { Navigation } from "../../../client/components/Navigation";
import { Footer } from "../../../client/components/Footer";
import { notFound } from "next/navigation";

async function fetchBuilderPageBySlug(pathname: string) {
  const apiKey =
    process.env.BUILDER_PUBLIC_API_KEY ||
    process.env.NEXT_PUBLIC_BUILDER_API_KEY;
  if (!apiKey) return null;
  const normWith = `/${pathname.replace(/^\/+|\/+$/g, "")}/`;
  const normNo = normWith.replace(/\/$/, "");
  const tries = [
    `https://cdn.builder.io/api/v3/content/pages?apiKey=${encodeURIComponent(apiKey)}&limit=1&includeUnpublished=true&query.data.slug=${encodeURIComponent(normWith)}`,
    `https://cdn.builder.io/api/v3/content/pages?apiKey=${encodeURIComponent(apiKey)}&limit=1&includeUnpublished=true&query.data.slug=${encodeURIComponent(normNo)}`,
    `https://cdn.builder.io/api/v3/content/pages?apiKey=${encodeURIComponent(apiKey)}&limit=1&includeUnpublished=true&query.url=${encodeURIComponent(normWith)}`,
    `https://cdn.builder.io/api/v3/content/pages?apiKey=${encodeURIComponent(apiKey)}&limit=1&includeUnpublished=true&query.url=${encodeURIComponent(normNo)}`,
  ];
  for (const u of tries) {
    const res = await fetch(u, { cache: "no-store" });
    if (!res.ok) continue;
    const j = await res.json();
    const item = Array.isArray(j?.results) ? j.results[0] : null;
    if (item) return item;
  }
  return null;
}

function renderBody(body: any) {
  if (!body) return null;
  if (typeof body === "string") {
    // Remove Builder-inserted attributes that cause hydration warnings
    const cleaned = body
      .replace(
        /\s(?:bis_size|bis-size|bis_[\w-]+|bis-[\w-]+|data-bis-[\w-]+)(?:=(['"]).*?\1|(?=\s|>))/gi,
        "",
      )
      .replace(/\sdata-bis-[\w-]+(?==|(?=\s|>))/gi, "");
    return (
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: cleaned }}
      />
    );
  }
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string[] };
}) {
  const pathname = (params.slug || []).join("/");
  const base = (
    process.env.NEXT_PUBLIC_WORDPRESS_URL || "https://keylargoscubadiving.com"
  ).replace(/\/$/, "");
  const last = pathname.split("/").filter(Boolean).pop() || pathname;
  const { yoastMetadataForSlug } = await import("../../../lib/yoast");
  const meta = await yoastMetadataForSlug(last);
  return meta as any;
}

export default async function Page({ params }: { params: { slug: string[] } }) {
  const pathname = (params.slug || []).join("/");
  const item = await fetchBuilderPageBySlug(pathname);
  if (!item) notFound();
  const d = (item.data || {}) as any;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <header>
          {d.publishedDate ? (
            <div className="text-xs text-muted-foreground">
              {(() => {
                const ms =
                  typeof d.publishedDate === "number"
                    ? d.publishedDate
                    : Date.parse(String(d.publishedDate));
                if (!Number.isFinite(ms)) return "";
                return new Date(ms).toISOString().slice(0, 10);
              })()}
            </div>
          ) : null}
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight leading-tight">
            {d.title || pathname}
          </h1>
          {d.excerpt ? (
            <p className="mt-3 text-lg text-muted-foreground">{d.excerpt}</p>
          ) : null}
        </header>
        <article className="mt-8">{renderBody(d.body)}</article>
      </main>
      <Footer />
    </div>
  );
}
