
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Home", href: "/home" },
  { label: "Memories", href: "/memories" },
  { label: "Wines", href: "/wines" },
  { label: "Library", href: "/library" },
  { label: "AI Test", href: "/ai-test" },
  { label: "Profile", href: "/profile" },
];

export function Navbar() {
  const pathname = usePathname();

  // No mostrar la barra en la página de login
  if (pathname === "/login") return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-surface-border bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand/Logo */}
        <Link href="/home" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-accent text-accent-foreground flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform">
            A
          </div>
          <span className="font-bold tracking-tight text-lg text-foreground">Atlas</span>
        </Link>

        {/* Links de Navegación */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-surface-hover text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface/50"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Acceso Rápido / User indicator */}
        <div className="flex items-center gap-3">
          <Link
            href="/memories/new"
            className="atlas-button-primary text-xs !py-2 !px-3"
          >
            <span>+ Nuevo</span>
          </Link>
        </div>
      </div>

      {/* Navegación Mobile inferior / auxiliar */}
      <nav className="md:hidden flex items-center justify-around border-t border-surface-border py-2 px-2 bg-surface">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`text-xs px-2.5 py-1.5 rounded-lg ${
                isActive ? "bg-surface-hover text-foreground font-semibold" : "text-muted-foreground"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
