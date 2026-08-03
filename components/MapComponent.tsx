'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Map as MapIcon,
  Wine,
  BookOpen,
  User,
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
  Filter,
  Plane
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import CreateMemoryModal, { VisibilityMode } from './CreateMemoryModal';
import type { WineRegion, InnerMapProps } from './InnerWineMap';
import 'leaflet/dist/leaflet.css';

export type { WineRegion };

const WINE_REGIONS: WineRegion[] = [
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
  }
];

const DynamicLeafletMap = dynamic<InnerMapProps>(
  () => import('./InnerWineMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-stone-950 flex items-center justify-center text-stone-500 gap-2 font-mono text-xs">
        <Sparkles className="w-4 h-4 animate-spin text-amber-500" />
        <span>CARGANDO MAPA DE VIAJES Y REGIONES...</span>
      </div>
    ),
  }
);

export default function MapComponent() {
  const pathname = usePathname();
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [travelMemories, setTravelMemories] = useState<any[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('todos');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'private' | 'shared' | 'public'>('all');

  const [showRegions, setShowRegions] = useState(true);
  const [showMemories, setShowMemories] = useState(true);

  const [activeDomain, setActiveDomain] = useState<'wine' | 'travel'>('wine');
  const [selectedRegion, setSelectedRegion] = useState<WineRegion | null>(null);
  const [flyTarget, setFlyTarget] = useState<{ center: [number, number]; zoom: number } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Navegación principal unificada
  const navItems = [
    { name: 'Mapa', href: '/home', icon: MapIcon },
    { name: 'Memorias', href: '/memories', icon: Plane },
    { name: 'Vinos', href: '/wines', icon: Wine },
    { name: 'Lecturas', href: '/library', icon: BookOpen },
    { name: 'Perfil', href: '/profile', icon: User },
  ];

  useEffect(() => {
    fetchTravelMemories();
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
        (err) => console.warn(err.message),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  const fetchTravelMemories = async () => {
    const { data, error } = await supabase
      .from('travel_memories')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTravelMemories(data);
    } else {
      const { data: generalData } = await supabase
        .from('memories')
        .select('*')
        .order('created_at', { ascending: false });
      if (generalData) setTravelMemories(generalData);
    }
  };

  const handleAddTravelMemory = async (formData: { title: string; desc: string; visibility: VisibilityMode; sharedWith: string[] }) => {
    const lat = flyTarget ? flyTarget.center[0] : userLocation ? userLocation[0] : 40.4167;
    const lng = flyTarget ? flyTarget.center[1] : userLocation ? userLocation[1] : -3.7037;

    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase.from('travel_memories').insert([
      {
        user_id: user?.id || null,
        author_name: user?.email ? user.email.split('@')[0] : 'Viajero',
        title: formData.title,
        description: formData.desc,
        latitude: lat,
        longitude: lng,
        visibility: formData.visibility,
        shared_with: formData.sharedWith,
      },
    ]).select();

    if (!error && data) {
      setTravelMemories((prev) => [data[0], ...prev]);
    }
  };

  const countries = ['todos', ...Array.from(new Set(WINE_REGIONS.map((r) => r.country)))];

  const filteredRegions = WINE_REGIONS.filter((r) => {
    const matchesCountry = selectedCountry === 'todos' || r.country === selectedCountry;
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCountry && matchesSearch;
  });

  const filteredMemories = travelMemories.filter((m) => {
    const matchesSearch =
      m.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVis = visibilityFilter === 'all' || m.visibility === visibilityFilter;
    return matchesSearch && matchesVis;
  });

  return (
    <div className="relative w-full h-full bg-stone-950 text-stone-100 flex font-sans antialiased overflow-hidden">
      
      {/* SIDEBAR DE NAVEGACIÓN */}
      <aside
        className={`h-full bg-stone-900 border-r border-stone-800 transition-all duration-300 ease-in-out flex flex-col z-[1000] shrink-0 ${
          isSidebarOpen ? 'w-80 opacity-100' : 'w-0 opacity-0 overflow-hidden'
        }`}
      >
        {/* MENÚ GENERAL DE SECCIONES DE LA APLICACIÓN */}
        <div className="p-3 border-b border-stone-800 bg-stone-950">
          <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2 px-1">
            Secciones
          </div>
          <nav className="grid grid-cols-5 gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg border text-[10px] font-medium transition ${
                    isActive
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                      : 'bg-stone-900 border-stone-800/80 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 mb-1" />
                  <span className="truncate w-full text-center">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* CABECERA DEL PANEL */}
        <div className="p-3 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              {activeDomain === 'wine' ? <Wine className="w-3.5 h-3.5" /> : <Plane className="w-3.5 h-3.5" />}
            </div>
            <div>
              <h1 className="text-xs font-semibold text-stone-100">
                {activeDomain === 'wine' ? 'Atlas de Vinos' : 'Bitácora de Viajes'}
              </h1>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* CONTROLES DE CAPAS */}
        <div className="p-3 border-b border-stone-800 bg-stone-950/40 space-y-2">
          <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
            Capas del Mapa
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
                Viajes
              </span>
              {showMemories ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* CAMBIO DE SECCIÓN Y FILTROS */}
        <div className="p-3 border-b border-stone-800 bg-stone-900 space-y-2.5">
          <div className="flex bg-stone-950 p-1 rounded-lg border border-stone-800 text-xs font-medium">
            <button
              onClick={() => setActiveDomain('wine')}
              className={`flex-1 py-1.5 rounded-md transition flex items-center justify-center gap-1.5 ${
                activeDomain === 'wine' ? 'bg-stone-800 text-amber-400 shadow-sm' : 'text-stone-500 hover:text-stone-300'
              }`}
            >
              <Wine className="w-3.5 h-3.5" />
              <span>Vinos ({filteredRegions.length})</span>
            </button>
            <button
              onClick={() => setActiveDomain('travel')}
              className={`flex-1 py-1.5 rounded-md transition flex items-center justify-center gap-1.5 ${
                activeDomain === 'travel' ? 'bg-stone-800 text-amber-400 shadow-sm' : 'text-stone-500 hover:text-stone-300'
              }`}
            >
              <Plane className="w-3.5 h-3.5" />
              <span>Memorias ({filteredMemories.length})</span>
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeDomain === 'wine' ? "Buscar D.O., región..." : "Buscar viaje o lugar..."}
              className="w-full bg-stone-950 border border-stone-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-stone-200 placeholder-stone-600 focus:outline-none focus:border-stone-700 transition"
            />
          </div>

          {activeDomain === 'wine' ? (
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

        {/* LISTADO */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 custom-scrollbar">
          {activeDomain === 'wine' ? (
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
                No hay viajes o memorias registrados.
              </div>
            )
          )}
        </div>

        {/* ACCIÓN DE AGREGAR VIAJE / MEMORIA */}
        {activeDomain === 'travel' && (
          <div className="p-3 border-t border-stone-800 bg-stone-950/80">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs py-2 px-3 rounded-lg shadow-sm transition flex items-center justify-center gap-1.5 active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir Memoria de Viaje</span>
            </button>
          </div>
        )}
      </aside>

      {/* BOTÓN DESPLEGAR SIDEBAR */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="absolute top-4 left-4 z-[1001] bg-stone-900 border border-stone-700 p-2.5 rounded-xl shadow-xl text-stone-200 hover:bg-stone-800 transition flex items-center gap-2 text-xs font-medium"
        >
          <PanelLeftOpen className="w-4 h-4 text-amber-400" />
          <span>Panel</span>
        </button>
      )}

      {/* CONTENEDOR MAPA COMPLETO */}
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
        onSubmit={handleAddTravelMemory}
      />
    </div>
  );
}
