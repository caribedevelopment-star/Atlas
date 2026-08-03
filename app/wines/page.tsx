
'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Wine, Plus, Star, ShoppingBag, Tag, Loader2, Globe, AlertCircle, RefreshCw, Camera, Store } from 'lucide-react';
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
            is_popular: false, // Los añadidos por la interfaz son de usuario
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

  // Filtrado general por tienda
  const filteredWines = selectedStore === 'Todos'
    ? wines
    : wines.filter(w => w.supermarket?.toLowerCase() === selectedStore.toLowerCase());

  // Separación por categoría (Populares de Supermercado vs Usuarios)
  const popularWines = filteredWines.filter(w => w.is_popular === true);
  const communityWines = filteredWines.filter(w => !w.is_popular);

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800 pb-24">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Cabecera */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Wine className="w-6 h-6 text-rose-600" />
                Bodega Abierta
              </h1>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Globe className="w-3 h-3" /> Pública
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Catálogo de vinos destacados por supermercado y comunidad
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-md transition self-start sm:self-auto"
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
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedStore === store
                  ? 'bg-rose-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {store}
            </button>
          ))}
        </div>

        {/* Estado de Error o Carga */}
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-3xl p-6 text-center max-w-md mx-auto my-8 shadow-sm">
            <AlertCircle className="w-10 h-10 text-red-600 mx-auto mb-3" />
            <h3 className="font-bold text-red-950 mb-1">Error de conexión</h3>
            <p className="text-xs text-red-700 leading-relaxed mb-4">{error}</p>
            <button
              onClick={fetchWines}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reintentar
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm animate-pulse">
                <div className="w-full h-48 bg-slate-100 flex items-center justify-center relative" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-slate-200 rounded-md w-3/4" />
                  <div className="h-3 bg-slate-100 rounded-md w-1/2" />
                  <div className="h-8 bg-slate-50 rounded-xl w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-12">
            
            {/* SECCIÓN 1: MÁS VENDIDOS EN SUPERMERCADOS */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                <Store className="w-5 h-5 text-rose-600" />
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Más vendidos en supermercados</h2>
                  <p className="text-xs text-slate-500">Referencias habituales en lineales comerciales</p>
                </div>
              </div>

              {popularWines.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4">No hay vinos destacados en esta selección.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {popularWines.map((wine) => (
                    <div key={wine.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between">
                      <div>
                        <div className="relative w-full h-48 bg-slate-100 flex items-center justify-center overflow-hidden">
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

                          <div className="flex items-center justify-between mt-3 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-medium">
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <ShoppingBag className="w-3.5 h-3.5 text-slate-400" />
                              <span>{wine.supermarket || 'Supermercado'}</span>
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
              <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                <Camera className="w-5 h-5 text-indigo-600" />
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Subidos por la comunidad</h2>
                  <p className="text-xs text-slate-500">Fotografías reales y recomendaciones de los usuarios</p>
                </div>
              </div>

              {communityWines.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-3xl border border-slate-200 p-6">
                  <Camera className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-medium text-slate-500">Aún no hay vinos subidos por la comunidad en esta categoría.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {communityWines.map((wine) => (
                    <div key={wine.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between">
                      <div>
                        <div className="relative w-full h-56 bg-slate-900 flex items-center justify-center overflow-hidden">
                          {wine.image_url ? (
                            <img src={wine.image_url} alt={wine.name} className="w-full h-full object-cover" />
                          ) : (
                            <Wine className="w-12 h-12 text-slate-600" />
                          )}
                          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1 shadow">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{wine.rating}</span>
                          </div>
                        </div>

                        <div className="p-5">
                          <h3 className="font-bold text-slate-900 text-base">{wine.name}</h3>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">
                            {wine.winery} {wine.vintage ? `• ${wine.vintage}` : ''}
                          </p>

                          <div className="flex items-center justify-between mt-3 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-medium">
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <ShoppingBag className="w-3.5 h-3.5 text-slate-400" />
                              <span>{wine.supermarket || 'Comunidad'}</span>
                            </div>
                            {wine.price && (
                              <div className="flex items-center gap-1 text-emerald-700 font-bold">
                                <Tag className="w-3.5 h-3.5" />
                                <span>{wine.price.toFixed(2)} €</span>
                              </div>
                            )}
                          </div>

                          {wine.tasting_notes && (
                            <p className="text-xs text-slate-600 mt-3 line-clamp-3 italic bg-slate-50 p-3 rounded-xl border border-slate-100">
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
                  placeholder="Ej. Marqués de Riscal"
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
                    placeholder="Ej. Riscal"
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Supermercado/Tienda</label>
                  <select
                    value={supermarket}
                    onChange={(e) => setSupermarket(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-slate-800 bg-white"
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
                  placeholder="Sensaciones, maridaje..."
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

      {/* Asistente Flotante Nube de Cania */}
      <CaniaAssistant userWines={wines} />
    </div>
  );
}
