'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import BottomNav from '@/components/bottom-nav';
import CreateMemoryModal from '@/components/CreateMemoryModal';

const NAV_ITEMS = [
  { label: 'Home', href: '/home' },
  { label: 'Memories', href: '/memories' },
  { label: 'Wines', href: '/wines' },
  { label: 'Library', href: '/library' },
  { label: 'Profile', href: '/profile' },
];

export interface AppShellProps {
  children: React.ReactNode;
  showNav?: boolean;
}

export function AppShell({ children, showNav = true }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreateSubmit = () => {
    setIsCreateModalOpen(false);
    router.refresh();
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-zinc-950 text-zinc-100 font-sans relative overflow-x-hidden">
      {/* Cabecera Única Consolidada */}
      <header className="h-16 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between shrink-0 z-50 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white text-zinc-950 font-mono font-bold flex items-center justify-center text-sm shadow-sm">
            A
          </div>
          <span className="font-semibold tracking-tight text-sm text-white">Atlas</span>
        </div>

        {/* Navegación central (Solo visible en Escritorio) */}
        {showNav && (
          <nav className="hidden md:flex items-center gap-1 bg-zinc-900/60 p-1 rounded-2xl border border-zinc-800/80">
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
        )}

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Nuevo</span>
        </button>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 w-full relative pb-16 md:pb-0 flex flex-col">
        {children}
      </main>

      {/* Navegación móvil global */}
      <BottomNav />

      {/* Modal global */}
      <CreateMemoryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        availableFriends={[]}
        onSubmit={handleCreateSubmit}
      />
    </div>
  );
}

export default AppShell;
