// components/Navbar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Home', href: '/home' },
  { label: 'Memories', href: '/memories' },
  { label: 'Wines', href: '/wines' },
  { label: 'Library', href: '/library' },
  { label: 'Profile', href: '/profile' },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="h-16 border-b border-zinc-800/80 bg-zinc-950 px-6 flex items-center justify-between sticky top-0 z-50">
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-950 font-bold flex items-center justify-center text-sm">
          A
        </div>
        <span className="font-bold tracking-wider text-base text-white">Atlas</span>
      </div>

      {/* Main Nav Links (Sin AI Test) */}
      <nav className="flex items-center gap-1 bg-zinc-900/80 p-1 rounded-xl border border-zinc-800">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
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

      {/* Action Button */}
      <button className="bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all">
        <Plus className="w-3.5 h-3.5 stroke-[3]" />
        <span>Nuevo</span>
      </button>
    </header>
  );
}
