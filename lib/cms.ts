import { z } from "zod";

export type SeoMeta = {
  title?: string;
  description?: string;
  canonical?: string;
  robots?: string;
  og?: {
    title?: string;
    description?: string;
    image?: string;
  };
  ld?: unknown;
  contentType?: string;
  extras?: Record<string, unknown>;
};

const ogSchema = z
  .object({
    title: z.string().nullish(),
    description: z.string().nullish(),
    image: z.string().nullish(),
  })
  .nullish();

const seoRecordSchema = z
  .object({
    title: z.string().nullish(),
    meta_description: z.string().nullish(),
    canonical: z.string().nullish(),
    robots: z.string().nullish(),
    og: ogSchema,
    ld: z.unknown().optional().nullable(),
    schema_json: z.unknown().optional().nullable(),
    ld_json: z.unknown().optional().nullable(),
    noindex: z.boolean().nullish(),
    content_type: z.string().nullish(),
    extras: z.unknown().optional().nullable(),
  })
  .passthrough();

const seoResponseSchema = z.array(seoRecordSchema);

export async function getSeo(path: string): Promise<SeoMeta | null> {
  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE?.trim();

  if (!supabaseUrl || !serviceRole) {
    throw new Error(
      "Supabase environment variables SUPABASE_URL and SUPABASE_SERVICE_ROLE must be configured.",
    );
  }

  const url = new URL("/rest/v1/seo_meta_v", supabaseUrl);
  const params = new URLSearchParams();
  params.set("path", `eq.${path}`);
  params.set("select", "*");
  url.search = params.toString();

  const response = await fetch(url.toString(), {
    headers: {
      apikey: serviceRole,
      Authorization: `Bearer ${serviceRole}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      `Supabase seo_meta_v request failed with status ${response.status}`,
    );
  }

  const payload = await response.json();
  const records = seoResponseSchema.safeParse(payload);

  if (!records.success || records.data.length === 0) {
    return null;
  }

  const record = records.data[0];

  const ogRecord = record.og ?? null;
  const og = ogRecord
    ? {
        title: ogRecord.title ?? undefined,
        description: ogRecord.description ?? undefined,
        image: ogRecord.image ?? undefined,
      }
    : undefined;

  const ld = record.ld ?? record.schema_json ?? record.ld_json ?? undefined;
  const extrasValue = record.extras ?? null;
  const extras =
    extrasValue && typeof extrasValue === "object"
      ? (extrasValue as Record<string, unknown>)
      : undefined;

  return {
    title: record.title ?? undefined,
    description: record.meta_description ?? undefined,
    canonical: record.canonical ?? undefined,
    robots: record.robots ?? undefined,
    og,
    ld,
    contentType: record.content_type ?? undefined,
    extras,
  };
}
