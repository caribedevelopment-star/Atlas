import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { Rating } from '@/components/rating';
import {
  ArrowLeftIcon,
  MapPinIcon,
  CalendarIcon,
  LockIcon,
  UsersIcon,
  WineIcon,
  ArrowRightIcon,
} from '@/components/icons';
import { memories, getMemory, getWine, averageRating } from '@/lib/data';

export function generateStaticParams() {
  return memories.map((m) => ({ id: m.id }));
}

export default function MemoryDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const memory = getMemory(params.id);
  if (!memory) notFound();

  const wine = getWine(memory.relatedWineId);

  return (
    <AppShell>
      <div className="relative">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
          <Image
            src={memory.image || '/placeholder.svg'}
            alt={memory.title}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 448px) 100vw, 448px"
          />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
            <Link
              href="/memories"
              aria-label="Back to memories"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-background/85 backdrop-blur transition-transform active:scale-95"
            >
              <ArrowLeftIcon width={18} height={18} />
            </Link>
            <span className="flex items-center gap-1.5 rounded-full bg-background/85 px-3 py-1.5 text-xs font-medium backdrop-blur">
              {memory.shared ? (
                <>
                  <UsersIcon width={14} height={14} className="text-olive" />
                  Shared
                </>
              ) : (
                <>
                  <LockIcon width={14} height={14} className="text-muted-foreground" />
                  Private
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      <article className="px-5">
        <div className="-mt-8 rounded-lg border border-border bg-card p-5 shadow-soft">
          <h1 className="text-pretty text-2xl font-semibold leading-tight">
            {memory.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPinIcon width={15} height={15} className="text-olive" />
              {memory.city}, {memory.country}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarIcon width={15} height={15} className="text-olive" />
              {memory.date}
            </span>
          </div>
        </div>

        <section className="pt-6">
          <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-olive">
            The story
          </h2>
          <p className="text-pretty leading-relaxed text-foreground/90">
            {memory.story}
          </p>
        </section>

        {wine && (
          <section className="pt-6">
            <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-olive">
              Related wine
            </h2>
            <Link
              href="/wines"
              className="flex items-center gap-4 rounded-lg border border-border bg-card p-3 shadow-soft transition-transform active:scale-[0.99]"
            >
              <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                <Image
                  src={wine.image || '/placeholder.svg'}
                  alt={wine.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-xs text-burgundy">
                  <WineIcon width={14} height={14} />
                  {wine.type}
                </div>
                <p className="mt-0.5 truncate font-semibold">{wine.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {wine.region}, {wine.country}
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                  <Rating value={averageRating(wine)} size={13} />
                  <span className="text-xs text-muted-foreground">
                    {averageRating(wine)}
                  </span>
                </div>
              </div>
              <ArrowRightIcon
                width={18}
                height={18}
                className="shrink-0 text-muted-foreground"
              />
            </Link>
          </section>
        )}

        <section className="pt-6">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-olive">
            Gallery
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {memory.gallery.map((src, i) => (
              <div
                key={i}
                className="relative aspect-square overflow-hidden rounded-md border border-border bg-muted"
              >
                <Image
                  src={src || '/placeholder.svg'}
                  alt={`${memory.title} — photo ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="200px"
                />
              </div>
            ))}
          </div>
        </section>
      </article>
    </AppShell>
  );
}
