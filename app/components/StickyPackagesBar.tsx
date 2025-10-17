"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function StickyPackagesBar({
  target = "#packages",
}: {
  target?: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY || 0;
      setVisible(scrolled > 500);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50">
      <div className="mx-auto max-w-screen-2xl px-4 pb-4">
        <div className="rounded-xl border bg-white/95 backdrop-blur shadow-xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3">
            <div className="text-sm text-gray-700 font-medium">
              Ready? Choose your Try Scuba package
            </div>
            <Link href={target} scroll>
              <Button className="bg-coral hover:bg-coral/90 text-white">
                Choose your package
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
