'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { WineRegion } from './MapComponent';

const winePinIcon = L.divIcon({
  className: 'wine-pin-custom',
  html: `
    <div className="relative flex items-center justify-center w-8 h-8">
      <div className="w-8 h-8 bg-white/90 backdrop-blur-md border border-stone-300 rounded-full shadow-lg flex items-center justify-center text-stone-900 font-bold text-xs hover:scale-110 transition-transform">
        🍷
      </div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

function MapFlyControl({ flyTarget }: { flyTarget: { center: [number, number]; zoom: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (flyTarget) {
      map.flyTo(flyTarget.center, flyTarget.zoom, { animate: true, duration: 1.4 });
    }
  }, [flyTarget, map]);
  return null;
}

export interface InnerMapProps {
  regions: WineRegion[];
  showRegions: boolean;
  selectedRegion: WineRegion | null;
  onSelectRegion: (region: WineRegion) => void;
  memories: any[];
  flyTarget: { center: [number, number]; zoom: number } | null;
}

export default function InnerWineMap({
  regions,
  showRegions,
  selectedRegion,
  onSelectRegion,
  memories,
  flyTarget,
}: InnerMapProps) {
  const initialCenter: [number, number] = [46.0, 2.0];

  return (
    <MapContainer
      center={initialCenter}
      zoom={6}
      zoomControl={false}
      className="w-full h-full bg-stone-100"
    >
      <TileLayer
        attribution='&copy; CARTO'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
      />

      <MapFlyControl flyTarget={flyTarget} />

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
                fillOpacity: isSelected ? 0.45 : 0.22,
                weight: isSelected ? 2.5 : 1.2,
                dashArray: isSelected ? '' : '3, 6',
              }}
              eventHandlers={{
                click: () => onSelectRegion(region),
              }}
            >
              <Popup className="custom-wine-popup">
                <div className="p-1.5 text-stone-900 max-w-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-0.5">
                    {region.country}
                  </span>
                  <h4 className="font-bold text-sm text-stone-900">{region.name}</h4>
                  <p className="text-xs text-stone-600 mt-0.5 font-medium">{region.type}</p>
                </div>
              </Popup>
            </Polygon>
          );
        })}

      {memories.map((mem) => (
        <Marker key={mem.id} position={[mem.latitude, mem.longitude]} icon={winePinIcon}>
          <Popup>
            <div className="p-1 text-stone-900">
              <h4 className="font-bold text-xs">{mem.title}</h4>
              <p className="text-[11px] text-stone-600 mt-1">{mem.description}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
