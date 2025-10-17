"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../../client/components/ui/dialog";

export type Row = {
  type: "Post" | "Page" | "Product";
  id: number | string;
  title: string;
  url?: string;
  status?: string;
  published?: string;
  modified?: string;
  authorId?: number;
  price?: string | number;
};

export default function ContentSummaryClient({ initialRows, wpBaseUrl, warnings: initialWarnings }: { initialRows: Row[]; wpBaseUrl: string | null; warnings: string[] }) {
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [warnings, setWarnings] = useState<string[]>(initialWarnings);
  const [filters, setFilters] = useState<{ Post: boolean; Page: boolean; Product: boolean }>({ Post: true, Page: true, Product: true });
  const [query, setQuery] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(false);
  type FieldFlags = { slugEqual: boolean; titleEqual: boolean; metaTitleEqual: boolean; descriptionEqual: boolean; canonicalEqual: boolean; publishedEqual: boolean };
  type FieldKey = "slug" | "title" | "metaTitle" | "description" | "canonical" | "published";
  type FieldValues = Partial<Record<FieldKey, { live: string | null; new: string | null }>>;
  const [seoStatus, setSeoStatus] = useState<Record<string, { state: "loading" | "error" | "done"; allEqual: boolean; fields?: FieldFlags; values?: FieldValues }>>({});
  const [selected, setSelected] = useState<{ url: string; field: FieldKey } | null>(null);

  useEffect(() => {
    let ignore = false;
    async function fetchProducts() {
      setLoadingProducts(true);
      const collected: any[] = [];
      const warn = (msg: string) => setWarnings((w) => [...w, msg]);
      try {
        try {
          const r = await fetch(`/api/products/all?per_page=100&max_pages=200`, { cache: "no-store" });
          if (r.ok) {
            const j = await r.json();
            if (Array.isArray(j?.products) && j.products.length) collected.push(...j.products);
          } else {
            warn(`products/all HTTP ${r.status}`);
          }
        } catch (e: any) {
          warn(`products/all failed: ${e?.message || 'error'}`);
        }

        if (collected.length === 0) {
          const perPage = 100;
          const maxPages = 20;
          for (let page = 1; page <= maxPages; page++) {
            try {
              const r = await fetch(`/api/products?limit=${perPage}&page=${page}`, { cache: "no-store" });
              if (!r.ok) { warn(`products page ${page} HTTP ${r.status}`); break; }
              const j = await r.json();
              const arr = Array.isArray(j?.products) ? j.products : [];
              if (!arr.length) break;
              collected.push(...arr);
              await new Promise((res) => setTimeout(res, 0));
            } catch (e: any) {
              warn(`products page ${page} failed: ${e?.message || 'error'}`);
              break;
            }
          }
        }

        if (collected.length === 0) {
          try {
            const r2 = await fetch(`/api/products/sync`, { cache: "no-store" });
            if (r2.ok) {
              const j2 = await r2.json();
              const real = Array.isArray(j2?.data?.real_products) ? j2.data.real_products : [];
              if (real.length) collected.push(...real);
            } else {
              warn(`products/sync HTTP ${r2.status}`);
            }
          } catch (e: any) {
            warn(`products/sync failed: ${e?.message || 'error'}`);
          }
        }

        if (collected.length === 0) warn("No products returned by any endpoint.");

        const byId = new Map<string | number, any>();
        for (const p of collected) if (p && p.id != null) byId.set(p.id, p);
        const prod = Array.from(byId.values());

        const mapped: Row[] = prod.map((p: any) => ({
          type: "Product",
          id: p.id,
          title: p.name,
          url: p.permalink,
          status: p.status,
          published: p.date_created || p.date_created_gmt || p.date,
          modified: p.date_modified || p.date_modified_gmt || p.modified,
          price: p.price,
        }));
        if (!ignore) setRows((prev) => [...prev, ...mapped]);
      } finally {
        if (!ignore) setLoadingProducts(false);
      }
    }
    fetchProducts();
    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const toCheck = rows
      .filter((r) => !!r.url)
      .slice(0, 300)
      .map((r) => r.url as string)
      .filter((u) => seoStatus[u] === undefined);
    if (toCheck.length === 0) return;

    const run = async () => {
      const concurrency = 6;
      let idx = 0;
      const next = async () => {
        if (cancelled) return;
        const i = idx++;
        const url = toCheck[i];
        if (!url) return;
        setSeoStatus((s) => ({ ...s, [url]: { state: "loading", allEqual: false } }));
        try {
          const res = await fetch(`/api/seo-compare?liveUrl=${encodeURIComponent(url)}`, { cache: "no-store" });
          const json = await res.json();
          const done = {
            state: "done" as const,
            allEqual: !!json?.allEqual,
            fields: json?.fields || undefined,
            values: json?.values || undefined,
          };
          setSeoStatus((s) => ({ ...s, [url]: done }));
        } catch {
          setSeoStatus((s) => ({ ...s, [url]: { state: "error", allEqual: false } }));
        }
        await next();
      };
      await Promise.all(Array.from({ length: concurrency }).map(() => next()));
    };
    run();
    return () => { cancelled = true; };
  }, [rows]);

  const filtered = useMemo(() => {
    return rows.filter((r) => filters[r.type] && (!query || r.title.toLowerCase().includes(query.toLowerCase()) || String(r.id).includes(query)));
  }, [rows, filters, query]);

  const counts = useMemo(() => {
    return rows.reduce((acc: Record<string, number>, r) => { acc[r.type] = (acc[r.type] || 0) + 1; return acc; }, {});
  }, [rows]);

  const showPriceColumn = useMemo(() => filtered.some((x) => x.type === "Product"), [filtered]);

  const seoCounts = useMemo(() => {
    let total = 0, ok = 0, mismatch = 0, err = 0, pending = 0;
    for (const r of filtered) {
      if (!r.url) continue;
      total++;
      const st = seoStatus[r.url];
      if (!st) { pending++; continue; }
      if (st.state === "loading") pending++;
      else if (st.state === "error") err++;
      else if (st.state === "done") {
        if (st.allEqual) ok++; else mismatch++;
      }
    }
    return { total, ok, mismatch, err, pending };
  }, [filtered, seoStatus]);

  return (
    <div className="space-y-4">
      {warnings.length > 0 && (
        <div className="rounded border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-900">
          <ul className="list-disc pl-5">
            {warnings.map((w, i) => (<li key={i}>{w}</li>))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {(["Post", "Page", "Product"] as const).map((t) => (
          <label key={t} className="inline-flex items-center gap-2 border rounded px-2 py-1 text-sm cursor-pointer">
            <input type="checkbox" checked={filters[t]} onChange={() => setFilters((f) => ({ ...f, [t]: !f[t] }))} />
            {t} <span className="text-xs text-muted-foreground">({counts[t] || 0})</span>
          </label>
        ))}
        <input
          className="ml-auto max-w-xs w-full border rounded px-3 py-1 text-sm"
          placeholder="Search by title or ID"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <FixCanonicalsButton onDone={() => setSeoStatus({})} />
      </div>

      <div className="flex items-center text-xs text-muted-foreground">
        <div className="ml-auto">SEO: Ok {seoCounts.ok}/{seoCounts.total} • Mismatch {seoCounts.mismatch} • Errors {seoCounts.err} • Pending {seoCounts.pending}</div>
      </div>

      <div className="overflow-auto rounded border">
        <table className="min-w-[1100px] w-full text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="text-left px-3 py-2 font-medium">Type</th>
              <th className="text-left px-3 py-2 font-medium">SEO Check</th>
              <th className="text-left px-3 py-2 font-medium">ID</th>
              <th className="text-left px-3 py-2 font-medium">Title</th>
              <th className="text-left px-3 py-2 font-medium">URL</th>
              <th className="text-left px-3 py-2 font-medium">Status</th>
              <th className="text-left px-3 py-2 font-medium">Published</th>
              <th className="text-left px-3 py-2 font-medium">Updated</th>
              <th className="text-left px-3 py-2 font-medium">Author</th>
              {showPriceColumn ? (
                <th className="text-left px-3 py-2 font-medium">Price</th>
              ) : null}
              <th className="text-left px-3 py-2 font-medium">Errors</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const st = r.url ? seoStatus[r.url] : undefined;
              const checked = st?.state === "done" && st.allEqual === true;
              const loading = st?.state === "loading";
              const errorState = st?.state === "error";
              const issues: { key: FieldKey; label: string }[] = [];
              if (st?.state === "done" && st.fields) {
                if (st.fields.titleEqual === false) issues.push({ key: "title", label: "title" });
                if (st.fields.metaTitleEqual === false) issues.push({ key: "metaTitle", label: "meta title" });
                if (st.fields.descriptionEqual === false) issues.push({ key: "description", label: "meta description" });
                if (st.fields.canonicalEqual === false) issues.push({ key: "canonical", label: "canonical URL" });
                if (st.fields.slugEqual === false) issues.push({ key: "slug", label: "slug" });
                if (st.fields.publishedEqual === false) issues.push({ key: "published", label: "published date" });
              }
              return (
                <tr key={`${r.type}:${r.id}`} className="border-t">
                  <td className="px-3 py-2">{r.type}</td>
                  <td className="px-3 py-2">
                    {r.url ? (
                      <label className="inline-flex items-center gap-2">
                        <input type="checkbox" readOnly checked={!!checked} />
                        <span className="text-xs text-muted-foreground">
                          {loading ? "Checking" : errorState ? "Error" : checked ? "Match" : issues.length ? "Mismatch" : ""}
                        </span>
                      </label>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2">{r.id}</td>
                  <td className="px-3 py-2">{r.title}</td>
                  <td className="px-3 py-2 truncate max-w-[280px]">
                    {r.url ? (
                      <a className="text-blue-600 underline" href={r.url} target="_blank" rel="noreferrer">Open</a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2">{r.status || ""}</td>
                  <td className="px-3 py-2">{r.published || ""}</td>
                  <td className="px-3 py-2">{r.modified || ""}</td>
                  <td className="px-3 py-2">{r.authorId ?? ""}</td>
                  {showPriceColumn ? (
                    <td className="px-3 py-2">{r.type === "Product" ? (r.price ?? "") : ""}</td>
                  ) : null}
                  <td className="px-3 py-2 text-xs text-red-700">
                    <div className="flex flex-col gap-1">
                      {issues.map((iss, i) => (
                        <button
                          key={`${iss.key}-${i}`}
                          className="text-left underline text-red-700 hover:text-red-800"
                          onClick={() => r.url && setSelected({ url: r.url, field: iss.key })}
                        >
                          {iss.label}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr className="border-t">
                <td className="px-3 py-6 text-center text-muted-foreground" colSpan={showPriceColumn ? 11 : 10}>
                  {loadingProducts ? "Loading…" : "No rows match your filters"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Error details dialog */}
      {selected && (
        <ErrorDialog
          url={selected.url}
          field={selected.field}
          data={seoStatus[selected.url]}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

function FixCanonicalsButton({ onDone }: { onDone: () => void }) {
  const [running, setRunning] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const run = async () => {
    if (running) return;
    setRunning(true);
    setSummary(null);
    try {
      const res = await fetch('/api/cms/fix-canonicals', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ limit: 50, maxTotal: 500 }) });
      const json = await res.json();
      if (json?.ok) setSummary(`Updated ${json.updated}/${json.total} (skipped ${json.skipped}) in ${json.usedModel}`);
      else setSummary(json?.error || 'Failed');
      onDone();
    } catch (e: any) {
      setSummary(e?.message || 'Failed');
    } finally {
      setRunning(false);
    }
  };
  return (
    <div className="flex items-center gap-2 text-xs">
      <button onClick={run} className="rounded border px-2 py-1 hover:bg-gray-50" disabled={running}>{running ? 'Fixing…' : 'Fix Canonicals'}</button>
      {summary ? <span className="text-muted-foreground">{summary}</span> : null}
    </div>
  );
}

function fieldLabel(k: "slug" | "title" | "metaTitle" | "description" | "canonical" | "published"): string {
  switch (k) {
    case "slug": return "Slug";
    case "title": return "Title";
    case "metaTitle": return "Meta Title";
    case "description": return "Meta Description";
    case "canonical": return "Canonical URL";
    case "published": return "Published Date";
  }
}

function suggestionFor(k: "slug" | "title" | "metaTitle" | "description" | "canonical" | "published"): string {
  switch (k) {
    case "slug":
      return "Update the Builder page URL path to exactly match the live site's slug/path.";
    case "title":
      return "Set the page <title> in Builder to exactly match the live site's title.";
    case "metaTitle":
      return "Set the SEO title (og:title) in Builder to exactly match the live site's meta title.";
    case "description":
      return "Set the meta description in Builder to exactly match the live site's description (keep within ~155 chars).";
    case "canonical":
      return "Set the canonical link in Builder to exactly match the live site's canonical URL (absolute URL recommended).";
    case "published":
      return "Set the article published date/time in Builder to match the live site's published date (ISO format).";
  }
}

function ErrorDialog({ url, field, data, onClose }: { url: string; field: "slug" | "title" | "metaTitle" | "description" | "canonical" | "published"; data?: { state: "loading" | "error" | "done"; allEqual: boolean; values?: Partial<Record<any, { live: string | null; new: string | null }>> }; onClose: () => void }) {
  const open = true;
  const liveVal = data?.values?.[field]?.live ?? null;
  const newVal = data?.values?.[field]?.new ?? null;
  return (
    <Dialog open={open} onOpenChange={(o: boolean) => { if (!o) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{fieldLabel(field)} mismatch</DialogTitle>
          <DialogDescription>Review the live value vs the value on this site (Builder). Make them identical for SEO parity.</DialogDescription>
        </DialogHeader>
        <div className="mt-3 space-y-3 text-sm">
          <div>
            <div className="font-medium text-muted-foreground">Live (keylargoscubadiving.com)</div>
            <div className="mt-1 rounded border bg-white p-2 break-words">{String(liveVal ?? "") || <em className="text-muted-foreground">empty</em>}</div>
          </div>
          <div>
            <div className="font-medium text-muted-foreground">This site (Builder)</div>
            <div className="mt-1 rounded border bg-white p-2 break-words">{String(newVal ?? "") || <em className="text-muted-foreground">empty</em>}</div>
          </div>
          <div>
            <div className="font-medium text-muted-foreground">What to change</div>
            <div className="mt-1 rounded border bg-amber-50 p-2">{suggestionFor(field)}</div>
          </div>
          <div className="text-xs text-muted-foreground">URL checked: <a className="underline" href={url} target="_blank" rel="noreferrer">{url}</a></div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
