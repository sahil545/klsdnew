"use client";

import React, { useEffect, useRef } from "react";
import L, { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

export interface DiveSiteData {
  id: number;
  name: string;
  location: string;
  depth: string;
  type: string;
  difficulty: string;
  description: string;
  image: string;
  highlights: string[];
  marineLife: string[];
  coordinates: [number, number];
}

interface DiveSitesMapProps {
  diveSites: DiveSiteData[];
  selectedSite?: number | null;
  onSiteSelect?: (siteId: number) => void;
  className?: string;
}

export default function DiveSitesLeafletMap({
  diveSites,
  selectedSite,
  onSiteSelect,
  className = "",
}: DiveSitesMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "/marker-icon-2x.png",
      iconUrl: "/marker-icon.png",
      shadowUrl: "/marker-shadow.png",
    });

    if (!leafletMapRef.current) {
      const map = L.map(mapRef.current, {
        center: [25.0865, -80.4526],
        zoom: 11,
        scrollWheelZoom: false,
      });

      const streets = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      });
      const satellite = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution:
            'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        }
      );
      satellite.addTo(map);
      L.control.layers({ Satellite: satellite, Streets: streets }, undefined, { position: "topright" }).addTo(map);

      leafletMapRef.current = map;
    }

    const map = leafletMapRef.current!;

    const markerLayer = L.layerGroup().addTo(map);

    const createDiveIcon = (type: string) => {
      const color =
        type === "Wreck" ? "#dc2626" : type === "Reef" ? "#059669" : "#0ea5e9";

      return L.divIcon({
        html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center;"><div style="color:white; font-weight:bold; font-size:12px;">${
          type === "Wreck" ? "W" : type === "Reef" ? "R" : "D"
        }</div></div>`,
        className: "dive-site-marker",
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12],
      });
    };

    const latlngs: LatLngExpression[] = [];

    for (const site of diveSites) {
      const marker = L.marker(site.coordinates as LatLngExpression, {
        icon: createDiveIcon(site.type),
      });

      marker.on("click", () => onSiteSelect?.(site.id));

      const popupContent = document.createElement("div");
      popupContent.style.minWidth = "250px";
      popupContent.innerHTML = `
        <div style="padding:8px;font-family:inherit;">
          <h3 style="font-weight:700;color:#0b74a6;margin:0 0 6px 0">${site.name}</h3>
          <p style="margin:0 0 6px 0;color:#4b5563">${site.location}</p>
          <div style="font-size:13px;color:#374151;margin-bottom:6px"><strong>Depth:</strong> ${site.depth} &nbsp; <strong>Type:</strong> ${site.type}</div>
          <p style="margin:0;color:#374151">${site.description}</p>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.addTo(markerLayer);
      latlngs.push(site.coordinates as LatLngExpression);

      if (selectedSite === site.id) {
        marker.openPopup();
        map.setView(site.coordinates as LatLngExpression, 12, { animate: true });
      }
    }

    if (latlngs.length > 0) {
      try {
        const bounds = L.latLngBounds(latlngs);
        map.fitBounds(bounds, { padding: [20, 20] });
      } catch {}
    }

    return () => {
      markerLayer.clearLayers();
    };
  }, [diveSites, onSiteSelect, selectedSite]);

  return (
    <div className={`relative ${className}`}>
      <div ref={mapRef} className="w-full h-full" style={{ minHeight: 384 }} />

      <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-lg z-10">
        <h4 className="font-semibold text-sm mb-2">Dive Site Types</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-600 rounded-full border-2 border-white"></div>
            <span>Wreck Diving</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-600 rounded-full border-2 border-white"></div>
            <span>Reef Diving</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
            <span>Other Sites</span>
          </div>
        </div>
      </div>
    </div>
  );
}
