'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Save, MapPin, Wine, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
    setError(null);

    try {
      // 1. Obtener el usuario autenticado actual
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (user) {
        // 2. Cargar recuento de datos FILTRADOS por el usuario actual en paralelo para velocidad óptima
        const [memoriesRes, winesRes, profileRes] = await Promise.all([
          supabase
            .from('memories')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id),
          supabase
            .from('wines')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id),
          supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
        ]);

        setStats({
          memoriesCount: memoriesRes.count || 0,
          winesCount: winesRes.count || 0,
        });

        // 3. Cargar EL PERFIL ESPECÍFICO del usuario autenticado
        if (profileRes.data) {
          setFullName(profileRes.data.full_name || '');
          setUsername(profileRes.data.username || '');
          setBio(profileRes.data.bio || '');
        } else {
          // Fallback al meta_data del login si aún no tiene registro en 'profiles'
          setFullName(user.user_metadata?.full_name || user.user_metadata?.name || '');
          setUsername(user.email?.split('@')[0] || '');
        }
      } else {
        setError('No se pudo encontrar un usuario autenticado. Inicia sesión de nuevo.');
      }
    } catch (err: any) {
      console.error('Error loading profile:', err);
      setError(err.message || 'Error de comunicación al cargar el perfil de usuario.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        alert('Debes estar autenticado para guardar tu perfil.');
        setSaving(false);
        return;
      }

      const { error: upsertError } = await supabase.from('profiles').upsert({
        id: user.id,
        full_name: fullName,
        username,
        bio,
        updated_at: new Date().toISOString(),
      });

      if (upsertError) throw upsertError;

      alert('¡Perfil actualizado con éxito!');
    } catch (err: any) {
      console.error('Error saving profile:', err);
      alert('Error guardando el perfil: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800 animate-pulse">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-200" />
            <div className="space-y-2 flex-1">
              <div className="h-5 bg-slate-200 rounded-md w-1/3" />
              <div className="h-4 bg-slate-100 rounded-md w-1/4" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 h-20 rounded-3xl border border-slate-200 shadow-sm" />
            <div className="bg-white p-5 h-20 rounded-3xl border border-slate-200 shadow-sm" />
          </div>
          <div className="bg-white p-6 h-64 rounded-3xl border border-slate-200 shadow-sm" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center max-w-md w-full shadow-soft">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-900 mb-2">Error de perfil</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-6">{error}</p>
          <button
            onClick={loadProfileAndStats}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-5 py-3 rounded-xl transition"
          >
            <RefreshCw className="w-4 h-4" />
            Reintentar carga
          </button>
        </div>
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
