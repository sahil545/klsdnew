"use client";

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../client/components/ui/pagination";

type AuditRow = {
  url: string;
  status: number;
  loadMs: number;
  title: string | null;
  titleLength: number;
  metaDescription: string | null;
  descriptionLength: number;
  canonical: string | null;
  robotsMeta: string | null;
  xRobotsTag: string | null;
  indexable: boolean;
  robotsNoindex: boolean;
  robotsNofollow: boolean;
  robotsNoarchive: boolean;
  robotsNosnippet: boolean;
  h1: string | null;
  h1Count: number;
  wordCount: number;
  images: number;
  imagesMissingAlt: number;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  twitterTitle: string | null;
  twitterDescription: string | null;
  twitterImage: string | null;
  schemaLdCount: number;
  htmlLang: string | null;
  hreflangCount: number;
  hreflangs: string[];
};

type CompareFlags = {
  title: boolean;
  description: boolean;
  canonical: boolean;
  robots: boolean;
  og: boolean;
  twitter: boolean;
  h1: boolean;
  lang: boolean;
};

type CombinedRow = { base: AuditRow; compare: AuditRow; equal: CompareFlags };

type AuditResult = {
  ok: boolean;
  domain: string;
  compareDomain?: string;
  count: number;
  results: Array<AuditRow | CombinedRow>;
  generatedAt: string;
};

export default function SeoAuditPage() {
  const [domain, setDomain] = useState("https://keylargoscubadiving.com");
  const [compareDomain, setCompareDomain] = useState("");
  const [limit, setLimit] = useState(200);
  const [concurrency, setConcurrency] = useState(5);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [mismatchOnly, setMismatchOnly] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<any>(null);

  const isCompare = useMemo(() => {
    if (!data) return false;
    if (data.compareDomain) return true;
    const first = data.results?.[0] as any;
    return !!first?.base && !!first?.compare && !!first?.equal;
  }, [data]);

  const filteredResults = useMemo(() => {
    if (!data) return [];
    let list = data.results as Array<AuditRow | CombinedRow>;
    if (isCompare && mismatchOnly) {
      list = (list as CombinedRow[]).filter((r) =>
        Object.values(r.equal).some((v) => !v),
      );
    }
    return list;
  }, [data, isCompare, mismatchOnly]);

  const totalPages = useMemo(() => {
    const total = filteredResults.length;
    return Math.max(1, Math.ceil(total / pageSize));
  }, [filteredResults, pageSize]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredResults.slice(start, start + pageSize);
  }, [filteredResults, page, pageSize]);

  useEffect(() => {
    setPage(1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const run = async () => {
        setLoading(true);
        setError(null);
        if (abortRef.current) {
          try {
            abortRef.current.abort();
          } catch {}
        }
        const controller = new AbortController();
        abortRef.current = controller;
        try {
          const params = new URLSearchParams({
            domain,
            limit: String(limit),
            concurrency: String(concurrency),
          });
          if (compareDomain) params.set("compareDomain", compareDomain);
          const res = await fetch(`/api/seo-audit?${params.toString()}`, {
            cache: "no-store",
            signal: controller.signal,
          });
          const json = await res.json();
          if (!res.ok || !json.ok)
            throw new Error(json.error || `HTTP ${res.status}`);
          setData(json);
        } catch (e: any) {
          if (e?.name !== "AbortError")
            setError(e?.message || "Failed to run audit");
        } finally {
          setLoading(false);
        }
      };
      run();
    }, 800);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [domain, limit, concurrency, compareDomain]);

  const exportCsv = () => {
    if (!data) return;
    const list = filteredResults;
    if (isCompare) {
      const headers = [
        "Live URL",
        "New URL",
        "Title (Live)",
        "Title (New)",
        "EQ:Title",
        "Desc (Live)",
        "Desc (New)",
        "EQ:Desc",
        "Canon (Live)",
        "Canon (New)",
        "EQ:Canon",
        "Robots (Live)",
        "XRT (Live)",
        "Robots (New)",
        "XRT (New)",
        "EQ:Robots",
        "OG Title (Live)",
        "OG Title (New)",
        "OG Desc (Live)",
        "OG Desc (New)",
        "OG Img (Live)",
        "OG Img (New)",
        "EQ:OG",
        "TW Title (Live)",
        "TW Title (New)",
        "TW Desc (Live)",
        "TW Desc (New)",
        "TW Img (Live)",
        "TW Img (New)",
        "EQ:TW",
        "H1 (Live)",
        "H1 (New)",
        "EQ:H1",
        "Lang (Live)",
        "Lang (New)",
        "EQ:Lang",
      ];
      const rows = (list as CombinedRow[]).map(
        ({ base: a, compare: b, equal: e }) => [
          a.url,
          b.url,
          (a.title || "").replace(/"/g, '""'),
          (b.title || "").replace(/"/g, '""'),
          e.title ? "Y" : "N",
          (a.metaDescription || "").replace(/"/g, '""'),
          (b.metaDescription || "").replace(/"/g, '""'),
          e.description ? "Y" : "N",
          a.canonical || "",
          b.canonical || "",
          e.canonical ? "Y" : "N",
          a.robotsMeta || "",
          a.xRobotsTag || "",
          b.robotsMeta || "",
          b.xRobotsTag || "",
          e.robots ? "Y" : "N",
          (a.ogTitle || "").replace(/"/g, '""'),
          (b.ogTitle || "").replace(/"/g, '""'),
          (a.ogDescription || "").replace(/"/g, '""'),
          (b.ogDescription || "").replace(/"/g, '""'),
          a.ogImage || "",
          b.ogImage || "",
          e.og ? "Y" : "N",
          (a.twitterTitle || "").replace(/"/g, '""'),
          (b.twitterTitle || "").replace(/"/g, '""'),
          (a.twitterDescription || "").replace(/"/g, '""'),
          (b.twitterDescription || "").replace(/"/g, '""'),
          a.twitterImage || "",
          b.twitterImage || "",
          e.twitter ? "Y" : "N",
          (a.h1 || "").replace(/"/g, '""'),
          (b.h1 || "").replace(/"/g, '""'),
          e.h1 ? "Y" : "N",
          a.htmlLang || "",
          b.htmlLang || "",
          e.lang ? "Y" : "N",
        ],
      );
      const csv = [
        headers.join(","),
        ...rows.map((r) =>
          r
            .map((v) => (/[",\n]/.test(String(v)) ? `"${v}"` : String(v)))
            .join(","),
        ),
      ].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `seo-audit-compare-${new Date().toISOString().slice(0, 19)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    const headers = [
      "URL",
      "Status",
      "LoadMs",
      "Title",
      "TitleLen",
      "MetaDescription",
      "DescLen",
      "Canonical",
      "Robots",
      "X-Robots-Tag",
      "Indexable",
      "Noindex",
      "Nofollow",
      "Noarchive",
      "Nosnippet",
      "H1",
      "H1Count",
      "WordCount",
      "Images",
      "ImagesMissingAlt",
      "OG:Title",
      "OG:Description",
      "OG:Image",
      "TW:Title",
      "TW:Description",
      "TW:Image",
      "SchemaLD",
      "Lang",
      "HreflangCount",
      "Hreflangs",
    ];
    const rows = (list as AuditRow[]).map((r) => [
      r.url,
      String(r.status),
      String(r.loadMs),
      (r.title || "").replace(/"/g, '""'),
      String(r.titleLength),
      (r.metaDescription || "").replace(/"/g, '""'),
      String(r.descriptionLength),
      r.canonical || "",
      r.robotsMeta || "",
      r.xRobotsTag || "",
      r.indexable ? "yes" : "no",
      r.robotsNoindex ? "yes" : "no",
      r.robotsNofollow ? "yes" : "no",
      r.robotsNoarchive ? "yes" : "no",
      r.robotsNosnippet ? "yes" : "no",
      (r.h1 || "").replace(/"/g, '""'),
      String(r.h1Count),
      String(r.wordCount),
      String(r.images),
      String(r.imagesMissingAlt),
      (r.ogTitle || "").replace(/"/g, '""'),
      (r.ogDescription || "").replace(/"/g, '""'),
      r.ogImage || "",
      (r.twitterTitle || "").replace(/"/g, '""'),
      (r.twitterDescription || "").replace(/"/g, '""'),
      r.twitterImage || "",
      String(r.schemaLdCount),
      r.htmlLang || "",
      String(r.hreflangCount),
      (r.hreflangs || []).join("|"),
    ]);
    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        r
          .map((v) => (/[",\n]/.test(String(v)) ? `"${v}"` : String(v)))
          .join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `seo-audit-${new Date().toISOString().slice(0, 19)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold mb-2">SEO Audit</h1>
          <p className="text-sm text-gray-600 mb-4">
            Scan pages from a domain and extract key on-page SEO metrics. Add a
            compare domain to enforce meta parity.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Live domain
              </label>
              <input
                className="w-full border rounded px-3 py-2"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Compare with (new site, optional)
              </label>
              <input
                className="w-full border rounded px-3 py-2"
                value={compareDomain}
                onChange={(e) => setCompareDomain(e.target.value)}
                placeholder="https://new.example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Page limit
              </label>
              <input
                type="number"
                className="w-full border rounded px-3 py-2"
                value={limit}
                min={1}
                max={500}
                onChange={(e) => setLimit(parseInt(e.target.value || "0", 10))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Concurrency
              </label>
              <input
                type="number"
                className="w-full border rounded px-3 py-2"
                value={concurrency}
                min={1}
                max={10}
                onChange={(e) =>
                  setConcurrency(parseInt(e.target.value || "0", 10))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Rows per page
              </label>
              <select
                className="w-full border rounded px-3 py-2"
                value={pageSize}
                onChange={(e) => setPageSize(parseInt(e.target.value, 10))}
              >
                {[25, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            {isCompare && (
              <div className="flex items-center gap-2 md:col-span-6">
                <label className="text-sm">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={mismatchOnly}
                    onChange={(e) => setMismatchOnly(e.target.checked)}
                  />
                  Show mismatches only
                </label>
              </div>
            )}
            <div className="md:col-span-6 flex gap-2 mt-2">
              {data && (
                <button
                  onClick={exportCsv}
                  className="px-4 py-2 rounded bg-gray-100 border hover:bg-gray-200"
                >
                  Export CSV
                </button>
              )}
              <div className="text-sm text-gray-500 ml-auto">
                {loading
                  ? "Scanning…"
                  : data
                    ? `Pages: ${data.count} • Generated: ${new Date(data.generatedAt).toISOString().replace("T", " ").slice(0, 19)}Z`
                    : ""}
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 border border-red-200 bg-red-50 text-red-800 rounded p-3">
              {error}
            </div>
          )}
        </div>

        {data && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-lg font-semibold">Results</h2>
                <p className="text-sm text-gray-600">
                  {isCompare
                    ? `Live: ${data.domain} • New: ${data.compareDomain}`
                    : `Domain: ${data.domain}`}
                </p>
              </div>
            </div>

            <div className="overflow-auto">
              {!isCompare ? (
                <table className="min-w-full text-xs border">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      {[
                        "URL",
                        "St",
                        "ms",
                        "Title",
                        "TLen",
                        "Desc",
                        "DLen",
                        "Canon",
                        "Robots",
                        "XRT",
                        "Idx",
                        "NI",
                        "NF",
                        "NA",
                        "NS",
                        "H1",
                        "H1#",
                        "Words",
                        "Img",
                        "ImgNoAlt",
                        "OG Title",
                        "OG Desc",
                        "OG Img",
                        "TW Title",
                        "TW Desc",
                        "TW Img",
                        "LD#",
                        "Lang",
                        "HRef#",
                        "HRefLangs",
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-left p-2 border-b whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(paginated as AuditRow[]).map((r) => (
                      <tr key={r.url} className="border-b hover:bg-gray-50">
                        <td className="p-2 max-w-[320px] truncate">
                          <a
                            className="text-blue-600 underline"
                            href={r.url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {r.url}
                          </a>
                        </td>
                        <td className="p-2 whitespace-nowrap">
                          {r.status || "-"}
                        </td>
                        <td className="p-2 whitespace-nowrap">{r.loadMs}</td>
                        <td
                          className="p-2 max-w-[260px] truncate"
                          title={r.title || ""}
                        >
                          {r.title || ""}
                        </td>
                        <td className="p-2">{r.titleLength}</td>
                        <td
                          className="p-2 max-w-[300px] truncate"
                          title={r.metaDescription || ""}
                        >
                          {r.metaDescription || ""}
                        </td>
                        <td className="p-2">{r.descriptionLength}</td>
                        <td
                          className="p-2 max-w-[300px] truncate"
                          title={r.canonical || ""}
                        >
                          {r.canonical || ""}
                        </td>
                        <td
                          className="p-2 max-w-[220px] truncate"
                          title={r.robotsMeta || ""}
                        >
                          {r.robotsMeta || ""}
                        </td>
                        <td
                          className="p-2 max-w-[180px] truncate"
                          title={r.xRobotsTag || ""}
                        >
                          {r.xRobotsTag || ""}
                        </td>
                        <td className="p-2">{r.indexable ? "Y" : "N"}</td>
                        <td className="p-2">{r.robotsNoindex ? "Y" : ""}</td>
                        <td className="p-2">{r.robotsNofollow ? "Y" : ""}</td>
                        <td className="p-2">{r.robotsNoarchive ? "Y" : ""}</td>
                        <td className="p-2">{r.robotsNosnippet ? "Y" : ""}</td>
                        <td
                          className="p-2 max-w-[220px] truncate"
                          title={r.h1 || ""}
                        >
                          {r.h1 || ""}
                        </td>
                        <td className="p-2">{r.h1Count}</td>
                        <td className="p-2">{r.wordCount}</td>
                        <td className="p-2">{r.images}</td>
                        <td className="p-2">{r.imagesMissingAlt}</td>
                        <td
                          className="p-2 max-w-[260px] truncate"
                          title={r.ogTitle || ""}
                        >
                          {r.ogTitle || ""}
                        </td>
                        <td
                          className="p-2 max-w-[300px] truncate"
                          title={r.ogDescription || ""}
                        >
                          {r.ogDescription || ""}
                        </td>
                        <td
                          className="p-2 max-w-[240px] truncate"
                          title={r.ogImage || ""}
                        >
                          {r.ogImage || ""}
                        </td>
                        <td
                          className="p-2 max-w-[260px] truncate"
                          title={r.twitterTitle || ""}
                        >
                          {r.twitterTitle || ""}
                        </td>
                        <td
                          className="p-2 max-w-[300px] truncate"
                          title={r.twitterDescription || ""}
                        >
                          {r.twitterDescription || ""}
                        </td>
                        <td
                          className="p-2 max-w-[240px] truncate"
                          title={r.twitterImage || ""}
                        >
                          {r.twitterImage || ""}
                        </td>
                        <td className="p-2">{r.schemaLdCount}</td>
                        <td className="p-2">{r.htmlLang || ""}</td>
                        <td className="p-2">{r.hreflangCount}</td>
                        <td
                          className="p-2 max-w-[280px] truncate"
                          title={(r.hreflangs || []).join(", ")}
                        >
                          {(r.hreflangs || []).join(", ")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="min-w-[1400px] text-xs border">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      {[
                        "Live URL",
                        "New URL",
                        "T",
                        "D",
                        "C",
                        "R",
                        "OG",
                        "TW",
                        "H1",
                        "Lang",
                        "Title (Live)",
                        "Title (New)",
                        "Desc (Live)",
                        "Desc (New)",
                        "Canon (Live)",
                        "Canon (New)",
                        "Robots (Live)",
                        "XRT (Live)",
                        "Robots (New)",
                        "XRT (New)",
                        "OG Title (Live)",
                        "OG Title (New)",
                        "OG Desc (Live)",
                        "OG Desc (New)",
                        "OG Img (Live)",
                        "OG Img (New)",
                        "TW Title (Live)",
                        "TW Title (New)",
                        "TW Desc (Live)",
                        "TW Desc (New)",
                        "TW Img (Live)",
                        "TW Img (New)",
                        "H1 (Live)",
                        "H1 (New)",
                        "Lang (Live)",
                        "Lang (New)",
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-left p-2 border-b whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(paginated as CombinedRow[]).map(
                      ({ base: a, compare: b, equal: e }) => (
                        <tr key={a.url} className="border-b hover:bg-gray-50">
                          <td className="p-2 max-w-[320px] truncate">
                            <a
                              className="text-blue-600 underline"
                              href={a.url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {a.url}
                            </a>
                          </td>
                          <td className="p-2 max-w-[320px] truncate">
                            <a
                              className="text-blue-600 underline"
                              href={b.url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {b.url}
                            </a>
                          </td>
                          {(
                            [
                              e.title,
                              e.description,
                              e.canonical,
                              e.robots,
                              e.og,
                              e.twitter,
                              e.h1,
                              e.lang,
                            ] as boolean[]
                          ).map((ok, i) => (
                            <td
                              key={i}
                              className={
                                "p-2 font-semibold " +
                                (ok ? "text-green-700" : "text-red-700")
                              }
                            >
                              {ok ? "✓" : "✕"}
                            </td>
                          ))}
                          <td
                            className="p-2 max-w-[260px] truncate"
                            title={a.title || ""}
                          >
                            {a.title || ""}
                          </td>
                          <td
                            className="p-2 max-w-[260px] truncate"
                            title={b.title || ""}
                          >
                            {b.title || ""}
                          </td>
                          <td
                            className="p-2 max-w-[300px] truncate"
                            title={a.metaDescription || ""}
                          >
                            {a.metaDescription || ""}
                          </td>
                          <td
                            className="p-2 max-w-[300px] truncate"
                            title={b.metaDescription || ""}
                          >
                            {b.metaDescription || ""}
                          </td>
                          <td
                            className="p-2 max-w-[300px] truncate"
                            title={a.canonical || ""}
                          >
                            {a.canonical || ""}
                          </td>
                          <td
                            className="p-2 max-w-[300px] truncate"
                            title={b.canonical || ""}
                          >
                            {b.canonical || ""}
                          </td>
                          <td
                            className="p-2 max-w-[220px] truncate"
                            title={a.robotsMeta || ""}
                          >
                            {a.robotsMeta || ""}
                          </td>
                          <td
                            className="p-2 max-w-[220px] truncate"
                            title={a.xRobotsTag || ""}
                          >
                            {a.xRobotsTag || ""}
                          </td>
                          <td
                            className="p-2 max-w-[220px] truncate"
                            title={b.robotsMeta || ""}
                          >
                            {b.robotsMeta || ""}
                          </td>
                          <td
                            className="p-2 max-w-[220px] truncate"
                            title={b.xRobotsTag || ""}
                          >
                            {b.xRobotsTag || ""}
                          </td>
                          <td
                            className="p-2 max-w-[260px] truncate"
                            title={a.ogTitle || ""}
                          >
                            {a.ogTitle || ""}
                          </td>
                          <td
                            className="p-2 max-w-[260px] truncate"
                            title={b.ogTitle || ""}
                          >
                            {b.ogTitle || ""}
                          </td>
                          <td
                            className="p-2 max-w-[300px] truncate"
                            title={a.ogDescription || ""}
                          >
                            {a.ogDescription || ""}
                          </td>
                          <td
                            className="p-2 max-w-[300px] truncate"
                            title={b.ogDescription || ""}
                          >
                            {b.ogDescription || ""}
                          </td>
                          <td
                            className="p-2 max-w-[240px] truncate"
                            title={a.ogImage || ""}
                          >
                            {a.ogImage || ""}
                          </td>
                          <td
                            className="p-2 max-w-[240px] truncate"
                            title={b.ogImage || ""}
                          >
                            {b.ogImage || ""}
                          </td>
                          <td
                            className="p-2 max-w-[260px] truncate"
                            title={a.twitterTitle || ""}
                          >
                            {a.twitterTitle || ""}
                          </td>
                          <td
                            className="p-2 max-w-[260px] truncate"
                            title={b.twitterTitle || ""}
                          >
                            {b.twitterTitle || ""}
                          </td>
                          <td
                            className="p-2 max-w-[300px] truncate"
                            title={a.twitterDescription || ""}
                          >
                            {a.twitterDescription || ""}
                          </td>
                          <td
                            className="p-2 max-w-[300px] truncate"
                            title={b.twitterDescription || ""}
                          >
                            {b.twitterDescription || ""}
                          </td>
                          <td
                            className="p-2 max-w-[240px] truncate"
                            title={a.twitterImage || ""}
                          >
                            {a.twitterImage || ""}
                          </td>
                          <td
                            className="p-2 max-w-[240px] truncate"
                            title={b.twitterImage || ""}
                          >
                            {b.twitterImage || ""}
                          </td>
                          <td className="p-2">{a.h1 || ""}</td>
                          <td className="p-2">{b.h1 || ""}</td>
                          <td className="p-2">{a.htmlLang || ""}</td>
                          <td className="p-2">{b.htmlLang || ""}</td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              )}
            </div>

            <div className="flex items-center justify-between mt-3 text-sm text-gray-600">
              <div>
                {filteredResults.length ? (
                  <span>
                    Showing {(page - 1) * pageSize + 1}-
                    {Math.min(page * pageSize, filteredResults.length)} of{" "}
                    {filteredResults.length}
                  </span>
                ) : null}
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setPage((p) => Math.max(1, p - 1));
                      }}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages })
                    .slice(0, 5)
                    .map((_, i) => {
                      const p = i + 1;
                      return (
                        <PaginationItem key={p}>
                          <PaginationLink
                            href="#"
                            isActive={p === page}
                            onClick={(e) => {
                              e.preventDefault();
                              setPage(p);
                            }}
                          >
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setPage((p) => Math.min(totalPages, p + 1));
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
