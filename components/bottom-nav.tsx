'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MapPin, Store, User, Wine } from 'lucide-react';

const ITEMS = [{ label: 'Mapa', href: '/home', icon: Home }, { label: 'Memorias', href: '/memories', icon: MapPin }, { label: 'Mesas', href: '/restaurants', icon: Store }, { label: 'Vinos', href: '/wines', icon: Wine }, { label: 'Perfil', href: '/profile', icon: User }];

export default function BottomNav() {
  const pathname = usePathname();
  const active = (href: string) => pathname === href || pathname?.startsWith(`${href}/`);
  return <nav aria-label="Navegación principal" className="fixed inset-x-2 bottom-2 z-[1200] rounded-[1.45rem] border border-white/[.09] bg-zinc-950/82 px-1.5 py-1.5 shadow-[0_18px_55px_rgba(0,0,0,.42)] backdrop-blur-2xl md:hidden"><div className="mx-auto flex max-w-md items-center justify-around">{ITEMS.map((item) => {
    const Icon = item.icon; const selected = active(item.href);
    return <Link key={item.href} href={item.href} aria-current={selected ? 'page' : undefined} className={`relative flex min-w-0 flex-1 flex-col items-center gap-1 rounded-[1.05rem] px-1 py-2 text-[9px] font-medium transition-all active:scale-95 ${selected ? 'bg-white text-zinc-950 shadow-[0_5px_18px_rgba(0,0,0,.24)]' : 'text-zinc-500 hover:bg-white/[.04] hover:text-zinc-300'}`}>
      <span className="relative"><Icon className={`h-[19px] w-[19px] ${selected ? 'stroke-[2.3]' : 'stroke-[1.6]'}`} aria-hidden="true" />{selected && <span className="absolute -right-1.5 -top-1 h-1.5 w-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,.8)]"/>}</span>
      <span className="truncate">{item.label}</span>
    </Link>;
  })}</div></nav>;
}
