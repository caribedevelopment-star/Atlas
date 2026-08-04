'use client';

import { useEffect, useState } from 'react';

export interface Memory {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  description?: string;
}

export interface MapComponentProps {
  memories?: Memory[];
}

export default function MapComponent({ memories = [] }: MapComponentProps) {
  const [Component, setComponent] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;

    // Cargar estilos de Leaflet directamente en el DOM
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

      // Corregir la ruta de los iconos por defecto de Leaflet
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const LeafletMap = () => {
        const centerLat = memories.length > 0 && memories[0].latitude ? memories[0].latitude : 40.416775;
        const centerLng = memories.length > 0 && memories[0].longitude ? memories[0].longitude : -3.70379;

        return (
          <RL.MapContainer
            center={[centerLat, centerLng]}
            zoom={5}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '100%', borderRadius: '1.5rem' }}
          >
            <RL.TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {memories.map((mem) => {
              if (!mem.latitude || !mem.longitude) return null;
              return (
                <RL.Marker key={mem.id} position={[mem.latitude, mem.longitude]}>
                  <RL.Popup>
                    <div style={{ color: '#000', fontSize: '12px' }}>
                      <strong>{mem.title}</strong>
                      {mem.description && <p style={{ margin: '4px 0 0 0' }}>{mem.description}</p>}
                    </div>
                  </RL.Popup>
                </RL.Marker>
              );
            })}
          </RL.MapContainer>
        );
      };

      setComponent(() => LeafletMap);
    }).catch(err => console.error('Error cargando Leaflet:', err));

    return () => {
      isMounted = false;
    };
  }, [memories]);

  if (!Component) {
    return (
      <div className="w-full h-[600px] bg-zinc-950 border border-zinc-800/80 rounded-3xl flex items-center justify-center text-zinc-500 font-mono text-xs">
        Cargando interfaz de mapa...
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] relative bg-zinc-950 border border-zinc-800/80 rounded-3xl overflow-hidden shadow-2xl">
      <Component />
    </div>
  );
}
