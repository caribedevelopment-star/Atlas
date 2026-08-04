// components/MapComponent.tsx
'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Eye, Wine, ChevronRight, Layers, PanelLeftClose, PanelLeft, Navigation } from 'lucide-react';
import L from 'leaflet';

const MapContainer = dynamic(() => import('react-leaflet').then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((m) => m.TileLayer), { ssr: false });
const Polygon = dynamic(() => import('react-leaflet').then((m) => m.Polygon), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then((m) => m.Polyline), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((m) => m.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((m) => m.Popup), { ssr: false });

const customIcon = typeof window !== 'undefined'
  ? new L.Icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    })
  : null;

// Polígonos suavizados con estética vinícola (Borgoña/Ámbar)
const REGIONS = [
  {
    id: 'rioja',
    name: 'D.O.Ca. Rioja',
    color: '#881337', // Rose/Wine tint
    fillColor: '#e11d48',
    coords: [
      [42.55, -2.85],
      [42.60, -2.40],
      [42.30, -2.10],
      [42.15, -2.50],
    ] as [number, number][],
  },
  {
    id: 'ribera',
    name: 'D.O. Ribera del Duero',
    color: '#b45309', // Amber/Gold tint
    fillColor: '#f59e0b',
    coords: [
      [41.75, -4.10],
      [41.80, -3.30],
      [41.60, -3.30],
      [41.55, -4.10],
    ] as [number, number][],
  },
];

const ROUTE_MEMORIES = [
  [42.465, -2.445],
  [42.518, -2.585],
  [42.562, -2.618],
] as [number, number][];

export default function MapComponent() {
  const [showRegions, setShowRegions] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [isOpen, setIsOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="w-full h-full relative overflow-hidden bg-zinc-950">
      {/* Botón flotante siempre libre e interactivo */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="absolute top-4 left-4 z-[999] p-3 rounded-xl bg-zinc-900/90 border border-zinc-700/80 text-zinc-100 hover:text-white hover:bg-zinc-800 shadow-2xl backdrop-blur-md transition-all cursor-pointer"
        aria-label="Toggle Panel"
      >
        {isOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
      </button>

      {/* Desplegable animado de forma independiente */}
      <aside
        className={`absolute top-4 left-4 bottom-4 w-80 z-[900] bg-zinc-950/90 backdrop-blur-2xl border border-zinc-800/80 rounded-2xl shadow-2xl flex flex-col transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0 opacity-100 pointer-events-auto' : '-translate-x-[calc(100%+2rem)] opacity-0 pointer-events-none'
        }`}
      >
        <div className="p-5 pt-14 space-y-5 overflow-y-auto flex-1 scrollbar-none">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Wine className="w-4 h-4 text-rose-500" />
              <h2 className="text-sm font-bold text-white tracking-wide">Atlas Interactivo</h2>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Capas Visibles
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setShowRegions(!showRegions)}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                  showRegions
                    ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-500'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Regiones</span>
                </div>
                <Eye className="w-3.5 h-3.5 opacity-70" />
              </button>

              <button
                type="button"
                onClick={() => setShowRoutes(!showRoutes)}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                  showRoutes
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-500'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Rutas</span>
                </div>
                <Eye className="w-3.5 h-3.5 opacity-70" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {REGIONS.map((region) => (
              <div
                key={region.id}
                className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/60 hover:border-rose-500/40 transition cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-rose-300 transition">
                    {region.name}
                  </h4>
                  <p className="text-[11px] text-zinc-400">España • Región Denominada</p>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-rose-400 transition" />
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Visor Cartográfico */}
      <div className="w-full h-full">
        {mounted ? (
          <MapContainer
            center={[42.0, -3.5]}
            zoom={7}
            zoomControl={false}
            style={{ width: '100%', height: '100%', background: '#09090b' }}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; CARTO'
              maxZoom={19}
            />

            {showRegions &&
              REGIONS.map((region) => (
                <Polygon
                  key={region.id}
                  positions={region.coords}
                  pathOptions={{
                    color: region.color,
                    fillColor: region.fillColor,
                    fillOpacity: 0.18,
                    weight: 1.5,
                  }}
                />
              ))}

            {showRoutes && (
              <>
                <Polyline
                  positions={ROUTE_MEMORIES}
                  pathOptions={{ color: '#f59e0b', weight: 2.5, opacity: 0.8 }}
                />
                {ROUTE_MEMORIES.map((pt, i) => (
                  <Marker key={i} position={pt} icon={customIcon || undefined}>
                    <Popup>Memoria {i + 1}</Popup>
                  </Marker>
                ))}
              </>
            )}
          </MapContainer>
        ) : (
          <div className="w-full h-full bg-zinc-950 flex items-center justify-center text-zinc-500 font-mono text-xs">
            Cargando visor cartográfico...
          </div>
        )}
      </div>
    </div>
  );
}
