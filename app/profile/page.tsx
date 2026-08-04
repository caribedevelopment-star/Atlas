'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import NetworkCircles, { NetworkUser } from '@/components/profile/NetworkCircles';
import { fetchUserNetwork } from '@/lib/network';
import { useRouter } from 'next/navigation';
import { MapPin, LogOut, Edit3, Save, X, Sparkles } from 'lucide-react';

interface ProfileData {
  id: string;
  full_name: string;
  username: string;
  bio: string;
  city: string;
  country: string;
  avatar_url?: string;
  stats?: {
    memories_count: number;
    countries_count: number;
    cities_count: number;
  };
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [networkUsers, setNetworkUsers] = useState<NetworkUser[]>([]);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<ProfileData>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function loadUserData() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      const userId = session.user.id;

      // 1. Cargar perfil desde la base de datos
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      const defaultProfile: ProfileData = {
        id: userId,
        full_name: data?.full_name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Alessandro',
        username: data?.username || session.user.email?.split('@')[0] || 'alessandro',
        bio: data?.bio || 'Diseño, arquitectura y exploración espacial.',
        city: data?.city || 'Madrid',
        country: data?.country || 'España',
        avatar_url: data?.avatar_url || session.user.user_metadata?.avatar_url,
        stats: {
          memories_count: 24,
          countries_count: 5,
          cities_count: 12,
        },
      };

      setProfile(defaultProfile);
      setFormData(defaultProfile);

      // 2. Cargar red de círculos (Amigos / Contactos)
      const network = await fetchUserNetwork(userId);
      setNetworkUsers(network);

      setLoading(false);
    }

    loadUserData();
  }, [router]);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);

    const payload = {
      id: profile.id,
      full_name: formData.full_name,
      username: formData.username,
      bio: formData.bio,
      city: formData.city,
      country: formData.country,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      alert('Error al guardar cambios: ' + error.message);
    } else {
      setProfile({ ...profile, ...formData } as ProfileData);
      setEditing(false);
    }
    
    setSaving(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center text-zinc-500 font-mono text-xs">
        <Sparkles className="w-4 h-4 animate-spin mr-2" /> Cargando expediente Atlas...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6 selection:bg-zinc-800 pb-20">
      
      {/* TARJETA DE PERFIL (Edición + Datos) */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden space-y-6">
        
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-zinc-800 border border-zinc-700/60 overflow-hidden shadow-2xl flex items-center justify-center font-bold text-white text-xl flex-shrink-0">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
              ) : (
                profile?.username?.substring(0, 2).toUpperCase()
              )}
            </div>

            {!editing ? (
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
            ) : (
              <div className="space-y-2 w-full max-w-sm">
                <input
                  type="text"
                  value={formData.full_name || ''}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Nombre completo"
                  className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white w-full focus:outline-none focus:border-zinc-500"
                />
                <input
                  type="text"
                  value={formData.username || ''}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Nombre de usuario"
                  className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs font-mono text-zinc-400 w-full focus:outline-none focus:border-zinc-500"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="p-2 bg-zinc-800/60 hover:bg-zinc-700/60 text-zinc-300 rounded-xl border border-zinc-700/50 transition"
                title="Editar Perfil"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="p-2 bg-white text-zinc-950 hover:bg-zinc-200 rounded-xl font-medium transition disabled:opacity-50"
                  title="Guardar"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="p-2 bg-zinc-800 text-zinc-400 hover:text-white rounded-xl transition"
                  title="Cancelar"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            )}

            <button
              onClick={handleSignOut}
              className="p-2 bg-zinc-950/60 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl transition"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bio y Ubicación en Modo Edición */}
        {editing ? (
          <div className="space-y-3 pt-2">
            <textarea
              value={formData.bio || ''}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Biografía..."
              rows={2}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-300 focus:outline-none focus:border-zinc-500 resize-none"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={formData.city || ''}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Ciudad"
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-500"
              />
              <input
                type="text"
                value={formData.country || ''}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="País"
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-500"
              />
            </div>
          </div>
        ) : (
          profile?.bio && (
            <p className="text-xs text-zinc-300 leading-relaxed max-w-xl">
              {profile.bio}
            </p>
          )
        )}

        {/* Estadísticas */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-zinc-800/60">
          <div className="bg-zinc-950/40 p-3 rounded-2xl border border-zinc-800/40 text-center">
            <span className="block text-lg font-mono font-bold text-white">
              {profile?.stats?.memories_count || 0}
            </span>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Recuerdos</span>
          </div>

          <div className="bg-zinc-950/40 p-3 rounded-2xl border border-zinc-800/40 text-center">
            <span className="block text-lg font-mono font-bold text-amber-400">
              {profile?.stats?.countries_count || 0}
            </span>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Países</span>
          </div>

          <div className="bg-zinc-950/40 p-3 rounded-2xl border border-zinc-800/40 text-center">
            <span className="block text-lg font-mono font-bold text-emerald-400">
              {profile?.stats?.cities_count || 0}
            </span>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Ciudades</span>
          </div>
        </div>
      </div>

      {/* COMPONENTE DE CÍRCULOS Y RED DE AMIGOS */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 backdrop-blur-xl">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-white tracking-tight">Tu Círculo & Red</h2>
          <p className="text-xs text-zinc-400">Amigos y contactos orbitando en tiempo real</p>
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
