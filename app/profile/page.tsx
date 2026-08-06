'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Save, MapPin, Wine, Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [stats, setStats] = useState({ memoriesCount: 0, winesCount: 0 });

  useEffect(() => {
    loadProfileAndStats();
  }, []);

  const loadProfileAndStats = async () => {
    setLoading(true);

    // 1. Obtener el usuario autenticado actual
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // 2. Cargar recuento de datos FILTRADOS por el usuario actual
      const { count: memCount } = await supabase
        .from('memories')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const { count: wineCount } = await supabase
        .from('wines')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      setStats({
        memoriesCount: memCount || 0,
        winesCount: wineCount || 0,
      });

      // 3. Cargar EL PERFIL ESPECÍFICO del usuario autenticado
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setFullName(data.full_name || '');
        setUsername(data.username || '');
        setBio(data.bio || '');
      } else {
        // Fallback al meta_data del login si aún no tiene registro en 'profiles'
        setFullName(user.user_metadata?.full_name || user.user_metadata?.name || '');
        setUsername(user.email?.split('@')[0] || '');
      }
    }

    setLoading(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert('Debes estar autenticado para guardar tu perfil.');
      setSaving(false);
      return;
    }

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      full_name: fullName,
      username,
      bio,
      updated_at: new Date().toISOString(),
    });

    setSaving(false);

    if (error) {
      alert('Error guardando perfil: ' + error.message);
    } else {
      alert('¡Perfil actualizado con éxito!');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center overflow-x-hidden bg-slate-50 font-sans">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh overflow-x-hidden bg-slate-50 px-4 py-5 pb-28 font-sans text-slate-800 sm:p-6">
      <div className="mx-auto w-full max-w-2xl space-y-4 sm:space-y-6">
        <header className="flex min-w-0 items-center gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:gap-4 sm:p-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-lg font-bold text-white sm:h-16 sm:w-16 sm:text-xl">
            {fullName ? fullName.charAt(0).toUpperCase() : <User className="w-8 h-8" />}
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold text-slate-900 sm:text-xl">{fullName || 'Mi Perfil'}</h1>
            <p className="truncate text-xs font-medium text-slate-500">@{username || 'usuario'}</p>
          </div>
        </header>

        {/* Métricas */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          <div className="flex min-w-0 items-center gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:gap-4 sm:p-5">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-xl font-bold text-slate-900 sm:text-2xl">{stats.memoriesCount}</span>
              <span className="text-xs font-semibold text-slate-500">Memorias guardadas</span>
            </div>
          </div>

          <div className="flex min-w-0 items-center gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:gap-4 sm:p-5">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
              <Wine className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-xl font-bold text-slate-900 sm:text-2xl">{stats.winesCount}</span>
              <span className="text-xs font-semibold text-slate-500">Vinos registrados</span>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h3 className="mb-4 text-base font-bold text-slate-900">Editar Datos Personales</h3>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre Completo</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Tu nombre real"
                className="min-h-11 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-base outline-none focus:border-slate-800 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre de Usuario</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ejemplo_usuario"
                className="min-h-11 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-base outline-none focus:border-slate-800 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Biografía / Acerca de mí</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Escribe brevemente tu biografía o notas..."
                className="min-h-11 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-base outline-none focus:border-slate-800 sm:text-sm"
              />
            </div>

            <div className="flex justify-stretch pt-2 sm:justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-slate-800 disabled:opacity-50 sm:w-auto"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Guardar Cambios</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
