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
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
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

  // Cargar memorias reales desde Supabase
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

  // Guardar nueva memoria en la BD
  const handleAddMemory = async (formData: { title: string; desc: string; visibility: VisibilityMode; sharedWith: string[] }) => {
    const lat = userLocation ? userLocation[0] : 40.4167;
    const lng = userLocation ? userLocation[1] : -3.7037;

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
    }
  };

  const initialCenter: [number, number] = userLocation || [40.41678, -3.70379];

  return (
    <div className="relative h-full w-full overflow-hidden bg-slate-50 font-sans text-slate-900">
      <div className="absolute inset-0 z-0">
        <MapContainer center={initialCenter} zoom={13} zoomControl={false} className="h-full w-full">
          <TileLayer
            attribution='&copy; CARTO'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <UserLocationCentering coords={userLocation} />

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
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <header className="pointer-events-none absolute inset-x-3 top-3 z-10 flex flex-col gap-2 sm:inset-x-4 sm:top-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="pointer-events-auto flex min-w-0 items-center gap-2 rounded-2xl border border-slate-200 bg-white/90 px-3 py-2.5 shadow-lg backdrop-blur-md sm:max-w-md sm:gap-3 sm:px-4">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input type="text" placeholder="Buscar memorias..." className="min-w-0 flex-1 border-none bg-transparent text-sm text-slate-800 outline-none placeholder-slate-400" />
        </div>

        <div className="pointer-events-auto grid grid-cols-[auto_1fr] gap-2 sm:flex sm:shrink-0 sm:items-center">
          <Link href="/memories" className="flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/90 px-3 py-2.5 text-sm font-medium text-slate-700 shadow-lg backdrop-blur-md sm:px-4">
            <BookOpen className="w-4 h-4 text-purple-600" />
            <span className="hidden sm:inline">Memorias</span>
          </Link>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-3 py-2.5 text-sm font-medium text-white shadow-lg transition hover:bg-slate-800 active:scale-[0.99] sm:px-4"
          >
            <Plus className="w-4 h-4" />
            <span className="truncate">Añadir lugar</span>
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