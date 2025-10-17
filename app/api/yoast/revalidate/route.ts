import { NextRequest, NextResponse } from "next/server";
import { clearCache, makeKey } from "../cache";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-webhook-secret") || "";
  const expected = process.env.YOAST_WEBHOOK_SECRET || "";
  if (!expected || secret !== expected) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(req.url);
  const clearAll = (searchParams.get("all") || "").toLowerCase() === "true";

  let cleared = false;
  if (clearAll) {
    clearCache();
    cleared = true;
  } else {
    const key = makeKey(searchParams);
    cleared = clearCache(key);
  }

  return NextResponse.json({ ok: true, cleared });
}
