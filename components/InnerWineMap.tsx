// components/MapInner.tsx
'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix para iconos por defecto de Leaflet en Next.js
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Forzar recalculo de dimensiones del mapa al cargar
function MapResizeHandler() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [map]);
  return null;
}

const REGIONS = {
  rioja: [
    [42.55, -2.85],
    [42.60, -2.40],
    [42.30, -2.10],
    [42.15, -2.50],
  ] as [number, number][],
  ribera: [
    [41.75, -4.10],
    [41.80, -3.30],
    [41.60, -3.30],
    [41.55, -4.10],
  ] as [number, number][],
};

const ROUTE_MEMORIES = [
  [42.465, -2.445], // Logroño
  [42.518, -2.585], // Haro
  [42.562, -2.618], // Laguardia
] as [number, number][];

interface MapInnerProps {
  showRegions: boolean;
  showRoutes: boolean;
}

export default function MapInner({ showRegions, showRoutes }: MapInnerProps) {
  return (
    <MapContainer
      center={[42.0, -3.5]}
      zoom={7}
      zoomControl={false}
      style={{ width: '100%', height: '100%', background: '#09090b' }}
    >
      <MapResizeHandler />

      {/* CartoDB Dark Matter retina tiles */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; CARTO'
        maxZoom={19}
      />

      {/* Polígonos D.O. */}
      {showRegions &&
        Object.entries(REGIONS).map(([key, coords]) => (
          <Polygon
            key={key}
            positions={coords}
            pathOptions={{
              color: '#f59e0b',
              fillColor: '#d97706',
              fillOpacity: 0.25,
              weight: 2,
              dashArray: '4, 4',
            }}
          />
        ))}

      {/* Rutas de Viajes */}
      {showRoutes && (
        <>
          <Polyline
            positions={ROUTE_MEMORIES}
            pathOptions={{ color: '#fbbf24', weight: 3, opacity: 0.8 }}
          />
          {ROUTE_MEMORIES.map((pt, i) => (
            <Marker key={i} position={pt} icon={customIcon}>
              <Popup>Memoria {i + 1} de la Ruta</Popup>
            </Marker>
          ))}
        </>
      )}
    </MapContainer>
  );
}
