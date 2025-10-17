import Link from "next/link";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function getProducts(limit = 100) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/products?limit=${limit}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return Array.isArray(json.products) ? json.products : [];
  } catch {
    return [];
  }
}

function getSlugFromPermalink(permalink: string): string | null {
  try {
    const u = new URL(permalink);
    const parts = u.pathname.split("/").filter(Boolean);
    const slug = parts[parts.length - 1] || null;
    return slug;
  } catch {
    const parts = (permalink || "").split("/").filter(Boolean);
    return parts[parts.length - 1] || null;
  }
}

export default async function ProductIndexPage() {
  const products = await getProducts(100);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-4">Products</h1>
      <p className="text-sm text-gray-600 mb-6">All products use /product/product-slug</p>
      {products.length === 0 ? (
        <div className="text-gray-600">No products found.</div>
      ) : (
        <ul className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p: any) => {
            const slug = getSlugFromPermalink(p.permalink || "");
            if (!slug) return null;
            return (
              <li key={p.id} className="border rounded p-3 hover:shadow-sm">
                <Link href={`/product/${slug}`} className="text-blue-600 underline">
                  {p.name || slug}
                </Link>
                {p.price ? <div className="text-sm text-gray-600 mt-1">${p.price}</div> : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
