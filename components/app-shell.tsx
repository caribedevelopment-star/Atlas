'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus } from 'lucide-react';
import BottomNav from '@/components/bottom-nav';

const NAV_ITEMS = [
  { label: 'Home', href: '/home' },
  { label: 'Memories', href: '/memories' },
  { label: 'Wines', href: '/wines' },
  { label: 'Library', href: '/library' },
  { label: 'Profile', href: '/profile' },
];

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen w-full flex flex-col bg-zinc-950 text-zinc-100 font-sans relative overflow-x-hidden">
      
      {/* Header Superior: Exclusivo para Escritorio (md:flex) */}
      <header className="hidden md:flex h-16 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl px-6 items-center justify-between shrink-0 z-50 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white text-zinc-950 font-mono font-bold flex items-center justify-center text-sm shadow-sm">
            A
          </div>
          <span className="font-semibold tracking-tight text-sm text-white">Atlas</span>
        </div>

        <nav className="flex items-center gap-1 bg-zinc-900/60 p-1 rounded-2xl border border-zinc-800/80">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button className="bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all active:scale-95">
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Nuevo</span>
        </button>
      </header>

      {/* Área Principal de Contenido */}
      <main className="flex-1 w-full relative pb-28 md:pb-0">
        {children}
      </main>

      {/* Floating Bottom Nav para Móviles */}
      <BottomNav />
    </div>
  );
}

export default AppShell;
