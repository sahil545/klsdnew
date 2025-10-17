"use client";

import { useEffect, useState } from "react";
import CertificationHero from "../components/CertificationHero";
import CertificationBookingSection from "../components/CertificationBookingSection";
import CertificationContent from "../components/CertificationContent";

export default function CertificationTemplateEmbedded({
  heroImageUrl,
  productId,
  initialPrice,
  productName,
  productSlug,
}: {
  heroImageUrl?: string;
  productId?: number;
  initialPrice?: number;
  productName?: string;
  productSlug?: string;
}) {
  const [heroData, setHeroData] = useState<any | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!productId) return;
      try {
        const res = await fetch(`/api/product-data/${productId}`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const json = await res.json();
        const td = json?.product?.tourData;
        if (!cancelled && td) setHeroData(td);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  return (
    <>
      <CertificationHero
        heroImageUrl={heroImageUrl}
        heroData={heroData || undefined}
        productId={productId}
        initialPrice={initialPrice}
        productName={productName}
        productSlug={productSlug}
      />
      <CertificationBookingSection
        productId={productId}
        defaultPrice={initialPrice}
      />
      <CertificationContent />
    </>
  );
}
