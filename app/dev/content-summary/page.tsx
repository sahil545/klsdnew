import React from "react";
import { Navigation } from "../../../client/components/Navigation";
import { Footer } from "../../../client/components/Footer";
import ContentSummaryClient, { type Row } from "./ContentSummaryClient";

export const dynamic = "force-dynamic";

async function fetchWP(type: "posts" | "pages") {
  const base = process.env.NEXT_PUBLIC_WORDPRESS_URL?.replace(/\/+$/, "") || "";
  if (!base) return { rows: [] as Row[], warning: "NEXT_PUBLIC_WORDPRESS_URL not set; unable to load WordPress posts/pages." };
  const endpoint = `${base}/wp-json/wp/v2/${type}?per_page=100&_fields=id,slug,link,title,author,date,modified,status`;
  try {
    const res = await fetch(endpoint, { cache: "no-store" });
    if (!res.ok) throw new Error(`${res.status}`);
    const arr = await res.json();
    const rows: Row[] = (Array.isArray(arr) ? arr : []).map((p: any) => ({
      type: type === "posts" ? "Post" : "Page",
      id: p.id,
      title: p?.title?.rendered || p?.title || String(p?.slug || p?.id),
      url: p?.link,
      status: p?.status,
      published: p?.date,
      modified: p?.modified,
      authorId: p?.author,
    }));
    return { rows, warning: null as string | null, base };
  } catch (e: any) {
    return { rows: [] as Row[], warning: `Failed to load ${type} from WordPress (${e?.message || "error"}).` };
  }
}

export default async function Page() {
  const postsRes = await fetchWP("posts");
  const pagesRes = await fetchWP("pages");
  const initialRows: Row[] = [...(postsRes.rows || []), ...(pagesRes.rows || [])];
  const warnings: string[] = [postsRes.warning, pagesRes.warning].filter(Boolean) as string[];
  const wpBaseUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL?.replace(/\/+$/, "") || null;


  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-6">
          <h1 className="text-2xl font-bold">Dev Content Summary</h1>
          <p className="text-sm text-muted-foreground">Spreadsheet-style list of Posts, Pages, and Products. Data for Posts/Pages is loaded from WordPress; Products are loaded from this app.</p>
        </header>

        <ContentSummaryClient initialRows={initialRows} wpBaseUrl={wpBaseUrl} warnings={warnings} />
      </main>
      <Footer />
    </div>
  );
}
