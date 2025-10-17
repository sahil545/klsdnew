import type { Metadata, ResolvingMetadata } from "next";
import { RenderBuilderContent } from "../components/BuilderComponent";
import FetchRequest from "../../lib/fetchRequest";
import { MODEL, QUERY_PARSER } from "../../lib/constants";
import { builder } from "@builder.io/sdk";

export const revalidate = 0;

interface PageProps {
  params: {
    page: string[];
  };
}

builder.init(process.env.NEXT_PUBLIC_BUILDER_API_KEY!);

type Props = {
  params: { page: string[] };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const content = await FetchRequest.getData({
    model: MODEL.PAGE,
    cache: false,
    query: [
      {
        key: QUERY_PARSER.URLPATH,
        value: `/${params.page.join("/") || ""}`,
      },
    ],
  });

  const ogImage = content?.results[0]?.data?.openGraphImage
    ? content?.results[0]?.data?.openGraphImage
    : "https://cdn.builder.io/api/v1/image/assets%2F2a778920e8d54a37b1576086f79dd676%2F078ec59be1b24e338d5a681cb34aad66";
  
  return {
    title: content?.results[0]?.data?.seoTitle,
    description: content?.results[0]?.data?.description,
    openGraph: {
      images: [ogImage],
    },
    robots: {
      index: content?.results[0]?.data?.noIndex !== true, // ✅ defaults to true
    }
  };
}

export default async function Page(props: PageProps) {
  const content = await FetchRequest.getData({
    model: MODEL.PAGE,
    cache: false,
    query: [
      {
        key: QUERY_PARSER.URLPATH,
        value: `/${props.params.page.join("/") || ""}`,
      },
    ],
  });

  return (
    <>
      <RenderBuilderContent content={content.results[0]} model={MODEL.PAGE} />
    </>
  );
}
