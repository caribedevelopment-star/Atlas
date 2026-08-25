'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { BookOpen, CircleDot, MapPinned, Orbit, Plane, Sparkles, Store, Users, Wine, X } from 'lucide-react';
import type { AtlasMapSnapshot } from '@/types/map';
import { useProfile } from '@/hooks/use-profile';
import { useProfileNetwork } from '@/hooks/use-profile-network';
import type { NetworkAudience, NetworkUser } from '@/lib/network';

const audienceMeta: Record<NetworkAudience, { label: string; detail: string; color: string; radiusX: number; radiusY: number }> = {
  close: { label: 'Círculo íntimo', detail: 'Tus vínculos elegidos', color: '#a7f3d0', radiusX: 22, radiusY: 17 },
  nearby: { label: 'Cercanos', detail: 'Amigos y memorias compartidas', color: '#7dd3fc', radiusX: 34, radiusY: 27 },
  public: { label: 'Atlas público', detail: 'Personas que puedes descubrir', color: '#c4b5fd', radiusX: 47, radiusY: 38 },
};

export function AtlasUniverse({ snapshot, onClose }: { snapshot: AtlasMapSnapshot; onClose: () => void }) {
  const profile = useProfile();
  const network = useProfileNetwork(profile.data?.viewerId, Boolean(profile.data?.viewerId));
  const people = network.users.slice(0, 24);
  const stats = useUniverseStats(snapshot);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const keydown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', keydown);
    return () => { document.body.style.overflow = previous; window.removeEventListener('keydown', keydown); };
  }, [onClose]);

  return createPortal(<div className="atlas-universe-enter fixed inset-0 z-[10000] overflow-hidden bg-[#020205] text-white" role="dialog" aria-modal="true" aria-label="Tu universo Atlas">
    <Image src="/images/universe/atlas-abstract-particle-field-v3.png" alt="Campo abstracto de partículas y nebulosas de Atlas" fill priority sizes="100vw" className="atlas-universe-background object-cover object-center" />
    <Image src="/images/universe/atlas-abstract-particle-field-v3.png" alt="" fill priority sizes="100vw" className="atlas-universe-background-secondary object-cover object-center" aria-hidden="true" />
    <div className="atlas-universe-depth absolute inset-0" aria-hidden="true" />

    <header className="absolute inset-x-0 top-0 z-40 flex items-center justify-between p-4 sm:p-6">
      <div className="rounded-full border border-white/10 bg-black/35 px-3.5 py-2 shadow-2xl backdrop-blur-2xl"><div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.2em] text-white/65"><span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-40"/><span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-300"/></span>Tu universo Atlas</div></div>
      <button type="button" onClick={onClose} aria-label="Volver al mapa" className="group flex h-11 items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3.5 text-sm font-medium text-white/75 shadow-2xl backdrop-blur-2xl transition hover:bg-white/10 hover:text-white active:scale-95"><X className="h-4 w-4 transition group-hover:rotate-90"/><span className="hidden sm:inline">Volver al mapa</span></button>
    </header>

    <main className="relative z-20 grid h-full min-h-[620px] grid-cols-1 items-center gap-4 px-3 pb-20 pt-20 lg:grid-cols-[230px_minmax(560px,1fr)_250px] lg:px-6 lg:pb-7 lg:pt-24">
      <UniverseStats stats={stats} />
      <section className="atlas-universe-system relative mx-auto h-[min(72dvh,760px)] w-full max-w-[900px] min-h-[500px]" aria-label="Círculos sociales de Atlas">
        <SocialRing audience="public" />
        <SocialRing audience="nearby" />
        <SocialRing audience="close" />

        <div className="atlas-universe-core absolute left-1/2 top-1/2 z-20 flex h-[150px] w-[150px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full text-center sm:h-[180px] sm:w-[180px]">
          <span className="atlas-universe-core-glow absolute -inset-12 rounded-full" />
          <span className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-black/40 text-xs font-semibold shadow-2xl backdrop-blur-xl">{profile.data?.profile.avatarUrl ? <Image src={profile.data.profile.avatarUrl} alt="" fill unoptimized={profile.data.profile.avatarUrl.startsWith('http')} className="object-cover" /> : <Orbit className="h-5 w-5 text-cyan-100" />}</span>
          <strong className="relative mt-3 text-xl font-semibold tracking-[-.05em] sm:text-2xl">Tu Atlas</strong>
          <span className="relative mt-1 max-w-[120px] text-[9px] leading-4 text-white/45">El centro es privado. Tú decides qué sale de aquí.</span>
        </div>

        {people.map((person) => <UniversePerson key={person.id} person={person} peers={people.filter((item) => item.audience === person.audience)} />)}
        {!network.loading && people.length === 0 && <div className="absolute left-1/2 top-[20%] -translate-x-1/2 rounded-full border border-white/10 bg-black/35 px-4 py-2 text-[10px] text-white/45 backdrop-blur-xl">Añade personas para poblar tus órbitas.</div>}
      </section>
      <UniverseLegend users={people} loading={network.loading} />
    </main>

    <div className="absolute inset-x-3 bottom-3 z-40 mx-auto flex max-w-2xl items-center justify-center gap-2 rounded-[1.25rem] border border-white/[.08] bg-black/35 px-4 py-2.5 text-center text-[10px] text-white/45 shadow-2xl backdrop-blur-2xl lg:hidden"><BookOpen className="h-3.5 w-3.5"/><span>Íntimos, cercanos y público son niveles de relación; las memorias siguen compartiéndose de forma explícita.</span></div>
  </div>, document.body);
}

function UniversePerson({ person, peers }: { person: NetworkUser; peers: NetworkUser[] }) {
  const index = peers.findIndex((item) => item.id === person.id);
  const meta = audienceMeta[person.audience];
  const angle = (index / Math.max(peers.length, 1)) * Math.PI * 2 - Math.PI / 2 + ({ close: .2, nearby: .65, public: 1.05 }[person.audience]);
  const left = 50 + meta.radiusX * Math.cos(angle);
  const top = 50 + meta.radiusY * Math.sin(angle);
  const depth = (Math.sin(angle) + 1) / 2;
  const scale = .82 + depth * .28;
  const isFriend = person.friendship === 'friends';
  return <div className="atlas-universe-person absolute z-30 -translate-x-1/2 -translate-y-1/2" style={{ left: `${left}%`, top: `${top}%`, ['--atlas-person-scale' as string]: String(scale), zIndex: Math.round(24 + depth * 18), animationDelay: `${index * -.62}s` }}>
    <Link href={`/profile/${person.id}`} className="group block text-center focus:outline-none" title={`${person.fullName} · ${meta.label}`}>
      <span className="relative mx-auto flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border bg-zinc-950 text-[10px] font-semibold text-white shadow-[0_15px_36px_rgba(0,0,0,.6)] transition duration-300 group-hover:scale-110 sm:h-12 sm:w-12" style={{ borderColor: `${meta.color}88`, boxShadow: `0 0 30px ${meta.color}24,0 15px 36px rgba(0,0,0,.6)` }}>{person.avatarUrl?<Image src={person.avatarUrl} alt={`Avatar de ${person.fullName}`} fill unoptimized={person.avatarUrl.startsWith('http')} className="object-cover"/>:person.fullName.slice(0,2).toUpperCase()}<span className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/10"/></span>
      <span className="mt-1.5 hidden max-w-[92px] truncate rounded-full border border-white/[.08] bg-black/45 px-2 py-1 text-[8px] font-medium text-white/65 backdrop-blur-xl sm:block">{person.fullName}</span>
      {isFriend&&<span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full border-2 border-zinc-950" style={{backgroundColor:meta.color}}/>}
    </Link>
  </div>;
}

function SocialRing({ audience }: { audience: NetworkAudience }) {
  const meta = audienceMeta[audience];
  const size = audience === 'close' ? '38%' : audience === 'nearby' ? '64%' : '90%';
  return <div className={`atlas-universe-orbit atlas-universe-orbit-${audience} pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border`} style={{ width: size, height: size, borderColor: `${meta.color}24`, boxShadow: `inset 0 0 70px ${meta.color}08,0 0 42px ${meta.color}08` }}><span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-white/[.08] bg-black/45 px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[.16em] backdrop-blur-xl" style={{ color: `${meta.color}cc` }}>{meta.label}</span></div>;
}

function UniverseLegend({ users, loading }: { users: NetworkUser[]; loading: boolean }) {
  return <aside className="hidden self-center rounded-[1.6rem] border border-white/[.09] bg-black/35 p-4 shadow-[0_30px_80px_rgba(0,0,0,.35)] backdrop-blur-2xl lg:block"><p className="text-[9px] font-semibold uppercase tracking-[.2em] text-white/35">Cómo leerlo</p><h2 className="mt-2 text-lg font-semibold tracking-[-.03em]">Círculos sociales</h2><p className="mt-2 text-[10px] leading-5 text-white/35">La distancia expresa cercanía social. No cambia la privacidad de cada memoria.</p><div className="mt-4 space-y-2.5">{(['close','nearby','public'] as NetworkAudience[]).map((audience)=>{const meta=audienceMeta[audience];const count=users.filter((user)=>user.audience===audience).length;return <div key={audience} className="rounded-xl border border-white/[.06] bg-white/[.025] p-3"><div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{backgroundColor:meta.color,boxShadow:`0 0 12px ${meta.color}`}}/><strong className="flex-1 text-[11px] font-medium">{meta.label}</strong><span className="text-[10px] tabular-nums text-white/35">{loading?'—':count}</span></div><p className="mt-1 pl-4 text-[9px] leading-4 text-white/25">{meta.detail}</p></div>})}</div><div className="mt-4 flex items-start gap-2 border-t border-white/[.07] pt-4 text-[9px] leading-4 text-white/30"><Users className="mt-0.5 h-3.5 w-3.5 shrink-0"/><span>El aro luminoso marca amistad aceptada. El resto es descubrimiento público.</span></div></aside>;
}

function UniverseStats({ stats }: { stats: Array<{ label: string; value: number; icon: typeof Orbit }> }) {
  return <aside className="hidden self-center rounded-[1.6rem] border border-white/[.09] bg-black/35 p-4 shadow-[0_30px_80px_rgba(0,0,0,.35)] backdrop-blur-2xl lg:block"><p className="text-[9px] font-semibold uppercase tracking-[.2em] text-white/35">Tu constelación</p><div className="mt-3 grid grid-cols-2 gap-2">{stats.map(({label,value,icon:Icon})=><div key={label} className="rounded-xl border border-white/[.06] bg-white/[.025] p-3"><Icon className="h-3.5 w-3.5 text-cyan-100/55"/><strong className="mt-3 block text-xl tracking-[-.04em]">{value}</strong><span className="mt-0.5 block text-[8px] uppercase tracking-[.12em] text-white/30">{label}</span></div>)}</div></aside>;
}

function useUniverseStats(snapshot: AtlasMapSnapshot) {
  return useMemo(() => {
    const mine = snapshot.points.filter((point) => point.source === 'mine');
    const memories = mine.filter((point) => point.layer === 'memories');
    const trips = mine.filter((point) => point.layer === 'trips');
    const wines = mine.filter((point) => point.layer === 'wines');
    const restaurants = mine.filter((point) => point.layer === 'restaurants');
    const countries = new Set<string>();
    memories.forEach((point) => { if (point.memory?.country) countries.add(point.memory.country); });
    trips.forEach((point) => point.trip?.stops.forEach((stop) => { if (stop.country) countries.add(stop.country); }));
    return [{ label: 'Países', value: countries.size, icon: Plane }, { label: 'Memorias', value: memories.length, icon: Sparkles }, { label: 'Viajes', value: trips.length, icon: MapPinned }, { label: 'Vinos', value: wines.length, icon: Wine }, { label: 'Mesas', value: restaurants.length, icon: Store }, { label: 'Personas', value: snapshot.participants.length, icon: CircleDot }];
  }, [snapshot]);
}
