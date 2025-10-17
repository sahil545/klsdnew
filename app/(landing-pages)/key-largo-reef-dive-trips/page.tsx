import type { Metadata } from "next";

import { DiveLandingPage, getKeyLargoReefDiveTripsPage } from "../components/dive-experience";

export async function generateMetadata(): Promise<Metadata> {
  const data = await getKeyLargoReefDiveTripsPage();
  return {
    title: data.seo.title,
    description: data.seo.description,
    alternates: { canonical: data.seo.canonical },
    openGraph: {
      title: data.seo.title,
      description: data.seo.description,
      url: data.seo.canonical,
      type: "website",
      images: data.seo.image ? [{ url: data.seo.image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: data.seo.title,
      description: data.seo.description,
    },
  };
}

export default async function KeyLargoReefDiveTripsPage() {
  const data = await getKeyLargoReefDiveTripsPage();
  return <DiveLandingPage data={data} />;
}
