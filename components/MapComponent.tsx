'use client';

import { useEffect, useRef } from 'react';

export interface Memory {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  description?: string;
}

export interface MapComponentProps {
  memories?: Memory[];
}

export default function MapComponent({ memories = [] }: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainer.current || mapInstance.current) return;

    Promise.all([
      import('maplibre-gl'),
      import('maplibre-gl/dist/maplibre-gl.css')
    ]).then(([maplibregl]) => {
      if (!mapContainer.current || mapInstance.current) return;

      const map = new maplibregl.Map({
        container: mapContainer.current,
        style: 'https://tiles.openfreemap.org/styles/dark',
        center: [-3.70379, 40.416775],
        zoom: 5.5,
        pitch: 45,
        bearing: -17,
      });

      map.addControl(
        new maplibregl.NavigationControl({ showCompass: true }),
        'top-right'
      );

      mapInstance.current = map;
    }).catch(err => console.error("Error al cargar MapLibre:", err));

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full h-full min-h-[500px] relative bg-zinc-950">
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
