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

    let isMounted = true;

    // Cargar stylesheet de MapLibre dinámicamente en el DOM para asegurar los estilos
    if (!document.getElementById('maplibre-css')) {
      const link = document.createElement('link');
      link.id = 'maplibre-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css';
      document.head.appendChild(link);
    }

    import('maplibre-gl').then((maplibregl) => {
      if (!isMounted || !mapContainer.current || mapInstance.current) return;

      const map = new maplibregl.Map({
        container: mapContainer.current,
        // Estilo oscuro libre y directo de CartoDB (sin necesidad de API keys)
        style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
        center: [-3.70379, 40.416775], // Madrid
        zoom: 5,
        pitch: 30,
      });

      map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');

      // Forzar recálculo del lienzo cuando el estilo termina de cargar
      map.on('load', () => {
        map.resize();
      });

      mapInstance.current = map;
    }).catch(err => console.error("Error iniciando MapLibre:", err));

    return () => {
      isMounted = false;
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Renderizado de los pines en el mapa
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !memories || memories.length === 0) return;

    import('maplibre-gl').then((maplibregl) => {
      memories.forEach((mem) => {
        if (!mem.latitude || !mem.longitude) return;

        const el = document.createElement('div');
        el.className = 'w-3.5 h-3.5 rounded-full bg-sky-400 border-2 border-zinc-950 shadow-[0_0_10px_#38bdf8] cursor-pointer';

        new maplibregl.Marker({ element: el })
          .setLngLat([mem.longitude, mem.latitude])
          .setPopup(
            new maplibregl.Popup({ offset: 25 }).setHTML(
              `<div style="color:#000; font-weight:bold; font-size:12px;">${mem.title}</div>`
            )
          )
          .addTo(map);
      });
    });
  }, [memories]);

  return (
    <div className="w-full h-[calc(100vh-4rem)] relative bg-zinc-950 overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0 w-full h-full z-10" />
    </div>
  );
}
