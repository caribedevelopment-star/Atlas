'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import NetworkCircles, { NetworkUser } from '@/components/profile/NetworkCircles';
import { fetchUserNetwork } from '@/lib/network';
import { MapPin, Globe, Compass, Edit3, LogOut } from 'lucide-react';

interface ProfileData {
  full_name: string;
  username: string;
  bio: string;
  city: string;
  country: string;
  avatar_url?: string;
  stats: {
    memories_count: number;
    countries_count: number;
    cities_count: number;
  };
}

export default function ProfileDashboard() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [networkUsers, setNetworkUsers] = useState<NetworkUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      if (user) {
        // Carga de perfil y estadísticas desde Supabase
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        const network = await fetchUserNetwork(user.id);

        setProfile({
          full_name: prof?.full_name || 'Alessandro',
          username: prof?.username || 'alessandro',
          bio: prof?.bio || 'Diseño, arquitectura y exploración espacial.',
          city: prof?.city || 'Madrid',
          country: prof?.country || 'España',
          avatar_url: prof?.avatar_url || user.user_metadata?.avatar_url,
          stats: {
            memories_count: 24,
            countries_count: 5,
            cities_count: 12,
          },
        });
        setNetworkUsers(network);
      }
      setLoading(false);
    }

    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center text-zinc-500 font-mono text-xs">
        Cargando expediente Atlas...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 selection:bg-zinc-800 pb-20">
      
      {/* HEADER DE PERFIL (Estilo Notion / Apple Journal) */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-zinc-800 border border-zinc-700/60 overflow-hidden shadow-2xl flex items-center justify-center font-bold text-white text-xl">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
              ) : (
                profile?.username.substring(0, 2).toUpperCase()
              )}
            </div>

            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {profile?.full_name}
              </h1>
              <p className="text-xs font-mono text-zinc-400">@{profile?.username}</p>
              <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono pt-1">
                <MapPin className="w-3 h-3 text-emerald-400" />
                <span>{profile?.city}, {profile?.country}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => supabase.auth.signOut()}
            className="px-3.5 py-2 bg-zinc-950/60 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white text-xs font-mono rounded-xl transition flex items-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5 text-zinc-500" /> Cerrar Sesión
          </button>
        </div>

        {profile?.bio && (
          <p className="text-xs text-zinc-300 mt-6 leading-relaxed max-w-xl font-normal">
            {profile.bio}
          </p>
        )}

        {/* METRICAS DE EXPLORACION (Estilo Polarsteps) */}
        <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-zinc-800/60">
          <div className="bg-zinc-950/40 p-3 sm:p-4 rounded-2xl border border-zinc-800/40 text-center">
            <span className="block text-lg sm:text-xl font-mono font-bold text-white">
              {profile?.stats.memories_count}
            </span>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Recuerdos</span>
          </div>

          <div className="bg-zinc-950/40 p-3 sm:p-4 rounded-2xl border border-zinc-800/40 text-center">
            <span className="block text-lg sm:text-xl font-mono font-bold text-amber-400">
              {profile?.stats.countries_count}
            </span>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Países</span>
          </div>

          <div className="bg-zinc-950/40 p-3 sm:p-4 rounded-2xl border border-zinc-800/40 text-center">
            <span className="block text-lg sm:text-xl font-mono font-bold text-emerald-400">
              {profile?.stats.cities_count}
            </span>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Ciudades</span>
          </div>
        </div>
      </div>

      {/* SECCIÓN RED Y CÍRCULOS (Componente Orbital) */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 backdrop-blur-xl">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-white tracking-tight">Tu Círculo & Red</h2>
          <p className="text-xs text-zinc-400">Relaciones de visibilidad compartida en Atlas</p>
        </div>

        {profile && (
          <NetworkCircles
            currentUser={{ username: profile.username, avatar_url: profile.avatar_url }}
            users={networkUsers}
          />
        )}
      </div>
    </div>
  );
}
