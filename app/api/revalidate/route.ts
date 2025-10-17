import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const expectedToken = process.env.ADMIN_API_TOKEN?.trim();
  const header = req.headers.get("authorization") ?? "";
  const providedToken = header.startsWith("Bearer ")
    ? header.slice(7).trim()
    : header.trim();

  if (!expectedToken || providedToken !== expectedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const path = typeof body?.path === "string" ? body.path : null;

  if (!path || !path.startsWith("/")) {
    return NextResponse.json(
      { error: "path must start with '/'" },
      { status: 400 },
    );
  }

  revalidatePath(path);

  return NextResponse.json({ revalidated: true, path });
}
