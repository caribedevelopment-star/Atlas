'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Wine, Plus, Star, ShoppingBag, Tag, Loader2, Globe, AlertCircle, RefreshCw, Camera, Store, X } from 'lucide-react';
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
  is_popular?: boolean;
}

const STORES = ['Todos', 'Mercadona', 'Lidl', 'Aldi', 'Carrefour', 'Supercor'];

export default function WinesPage() {
  const [wines, setWines] = useState<WineItem[]>([]);
  const [selectedStore, setSelectedStore] = useState('Todos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('wines')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setWines(data || []);
    } catch (err: any) {
      console.error('Error fetching wines:', err);
      setError(err.message || 'No se pudieron recuperar los vinos de la base de datos.');
    } finally {
      setLoading(false);
    }
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
            is_popular: false,
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

  const popularWines = filteredWines.filter(w => w.is_popular === true);
  const communityWines = filteredWines.filter(w => !w.is_popular);

  return (
    <div className="min-h-screen bg-zinc-950 p-4 sm:p-6 font-sans text-zinc-100 pb-24 selection:bg-zinc-800">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Cabecera */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-3xl backdrop-blur-xl">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Wine className="w-5 h-5 text-rose-500" />
                Bodega Abierta
              </h1>
              <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1">
                <Globe className="w-3 h-3" /> Pública
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Catálogo de vinos destacados por supermercado y comunidad
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-lg shadow-rose-950/40 transition self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir Vino</span>
          </button>
        </header>

        {/* Filtro por supermercados */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {STORES.map((store) => (
            <button
              key={store}
              onClick={() => setSelectedStore(store)}
              className={`px-4 py-2 rounded-xl text-xs font-mono transition whitespace-nowrap ${
                selectedStore === store
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  : 'bg-zinc-900/40 text-zinc-400 border border-zinc-800/80 hover:text-white hover:bg-zinc-900'
              }`}
            >
              {store}
            </button>
          ))}
        </div>

        {/* Estado de Error o Carga */}
        {error ? (
          <div className="bg-red-950/30 border border-red-900/50 rounded-3xl p-6 text-center max-w-md mx-auto my-8">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
            <h3 className="font-bold text-red-200 text-sm mb-1">Error de conexión</h3>
            <p className="text-xs text-red-400 leading-relaxed mb-4">{error}</p>
            <button
              onClick={fetchWines}
              className="inline-flex items-center gap-2 bg-red-900/50 hover:bg-red-800/50 text-red-200 border border-red-700/50 text-xs font-semibold px-4 py-2 rounded-xl transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reintentar
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl overflow-hidden animate-pulse p-5 space-y-4">
                <div className="w-full h-44 bg-zinc-800/60 rounded-2xl" />
                <div className="space-y-2">
                  <div className="h-4 bg-zinc-800/80 rounded w-3/4" />
                  <div className="h-3 bg-zinc-800/40 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-10">
            
            {/* SECCIÓN 1: MÁS VENDIDOS EN SUPERMERCADOS */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3">
                <Store className="w-4 h-4 text-rose-500" />
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Más vendidos en supermercados</h2>
                  <p className="text-xs text-zinc-400">Referencias habituales en lineales comerciales</p>
                </div>
              </div>

              {popularWines.length === 0 ? (
                <p className="text-xs text-zinc-500 italic py-4 font-mono">No hay vinos destacados en esta selección.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {popularWines.map((wine) => (
                    <div key={wine.id} className="bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700/80 rounded-3xl overflow-hidden backdrop-blur-xl transition duration-200 flex flex-col justify-between group">
                      <div>
                        <div className="relative w-full h-48 bg-zinc-950 flex items-center justify-center overflow-hidden">
                          {wine.image_url ? (
                            <img src={wine.image_url} alt={wine.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                          ) : (
                            <Wine className="w-10 h-10 text-zinc-700" />
                          )}
                          <div className="absolute top-3 right-3 bg-zinc-950/80 backdrop-blur-md px-2.5 py-1 rounded-xl text-xs font-mono font-bold text-rose-400 border border-rose-500/20 flex items-center gap-1">
                            <Star className="w-3 h-3 fill-rose-400 text-rose-400" />
                            <span>{wine.rating}</span>
                          </div>
                        </div>

                        <div className="p-5 space-y-3">
                          <div>
                            <h3 className="font-bold text-white text-sm group-hover:text-rose-400 transition">{wine.name}</h3>
                            <p className="text-xs font-mono text-zinc-400 mt-0.5">
                              {wine.winery} {wine.vintage ? `• ${wine.vintage}` : ''}
                            </p>
                          </div>

                          <div className="flex items-center justify-between text-xs bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-800/40 font-mono">
                            <div className="flex items-center gap-1.5 text-zinc-400">
                              <ShoppingBag className="w-3.5 h-3.5 text-zinc-500" />
                              <span>{wine.supermarket || 'Supermercado'}</span>
                            </div>
                            {wine.price && (
                              <div className="flex items-center gap-1 text-emerald-400 font-semibold">
                                <Tag className="w-3 h-3" />
                                <span>{wine.price.toFixed(2)} €</span>
                              </div>
                            )}
                          </div>

                          {wine.tasting_notes && (
                            <p className="text-xs text-zinc-300 italic line-clamp-2 leading-relaxed">
                              "{wine.tasting_notes}"
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* SECCIÓN 2: SUBIDOS POR LA COMUNIDAD */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3">
                <Camera className="w-4 h-4 text-sky-400" />
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Subidos por la comunidad</h2>
                  <p className="text-xs text-zinc-400">Fotografías reales y recomendaciones de los usuarios</p>
                </div>
              </div>

              {communityWines.length === 0 ? (
                <div className="text-center py-8 bg-zinc-900/20 rounded-3xl border border-dashed border-zinc-800 p-6">
                  <Camera className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                  <p className="text-xs font-mono text-zinc-500">Aún no hay vinos subidos por la comunidad en esta categoría.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {communityWines.map((wine) => (
                    <div key={wine.id} className="bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700/80 rounded-3xl overflow-hidden backdrop-blur-xl transition duration-200 flex flex-col justify-between group">
                      <div>
                        <div className="relative w-full h-52 bg-zinc-950 flex items-center justify-center overflow-hidden">
                          {wine.image_url ? (
                            <img src={wine.image_url} alt={wine.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                          ) : (
                            <Wine className="w-10 h-10 text-zinc-700" />
                          )}
                          <div className="absolute top-3 right-3 bg-zinc-950/80 backdrop-blur-md px-2.5 py-1 rounded-xl text-xs font-mono font-bold text-rose-400 border border-rose-500/20 flex items-center gap-1">
                            <Star className="w-3 h-3 fill-rose-400 text-rose-400" />
                            <span>{wine.rating}</span>
                          </div>
                        </div>

                        <div className="p-5 space-y-3">
                          <div>
                            <h3 className="font-bold text-white text-sm group-hover:text-rose-400 transition">{wine.name}</h3>
                            <p className="text-xs font-mono text-zinc-400 mt-0.5">
                              {wine.winery} {wine.vintage ? `• ${wine.vintage}` : ''}
                            </p>
                          </div>

                          <div className="flex items-center justify-between text-xs bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-800/40 font-mono">
                            <div className="flex items-center gap-1.5 text-zinc-400">
                              <ShoppingBag className="w-3.5 h-3.5 text-zinc-500" />
                              <span>{wine.supermarket || 'Comunidad'}</span>
                            </div>
                            {wine.price && (
                              <div className="flex items-center gap-1 text-emerald-400 font-semibold">
                                <Tag className="w-3 h-3" />
                                <span>{wine.price.toFixed(2)} €</span>
                              </div>
                            )}
                          </div>

                          {wine.tasting_notes && (
                            <p className="text-xs text-zinc-300 italic leading-relaxed bg-zinc-950/40 p-3 rounded-2xl border border-zinc-800/40">
                              "{wine.tasting_notes}"
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

          </div>
        )}
      </div>

      {/* Modal para añadir vino */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-md p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-md shadow-2xl font-sans text-zinc-100 relative space-y-4">
            
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Wine className="w-4 h-4 text-rose-500" /> Añadir Nuevo Vino
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddWine} className="space-y-3 text-xs">
              <div>
                <label className="block font-mono text-zinc-400 mb-1">Nombre del Vino</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Marqués de Riscal"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white outline-none focus:border-rose-500/50 transition font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-zinc-400 mb-1">Bodega</label>
                  <input
                    type="text"
                    value={winery}
                    onChange={(e) => setWinery(e.target.value)}
                    placeholder="Ej. Riscal"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white outline-none focus:border-rose-500/50 transition font-sans"
                  />
                </div>
                <div>
                  <label className="block font-mono text-zinc-400 mb-1">Añada (Año)</label>
                  <input
                    type="number"
                    value={vintage}
                    onChange={(e) => setVintage(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white outline-none focus:border-rose-500/50 transition font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-zinc-400 mb-1">Supermercado/Tienda</label>
                  <select
                    value={supermarket}
                    onChange={(e) => setSupermarket(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white outline-none focus:border-rose-500/50 transition font-sans"
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
                  <label className="block font-mono text-zinc-400 mb-1">Precio (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Ej. 12.50"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white outline-none focus:border-rose-500/50 transition font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-zinc-400 mb-1">Puntuación (1 al 5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  step="0.5"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white outline-none focus:border-rose-500/50 transition font-mono"
                />
              </div>

              <div>
                <label className="block font-mono text-zinc-400 mb-1">Notas de Cata</label>
                <textarea
                  rows={2}
                  value={tastingNotes}
                  onChange={(e) => setTastingNotes(e.target.value)}
                  placeholder="Sensaciones, maridaje..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white outline-none focus:border-rose-500/50 transition font-sans resize-none"
                />
              </div>

              <div>
                <label className="block font-mono text-zinc-400 mb-1">Foto del Vino</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-zinc-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border file:border-zinc-700 file:text-xs file:font-mono file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700 cursor-pointer"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-mono text-zinc-400 hover:text-white rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 font-semibold bg-rose-500 hover:bg-rose-600 text-white rounded-xl shadow-lg shadow-rose-950/40 disabled:opacity-50 flex items-center gap-1.5 transition"
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
