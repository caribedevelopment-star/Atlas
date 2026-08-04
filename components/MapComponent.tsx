'use client';

import { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css'; // Asegura la carga de estilos de MapLibre

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
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [-3.70379, 40.416775],
      zoom: 5.5,
      pitch: 40,
    });

    map.current.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      'top-right'
    );

    // Forzar al mapa a recalcular su tamaño apenas se renderiza
    map.current.on('load', () => {
      map.current?.resize();
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    if (memories.length === 0) return;

    const bounds = new maplibregl.LngLatBounds();

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
      el.style.transition = 'transform 0.2s ease';

      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.3)';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
      });

      const popup = new maplibregl.Popup({ offset: 25, closeButton: false }).setHTML(`
        <div style="color: #09090b; font-family: sans-serif; padding: 4px;">
          <h4 style="margin: 0; font-size: 13px; font-weight: bold;">${memory.title}</h4>
          ${
            memory.description
              ? `<p style="margin: 4px 0 0 0; font-size: 11px; color: #52525b;">${memory.description}</p>`
              : ''
          }
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([memory.longitude, memory.latitude])
        .setPopup(popup)
        .addTo(map.current!);

      markersRef.current.push(marker);
      bounds.extend([memory.longitude, memory.latitude]);
    });

    if (memories.length > 0) {
      map.current.fitBounds(bounds, {
        padding: 80,
        maxZoom: 14,
        duration: 1000,
      });
    }
  }, [memories]);

  // Se asigna altura fija/relativa directa al div contenedor
  return <div ref={mapContainer} className="w-full h-full min-h-[500px]" />;
}
