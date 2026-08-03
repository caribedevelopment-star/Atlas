'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  Wine,
  Search,
  Plus,
  Layers,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight,
  Sparkles,
  MapPin,
  Eye,
  EyeOff,
  Lock,
  Globe,
  Users,
  Filter
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import CreateMemoryModal, { VisibilityMode } from './CreateMemoryModal';
import type { WineRegion, InnerMapProps } from './InnerWineMap';
import 'leaflet/dist/leaflet.css';

export type { WineRegion };

// BASE DE DATOS EXTENDIDA DE REGIONES POR PAÍS
const WINE_REGIONS: WineRegion[] = [
  // --- ESPAÑA ---
  {
    id: 'rioja',
    name: 'D.O.Ca. Rioja',
    country: 'España',
    type: 'Tinto / Blanco',
    color: '#800020',
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
    color: '#581845',
    center: [41.65, -3.68],
    zoom: 10,
    coordinates: [
      [41.68, -4.12], [41.74, -3.85], [41.72, -3.30], [41.65, -3.10],
      [41.52, -3.25], [41.55, -3.80], [41.60, -4.10]
    ],
  },
  {
    id: 'priorat',
    name: 'D.O.Ca. Priorat',
    country: 'España',
    type: 'Tinto',
    color: '#4A0E17',
    center: [41.20, 0.82],
    zoom: 11,
    coordinates: [
      [41.28, 0.78], [41.29, 0.92], [41.20, 0.96], [41.12, 0.88],
      [41.14, 0.75]
    ],
  },
  {
    id: 'rias-baixas',
    name: 'D.O. Rías Baixas',
    country: 'España',
    type: 'Blanco (Albariño)',
    color: '#1B4D3E',
    center: [42.43, -8.72],
    zoom: 10,
    coordinates: [
      [42.58, -8.85], [42.55, -8.65], [42.35, -8.60], [42.15, -8.70],
      [42.18, -8.90], [42.40, -8.80]
    ],
  },

  // --- FRANCIA ---
  {
    id: 'bordeaux',
    name: 'AOC Bordeaux',
    country: 'Francia',
    type: 'Tinto / Blanco',
    color: '#722F37',
    center: [44.84, -0.57],
    zoom: 9,
    coordinates: [
      [45.25, -0.85], [45.18, -0.40], [44.95, -0.15], [44.50, -0.30],
      [44.40, -0.70], [44.70, -0.95], [45.05, -0.90]
    ],
  },
  {
    id: 'champagne',
    name: 'AOC Champagne',
    country: 'Francia',
    type: 'Espumoso',
    color: '#D4AF37',
    center: [49.04, 3.95],
    zoom: 10,
    coordinates: [
      [49.25, 3.80], [49.30, 4.05], [49.22, 4.30], [49.00, 4.25],
      [48.85, 4.40], [48.75, 4.10], [48.80, 3.85], [49.05, 3.75]
    ],
  },
  {
    id: 'bourgogne',
    name: 'AOC Bourgogne (Borgona)',
    country: 'Francia',
    type: 'Pinot Noir / Chardonnay',
    color: '#6B1D2F',
    center: [47.05, 4.83],
    zoom: 9,
    coordinates: [
      [47.35, 4.90], [47.20, 5.05], [46.80, 4.85], [46.65, 4.65],
      [46.85, 4.55], [47.15, 4.70]
    ],
  },

  // --- ITALIA ---
  {
    id: 'chianti',
    name: 'DOCG Chianti Classico',
    country: 'Italia',
    type: 'Tinto (Sangiovese)',
    color: '#8B0000',
    center: [43.55, 11.30],
    zoom: 10,
    coordinates: [
      [43.70, 11.20], [43.68, 11.45], [43.45, 11.48], [43.35, 11.30],
      [43.45, 11.15]
    ],
  },
  {
    id: 'barolo',
    name: 'DOCG Barolo (Piamonte)',
    country: 'Italia',
    type: 'Tinto (Nebbiolo)',
    color: '#5C061C',
    center: [44.61, 7.96],
    zoom: 11,
    coordinates: [
      [44.66, 7.92], [44.65, 8.02], [44.57, 8.01], [44.56, 7.91]
    ],
  },

  // --- PORTUGAL ---
  {
    id: 'douro',
    name: 'DOC Douro',
    country: 'Portugal',
    type: 'Oporto / Tinto',
    color: '#3B1425',
    center: [41.15, -7.50],
    zoom: 10,
    coordinates: [
      [41.28, -7.80], [41.30, -7.25], [41.05, -7.15], [41.00, -7.70]
    ],
  }
];

const DynamicLeafletMap = dynamic<InnerMapProps>(
  () => import('./InnerWineMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-stone-950 flex items-center justify-center text-stone-500 gap-2 font-mono text-xs">
        <Sparkles className="w-4 h-4 animate-spin text-amber-500" />
        <span>CARGANDO REGIONES Y MEMORIAS...</span>
      </div>
    ),
  }
);

export default function MapComponent() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [memories, setMemories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('todos');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'private' | 'shared' | 'public'>('all');

  // CONTROL DE CAPAS
  const [showRegions, setShowRegions] = useState(true);
  const [showMemories, setShowMemories] = useState(true);

  // SELECCIÓN Y PESTAÑAS DEL SIDEBAR
  const [activeTab, setActiveTab] = useState<'regions' | 'memories'>('regions');
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
        author_name: user?.email ? user.email.split('@')[0] : 'Catador Anónimo',
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

  // Países disponibles para el filtro
  const countries = ['todos', ...Array.from(new Set(WINE_REGIONS.map((r) => r.country)))];

  // Filtrado de Regiones
  const filteredRegions = WINE_REGIONS.filter((r) => {
    const matchesCountry = selectedCountry === 'todos' || r.country === selectedCountry;
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCountry && matchesSearch;
  });

  // Filtrado de Memorias por Visibilidad y Búsqueda
  const filteredMemories = memories.filter((m) => {
    const matchesSearch =
      m.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVis = visibilityFilter === 'all' || m.visibility === visibilityFilter;
    return matchesSearch && matchesVis;
  });

  return (
    <div className="relative w-full h-screen overflow-hidden bg-stone-950 text-stone-100 flex font-sans antialiased">
      
      {/* PANEL LATERAL */}
      <aside
        className={`h-full bg-stone-900 border-r border-stone-800 transition-all duration-300 ease-in-out flex flex-col z-[1000] shrink-0 ${
          isSidebarOpen ? 'w-80 opacity-100' : 'w-0 opacity-0 overflow-hidden'
        }`}
      >
        {/* CABECERA */}
        <div className="p-4 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Wine className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-wide text-stone-100">Atlas des Vins</h1>
              <p className="text-[10px] text-stone-500">Regiones & Memorias de Cata</p>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1.5 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition"
            title="Ocultar panel"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* VISIBILIDAD DE CAPAS */}
        <div className="p-3 border-b border-stone-800 bg-stone-950/40 space-y-2">
          <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
            Capas en Mapa
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setShowRegions(!showRegions)}
              className={`flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg border transition ${
                showRegions ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : 'bg-stone-900 border-stone-800 text-stone-500'
              }`}
            >
              <span className="flex items-center gap-1.5 font-medium truncate">
                <Layers className="w-3.5 h-3.5" />
                Regiones
              </span>
              {showRegions ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setShowMemories(!showMemories)}
              className={`flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg border transition ${
                showMemories ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : 'bg-stone-900 border-stone-800 text-stone-500'
              }`}
            >
              <span className="flex items-center gap-1.5 font-medium truncate">
                <MapPin className="w-3.5 h-3.5" />
                Memorias
              </span>
              {showMemories ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* PESTAÑAS, FILTROS Y BÚSQUEDA */}
        <div className="p-3 border-b border-stone-800 bg-stone-900 space-y-2.5">
          <div className="flex bg-stone-950 p-1 rounded-lg border border-stone-800 text-xs font-medium">
            <button
              onClick={() => setActiveTab('regions')}
              className={`flex-1 py-1.5 rounded-md transition ${
                activeTab === 'regions' ? 'bg-stone-800 text-stone-100 shadow-sm' : 'text-stone-500 hover:text-stone-300'
              }`}
            >
              Regiones ({filteredRegions.length})
            </button>
            <button
              onClick={() => setActiveTab('memories')}
              className={`flex-1 py-1.5 rounded-md transition ${
                activeTab === 'memories' ? 'bg-stone-800 text-stone-100 shadow-sm' : 'text-stone-500 hover:text-stone-300'
              }`}
            >
              Memorias ({filteredMemories.length})
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === 'regions' ? "Buscar D.O., variedad..." : "Buscar nota de cata..."}
              className="w-full bg-stone-950 border border-stone-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-stone-200 placeholder-stone-600 focus:outline-none focus:border-stone-700 transition"
            />
          </div>

          {/* Filtros específicos según pestaña */}
          {activeTab === 'regions' ? (
            <div className="flex items-center gap-2">
              <Filter className="w-3 h-3 text-stone-500" />
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-md py-1 px-2 text-[11px] text-stone-300 focus:outline-none"
              >
                {countries.map((c) => (
                  <option key={c} value={c}>
                    {c === 'todos' ? 'Todos los países' : c}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex gap-1 text-[10px]">
              {(['all', 'private', 'shared', 'public'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setVisibilityFilter(mode)}
                  className={`flex-1 py-1 rounded border capitalize text-center ${
                    visibilityFilter === mode
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-semibold'
                      : 'bg-stone-950 border-stone-800 text-stone-500'
                  }`}
                >
                  {mode === 'all' ? 'Todas' : mode === 'private' ? 'Privadas' : mode === 'shared' ? 'Amigos' : 'Públicas'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* LISTA DE ELEMENTOS */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 custom-scrollbar">
          {activeTab === 'regions' ? (
            filteredRegions.map((region) => {
              const isSelected = selectedRegion?.id === region.id;
              return (
                <button
                  key={region.id}
                  onClick={() => {
                    setSelectedRegion(region);
                    setFlyTarget({ center: region.center, zoom: region.zoom });
                  }}
                  className={`w-full text-left p-2.5 rounded-lg border transition flex items-center justify-between group ${
                    isSelected
                      ? 'bg-stone-800 border-stone-600 text-white shadow-sm'
                      : 'bg-stone-950/40 border-stone-800/60 hover:bg-stone-800/40 hover:border-stone-700 text-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: region.color }}
                    />
                    <div className="truncate">
                      <div className="text-xs font-medium truncate">{region.name}</div>
                      <div className="text-[10px] text-stone-500 truncate mt-0.5">
                        {region.country} · {region.type}
                      </div>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                      isSelected ? 'text-amber-400 translate-x-0.5' : 'text-stone-600 group-hover:text-stone-400'
                    }`}
                  />
                </button>
              );
            })
          ) : (
            filteredMemories.length > 0 ? (
              filteredMemories.map((mem) => (
                <button
                  key={mem.id}
                  onClick={() => setFlyTarget({ center: [mem.latitude, mem.longitude], zoom: 12 })}
                  className="w-full text-left p-2.5 rounded-lg border border-stone-800/60 bg-stone-950/40 hover:bg-stone-800/40 hover:border-stone-700 transition space-y-1 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-stone-200 truncate">{mem.title}</span>
                    <span className="text-[10px] text-stone-500 flex items-center gap-1">
                      {mem.visibility === 'private' && <Lock className="w-3 h-3 text-red-400" />}
                      {mem.visibility === 'shared' && <Users className="w-3 h-3 text-amber-400" />}
                      {mem.visibility === 'public' && <Globe className="w-3 h-3 text-emerald-400" />}
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-400 line-clamp-2">{mem.description}</p>
                </button>
              ))
            ) : (
              <div className="text-center py-8 text-stone-600 text-xs">
                No hay memorias guardadas en esta categoría.
              </div>
            )
          )}
        </div>

        {/* BOTÓN AGREGAR */}
        <div className="p-3 border-t border-stone-800 bg-stone-950/80">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs py-2 px-3 rounded-lg shadow-sm transition flex items-center justify-center gap-1.5 active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Cata / Memoria</span>
          </button>
        </div>
      </aside>

      {/* BOTÓN REABRIR PANEL */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="absolute top-4 left-4 z-[1001] bg-stone-900 border border-stone-700 p-2.5 rounded-xl shadow-xl text-stone-200 hover:bg-stone-800 transition flex items-center gap-2 text-xs font-medium"
        >
          <PanelLeftOpen className="w-4 h-4 text-amber-400" />
          <span>Panel</span>
        </button>
      )}

      {/* CONTENEDOR DEL MAPA */}
      <div className="flex-1 h-full relative bg-stone-950">
        <DynamicLeafletMap
          regions={filteredRegions}
          showRegions={showRegions}
          showMemories={showMemories}
          selectedRegion={selectedRegion}
          onSelectRegion={(reg) => {
            setSelectedRegion(reg);
            setFlyTarget({ center: reg.center, zoom: reg.zoom });
          }}
          memories={filteredMemories}
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
