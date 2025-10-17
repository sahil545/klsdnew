export async function GET() {
  try {
    const { getWpImageUrlByFilename } = await import("../../client/lib/wp-media");
    const fallback =
      "https://keylargoscubadiving.com/wp-content/uploads/2023/08/try-scuba-diving-key-largo.jpg";
    const wpUrl = (await getWpImageUrlByFilename("try-scuba-diving-key-largo.jpg")) || fallback;

    const upstream = await fetch(wpUrl, {
      // Let CDN/browser cache; Next/Image will also optimize this
      next: { revalidate: 60 * 60 * 24 },
    });

    if (!upstream.ok || !upstream.body) {
      return Response.redirect(fallback, 302);
    }

    const headers = new Headers();
    headers.set("Content-Type", upstream.headers.get("content-type") || "image/jpeg");
    headers.set(
      "Cache-Control",
      "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
    );

    return new Response(upstream.body, {
      status: 200,
      headers,
    });
  } catch {
    return Response.redirect(
      "https://keylargoscubadiving.com/wp-content/uploads/2023/08/try-scuba-diving-key-largo.jpg",
      302,
    );
  }
}
