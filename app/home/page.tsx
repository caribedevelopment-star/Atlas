// app/home/page.tsx
'use client';

import dynamic from 'next/dynamic';
import { AppShell } from '@/components/app-shell';

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[calc(100vh-4rem)] bg-zinc-950 flex items-center justify-center text-zinc-500 font-mono text-xs">
      Cargando mapa interactivo...
    </div>
  ),
});

export default function HomePage() {
  return (
    <AppShell>
      <div className="w-full h-[calc(100vh-4rem)] relative">
        <MapComponent />
      </div>
    </AppShell>
  );
}