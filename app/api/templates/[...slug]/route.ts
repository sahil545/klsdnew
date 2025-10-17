import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
import { wordpressAPI } from "../../../../client/lib/wordpress-api";

const DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID?.trim() || null;

type TemplateResponse = {
  template: string;
  path: string;
  slug: string;
  title: string;
  excerpt: string | null;
  author: string | null;
  status?: string | null;
  tags?: string[];
  publishedAt: string | null;
  updatedAt: string | null;
  heroImage: string | null;
  body: Record<string, unknown> | null;
  bodyHtml: string | null;
  html?: string | null;
  content?: {
    title: string;
    excerpt: string | null;
    author: string | null;
    heroImage: string | null;
    body: Record<string, unknown> | null;
    bodyHtml: string | null;
  };
  source: "supabase" | "wordpress";
  route?: {
    id: string;
    canonicalUrl: string | null;
    isPublished: boolean;
    publishedAt: string | null;
    updatedAt: string | null;
  };
};

function normalizePathFromSegments(segments: string[] | undefined): {
  path: string;
  slug: string;
} {
  const cleaned = (segments || []).filter(Boolean);
  if (cleaned.length === 0) {
    return { path: "/", slug: "" };
  }
  const joined = cleaned.join("/").replace(/\/+/, "/");
  const normalizedPath = `/${joined}${joined.endsWith("/") ? "" : "/"}`;
  const slug = cleaned[cleaned.length - 1];
  return { path: normalizedPath, slug };
}

function extractHeroFromBody(
  body: Record<string, unknown> | null,
): string | null {
  if (!body) return null;
  const heroImage = (body as any)?.heroImage;
  if (
    heroImage &&
    typeof heroImage === "object" &&
    typeof heroImage.url === "string"
  ) {
    return heroImage.url;
  }

  const sections = Array.isArray((body as any)?.sections)
    ? ((body as any).sections as Array<Record<string, unknown>>)
    : [];

  for (const section of sections) {
    const image = (section as any)?.image;
    if (image && typeof image === "object" && typeof image.url === "string") {
      return image.url;
    }
  }
  return null;
}

function extractBodyHtml(body: Record<string, unknown> | null): string | null {
  if (!body) return null;

  if (typeof (body as any)?.html === "string") {
    return (body as any).html as string;
  }

  const sections = Array.isArray((body as any)?.sections)
    ? ((body as any).sections as Array<Record<string, unknown>>)
    : [];

  for (const section of sections) {
    if (typeof (section as any)?.html === "string") {
      return (section as any).html as string;
    }
  }

  return null;
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .trim();
}

function buildWordPressResponse(
  post: any,
  fullPath: string,
  slug: string,
): TemplateResponse {
  const title = decodeHtmlEntities(post?.title?.rendered || slug);
  const excerpt = decodeHtmlEntities(post?.excerpt?.rendered || "");
  const html = post?.content?.rendered || "";
  const author = decodeHtmlEntities(post?._embedded?.author?.[0]?.name || "");
  const heroImage =
    post?._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
    post?._embedded?.["wp:featuredmedia"]?.[0]?.media_details?.sizes?.full
      ?.source_url ||
    null;

  const body = {
    sections: [
      {
        type: "richText",
        html,
      },
    ],
    raw: post?.content ?? null,
  } as Record<string, unknown>;

  return {
    template: "blog-post",
    path: fullPath,
    slug,
    title,
    excerpt: excerpt || null,
    author: author || null,
    status: post?.status || null,
    tags: Array.isArray(post?.tags) ? post.tags : [],
    publishedAt: post?.date_gmt || post?.date || null,
    updatedAt: post?.modified_gmt || post?.modified || null,
    heroImage,
    body,
    bodyHtml: html || null,
    html: html || null,
    content: {
      title,
      excerpt: excerpt || null,
      author: author || null,
      heroImage,
      body,
      bodyHtml: html || null,
    },
    source: "wordpress",
  };
}

async function fetchSupabasePost(path: string, tenantId: string) {
  if (!tenantId) {
    return null;
  }

  const supabase = supabaseAdmin();

  const { data: route, error: routeError } = await supabase
    .from("cms.routes")
    .select(
      "id, slug, path, route_type, canonical_url, is_published, published_at, updated_at",
    )
    .eq("tenant_id", tenantId)
    .eq("path", path)
    .maybeSingle();

  if (routeError) {
    console.error("Failed to load cms.routes", { path, routeError });
    return null;
  }

  if (!route || route.route_type !== "post") {
    return null;
  }

  const { data: post, error: postError } = await supabase
    .from("cms.posts")
    .select(
      "id, title, status, excerpt, body, tags, author, published_at, post_published_at, updated_at",
    )
    .eq("tenant_id", tenantId)
    .eq("route_id", route.id)
    .maybeSingle();

  if (postError) {
    console.error("Failed to load cms.posts", {
      path,
      routeId: route.id,
      postError,
    });
    return null;
  }

  if (!post) {
    return null;
  }

  const body = (post.body || {}) as Record<string, unknown> | null;
  const heroImage = extractHeroFromBody(body);

  const bodyHtml = extractBodyHtml(body);
  const normalized: TemplateResponse = {
    template: "blog-post",
    path: route.path,
    slug: route.slug,
    title: post.title,
    excerpt: post.excerpt ?? null,
    author: post.author ?? null,
    status: post.status ?? null,
    tags: Array.isArray(post.tags) ? (post.tags as string[]) : [],
    publishedAt:
      (post.post_published_at as string | null) ??
      (post.published_at as string | null) ??
      null,
    updatedAt: (post.updated_at as string | null) ?? null,
    heroImage,
    body,
    bodyHtml,
    html: bodyHtml ?? null,
    content: {
      title: post.title,
      excerpt: post.excerpt ?? null,
      author: post.author ?? null,
      heroImage,
      body,
      bodyHtml: bodyHtml ?? null,
    },
    source: "supabase",
    route: {
      id: route.id,
      canonicalUrl: route.canonical_url ?? null,
      isPublished: Boolean(route.is_published),
      publishedAt: (route.published_at as string | null) ?? null,
      updatedAt: (route.updated_at as string | null) ?? null,
    },
  };

  return normalized;
}

function getTenantIdFromReq(req: NextRequest): string | null {
  const h = req.headers.get("x-tenant-id")?.trim();
  if (h && h.length) return h;
  return DEFAULT_TENANT_ID;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { slug?: string[] } },
) {
  const { path, slug } = normalizePathFromSegments(params.slug);

  if (!slug) {
    return NextResponse.json({ error: "Slug is required" }, { status: 400 });
  }

  const tenantId = getTenantIdFromReq(req);
  if (!tenantId) {
    return NextResponse.json(
      { error: "x-tenant-id required" },
      { status: 400 },
    );
  }

  const supabaseResult = await fetchSupabasePost(path, tenantId);
  if (supabaseResult) {
    return NextResponse.json(supabaseResult, { status: 200 });
  }

  try {
    const posts = await wordpressAPI.getPosts({ slug, _embed: 1, per_page: 1 });
    if (Array.isArray(posts) && posts.length > 0) {
      const wpResponse = buildWordPressResponse(posts[0], path, slug);
      return NextResponse.json(wpResponse, { status: 200 });
    }
  } catch (error) {
    console.error("WordPress fallback failed", { path, slug, error });
  }

  return NextResponse.json({ error: "Template not found" }, { status: 404 });
}
