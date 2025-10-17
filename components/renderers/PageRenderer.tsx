import React from "react";

type Hero = {
  eyebrow?: string;
  headline?: string;
  subhead?: string;
  cta?: string;
  imageUrl?: string;
};

type Section =
  | { type: "richText"; html: string }
  | { type: "gallery"; images: { src: string; alt?: string }[] }
  | {
      type: "cta";
      heading?: string;
      text?: string;
      button?: { label: string; href: string };
    }
  | { type: string; [key: string]: any };

type PageBody = {
  hero?: Hero;
  sections?: Section[];
};

type Props = {
  body: PageBody | null;
  data?: Record<string, any> | null;
};

export default function YourPageRenderer({ body, data }: Props) {
  if (!body) {
    return (
      <main className="mx-auto max-w-3xl p-8">
        <h1 className="text-2xl font-semibold">Page</h1>
        <p className="text-sm text-neutral-600">No body content available.</p>
      </main>
    );
  }

  const { hero, sections = [] } = body;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      {hero ? (
        <section className="mb-10 grid items-center gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            {hero.eyebrow ? (
              <p className="text-sm uppercase tracking-wide text-neutral-500">
                {hero.eyebrow}
              </p>
            ) : null}
            {hero.headline ? (
              <h1 className="text-3xl font-bold md:text-5xl">
                {hero.headline}
              </h1>
            ) : null}
            {hero.subhead ? (
              <p className="text-lg text-neutral-700">{hero.subhead}</p>
            ) : null}
            {hero.cta ? (
              <a
                href="#booking"
                className="inline-block rounded-2xl bg-black px-5 py-3 text-white"
              >
                {hero.cta}
              </a>
            ) : null}
          </div>
          {hero.imageUrl ? (
            <div className="overflow-hidden rounded-2xl shadow">
              <img
                src={hero.imageUrl}
                alt={hero.headline || "Hero"}
                className="h-auto w-full"
              />
            </div>
          ) : null}
        </section>
      ) : null}

      {data && Object.keys(data).length > 0 ? (
        <section className="mb-10">
          <div className="flex flex-wrap gap-2">
            {Object.entries(data).map(([key, value]) => (
              <span
                key={key}
                className="rounded-full bg-neutral-100 px-3 py-1 text-xs"
              >
                <strong className="mr-1">{key}:</strong>
                <span>
                  {Array.isArray(value) ? value.join(", ") : String(value)}
                </span>
              </span>
            ))}
          </div>
        </section>
      ) : null}

      <article className="space-y-12">
        {sections.map((section, index) => {
          switch (section.type) {
            case "richText":
              return (
                <div key={index} className="prose max-w-none">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: (((section as any).html || "") as string)
                        .replace(
                          /\s(?:bis_size|bis-size|bis_[\w-]+|bis-[\w-]+|data-bis-[\w-]+)(?:=(['"]).*?\1|(?=\s|>))/gi,
                          "",
                        )
                        .replace(/\sdata-bis-[\w-]+(?==|(?=\s|>))/gi, ""),
                    }}
                  />
                </div>
              );
            case "gallery":
              return (
                <div
                  key={index}
                  className="grid grid-cols-2 gap-3 md:grid-cols-3"
                >
                  {(section as any).images?.map(
                    (image: any, imageIndex: number) => (
                      <img
                        key={imageIndex}
                        src={image.src}
                        alt={image.alt || ""}
                        className="h-auto w-full rounded-xl"
                      />
                    ),
                  )}
                </div>
              );
            case "cta":
              return (
                <div key={index} className="rounded-2xl bg-neutral-50 p-6">
                  {(section as any).heading ? (
                    <h2 className="mb-2 text-2xl font-semibold">
                      {(section as any).heading}
                    </h2>
                  ) : null}
                  {(section as any).text ? (
                    <p className="mb-4 text-neutral-700">
                      {(section as any).text}
                    </p>
                  ) : null}
                  {(section as any).button?.href ? (
                    <a
                      className="inline-block rounded-2xl bg-black px-5 py-3 text-white"
                      href={(section as any).button.href}
                    >
                      {(section as any).button.label || "Learn more"}
                    </a>
                  ) : null}
                </div>
              );
            default:
              return (
                <pre
                  key={index}
                  className="overflow-auto rounded-xl bg-neutral-100 p-4 text-xs"
                >
                  {JSON.stringify(section, null, 2)}
                </pre>
              );
          }
        })}
      </article>
    </main>
  );
}
