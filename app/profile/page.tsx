'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import NetworkCircles, { NetworkUser } from '@/components/profile/NetworkCircles';
import { fetchUserNetwork } from '@/lib/network';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState<{ username: string; avatar_url?: string }>({
    username: 'alessandro',
  });
  const [networkUsers, setNetworkUsers] = useState<NetworkUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initProfile() {
      // Intentar obtener usuario en sesión, o usar usuario predeterminado
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;

      const activeUsername = user?.user_metadata?.username || user?.email?.split('@')[0] || 'alessandro';
      const activeUserId = user?.id || 'demo-user-id';

      setCurrentUser({
        username: activeUsername,
        avatar_url: user?.user_metadata?.avatar_url,
      });

      // Cargar red de usuarios
      const network = await fetchUserNetwork(activeUserId);
      setNetworkUsers(network);
      setLoading(false);
    }

    initProfile();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 backdrop-blur-md">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Tu Red & Círculos</h2>
            <p className="text-xs text-zinc-400">Órbitas de interacción en Atlas</p>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-xs font-mono text-zinc-500">
            Cargando órbitas de red...
          </div>
        ) : (
          <NetworkCircles
            currentUser={currentUser}
            users={networkUsers}
            onSelectUser={(u) => console.log('Usuario seleccionado:', u)}
          />
        )}
      </div>
    </div>
  );
}
