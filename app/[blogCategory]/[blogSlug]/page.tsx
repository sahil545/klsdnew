import { cache } from "react";

import type { Metadata } from "next";
import Link from "next/link";

import { AuthorityBlogLayout } from "../../../client/components/blog/AuthorityTemplate";
import { Navigation } from "../../../client/components/Navigation";
import { Footer } from "../../../client/components/Footer";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

const DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID?.trim() || null;
const HERO_IMAGE_BUCKET = "wordpress_images";
const HERO_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp"] as const;
const heroFallbackCache = new Map<string, { src: string; alt?: string } | null>();

interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

type NormalizedSection =
  | { type: "richText"; html: string }
  | { type: "image"; url: string; alt?: string; caption?: string | null };

type NormalizedTakeaway = {
  title: string;
  description?: string | null;
  href?: string | null;
};

type NormalizedPost = {
  title: string;
  author: string | null;
  excerpt: string | null;
  sections: NormalizedSection[];
  takeaways: NormalizedTakeaway[];
  hero: { src: string; alt?: string } | null;
  publishedAt: string | null;
  updatedAt: string | null;
  canonicalUrl: string | null;
};

const getNormalizedPost = cache(async (category: string, slug: string) => {
  const routePath = `/${category}/${slug}/`;
  return await getSupabasePostByPath(routePath);
});

async function getSupabasePostByPath(
  path: string,
): Promise<NormalizedPost | null> {
  if (!DEFAULT_TENANT_ID) {
    return null;
  }

  const slug = extractSlugFromPath(path);
  const normalizedPath = path.endsWith("/") ? path : `${path}/`;
  const pathCandidates = Array.from(
    new Set([normalizedPath, normalizedPath.replace(/\/+$/, "")]),
  );

  try {
    const supabase = supabaseAdmin();
    const { data, error } = await supabase
      .from("cms.posts")
      .select(
        `
        id,
        title,
        author,
        status,
        excerpt,
        body,
        tags,
        published_at,
        post_published_at,
        updated_at,
        route:cms.routes!inner(
          canonical_url,
          path,
          route_type
        )
      `,
      )
      .eq("tenant_id", DEFAULT_TENANT_ID)
      .in("route.path", pathCandidates)
      .eq("route.route_type", "post")
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Failed to load Supabase blog post", { path, error });
      return await getSupabasePostBySlug(slug);
    }

    if (!data || (data.status && data.status !== "published")) {
      return await getSupabasePostBySlug(slug);
    }

    const body = (data.body || {}) as Record<string, unknown>;
    const sections = normalizeSectionsFromBody(body, data.route?.path ?? path);
    if (!sections.length) {
      return await getSupabasePostBySlug(slug);
    }

    const hero = await resolveHeroImage(
      extractHeroFromBody(body, sections, data.title),
      slug,
      data.title,
      supabase,
    );
    const takeaways = applyTakeawayFallback(
      extractTakeaways(body),
      slug,
    );
    const excerpt =
      normalizeText(data.excerpt) || buildExcerptFromSections(sections);

    return {
      title: data.title,
      author: normalizeText(data.author),
      excerpt,
      sections,
      takeaways,
      hero,
      publishedAt:
        (data.post_published_at as string | null) ??
        (data.published_at as string | null) ??
        null,
      updatedAt: (data.updated_at as string | null) ?? null,
      canonicalUrl: normalizeText(data.route?.canonical_url),
    };
  } catch (error) {
    console.error("Unexpected error loading Supabase blog post", {
      path,
      error,
    });
    return await getSupabasePostBySlug(slug);
  }
}

function extractSlugFromPath(path: string): string | null {
  if (!path) return null;
  const trimmed = path.replace(/\/+$/g, "").replace(/^\/+/, "");
  if (!trimmed) return null;
  const segments = trimmed.split("/").filter(Boolean);
  return segments.length ? segments[segments.length - 1] : null;
}

async function getSupabasePostBySlug(
  slug: string | null,
): Promise<NormalizedPost | null> {
  if (!slug) return null;
  try {
    const supabase = supabaseAdmin();
    const { data, error } = await supabase
      .from("cms_blog_posts")
      .select(
        "id,title,excerpt,body,tags,author,published_at,updated_at,canonical_url,path,status",
      )
      .eq("slug", slug)
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Failed to load cms_blog_posts view", { slug, error });
      return null;
    }

    if (!data) {
      return null;
    }

    const body = (data.body || {}) as Record<string, unknown>;
    const sections = normalizeSectionsFromBody(body, data.path || slug);
    if (!sections.length) {
      return null;
    }

    const hero = await resolveHeroImage(
      extractHeroFromBody(body, sections, data.title),
      slug,
      data.title,
      supabase,
    );
    const takeaways = applyTakeawayFallback(
      extractTakeaways(body),
      slug,
    );
    const excerpt =
      normalizeText(data.excerpt) || buildExcerptFromSections(sections);

    return {
      title: data.title,
      author: normalizeText(data.author),
      excerpt,
      sections,
      takeaways,
      hero,
      publishedAt: (data.published_at as string | null) ?? null,
      updatedAt: (data.updated_at as string | null) ?? null,
      canonicalUrl: normalizeText(data.canonical_url),
    };
  } catch (error) {
    console.error("Unexpected error loading cms_blog_posts view", {
      slug,
      error,
    });
    return null;
  }
}

function normalizeSectionsFromBody(
  body: Record<string, unknown>,
  fallbackPath: string,
): NormalizedSection[] {
  const sections = Array.isArray((body as any)?.sections)
    ? (body as any).sections
    : [];
  const normalized: NormalizedSection[] = [];

  for (const section of sections) {
    if (section?.type === "richText" && typeof section.html === "string") {
      const cleaned = ensureHeadingIds(section.html);
      normalized.push({ type: "richText", html: cleaned });
      continue;
    }

    if (section?.type === "image" && typeof section.url === "string") {
      normalized.push({
        type: "image",
        url: section.url,
        alt: normalizeText(section.alt) || undefined,
        caption: normalizeText(section.caption),
      });
      continue;
    }

    if (section?.image && typeof section.image.url === "string") {
      normalized.push({
        type: "image",
        url: section.image.url,
        alt: normalizeText(section.image.alt) || undefined,
        caption: normalizeText(section.image.caption),
      });
      continue;
    }
  }

  if (!normalized.length && typeof (body as any)?.html === "string") {
    normalized.push({
      type: "richText",
      html: ensureHeadingIds(String((body as any).html)),
    });
  }

  if (!normalized.length) {
    const fallback = normalizeText((body as any)?.markdown) || null;
    if (fallback) {
      normalized.push({ type: "richText", html: ensureHeadingIds(fallback) });
    }
  }

  if (!normalized.length) {
    const placeholder = `<p>Content coming soon for ${fallbackPath}</p>`;
    normalized.push({ type: "richText", html: placeholder });
  }

  return normalized;
}

async function resolveHeroImage(
  currentHero: NormalizedPost["hero"],
  slug: string | null,
  title: string,
  supabaseClient?: ReturnType<typeof supabaseAdmin>,
): Promise<NormalizedPost["hero"]> {
  if (currentHero?.src || !slug) {
    return currentHero;
  }

  const cached = heroFallbackCache.get(slug);
  if (cached !== undefined) {
    return cached ?? currentHero;
  }

  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  if (!supabaseUrl) {
    heroFallbackCache.set(slug, null);
    return currentHero;
  }

  const bucket = HERO_IMAGE_BUCKET;
  const client = supabaseClient ?? supabaseAdmin();
  const storage = client.storage.from(bucket);
  const candidates = HERO_IMAGE_EXTENSIONS.map((ext) => `${slug}.${ext}`);

  for (const candidate of candidates) {
    let candidateUrl: string | null = null;
    try {
      const { data: files, error } = await storage.list("", {
        limit: 1,
        search: candidate,
      });
      if (error && error.status !== 404) {
        console.error("[blog] Failed to list hero image candidate", {
          candidate,
          error,
        });
      }

      const match = files?.find((file) => file.name === candidate);
      if (match) {
        const { data: publicUrl } = storage.getPublicUrl(candidate);
        candidateUrl = publicUrl?.publicUrl ?? null;
      }
    } catch (error) {
      console.error("[blog] Error resolving hero image candidate", {
        candidate,
        error,
      });
    }

    candidateUrl =
      candidateUrl ?? buildStoragePublicUrl(supabaseUrl, bucket, candidate);

    try {
      const response = await fetch(candidateUrl, { method: "HEAD" });
      if (response.ok) {
        const hero = { src: candidateUrl, alt: title };
        heroFallbackCache.set(slug, hero);
        return hero;
      }
    } catch (error) {
      console.warn("[blog] Hero image HEAD request failed", {
        candidate,
        error,
      });
    }
  }

  heroFallbackCache.set(slug, null);
  return currentHero;
}

function applyTakeawayFallback(
  takeaways: NormalizedTakeaway[],
  slug: string | null,
): NormalizedTakeaway[] {
  if (!slug || takeaways.length) {
    return takeaways;
  }

  if (slug === "is-scuba-diving-dangerous") {
    return [
      {
        title: "Certification keeps divers safe",
        description:
          "Completing training refreshers and practicing emergency drills greatly lowers panic-related incidents.",
      },
      {
        title: "Plan conservative dive profiles",
        description:
          "Respecting depth limits, slow ascents, and safety stops minimizes decompression stress on every dive.",
      },
      {
        title: "Dive healthy and with a buddy",
        description:
          "Medical checkups and attentive buddies provide rapid support if equipment or health issues arise underwater.",
      },
    ];
  }

  return takeaways;
}

function buildStoragePublicUrl(baseUrl: string, bucket: string, key: string) {
  const encodedKey = key
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${baseUrl}/storage/v1/object/public/${bucket}/${encodedKey}`;
}

function extractHeroFromBody(
  body: Record<string, unknown>,
  sections: NormalizedSection[],
  title: string,
): { src: string; alt?: string } | null {
  for (const section of sections) {
    if (section.type === "image" && section.url) {
      return { src: section.url, alt: section.alt || title };
    }
  }

  const heroImage = (body as any)?.heroImage;
  if (heroImage && typeof heroImage.url === "string") {
    return { src: heroImage.url, alt: normalizeText(heroImage.alt) || title };
  }

  return null;
}

function extractTakeaways(body: Record<string, unknown>): NormalizedTakeaway[] {
  const takeaways = (body as any)?.takeaways;
  if (!Array.isArray(takeaways)) return [];
  return takeaways
    .map((item: any) => {
      if (!item || typeof item.title !== "string") return null;
      return {
        title: item.title,
        description: normalizeText(item.description),
        href: normalizeText(item.href),
      } satisfies NormalizedTakeaway;
    })
    .filter((item): item is NormalizedTakeaway => Boolean(item));
}

function renderSections(sections: NormalizedSection[]) {
  return sections.map((section, index) => {
    if (section.type === "richText") {
      return (
        <div
          key={`rt-${index}`}
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: section.html }}
        />
      );
    }

    if (section.type === "image") {
      return (
        <figure key={`img-${index}`} className="my-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={section.url}
            alt={section.alt || ""}
            className="w-full h-auto rounded-2xl border object-cover"
          />
          {section.caption ? (
            <figcaption className="mt-2 text-sm text-muted-foreground text-center">
              {section.caption}
            </figcaption>
          ) : null}
        </figure>
      );
    }

    return null;
  });
}

function ensureHeadingIds(html: string) {
  let idx = 0;
  return String(html || "").replace(
    /<(h2|h3)\b([^>]*)>([\s\S]*?)<\/\1>/gi,
    (match, tag, attrs, inner) => {
      const idMatch = /\bid="([^"]+)"/i.exec(attrs);
      const text = inner.replace(/<[^>]+>/g, "").trim();
      const id = idMatch
        ? idMatch[1]
        : text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$|--+/g, "-") || `section-${++idx}`;
      const newAttrs = idMatch ? attrs : `${attrs} id="${id}"`;
      return `<${tag}${newAttrs}>${inner}</${tag}>`;
    },
  );
}

function buildTocFromSections(sections: NormalizedSection[]): TocItem[] {
  const html = sections
    .filter(
      (section): section is { type: "richText"; html: string } =>
        section.type === "richText",
    )
    .map((section) => section.html)
    .join("\n");

  const items: TocItem[] = [];
  html.replace(
    /<(h2|h3)\b([^>]*)>([\s\S]*?)<\/\1>/gi,
    (match, tag, attrs, inner) => {
      const idMatch = /\bid="([^"]+)"/i.exec(attrs);
      const text = inner.replace(/<[^>]+>/g, "").trim();
      if (idMatch && text) {
        items.push({
          id: idMatch[1],
          text,
          level: tag.toLowerCase() === "h2" ? 2 : 3,
        });
      }
      return match;
    },
  );
  return items;
}

function computeReadingTimeFromSections(sections: NormalizedSection[]) {
  const text = sections
    .filter(
      (section): section is { type: "richText"; html: string } =>
        section.type === "richText",
    )
    .map((section) => section.html.replace(/<[^>]+>/g, " "))
    .join(" ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

function formatDateLabel(post: NormalizedPost, readingTime: string) {
  const date = post.updatedAt || post.publishedAt;
  if (!date) return readingTime;
  try {
    const d = new Date(date);
    const fmt = new Intl.DateTimeFormat("en-US", {
      month: "short",
      year: "numeric",
    });
    const formatted = `Updated ${fmt.format(d)}`;
    return readingTime ? `${formatted} • ${readingTime}` : formatted;
  } catch {
    return readingTime;
  }
}

function buildExcerptFromSections(
  sections: NormalizedSection[],
  maxLength = 280,
): string | null {
  const text = sections
    .filter(
      (section): section is { type: "richText"; html: string } =>
        section.type === "richText",
    )
    .map((section) => section.html.replace(/<[^>]+>/g, " "))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return null;
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
}

function normalizeText(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function buildSidebar(toc: TocItem[]) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border p-5 bg-card">
        <h3 className="font-semibold">On this page</h3>
        <ul className="mt-3 space-y-2 text-sm">
          {toc.length ? (
            toc.map((item) => (
              <li key={item.id} className={item.level === 3 ? "pl-3" : "pl-0"}>
                <a
                  href={`#${item.id}`}
                  className="text-muted-foreground hover:underline"
                >
                  {item.text}
                </a>
              </li>
            ))
          ) : (
            <li className="text-gray-500">No sections</li>
          )}
        </ul>
      </div>
      <div className="rounded-xl border p-5 bg-card">
        <h3 className="font-semibold text-gray-900">Plan a Key Largo Dive</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Ready to explore reefs and wrecks? Book your trip now.
        </p>
        <div className="mt-4 flex gap-2">
          <Link
            href="/trips-tours"
            className="inline-flex items-center gap-2 rounded-md bg-ocean-500 px-3 py-2 text-white hover:bg-ocean-600 transition"
          >
            Book a Trip
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/contact-us"
            className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-muted"
          >
            Contact
          </Link>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: { blogCategory: string; blogSlug: string };
}): Promise<Metadata> {
  const post = await getNormalizedPost(params.blogCategory, params.blogSlug);
  if (!post) {
    return {};
  }

  const combinedExcerpt =
    post.excerpt || buildExcerptFromSections(post.sections) || undefined;
  const heroUrl = post.hero?.src;

  return {
    title: post.title,
    description: combinedExcerpt,
    alternates: post.canonicalUrl
      ? { canonical: post.canonicalUrl }
      : undefined,
    openGraph: {
      title: post.title,
      description: combinedExcerpt,
      type: "article",
      url: `/${params.blogCategory}/${params.blogSlug}/`,
      images: heroUrl ? [{ url: heroUrl }] : undefined,
    },
    twitter: {
      card: heroUrl ? "summary_large_image" : "summary",
      title: post.title,
      description: combinedExcerpt,
      images: heroUrl ? [heroUrl] : undefined,
    },
  } as Metadata;
}

export default async function BlogPostPage({
  params,
}: {
  params: { blogCategory: string; blogSlug: string };
}) {
  const post = await getNormalizedPost(params.blogCategory, params.blogSlug);

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navigation />
        <main className="flex-1 flex items-center justify-center px-4 py-24">
          <div className="max-w-xl text-center space-y-6">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              We couldn't find that article
            </h1>
            <p className="text-muted-foreground">
              The post you're looking for may have moved or hasn't been
              published yet. Browse the blog for the latest scuba diving guides
              and updates.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/scuba-diving-blog"
                className="inline-flex items-center gap-2 rounded-full bg-ocean px-4 py-2 text-white font-medium shadow hover:bg-ocean/90"
              >
                Explore the Blog
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Return Home
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const toc = buildTocFromSections(post.sections);
  const readingTime = computeReadingTimeFromSections(post.sections);
  const dateLabel = formatDateLabel(post, readingTime);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="mx-auto max-w-7xl px-6 pt-32 pb-16 md:pt-40">
        <AuthorityBlogLayout
          title={post.title}
          author={post.author}
          excerpt={post.excerpt}
          hero={post.hero}
          dateLabel={dateLabel}
          takeaways={post.takeaways}
          body={
            <div className="mt-6 space-y-10 leading-7">
              {renderSections(post.sections)}
            </div>
          }
          sidebar={buildSidebar(toc)}
        />
      </main>
      <Footer />
    </div>
  );
}
