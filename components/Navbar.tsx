'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  // Rutas donde NO queremos que se muestre el Navbar
  const hiddenRoutes = ['/', '/login', '/register'];

  if (hiddenRoutes.includes(pathname)) {
    return null;
  }

  const navItems = [
    { href: '/home', label: 'Home' },
    { href: '/memories', label: 'Memories' },
    { href: '/wines', label: 'Wines' },
    { href: '/library', label: 'Library' },
    { href: '/profile', label: 'Profile' },
  ];

  return (
    // Oculto en móvil (hidden), visible a partir de pantallas medianas (md:flex)
    <header className="hidden md:flex fixed top-4 left-1/2 -translate-x-1/2 z-50 items-center gap-3 bg-zinc-900/80 border border-zinc-800 backdrop-blur-md px-4 py-2 rounded-full shadow-2xl">
      <div className="w-8 h-8 rounded-full bg-white text-zinc-950 font-bold flex items-center justify-center text-xs">
        A
      </div>
      <span className="font-bold text-white text-sm pr-2">Atlas</span>
      <nav className="flex items-center gap-1 bg-zinc-950/60 p-1 rounded-full border border-zinc-800/50">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`px-3 py-1 rounded-full text-xs font-medium transition ${
              pathname === item.href
                ? 'bg-zinc-800 text-white shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
