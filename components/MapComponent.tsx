'use client';

import { useEffect, useState } from 'react';

export interface Memory {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  description?: string;
  category?: string;
  is_private?: boolean; // Para filtrar entre privado y compartido
}

export interface MapComponentProps {
  memories?: Memory[];
}

export default function MapComponent({ memories = [] }: MapComponentProps) {
  const [MapModule, setMapModule] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'circulo' | 'extendida' | 'global' | 'personal'>('global');
  const [showWineRegions, setShowWineRegions] = useState(false);
  const [privacyFilter, setPrivacyFilter] = useState<'all' | 'public' | 'private'>('all');

  useEffect(() => {
    let isMounted = true;

    // Inyectar CSS global para los efectos de latido en los círculos de regiones
    if (!document.getElementById('map-custom-animations')) {
      const style = document.createElement('style');
      style.id = 'map-custom-animations';
      style.innerHTML = `
        @keyframes pulse-ring {
          0% { transform: scale(0.95); opacity: 0.4; }
          50% { transform: scale(1.05); opacity: 0.8; }
          100% { transform: scale(0.95); opacity: 0.4; }
        }
        .wine-pulse-circle {
          animation: pulse-ring 3s infinite ease-in-out;
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

      const InteractiveMap = () => {
        // Filtrar memorias según el selector de privacidad
        const filteredMemories = memories.filter((mem) => {
          if (privacyFilter === 'public') return !mem.is_private;
          if (privacyFilter === 'private') return mem.is_private;
          return true; // 'all'
        });

        const centerLat = filteredMemories.length > 0 && filteredMemories[0].latitude ? filteredMemories[0].latitude : 40.416775;
        const centerLng = filteredMemories.length > 0 && filteredMemories[0].longitude ? filteredMemories[0].longitude : -3.70379;

        // Coordenadas para la línea de ruta de viajes
        const routeCoordinates = filteredMemories
          .filter(m => m.latitude && m.longitude)
          .map(m => [m.latitude, m.longitude] as [number, number]);

        // Regiones de Denominación de Origen de España
        const wineRegions = [
          { name: 'D.O. Ca. Rioja', lat: 42.4658, lng: -2.4456, radius: 45000, color: '#f43f5e' },
          { name: 'D.O. Ribera del Duero', lat: 41.6050, lng: -3.8876, radius: 40000, color: '#f43f5e' },
          { name: 'D.O. Rías Baixas', lat: 42.5543, lng: -8.7733, radius: 35000, color: '#38bdf8' },
          { name: 'D.O. Priorat', lat: 41.1333, lng: 0.8333, radius: 25000, color: '#fbbf24' },
          { name: 'D.O. Jerez-Xérès-Sherry', lat: 36.6854, lng: -6.1308, radius: 30000, color: '#fbbf24' },
        ];

        return (
          <div className="relative w-full h-full">
            {/* Controles flotantes superiores */}
            <div className="absolute top-4 left-4 right-4 z-[999] flex flex-wrap items-center justify-between gap-3 pointer-events-none">
              
              {/* Selector de Modos de Red */}
              <div className="pointer-events-auto flex items-center gap-1 bg-zinc-900/90 border border-zinc-800 backdrop-blur-md p-1.5 rounded-2xl shadow-2xl">
                {(['circulo', 'extendida', 'global', 'personal'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-mono capitalize transition ${
                      viewMode === mode
                        ? 'bg-rose-500 text-white font-semibold shadow-lg shadow-rose-950/50'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              {/* Controles Derechos: Privacidad y Capa de Vinos */}
              <div className="pointer-events-auto flex items-center gap-2">
                {/* Selector de Privacidad */}
                <select
                  value={privacyFilter}
                  onChange={(e: any) => setPrivacyFilter(e.target.value)}
                  className="bg-zinc-900/90 text-zinc-300 border border-zinc-800 px-3 py-2 rounded-2xl text-xs font-mono backdrop-blur-md outline-none cursor-pointer hover:border-zinc-700 transition"
                >
                  <option value="all">Red: Todos</option>
                  <option value="public">Red: Compartidos</option>
                  <option value="private">Red: Privados</option>
                </select>

                {/* Botón D.O. Vinos España */}
                <button
                  onClick={() => setShowWineRegions(!showWineRegions)}
                  className={`px-4 py-2 rounded-2xl text-xs font-mono font-semibold backdrop-blur-md border transition flex items-center gap-2 shadow-xl ${
                    showWineRegions
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-rose-950/40'
                      : 'bg-zinc-900/90 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${showWineRegions ? 'bg-rose-400 animate-ping' : 'bg-zinc-500'}`} />
                  <span>D.O. Vinos</span>
                </button>
              </div>
            </div>

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

              {/* Líneas de ruta de viajes conectando las memorias secuencialmente */}
              {routeCoordinates.length > 1 && (
                <RL.Polyline
                  positions={routeCoordinates}
                  pathOptions={{
                    color: '#38bdf8',
                    weight: 3,
                    opacity: 0.8,
                    dashArray: viewMode === 'personal' ? '8, 8' : undefined,
                  }}
                />
              )}

              {/* Regiones de Vino (D.O.) con animación dinámica simulada en propiedades */}
              {showWineRegions && wineRegions.map((region, idx) => (
                <RL.Circle
                  key={idx}
                  center={[region.lat, region.lng]}
                  radius={region.radius}
                  pathOptions={{
                    color: region.color,
                    fillColor: region.color,
                    fillOpacity: 0.25,
                    weight: 2,
                    className: 'wine-pulse-circle',
                  }}
                >
                  <RL.Popup>
                    <div style={{ color: '#000', fontFamily: 'sans-serif', padding: '2px' }}>
                      <strong style={{ fontSize: '12px', display: 'block' }}>{region.name}</strong>
                      <span style={{ fontSize: '10px', color: '#666' }}>Denominación de Origen Protegida</span>
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
                          fillOpacity: 0.06,
                          weight: 1,
                          dashArray: '4, 4',
                        }}
                      />
                    )}

                    <RL.Marker position={[mem.latitude, mem.longitude]}>
                      <RL.Popup>
                        <div style={{ color: '#000', fontFamily: 'sans-serif', minWidth: '140px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '9px', background: '#f43f5e', color: '#fff', padding: '1px 6px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                              {mem.category || 'Memoria'}
                            </span>
                            <span style={{ fontSize: '9px', color: mem.is_private ? '#d97706' : '#0284c7', fontWeight: 'bold' }}>
                              {mem.is_private ? 'Privado' : 'Compartido'}
                            </span>
                          </div>
                          <strong style={{ display: 'block', fontSize: '13px', marginTop: '4px', color: '#18181b' }}>
                            {mem.title}
                          </strong>
                          {mem.description && (
                            <p style={{ fontSize: '11px', color: '#52525b', margin: '4px 0 0 0', lineHeight: '1.3' }}>
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
          </div>
        );
      };

      setMapModule(() => InteractiveMap);
    });

    return () => {
      isMounted = false;
    };
  }, [memories, viewMode, showWineRegions, privacyFilter]);

  if (!MapModule) {
    return (
      <div className="w-full h-[calc(100vh-4rem)] bg-zinc-950 flex items-center justify-center text-zinc-500 font-mono text-xs">
        Cargando red cartográfica Atlas...
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-4rem)] relative bg-zinc-950 overflow-hidden">
      <MapModule />
    </div>
  );
}
