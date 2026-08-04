'use client';

import { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

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
    if (typeof window === 'undefined' || !mapContainer.current || map.current) return;

    try {
      // Usamos el servidor de estilos gratuito y libre OpenFreeMap Liberty Dark
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: 'https://tiles.openfreemap.org/styles/dark',
        center: [-3.70379, 40.416775], // Madrid
        zoom: 5.5,
        pitch: 45, // Inclinación 3D
        bearing: -17, // Ángulo dinámico
      });

      map.current.addControl(
        new maplibregl.NavigationControl({ showCompass: true }),
        'top-right'
      );

      map.current.on('load', () => {
        map.current?.resize();
      });
    } catch (e) {
      console.error('Error al inicializar el mapa:', e);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Actualización de marcadores neón
  useEffect(() => {
    if (!map.current) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    if (!memories || memories.length === 0) return;

    const bounds = new maplibregl.LngLatBounds();

    memories.forEach((memory) => {
      if (!memory.latitude || !memory.longitude) return;

      const el = document.createElement('div');
      el.style.width = '16px';
      el.style.height = '16px';
      el.style.backgroundColor = '#38bdf8'; // Azul Neón
      el.style.borderRadius = '50%';
      el.style.border = '2px solid #09090b';
      el.style.boxShadow = '0 0 15px #38bdf8, 0 0 30px #38bdf8';
      el.style.cursor = 'pointer';

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
        duration: 1200,
      });
    }
  }, [memories]);

  return (
    <div className="w-full h-full min-h-[500px] relative bg-zinc-950">
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
