export type BuilderContent<T = any> = {
  id: string;
  name?: string;
  createdDate?: number;
  lastUpdated?: number;
  published?: string | boolean;
  data: T & { [key: string]: any };
};

const API_KEY =
  process.env.BUILDER_PUBLIC_API_KEY || "9812127712ac4442ab80f6c2fd972a3f";
const BASE_URL = "https://cdn.builder.io/api/v3/content";

function qs(params: Record<string, any>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    sp.append(k, String(v));
  }
  return sp.toString();
}

export type BlogPost = {
  title: string;
  slug: string;
  publishedDate?: string | number; // legacy field in some models; kept for compatibility
  publishedAtUtcMs?: number;
  updatedAtUtcMs?: number;
  author?: string;
  excerpt?: string;
  coverImage?: string;
  body?: any;
  categories?: { category: string }[] | string[];
  tags?: { tag: string }[] | string[];
  seoTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
};

export async function fetchBlogPosts(
  limit = 20,
): Promise<BuilderContent<BlogPost>[]> {
  const url = `${BASE_URL}/blog-posts?${qs({ apiKey: API_KEY, limit, includeUnpublished: true, "sort.data.publishedDate": -1 })}`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`Failed to fetch posts (${res.status})`);
  const json = await res.json();
  const items: BuilderContent<BlogPost>[] = Array.isArray(json?.results)
    ? json.results
    : [];
  return items;
}

export async function fetchPostBySlug(
  slug: string,
): Promise<BuilderContent<BlogPost> | null> {
  const normalized = slug.replace(/^\/+|\/+$/g, "");
  const url = `${BASE_URL}/blog-posts?${qs({ apiKey: API_KEY, limit: 1, includeUnpublished: true, "query.data.slug": `/${normalized}/` })}`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`Failed to fetch post (${res.status})`);
  const json = await res.json();
  const item: BuilderContent<BlogPost> | undefined = Array.isArray(
    json?.results,
  )
    ? json.results[0]
    : undefined;
  return item || null;
}
