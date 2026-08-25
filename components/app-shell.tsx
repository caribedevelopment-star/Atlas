'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import BottomNav from '@/components/bottom-nav';
import { HelpCircle } from 'lucide-react';
import { AtlasOnboarding } from '@/components/AtlasOnboarding';

const NAV_ITEMS = [
  { label: 'Mapa', href: '/home' },
  { label: 'Memorias', href: '/memories' },
  { label: 'Restaurantes', href: '/restaurants' },
  { label: 'Vinos', href: '/wines' },
  { label: 'Biblioteca', href: '/library' },
  { label: 'Perfil', href: '/profile' },
];

export function AppShell({ children, showNav = true }: { children: React.ReactNode; showNav?: boolean }) {
  const pathname = usePathname();
  const hidden = pathname === '/' || pathname === '/login' || pathname === '/register';
  const active = (href: string) => pathname === href || pathname?.startsWith(`${href}/`);
  if (hidden) return <>{children}</>;

  return <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-zinc-950 font-sans text-zinc-100">
    <div className="atlas-app-ambient" aria-hidden="true" />
    <header className="sticky top-0 z-[1200] grid h-16 shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b border-white/[.07] bg-zinc-950/82 px-4 shadow-[0_8px_30px_rgba(0,0,0,.12)] backdrop-blur-2xl sm:px-6">
      <Link href="/home" aria-label="Ir al mapa de Atlas" className="group flex w-fit items-center gap-3 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300">
        <span className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-white font-mono text-sm font-bold text-zinc-950 shadow-[0_8px_24px_rgba(255,255,255,.08)] transition group-hover:scale-105"><span className="absolute -inset-1 rounded-[.9rem] bg-sky-300/0 blur-md transition group-hover:bg-sky-300/15"/>A</span>
        <span className="flex items-center gap-2 text-sm font-semibold tracking-tight text-white">Atlas<span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-35"/><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400"/></span></span>
      </Link>
      {showNav && <nav aria-label="Navegación principal" className="hidden items-center gap-1 rounded-[1.1rem] border border-white/[.07] bg-white/[.035] p-1 shadow-inner md:flex">{NAV_ITEMS.map((item) => {
        const selected = active(item.href);
        return <Link key={item.href} href={item.href} aria-current={selected ? 'page' : undefined} className={`relative rounded-[.85rem] px-3.5 py-2 text-xs font-medium transition-all ${selected ? 'bg-white text-zinc-950 shadow-[0_5px_18px_rgba(0,0,0,.22)]' : 'text-zinc-500 hover:bg-white/[.05] hover:text-white'}`}>{item.label}{selected && <span className="absolute -bottom-[7px] left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-sky-300"/>}</Link>;
      })}</nav>}
      <button type="button" onClick={()=>window.dispatchEvent(new Event('atlas:open-onboarding'))} aria-label="Abrir guía de Atlas" className="group flex h-9 items-center gap-2 justify-self-end rounded-full border border-white/[.07] bg-white/[.03] px-3 text-[9px] font-medium uppercase tracking-[.14em] text-zinc-500 transition hover:bg-white/[.07] hover:text-white"><HelpCircle className="h-3.5 w-3.5"/><span className="hidden sm:inline">Cómo funciona</span></button>
    </header>
    <main className="relative z-[1] flex w-full flex-1 flex-col pb-20 md:pb-0">{children}</main>
    {showNav && <BottomNav />}
    <AtlasOnboarding />
  </div>;
}

export default AppShell;
