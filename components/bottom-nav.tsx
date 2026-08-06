'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Library, MapPin, User, Wine } from 'lucide-react';

const ITEMS = [{ label: 'Mapa', href: '/home', icon: Home }, { label: 'Memorias', href: '/memories', icon: MapPin }, { label: 'Vinos', href: '/wines', icon: Wine }, { label: 'Biblioteca', href: '/library', icon: Library }, { label: 'Perfil', href: '/profile', icon: User }];

export default function BottomNav() {
  const pathname = usePathname(); const active = (href: string) => pathname === href || pathname?.startsWith(`${href}/`);
  return <nav aria-label="Navegación principal" className="fixed bottom-0 left-0 right-0 z-[1200] border-t border-zinc-800/80 bg-zinc-950/95 px-2 py-2 backdrop-blur-xl md:hidden"><div className="mx-auto flex max-w-md items-center justify-around">{ITEMS.map((item) => { const Icon = item.icon; return <Link key={item.href} href={item.href} aria-current={active(item.href) ? 'page' : undefined} className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl p-2 text-[10px] font-medium transition ${active(item.href) ? 'bg-zinc-800/60 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}><Icon className={`h-5 w-5 ${active(item.href) ? 'stroke-[2.5]' : 'stroke-1.5'}`} aria-hidden="true" /><span className="truncate">{item.label}</span></Link>; })}</div></nav>;
}
