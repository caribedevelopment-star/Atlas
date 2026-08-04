// components/MapComponent.tsx
'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Eye, Wine, ChevronRight, Layers, PanelLeftClose, PanelLeft, Navigation } from 'lucide-react';
import type { MapInnerProps } from './MapInner';

const MapInner = dynamic<MapInnerProps>(() => import('./MapInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-zinc-950 flex items-center justify-center text-zinc-500 font-mono text-xs">
      Cargando visor cartográfico...
    </div>
  ),
});

const WINE_REGIONS = [
  { id: 'rioja', name: 'D.O.Ca. Rioja', country: 'España', type: 'Tinto / Blanco' },
  { id: 'ribera', name: 'D.O. Ribera del Duero', country: 'España', type: 'Tinto' },
];

export default function MapComponent() {
  const [showRegions, setShowRegions] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="w-full h-full relative overflow-hidden bg-zinc-950">
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="absolute top-4 left-4 z-[500] p-2.5 rounded-2xl bg-zinc-900/90 border border-zinc-700/60 text-zinc-200 hover:text-white shadow-2xl backdrop-blur-xl transition-all"
      >
        {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
      </button>

      <aside
        className={`absolute top-4 left-4 bottom-4 w-80 z-[400] bg-zinc-950/85 backdrop-blur-2xl border border-zinc-800/80 rounded-3xl shadow-2xl flex flex-col transition-all duration-300 ${
          isSidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-[calc(100%+2rem)] opacity-0 pointer-events-none'
        }`}
      >
        <div className="p-5 pt-14 space-y-5 overflow-y-auto flex-1 scrollbar-none">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Wine className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold text-white tracking-wide">Atlas Interactivo</h2>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Capas Visibles
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowRegions(!showRegions)}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                  showRegions
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
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
            {WINE_REGIONS.map((region) => (
              <div
                key={region.id}
                className="p-3 rounded-2xl bg-zinc-900/50 border border-zinc-800/60 hover:border-amber-500/40 transition cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition">
                    {region.name}
                  </h4>
                  <p className="text-[11px] text-zinc-400">{region.country} • {region.type}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-amber-400 transition" />
              </div>
            ))}
          </div>
        </div>
      </aside>

      <div className="w-full h-full">
        <MapInner showRegions={showRegions} showRoutes={showRoutes} />
      </div>
    </div>
  );
}
