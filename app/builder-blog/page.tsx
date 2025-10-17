import React from "react";
import Link from "next/link";
import { Navigation } from "../../client/components/Navigation";
import { Footer } from "../../client/components/Footer";
import { fetchBlogPosts, type BlogPost } from "../../lib/builder-cms";

export const revalidate = 300;

export default async function BuilderBlogListPage() {
  const items = await fetchBlogPosts(50);
  const posts = items
    .map((it) => it.data as BlogPost)
    .filter((d) => d?.title && d?.slug);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <header className="max-w-3xl">
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
            Articles
          </h1>
          <p className="mt-2 text-muted-foreground">
            Latest posts from Builder CMS.
          </p>
        </header>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => {
            const href = `/builder-blog/${String(p.slug || "").replace(/^\/+|\/+$/g, "")}`;
            const date = p.publishedDate ? new Date(p.publishedDate) : null;
            return (
              <Link
                key={href}
                href={href}
                className="group rounded-xl border p-4 bg-card hover:bg-accent/30"
              >
                {p.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.coverImage}
                    alt=""
                    className="w-full h-40 object-cover rounded-md border"
                  />
                ) : (
                  <div className="w-full h-40 rounded-md border bg-muted" />
                )}
                <h2 className="mt-3 text-lg font-semibold leading-snug group-hover:text-ocean">
                  {p.title}
                </h2>
                {p.excerpt ? (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {p.excerpt}
                  </p>
                ) : null}
                <div className="mt-2 text-xs text-muted-foreground">
                  {date ? date.toISOString().slice(0, 10) : null}
                  {p.author ? ` • ${p.author}` : ""}
                </div>
              </Link>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
}
