'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, X, MapPin, Calendar, Wine, Lock, Globe, Shield, Sparkles, Loader2, Navigation } from 'lucide-react';

export interface Memory {
  id: string;
  title: string;
  location?: string;
  latitude: number;
  longitude: number;
  description?: string;
  category?: string;
  is_private?: boolean;
  date?: string;
  wine_name?: string;
}

export default function MapComponent() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [MapModule, setMapModule] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'circulo' | 'extendida' | 'global' | 'personal'>('global');
  const [showWineRegions, setShowWineRegions] = useState(false);
  const [privacyFilter, setPrivacyFilter] = useState<'all' | 'public' | 'private'>('all');

  // Estado del Modal de Nuevo Recuerdo (desde el botón inferior derecho)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [selectedLat, setSelectedLat] = useState<number>(40.416775);
  const [selectedLng, setSelectedLng] = useState<number>(-3.70379);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('Viaje');
  const [wineName, setWineName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMemories();
  }, []);

  const fetchMemories = async () => {
    try {
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      if (data) setMemories(data);
    } catch (err) {
      console.error('Error cargando memorias:', err);
    } finally {
      setLoading(false);
    }
  };

  // Buscador de lugares estilo Google Maps (Nominatim OpenStreetMap API gratuita y limpia)
  const handleSearchLocation = async (query: string) => {
    setLocationQuery(query);
    if (query.length < 3) {
      setLocationSuggestions([]);
      return;
    }
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
      const data = await res.json();
      setLocationSuggestions(data);
    } catch (err) {
      console.error('Error buscando ubicación:', err);
    }
  };

  const handleSelectLocation = (place: any) => {
    setLocationQuery(place.display_name);
    setSelectedLat(parseFloat(place.lat));
    setSelectedLng(parseFloat(place.lon));
    setLocationSuggestions([]);
  };

  const handleSaveMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data, error } = await supabase.from('memories').insert([
        {
          title,
          location: locationQuery,
          latitude: selectedLat,
          longitude: selectedLng,
          date,
          category,
          wine_name: wineName,
          description,
          is_private: isPrivate,
        }
      ]).select();

      if (error) throw error;
      if (data) {
        setMemories(prev => [...prev, data[0]]);
        setIsModalOpen(false);
        // Reset form
        setTitle('');
        setLocationQuery('');
        setDescription('');
        setWineName('');
      }
    } catch (err: any) {
      alert('Error guardando la memoria: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Cargar Leaflet y React-Leaflet en cliente
  useEffect(() => {
    let isMounted = true;

    if (!document.getElementById('map-animations')) {
      const style = document.createElement('style');
      style.id = 'map-animations';
      style.innerHTML = `
        @keyframes radar-pulse {
          0% { transform: scale(0.95); opacity: 0.3; }
          50% { transform: scale(1.1); opacity: 0.7; }
          100% { transform: scale(0.95); opacity: 0.3; }
        }
        .leaflet-interactive.wine-pulsing-region {
          animation: radar-pulse 4s infinite ease-in-out;
          transform-origin: center;
        }
      `;
      document.head.appendChild(style);
    }

    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    Promise.all([
      import('react-leaflet'),
      import('leaflet')
    ]).then(([RL, L]) => {
      if (!isMounted) return;

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const InteractiveMapContent = () => {
        const filteredMemories = memories.filter((mem) => {
          if (privacyFilter === 'public') return !mem.is_private;
          if (privacyFilter === 'private') return mem.is_private;
          return true;
        });

        const centerLat = filteredMemories.length > 0 && filteredMemories[0].latitude ? filteredMemories[0].latitude : 40.416775;
        const centerLng = filteredMemories.length > 0 && filteredMemories[0].longitude ? filteredMemories[0].longitude : -3.70379;

        // Rutas de viajes ordenadas cronológicamente para trazar la línea
        const sortedMemories = [...filteredMemories].sort((a, b) => {
          if (!a.date || !b.date) return 0;
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });

        const routeCoordinates = sortedMemories
          .filter(m => m.latitude && m.longitude)
          .map(m => [m.latitude, m.longitude] as [number, number]);

        const wineRegions = [
          { name: 'D.O. Ca. Rioja', lat: 42.4658, lng: -2.4456, radius: 45000, color: '#f43f5e' },
          { name: 'D.O. Ribera del Duero', lat: 41.6050, lng: -3.8876, radius: 40000, color: '#f43f5e' },
          { name: 'D.O. Rías Baixas', lat: 42.5543, lng: -8.7733, radius: 35000, color: '#38bdf8' },
          { name: 'D.O. Priorat', lat: 41.1333, lng: 0.8333, radius: 25000, color: '#fbbf24' },
          { name: 'D.O. Jerez-Xérès-Sherry', lat: 36.6854, lng: -6.1308, radius: 30000, color: '#fbbf24' },
        ];

        return (
          <RL.MapContainer
            center={[centerLat, centerLng]}
            zoom={viewMode === 'circulo' ? 9 : viewMode === 'extendida' ? 7 : 5}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '100%', background: '#09090b' }}
          >
            <RL.TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            {/* Línea de ruta de viajes conectada */}
            {routeCoordinates.length > 1 && (
              <>
                <RL.Polyline
                  positions={routeCoordinates}
                  pathOptions={{
                    color: '#38bdf8',
                    weight: 3.5,
                    opacity: 0.85,
                    dashArray: viewMode === 'personal' ? '6, 8' : undefined,
                  }}
                />
                <RL.Polyline
                  positions={routeCoordinates}
                  pathOptions={{
                    color: '#0284c7',
                    weight: 8,
                    opacity: 0.25,
                  }}
                />
              </>
            )}

            {/* Regiones de vino con latido dinámico */}
            {showWineRegions && wineRegions.map((region, idx) => (
              <RL.Circle
                key={idx}
                center={[region.lat, region.lng]}
                radius={region.radius}
                pathOptions={{
                  color: region.color,
                  fillColor: region.color,
                  fillOpacity: 0.3,
                  weight: 2,
                  className: 'wine-pulsing-region',
                }}
              >
                <RL.Popup>
                  <div style={{ color: '#000', fontFamily: 'sans-serif', padding: '4px' }}>
                    <strong style={{ fontSize: '13px', display: 'block' }}>{region.name}</strong>
                    <span style={{ fontSize: '11px', color: '#666' }}>Denominación de Origen Protegida</span>
                  </div>
                </RL.Popup>
              </RL.Circle>
            ))}

            {/* Pines de Memorias */}
            {filteredMemories.map((mem) => {
              if (!mem.latitude || !mem.longitude) return null;
              const circleRadius = viewMode === 'circulo' ? 15000 : viewMode === 'extendida' ? 35000 : 60000;

              return (
                <div key={mem.id}>
                  {viewMode !== 'personal' && (
                    <RL.Circle
                      center={[mem.latitude, mem.longitude]}
                      radius={circleRadius}
                      pathOptions={{
                        color: mem.is_private ? '#fbbf24' : '#38bdf8',
                        fillColor: mem.is_private ? '#fbbf24' : '#38bdf8',
                        fillOpacity: 0.08,
                        weight: 1.5,
                        dashArray: '4, 4',
                      }}
                    />
                  )}

                  <RL.Marker position={[mem.latitude, mem.longitude]}>
                    <RL.Popup>
                      <div style={{ color: '#000', fontFamily: 'sans-serif', minWidth: '160px', padding: '2px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontSize: '9px', background: '#f43f5e', color: '#fff', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                            {mem.category || 'Viaje'}
                          </span>
                          <span style={{ fontSize: '9px', color: mem.is_private ? '#d97706' : '#0284c7', fontWeight: 'bold' }}>
                            {mem.is_private ? 'Privado' : 'Círculo'}
                          </span>
                        </div>
                        <strong style={{ display: 'block', fontSize: '14px', color: '#18181b', marginBottom: '2px' }}>
                          {mem.title}
                        </strong>
                        {mem.date && <span style={{ fontSize: '10px', color: '#71717a', display: 'block', marginBottom: '4px' }}>📅 {mem.date}</span>}
                        {mem.wine_name && <span style={{ fontSize: '11px', color: '#e11d48', display: 'block', fontWeight: '600', marginBottom: '4px' }}>🍷 {mem.wine_name}</span>}
                        {mem.description && (
                          <p style={{ fontSize: '11px', color: '#52525b', margin: '0', lineHeight: '1.3' }}>
                            {mem.description}
                          </p>
                        )}
                      </div>
                    </RL.Popup>
                  </RL.Marker>
                </div>
              );
            })}
          </RL.MapContainer>
        );
      };

      setMapModule(() => InteractiveMapContent);
    });

    return () => {
      isMounted = false;
    };
  }, [memories, viewMode, showWineRegions, privacyFilter]);

  if (!MapModule) {
    return (
      <div className="w-full h-[calc(100vh-4rem)] bg-zinc-950 flex items-center justify-center text-zinc-500 font-mono text-xs">
        Cargando interfaz cartográfica Atlas...
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-4rem)] relative bg-zinc-950 overflow-hidden font-sans">
      
      {/* ========================================================
          PANEL DE CONTROL SUPERIOR (Escala y distribución limpia)
         ======================================================== */}
      <div className="absolute top-6 left-6 right-6 z-[999] flex flex-wrap items-center justify-between gap-4 pointer-events-none">
        
        {/* Modos de Red */}
        <div className="pointer-events-auto flex items-center gap-1 bg-zinc-900/90 border border-zinc-800/80 backdrop-blur-xl p-1.5 rounded-2xl shadow-2xl">
          {(['circulo', 'extendida', 'global', 'personal'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono capitalize transition ${
                viewMode === mode
                  ? 'bg-rose-500 text-white font-semibold shadow-lg shadow-rose-950/50'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Filtros de Privacidad y Capa de Vinos */}
        <div className="pointer-events-auto flex items-center gap-2.5">
          <select
            value={privacyFilter}
            onChange={(e: any) => setPrivacyFilter(e.target.value)}
            className="bg-zinc-900/90 text-zinc-300 border border-zinc-800/80 px-3.5 py-2.5 rounded-2xl text-xs font-mono backdrop-blur-xl outline-none cursor-pointer hover:border-zinc-700 transition shadow-xl"
          >
            <option value="all">Red: Todos</option>
            <option value="public">Red: Círculo Compartido</option>
            <option value="private">Red: Privados</option>
          </select>

          <button
            onClick={() => setShowWineRegions(!showWineRegions)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-mono font-semibold backdrop-blur-xl border transition flex items-center gap-2 shadow-xl ${
              showWineRegions
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-rose-950/40'
                : 'bg-zinc-900/90 text-zinc-300 border-zinc-800/80 hover:border-zinc-700'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${showWineRegions ? 'bg-rose-400 animate-ping' : 'bg-zinc-500'}`} />
            <span>D.O. Vinos</span>
          </button>
        </div>
      </div>

      {/* Render del Mapa */}
      <MapModule />

      {/* ========================================================
          BOTÓN FLOTANTE INFERIOR DERECHO (`+` circular elegante)
         ======================================================== */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="absolute bottom-8 right-8 z-[999] w-14 h-14 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-rose-950/80 hover:scale-105 active:scale-95 transition-all duration-200 border border-rose-400/30 group"
        title="Añadir nuevo viaje o recuerdo"
      >
        <Plus className="w-6 h-6 group-hover:rotate-90 transition duration-300" />
      </button>

      {/* ========================================================
          MODAL DE CREACIÓN DE RECUERDO / RUTA
         ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-zinc-950/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl font-sans text-zinc-100 relative space-y-5">
            
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                  <Navigation className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">Nuevo Viaje o Recuerdo</h3>
                  <p className="text-xs text-zinc-400 font-mono">Añade una parada a tu mapa y ruta personal</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-500 hover:text-white p-2 rounded-xl hover:bg-zinc-800/50 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMemory} className="space-y-4 text-xs">
              <div>
                <label className="block font-mono text-zinc-400 mb-1.5">Título del Recuerdo / Parada</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej. Cata en Bodega Muga o Escapada a Rioja"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-2.5 text-white outline-none focus:border-rose-500/50 transition"
                />
              </div>

              {/* Buscador de ubicación estilo Google Maps */}
              <div className="relative">
                <label className="block font-mono text-zinc-400 mb-1.5">Ubicación (Buscador)</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={locationQuery}
                    onChange={(e) => handleSearchLocation(e.target.value)}
                    placeholder="Buscar ciudad, bodega o lugar..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-10 pr-4 py-2.5 text-white outline-none focus:border-rose-500/50 transition"
                  />
                  <MapPin className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                </div>

                {locationSuggestions.length > 0 && (
                  <div className="absolute z-50 left-0 right-0 mt-1 bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl max-h-48 overflow-y-auto">
                    {locationSuggestions.map((place, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectLocation(place)}
                        className="w-full text-left px-4 py-2.5 hover:bg-zinc-900 text-zinc-300 hover:text-white border-b border-zinc-900 last:border-0 transition flex items-center gap-2"
                      >
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="truncate">{place.display_name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-zinc-400 mb-1.5">Fecha del Viaje</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-2.5 text-white outline-none focus:border-rose-500/50 transition font-mono"
                  />
                </div>
                <div>
                  <label className="block font-mono text-zinc-400 mb-1.5">Categoría</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-2.5 text-white outline-none focus:border-rose-500/50 transition"
                  >
                    <option value="Viaje">Viaje / Ruta</option>
                    <option value="Cata">Cata de Vino</option>
                    <option value="Restaurante">Gastronomía</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-mono text-zinc-400 mb-1.5">Vino Destacado (Opcional)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={wineName}
                    onChange={(e) => setWineName(e.target.value)}
                    placeholder="Ej. Muga Crianza 2020"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-10 pr-4 py-2.5 text-white outline-none focus:border-rose-500/50 transition"
                  />
                  <Wine className="w-4 h-4 text-rose-500 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block font-mono text-zinc-400 mb-1.5">Descripción / Notas</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalles del viaje, sensaciones o notas..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-2.5 text-white outline-none focus:border-rose-500/50 transition resize-none"
                />
              </div>

              {/* Selector de Privacidad */}
              <div className="flex items-center justify-between bg-zinc-950/60 p-3.5 rounded-2xl border border-zinc-800">
                <div className="flex items-center gap-2.5">
                  {isPrivate ? <Lock className="w-4 h-4 text-amber-400" /> : <Globe className="w-4 h-4 text-sky-400" />}
                  <div>
                    <span className="font-semibold text-white block">Privacidad del Recuerdo</span>
                    <span className="text-[11px] text-zinc-400">{isPrivate ? 'Solo visible para ti' : 'Compartido con el círculo de red'}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPrivate(!isPrivate)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300 ${isPrivate ? 'bg-amber-500/20 border border-amber-500/50 justify-end' : 'bg-sky-500/20 border border-sky-500/50 justify-start'}`}
                >
                  <div className={`w-4 h-4 rounded-full shadow-md transition duration-300 ${isPrivate ? 'bg-amber-400' : 'bg-sky-400'}`} />
                </button>
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 font-mono text-zinc-400 hover:text-white rounded-2xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 font-semibold bg-rose-500 hover:bg-rose-600 text-white rounded-2xl shadow-lg shadow-rose-950/40 disabled:opacity-50 flex items-center gap-2 transition"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Guardar Parada</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
