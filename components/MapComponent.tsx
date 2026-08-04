// components/MapComponent.tsx
'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  Eye,
  Wine,
  ChevronRight,
  Layers,
  PanelLeftClose,
  PanelLeft,
  Navigation,
  MapPin,
  Calendar,
  BookOpen,
} from 'lucide-react';
import L from 'leaflet';

const MapContainer = dynamic(() => import('react-leaflet').then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((m) => m.TileLayer), { ssr: false });
const Polygon = dynamic(() => import('react-leaflet').then((m) => m.Polygon), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then((m) => m.Polyline), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((m) => m.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((m) => m.Popup), { ssr: false });

// Icono personalizado con estética minimalista en lugar del pin azul clásico
const createCustomPin = (color: string) => {
  if (typeof window === 'undefined') return undefined;
  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="
        width: 16px;
        height: 16px;
        background-color: ${color};
        border: 2px solid #ffffff;
        border-radius: 50%;
        box-shadow: 0 0 12px ${color};
        cursor: pointer;
      "></div>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

// Colección ampliada y depurada de Denominaciones de Origen
const WINE_REGIONS = [
  {
    id: 'rioja',
    name: 'D.O.Ca. Rioja',
    type: 'Tintos de Guarda / Blancos',
    color: '#be123c',
    fillColor: '#fda4af',
    coords: [
      [42.55, -2.85],
      [42.60, -2.40],
      [42.45, -2.10],
      [42.15, -2.35],
      [42.25, -2.75],
    ] as [number, number][],
  },
  {
    id: 'ribera',
    name: 'D.O. Ribera del Duero',
    type: 'Tempranillo / Roble',
    color: '#881337',
    fillColor: '#f43f5e',
    coords: [
      [41.75, -4.10],
      [41.80, -3.35],
      [41.65, -3.15],
      [41.50, -3.50],
      [41.55, -4.10],
    ] as [number, number][],
  },
  {
    id: 'priorat',
    name: 'D.O.Q. Priorat',
    type: 'Garnacha / Licorella',
    color: '#d97706',
    fillColor: '#fcd34d',
    coords: [
      [41.25, 0.70],
      [41.32, 0.88],
      [41.18, 0.95],
      [41.12, 0.78],
    ] as [number, number][],
  },
  {
    id: 'riasbaixas',
    name: 'D.O. Rías Baixas',
    type: 'Albariño / Atlántico',
    color: '#0284c7',
    fillColor: '#7dd3fc',
    coords: [
      [42.50, -8.85],
      [42.60, -8.65],
      [42.30, -8.50],
      [42.20, -8.80],
    ] as [number, number][],
  },
  {
    id: 'jerez',
    name: 'D.O. Jerez-Xérès-Sherry',
    type: 'Generosos / Palomino',
    color: '#ca8a04',
    fillColor: '#fef08a',
    coords: [
      [36.80, -6.20],
      [36.85, -6.00],
      [36.60, -5.90],
      [36.55, -6.25],
    ] as [number, number][],
  },
];

// Memorias reales en mapa (Coherencia estricta con la sección 'Memories')
const MEMORY_ROUTES = [
  {
    id: 'm1',
    title: 'Cata Privada en Bodegas Ysios',
    date: '14 Oct 2025',
    region: 'D.O.Ca. Rioja',
    coords: [42.562, -2.618] as [number, number],
    wine: 'Las Viñas de Gain 2019',
    note: 'Notas minerales profundas y arquitectura impresionante al atardecer.',
  },
  {
    id: 'm2',
    title: 'Paseo por los Viñedos de Haro',
    date: '15 Oct 2025',
    region: 'D.O.Ca. Rioja',
    coords: [42.578, -2.848] as [number, number],
    wine: 'Viña Tondonia Reserva',
    note: 'Cata directa en calado subterráneo centenario.',
  },
  {
    id: 'm3',
    title: 'Maridaje en Laguardia',
    date: '16 Oct 2025',
    region: 'D.O.Ca. Rioja',
    coords: [42.553, -2.583] as [number, number],
    wine: 'Aro Muga 2021',
    note: 'Cena gastronómica en la villa amurallada.',
  },
];

// Generar coordenadas de ruta conectada
const routeCoordinates = MEMORY_ROUTES.map((m) => m.coords);

export default function MapComponent() {
  const [showRegions, setShowRegions] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [isOpen, setIsOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="w-full h-full relative overflow-hidden bg-zinc-950">
      {/* Botón Flotante para Abrir/Cerrar Panel */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="absolute top-4 left-4 z-[999] p-3 rounded-xl bg-zinc-900/90 border border-zinc-800/90 text-zinc-200 hover:text-white hover:bg-zinc-800/90 shadow-2xl backdrop-blur-md transition-all cursor-pointer"
        aria-label="Toggle Navigation Panel"
      >
        {isOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
      </button>

      {/* Panel Flotante Glassmorphism */}
      <aside
        className={`absolute top-4 left-4 bottom-4 w-84 z-[900] bg-zinc-950/85 backdrop-blur-2xl border border-zinc-800/80 rounded-2xl shadow-2xl flex flex-col transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0 opacity-100 pointer-events-auto' : '-translate-x-[calc(100%+2rem)] opacity-0 pointer-events-none'
        }`}
      >
        <div className="p-5 pt-14 space-y-6 overflow-y-auto flex-1 scrollbar-none">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
                <Wine className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white tracking-wide">Cartografía Vinícola</h2>
                <p className="text-[10px] text-zinc-400">Exploración gráfica de memorias</p>
              </div>
            </div>
          </div>

          {/* Selector de Capas */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Capas del Mapa
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setShowRegions(!showRegions)}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                  showRegions
                    ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                    : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-500'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>D.O. Regiones</span>
                </div>
                <Eye className="w-3.5 h-3.5 opacity-70" />
              </button>

              <button
                type="button"
                onClick={() => setShowRoutes(!showRoutes)}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                  showRoutes
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                    : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-500'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Rutas Memorias</span>
                </div>
                <Eye className="w-3.5 h-3.5 opacity-70" />
              </button>
            </div>
          </div>

          {/* Listado de Memorias Vinculadas */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                Memorias en esta Ruta
              </span>
              <span className="text-[10px] text-amber-400 font-mono font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                {MEMORY_ROUTES.length} Registros
              </span>
            </div>

            <div className="space-y-2">
              {MEMORY_ROUTES.map((mem) => (
                <div
                  key={mem.id}
                  className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/60 hover:border-amber-500/40 transition cursor-pointer group space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-medium text-amber-400/90 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {mem.date}
                    </span>
                    <span className="text-[10px] text-zinc-500">{mem.region}</span>
                  </div>
                  <h4 className="text-xs font-bold text-zinc-100 group-hover:text-amber-300 transition">
                    {mem.title}
                  </h4>
                  <p className="text-[11px] text-zinc-400 line-clamp-1 italic">"{mem.wine}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Visor Cartográfico Principal */}
      <div className="w-full h-full">
        {mounted ? (
          <MapContainer
            center={[40.416, -3.703]}
            zoom={6}
            zoomControl={false}
            style={{ width: '100%', height: '100%', background: '#09090b' }}
          >
            {/* Mapa base oscuro retina en alta definición */}
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              maxZoom={19}
            />

            {/* Renderizado de Polígonos de D.O. */}
            {showRegions &&
              WINE_REGIONS.map((region) => (
                <Polygon
                  key={region.id}
                  positions={region.coords}
                  pathOptions={{
                    color: region.color,
                    fillColor: region.fillColor,
                    fillOpacity: 0.22,
                    weight: 1.5,
                  }}
                >
                  <Popup className="custom-leaflet-popup">
                    <div className="p-1 max-w-[200px]">
                      <h3 className="text-xs font-bold text-zinc-900">{region.name}</h3>
                      <p className="text-[11px] text-zinc-600 mt-0.5">{region.type}</p>
                    </div>
                  </Popup>
                </Polygon>
              ))}

            {/* Trazo de Ruta de Memorias */}
            {showRoutes && (
              <>
                <Polyline
                  positions={routeCoordinates}
                  pathOptions={{
                    color: '#f59e0b',
                    weight: 2.5,
                    opacity: 0.85,
                    dashArray: '6, 6',
                  }}
                />

                {/* Pins interactivos de las memorias de la ruta */}
                {MEMORY_ROUTES.map((mem) => (
                  <Marker
                    key={mem.id}
                    position={mem.coords}
                    icon={createCustomPin('#f59e0b')}
                  >
                    <Popup className="custom-leaflet-popup">
                      <div className="p-2 space-y-1.5 max-w-[220px]">
                        <div className="flex items-center justify-between text-[10px] text-amber-600 font-bold">
                          <span>{mem.date}</span>
                          <span>{mem.region}</span>
                        </div>
                        <h4 className="text-xs font-bold text-zinc-900 leading-tight">
                          {mem.title}
                        </h4>
                        <div className="text-[11px] text-zinc-700 bg-amber-50 p-1.5 rounded border border-amber-200">
                          <strong>Vino:</strong> {mem.wine}
                        </div>
                        <p className="text-[10px] text-zinc-500 italic">"{mem.note}"</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </>
            )}
          </MapContainer>
        ) : (
          <div className="w-full h-full bg-zinc-950 flex items-center justify-center text-zinc-500 font-mono text-xs">
            Cargando motor gráfico del mapa...
          </div>
        )}
      </div>
    </div>
  );
}
