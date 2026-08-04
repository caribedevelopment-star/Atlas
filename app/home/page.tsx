'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[calc(100vh-4rem)] bg-zinc-950 flex items-center justify-center text-zinc-500 font-mono text-xs">
      Cargando mapa interactivo...
    </div>
  ),
});

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-[calc(100vh-4rem)] bg-zinc-950 flex items-center justify-center text-zinc-500 font-mono text-xs">
        Iniciando mapa...
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-4rem)] relative">
      <MapComponent />
    </div>
  );
}
