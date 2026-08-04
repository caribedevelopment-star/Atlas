'use client';

import { useEffect, useState } from 'react';

export interface Memory {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  description?: string;
  category?: string;
}

export interface MapComponentProps {
  memories?: Memory[];
}

export default function MapComponent({ memories = [] }: MapComponentProps) {
  const [MapModule, setMapModule] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'circulo' | 'extendida' | 'global' | 'personal'>('global');
  const [showWineRegions, setShowWineRegions] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Inyectar CSS de Leaflet de forma limpia
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

      // Limpiar iconos por defecto
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const InteractiveMap = () => {
        const centerLat = memories.length > 0 && memories[0].latitude ? memories[0].latitude : 40.416775;
        const centerLng = memories.length > 0 && memories[0].longitude ? memories[0].longitude : -3.70379;

        // Extraer coordenadas ordenadas para pintar la línea de rutas de viajes
        const routeCoordinates = memories
          .filter(m => m.latitude && m.longitude)
          .map(m => [m.latitude, m.longitude] as [number, number]);

        // Regiones ficticias/principales de D.O. de Vino de España para la capa interactiva
        const wineRegions = [
          { name: 'D.O. Ca. Rioja', lat: 42.4658, lng: -2.4456, radius: 45000, color: '#f43f5e' },
          { name: 'D.O. Ribera del Duero', lat: 41.6050, lng: -3.8876, radius: 40000, color: '#f43f5e' },
          { name: 'D.O. Rías Baixas', lat: 42.5543, lng: -8.7733, radius: 35000, color: '#38bdf8' },
          { name: 'D.O. Priorat', lat: 41.1333, lng: 0.8333, radius: 25000, color: '#fbbf24' },
          { name: 'D.O. Jerez-Xérès-Sherry', lat: 36.6854, lng: -6.1308, radius: 30000, color: '#fbbf24' },
        ];

        return (
          <div className="relative w-full h-full">
            {/* Controles flotantes superiores: Modos de Red y Botón de Vinos */}
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

              {/* Botón de Capa de Vinos (D.O. España) */}
              <button
                pointer-events-auto
                onClick={() => setShowWineRegions(!showWineRegions)}
                className={`pointer-events-auto px-4 py-2 rounded-2xl text-xs font-mono font-semibold backdrop-blur-md border transition flex items-center gap-2 shadow-xl ${
                  showWineRegions
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-rose-950/40'
                    : 'bg-zinc-900/90 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${showWineRegions ? 'bg-rose-400 animate-ping' : 'bg-zinc-500'}`} />
                <span>D.O. Vinos España</span>
              </button>
            </div>

            {/* Mapa Base */}
            <RL.MapContainer
              center={[centerLat, centerLng]}
              zoom={viewMode === 'circulo' ? 9 : viewMode === 'extendida' ? 7 : 5}
              scrollWheelZoom={true}
              style={{ width: '100%', height: '100%', background: '#09090b' }}
            >
              {/* Capa de CartoDB Dark Matter */}
              <RL.TileLayer
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />

              {/* Línea de ruta de viajes conectando las memorias */}
              {routeCoordinates.length > 1 && (
                <RL.Polyline
                  positions={routeCoordinates}
                  pathOptions={{
                    color: '#38bdf8',
                    weight: 3,
                    opacity: 0.7,
                    dashArray: viewMode === 'personal' ? '6, 6' : undefined,
                  }}
                />
              )}

              {/* Capa condicional de Regiones de Vino (D.O.) */}
              {showWineRegions && wineRegions.map((region, idx) => (
                <RL.Circle
                  key={idx}
                  center={[region.lat, region.lng]}
                  radius={region.radius}
                  pathOptions={{
                    color: region.color,
                    fillColor: region.color,
                    fillOpacity: 0.2,
                    weight: 1.5,
                  }}
                >
                  <RL.Popup>
                    <div style={{ color: '#000', fontFamily: 'sans-serif', padding: '2px' }}>
                      <strong style={{ fontSize: '12px', display: 'block' }}>{region.name}</strong>
                      <span style={{ fontSize: '10px', color: '#666' }}>Región Denominación de Origen</span>
                    </div>
                  </RL.Popup>
                </RL.Circle>
              ))}

              {/* Pines de Memorias con diseño neón personalizado */}
              {memories.map((mem) => {
                if (!mem.latitude || !mem.longitude) return null;

                // Radio del círculo de influencia según el modo de red seleccionado
                const circleRadius = viewMode === 'circulo' ? 15000 : viewMode === 'extendida' ? 35000 : 60000;

                return (
                  <div key={mem.id}>
                    {/* Anillo de radar para los modos círculo/red */}
                    {viewMode !== 'personal' && (
                      <RL.Circle
                        center={[mem.latitude, mem.longitude]}
                        radius={circleRadius}
                        pathOptions={{
                          color: '#38bdf8',
                          fillColor: '#38bdf8',
                          fillOpacity: 0.05,
                          weight: 1,
                          dashArray: '4, 4',
                        }}
                      />
                    )}

                    <RL.Marker position={[mem.latitude, mem.longitude]}>
                      <RL.Popup>
                        <div style={{ color: '#000', fontFamily: 'sans-serif', minWidth: '140px' }}>
                          <span style={{ fontSize: '9px', background: '#f43f5e', color: '#fff', padding: '1px 6px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                            {mem.category || 'Memoria'}
                          </span>
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
  }, [memories, viewMode, showWineRegions]);

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
