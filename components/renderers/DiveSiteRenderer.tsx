import React from "react";

type DiveSite = {
  id: string;
  route_id: string;
  name: string;
  latitude?: number | null;
  longitude?: number | null;
  depth_min_m?: number | null;
  depth_max_m?: number | null;
  current_level?: string | null;
  skill_level?: string | null;
  highlights?: string[] | null;
  hazards?: string[] | null;
  seasonality?: string | null;
  body?: { sections?: { type: "richText"; html: string }[] } | any;
};

function metersToFeet(meters?: number | null) {
  if (meters == null) return null;
  return Math.round(meters * 3.28084);
}

export default function YourDiveSiteRenderer({ site }: { site: DiveSite }) {
  const hasCoordinates = site.latitude != null && site.longitude != null;
  const sections = site?.body?.sections || [];

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-bold md:text-4xl">{site.name}</h1>
        <p className="text-neutral-600">Dive Site Guide</p>
      </header>

      <section className="mb-10 grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl bg-neutral-50 p-5">
          <h2 className="mb-3 font-semibold">At-a-glance</h2>
          <ul className="space-y-1 text-sm">
            {site.skill_level ? (
              <li>
                <strong>Skill:</strong> {site.skill_level}
              </li>
            ) : null}
            {site.depth_min_m != null || site.depth_max_m != null ? (
              <li>
                <strong>Depth:</strong>{" "}
                {site.depth_min_m != null
                  ? `${site.depth_min_m}m (${metersToFeet(site.depth_min_m)}ft)`
                  : "—"}{" "}
                –{" "}
                {site.depth_max_m != null
                  ? `${site.depth_max_m}m (${metersToFeet(site.depth_max_m)}ft)`
                  : "—"}
              </li>
            ) : null}
            {site.current_level ? (
              <li>
                <strong>Current:</strong> {site.current_level}
              </li>
            ) : null}
            {site.seasonality ? (
              <li>
                <strong>Season:</strong> {site.seasonality}
              </li>
            ) : null}
          </ul>
        </div>

        <div className="rounded-2xl bg-neutral-50 p-5">
          <h2 className="mb-3 font-semibold">Highlights</h2>
          {site.highlights?.length ? (
            <ul className="list-disc space-y-1 pl-5">
              {site.highlights.map((highlight, index) => (
                <li key={index}>{highlight}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-neutral-600">Add highlights in CMS.</p>
          )}
        </div>

        <div className="rounded-2xl bg-neutral-50 p-5">
          <h2 className="mb-3 font-semibold">Hazards</h2>
          {site.hazards?.length ? (
            <ul className="list-disc space-y-1 pl-5">
              {site.hazards.map((hazard, index) => (
                <li key={index}>{hazard}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-neutral-600">No major hazards listed.</p>
          )}
        </div>
      </section>

      {hasCoordinates ? (
        <section className="mb-10">
          <div className="aspect-[16/9] overflow-hidden rounded-2xl bg-neutral-100">
            <iframe
              title="Map"
              className="h-full w-full"
              loading="lazy"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${site.longitude! - 0.02}%2C${site.latitude! - 0.02}%2C${site.longitude! + 0.02}%2C${site.latitude! + 0.02}&layer=mapnik&marker=${site.latitude}%2C${site.longitude}`}
            />
          </div>
        </section>
      ) : null}

      <article className="prose max-w-none">
        {sections.length ? (
          sections.map((section: any, index: number) =>
            section.type === "richText" ? (
              <div key={index} dangerouslySetInnerHTML={{ __html: section.html }} />
            ) : (
              <pre key={index} className="overflow-auto rounded-xl bg-neutral-100 p-4 text-xs">
                {JSON.stringify(section, null, 2)}
              </pre>
            ),
          )
        ) : (
          <p>No dive-site content yet.</p>
        )}
      </article>
    </main>
  );
}
