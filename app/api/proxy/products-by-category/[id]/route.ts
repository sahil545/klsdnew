import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("TIMEOUT")), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const id = params.id;
  const url = `https://keylargoscubadiving.com/wp-json/childthemes/v1/products-by-category/${encodeURIComponent(id)}`;
  try {
    const res = await withTimeout(
      fetch(url, {
        headers: { "User-Agent": "KLSD-Proxy/1.0" },
        cache: "no-store",
      }),
      10000,
    );
    const status = res.status;
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      return NextResponse.json(json, { status });
    } catch {
      return new NextResponse(text, {
        status,
        headers: {
          "Content-Type": res.headers.get("content-type") || "application/json",
        },
      });
    }
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Fetch failed" },
      { status: 502 },
    );
  }
}
