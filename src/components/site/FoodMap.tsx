import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { Donation, Ngo } from "@/lib/foodbridge/types";

/**
 * OpenStreetMap (Leaflet) map with distinct markers for donors, NGOs,
 * food banks and the user's own location. Leaflet is imported dynamically so
 * it never runs during server-side rendering.
 */
export interface MapMarkerClick {
  kind: "donation" | "ngo";
  id: string;
}

interface FoodMapProps {
  donations: Donation[];
  ngos: Ngo[];
  center: { lat: number; lng: number };
  focus?: { lat: number; lng: number } | null;
  onSelect: (m: MapMarkerClick) => void;
}

const ICON_HTML = (bg: string, glyph: string) =>
  `<div style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:999px;background:${bg};color:#fff;font-size:14px;font-weight:700;box-shadow:0 4px 10px rgba(0,0,0,.25);border:2px solid #fff">${glyph}</div>`;

export function FoodMap({ donations, ngos, center, focus, onSelect }: FoodMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const layerRef = useRef<any>(null);

  // Initialise the map once, after hydration.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, { scrollWheelZoom: false }).setView(
        [center.lat, center.lng],
        12,
      );
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);
      mapRef.current = map;
      layerRef.current = L.layerGroup().addTo(map);
      renderMarkers(L);
    })();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-render markers whenever the data changes.
  useEffect(() => {
    (async () => {
      if (!mapRef.current) return;
      const L = (await import("leaflet")).default;
      renderMarkers(L);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [donations, ngos, center]);

  // Pan to a requested location (e.g. "Find nearest NGO").
  useEffect(() => {
    if (focus && mapRef.current) mapRef.current.setView([focus.lat, focus.lng], 14);
  }, [focus]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function renderMarkers(L: any) {
    const layer = layerRef.current;
    if (!layer) return;
    layer.clearLayers();

    L.marker([center.lat, center.lng], {
      icon: L.divIcon({ html: ICON_HTML("#1d4ed8", "•"), className: "", iconSize: [30, 30] }),
    })
      .bindPopup("<strong>Your location</strong>")
      .addTo(layer);

    donations
      .filter((d) => !["cancelled", "completed"].includes(d.status))
      .forEach((d) => {
        L.marker([d.lat, d.lng], {
          icon: L.divIcon({
            html: ICON_HTML(d.status === "available" ? "#16a34a" : "#ca8a04", "F"),
            className: "",
            iconSize: [30, 30],
          }),
        })
          .bindPopup(
            `<strong>${d.organization}</strong><br/>${d.foodType}<br/>${d.servings} meals · ${d.status}<br/>${d.address}<br/>${d.phone}`,
          )
          .on("click", () => onSelect({ kind: "donation", id: d.donationId }))
          .addTo(layer);
      });

    ngos.forEach((n) => {
      L.marker([n.lat, n.lng], {
        icon: L.divIcon({
          html: ICON_HTML(n.type === "Food Bank" ? "#7c3aed" : "#0f766e", "N"),
          className: "",
          iconSize: [30, 30],
        }),
      })
        .bindPopup(
          `<strong>${n.name}</strong><br/>${n.type}${n.verified ? " · Verified" : ""}<br/>Needs ~${n.capacity} meals<br/>${n.location}<br/>${n.phone}`,
        )
        .on("click", () => onSelect({ kind: "ngo", id: n.id }))
        .addTo(layer);
    });
  }

  return <div ref={containerRef} className="h-[28rem] w-full rounded-2xl border md:h-[34rem]" />;
}
