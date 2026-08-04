'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';
import { Memory } from '@/components/MapComponent';

// Carga 100% en el cliente sin SSR
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[calc(100vh-4rem)] bg-zinc-950 flex items-center justify-center text-zinc-500 font-mono text-xs">
      Cargando mapa 3D interactivo...
    </div>
  ),
});

export default function HomePage() {
  const [memories, setMemories] = useState<Memory[]>([]);

  useEffect(() => {
    async function loadMemories() {
      const { data } = await supabase
        .from('memories')
        .select('id, title, description, latitude, longitude');

      if (data) setMemories(data);
    }

    loadMemories();
  }, []);

  return (
    <div className="w-full h-[calc(100vh-4rem)] relative">
      <MapComponent memories={memories} />
    </div>
  );
}
