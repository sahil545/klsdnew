import { createClient } from "@supabase/supabase-js";

export function supabaseAdmin() {
  const url = process.env.SUPABASE_URL as string | undefined;
  const key = process.env.SUPABASE_SERVICE_ROLE as string | undefined;
  if (!url || !key) {
    throw new Error("Missing SUPABASE envs");
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

export function requireAdminAuth(req: Request) {
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token || token !== process.env.ADMIN_API_TOKEN) {
    return new Response("Unauthorized", { status: 401 });
  }
  return null;
}

export function nowIso() {
  return new Date().toISOString();
}
