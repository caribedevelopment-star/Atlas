'use client';

import dynamic from 'next/dynamic';
import { AppShell } from '@/components/app-shell';

// Carga el mapa de forma dinámica (solo cliente) con fondo claro y geolocalización
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[calc(100dvh-7rem)] w-full items-center justify-center bg-slate-50 px-4 text-center font-sans text-sm text-slate-500 sm:h-[calc(100dvh-6rem)]">
      Obteniendo ubicación y cargando mapa...
    </div>
  ),
});

export default function HomePage() {
  return (
    <AppShell>
      <div className="relative h-[calc(100dvh-7rem)] w-full overflow-hidden bg-slate-50 sm:h-[calc(100dvh-6rem)]">
        <MapComponent />
      </div>
    </AppShell>
  );
}
