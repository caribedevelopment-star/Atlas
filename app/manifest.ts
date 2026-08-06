import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return { name: 'Atlas — Cartografía Personal', short_name: 'Atlas', description: 'Memorias, vinos y lugares en tu mapa personal.', id: '/home', start_url: '/home', scope: '/', display: 'standalone', background_color: '#09090b', theme_color: '#09090b', orientation: 'portrait-primary', categories: ['travel', 'lifestyle'], icons: [{ src:'/icons/atlas.svg',sizes:'any',type:'image/svg+xml',purpose:'any' },{ src:'/icons/atlas-maskable.svg',sizes:'any',type:'image/svg+xml',purpose:'maskable' }] };
}
