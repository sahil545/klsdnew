import React from "react";
import Link from "next/link";
import { Navigation } from "../../client/components/Navigation";
import { Footer } from "../../client/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Flame } from "lucide-react";
import { HeroSlider } from "../../client/components/blog/HeroSlider";
import { AspectRatio } from "../../client/components/ui/aspect-ratio";

export const dynamic = "force-dynamic";

export type Post = {
  id: number;
  title: string;
  slug: string;
  href: string;
  excerpt: string;
  image: string;
  category: string;
  date: string;
  author: string;
  readTime: string;
};

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "").trim();
}

function estimateReadTime(text: string) {
  const words = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

async function getBlogPosts(limit = 20): Promise<Post[]> {
  const base = process.env.NEXT_PUBLIC_WORDPRESS_URL || "https://keylargoscubadiving.com";
  const url = `${base}/wp-json/wp/v2/posts?per_page=${limit}&_embed=1`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) return [];
  const data: any[] = await res.json();
  return data.map((p) => {
    const title = stripHtml(p?.title?.rendered || "");
    const excerptText = stripHtml(p?.excerpt?.rendered || "");
    const img = p?._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
      "https://cdn.builder.io/api/v1/image/assets%2F2a778920e8d54a37b1576086f79dd676%2F04a13ecb14db49a29892aec49c9d3466?format=webp&width=1000";
    const firstCat = Array.isArray(p?._embedded?.["wp:term"]) && Array.isArray(p?._embedded?.["wp:term"][0]) ? p._embedded["wp:term"][0][0] : null;
    const cat = firstCat?.name || "blog";
    const catSlug = firstCat?.slug || "blog";
    const author = p?._embedded?.author?.[0]?.name || "Team";
    const slug = p?.slug || String(p?.id);
    const contentForReadTime = stripHtml(p?.content?.rendered || excerptText);
    return {
      id: Number(p?.id),
      title,
      slug,
      href: `/${catSlug}/${slug}/`,
      excerpt: excerptText,
      image: img,
      category: cat,
      date: p?.date || "",
      author,
      readTime: estimateReadTime(contentForReadTime),
    } as Post;
  });
}

function CategoryStrip({ categories }: { categories: string[] }) {
  return (
    <section className="border-y bg-white/70">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center gap-2 py-2 text-xs">
          {categories.map((c) => (
            <Link
              key={c}
              href={`/scuba-diving-blog?category=${encodeURIComponent(c)}`}
              className="rounded-full border px-3 py-1 hover:bg-accent bg-white"
            >
              {c}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function CompactHero({ posts }: { posts: Post[] }) {
  const lead = posts[0];
  if (!lead) return null;
  return (
    <header className="container mx-auto px-4">
      <Link href={lead.href} className="relative block rounded-2xl overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={lead.image}
          alt={lead.title}
          className="h-64 w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <Badge className="bg-white/90 text-gray-900">{lead.category}</Badge>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-white leading-tight">
            {lead.title}
          </h1>
          <div className="mt-1 text-white/80 text-xs flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" /> {lead.readTime} • {lead.author}
          </div>
        </div>
      </Link>
    </header>
  );
}

function RecentAndPopular({ posts }: { posts: Post[] }) {
  const recent = posts.slice(1, 6);
  const popular = posts.slice(0, 6);
  const feature = posts[7] || posts[0];
  const wideSlugs = new Set(posts.slice(1, 6).map((p) => p.slug));
  const movedSlugs = new Set(posts.slice(6, 10).map((p) => p.slug));
  const widePosts = posts.filter((p) => wideSlugs.has(p.slug)).slice(0, 3);
  const movedPosts = posts.filter((p) => movedSlugs.has(p.slug)).slice(0, 2);
  const remainingRecent = recent.filter((p) => !wideSlugs.has(p.slug) && !movedSlugs.has(p.slug));

  return (
    <section className="container mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 lg:pt-[468px] relative">
          {feature && (
            <Link href={feature.href} className="absolute top-0 left-0 right-0 h-[460px] rounded-md overflow-hidden group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={feature.image} alt={feature.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="inline-block bg-black text-white text-[11px] font-semibold tracking-wide uppercase px-3 py-1 rounded">Scuba Diving 101</div>
                <h3 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white leading-tight">{feature.title}</h3>
                <p className="mt-1 text-base md:text-lg text-white/90 leading-relaxed line-clamp-2">{feature.excerpt}</p>
              </div>
            </Link>
          )}

          <div className="mb-3 h-7" aria-hidden="true" />

          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {widePosts.map((p) => (
                <Link key={p.id} href={p.href} className="group">
                  <AspectRatio ratio={4/3} className="w-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.image} alt={p.title} className="w-full h-full object-cover rounded-md border group-hover:opacity-90" />
                  </AspectRatio>
                  <div className="mt-2">
                    <div className="inline-block bg-black text-white text-[11px] font-semibold tracking-wide uppercase px-3 py-1 rounded">{p.category}</div>
                    <div className="mt-1 text-lg sm:text-xl font-bold leading-snug group-hover:text-ocean line-clamp-2">{p.title}</div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{p.excerpt}</p>
                </Link>
              ))}
            </div>

            <div className="grid gap-4">
              {remainingRecent.slice(0, 2).map((p) => (
                <Link key={p.id} href={p.href} className="group grid grid-cols-3 gap-3 items-start">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image} alt={p.title} className="col-span-1 w-full h-20 object-cover rounded-md border" />
                  <div className="col-span-2">
                    <div className="text-sm font-semibold leading-snug group-hover:text-ocean line-clamp-2">{p.title}</div>
                    <div className="text-[11px] text-muted-foreground">{p.category} • {p.readTime}</div>
                  </div>
                </Link>
              ))}
            </div>

            {remainingRecent.slice(2, 4).map((p) => (
              <Link key={p.id} href={p.href} className="group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image} alt={p.title} className="w-full h-40 object-cover rounded-md border" />
                <div className="mt-2 text-sm font-semibold leading-snug group-hover:text-ocean line-clamp-2">{p.title}</div>
                <p className="text-xs text-muted-foreground line-clamp-2">{p.excerpt}</p>
              </Link>
            ))}
          </div>

          {movedPosts.length > 0 && (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {movedPosts.map((p) => (
                <Link key={p.id} href={p.href} className="group grid grid-cols-3 gap-3 items-start">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image} alt={p.title} className="col-span-1 w-full h-20 object-cover rounded-md border" />
                  <div className="col-span-2">
                    <div className="text-sm font-semibold leading-snug group-hover:text-ocean line-clamp-2">{p.title}</div>
                    <div className="text-[11px] text-muted-foreground">{p.category} • {p.readTime}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <aside className="lg:col-span-4 space-y-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 bg-emerald-500 rounded-sm" />
                <h3 className="text-sm font-semibold uppercase">Most Popular</h3>
              </div>
              <ol className="space-y-3">
                {popular.map((p, i) => (
                  <li key={p.id} className="flex items-start gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.image} alt="" className="w-16 h-12 object-cover rounded border" />
                    <div className="min-w-0">
                      <Link href={p.href} className="text-sm leading-snug hover:text-ocean line-clamp-2">
                        {i + 1}. {p.title}
                      </Link>
                      <div className="text-[11px] text-muted-foreground">{p.readTime}</div>
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-2">Don’t miss out</h3>
              <form className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="Email"
                  className="w-full rounded-md border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ocean"
                />
                <Button type="submit" size="sm" className="bg-ocean text-white">Send</Button>
              </form>
            </CardContent>
          </Card>
        </aside>
      </div>
    </section>
  );
}

function AdRow() {
  return (
    <section className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 rounded-md border bg-gray-50 flex items-center justify-center h-24 text-sm text-gray-600">
          AD 728×90
        </div>
        <div className="rounded-md border bg-gray-50 flex items-center justify-center h-24 text-sm text-gray-600">
          AD 300×250
        </div>
      </div>
    </section>
  );
}

function WideFeature({ posts }: { posts: Post[] }) {
  const p = posts[2] || posts[0];
  if (!p) return null;
  return (
    <section className="container mx-auto px-4">
      <Link href={p.href} className="relative block rounded-2xl overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.image} alt={p.title} className="w-full h-64 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <Badge className="bg-white/90 text-gray-900">{p.category}</Badge>
          <h3 className="mt-2 text-2xl font-extrabold text-white leading-tight">{p.title}</h3>
        </div>
      </Link>
    </section>
  );
}

function TopGear({ posts }: { posts: Post[] }) {
  const gear = posts.filter((p) => /gear|wreck/i.test(p.category));
  const right = posts.filter((p) => !/gear/i.test(p.category)).slice(0, 6);
  return (
    <section className="container mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 bg-emerald-500 rounded-sm" />
            <h2 className="text/base font-bold uppercase">Top Gear</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gear.map((p) => (
              <Link key={p.id} href={p.href} className="group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image} alt={p.title} className="w-full h-36 object-cover rounded-md border" />
                <div className="mt-2 text-sm font-medium leading-snug group-hover:text-ocean line-clamp-2">
                  {p.title}
                </div>
                <div className="text-[11px] text-muted-foreground">{p.category} • {p.readTime}</div>
              </Link>
            ))}
          </div>
        </div>

        <aside className="lg:col-span-4 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-4 h-4 text-coral" />
            <h3 className="text-sm font-semibold">In case you missed it</h3>
          </div>
          <div>
            {right.map((p) => (
              <div key={p.id} className="flex items-start gap-3 py-2 border-b last:border-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image} alt={p.title} className="w-20 h-14 object-cover rounded border" />
                <div className="min-w-0">
                  <Link href={p.href} className="text-sm hover:text-ocean leading-snug line-clamp-2">
                    {p.title}
                  </Link>
                  <div className="text-[11px] text-muted-foreground">{p.author} • {p.readTime}</div>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}

export default async function ScubaDivingBlogPage() {
  const posts = await getBlogPosts(24);
  const excluded = new Set(["Snorkeling 101", "Reef Life", "Scuba Diving 101", "Key Largo"].map((s) => s.toLowerCase()));
  const categories = Array.from(new Set(posts.map((p) => p.category).filter((c) => c && !excluded.has(String(c).toLowerCase())))).slice(0, 12);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-24 space-y-6">
        <section className="-mt-2">
          {(() => {
            const slides = posts.slice(0, 3).map((p) => ({
              image: p.image,
              title: p.title,
              href: p.href,
              category: p.category,
              meta: `${p.readTime} • ${p.author}`,
            }));
            return <HeroSlider slides={slides} />;
          })()}
        </section>
        <RecentAndPopular posts={posts} />
        <AdRow />
        <WideFeature posts={posts} />
        <TopGear posts={posts} />

        <section className="container mx-auto px-4">
          <div className="text-center mt-4">
            <Link href="/scuba-diving-blog">
              <Button variant="outline" size="sm" className="border text-ocean hover:bg-ocean hover:text-white">
                View All Articles
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
