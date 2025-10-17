import type { Metadata, ResolvingMetadata } from "next";
import { RenderBuilderContent } from "./components/BuilderComponent";
import FetchRequest from "../lib/fetchRequest";
import { MODEL, QUERY_PARSER } from "../lib/constants";
import { builder } from "@builder.io/sdk";

export const revalidate = 0;

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

builder.init(process.env.NEXT_PUBLIC_BUILDER_API_KEY!);

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const content = await FetchRequest.getData({
    model: MODEL.PAGE,
    cache: false,
    query: [
      {
        key: QUERY_PARSER.URLPATH,
        value: "/",
      },
    ],
  });

  // Fallback metadata if Builder.io content doesn't have SEO data
  const defaultMetadata = {
    title: "Key Largo Scuba Diving | #1 Rated Tours & PADI Certification",
    description: "Premium scuba diving tours and PADI certification in Key Largo, Florida Keys. Experience the famous Christ of the Abyss statue, coral reefs, and crystal-clear waters.",
  };

  return {
    title: content?.results[0]?.data?.seoTitle || defaultMetadata.title,
    description: content?.results[0]?.data?.seoDescription || defaultMetadata.description,
    openGraph: {
      title: content?.results[0]?.data?.seoTitle || defaultMetadata.title,
      description: content?.results[0]?.data?.seoDescription || defaultMetadata.description,
      images: content?.results[0]?.data?.openGraphImage ? [content.results[0].data.openGraphImage] : undefined,
    },
  };
}

export default async function HomePage({ searchParams }: PageProps) {
  const content = await FetchRequest.getData({
    model: MODEL.PAGE,
    cache: false,
    query: [
      {
        key: QUERY_PARSER.URLPATH,
        value: "/",
      },
    ],
  });
  
  return (
    <>
      <RenderBuilderContent content={content.results[0]} model={MODEL.PAGE} />
    </>
  );
}
