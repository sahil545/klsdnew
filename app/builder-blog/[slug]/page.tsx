import React from "react";
import { notFound } from "next/navigation";
import { Navigation } from "../../../client/components/Navigation";
import { Footer } from "../../../client/components/Footer";
import { fetchPostBySlug, type BlogPost } from "../../../lib/builder-cms";
import { fetchArticleMeta } from "../../../lib/article-meta";
import { AuthorityBlogLayout } from "../../../client/components/blog/AuthorityTemplate";

export const revalidate = 300; // ISR every 5 minutes

function renderBody(body: any) {
  if (!body) return null;
  if (typeof body === "string") {
    const cleaned = body
      .replace(
        /\s(?:bis_size|bis-size|bis_[\w-]+|bis-[\w-]+|data-bis-[\w-]+)(?:=(['"]).*?\1|(?=\s|>))/gi,
        "",
      )
      .replace(/\sdata-bis-[\w-]+(?==|(?=\s|>))/gi, "");
    return (
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: cleaned }}
      />
    );
  }
  if (Array.isArray(body)) {
    const renderNodes = (nodes: any[]): React.ReactNode =>
      nodes.map((n: any, i: number) => {
        if (n.type === "paragraph") {
          return <p key={i}>{renderNodes(n.children || [])}</p>;
        }
        if (n.type === "heading") {
          const Tag =
            `h${n?.attrs?.level || 2}` as unknown as keyof JSX.IntrinsicElements;
          return <Tag key={i}>{renderNodes(n.children || [])}</Tag>;
        }
        if (n.type === "list") {
          const Tag = (
            n?.attrs?.ordered ? "ol" : "ul"
          ) as keyof JSX.IntrinsicElements;
          return <Tag key={i}>{renderNodes(n.children || [])}</Tag>;
        }
        if (n.type === "listItem") {
          return <li key={i}>{renderNodes(n.children || [])}</li>;
        }
        if (n.type === "link") {
          return (
            <a
              key={i}
              href={n?.attrs?.href}
              target={n?.attrs?.target || undefined}
              rel="noreferrer"
            >
              {renderNodes(n.children || [])}
            </a>
          );
        }
        if (n.type === "text") {
          let text: React.ReactNode = n.text || "";
          if (n.marks) {
            n.marks.forEach((m: any) => {
              if (m.type === "bold") text = <strong>{text}</strong>;
              if (m.type === "italic") text = <em>{text}</em>;
              if (m.type === "underline") text = <u>{text}</u>;
              if (m.type === "code") text = <code>{text}</code>;
            });
          }
          return <React.Fragment key={i}>{text}</React.Fragment>;
        }
        return null;
      });
    return <div className="prose max-w-none">{renderNodes(body)}</div>;
  }
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const item = await fetchPostBySlug(params.slug);
  if (!item) return {};
  const d = item.data as BlogPost;
  const url =
    d.canonicalUrl ||
    (d.slug ? `https://keylargoscubadiving.com${d.slug}` : undefined);
  let coverImage = d.coverImage;
  if (!coverImage && url) {
    const meta = await fetchArticleMeta(url);
    coverImage = meta.coverImage || undefined;
  }
  return {
    title: d.seoTitle || d.title,
    description: d.metaDescription || d.excerpt || undefined,
    alternates: d.canonicalUrl ? { canonical: d.canonicalUrl } : undefined,
    openGraph: {
      title: d.seoTitle || d.title,
      description: d.metaDescription || d.excerpt || undefined,
      type: "article",
      url: `/builder-blog/${params.slug}/`,
      images: coverImage ? [{ url: coverImage }] : undefined,
    },
  } as any;
}

export default async function Page({ params }: { params: { slug: string } }) {
  const item = await fetchPostBySlug(params.slug);
  if (!item) notFound();
  const d = item.data as BlogPost;
  const url =
    d.canonicalUrl ||
    (d.slug ? `https://keylargoscubadiving.com${d.slug}` : undefined);
  let author = d.author;
  let publishedDate = d.publishedDate;
  let coverImage = d.coverImage;
  if ((!author || !publishedDate || !coverImage) && url) {
    const meta = await fetchArticleMeta(url);
    author = author || meta.author;
    publishedDate = publishedDate || meta.publishedDate;
    coverImage = coverImage || meta.coverImage;
  }
  const date = publishedDate ? new Date(publishedDate) : null;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: d.seoTitle || d.title,
    description: d.metaDescription || d.excerpt || undefined,
    image: coverImage || undefined,
    author: author ? { "@type": "Person", name: author } : undefined,
    datePublished: publishedDate || undefined,
    mainEntityOfPage: url ? { "@type": "WebPage", "@id": url } : undefined,
    url: url,
  } as any;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="mx-auto max-w-7xl px-6 py-10">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <AuthorityBlogLayout
          title={d.title}
          author={author || null}
          dateLabel={date ? date.toISOString().slice(0, 10) : null}
          excerpt={d.excerpt || null}
          hero={coverImage ? { src: coverImage, alt: d.title } : null}
          body={<div className="prose max-w-none">{renderBody(d.body)}</div>}
        />
      </main>
      <Footer />
    </div>
  );
}
