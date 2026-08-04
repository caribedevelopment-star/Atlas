'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Wine, BookOpen, User } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/home', label: 'Inicio', icon: Home },
    { href: '/memories', label: 'Mapa', icon: Compass },
    { href: '/wines', label: 'Vinos', icon: Wine },
    { href: '/library', label: 'Librería', icon: BookOpen },
    { href: '/profile', label: 'Perfil', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[9999] pointer-events-none px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-2">
      <nav className="pointer-events-auto max-w-sm mx-auto bg-zinc-900/75 backdrop-blur-2xl border border-zinc-800/80 rounded-3xl p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center justify-around transition-all duration-300">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center py-2 px-3 rounded-2xl transition-all duration-200 active:scale-90 ${
                isActive
                  ? 'text-white font-medium'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {/* Fondo del ítem activo con animación suave */}
              {isActive && (
                <span className="absolute inset-0 bg-zinc-800/80 border border-zinc-700/50 rounded-2xl shadow-inner -z-10 transition-all duration-300" />
              )}

              <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110 text-white' : 'text-zinc-400'}`} />
              <span className={`text-[10px] font-mono mt-1 tracking-tight transition-colors ${isActive ? 'text-white' : 'text-zinc-500'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
