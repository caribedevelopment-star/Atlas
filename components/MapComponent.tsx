'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polygon, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import {
  Wine,
  Search,
  Plus,
  Layers,
  MapPin,
  X,
  Compass,
  Check,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import CreateMemoryModal, { VisibilityMode } from './CreateMemoryModal';

// --- DENOMINACIONES DE ORIGEN Y REGIONES VINÍCOLAS (POLÍGONOS) ---
export interface WineRegion {
  id: string;
  name: string;
  country: string;
  type: string;
  color: string;
  coordinates: [number, number][];
  center: [number, number];
}

const WINE_REGIONS: WineRegion[] = [
  {
    id: 'rioja',
    name: 'D.O.Ca. Rioja',
    country: 'España',
    type: 'Tinto / Blanco',
    color: '#8b0032',
    center: [42.35, -2.50],
    coordinates: [
      [42.60, -2.95],
      [42.40, -2.15],
      [42.15, -2.10],
      [42.25, -2.70],
      [42.60, -2.95],
    ],
  },
  {
    id: 'ribera-duero',
    name: 'D.O. Ribera del Duero',
    country: 'España',
    type: 'Tinto',
    color: '#722f37',
    center: [41.62, -3.65],
    coordinates: [
      [41.70, -4.15],
      [41.75, -3.10],
      [41.50, -3.15],
      [41.55, -4.10],
      [41.70, -4.15],
    ],
  },
  {
    id: 'rias-baixas',
    name: 'D.O. Rías Baixas',
    country: 'España',
    type: 'Blanco (Albariño)',
    color: '#2e7d32',
    center: [42.35, -8.75],
    coordinates: [
      [42.55, -8.90],
      [42.55, -8.60],
      [42.15, -8.65],
      [42.20, -8.90],
      [42.55, -8.90],
    ],
  },
  {
    id: 'champagne',
    name: 'AOC Champagne',
    country: 'Francia',
    type: 'Espumoso / Champaña',
    color: '#d4af37',
    center: [49.08, 4.10],
    coordinates: [
      [49.35, 3.80],
      [49.30, 4.45],
      [48.80, 4.50],
      [48.85, 3.75],
      [49.35, 3.80],
    ],
  },
  {
    id: 'bordeaux',
    name: 'AOC Bordeaux',
    country: 'Francia',
    type: 'Tinto / Blanco',
    color: '#800020',
    center: [44.83, -0.57],
    coordinates: [
      [45.20, -0.95],
      [45.15, -0.10],
      [44.40, -0.20],
      [44.50, -0.85],
      [45.20, -0.95],
    ],
  },
];

// --- PIN PERSONALIZADO BLANCO/VINO ---
const winePinIcon = L.divIcon({
  className: 'wine-pin',
  html: `
    <div className="relative flex items-center justify-center w-8 h-8">
      <div className="w-8 h-8 bg-white border-2 border-stone-900 rounded-full shadow-md flex items-center justify-center text-red-900 font-bold text-xs">
        🍷
      </div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

function MapFlyTo({ target }: { target: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo(target, 9, { animate: true, duration: 1.5 });
    }
  }, [target, map]);
  return null;
}

export default function MapComponent() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [memories, setMemories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Estados para Denominaciones de Origen y Panel
  const [showRegions, setShowRegions] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<WineRegion | null>(null);
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);
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
    const lat = flyTarget ? flyTarget[0] : userLocation ? userLocation[0] : 40.4167;
    const lng = flyTarget ? flyTarget[1] : userLocation ? userLocation[1] : -3.7037;

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
    setFlyTarget(region.center);
  };

  const initialCenter: [number, number] = [43.0, -1.0]; // Centrado en península ibérica / suroeste Francia

  return (
    <div className="relative w-full h-full overflow-hidden bg-stone-50 font-sans text-stone-900 flex">
      {/* PANEL LATERAL DE DENOMINACIONES DE ORIGEN */}
      <aside
        className={`absolute top-0 left-0 bottom-0 z-20 w-80 bg-white/95 backdrop-blur-md border-r border-stone-200 shadow-2xl transition-transform duration-300 flex flex-col ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-stone-100 rounded-xl border border-stone-200">
              <Wine className="w-5 h-5 text-red-900" />
            </div>
            <div>
              <h2 className="font-bold text-base text-stone-900">Mapa de Vinos</h2>
              <p className="text-xs text-stone-500">Denominaciones & Champañas</p>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-stone-400 hover:text-stone-600 p-1.5 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTROLES DE CAPAS */}
        <div className="p-4 border-b border-stone-100 bg-stone-50/50">
          <label className="flex items-center justify-between text-xs font-medium text-stone-700 cursor-pointer">
            <span className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-stone-500" />
              Sombra de Regiones / D.O.
            </span>
            <input
              type="checkbox"
              checked={showRegions}
              onChange={(e) => setShowRegions(e.target.checked)}
              className="accent-red-900 w-4 h-4 rounded"
            />
          </label>
        </div>

        {/* BÚSQUEDA */}
        <div className="p-4 border-b border-stone-100">
          <div className="flex items-center gap-2 bg-stone-100 px-3 py-2 rounded-xl border border-stone-200">
            <Search className="w-4 h-4 text-stone-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar D.O. o bodega..."
              className="bg-transparent text-xs outline-none w-full text-stone-800 placeholder-stone-400"
            />
          </div>
        </div>

        {/* LISTA DE REGIONES Y D.O. */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 px-1">
            Denominaciones destacadas
          </span>

          {WINE_REGIONS.filter((r) =>
            r.name.toLowerCase().includes(searchQuery.toLowerCase())
          ).map((region) => {
            const isSelected = selectedRegion?.id === region.id;
            return (
              <button
                key={region.id}
                onClick={() => selectRegionHandler(region)}
                className={`w-full text-left p-3 rounded-2xl border transition flex items-center justify-between ${
                  isSelected
                    ? 'bg-stone-900 text-white border-stone-900 shadow-md'
                    : 'bg-white border-stone-200 hover:border-stone-300 text-stone-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-3 h-3 rounded-full shrink-0 border border-white/40"
                    style={{ backgroundColor: region.color }}
                  />
                  <div>
                    <h4 className="font-semibold text-xs leading-tight">{region.name}</h4>
                    <span
                      className={`text-[10px] ${
                        isSelected ? 'text-stone-400' : 'text-stone-500'
                      }`}
                    >
                      {region.country} • {region.type}
                    </span>
                  </div>
                </div>
                <ChevronRight
                  className={`w-4 h-4 ${
                    isSelected ? 'text-white' : 'text-stone-400'
                  }`}
                />
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-stone-200 bg-stone-50/80">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold py-3 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir Cata / Memoria</span>
          </button>
        </div>
      </aside>

      {/* BOTÓN RE-ABRIR SIDEBAR SI ESTÁ CERRADO */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="absolute top-4 left-4 z-10 bg-white border border-stone-200 p-3 rounded-2xl shadow-xl text-stone-800 hover:bg-stone-50 transition"
        >
          <Wine className="w-5 h-5 text-red-900" />
        </button>
      )}

      {/* CONTENEDOR DEL MAPA (TOTALMENTE BLANCO - CARTO POSITRON) */}
      <div className="flex-1 h-full relative">
        <MapContainer
          center={initialCenter}
          zoom={6}
          zoomControl={false}
          className="w-full h-full bg-stone-100"
        >
          {/* Capa de Mapa Blanco Minimalista */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          <MapFlyTo target={flyTarget} />

          {/* POLÍGONOS SOMBREADOS DE LAS D.O. */}
          {showRegions &&
            WINE_REGIONS.map((region) => {
              const isSelected = selectedRegion?.id === region.id;
              return (
                <Polygon
                  key={region.id}
                  positions={region.coordinates}
                  pathOptions={{
                    color: region.color,
                    fillColor: region.color,
                    fillOpacity: isSelected ? 0.45 : 0.2,
                    weight: isSelected ? 3 : 1.5,
                    dashArray: isSelected ? '' : '4',
                  }}
                  eventHandlers={{
                    click: () => selectRegionHandler(region),
                  }}
                >
                  <Popup>
                    <div className="p-1 text-stone-900">
                      <span className="text-[10px] uppercase font-bold text-stone-400">
                        Denominación de Origen
                      </span>
                      <h4 className="font-bold text-sm text-stone-900 mb-0.5">{region.name}</h4>
                      <p className="text-xs text-stone-600 mb-2">{region.type}</p>
                      <button
                        onClick={() => selectRegionHandler(region)}
                        className="text-xs font-semibold text-red-900 underline"
                      >
                        Ver detalles en el panel
                      </button>
                    </div>
                  </Popup>
                </Polygon>
              );
            })}

          {/* MARCADORES DE MEMORIAS Y CATAS */}
          {memories.map((mem) => (
            <Marker key={mem.id} position={[mem.latitude, mem.longitude]} icon={winePinIcon}>
              <Popup>
                <div className="p-1 max-w-xs text-stone-900">
                  <h4 className="font-bold text-sm text-stone-900">{mem.title}</h4>
                  <p className="text-xs text-stone-600 mt-1">{mem.description}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* MODAL CREAR MEMORIA */}
      <CreateMemoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        availableFriends={[]}
        onSubmit={handleAddMemory}
      />
    </div>
  );
}
