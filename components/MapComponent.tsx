// components/MapComponent.tsx
'use client';

import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Polyline, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Eye, Wine, MapPin, Search, ChevronRight, Layers, PanelLeftClose, PanelLeft, Navigation } from 'lucide-react';

// Icono personalizado para marcadores
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Coordenadas aproximadas de Polígonos de Regiones (D.O. / AOC)
const REGION_POLYGONS: Record<string, [number, number][]> = {
  rioja: [
    [42.55, -2.85],
    [42.60, -2.40],
    [42.30, -2.10],
    [42.15, -2.50],
    [42.35, -2.90],
  ],
  ribera: [
    [41.75, -4.10],
    [41.80, -3.30],
    [41.60, -3.30],
    [41.55, -4.10],
  ],
  bordeaux: [
    [45.10, -0.70],
    [45.10, -0.10],
    [44.50, -0.10],
    [44.50, -0.70],
  ],
};

// Rutas de viajes (Conectando coordenadas de memorias)
const TRAVEL_ROUTES = [
  {
    id: 'route-1',
    title: 'Ruta por la Rioja Alta & Alavesa',
    coordinates: [
      [42.465, -2.445], // Logroño
      [42.518, -2.585], // Haro
      [42.562, -2.618], // Laguardia
    ] as [number, number][],
    memoriesCount: 3,
  },
  {
    id: 'route-2',
    title: 'Escapada Ribera del Duero',
    coordinates: [
      [41.652, -4.728], // Valladolid
      [41.670, -3.689], // Aranda de Duero
      [41.583, -3.256], // Peñafiel
    ] as [number, number][],
    memoriesCount: 2,
  },
];

const WINE_REGIONS = [
  { id: 'rioja', name: 'D.O.Ca. Rioja', country: 'España', type: 'Tinto / Blanco', lat: 42.46, lng: -2.44 },
  { id: 'ribera', name: 'D.O. Ribera del Duero', country: 'España', type: 'Tinto', lat: 41.67, lng: -3.68 },
  { id: 'bordeaux', name: 'AOC Bordeaux', country: 'Francia', type: 'Tinto / Blanco', lat: 44.83, lng: -0.57 },
];

export default function MapComponent() {
  const [activeTab, setActiveTab] = useState<'wines' | 'memories' | 'routes'>('wines');
  const [showRegions, setShowRegions] = useState(true);
  const [showTrips, setShowTrips] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="w-full h-full relative overflow-hidden bg-zinc-950">
      
      {/* BOTÓN FLOTANTE SIDEBAR */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="absolute top-4 left-4 z-[500] p-2.5 rounded-2xl bg-zinc-900/90 border border-zinc-700/60 text-zinc-200 hover:text-white shadow-2xl backdrop-blur-xl transition-all"
      >
        {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
      </button>

      {/* PANEL LATERAL FLOTANTE (GLASSMORPHISM) */}
      <aside
        className={`absolute top-4 left-4 bottom-4 w-80 z-[400] bg-zinc-950/85 backdrop-blur-2xl border border-zinc-800/80 rounded-3xl shadow-2xl flex flex-col transition-all duration-300 transform ${
          isSidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-[calc(100%+2rem)] opacity-0 pointer-events-none'
        }`}
      >
        <div className="p-5 pt-14 space-y-5 overflow-y-auto flex-1 scrollbar-none">
          
          {/* Header del Panel */}
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Wine className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold text-white tracking-wide">Atlas Interactivo</h2>
            </div>
            <span className="text-[10px] bg-amber-500/10 text-amber-400 font-semibold px-2 py-0.5 rounded-full border border-amber-500/20">
              Live Map
            </span>
          </div>

          {/* Toggle de Capas */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Capas Visibles
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowRegions(!showRegions)}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                  showRegions
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-500'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Regiones</span>
                </div>
                <Eye className="w-3.5 h-3.5 opacity-70" />
              </button>

              <button
                onClick={() => setShowTrips(!showTrips)}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                  showTrips
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-500'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Rutas</span>
                </div>
                <Eye className="w-3.5 h-3.5 opacity-70" />
              </button>
            </div>
          </div>

          {/* Tabs Selector */}
          <div className="flex bg-zinc-900/80 p-1 rounded-2xl border border-zinc-800/80">
            <button
              onClick={() => setActiveTab('wines')}
              className={`flex-1 py-1.5 text-[11px] font-bold rounded-xl transition-all ${
                activeTab === 'wines'
                  ? 'bg-zinc-800 text-amber-300 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Vinos
            </button>
            <button
              onClick={() => setActiveTab('routes')}
              className={`flex-1 py-1.5 text-[11px] font-bold rounded-xl transition-all ${
                activeTab === 'routes'
                  ? 'bg-zinc-800 text-amber-300 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Rutas ({TRAVEL_ROUTES.length})
            </button>
          </div>

          {/* Buscador */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar región, vino o ruta..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-amber-500/50 transition"
            />
          </div>

          {/* LISTADO SEGÚN PESTAÑA */}
          <div className="space-y-2">
            {activeTab === 'wines' &&
              WINE_REGIONS.map((region) => (
                <div
                  key={region.id}
                  className="p-3 rounded-2xl bg-zinc-900/50 border border-zinc-800/60 hover:border-amber-500/40 transition cursor-pointer flex items-center justify-between group"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition">
                        {region.name}
                      </h4>
                    </div>
                    <p className="text-[11px] text-zinc-400 pl-4">{region.country} • {region.type}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-amber-400 transition" />
                </div>
              ))}

            {activeTab === 'routes' &&
              TRAVEL_ROUTES.map((route) => (
                <div
                  key={route.id}
                  className="p-3 rounded-2xl bg-zinc-900/50 border border-zinc-800/60 hover:border-amber-500/40 transition cursor-pointer flex items-center justify-between group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Navigation className="w-3.5 h-3.5 text-amber-400" />
                      <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition">
                        {route.title}
                      </h4>
                    </div>
                    <p className="text-[11px] text-zinc-400 pl-5.5">
                      {route.memoriesCount} memorias conectadas
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-amber-400 transition" />
                </div>
              ))}
          </div>

        </div>
      </aside>

      {/* MAPA REAL (Leaflet Vector Canvas) */}
      <div className="w-full h-full z-10">
        <MapContainer
          center={[42.0, -3.5]}
          zoom={7}
          zoomControl={false}
          className="w-full h-full"
        >
          <ZoomControl position="bottomright" />

          {/* Capa de Azulejos Oscuros Elegant CartoDB */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />

          {/* DELIMITACIÓN DE REGIONES (POLÍGONOS) */}
          {showRegions &&
            Object.entries(REGION_POLYGONS).map(([key, coords]) => (
              <Polygon
                key={key}
                positions={coords}
                pathOptions={{
                  color: '#f59e0b',
                  fillColor: '#d97706',
                  fillOpacity: 0.2,
                  weight: 2,
                  dashArray: '4, 4',
                }}
              />
            ))}

          {/* RUTAS CONECTADAS A MEMORIAS (POLYLINES) */}
          {showTrips &&
            TRAVEL_ROUTES.map((route) => (
              <React.Fragment key={route.id}>
                <Polyline
                  positions={route.coordinates}
                  pathOptions={{
                    color: '#fbbf24',
                    weight: 3,
                    opacity: 0.8,
                  }}
                />
                {route.coordinates.map((point, idx) => (
                  <Marker key={idx} position={point} icon={customIcon}>
                    <Popup>
                      <div className="text-xs font-sans text-zinc-900">
                        <strong>Punto {idx + 1} de la ruta</strong>
                        <p>{route.title}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </React.Fragment>
            ))}
        </MapContainer>
      </div>

    </div>
  );
}
