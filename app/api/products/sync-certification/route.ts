import { NextRequest, NextResponse } from "next/server";
import { wooCommerce } from "../../../../client/lib/woocommerce";

export const dynamic = "force-dynamic";

async function getCategoryIdBySlug(slug: string): Promise<number | null> {
  try {
    const cats = await wooCommerce.makeRequest(
      `/products/categories?slug=${encodeURIComponent(slug)}&per_page=1&_fields=id,slug,name`
    );
    if (Array.isArray(cats) && cats[0]?.id) return cats[0].id as number;
  } catch (e) {}
  return null;
}

async function listAllProductsByCategoryId(categoryId: number) {
  const perPage = 100;
  let page = 1;
  const out: any[] = [];
  while (true) {
    const items = await wooCommerce.makeRequest(
      `/products?category=${categoryId}&per_page=${perPage}&page=${page}&_fields=id,slug,name,permalink,categories,images,meta_data,wcf_tour_data`
    );
    if (!Array.isArray(items) || items.length === 0) break;
    out.push(...items);
    if (items.length < perPage) break;
    page++;
  }
  return out;
}

function ensureMeta(meta: any[] | undefined, key: string, value: any) {
  const arr = Array.isArray(meta) ? [...meta] : [];
  const idx = arr.findIndex((m) => m && m.key === key);
  if (idx >= 0) arr[idx] = { key, value };
  else arr.push({ key, value });
  return arr;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("categorySlug") || "certification-courses";
    const categoryId = await getCategoryIdBySlug(slug);
    if (!categoryId) return NextResponse.json({ ok: false, error: `Category not found: ${slug}` }, { status: 200 });

    const products = await listAllProductsByCategoryId(categoryId);
    const snapshot = products.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      heroImage: Array.isArray(p.images) && p.images[0]?.src ? p.images[0].src : null,
      nextOverride: (p.meta_data || []).find((m: any) => m.key === "_wcf_nextjs_override")?.value ?? null,
      hasWcf: !!p.wcf_tour_data,
    }));

    return NextResponse.json({ ok: true, count: snapshot.length, products: snapshot }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const slug = String(body?.categorySlug || "certification-courses");
    const dryRun = !!body?.dryRun;

    const categoryId = await getCategoryIdBySlug(slug);
    if (!categoryId) return NextResponse.json({ ok: false, error: `Category not found: ${slug}` }, { status: 200 });

    const products = await listAllProductsByCategoryId(categoryId);

    const results: Array<{ id: number; slug: string; updated: boolean; error?: string }> = [];

    for (const p of products) {
      const meta = Array.isArray(p.meta_data) ? p.meta_data : [];
      // Ensure Next.js override is enabled (so the new template is used site-wide)
      const nextMeta = ensureMeta(meta, "_wcf_nextjs_override", "1");

      if (dryRun) {
        results.push({ id: p.id, slug: p.slug, updated: false });
        continue;
      }

      try {
        await wooCommerce.makeRequest(`/products/${p.id}`, {
          method: "PUT",
          body: JSON.stringify({ meta_data: nextMeta }),
        });
        results.push({ id: p.id, slug: p.slug, updated: true });
      } catch (e: any) {
        // Fallback: verify if meta actually updated despite non-JSON response
        try {
          const verify = await wooCommerce.getProduct(p.id);
          const nm = Array.isArray(verify?.meta_data) ? verify.meta_data : [];
          const val = nm.find((m: any) => m && m.key === "_wcf_nextjs_override")?.value;
          if (String(val) === "1") {
            results.push({ id: p.id, slug: p.slug, updated: true });
            continue;
          }
        } catch {}
        results.push({ id: p.id, slug: p.slug, updated: false, error: e?.message || "update_failed" });
      }
    }

    return NextResponse.json({ ok: true, count: results.length, results }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status: 200 });
  }
}
