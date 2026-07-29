
'use client';

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import { Utensils, Coffee, BookOpen, Layers, Search, Plus, ArrowRight, Lock, Globe, Users } from 'lucide-react';
import CreateMemoryModal, { VisibilityMode, Friend } from './CreateMemoryModal';

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

// Lista de amigos de prueba
const MOCK_FRIENDS: Friend[] = [
  { id: 'usr_1', name: 'Camila' },
  { id: 'usr_2', name: 'Santiago' },
  { id: 'usr_3', name: 'Carlos' },
];

export default function MapComponent() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Lista de memorias creadas
  const [memories, setMemories] = useState([
    {
      id: 1,
      title: 'Atardecer en el mirador',
      desc: 'Un gran recuerdo grabado aquí.',
      lat: 40.4167,
      lng: -3.7037,
      visibility: 'public' as VisibilityMode,
      sharedWith: [] as string[],
    },
  ]);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
        (err) => console.warn(err.message),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  const handleAddMemory = (data: { title: string; desc: string; visibility: VisibilityMode; sharedWith: string[] }) => {
    // Si tenemos la ubicación del usuario se guarda ahí, si no en el centro por defecto
    const lat = userLocation ? userLocation[0] : 40.4167;
    const lng = userLocation ? userLocation[1] : -3.7037;

    const newMem = {
      id: Date.now(),
      title: data.title,
      desc: data.desc,
      lat,
      lng,
      visibility: data.visibility,
      sharedWith: data.sharedWith,
    };

    setMemories((prev) => [newMem, ...prev]);
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

          {memories.map((mem) => (
            <Marker key={mem.id} position={[mem.lat, mem.lng]}>
              <Popup>
                <div className="p-1 text-slate-900 max-w-xs">
                  <div className="flex items-center gap-1.5 mb-1">
                    <h4 className="font-bold text-sm text-slate-900">{mem.title}</h4>
                    {mem.visibility === 'private' && <Lock className="w-3 h-3 text-amber-600" />}
                    {mem.visibility === 'shared' && <Users className="w-3 h-3 text-indigo-600" />}
                    {mem.visibility === 'public' && <Globe className="w-3 h-3 text-emerald-600" />}
                  </div>
                  <p className="text-xs text-slate-600">{mem.desc}</p>
                  
                  <div className="mt-2 text-[10px] text-slate-400 font-medium">
                    {mem.visibility === 'private' && '🔒 Solo visible por ti'}
                    {mem.visibility === 'public' && '🌐 Visible para todos'}
                    {mem.visibility === 'shared' && `👥 Compartido con ${mem.sharedWith.length} amigo(s)`}
                  </div>
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
            <span className="hidden sm:inline">Ver todas</span>
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

      {/* MODAL DE NUEVA MEMORIA CON PRIVACIDAD */}
      <CreateMemoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        availableFriends={MOCK_FRIENDS}
        onSubmit={handleAddMemory}
      />
    </div>
  );
}