'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MapPin, Wine, Library, User, Plane } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Home', href: '/home', icon: Home },
  { label: 'Memorias', href: '/memories', icon: MapPin },
  { label: 'Vinos', href: '/wines', icon: Wine },
  { label: 'Viajes', href: '/trips', icon: Plane },
  { label: 'Librería', href: '/library', icon: Library },
  { label: 'Perfil', href: '/profile', icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800/80 px-4 py-2 pb-safe">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname?.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-medium transition-all ${
                isActive
                  ? 'text-white bg-zinc-800/60'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-1.5'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
