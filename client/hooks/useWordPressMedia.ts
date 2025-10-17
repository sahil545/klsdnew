"use client";
import { useEffect, useState } from "react";
import { getWpMediaByFilename, type WPResolvedMedia } from "@/lib/wp-media";

export function useWordPressMedia(
  filename: string | null | undefined,
  fallback?: WPResolvedMedia,
) {
  const [media, setMedia] = useState<WPResolvedMedia | undefined>(fallback);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      const name = (filename || "").trim();
      if (!name) {
        setMedia(fallback);
        return;
      }
      try {
        const resolved = await getWpMediaByFilename(name);
        if (!cancelled) setMedia(resolved || fallback);
      } catch {
        if (!cancelled) setMedia(fallback);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [filename, fallback?.url]);

  return media;
}

export default useWordPressMedia;
