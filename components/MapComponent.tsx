'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  Wine,
  Search,
  Plus,
  Layers,
  MapPin,
  X,
  ChevronRight,
  Sparkles,
  SlidersHorizontal
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import CreateMemoryModal, { VisibilityMode } from './CreateMemoryModal';

// --- INTERFAZ DE REGIONES ---
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

// --- REGIONES CON GEOMETRÍAS REFINADAS ---
const WINE_REGIONS: WineRegion[] = [
  {
    id: 'champagne',
    name: 'AOC Champagne',
    country: 'Francia',
    type: 'Espumoso / Champaña',
    color: '#D4AF37', // Dorado Champagne
    center: [49.04, 3.95],
    zoom: 10,
    coordinates: [
      [49.25, 3.80], [49.30, 4.05], [49.22, 4.30], [49.00, 4.25],
      [48.85, 4.40], [48.75, 4.10], [48.80, 3.85], [49.05, 3.75]
    ],
  },
  {
    id: 'rioja',
    name: 'D.O.Ca. Rioja',
    country: 'España',
    type: 'Tinto / Blanco',
    color: '#800020', // Burdeos
    center: [42.38, -2.45],
    zoom: 10,
    coordinates: [
      [42.55, -2.90], [42.58, -2.60], [42.50, -2.25], [42.30, -2.05],
      [42.15, -2.20], [42.20, -2.55], [42.35, -2.85]
    ],
  },
  {
    id: 'ribera-duero',
    name: 'D.O. Ribera del Duero',
    country: 'España',
    type: 'Tinto',
    color: '#581845', // Tinto Profundo
    center: [41.65, -3.68],
    zoom: 10,
    coordinates: [
      [41.68, -4.12], [41.74, -3.85], [41.72, -3.30], [41.65, -3.10],
      [41.52, -3.25], [41.55, -3.80], [41.60, -4.10]
    ],
  },
  {
    id: 'bordeaux',
    name: 'AOC Bordeaux',
    country: 'Francia',
    type: 'Tinto / Blanco',
    color: '#722F37', // Vino Burdeos
    center: [44.84, -0.57],
    zoom: 9,
    coordinates: [
      [45.25, -0.85], [45.18, -0.40], [44.95, -0.15], [44.50, -0.30],
      [44.40, -0.70], [44.70, -0.95], [45.05, -0.90]
    ],
  },
  {
    id: 'rias-baixas',
    name: 'D.O. Rías Baixas',
    country: 'España',
    type: 'Blanco (Albariño)',
    color: '#1B4D3E', // Verde Esmeralda / Olivo
    center: [42.43, -8.72],
    zoom: 10,
    coordinates: [
      [42.58, -8.85], [42.55, -8.65], [42.35, -8.60], [42.15, -8.70],
      [42.18, -8.90], [42.40, -8.80]
    ],
  },
  {
    id: 'priorat',
    name: 'D.O.Ca. Priorat',
    country: 'España',
    type: 'Tinto Robusto',
    color: '#4A0E17', // Púrpura / Garnacha
    center: [41.20, 0.82],
    zoom: 11,
    coordinates: [
      [41.28, 0.78], [41.29, 0.92], [41.20, 0.96], [41.12, 0.88],
      [41.14, 0.75]
    ],
  },
];

// --- CARGA DINÁMICA DEL MAPA (DESACTIVA SSR PARA EVITAR ERRORES Y TIRONES) ---
const DynamicLeafletMap = dynamic(() => import('./InnerWineMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-stone-100 flex items-center justify-center text-stone-400 gap-2">
      <Sparkles className="w-5 h-5 animate-spin text-stone-500" />
      <span className="text-xs font-medium uppercase tracking-wider">Cargando Mapa de Vinos...</span>
    </div>
  ),
});

export default function MapComponent() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [memories, setMemories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showRegions, setShowRegions] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<WineRegion | null>(null);
  const [flyTarget, setFlyTarget] = useState<{ center: [number, number]; zoom: number } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    fetchMemories();
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
        (err) => console.warn(err.message),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  const fetchMemories = async () => {
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) setMemories(data);
  };

  const handleAddMemory = async (formData: { title: string; desc: string; visibility: VisibilityMode; sharedWith: string[] }) => {
    const lat = flyTarget ? flyTarget.center[0] : userLocation ? userLocation[0] : 40.4167;
    const lng = flyTarget ? flyTarget.center[1] : userLocation ? userLocation[1] : -3.7037;

    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase.from('memories').insert([
      {
        user_id: user?.id || null,
        author_name: user?.email || 'Catador Anónimo',
        title: formData.title,
        description: formData.desc,
        latitude: lat,
        longitude: lng,
        visibility: formData.visibility,
        shared_with: formData.sharedWith,
      },
    ]).select();

    if (error) {
      alert('Error guardando memoria: ' + error.message);
    } else if (data) {
      setMemories((prev) => [data[0], ...prev]);
    }
  };

  const selectRegionHandler = (region: WineRegion) => {
    setSelectedRegion(region);
    setFlyTarget({ center: region.center, zoom: region.zoom });
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-stone-100 font-sans text-stone-900 flex">
      {/* PANEL LATERAL MODERNO */}
      <aside
        className={`absolute top-0 left-0 bottom-0 z-20 w-80 bg-white/90 backdrop-blur-xl border-r border-stone-200/80 shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 border-b border-stone-200/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-stone-900 text-amber-400 rounded-2xl shadow-md">
              <Wine className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-stone-900 tracking-tight">Atlas des Vins</h2>
              <p className="text-[11px] text-stone-500 font-medium">Terroirs & Champagnes</p>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-stone-400 hover:text-stone-700 p-1.5 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTROLES */}
        <div className="p-4 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between">
          <span className="text-xs font-semibold text-stone-700 flex items-center gap-2">
            <Layers className="w-4 h-4 text-stone-500" />
            Capa de Terroirs / D.O.
          </span>
          <button
            onClick={() => setShowRegions(!showRegions)}
            className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
              showRegions ? 'bg-stone-900' : 'bg-stone-300'
            }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${
                showRegions ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* BÚSQUEDA */}
        <div className="p-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5 bg-stone-100/80 px-3.5 py-2.5 rounded-2xl border border-stone-200/60 focus-within:border-stone-400 transition">
            <Search className="w-4 h-4 text-stone-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar denominación o vino..."
              className="bg-transparent text-xs outline-none w-full text-stone-800 placeholder-stone-400 font-medium"
            />
          </div>
        </div>

        {/* LISTA DE DENOMINACIONES */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
          <div className="flex items-center justify-between px-1 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Grandes Regiones
            </span>
            <span className="text-[10px] font-medium text-stone-400">
              {WINE_REGIONS.length} D.O.
            </span>
          </div>

          {WINE_REGIONS.filter((r) =>
            r.name.toLowerCase().includes(searchQuery.toLowerCase())
          ).map((region) => {
            const isSelected = selectedRegion?.id === region.id;
            return (
              <button
                key={region.id}
                onClick={() => selectRegionHandler(region)}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-200 flex items-center justify-between group ${
                  isSelected
                    ? 'bg-stone-900 text-white border-stone-900 shadow-xl scale-[1.01]'
                    : 'bg-white border-stone-200/80 hover:border-stone-300 text-stone-800 hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0 ring-2 ring-white/20 shadow-sm"
                    style={{ backgroundColor: region.color }}
                  />
                  <div>
                    <h4 className="font-bold text-xs leading-snug">{region.name}</h4>
                    <span
                      className={`text-[10px] font-medium ${
                        isSelected ? 'text-stone-300' : 'text-stone-500'
                      }`}
                    >
                      {region.country} • {region.type}
                    </span>
                  </div>
                </div>
                <ChevronRight
                  className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${
                    isSelected ? 'text-amber-400' : 'text-stone-400'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* ACCIÓN INFERIOR */}
        <div className="p-4 border-t border-stone-200/80 bg-stone-50/80 backdrop-blur-md">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold py-3 px-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition active:scale-95"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Registrar Cata / Memoria</span>
          </button>
        </div>
      </aside>

      {/* BOTÓN DESPLEGAR SIDEBAR */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md border border-stone-200/80 p-3 rounded-2xl shadow-xl text-stone-800 hover:bg-stone-50 transition active:scale-95"
        >
          <Wine className="w-5 h-5 text-stone-900" />
        </button>
      )}

      {/* MAPA PRINCIPAL */}
      <div className="flex-1 h-full relative">
        <DynamicLeafletMap
          regions={WINE_REGIONS}
          showRegions={showRegions}
          selectedRegion={selectedRegion}
          onSelectRegion={selectRegionHandler}
          memories={memories}
          flyTarget={flyTarget}
        />
      </div>

      <CreateMemoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        availableFriends={[]}
        onSubmit={handleAddMemory}
      />
    </div>
  );
}
