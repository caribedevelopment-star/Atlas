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
    if (typeof window === 'undefined' || map.current || !mapContainer.current) return;

    try {
      // Usamos el estilo vectorial oficial y público de MapLibre (o Demotiles)
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: 'https://demotiles.maplibre.org/style.json',
        center: [-3.70379, 40.416775],
        zoom: 5.5,
        pitch: 0,
      });

      map.current.addControl(
        new maplibregl.NavigationControl({ showCompass: false }),
        'top-right'
      );

      map.current.on('load', () => {
        map.current?.resize();
      });

      // Capturamos cualquier error de renderizado para evitar la pantalla negra de error
      map.current.on('error', (e) => {
        console.warn('MapLibre intentó cargar una capa no disponible:', e);
      });

    } catch (err) {
      console.error('Error al inicializar el mapa:', err);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;

    // Limpiar marcadores
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    if (!memories || memories.length === 0) return;

    const bounds = new maplibregl.LngLatBounds();

    memories.forEach((memory) => {
      if (!memory.latitude || !memory.longitude) return;

      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.width = '14px';
      el.style.height = '14px';
      el.style.backgroundColor = '#ffffff';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid #09090b';
      el.style.boxShadow = '0 0 10px rgba(255,255,255,0.5)';
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
        duration: 1000,
      });
    }
  }, [memories]);

  return (
    <div className="w-full h-full min-h-[500px] relative">
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
