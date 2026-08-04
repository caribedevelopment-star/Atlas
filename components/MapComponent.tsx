'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface Memory {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  description?: string;
}

interface MapProps {
  memories?: Memory[];
}

export default function MapComponent({ memories = [] }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    // Mapa vectorial oscuro profesional 100% gratuito (sin tokens ni tarjeta)
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [-3.70379, 40.416775], // Madrid
      zoom: 5.5,
      pitch: 40, // Inclinación 3D
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    return () => {
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;

    memories.forEach((memory) => {
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.width = '14px';
      el.style.height = '14px';
      el.style.backgroundColor = '#ffffff';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid #09090b';
      el.style.boxShadow = '0 0 10px rgba(255,255,255,0.5)';
      el.style.cursor = 'pointer';

      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
        <div style="color: #09090b; font-family: sans-serif; padding: 4px;">
          <h4 style="margin: 0; font-size: 13px; font-weight: bold;">${memory.title}</h4>
          ${memory.description ? `<p style="margin: 4px 0 0 0; font-size: 11px; color: #52525b;">${memory.description}</p>` : ''}
        </div>
      `);

      new maplibregl.Marker(el)
        .setLngLat([memory.longitude, memory.latitude])
        .setPopup(popup)
        .addTo(map.current!);
    });
  }, [memories]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
