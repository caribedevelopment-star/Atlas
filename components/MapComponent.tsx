'use client';

import { useEffect, useRef, useState } from 'react';

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
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    // Cargar dinámicamente MapLibre únicamente en el navegador
    import('maplibre-gl').then((maplibregl) => {
      if (!active || !mapContainer.current || mapInstance.current) return;

      // Inyectar el CSS de forma segura
      const linkId = 'maplibre-style-cdn';
      if (!document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css';
        document.head.appendChild(link);
      }

      const map = new maplibregl.Map({
        container: mapContainer.current,
        style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
        center: [-3.70379, 40.416775],
        zoom: 5.5,
        pitch: 40,
      });

      map.addControl(new maplibregl.NavigationControl(), 'top-right');
      mapInstance.current = map;
      setIsLoaded(true);

      // Añadir marcadores
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

        new maplibregl.Marker({ element: el })
          .setLngLat([memory.longitude, memory.latitude])
          .setPopup(popup)
          .addTo(map);
      });
    });

    return () => {
      active = false;
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [memories]);

  return (
    <div className="w-full h-full relative bg-zinc-950">
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
