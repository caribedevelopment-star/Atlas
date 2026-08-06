'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MapIcon,
  MemoriesIcon,
  WineIcon,
  ArticlesIcon,
  BookIcon,
  ProfileIcon,
} from './icons';

const items = [
  { href: '/home', label: 'Map', Icon: MapIcon },
  { href: '/memories', label: 'Memories', Icon: MemoriesIcon },
  { href: '/wines', label: 'Wines', Icon: WineIcon },
  { href: '/articles', label: 'Articles', Icon: ArticlesIcon },
  { href: '/books', label: 'Books', Icon: BookIcon },
  { href: '/profile', label: 'Profile', Icon: ProfileIcon },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/90 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 backdrop-blur-xl"
    >
      <ul className="mx-auto grid max-w-md grid-cols-6 items-stretch gap-1">
        {items.map(({ href, label, Icon }) => {
          const active =
            pathname === href || pathname.startsWith(href + '/');
          return (
            <li key={href} className="min-w-0">
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`flex min-h-[3rem] flex-col items-center justify-center gap-0.5 rounded-2xl px-1 py-1.5 text-[10px] font-medium transition-colors sm:text-[11px] ${
                  active
                    ? 'bg-olive/10 text-olive'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon width={21} height={21} strokeWidth={active ? 2 : 1.6} />
                <span className="max-w-full truncate leading-none">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
