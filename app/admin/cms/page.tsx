"use client";

"use client";

import { useEffect, useState } from "react";

type Status = { connected: boolean; reason?: string; sample?: any };

export default function AdminCMSPage() {
  const [status, setStatus] = useState<Status | null>(null);
  const [model, setModel] = useState("page");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = async () => {
    try {
      const res = await fetch("/api/cms/status", { cache: "no-store" });
      const json = await res.json();
      setStatus(json);
    } catch (e: any) {
      setStatus({
        connected: false,
        reason: e?.message || "Failed to check status",
      });
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const loadContent = async () => {
    setLoading(true);
    setError(null);
    setItems([]);
    try {
      const pk =
        typeof window !== "undefined"
          ? localStorage.getItem("cms_public_key_override") || ""
          : "";
      const res = await fetch(
        `/api/cms/content/${encodeURIComponent(model)}?limit=50`,
        {
          cache: "no-store",
          headers: pk ? ({ "x-builder-public-key": pk } as any) : undefined,
        },
      );
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed");
      setItems(json.results || []);
    } catch (e: any) {
      setError(e?.message || "Failed to load content");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold mb-2">CMS Admin</h1>
          <p className="text-sm text-gray-600 mb-4">
            View Builder.io connection and browse content.
          </p>

          <div className="flex flex-wrap items-end gap-3">
            <div>
              <div className="text-sm font-medium">Connection</div>
              <div className="flex items-center gap-3 text-sm">
                {status ? (
                  status.connected ? (
                    <span className="text-green-700">Connected</span>
                  ) : (
                    <span className="text-red-700">
                      Not connected{status.reason ? `: ${status.reason}` : ""}
                    </span>
                  )
                ) : (
                  <span className="text-gray-500">Checking…</span>
                )}
                <button
                  onClick={checkStatus}
                  className="px-2 py-1 rounded border text-xs hover:bg-gray-50"
                >
                  Retry
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium" htmlFor="model">
                Model
              </label>
              <input
                id="model"
                className="border rounded px-3 py-2"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="page"
              />
              <button
                onClick={loadContent}
                disabled={loading || !status?.connected}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Loading…" : "Load Content"}
              </button>
            </div>
          </div>

          {status && !status.connected && (
            <div className="mt-4 text-sm text-gray-700">
              Set BUILDER_PUBLIC_API_KEY (or NEXT_PUBLIC_BUILDER_API_KEY) to
              enable browsing content.
            </div>
          )}
        </div>

        <SyncBlogMetadata />

        <MigrationPanel />

        <CleanupStructuredPagesPanel />

        <BookingsSyncPanel />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded p-3 mb-4">
            {error}
          </div>
        )}

        {items.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-3">
              Items ({items.length})
            </h2>
            <div className="overflow-auto">
              <table className="min-w-full text-sm border">
                <thead className="bg-gray-50">
                  <tr>
                    {["Name", "ID", "Published", "Updated", "Preview"].map(
                      (h) => (
                        <th
                          key={h}
                          className="text-left p-2 border-b whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {items.map((it: any) => (
                    <tr key={it.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 max-w-[300px] truncate">
                        {it.name || it.data?.title || it.id}
                      </td>
                      <td className="p-2 whitespace-nowrap">{it.id}</td>
                      <td className="p-2 whitespace-nowrap">
                        {String(!!it.published)}
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        {(() => {
                          const v =
                            it.data?.publishedAtUtcMs ??
                            it.data?.publishedDate ??
                            it.data?.datePublished ??
                            it.publishedDate ??
                            it.lastUpdated;
                          if (!v) return "";
                          return typeof v === "number"
                            ? new Date(v).toISOString()
                            : String(v);
                        })()}
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        {it.url ? (
                          <a
                            className="text-blue-600 underline"
                            href={it.url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open
                          </a>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SyncBlogMetadata() {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [tempKey, setTempKey] = useState("");
  const [modelOverride, setModelOverride] = useState("");
  const [publicKeyOverride, setPublicKeyOverride] = useState("");
  const [siteOverride, setSiteOverride] = useState("");
  const [syncAuthor, setSyncAuthor] = useState(false);
  const [syncDate, setSyncDate] = useState(true);
  const [syncImage, setSyncImage] = useState(false);
  const [syncMeta, setSyncMeta] = useState(true);
  const [syncSeoTitle, setSyncSeoTitle] = useState(true);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch("/api/cms/private-key/status", {
          cache: "no-store",
        });
        const json = await res.json();
        setHasKey(!!json.present);
      } catch {
        setHasKey(null);
      }
    };
    check();
    try {
      const pk = localStorage.getItem("cms_private_key_override") || "";
      const pub = localStorage.getItem("cms_public_key_override") || "";
      const mdl = localStorage.getItem("cms_model_override") || "";
      const site = localStorage.getItem("cms_site_override") || "";
      if (pk) setTempKey(pk);
      if (pub) setPublicKeyOverride(pub);
      if (mdl) setModelOverride(mdl);
      if (site) setSiteOverride(site);
    } catch {}
  }, []);

  const run = async () => {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/cms/sync-blog-metadata", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(tempKey?.trim()
            ? { "x-builder-private-key": tempKey.trim() }
            : {}),
          ...(modelOverride ? { "x-builder-model": modelOverride } : {}),
          ...(publicKeyOverride
            ? { "x-builder-public-key": publicKeyOverride }
            : {}),
          ...(siteOverride ? { "x-site": siteOverride } : {}),
        },
        body: JSON.stringify({
          privateKey: tempKey?.trim() || undefined,
          model: modelOverride || undefined,
          publicKey: publicKeyOverride || undefined,
          site: siteOverride || undefined,
          limit,
          fields: [
            ...(syncAuthor ? ["author"] : []),
            ...(syncDate ? ["publishedDate"] : []),
            ...(syncImage ? ["coverImage"] : []),
            ...(syncMeta ? ["metaDescription"] : []),
            ...(syncSeoTitle ? ["seoTitle"] : []),
          ],
        }),
      });
      const text = await res.text();
      let json: any = {};
      try {
        json = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(`Invalid JSON (${res.status})`);
      }
      if (!json.ok)
        throw new Error(json.error || `Failed (HTTP ${res.status})`);
      setResult(json);
    } catch (e: any) {
      setError(e?.message || "Failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Blog Metadata Sync</h2>
          <p className="text-sm text-gray-600">
            Fill author, publishedDate, and coverImage from live pages. Requires
            Builder private key to write.
          </p>
          <div className="text-xs mt-1">
            {hasKey === null ? (
              <span className="text-gray-500">Checking key…</span>
            ) : hasKey ? (
              <span className="text-green-700">
                Private key detected in server env.
              </span>
            ) : (
              <span className="text-red-700">Private key not detected.</span>
            )}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <input
              type="password"
              className="border rounded px-3 py-1 text-sm w-80"
              placeholder="Private API key override (optional)"
              value={tempKey}
              onChange={(e) => {
                setTempKey(e.target.value);
                try {
                  localStorage.setItem(
                    "cms_private_key_override",
                    e.target.value,
                  );
                } catch {}
              }}
            />
            <input
              type="text"
              className="border rounded px-3 py-1 text-sm w-64"
              placeholder="Model override (e.g. page, blog-posts)"
              value={modelOverride}
              onChange={(e) => {
                setModelOverride(e.target.value);
                try {
                  localStorage.setItem("cms_model_override", e.target.value);
                } catch {}
              }}
            />
            <input
              type="text"
              className="border rounded px-3 py-1 text-sm w-72"
              placeholder="Public API key override (optional)"
              value={publicKeyOverride}
              onChange={(e) => {
                setPublicKeyOverride(e.target.value);
                try {
                  localStorage.setItem(
                    "cms_public_key_override",
                    e.target.value,
                  );
                } catch {}
              }}
            />
            <input
              type="text"
              className="border rounded px-3 py-1 text-sm w-[28rem]"
              placeholder="Site origin override (e.g. https://keylargoscubadiving.com)"
              value={siteOverride}
              onChange={(e) => {
                setSiteOverride(e.target.value);
                try {
                  localStorage.setItem("cms_site_override", e.target.value);
                } catch {}
              }}
            />
            <input
              type="number"
              min={1}
              max={50}
              className="border rounded px-3 py-1 text-sm w-28"
              placeholder="Limit"
              value={limit}
              onChange={(e) =>
                setLimit(
                  Math.max(
                    1,
                    Math.min(50, parseInt(e.target.value || "10", 10)),
                  ),
                )
              }
              title="Items to process per run"
            />
          </div>
          <div className="mt-3 flex items-center gap-4 text-sm">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={syncDate}
                onChange={(e) => setSyncDate(e.target.checked)}
              />
              <span>Published date</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={syncAuthor}
                onChange={(e) => setSyncAuthor(e.target.checked)}
              />
              <span>Author</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={syncImage}
                onChange={(e) => setSyncImage(e.target.checked)}
              />
              <span>Cover image</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={syncMeta}
                onChange={(e) => setSyncMeta(e.target.checked)}
              />
              <span>Meta description</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={syncSeoTitle}
                onChange={(e) => setSyncSeoTitle(e.target.checked)}
              />
              <span>SEO title</span>
            </label>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={run}
            disabled={busy}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {busy ? "Syncing…" : "Sync Now"}
          </button>
          <button
            onClick={async () => {
              setBusy(true);
              setError(null);
              setResult(null);
              try {
                const fields = [
                  ...(syncAuthor ? ["author"] : []),
                  ...(syncDate ? ["publishedDate"] : []),
                  ...(syncImage ? ["coverImage"] : []),
                  ...(syncMeta ? ["metaDescription"] : []),
                  ...(syncSeoTitle ? ["seoTitle"] : []),
                ];
                const headers: any = {
                  "Content-Type": "application/json",
                  ...(tempKey?.trim()
                    ? { "x-builder-private-key": tempKey.trim() }
                    : {}),
                  ...(publicKeyOverride
                    ? { "x-builder-public-key": publicKeyOverride }
                    : {}),
                  ...(siteOverride ? { "x-site": siteOverride } : {}),
                };
                const runOne = async (model: string) => {
                  const r = await fetch("/api/cms/sync-blog-metadata", {
                    method: "POST",
                    headers: { ...headers, "x-builder-model": model },
                    body: JSON.stringify({ fields, model, limit }),
                  });
                  const t = await r.text();
                  const j = t ? JSON.parse(t) : {};
                  if (!j.ok) throw new Error(j.error || `Failed ${model}`);
                  return j;
                };
                const resp = await fetch("/api/cms/sync-pages-and-blog", {
                  method: "POST",
                  headers: headers,
                  body: JSON.stringify({ fields, limit }),
                });
                const txt = await resp.text();
                const json = txt ? JSON.parse(txt) : {};
                if (!json.ok)
                  throw new Error(
                    json?.error || `Failed (HTTP ${resp.status})`,
                  );
                setResult(json);
              } catch (e: any) {
                setError(e?.message || "Failed");
              } finally {
                setBusy(false);
              }
            }}
            disabled={busy}
            className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
            title="Sync pages and blog posts"
          >
            {busy ? "Syncing…" : "Sync Pages & Blog"}
          </button>
          <button
            onClick={async () => {
              setBusy(true);
              setError(null);
              setResult(null);
              try {
                const res = await fetch("/api/cms/sync-published-date", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    ...(tempKey?.trim()
                      ? { "x-builder-private-key": tempKey.trim() }
                      : {}),
                    ...(modelOverride
                      ? { "x-builder-model": modelOverride }
                      : {}),
                    ...(publicKeyOverride
                      ? { "x-builder-public-key": publicKeyOverride }
                      : {}),
                    ...(siteOverride ? { "x-site": siteOverride } : {}),
                  },
                  body: JSON.stringify({
                    privateKey: tempKey || undefined,
                    model: modelOverride || undefined,
                    publicKey: publicKeyOverride || undefined,
                    site: siteOverride || undefined,
                    limit: 20,
                  }),
                });
                const text = await res.text();
                const json = text ? JSON.parse(text) : {};
                if (!json.ok)
                  throw new Error(json.error || `Failed (HTTP ${res.status})`);
                setResult(json);
              } catch (e: any) {
                setError(e?.message || "Failed");
              } finally {
                setBusy(false);
              }
            }}
            disabled={busy}
            className="px-4 py-2 rounded bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50"
            title="WP REST only; updates published date fields"
          >
            {busy ? "Syncing…" : "Sync Published Only"}
          </button>
        </div>
      </div>
      {error && <div className="mt-3 text-sm text-red-700">{error}</div>}
      {result && (
        <div className="mt-4 text-sm">
          {(() => {
            const pages = (result.pages?.result || {}) as any;
            const blogs = (result.blogs?.result || {}) as any;
            const single = result.count !== undefined ? result : null;
            const total = single
              ? single.count
              : Number(pages.count || 0) + Number(blogs.count || 0);
            const tried = single
              ? single.triedModels || []
              : [...(pages.triedModels || []), ...(blogs.triedModels || [])];
            const rows = single
              ? single.results || []
              : [
                  ...((pages.results || []) as any[]),
                  ...((blogs.results || []) as any[]),
                ];
            const missingKey = single ? single.missingPrivateKey : false;
            return (
              <>
                <div className="mb-2">
                  Processed: {total || 0} items.{" "}
                  {missingKey
                    ? "Private key missing—no writes performed."
                    : "Writes attempted."}
                </div>
                <div className="mb-2 text-xs text-gray-600">
                  Models tried: {tried.join(", ") || "—"}
                </div>
                <div className="max-h-64 overflow-auto border rounded">
                  <table className="min-w-full text-xs">
                    <thead className="bg-gray-50">
                      <tr>
                        {[
                          "slug",
                          "updated",
                          "author",
                          "date",
                          "image",
                          "error",
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
                      {rows.map((r: any, i: number) => (
                        <tr key={i} className="border-b">
                          <td className="p-2 whitespace-nowrap">
                            {r.slug || r.id}
                          </td>
                          <td className="p-2 whitespace-nowrap">
                            {String(!!r.updated)}
                          </td>
                          <td className="p-2 whitespace-nowrap">
                            {r.found?.author || ""}
                          </td>
                          <td className="p-2 whitespace-nowrap">
                            {r.found?.publishedDate ||
                              (r.patch?.publishedAtUtcMs
                                ? new Date(
                                    r.patch.publishedAtUtcMs,
                                  ).toISOString()
                                : "")}
                          </td>
                          <td className="p-2 max-w-[240px] truncate">
                            {r.found?.coverImage || ""}
                          </td>
                          <td className="p-2 whitespace-nowrap text-red-700">
                            {r.updateError || ""}
                          </td>
                        </tr>
                      ))}
                      {rows.length === 0 && (
                        <tr>
                          <td className="p-2 text-gray-500" colSpan={6}>
                            No items returned
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}

function CleanupStructuredPagesPanel() {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [remapFrom, setRemapFrom] = useState("/certification");
  const [remapTo, setRemapTo] = useState(
    "/scuba-certification-courses-florida-keys",
  );
  const [limit, setLimit] = useState(300);

  const run = async (reallyDelete: boolean) => {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const headers: any = { "Content-Type": "application/json" };
      try {
        const pk = localStorage.getItem("cms_private_key_override") || "";
        const pub = localStorage.getItem("cms_public_key_override") || "";
        if (pk) headers["x-builder-private-key"] = pk;
        if (pub) headers["x-builder-public-key"] = pub;
      } catch {}
      const payload: any = {
        dryRun: !reallyDelete,
        remap: { [remapFrom]: remapTo },
        limit,
      };
      const res = await fetch("/api/cms/cleanup-structured-pages", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      const json = text ? JSON.parse(text) : {};
      if (!json.ok)
        throw new Error(json.error || `Failed (HTTP ${res.status})`);
      setResult(json);
    } catch (e: any) {
      setError(e?.message || "Failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-start justify-between gap-6">
        <div className="max-w-2xl">
          <h2 className="text-lg font-semibold">Cleanup Structured Pages</h2>
          <p className="text-sm text-gray-600">
            Remove duplicates from Structured data model “pages” when a matching
            Builder Page exists (after slug remap).
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <label className="inline-flex items-center gap-2">
              <span>Remap</span>
              <input
                className="border rounded px-2 py-1 w-56"
                value={remapFrom}
                onChange={(e) => setRemapFrom(e.target.value)}
                placeholder="/from"
              />
              <span>→</span>
              <input
                className="border rounded px-2 py-1 w-[26rem]"
                value={remapTo}
                onChange={(e) => setRemapTo(e.target.value)}
                placeholder="/to"
              />
            </label>
            <label className="inline-flex items-center gap-2 ml-4">
              <span>Limit</span>
              <input
                type="number"
                min={1}
                max={1000}
                className="border rounded px-2 py-1 w-24"
                value={limit}
                onChange={(e) =>
                  setLimit(
                    Math.max(
                      1,
                      Math.min(1000, parseInt(e.target.value || "300", 10)),
                    ),
                  )
                }
              />
            </label>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => run(false)}
            disabled={busy}
            className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700 disabled:opacity-50"
            title="Preview items that would be deleted"
          >
            {busy ? "Working…" : "Preview Deletions"}
          </button>
          <button
            onClick={() => {
              if (
                confirm(
                  "Delete duplicates from Structured pages? This cannot be undone.",
                )
              )
                run(true);
            }}
            disabled={busy}
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
          >
            {busy ? "Deleting…" : "Delete Duplicates Now"}
          </button>
        </div>
      </div>
      {error && <div className="mt-3 text-sm text-red-700">{error}</div>}
      {result && (
        <div className="mt-4 text-sm">
          <div className="mb-2">
            Candidates: {result.candidates || 0} · Deletable:{" "}
            {result.deletable || 0} {result.dryRun ? "(dry run)" : ""}
          </div>
          <div className="max-h-64 overflow-auto border rounded">
            <table className="min-w-full text-xs">
              <thead className="bg-gray-50">
                <tr>
                  {["id", "slug", "remapped", "pageId", "deleted", "error"].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left p-2 border-b whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {(result.results || []).map((r: any, i: number) => (
                  <tr key={i} className="border-b">
                    <td className="p-2 whitespace-nowrap">{r.id}</td>
                    <td className="p-2 whitespace-nowrap">{r.slug}</td>
                    <td className="p-2 whitespace-nowrap">{r.remapped}</td>
                    <td className="p-2 whitespace-nowrap">{r.pageId || ""}</td>
                    <td className="p-2 whitespace-nowrap">
                      {r.deleted === undefined ? "" : String(!!r.deleted)}
                    </td>
                    <td className="p-2 whitespace-nowrap text-red-700">
                      {r.error || ""}
                    </td>
                  </tr>
                ))}
                {(!result.results || result.results.length === 0) && (
                  <tr>
                    <td className="p-2 text-gray-500" colSpan={6}>
                      No items
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function BookingsSyncPanel() {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [perPage, setPerPage] = useState(50);
  const [pages, setPages] = useState(50);

  const run = async () => {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const headers: any = { "Content-Type": "application/json" };
      try {
        const pk = localStorage.getItem("cms_private_key_override") || "";
        const pub = localStorage.getItem("cms_public_key_override") || "";
        if (pk) headers["x-builder-private-key"] = pk;
        if (pub) headers["x-builder-public-key"] = pub;
      } catch {}
      const res = await fetch("/api/cms/bookings/import", {
        method: "POST",
        headers,
        body: JSON.stringify({ perPage, pages }),
      });
      const text = await res.text();
      const json = text ? JSON.parse(text) : {};
      if (!json.ok)
        throw new Error(json.error || `Failed (HTTP ${res.status})`);
      setResult(json);
    } catch (e: any) {
      setError(e?.message || "Failed");
    } finally {
      setBusy(false);
    }
  };

  const webhookUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/cms/bookings/webhook`
      : "/api/cms/bookings/webhook";

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-start justify-between gap-6">
        <div className="max-w-2xl">
          <h2 className="text-lg font-semibold">Bookings Sync</h2>
          <p className="text-sm text-gray-600">
            Import historical WooCommerce bookings into Builder model “bookings”
            and set up a webhook for new bookings.
          </p>
          <div className="mt-3 flex items-center gap-3 text-sm">
            <label className="inline-flex items-center gap-2">
              <span>Per page</span>
              <input
                type="number"
                min={1}
                max={100}
                className="border rounded px-2 py-1 w-24"
                value={perPage}
                onChange={(e) =>
                  setPerPage(
                    Math.max(
                      1,
                      Math.min(100, parseInt(e.target.value || "50", 10)),
                    ),
                  )
                }
              />
            </label>
            <label className="inline-flex items-center gap-2">
              <span>Pages</span>
              <input
                type="number"
                min={1}
                max={1000}
                className="border rounded px-2 py-1 w-28"
                value={pages}
                onChange={(e) =>
                  setPages(
                    Math.max(
                      1,
                      Math.min(1000, parseInt(e.target.value || "50", 10)),
                    ),
                  )
                }
              />
            </label>
          </div>
          <div className="mt-2 text-xs text-gray-600">
            Webhook endpoint (configure in WooCommerce → Webhooks):{" "}
            <code className="bg-gray-100 px-1 py-0.5 rounded">
              {webhookUrl}
            </code>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <button
            onClick={run}
            disabled={busy}
            className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {busy ? "Importing…" : "Import Bookings"}
          </button>
        </div>
      </div>
      {error && <div className="mt-3 text-sm text-red-700">{error}</div>}
      {result && (
        <div className="mt-4 text-sm">
          <div className="mb-2">
            Imported: {result.count || 0} · created {result.created || 0} ·
            updated {result.updated || 0}
          </div>
          <div className="max-h-64 overflow-auto border rounded">
            <table className="min-w-full text-xs">
              <thead className="bg-gray-50">
                <tr>
                  {["booking_id", "action", "id", "error"].map((h) => (
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
                {(result.results || [])
                  .slice(0, 200)
                  .map((r: any, i: number) => (
                    <tr key={i} className="border-b">
                      <td className="p-2 whitespace-nowrap">{r.booking_id}</td>
                      <td className="p-2 whitespace-nowrap">{r.action}</td>
                      <td className="p-2 whitespace-nowrap">{r.id || ""}</td>
                      <td className="p-2 whitespace-nowrap text-red-700">
                        {r.error || ""}
                      </td>
                    </tr>
                  ))}
                {(!result.results || result.results.length === 0) && (
                  <tr>
                    <td className="p-2 text-gray-500" colSpan={4}>
                      No items
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function MigrationPanel() {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [names, setNames] = useState<string>(
    [
      "Home",
      "Contact",
      "Contact Us",
      "Certification",
      "Dive Sites",
      "Order Support",
      "Refund Policy",
      "Terms & Conditions",
    ].join(", "),
  );
  const [includeCertChildren, setIncludeCertChildren] = useState(true);
  const [publish, setPublish] = useState(true);

  const run = async (onlyHome?: boolean) => {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const migrateAll = false;
      const list = onlyHome
        ? ["Home"]
        : names
            .split(/[\,\n]/)
            .map((s) => s.trim())
            .filter(Boolean);
      const payload: any = {
        names: list,
        publish,
        remap: {
          "/certification": "/scuba-certification-courses-florida-keys",
        },
      };
      const res = await fetch("/api/cms/migrate-to-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      const json = text ? JSON.parse(text) : {};
      if (!json.ok)
        throw new Error(json.error || `Failed (HTTP ${res.status})`);
      setResult(json);
    } catch (e: any) {
      setError(e?.message || "Failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-start justify-between gap-6">
        <div className="max-w-2xl">
          <h2 className="text-lg font-semibold">Migrate to Page model</h2>
          <p className="text-sm text-gray-600">
            Creates/updates Builder Page entries (visual pages) for the selected
            items. Uses existing slugs for URL targeting.
          </p>
          <div className="mt-3 flex flex-col gap-2">
            <div className="text-sm">
              This will migrate ALL structured "pages" into Page model. A remap
              is applied from /certification →
              /scuba-certification-courses-florida-keys (and children).
            </div>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <label className="inline-flex items-center gap-2 text-sm mr-2">
            <input
              type="checkbox"
              checked={publish}
              onChange={(e) => setPublish(e.target.checked)}
            />
            <span>Publish after migrate</span>
          </label>
          <button
            onClick={() => run(true)}
            disabled={busy}
            className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
          >
            {busy ? "Migrating…" : "Migrate Home"}
          </button>
          <button
            onClick={() => run(false)}
            disabled={busy}
            className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {busy ? "Migrating…" : "Run Migration"}
          </button>
        </div>
      </div>
      {error && <div className="mt-3 text-sm text-red-700">{error}</div>}
      {result && (
        <div className="mt-4 text-sm">
          <div className="mb-2">Processed: {result.count || 0}</div>
          <div className="max-h-64 overflow-auto border rounded">
            <table className="min-w-full text-xs">
              <thead className="bg-gray-50">
                <tr>
                  {["slug", "action", "id", "error"].map((h) => (
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
                {(result.results || []).map((r: any, i: number) => (
                  <tr key={i} className="border-b">
                    <td className="p-2 whitespace-nowrap">{r.slug}</td>
                    <td className="p-2 whitespace-nowrap">{r.action}</td>
                    <td className="p-2 whitespace-nowrap">{r.id || ""}</td>
                    <td className="p-2 whitespace-nowrap text-red-700">
                      {r.error || ""}
                    </td>
                  </tr>
                ))}
                {(!result.results || result.results.length === 0) && (
                  <tr>
                    <td className="p-2 text-gray-500" colSpan={4}>
                      No items
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
