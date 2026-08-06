'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Wine, Plus, Star, ShoppingBag, Tag, Loader2, Globe } from 'lucide-react';
import CaniaAssistant from '@/components/CaniaAssistant';

interface WineItem {
  id: string;
  name: string;
  winery: string;
  vintage: number;
  rating: number;
  supermarket: string;
  price: number;
  tasting_notes: string;
  image_url: string;
}

const STORES = ['Todos', 'Mercadona', 'Lidl', 'Aldi', 'Carrefour', 'Supercor'];

export default function WinesPage() {
  const [wines, setWines] = useState<WineItem[]>([]);
  const [selectedStore, setSelectedStore] = useState('Todos');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Formulario
  const [name, setName] = useState('');
  const [winery, setWinery] = useState('');
  const [vintage, setVintage] = useState(new Date().getFullYear());
  const [rating, setRating] = useState(5);
  const [supermarket, setSupermarket] = useState('Mercadona');
  const [price, setPrice] = useState('');
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

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `wines/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('wine-photos')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('wine-photos')
          .getPublicUrl(filePath);

        publicImageUrl = urlData.publicUrl;
      }

      const { data, error } = await supabase
        .from('wines')
        .insert([
          {
            name,
            winery,
            vintage: Number(vintage),
            rating: Number(rating),
            supermarket,
            price: price ? parseFloat(price) : null,
            tasting_notes: tastingNotes,
            image_url: publicImageUrl,
          },
        ])
        .select();

      if (error) throw error;

      if (data) {
        setWines((prev) => [data[0], ...prev]);
        setIsModalOpen(false);
        setName('');
        setWinery('');
        setSupermarket('Mercadona');
        setPrice('');
        setTastingNotes('');
        setImageFile(null);
      }
    } catch (err: any) {
      alert('Error guardando el vino: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const filteredWines = selectedStore === 'Todos'
    ? wines
    : wines.filter(w => w.supermarket?.toLowerCase() === selectedStore.toLowerCase());

  return (
    <div className="min-h-dvh overflow-x-hidden bg-slate-50 px-4 py-5 pb-32 font-sans text-slate-800 sm:p-6 sm:pb-28">
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-6 flex min-w-0 flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <h1 className="flex min-w-0 items-center gap-2 text-[clamp(1.5rem,7vw,1.875rem)] font-bold text-slate-900">
                <Wine className="w-6 h-6 text-rose-600" />
                Bodega Abierta
              </h1>
              <span className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                <Globe className="w-3 h-3" /> Pública
              </span>
            </div>
            <p className="mt-1 max-w-prose text-xs leading-relaxed text-slate-500">
              Catálogo de vinos destacados por supermercado y comunidad
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex min-h-11 w-full items-center justify-center gap-2 self-start rounded-2xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-slate-800 active:scale-[0.99] sm:w-auto sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir Vino</span>
          </button>
        </header>

        {/* Filtro por supermercados */}
        <div className="no-scrollbar -mx-4 mb-5 flex snap-x items-center gap-2 overflow-x-auto px-4 pb-3 sm:mx-0 sm:mb-6 sm:px-0">
          {STORES.map((store) => (
            <button
              key={store}
              onClick={() => setSelectedStore(store)}
              className={`min-h-10 snap-start whitespace-nowrap rounded-xl px-4 py-2 text-xs font-semibold transition ${
                selectedStore === store
                  ? 'bg-rose-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {store}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : filteredWines.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 py-10 text-center sm:p-8 sm:py-12">
            <Wine className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">No hay vinos registrados para esta selección.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {filteredWines.map((wine) => (
              <div key={wine.id} className="min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
                <div className="relative flex h-44 w-full items-center justify-center bg-slate-100 sm:h-48">
                  {wine.image_url ? (
                    <img src={wine.image_url} alt={wine.name} className="h-full w-full object-cover" />
                  ) : (
                    <Wine className="w-12 h-12 text-slate-300" />
                  )}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-slate-800 flex items-center gap-1 shadow">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{wine.rating}</span>
                  </div>
                </div>

                <div className="p-4 sm:p-5">
                  <h3 className="truncate text-base font-bold text-slate-900">{wine.name}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {wine.winery} {wine.vintage ? `• ${wine.vintage}` : ''}
                  </p>

                  <div className="mt-3 flex min-w-0 items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs font-medium">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <ShoppingBag className="w-3.5 h-3.5 text-slate-400" />
                      <span>{wine.supermarket || 'No especificado'}</span>
                    </div>
                    {wine.price && (
                      <div className="flex items-center gap-1 text-emerald-700 font-bold">
                        <Tag className="w-3.5 h-3.5" />
                        <span>{wine.price.toFixed(2)} €</span>
                      </div>
                    )}
                  </div>

                  {wine.tasting_notes && (
                    <p className="text-xs text-slate-600 mt-3 line-clamp-2 italic">
                      &quot;{wine.tasting_notes}&quot;
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal para añadir vino */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-slate-900/40 p-3 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto rounded-3xl border border-slate-100 bg-white p-4 font-sans shadow-2xl sm:p-6">
            <h3 className="mb-4 text-lg font-bold text-slate-900">Añadir Nuevo Vino</h3>

            <form onSubmit={handleAddWine} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre del Vino</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Marqués de Riscal"
                  className="min-h-11 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-base outline-none focus:border-slate-800 sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Bodega</label>
                  <input
                    type="text"
                    value={winery}
                    onChange={(e) => setWinery(e.target.value)}
                    placeholder="Ej. Riscal"
                    className="min-h-11 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-base outline-none focus:border-slate-800 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Añada (Año)</label>
                  <input
                    type="number"
                    value={vintage}
                    onChange={(e) => setVintage(Number(e.target.value))}
                    className="min-h-11 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-base outline-none focus:border-slate-800 sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Supermercado/Tienda</label>
                  <select
                    value={supermarket}
                    onChange={(e) => setSupermarket(e.target.value)}
                    className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-base outline-none focus:border-slate-800 sm:text-sm"
                  >
                    <option value="Mercadona">Mercadona</option>
                    <option value="Lidl">Lidl</option>
                    <option value="Aldi">Aldi</option>
                    <option value="Carrefour">Carrefour</option>
                    <option value="Supercor">Supercor</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Precio (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Ej. 12.50"
                    className="min-h-11 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-base outline-none focus:border-slate-800 sm:text-sm"
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
                  className="min-h-11 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-base outline-none focus:border-slate-800 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Notas de Cata</label>
                <textarea
                  rows={2}
                  value={tastingNotes}
                  onChange={(e) => setTastingNotes(e.target.value)}
                  placeholder="Sensaciones, maridaje..."
                  className="min-h-11 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-base outline-none focus:border-slate-800 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Foto del Vino</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full cursor-pointer text-xs text-slate-500 file:mr-3 file:rounded-xl file:border-0 file:bg-slate-100 file:px-4 file:py-2.5 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
                />
              </div>

              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="min-h-11 rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-slate-800 disabled:opacity-50"
                >
                  {uploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Guardar Vino</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Asistente Flotante Nube de Cania */}
      <CaniaAssistant userWines={wines} />
    </div>
  );
}
