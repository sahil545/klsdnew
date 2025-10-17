"use client";
import { useEffect, useState } from "react";
import { getWpImageUrlByFilename } from "@/lib/wp-media";

export function useWordPressImage(
  filename: string | null | undefined,
  fallbackUrl?: string,
) {
  const [url, setUrl] = useState<string | undefined>(fallbackUrl);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      const name = (filename || "").trim();
      if (!name) {
        setUrl(fallbackUrl);
        return;
      }
      try {
        const resolved = await getWpImageUrlByFilename(name);
        if (!cancelled) setUrl(resolved || fallbackUrl);
      } catch {
        if (!cancelled) setUrl(fallbackUrl);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [filename, fallbackUrl]);

  return url;
}

export default useWordPressImage;
