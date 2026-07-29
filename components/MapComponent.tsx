
'use client';

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import { Utensils, Coffee, BookOpen, Layers, Search, Plus, MapPin, ArrowRight } from 'lucide-react';

// Ajuste para los iconos de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Componente para centrar automáticamente el mapa cuando se obtiene la posición del usuario
function UserLocationCentering({ coords }: { coords: [number, number] | null }) {
  const map = useMap();

  useEffect(() => {
    if (coords) {
      map.flyTo(coords, 14, { animate: true, duration: 1.5 });
    }
  }, [coords, map]);

  return null;
}

const LAYERS = [
  { id: 'memories', label: 'Memorias', icon: BookOpen, color: 'text-purple-600' },
  { id: 'restaurants', label: 'Restaurantes', icon: Utensils, color: 'text-amber-600' },
  { id: 'cafes', label: 'Cafés', icon: Coffee, color: 'text-emerald-600' },
] as const;

// Puntos de prueba
const MOCK_PLACES = [
  { id: 1, type: 'memories', title: 'Atardecer en la terraza', lat: 40.4167, lng: -3.7037, desc: 'Un gran recuerdo grabado aquí.' },
  { id: 2, type: 'restaurants', title: 'Bistró Central', lat: 40.4180, lng: -3.7000, desc: 'Comida excelente.' },
  { id: 3, type: 'cafes', title: 'Café de Especialidad', lat: 40.4150, lng: -3.7080, desc: 'Buen café para trabajar.' },
];

export default function MapComponent() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
    memories: true,
    restaurants: true,
    cafes: true,
  });

  // Intentar obtener la ubicación real del usuario
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.warn('No se pudo obtener la ubicación geográfica:', error.message);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  const toggleLayer = (layerId: string) => {
    setActiveLayers((prev) => ({ ...prev, [layerId]: !prev[layerId] }));
  };

  const filteredPlaces = MOCK_PLACES.filter((place) => activeLayers[place.type]);

  // Centro inicial por defecto (Madrid de respaldo mientras obtiene la ubicación real)
  const initialCenter: [number, number] = userLocation || [40.41678, -3.70379];

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-50 font-sans text-slate-900">
      
      {/* MAPA A PANTALLA COMPLETA CON ESTILO CLARO / BLANCO */}
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={initialCenter}
          zoom={13}
          zoomControl={false}
          className="w-full h-full"
        >
          {/* Capa de mapa clara/blanca (Positron de CARTO) */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          <UserLocationCentering coords={userLocation} />

          {/* Marcador opcional de la ubicación actual del usuario */}
          {userLocation && (
            <Marker position={userLocation}>
              <Popup>
                <div className="p-1 font-medium text-slate-800">
                  📍 Tu ubicación actual
                </div>
              </Popup>
            </Marker>
          )}

          {/* Marcadores filtrados por capas */}
          {filteredPlaces.map((place) => (
            <Marker key={place.id} position={[place.lat, place.lng]}>
              <Popup>
                <div className="p-1 text-slate-900 max-w-xs">
                  <h4 className="font-bold text-sm text-slate-900">{place.title}</h4>
                  <p className="text-xs text-slate-600 mt-1">{place.desc}</p>
                  
                  {/* Vínculo directo a la página de memorias */}
                  <Link 
                    href="/memories"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 mt-2.5 transition"
                  >
                    <span>Ver memorias asociadas</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* BARRA SUPERIOR DE BÚSQUEDA Y NAVEGACIÓN */}
      <header className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none gap-2">
        <div className="flex items-center gap-3 bg-white/90 backdrop-blur-md border border-slate-200/80 p-2.5 px-4 rounded-2xl pointer-events-auto w-full max-w-md shadow-lg shadow-slate-200/50">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input 
            type="text" 
            placeholder="Buscar memorias, restaurantes, cafés..." 
            className="bg-transparent border-none outline-none text-sm w-full text-slate-800 placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 pointer-events-auto shrink-0">
          {/* Botón de acceso directo a Memorias */}
          <Link
            href="/memories"
            className="bg-white/90 hover:bg-white text-slate-700 font-medium px-4 py-2.5 rounded-2xl border border-slate-200 shadow-lg flex items-center gap-2 text-sm transition"
          >
            <BookOpen className="w-4 h-4 text-purple-600" />
            <span className="hidden sm:inline">Memorias</span>
          </Link>

          <button className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-4 py-2.5 rounded-2xl shadow-lg flex items-center gap-2 text-sm transition">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Añadir lugar</span>
          </button>
        </div>
      </header>

      {/* PANEL LATERAL FLOTANTE DE CAPAS */}
      <aside className="absolute top-20 left-4 z-10 w-64 bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-3xl p-4 shadow-xl shadow-slate-200/40">
        <div className="flex items-center gap-2 mb-3">
          <Layers className="w-4 h-4 text-indigo-600" />
          <h2 className="font-semibold text-sm text-slate-800">Filtrar por Capas</h2>
        </div>

        <div className="space-y-1.5">
          {LAYERS.map((layer) => {
            const Icon = layer.icon;
            const isActive = activeLayers[layer.id];

            return (
              <button
                key={layer.id}
                onClick={() => toggleLayer(layer.id)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition ${
                  isActive 
                    ? 'bg-slate-100/80 border-slate-300/80 text-slate-900' 
                    : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${layer.color}`} />
                  <span className="text-xs font-medium">{layer.label}</span>
                </div>
                
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-400'}`}>
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