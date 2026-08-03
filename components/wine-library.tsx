'use client';

import Image from 'next/image';
import { WineItem } from '@/types/wine';

export function WineLibrary({ wines = [] }: { wines: WineItem[] }) {
  // Separar los vinos por el campo is_popular
  const popularWines = wines.filter((w) => w.is_popular === true);
  const communityWines = wines.filter((w) => !w.is_popular);

  return (
    <div className="space-y-12 py-6">
      {/* SECCIÓN 1: MÁS VENDIDOS EN SUPERMERCADOS */}
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900">🍷 Más vendidos en supermercados</h2>
          <p className="text-xs text-gray-500">Etiquetas clásicas del mercado y referencias de supermercado</p>
        </div>

        {popularWines.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No hay vinos populares disponibles.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {popularWines.map((wine) => (
              <div key={wine.id} className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm hover:shadow-md transition">
                <div className="relative h-44 w-full bg-gray-50 rounded-lg mb-2">
                  <Image
                    src={wine.image_url || '/images/wine-rioja.png'}
                    alt={wine.name}
                    fill
                    className="object-contain p-2"
                  />
                </div>
                <span className="text-[10px] font-bold uppercase text-amber-600 block">
                  {wine.supermarket || 'Supermercado'}
                </span>
                <h3 className="font-semibold text-sm text-gray-900 truncate">{wine.name}</h3>
                <p className="text-xs text-gray-500">{wine.winery}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECCIÓN 2: SUBIDOS POR LOS USUARIOS */}
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900">📸 Subidos por los usuarios</h2>
          <p className="text-xs text-gray-500">Fotos reales guardadas directamente por la comunidad</p>
        </div>

        {communityWines.length === 0 ? (
          <p className="text-sm text-gray-400 italic">Aún no hay vinos subidos por los usuarios.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {communityWines.map((wine) => (
              <div key={wine.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition">
                <div className="relative h-60 w-full bg-gray-900">
                  <Image
                    src={wine.image_url || '/images/wine-rioja.png'}
                    alt={wine.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900">{wine.name}</h3>
                  <p className="text-sm text-gray-600">{wine.winery}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
