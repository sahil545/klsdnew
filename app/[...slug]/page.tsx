import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { cache } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { getSeo } from "../../lib/cms";
import YourPageRenderer from "../../components/renderers/PageRenderer";
import YourPostRenderer from "../../components/renderers/PostRenderer";
import YourDiveSiteRenderer from "../../components/renderers/DiveSiteRenderer";
import type { DiveSiteRow, PageRow, PostRow, RouteRow, SeoRow } from "./types";

const DEFAULT_SITE_URL = "https://keylargoscubadiving.com";
const REVALIDATE_SECONDS = 60;

export const revalidate = REVALIDATE_SECONDS;
export const dynamic = "force-static";

const siteBaseUrl = normalizeBaseUrl(process.env.SITE_URL ?? DEFAULT_SITE_URL);
const wordpressBaseUrl = normalizeBaseUrl(
  process.env.WP_BASE_URL ?? process.env.SITE_URL ?? DEFAULT_SITE_URL,
);

async function supaView<T>(
  view: string,
  params: URLSearchParams,
): Promise<T | null> {
  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE?.trim();

  if (!supabaseUrl || !serviceRole) {
    throw new Error(
      "Supabase environment variables SUPABASE_URL and SUPABASE_SERVICE_ROLE must be configured.",
    );
  }

  if (!params.has("select")) params.set("select", "*");
  if (!params.has("limit")) params.set("limit", "1");

  const url = new URL(`/rest/v1/${view}`, supabaseUrl);
  url.search = params.toString();

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      apikey: serviceRole,
      Authorization: `Bearer ${serviceRole}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    next: { revalidate: REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(
      `Supabase view ${view} request failed with status ${response.status}`,
    );
  }

  const data = await response.json();
  if (Array.isArray(data)) {
    return (data[0] ?? null) as T | null;
  }
  return (data ?? null) as T | null;
}

const fetchRoute = cache(async (slug: string) => {
  const lookups = buildRouteLookups(slug);
  for (const lookup of lookups.slug) {
    try {
      const params = new URLSearchParams();
      params.set("slug", `eq.${lookup}`);
      const route = await supaView<RouteRow>("routes_v", params);
      if (route) return route;
    } catch (error) {
      console.error("Failed to query routes_v by slug", error);
      break;
    }
  }

  for (const lookup of lookups.path) {
    try {
      const params = new URLSearchParams();
      params.set("path", `eq.${lookup}`);
      const route = await supaView<RouteRow>("routes_v", params);
      if (route) return route;
    } catch (error) {
      console.error("Failed to query routes_v by path", error);
      break;
    }
  }

  return null;
});

const fetchSeo = cache(async (routeId: string) => {
  try {
    const params = new URLSearchParams();
    params.set("route_id", `eq.${routeId}`);
    return await supaView<SeoRow>("seo_meta_v", params);
  } catch (error) {
    console.error("Failed to query seo_meta_v", error);
    return null;
  }
});

const fetchPageByRoute = cache(async (routeId: string) => {
  try {
    const params = new URLSearchParams();
    params.set("route_id", `eq.${routeId}`);
    return await supaView<PageRow>("pages_v", params);
  } catch (error) {
    console.error("Failed to query pages_v", error);
    return null;
  }
});

const fetchPostByRoute = cache(async (routeId: string) => {
  try {
    const params = new URLSearchParams();
    params.set("route_id", `eq.${routeId}`);
    return await supaView<PostRow>("posts_v", params);
  } catch (error) {
    console.error("Failed to query posts_v", error);
    return null;
  }
});

const fetchDiveSiteByRoute = cache(async (routeId: string) => {
  try {
    const params = new URLSearchParams();
    params.set("route_id", `eq.${routeId}`);
    return await supaView<DiveSiteRow>("dive_sites_v", params);
  } catch (error) {
    console.error("Failed to query dive_sites_v", error);
    return null;
  }
});

export async function generateMetadata({
  params,
}: {
  params: { slug?: string[] };
}): Promise<Metadata> {
  const parts = params.slug ?? [];
  const raw = `/${parts.join("/")}`;
  const path = raw === "/" ? "/" : raw.replace(/\/$/, "");

  const seo = await getSeo(path);
  const hdrs = headers();
  const envOrigin = process.env.PUBLIC_SITE_ORIGIN?.trim().replace(/\/$/, "");
  const headerHost = hdrs.get("host");
  const fallbackOrigin = headerHost ? `https://${headerHost}` : undefined;
  const host = envOrigin ?? fallbackOrigin ?? DEFAULT_SITE_URL;
  const canonicalBase = host.replace(/\/$/, "");
  const canonical =
    seo?.canonical ?? `${canonicalBase}${path === "/" ? "" : path}`;

  return {
    title: seo?.title ?? " ",
    description: seo?.description,
    alternates: { canonical },
    robots: seo?.robots,
    openGraph: {
      title: seo?.og?.title ?? seo?.title,
      description: seo?.og?.description ?? seo?.description,
      images: seo?.og?.image ? [{ url: seo.og.image }] : undefined,
      url: canonical,
    },
    other: seo?.ld ? { "script:ld+json": JSON.stringify(seo.ld) } : undefined,
  } satisfies Metadata;
}

export default async function CatchAllPage({
  params,
}: {
  params: { slug?: string[] };
}) {
  const slug = normalizeParamsSlug(params);

  let route: RouteRow | null = null;
  try {
    route = await fetchRoute(slug);
  } catch (error) {
    console.error("Failed to resolve route", error);
  }

  if (!route) {
    const redirectUrl = buildWordPressUrl(slug);
    return <WordPressRedirect targetUrl={redirectUrl} />;
  }

  if (route.is_published === false) {
    notFound();
  }

  const seo = await fetchSeo(route.id);
  const content = await resolveRouteContent(route);

  if (content.kind === "unhandled") {
    const redirectUrl = buildWordPressUrl(slug);
    return <WordPressRedirect targetUrl={redirectUrl} />;
  }

  if (content.kind === "missing") {
    notFound();
  }

  const schemaData = seo?.ld ?? seo?.schema_json ?? null;

  return (
    <>
      {schemaData ? <JsonLd data={schemaData} /> : null}
      <div className="bg-white text-slate-900">
        <Navigation />
        <main className="min-h-[60vh] bg-white">
          {content.kind === "page" ? (
            <YourPageRenderer
              body={content.page.body}
              data={content.page.data}
            />
          ) : content.kind === "post" ? (
            <YourPostRenderer post={content.post} />
          ) : (
            <YourDiveSiteRenderer site={content.site} />
          )}
        </main>
        <Footer />
      </div>
    </>
  );
}

type RouteContentResult =
  | { kind: "page"; page: PageRow }
  | { kind: "post"; post: PostRow }
  | { kind: "dive_site"; site: DiveSiteRow }
  | { kind: "missing" }
  | { kind: "unhandled" };

async function resolveRouteContent(
  route: RouteRow,
): Promise<RouteContentResult> {
  switch (route.route_type) {
    case "page": {
      const page = await fetchPageByRoute(route.id);
      if (!page) return { kind: "missing" };
      if (page.status !== "published") {
        return { kind: "missing" };
      }
      return { kind: "page", page };
    }
    case "post": {
      const post = await fetchPostByRoute(route.id);
      if (!post) return { kind: "missing" };
      if (!post.published_at) return { kind: "missing" };
      return { kind: "post", post };
    }
    case "dive_site": {
      const site = await fetchDiveSiteByRoute(route.id);
      if (!site) return { kind: "missing" };
      return { kind: "dive_site", site };
    }
    default:
      return { kind: "unhandled" };
  }
}

function normalizeParamsSlug(params: { slug?: string[] }): string {
  const slug = Array.isArray(params.slug)
    ? params.slug.join("/")
    : (params.slug ?? "");
  return slug.replace(/^\/+|\/+$/g, "");
}

function buildCanonicalUrl(route: RouteRow): string {
  const relativePath = route.path?.trim().length
    ? route.path
    : route.slug.trim().length
      ? `/${route.slug.replace(/^\/+/, "")}`
      : "/";
  return new URL(relativePath.replace(/^\/+/, ""), siteBaseUrl).toString();
}

function buildWordPressUrl(slug: string): string {
  const relative = slug.trim().length ? `${slug.replace(/^\/+/, "")}` : "";
  const target = new URL(relative || "", wordpressBaseUrl);
  return target.toString();
}

function buildRouteLookups(slug: string) {
  const trimmed = slug.replace(/^\/+|\/+$/g, "");
  const slugLookups = new Set<string>();
  const pathLookups = new Set<string>();

  if (trimmed.length) {
    slugLookups.add(trimmed);
    if (!trimmed.endsWith("/")) {
      slugLookups.add(`${trimmed}/`);
    }
    if (!trimmed.startsWith("/")) {
      slugLookups.add(`/${trimmed}`);
    }
    const asPath = `/${trimmed}`;
    pathLookups.add(asPath);
    if (!asPath.endsWith("/")) {
      pathLookups.add(`${asPath}/`);
    }
  } else {
    slugLookups.add("");
    slugLookups.add("/");
    slugLookups.add("home");
    slugLookups.add("index");
    pathLookups.add("/");
  }

  return { slug: Array.from(slugLookups), path: Array.from(pathLookups) };
}

function normalizeBaseUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return `${DEFAULT_SITE_URL}/`;
  try {
    const url = new URL(trimmed);
    const path = url.pathname.endsWith("/") ? url.pathname : `${url.pathname}/`;
    return `${url.origin}${path}`;
  } catch {
    return normalizeBaseUrl(`https://${trimmed.replace(/^https?:\/\//i, "")}`);
  }
}

function JsonLd({ data }: { data: unknown }) {
  if (!data) return null;
  const json = JSON.stringify(data);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

function WordPressRedirect({ targetUrl }: { targetUrl: string }) {
  return (
    <html>
      <head>
        <meta httpEquiv="refresh" content={`0; url=${targetUrl}`} />
        <link rel="canonical" href={targetUrl} />
      </head>
      <body>
        <main className="flex min-h-screen items-center justify-center bg-white text-slate-800">
          <p className="text-center text-lg">
            Redirecting… <a href={targetUrl}>{targetUrl}</a>
          </p>
        </main>
      </body>
    </html>
  );
}
