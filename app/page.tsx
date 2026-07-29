'use client';

import dynamic from 'next/dynamic';
import { AppShell } from '@/components/app-shell';

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[calc(100vh-4rem)] bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
      Cargando mapa...
    </div>
  ),
});

export default function HomePage() {
  return (
    <AppShell>
      <div className="relative w-full h-[calc(100vh-4rem)] overflow-hidden bg-slate-950">
        <MapComponent />
      </div>
    </AppShell>
  );
}
