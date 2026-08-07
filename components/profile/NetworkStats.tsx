import { BookOpen, Users, Wine } from 'lucide-react';
import type { ProfileStatistics } from '@/types/profile';

export function NetworkStats({ stats }: { stats: ProfileStatistics }) {
  return <section aria-labelledby="network-title" className="rounded-3xl border border-white/10 bg-zinc-900/50 p-5"><h2 id="network-title" className="flex items-center gap-2 text-lg font-semibold text-white"><Users className="h-5 w-5 text-sky-300" />Conexiones</h2><div className="mt-5 grid grid-cols-2 gap-4"><div><Users className="h-4 w-4 text-zinc-500" /><strong className="mt-2 block text-2xl text-white">{stats.friends}</strong><span className="text-xs text-zinc-500">Amigos</span></div><div><span className="flex gap-1 text-zinc-500"><Wine className="h-4 w-4" /><BookOpen className="h-4 w-4" /></span><strong className="mt-2 block text-2xl text-white">{stats.publicContributions}</strong><span className="text-xs text-zinc-500">Aportes al catálogo</span></div></div><p className="mt-4 text-[11px] leading-4 text-zinc-600">Los amigos sirven para compartir recuerdos concretos. La bodega y la biblioteca pertenecen al espacio público de Atlas.</p></section>;
}
