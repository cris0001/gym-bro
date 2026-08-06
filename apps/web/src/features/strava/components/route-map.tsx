import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useMemo, useRef } from 'react';

import { cn } from '@/lib/utils';

import { decodePolyline } from '../utils/polyline';

// The activity's GPS track on a real slippy map (Leaflet + OpenStreetMap tiles). The
// polyline is decoded to lat/lng, drawn as a line with start/end dots, and the map is
// fit to its bounds. Renders nothing for activities without a usable track (indoor).
// Tiles load from OSM at runtime (network) — unlike the rest of the app.
export function RouteMap({ polyline, className }: { polyline: string; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const points = useMemo(() => decodePolyline(polyline), [polyline]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || points.length < 2) return;

    const map = L.map(el, { scrollWheelZoom: false, attributionControl: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);

    const line = L.polyline(points, { color: '#ea580c', weight: 4 }).addTo(map);
    map.fitBounds(line.getBounds(), { padding: [16, 16] });
    const start = points[0];
    const end = points[points.length - 1];
    if (start) L.circleMarker(start, { radius: 6, color: '#16a34a', fillOpacity: 1 }).addTo(map);
    if (end) L.circleMarker(end, { radius: 6, color: '#dc2626', fillOpacity: 1 }).addTo(map);

    // The container mounts with the expand; nudge Leaflet to recompute size once laid out.
    const raf = requestAnimationFrame(() => map.invalidateSize());
    return () => {
      cancelAnimationFrame(raf);
      map.remove();
    };
  }, [points]);

  if (points.length < 2) return null;
  return (
    <div
      ref={containerRef}
      className={cn('z-0 w-full overflow-hidden rounded-lg', className ?? 'h-48')}
    />
  );
}
