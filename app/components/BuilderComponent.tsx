"use client";
import dynamic from "next/dynamic";
import DefaultErrorPage from "next/error";

// Dynamically import BuilderComponent on the client only to avoid server bundling issues
const BuilderComponentNoSSR = dynamic(
  () => import("@builder.io/react").then((m) => m.BuilderComponent),
  { ssr: false },
);

type BuilderPageProps = {
  content?: any;
  model?: string;
};

export function RenderBuilderContent({ content, model }: BuilderPageProps) {
  if (content) {
    return <BuilderComponentNoSSR content={content} model={model} />;
  }
  return <DefaultErrorPage statusCode={404} />;
}
