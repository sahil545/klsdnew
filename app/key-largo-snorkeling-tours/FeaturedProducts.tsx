"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type ApiProduct = {
  id: number;
  name: string;
  slug?: string;
  price?: string;
  images?: { src: string; alt?: string }[];
  permalink?: string;
};

async function fetchProduct(id: number): Promise<ApiProduct | null> {
  try {
    const res = await fetch(`/api/products/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    const p = json?.product;
    if (!p) return null;
    return p as ApiProduct;
  } catch {
    return null;
  }
}

export default function FeaturedProducts({ ids }: { ids: number[] }) {
  const [items, setItems] = useState<ApiProduct[] | null>(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      const results = await Promise.all(ids.map((id) => fetchProduct(id)));
      if (!ignore) setItems(results.filter(Boolean) as ApiProduct[]);
    })();
    return () => {
      ignore = true;
    };
  }, [ids.join("-")]);

  if (!items) return (
    <div className="text-center text-sm text-muted-foreground">Loading featured tours…</div>
  );
  if (items.length === 0) return null;

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="mb-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold">Featured Snorkeling Tours</h2>
          <p className="text-muted-foreground">Hand-picked favorites our guests love</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((p) => {
            const href = p.slug ? `/product/${p.slug}` : p.permalink || "#";
            const img = p.images?.[0]?.src || "/placeholder.svg";
            const alt = p.images?.[0]?.alt || p.name;
            return (
              <Link key={p.id} href={href} className="group block rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-lg transition bg-white">
                <div className="relative h-44 bg-gray-50">
                  <Image src={img} alt={alt} fill className="object-cover" />
                  {p.price && (
                    <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded">${p.price}</div>
                  )}
                </div>
                <div className="p-4">
                  <div className="font-semibold text-sm line-clamp-2 group-hover:text-ocean">
                    {p.name}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
