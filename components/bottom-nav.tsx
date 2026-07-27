'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MapIcon,
  MemoriesIcon,
  WineIcon,
  ArticlesIcon,
  ProfileIcon,
} from './icons';

const items = [
  { href: '/home', label: 'Map', Icon: MapIcon },
  { href: '/memories', label: 'Memories', Icon: MemoriesIcon },
  { href: '/wines', label: 'Wines', Icon: WineIcon },
  { href: '/articles', label: 'Articles', Icon: ArticlesIcon },
  { href: '/profile', label: 'Profile', Icon: ProfileIcon },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/85 backdrop-blur-xl"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-2 pb-[env(safe-area-inset-bottom)] pt-2">
        {items.map(({ href, label, Icon }) => {
          const active =
            pathname === href || pathname.startsWith(href + '/');
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`flex flex-col items-center gap-1 rounded-md py-1.5 text-[11px] font-medium transition-colors ${
                  active
                    ? 'text-olive'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon width={22} height={22} strokeWidth={active ? 1.9 : 1.6} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
