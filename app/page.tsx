
'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { Search, Plus } from 'lucide-react';

// Cargamos el mapa sin renderizado en el servidor (SSR: false)
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-950 flex items-center justify-center text-slate-400 font-sans text-sm">
      Cargando mapa interactivo...
    </div>
  ),
});

export default function HomePage() {
  return (
    <AppShell>
      <div className="relative w-full h-[calc(100vh-4rem)] overflow-hidden bg-slate-950 font-sans text-slate-100">
        
        {/* 1. MAPA DE FONDO A PANTALLA COMPLETA */}
        <div className="absolute inset-0 z-0">
          <MapComponent />
        </div>

        {/* 2. BARRA SUPERIOR SOBREPUESTA (BÚSQUEDA Y ACCIÓN) */}
        <header className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none gap-2">
          <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-2.5 px-4 rounded-2xl shadow-2xl pointer-events-auto w-full max-w-sm">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input 
              type="text" 
              placeholder="Buscar memorias, restaurantes, cafés..." 
              className="bg-transparent border-none outline-none text-xs sm:text-sm w-full text-slate-200 placeholder-slate-500"
            />
          </div>

          <button className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold px-3 py-2.5 rounded-2xl shadow-lg flex items-center gap-1.5 text-xs sm:text-sm transition pointer-events-auto shrink-0">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Añadir lugar</span>
          </button>
        </header>

      </div>
    </AppShell>
  );
}
