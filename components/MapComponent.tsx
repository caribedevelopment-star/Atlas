
'use client';

import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Utensils, Coffee, BookOpen, Layers, Search, Plus } from 'lucide-react';

// Ajuste para los iconos por defecto de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// 1. Definimos las capas disponibles
const LAYERS = [
  { id: 'memories', label: 'Memorias', icon: BookOpen, color: 'text-purple-400' },
  { id: 'restaurants', label: 'Restaurantes', icon: Utensils, color: 'text-amber-400' },
  { id: 'cafes', label: 'Cafés', icon: Coffee, color: 'text-emerald-400' },
] as const;

type LayerId = (typeof LAYERS)[number]['id'];

// 2. Lugares de prueba
const MOCK_PLACES = [
  { id: 1, type: 'memories', title: 'Atardecer en la terraza', lat: 40.4167, lng: -3.7037, desc: 'Un gran recuerdo.' },
  { id: 2, type: 'restaurants', title: 'Bistró Central', lat: 40.4180, lng: -3.7000, desc: 'Comida excelente.' },
  { id: 3, type: 'cafes', title: 'Café de Especialidad', lat: 40.4150, lng: -3.7080, desc: 'Buen café para trabajar.' },
];

export default function MapComponent() {
  // Estado para las capas activas
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
    memories: true,
    restaurants: true,
    cafes: true,
  });

  // Activar o desactivar una capa
  const toggleLayer = (layerId: string) => {
    setActiveLayers((prev) => ({ ...prev, [layerId]: !prev[layerId] }));
  };

  // Filtrar puntos según las capas activas
  const filteredPlaces = MOCK_PLACES.filter((place) => activeLayers[place.type]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      
      {/* MAPA A PANTALLA COMPLETA */}
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={[40.41678, -3.70379]}
          zoom={13}
          zoomControl={false}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; CARTO'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {filteredPlaces.map((place) => (
            <Marker key={place.id} position={[place.lat, place.lng]}>
              <Popup>
                <div className="p-1 text-slate-900">
                  <h4 className="font-bold text-sm">{place.title}</h4>
                  <p className="text-xs">{place.desc}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* BARRA SUPERIOR DE BÚSQUEDA */}
      <header className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur-md border border-slate-800 p-2.5 px-4 rounded-2xl pointer-events-auto w-full max-w-md shadow-2xl">
          <Search className="w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar memorias, restaurantes..." 
            className="bg-transparent border-none outline-none text-sm w-full text-slate-200 placeholder-slate-500"
          />
        </div>

        <button className="bg-emerald-500 text-slate-950 font-semibold px-4 py-2.5 rounded-2xl shadow-lg flex items-center gap-2 text-sm pointer-events-auto hover:bg-emerald-400 transition">
          <Plus className="w-4 h-4" />
          <span>Añadir lugar</span>
        </button>
      </header>

      {/* PANEL LATERAL DE CAPAS */}
      <aside className="absolute top-20 left-4 z-10 w-72 bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-5 shadow-2xl">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="w-5 h-5 text-indigo-400" />
          <h2 className="font-semibold text-base">Capas</h2>
        </div>

        <div className="space-y-2">
          {LAYERS.map((layer) => {
            const Icon = layer.icon;
            const isActive = activeLayers[layer.id];

            return (
              <button
                key={layer.id}
                onClick={() => toggleLayer(layer.id)}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border transition ${
                  isActive 
                    ? 'bg-slate-800 border-slate-700 text-slate-100' 
                    : 'bg-slate-950/40 border-transparent text-slate-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${layer.color}`} />
                  <span className="text-sm font-medium">{layer.label}</span>
                </div>
                
                <span className={`text-xs px-2 py-0.5 rounded-full ${isActive ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-500'}`}>
                  {isActive ? 'On' : 'Off'}
                </span>
              </button>
            );
          })}
        </div>
      </aside>

    </div>
  );
}