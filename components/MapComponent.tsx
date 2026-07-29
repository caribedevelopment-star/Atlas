
'use client';

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import { BookOpen, Search, Plus, Lock, Globe, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import CreateMemoryModal, { VisibilityMode } from './CreateMemoryModal';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function UserLocationCentering({ coords }: { coords: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.flyTo(coords, 14, { animate: true, duration: 1.5 });
  }, [coords, map]);
  return null;
}

export default function MapComponent() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [memories, setMemories] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // 1. Cargar usuario actual y memorias reales de la BD
  useEffect(() => {
    // Obtener sesión activa
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setCurrentUser(data.user);
    });

    // Cargar memorias según políticas de RLS
    fetchMemories();

    // Obtener geolocalización
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

  // 2. Guardar nueva memoria real en la base de datos
  const handleAddMemory = async (formData: { title: string; desc: string; visibility: VisibilityMode; sharedWith: string[] }) => {
    if (!currentUser) {
      alert('Debes estar autenticado para guardar una memoria.');
      return;
    }

    const lat = userLocation ? userLocation[0] : 40.4167;
    const lng = userLocation ? userLocation[1] : -3.7037;

    const { data, error } = await supabase.from('memories').insert([
      {
        user_id: currentUser.id,
        author_name: currentUser.user_metadata?.full_name || currentUser.email || 'Usuario',
        title: formData.title,
        description: formData.desc,
        latitude: lat,
        longitude: lng,
        visibility: formData.visibility,
        shared_with: formData.sharedWith,
      },
    ]).select();

    if (error) {
      alert('Error al guardar la memoria: ' + error.message);
    } else if (data) {
      setMemories((prev) => [data[0], ...prev]);
    }
  };

  const initialCenter: [number, number] = userLocation || [40.41678, -3.70379];

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-50 font-sans text-slate-900">
      <div className="absolute inset-0 z-0">
        <MapContainer center={initialCenter} zoom={13} zoomControl={false} className="w-full h-full">
          <TileLayer
            attribution='&copy; CARTO'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <UserLocationCentering coords={userLocation} />

          {/* Marcadores reales de Supabase */}
          {memories.map((mem) => (
            <Marker key={mem.id} position={[mem.latitude, mem.longitude]}>
              <Popup>
                <div className="p-1 text-slate-900 max-w-xs">
                  <div className="flex items-center gap-1.5 mb-1">
                    <h4 className="font-bold text-sm text-slate-900">{mem.title}</h4>
                    {mem.visibility === 'private' && <Lock className="w-3 h-3 text-amber-600" />}
                    {mem.visibility === 'shared' && <Users className="w-3 h-3 text-indigo-600" />}
                    {mem.visibility === 'public' && <Globe className="w-3 h-3 text-emerald-600" />}
                  </div>
                  <p className="text-xs text-slate-600">{mem.description}</p>
                  <p className="text-[10px] text-slate-400 mt-2 font-medium">Por: {mem.author_name}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* BARRA SUPERIOR */}
      <header className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none gap-2">
        <div className="flex items-center gap-3 bg-white/90 backdrop-blur-md border border-slate-200 p-2.5 px-4 rounded-2xl pointer-events-auto w-full max-w-md shadow-lg">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input type="text" placeholder="Buscar memorias..." className="bg-transparent border-none outline-none text-sm w-full text-slate-800 placeholder-slate-400" />
        </div>

        <div className="flex items-center gap-2 pointer-events-auto shrink-0">
          <Link href="/memories" className="bg-white/90 text-slate-700 font-medium px-4 py-2.5 rounded-2xl border border-slate-200 shadow-lg flex items-center gap-2 text-sm">
            <BookOpen className="w-4 h-4 text-purple-600" />
            <span className="hidden sm:inline">Memorias</span>
          </Link>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-4 py-2.5 rounded-2xl shadow-lg flex items-center gap-2 text-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir lugar</span>
          </button>
        </div>
      </header>

      <CreateMemoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        availableFriends={[]}
        onSubmit={handleAddMemory}
      />
    </div>
  );
}
