'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Wine, User, Sparkles, BookOpen } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/home', label: 'Inicio', icon: Home },
    { href: '/memories', label: 'Mapa', icon: Compass },
    { href: '/wines', label: 'Vinos', icon: Wine },
    { href: '/library', label: 'Biblioteca', icon: BookOpen },
    { href: '/profile', label: 'Perfil', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-800/80 px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2 min-w-[56px] rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-white font-medium bg-zinc-800/50 scale-105'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
              <span className="text-[10px] font-mono mt-1 tracking-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
