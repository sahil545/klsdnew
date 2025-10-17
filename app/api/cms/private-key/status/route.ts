import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  try {
    const key =
      process.env.BUILDER_PRIVATE_API_KEY || process.env.BUILDER_WRITE_API_KEY;
    const present = !!key;
    const masked = key ? `${key.slice(0, 6)}...${key.slice(-4)}` : undefined;
    return NextResponse.json({ ok: true, present, masked }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed" },
      { status: 200 },
    );
  }
}
