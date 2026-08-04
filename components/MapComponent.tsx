// components/MapComponent.tsx
'use client';

import React, { useState } from 'react';
import { Eye, Wine, MapPin, Search, ChevronRight, Layers, PanelLeftClose, PanelLeft } from 'lucide-react';

interface WineRegion {
  id: string;
  name: string;
  country: string;
  type: string;
  colorDot: string;
}

const WINE_REGIONS: WineRegion[] = [
  { id: 'rioja', name: 'D.O.Ca. Rioja', country: 'España', type: 'Tinto / Blanco', colorDot: 'bg-amber-500' },
  { id: 'ribera', name: 'D.O. Ribera del Duero', country: 'España', type: 'Tinto', colorDot: 'bg-amber-500' },
  { id: 'bordeaux', name: 'AOC Bordeaux', country: 'Francia', type: 'Tinto / Blanco', colorDot: 'bg-amber-500' },
  { id: 'chianti', name: 'DOCG Chianti Classico', country: 'Italia', type: 'Tinto (Sangiovese)', colorDot: 'bg-amber-500' },
];

export default function MapComponent() {
  const [activeTab, setActiveTab] = useState<'wines' | 'memories'>('wines');
  const [showRegions, setShowRegions] = useState(true);
  const [showTrips, setShowTrips] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('Todos los países');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const filteredRegions = WINE_REGIONS.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full h-full relative flex">
      {/* Botón flotante para abrir/cerrar sidebar */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="absolute top-4 left-4 z-30 p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-zinc-300 hover:text-white shadow-xl backdrop-blur-md"
        title="Toggle Panel"
      >
        {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
      </button>

      {/* Panel Lateral del Mapa */}
      <aside
        className={`w-80 border-r border-zinc-800/80 bg-zinc-950/95 backdrop-blur-xl flex flex-col z-20 transition-all duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full absolute'
        }`}
      >
        <div className="p-4 pt-16 space-y-5 overflow-y-auto flex-1 scrollbar-none">
          {/* Título de la capa */}
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Wine className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold text-white tracking-wide">Atlas de Vinos</h2>
            </div>
            <span className="text-[10px] bg-zinc-800 text-zinc-400 font-semibold px-2 py-0.5 rounded-md border border-zinc-700/50">
              Map View
            </span>
          </div>

          {/* Capas */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
              Capas del Mapa
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowRegions(!showRegions)}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                  showRegions
                    ? 'bg-amber-950/30 border-amber-800/60 text-amber-300'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Regiones</span>
                </div>
                <Eye className="w-3.5 h-3.5 opacity-70" />
              </button>

              <button
                onClick={() => setShowTrips(!showTrips)}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                  showTrips
                    ? 'bg-amber-950/30 border-amber-800/60 text-amber-300'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Viajes</span>
                </div>
                <Eye className="w-3.5 h-3.5 opacity-70" />
              </button>
            </div>
          </div>

          {/* Selector Vinos / Memorias */}
          <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800/80">
            <button
              onClick={() => setActiveTab('wines')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'wines'
                  ? 'bg-amber-900/50 text-amber-200 border border-amber-800/60 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Vinos ({WINE_REGIONS.length})
            </button>
            <button
              onClick={() => setActiveTab('memories')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'memories'
                  ? 'bg-amber-900/50 text-amber-200 border border-amber-800/60 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Memorias (1)
            </button>
          </div>

          {/* Búsqueda y Filtros */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-zinc-500" />
              <input
                type="text"
                placeholder="Buscar D.O., región..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-amber-700/60 transition"
              />
            </div>

            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 outline-none focus:border-amber-700/60 transition"
            >
              <option value="Todos los países">Todos los países</option>
              <option value="España">España</option>
              <option value="Francia">Francia</option>
              <option value="Italia">Italia</option>
            </select>
          </div>

          {/* Listado de Denominaciones */}
          <div className="space-y-2">
            {filteredRegions.map((region) => (
              <div
                key={region.id}
                className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800/80 hover:border-zinc-700 transition cursor-pointer flex items-center justify-between group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${region.colorDot}`} />
                    <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition">
                      {region.name}
                    </h4>
                  </div>
                  <p className="text-[11px] text-zinc-400 pl-4">
                    {region.country} • {region.type}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 transition" />
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Lienzo del Mapa (Mapbox/Leaflet) */}
      <main className="flex-1 w-full h-full bg-[#0d0e12] flex items-center justify-center relative">
        <div className="text-center space-y-3 pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 animate-pulse">
            <MapPin className="w-6 h-6" />
          </div>
          <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest">
            Canvas del Mapa Oscuro Activo
          </p>
        </div>
      </main>
    </div>
  );
}
