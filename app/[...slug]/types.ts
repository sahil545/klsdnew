export type RouteType =
  | "page"
  | "post"
  | "dive_site"
  | "product"
  | "collection"
  | "redirect";

export interface RouteRow {
  id: string;
  route_type: RouteType;
  slug: string;
  path: string;
  canonical_url?: string | null;
  published_at?: string | null;
  is_published?: boolean | null;
}

export interface SeoRow {
  route_id: string;
  title?: string | null;
  meta_description?: string | null;
  canonical?: string | null;
  robots?: string | null;
  og_title?: string | null;
  og_description?: string | null;
  og_image_url?: string | null;
  schema_json?: unknown;
  ld?: unknown;
  noindex?: boolean | null;
  content_type?: string | null;
  extras?: Record<string, unknown> | null;
}

export interface PageRow {
  id: string;
  route_id: string;
  status: "draft" | "published" | "archived";
  body: unknown;
  data: Record<string, unknown> | null;
  author?: string | null;
}

export interface PostRow {
  id: string;
  route_id: string;
  title: string;
  excerpt?: string | null;
  body: unknown;
  tags?: string[] | null;
  author?: string | null;
  published_at?: string | null;
}

export interface DiveSiteRow {
  id: string;
  route_id: string;
  name: string;
  latitude?: number | null;
  longitude?: number | null;
  depth_min_m?: number | null;
  depth_max_m?: number | null;
  current_level?: string | null;
  skill_level?: string | null;
  highlights?: string[] | null;
  hazards?: string[] | null;
  seasonality?: string | null;
  body: unknown;
}
