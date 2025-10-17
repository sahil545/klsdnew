"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import type { DiveSiteData } from "./DiveSitesLeafletMap";

const DiveSitesLeafletMap = dynamic(() => import("./DiveSitesLeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="bg-gray-100 rounded-lg flex items-center justify-center h-96">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <div className="text-gray-500">Loading interactive map...</div>
      </div>
    </div>
  ),
});

interface Props {
  diveSites: DiveSiteData[];
  selectedSite?: number | null;
  onSiteSelect?: (siteId: number) => void;
  className?: string;
}

export default function DiveSitesLeafletMapWrapper(props: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${
        props.className || "h-96"
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <div className="text-gray-500">Loading interactive map...</div>
        </div>
      </div>
    );
  }
  return <DiveSitesLeafletMap {...props} />;
}
