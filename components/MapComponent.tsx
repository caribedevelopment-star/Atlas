'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import Link from 'next/link';
import {
  BookOpen,
  Search,
  Plus,
  Lock,
  Globe,
  Users,
  Navigation,
  X,
  MapPin,
  Calendar
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import CreateMemoryModal, { VisibilityMode } from './CreateMemoryModal';

// --- ICONOS PERSONALIZADOS EN CSS ---
const createCustomIcon = (visibility: string) => {
  let colorClass = 'bg-emerald-500 shadow-emerald-500/50'; // Public
  if (visibility === 'private') colorClass = 'bg-amber-500 shadow-amber-500/50';
  if (visibility === 'shared') colorClass = 'bg-indigo-500 shadow-indigo-500/50';

  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div className="relative flex items-center justify-center w-8 h-8">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full ${colorClass} opacity-40"></span>
        <div className="relative inline-flex rounded-full h-7 w-7 ${colorClass} border-2 border-slate-900 shadow-lg items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

// Componente para re-centrar el mapa suavemente
function MapController({ coords, targetPos }: { coords: [number, number] | null; targetPos: [number, number] | null }) {
  const map = useMap();

  useEffect(() => {
    if (targetPos) {
      map.flyTo(targetPos, 16, { animate: true, duration: 1.2 });
    } else if (coords) {
      map.flyTo(coords, 14, { animate: true, duration: 1.5 });
    }
  }, [coords, targetPos, map]);

  return null;
}

// Capturador de clics en el mapa para añadir memoria en lugar específico
function LocationPicker({ onSelectCoords }: { onSelectCoords: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onSelectCoords(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapComponent() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [memories, setMemories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMemory, setSelectedMemory] = useState<any | null>(null);
  const [mapTarget, setMapTarget] = useState<[number, number] | null>(null);

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

    if (error) {
      console.error('Error al cargar memorias:', error.message);
    } else if (data) {
      setMemories(data);
    }
  };

  // Filtrado reactivo por término de búsqueda
  const filteredMemories = useMemo(() => {
    if (!searchQuery.trim()) return memories;
    const query = searchQuery.toLowerCase();
    return memories.filter(
      (m) =>
        m.title?.toLowerCase().includes(query) ||
        m.description?.toLowerCase().includes(query)
    );
  }, [memories, searchQuery]);

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedCoords([lat, lng]);
    setSelectedMemory(null); // Cerrar tarjeta activa si se toca el mapa libre
  };

  const handleAddMemory = async (formData: { title: string; desc: string; visibility: VisibilityMode; sharedWith: string[] }) => {
    // Usa las coordenadas seleccionadas al hacer clic, o la ubicación actual, o Madrid por defecto
    const lat = selectedCoords ? selectedCoords[0] : userLocation ? userLocation[0] : 40.4167;
    const lng = selectedCoords ? selectedCoords[1] : userLocation ? userLocation[1] : -3.7037;

    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase.from('memories').insert([
      {
        user_id: user?.id || null,
        author_name: user?.email || 'Usuario Anónimo',
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
      setSelectedCoords(null);
    }
  };

  const centerOnUser = () => {
    if (userLocation) {
      setMapTarget(userLocation);
    }
  };

  const initialCenter: [number, number] = userLocation || [40.41678, -3.70379];

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950 font-sans text-slate-100">
      {/* MAPA PRINCIPAL */}
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={initialCenter}
          zoom={13}
          zoomControl={false}
          className="w-full h-full bg-slate-950"
        >
          {/* TileLayer en Dark Mode (CartoDB Dark Matter) */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png"
          />

          <MapController coords={userLocation} targetPos={mapTarget} />
          <LocationPicker onSelectCoords={handleMapClick} />

          {/* Marcadores de Memorias */}
          {filteredMemories.map((mem) => (
            <Marker
              key={mem.id}
              position={[mem.latitude, mem.longitude]}
              icon={createCustomIcon(mem.visibility)}
              eventHandlers={{
                click: () => {
                  setSelectedMemory(mem);
                  setMapTarget([mem.latitude, mem.longitude]);
                },
              }}
            />
          ))}

          {/* Indicador visual de punto seleccionado en el mapa */}
          {selectedCoords && (
            <Marker
              position={selectedCoords}
              icon={L.divIcon({
                className: 'custom-picker-pin',
                html: `<div className="w-5 h-5 bg-white border-2 border-indigo-500 rounded-full animate-bounce shadow-lg"></div>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10],
              })}
            />
          )}
        </MapContainer>
      </div>

      {/* HEADER SUPERIOR CON BARRA DE BÚSQUEDA Y ACCIONES */}
      <header className="absolute top-4 left-4 right-4 z-10 flex flex-col sm:flex-row items-center justify-between pointer-events-none gap-3">
        <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 p-2.5 px-4 rounded-2xl pointer-events-auto w-full sm:max-w-md shadow-2xl shadow-black/50">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar recuerdos, lugares..."
            className="bg-transparent border-none outline-none text-sm w-full text-slate-100 placeholder-slate-500"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-slate-500 hover:text-slate-300">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 pointer-events-auto shrink-0 self-end sm:self-auto">
          <Link
            href="/memories"
            className="bg-slate-900/80 hover:bg-slate-800/80 backdrop-blur-xl text-slate-200 font-medium px-4 py-2.5 rounded-2xl border border-slate-800 shadow-xl flex items-center gap-2 text-sm transition"
          >
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Lista</span>
          </Link>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 text-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>{selectedCoords ? 'Añadir aquí' : 'Nuevo lugar'}</span>
          </button>
        </div>
      </header>

      {/* BOTÓN RE-CENTRAR NAVEGACIÓN */}
      <div className="absolute bottom-6 left-4 z-10">
        <button
          onClick={centerOnUser}
          className="bg-slate-900/80 hover:bg-slate-800/80 backdrop-blur-xl border border-slate-800 p-3 rounded-2xl shadow-xl text-slate-200 transition"
          title="Mi ubicación"
        >
          <Navigation className="w-5 h-5 text-indigo-400" />
        </button>
      </div>

      {/* PANEL DESPLEGABLE / DRAWER DE DETALLE DE MEMORIA */}
      {selectedMemory && (
        <aside className="absolute bottom-6 right-4 left-4 sm:left-auto sm:w-96 z-20 bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-3xl p-5 shadow-2xl animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                <MapPin className="w-4 h-4" />
              </span>
              <h3 className="font-bold text-base text-slate-100 line-clamp-1">{selectedMemory.title}</h3>
            </div>
            <button
              onClick={() => setSelectedMemory(null)}
              className="text-slate-500 hover:text-slate-300 p-1 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-400 mb-4 line-clamp-3 leading-relaxed">
            {selectedMemory.description || 'Sin descripción adicional.'}
          </p>

          <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-800/80 pt-3">
            <div className="flex items-center gap-1.5">
              {selectedMemory.visibility === 'private' && (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-amber-400 font-medium">Privado</span>
                </>
              )}
              {selectedMemory.visibility === 'shared' && (
                <>
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-indigo-400 font-medium">Compartido</span>
                </>
              )}
              {selectedMemory.visibility === 'public' && (
                <>
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Público</span>
                </>
              )}
            </div>

            {selectedMemory.created_at && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{new Date(selectedMemory.created_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </aside>
      )}

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
