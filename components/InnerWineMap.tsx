'use client';

import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

export interface WineRegion {
  id: string;
  name: string;
  country: string;
  type: string;
  color: string;
  coordinates: [number, number][];
  center: [number, number];
  zoom: number;
}

export interface InnerMapProps {
  regions: WineRegion[];
  showRegions: boolean;
  showMemories: boolean;
  selectedRegion: WineRegion | null;
  onSelectRegion: (region: WineRegion) => void;
  memories: any[];
  flyTarget: { center: [number, number]; zoom: number } | null;
}

function MapFlyControl({ flyTarget }: { flyTarget: { center: [number, number]; zoom: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (flyTarget) {
      map.flyTo(flyTarget.center, flyTarget.zoom, { animate: true, duration: 1.2 });
    }
  }, [flyTarget, map]);
  return null;
}

export default function InnerWineMap({
  regions,
  showRegions,
  showMemories,
  selectedRegion,
  onSelectRegion,
  memories,
  flyTarget,
}: InnerMapProps) {
  const initialCenter: [number, number] = [46.0, 2.0];

  // Instanciación segura del icono dentro del componente
  const winePinIcon = useMemo(() => {
    return L.divIcon({
      className: 'wine-pin-custom',
      html: `
        <div style="
          width: 30px;
          height: 30px;
          background-color: #f59e0b;
          border: 2px solid #0c0a09;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5);
          cursor: pointer;
        ">
          🍷
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
  }, []);

  return (
    <MapContainer
      center={initialCenter}
      zoom={6}
      zoomControl={false}
      className="w-full h-full bg-stone-950"
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      <MapFlyControl flyTarget={flyTarget} />

      {/* CAPA DE REGIONES DE VINO */}
      {showRegions &&
        regions.map((region) => {
          const isSelected = selectedRegion?.id === region.id;
          return (
            <Polygon
              key={region.id}
              positions={region.coordinates}
              pathOptions={{
                color: region.color,
                fillColor: region.color,
                fillOpacity: isSelected ? 0.5 : 0.25,
                weight: isSelected ? 2.5 : 1,
                dashArray: isSelected ? '' : '4, 4',
              }}
              eventHandlers={{
                click: () => onSelectRegion(region),
              }}
            >
              <Popup className="custom-dark-popup">
                <div className="p-1 text-stone-900 max-w-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                    {region.country}
                  </span>
                  <h4 className="font-bold text-sm">{region.name}</h4>
                  <p className="text-xs text-stone-600 mt-0.5">{region.type}</p>
                </div>
              </Popup>
            </Polygon>
          );
        })}

      {/* CAPA DE MEMORIAS / CATAS */}
      {showMemories &&
        memories.map((mem) => (
          <Marker key={mem.id} position={[mem.latitude, mem.longitude]} icon={winePinIcon}>
            <Popup className="custom-dark-popup">
              <div className="p-1 text-stone-900">
                <h4 className="font-bold text-xs">{mem.title}</h4>
                <p className="text-[11px] text-stone-600 mt-1">{mem.description}</p>
                <span className="text-[9px] text-amber-700 font-semibold block mt-1">
                  Por: {mem.author_name || 'Catador'}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}
