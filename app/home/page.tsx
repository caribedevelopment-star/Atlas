'use client';

import dynamic from 'next/dynamic';
import { AppShell } from '@/components/app-shell';

// Carga el mapa de forma dinámica (solo cliente) con fondo claro y geolocalización
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center text-slate-500 font-sans text-sm">
      Obteniendo ubicación y cargando mapa...
    </div>
  ),
});

export default function HomePage() {
  return (
    <AppShell>
      <div className="relative w-full h-[calc(100vh-4rem)] overflow-hidden bg-slate-50">
        <MapComponent />
      </div>
    </AppShell>
  );
}
