"use client";

import { useState } from "react";

type CreateState = "idle" | "saving" | "done" | "error";

const API_TOKEN = process.env.NEXT_PUBLIC_ADMIN_UI_TOKEN;

export default function CreatePageAdmin() {
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [publish, setPublish] = useState(true);
  const [heroHeadline, setHeroHeadline] = useState("");
  const [cta, setCta] = useState("Book Now");
  const [status, setStatus] = useState<CreateState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [routeId, setRouteId] = useState<string | null>(null);
  const [pageId, setPageId] = useState<string | null>(null);

  async function call(path: string, init: RequestInit) {
    const res = await fetch(path, init);
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `${res.status} ${res.statusText}`);
    }
    return res.json();
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setError(null);

    try {
      if (!slug.trim() || !title.trim()) {
        throw new Error("Slug and Title are required");
      }

      const authHeader = API_TOKEN ? { Authorization: `Bearer ${API_TOKEN}` } : {};
      const normalizedSlug = slug.replace(/^\/+/, "");

      const routeResponse = await call("/api/cms/routes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeader,
        },
        body: JSON.stringify({
          route_type: "page",
          slug: normalizedSlug,
          is_published: false,
        }),
      });
      const newRouteId = routeResponse.route_id as string;
      setRouteId(newRouteId);

      await call("/api/cms/seo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeader,
        },
        body: JSON.stringify({
          route_id: newRouteId,
          title,
          meta_description: metaDescription || null,
          og_title: title,
          og_description: metaDescription || null,
          og_image_url: ogImage || null,
          schema_json: {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: title,
          },
        }),
      });

      const pageResponse = await call("/api/cms/pages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeader,
        },
        body: JSON.stringify({
          route_id: newRouteId,
          status: publish ? "published" : "draft",
          body: {
            hero: { headline: heroHeadline || title, cta },
            sections: [],
          },
          data: {},
          author: "Admin",
        }),
      });
      setPageId(pageResponse.page_id as string);

      if (publish) {
        await call(`/api/cms/routes?id=${newRouteId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...authHeader,
          },
          body: JSON.stringify({ is_published: true }),
        });
      }

      setStatus("done");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed";
      setError(message);
      setStatus("error");
    }
  }

  const isSaving = status === "saving";

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Create Page</h1>
      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium">Slug</label>
          <input
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            placeholder="christ-statue-snorkeling"
            className="mt-1 w-full rounded-xl border p-3"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Title (SEO + H1)</label>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-1 w-full rounded-xl border p-3"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Meta Description</label>
          <textarea
            value={metaDescription}
            onChange={(event) => setMetaDescription(event.target.value)}
            className="mt-1 w-full rounded-xl border p-3"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">OG Image URL</label>
          <input
            value={ogImage}
            onChange={(event) => setOgImage(event.target.value)}
            className="mt-1 w-full rounded-xl border p-3"
            placeholder="https://cdn.example.com/og.jpg"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Hero Headline</label>
            <input
              value={heroHeadline}
              onChange={(event) => setHeroHeadline(event.target.value)}
              className="mt-1 w-full rounded-xl border p-3"
              placeholder="Christ of the Abyss Snorkeling"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">CTA Label</label>
            <input
              value={cta}
              onChange={(event) => setCta(event.target.value)}
              className="mt-1 w-full rounded-xl border p-3"
              placeholder="Book Now"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            id="publish-toggle"
            type="checkbox"
            checked={publish}
            onChange={() => setPublish((value) => !value)}
          />
          <label htmlFor="publish-toggle" className="text-sm">
            Publish immediately
          </label>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="rounded-2xl bg-black px-6 py-3 text-white"
        >
          {isSaving ? "Saving..." : "Create Page"}
        </button>

        {status === "done" ? (
          <p className="text-green-700">
            ✅ Created! Route: <code>{routeId}</code> Page: <code>{pageId}</code>
          </p>
        ) : null}
        {status === "error" && error ? (
          <p className="text-red-600">❌ {error}</p>
        ) : null}
      </form>
    </main>
  );
}
