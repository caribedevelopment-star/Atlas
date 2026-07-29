'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { Wine, Plus, Star, Camera, Loader2 } from 'lucide-react';

interface WineItem {
  id: string;
  name: string;
  winery: string;
  vintage: number;
  rating: number;
  tasting_notes: string;
  image_url: string;
}

export default function WinesPage() {
  const [wines, setWines] = useState<WineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Formulario
  const [name, setName] = useState('');
  const [winery, setWinery] = useState('');
  const [vintage, setVintage] = useState(new Date().getFullYear());
  const [rating, setRating] = useState(5);
  const [tastingNotes, setTastingNotes] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    fetchWines();
  }, []);

  const fetchWines = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('wines')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setWines(data);
    }
    setLoading(false);
  };

  const handleAddWine = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let publicImageUrl = '';

      // 1. Subir foto al Storage de Supabase si hay archivo
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `wines/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('wine-photos')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        // Obtener la URL pública de la foto subida
        const { data: urlData } = supabase.storage
          .from('wine-photos')
          .getPublicUrl(filePath);

        publicImageUrl = urlData.publicUrl;
      }

      // 2. Guardar registro en la base de datos
      const { data, error } = await supabase
        .from('wines')
        .insert([
          {
            name,
            winery,
            vintage: Number(vintage),
            rating: Number(rating),
            tasting_notes: tastingNotes,
            image_url: publicImageUrl,
          },
        ])
        .select();

      if (error) throw error;

      if (data) {
        setWines((prev) => [data[0], ...prev]);
        setIsModalOpen(false);
        // Limpiar campos
        setName('');
        setWinery('');
        setTastingNotes('');
        setImageFile(null);
      }
    } catch (err: any) {
      alert('Error guardando el vino: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      <div className="max-w-5xl mx-auto">
        {/* Cabecera */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Wine className="w-6 h-6 text-rose-600" />
              Bodega Personal
            </h1>
            <p className="text-xs text-slate-500 mt-1">Colección y notas de cata reales</p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir Vino</span>
          </button>
        </header>

        {/* Lista de Vinos */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : wines.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8">
            <Wine className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">Aún no has registrado ningún vino.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wines.map((wine) => (
              <div key={wine.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition">
                <div className="relative w-full h-48 bg-slate-100 flex items-center justify-center">
                  {wine.image_url ? (
                    <img src={wine.image_url} alt={wine.name} className="w-full h-full object-cover" />
                  ) : (
                    <Wine className="w-12 h-12 text-slate-300" />
                  )}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-slate-800 flex items-center gap-1 shadow">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{wine.rating}</span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-slate-900 text-base">{wine.name}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {wine.winery} {wine.vintage ? `• ${wine.vintage}` : ''}
                  </p>

                  {wine.tasting_notes && (
                    <p className="text-xs text-slate-600 mt-3 line-clamp-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      "{wine.tasting_notes}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL NUEVO VINO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 font-sans">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Añadir Nuevo Vino</h3>

            <form onSubmit={handleAddWine} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre del Vino</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Vega Sicilia Único"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Bodega</label>
                  <input
                    type="text"
                    value={winery}
                    onChange={(e) => setWinery(e.target.value)}
                    placeholder="Ej. Bodegas Vega Sicilia"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Añada (Año)</label>
                  <input
                    type="number"
                    value={vintage}
                    onChange={(e) => setVintage(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Puntuación (1 al 5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  step="0.5"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Notas de Cata</label>
                <textarea
                  rows={2}
                  value={tastingNotes}
                  onChange={(e) => setTastingNotes(e.target.value)}
                  placeholder="Aromas, maridaje, sensaciones..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Foto del Vino</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-xl shadow-md hover:bg-slate-800 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {uploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Guardar Vino</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}