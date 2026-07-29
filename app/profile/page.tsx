import Image from 'next/image';
import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import {
  MemoriesIcon,
  WineIcon,
  ArticlesIcon,
  MapPinIcon,
  ArrowRightIcon,
} from '@/components/icons';
import { profile } from '@/lib/data';

const stats = [
  { label: 'Memories', value: profile.stats.memories, Icon: MemoriesIcon },
  { label: 'Wines Added', value: profile.stats.winesAdded, Icon: WineIcon },
  {
    label: 'Articles Written',
    value: profile.stats.articlesWritten,
    Icon: ArticlesIcon,
  },
  {
    label: 'Countries Visited',
    value: profile.stats.countriesVisited,
    Icon: MapPinIcon,
  },
];

const links = [
  { label: 'Your memories', href: '/memories' },
  { label: 'Your wines', href: '/wines' },
  { label: 'Your articles', href: '/articles' },
];

export default function ProfilePage() {
  return (
    <AppShell>
      <header className="flex flex-col items-center px-5 pt-10 text-center">
        <div className="relative h-24 w-24 overflow-hidden rounded-full border border-border bg-muted shadow-soft">
          <Image
            src={profile.avatar || '/placeholder.svg'}
            alt={`${profile.userId}'s avatar`}
            fill
            priority
            className="object-cover"
            sizes="96px"
          />
        </div>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">
          {profile.userId}
        </h1>
        <p className="text-sm text-muted-foreground">@{profile.userId}</p>
        <p className="mt-3 max-w-xs text-pretty text-sm leading-relaxed text-muted-foreground">
          {profile.userId}
        </p>
      </header>

      <section className="px-5 pt-8">
        <div className="grid grid-cols-2 gap-3">
          {stats.map(({ label, value, Icon }) => (
            <div
              key={label}
              className="rounded-lg border border-border bg-card p-4 shadow-soft"
            >
              <Icon width={20} height={20} className="text-olive" />
              <p className="mt-3 text-3xl font-semibold tracking-tight">
                {value}
              </p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 pt-6">
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-soft">
          {links.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center justify-between px-4 py-4 text-sm font-medium transition-colors hover:bg-muted/50 ${
                i !== links.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              {link.label}
              <ArrowRightIcon
                width={16}
                height={16}
                className="text-muted-foreground"
              />
            </Link>
          ))}
        </div>
      </section>

      <div className="px-5 pt-6">
        <Link
          href="/"
          className="block w-full rounded-lg border border-border bg-card px-6 py-3.5 text-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Sign out
        </Link>
      </div>
    </AppShell>
  );
}
