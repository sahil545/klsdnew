import React from "react";

type Post = {
  id: string;
  route_id: string;
  title: string;
  excerpt?: string | null;
  body: { sections?: { type: "richText"; html: string }[] } | any;
  tags?: string[];
  author?: string | null;
  published_at?: string;
};

function formatDate(value?: string) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return value;
  }
}

import { AuthorityBlogLayout } from "../../client/components/blog/AuthorityTemplate";

export default function YourPostRenderer({ post }: { post: Post }) {
  const sections = Array.isArray(post?.body?.sections)
    ? post.body.sections
    : [];
  const takeaways = Array.isArray(post?.body?.takeaways)
    ? post.body.takeaways.filter((t: any) => t && typeof t.title === "string")
    : [];

  const heroFromSection = sections.find(
    (s: any) => s?.image && typeof s.image.url === "string",
  ) as { image: { url: string } } | undefined;
  const heroFallback =
    post?.body?.heroImage && typeof post.body.heroImage.url === "string"
      ? post.body.heroImage.url
      : null;
  const heroUrl = heroFromSection?.image?.url || heroFallback || null;

  const contentNodes = sections.length
    ? sections.map((section: any, index: number) => {
        if (section?.type === "richText" && typeof section.html === "string") {
          const cleaned = section.html
            .replace(
              /\s(?:bis_size|bis-size|bis_[\w-]+|bis-[\w-]+|data-bis-[\w-]+)(?:=(['"]).*?\1|(?=\s|>))/gi,
              "",
            )
            .replace(/\sdata-bis-[\w-]+(?==|(?=\s|>))/gi, "");
          return (
            <div
              key={`rt-${index}`}
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: cleaned }}
            />
          );
        }
        if (section?.type === "image" && typeof section.url === "string") {
          return (
            <div key={`img-${index}`} className="my-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={section.url}
                alt={section.alt || ""}
                className="w-full h-auto rounded-2xl border object-cover"
              />
              {section.caption ? (
                <p className="mt-2 text-sm text-muted-foreground text-center">
                  {section.caption}
                </p>
              ) : null}
            </div>
          );
        }
        return (
          <pre
            key={`unknown-${index}`}
            className="overflow-auto rounded-xl bg-neutral-100 p-4 text-xs"
          >
            {JSON.stringify(section, null, 2)}
          </pre>
        );
      })
    : [<p key="empty">No content yet.</p>];

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <AuthorityBlogLayout
        title={post.title}
        author={post.author ?? null}
        dateLabel={post.published_at ? formatDate(post.published_at) : null}
        excerpt={post.excerpt ?? null}
        hero={heroUrl ? { src: heroUrl, alt: post.title } : null}
        takeaways={takeaways}
        body={<div className="mt-6 space-y-8">{contentNodes}</div>}
      />
    </main>
  );
}
