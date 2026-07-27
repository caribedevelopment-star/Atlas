import Image from 'next/image';
import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { PlusIcon, MapPinIcon } from '@/components/icons';
import { memories } from '@/lib/data';

const pins = [
  { id: 'lisbon', top: '34%', left: '44%' },
  { id: 'tuscany', top: '30%', left: '53%' },
  { id: 'santorini', top: '40%', left: '58%' },
  { id: 'kyoto', top: '36%', left: '84%' },
];

export default function HomePage() {
  return (
    <AppShell>
      <header className="flex items-center justify-between px-5 pb-3 pt-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-olive">
            Your world
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">ATLAS</h1>
        </div>
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          {memories.length} places
        </span>
      </header>

      <section className="px-5">
        <div className="relative overflow-hidden rounded-lg border border-border bg-card shadow-soft">
          <div className="relative aspect-[3/4] w-full">
            <Image
              src="/images/world-map.png"
              alt="A minimalist world map showing the places you have visited"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 448px) 100vw, 448px"
            />

            {pins.map((pin) => (
              <Link
                key={pin.id}
                href={`/memories/${pin.id}`}
                aria-label={`Open memory: ${pin.id}`}
                className="absolute -translate-x-1/2 -translate-y-full"
                style={{ top: pin.top, left: pin.left }}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-burgundy text-burgundy-foreground shadow-soft-lg ring-4 ring-background/60 transition-transform hover:scale-110">
                  <MapPinIcon width={18} height={18} />
                </span>
              </Link>
            ))}
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-card/90 to-transparent p-5">
            <p className="text-sm leading-relaxed text-foreground/80">
              Tap a marker to revisit a moment.
            </p>
          </div>
        </div>
      </section>

      <section className="px-5 pt-6">
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">
          Recently added
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
          {memories.map((m) => (
            <Link
              key={m.id}
              href={`/memories/${m.id}`}
              className="group w-40 shrink-0"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-md border border-border bg-muted shadow-soft">
                <Image
                  src={m.image || '/placeholder.svg'}
                  alt={m.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="160px"
                />
              </div>
              <p className="mt-2 line-clamp-1 text-sm font-medium">{m.title}</p>
              <p className="text-xs text-muted-foreground">{m.location}</p>
            </Link>
          ))}
        </div>
      </section>

      <Link
        href="/memories/new"
        className="fixed bottom-24 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-olive px-6 py-3.5 text-sm font-semibold text-olive-foreground shadow-soft-lg transition-transform active:scale-95"
      >
        <PlusIcon width={18} height={18} strokeWidth={2.2} />
        New Memory
      </Link>
    </AppShell>
  );
}
