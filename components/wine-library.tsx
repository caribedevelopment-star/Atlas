'use client';

import Image from 'next/image';

// Ajusta según la interfaz que ya tengas en el archivo
interface Wine {
  id: string;
  name: string;
  winery: string;
  image: string;
  isPopular?: boolean;
  vintage?: string | number;
  rating?: number;
}

export function WineLibrary({ wines }: { wines: Wine[] }) {
  // 1. Filtramos los vinos por tipo
  const popularWines = wines.filter((w) => w.isPopular);
  const communityWines = wines.filter((w) => !w.isPopular);

  return (
    <div className="space-y-12 py-6">
      
      {/* SECCIÓN 1: VINOS MÁS VENDIDOS / POPULARES */}
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900">Vinos más populares</h2>
          <p className="text-xs text-gray-500">Etiquetas clásicas del mercado y supermercados</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {popularWines.map((wine) => (
            <div key={wine.id} className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm hover:shadow-md transition">
              <div className="relative h-40 w-full bg-gray-50 rounded-lg mb-2">
                <Image
                  src={wine.image}
                  alt={wine.name}
                  fill
                  className="object-contain p-2" // No recorta la imagen de la botella
                />
              </div>
              <h3 className="font-semibold text-sm text-gray-900 truncate">{wine.name}</h3>
              <p className="text-xs text-gray-500">{wine.winery}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECCIÓN 2: SUBIDOS POR LA COMUNIDAD (FOTOS REALES) */}
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900">Fotos reales de la comunidad</h2>
          <p className="text-xs text-gray-500">Botellas registradas directamente por usuarios</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {communityWines.map((wine) => (
            <div key={wine.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition">
              <div className="relative h-56 w-full bg-gray-900">
                <Image
                  src={wine.image}
                  alt={wine.name}
                  fill
                  className="object-cover" // Hace que la foto real llene la tarjeta
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900">{wine.name}</h3>
                <p className="text-sm text-gray-600">{wine.winery}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
