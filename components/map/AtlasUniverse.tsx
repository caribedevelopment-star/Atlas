'use client';

import { useEffect, useMemo } from 'react';
import { BookOpen, MapPinned, Orbit, Plane, Sparkles, Store, Users, Wine, X } from 'lucide-react';
import type { AtlasMapSnapshot } from '@/types/map';

export function AtlasUniverse({ snapshot, onClose }: { snapshot: AtlasMapSnapshot; onClose: () => void }) {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const keydown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', keydown);
    return () => { document.body.style.overflow = previous; window.removeEventListener('keydown', keydown); };
  }, [onClose]);

  const stats = useMemo(() => {
    const mine = snapshot.points.filter((point) => point.source === 'mine');
    const memories = mine.filter((point) => point.layer === 'memories');
    const restaurants = mine.filter((point) => point.layer === 'restaurants');
    const trips = mine.filter((point) => point.layer === 'trips');
    const wines = mine.filter((point) => point.layer === 'wines');
    const shared = snapshot.points.filter((point) => point.source === 'shared' && (point.layer === 'memories' || point.layer === 'trips' || point.layer === 'restaurants'));
    const countries = new Set<string>();
    const cities = new Set<string>();

    [...memories, ...restaurants].forEach((point) => {
      if (point.memory?.country) countries.add(point.memory.country);
      if (point.memory?.city) cities.add(point.memory.city);
    });
    trips.forEach((point) => point.trip?.stops.forEach((stop) => {
      if (stop.country) countries.add(stop.country);
      if (stop.city) cities.add(stop.city);
    }));

    return [
      { label: 'Países', value: countries.size, detail: 'visitados', icon: Plane },
      { label: 'Ciudades', value: cities.size, detail: 'en tu mapa', icon: MapPinned },
      { label: 'Memorias', value: memories.length, detail: 'guardadas', icon: Sparkles },
      { label: 'Viajes', value: trips.length, detail: 'conectados', icon: Orbit },
      { label: 'Restaurantes', value: restaurants.length, detail: 'para volver', icon: Store },
      { label: 'Vinos', value: wines.length, detail: 'en tu Atlas', icon: Wine },
      { label: 'Compartidos', value: shared.length, detail: 'contigo', icon: Users },
    ];
  }, [snapshot]);

  return <div className="atlas-universe-enter fixed inset-0 z-[4000] overflow-hidden bg-[#020205] text-white" role="dialog" aria-modal="true" aria-label="Tu universo Atlas">
    <div className="atlas-universe-nebula absolute inset-0" />
    <div className="atlas-universe-stars absolute inset-0" />
    <div className="atlas-universe-stars atlas-universe-stars-far absolute inset-0" />
    <div className="atlas-universe-organism atlas-universe-organism-a" aria-hidden="true" />
    <div className="atlas-universe-organism atlas-universe-organism-b" aria-hidden="true" />
    <div className="atlas-universe-organism atlas-universe-organism-c" aria-hidden="true" />

    <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between p-4 sm:p-6">
      <div className="rounded-full border border-white/10 bg-black/25 px-3.5 py-2 backdrop-blur-2xl">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.2em] text-white/55"><span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-50"/><span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-300"/></span>Organismo Atlas</div>
      </div>
      <button type="button" onClick={onClose} aria-label="Volver al mapa" className="group flex h-11 items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3.5 text-sm font-medium text-white/75 shadow-2xl backdrop-blur-2xl transition hover:bg-white/10 hover:text-white active:scale-95"><X className="h-4 w-4 transition group-hover:rotate-90"/><span className="hidden sm:inline">Volver al mapa</span></button>
    </header>

    <main className="relative flex h-full min-h-[620px] items-center justify-center px-4 py-24">
      <div className="atlas-universe-system relative h-[min(78vw,720px)] w-[min(92vw,820px)] max-h-[72dvh] min-h-[480px] min-w-[340px]">
        <div className="atlas-universe-orbit atlas-universe-orbit-a absolute left-1/2 top-1/2 h-[84%] w-[84%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[.055]" />
        <div className="atlas-universe-orbit atlas-universe-orbit-b absolute left-1/2 top-1/2 h-[64%] w-[64%] -translate-x-1/2 -translate-y-1/2 rounded-[48%_52%_55%_45%/57%_43%_57%_43%] border border-dashed border-cyan-200/[.09]" />
        <div className="atlas-universe-orbit atlas-universe-orbit-c absolute left-1/2 top-1/2 h-[45%] w-[45%] -translate-x-1/2 -translate-y-1/2 rounded-[55%_45%_43%_57%/42%_59%_41%_58%] border border-white/[.055]" />

        <div className="atlas-universe-core absolute left-1/2 top-1/2 z-10 flex h-[190px] w-[190px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-[48%_52%_46%_54%/55%_45%_55%_45%] text-center sm:h-[230px] sm:w-[230px]">
          <span className="atlas-universe-core-glow absolute -inset-12 rounded-full" />
          <span className="atlas-universe-cell-membrane" aria-hidden="true" />
          <span className="atlas-universe-cell-membrane" aria-hidden="true" />
          <span className="relative flex h-12 w-12 items-center justify-center rounded-[44%_56%_52%_48%/58%_43%_57%_42%] border border-white/15 bg-white/[.07] shadow-2xl backdrop-blur-xl"><Orbit className="h-6 w-6 text-cyan-100"/></span>
          <strong className="relative mt-4 text-3xl font-semibold tracking-[-.06em] sm:text-4xl">Atlas</strong>
          <span className="relative mt-1 max-w-[150px] text-xs leading-5 text-white/45">Tu vida como un organismo de lugares, personas y recuerdos.</span>
        </div>

        {stats.map((stat, index) => <UniverseStat key={stat.label} {...stat} index={index} total={stats.length} />)}
      </div>
    </main>

    <div className="absolute inset-x-4 bottom-5 z-30 mx-auto flex max-w-xl items-center justify-center gap-2 rounded-[1.4rem] border border-white/[.08] bg-black/25 px-4 py-3 text-center text-[11px] leading-5 text-white/40 shadow-2xl backdrop-blur-2xl sm:bottom-7"><BookOpen className="h-3.5 w-3.5 shrink-0 text-white/35"/><span>Cada memoria añade una célula; los viajes aparecen como conexiones cuando existe contexto entre esos lugares.</span></div>
  </div>;
}

function UniverseStat({ label, value, detail, icon: Icon, index, total }: { label: string; value: number; detail: string; icon: typeof Orbit; index: number; total: number }) {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  const radiusX = 43;
  const radiusY = 39;
  const left = 50 + radiusX * Math.cos(angle);
  const top = 50 + radiusY * Math.sin(angle);
  const depth = Math.sin(angle);
  return <div className="atlas-universe-stat absolute z-20 -translate-x-1/2 -translate-y-1/2" style={{ left: `${left}%`, top: `${top}%`, animationDelay: `${index * -0.7}s`, ['--atlas-stat-scale' as string]: String(.88 + (depth + 1) * .075) }}>
    <div className="min-w-[100px] rounded-[1.35rem] border border-white/[.1] bg-white/[.05] p-3 text-center shadow-[0_18px_55px_rgba(0,0,0,.35)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:border-cyan-100/20 hover:bg-white/[.085] sm:min-w-[120px] sm:p-4">
      <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-[43%_57%_51%_49%/55%_46%_54%_45%] border border-white/10 bg-white/[.05] text-cyan-100"><Icon className="h-3.5 w-3.5"/></span>
      <strong className="mt-2 block text-2xl font-semibold tracking-[-.04em] sm:text-3xl">{value}</strong>
      <span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-[.12em] text-white/60 sm:text-[10px]">{label}</span>
      <span className="mt-0.5 block text-[9px] text-white/30">{detail}</span>
    </div>
  </div>;
}
