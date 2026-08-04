'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';
import { Memory } from '@/components/MapComponent';

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[calc(100vh-4rem)] bg-zinc-950 flex items-center justify-center text-zinc-500 font-mono text-xs">
      Cargando mapa interactivo...
    </div>
  ),
});

export default function HomePage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    async function loadMemories() {
      try {
        const { data, error } = await supabase
          .from('memories')
          .select('id, title, description, latitude, longitude');

        if (!error && data) {
          setMemories(data);
        }
      } catch (e) {
        console.error('Error cargando recuerdos:', e);
      }
    }

    loadMemories();
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
      <MapComponent memories={memories} />
    </div>
  );
}
