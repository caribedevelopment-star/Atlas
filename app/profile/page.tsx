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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      <div className="max-w-2xl mx-auto space-y-6">
        <header className="flex items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl shrink-0">
            {fullName ? fullName.charAt(0).toUpperCase() : <User className="w-8 h-8" />}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{fullName || 'Mi Perfil'}</h1>
            <p className="text-xs text-slate-500 font-medium">@{username || 'usuario'}</p>
          </div>
        </header>

        {/* Métricas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-2xl font-bold text-slate-900">{stats.memoriesCount}</span>
              <span className="text-xs text-slate-500 font-semibold">Memorias guardadas</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
              <Wine className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-2xl font-bold text-slate-900">{stats.winesCount}</span>
              <span className="text-xs text-slate-500 font-semibold">Vinos registrados</span>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4">Editar Datos Personales</h3>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre Completo</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Tu nombre real"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre de Usuario</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ejemplo_usuario"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Biografía / Acerca de mí</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Escribe brevemente tu biografía o notas..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-slate-800"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition disabled:opacity-50"
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
