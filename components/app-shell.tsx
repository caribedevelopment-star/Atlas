'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import BottomNav from '@/components/bottom-nav';
import { ATLAS_NAVIGATION, isNavigationActive } from '@/lib/navigation';

export function AppShell({ children, showNav = true }: { children: React.ReactNode; showNav?: boolean }) {
  const pathname = usePathname();
  const hidden = pathname === '/' || pathname === '/login' || pathname === '/register';
  const active = (href: string) => isNavigationActive(pathname, href);
  if (hidden) return <>{children}</>;

  return <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-zinc-950 font-sans text-zinc-100">
    <header className="sticky top-0 z-[1200] grid h-16 shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b border-zinc-800/80 bg-zinc-950/95 px-4 backdrop-blur-xl sm:px-6">
      <Link href="/home" aria-label="Ir al mapa de Atlas" className="flex items-center gap-3 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white font-mono text-sm font-bold text-zinc-950 shadow-sm">A</span><span className="text-sm font-semibold tracking-tight text-white">Atlas</span></Link>
      {showNav && <nav aria-label="Navegación principal" className="hidden items-center gap-1 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-1 md:flex">{ATLAS_NAVIGATION.map((item) => <Link key={item.href} href={item.href} aria-current={active(item.href) ? 'page' : undefined} className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${active(item.href) ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-white'}`}>{item.label}</Link>)}</nav>}
      <span aria-hidden="true" />
    </header>
    <main className="relative flex w-full flex-1 flex-col pb-16 md:pb-0">{children}</main>
    {showNav && <BottomNav />}
  </div>;
}

export default AppShell;
