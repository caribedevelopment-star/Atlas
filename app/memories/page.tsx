import Image from 'next/image';
import Link from 'next/link';
import { AppShell, PageHeader } from '@/components/app-shell';
import {
  MapPinIcon,
  CalendarIcon,
  LockIcon,
  UsersIcon,
  PlusIcon,
} from '@/components/icons';
import { memories } from '@/lib/data';

export default function MemoriesPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Journal"
        title="Memories"
        description="Every place you have kept, in the order you lived them."
      />

      <div className="space-y-5 px-5 pt-2">
        {memories.map((m) => (
          <Link
            key={m.id}
            href={`/memories/${m.id}`}
            className="group block overflow-hidden rounded-lg border border-border bg-card shadow-soft"
          >
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
              <Image
                src={m.image || '/placeholder.svg'}
                alt={m.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 448px) 100vw, 448px"
              />
              <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-background/85 px-3 py-1 text-xs font-medium backdrop-blur">
                {m.shared ? (
                  <>
                    <UsersIcon width={13} height={13} className="text-olive" />
                    Shared
                  </>
                ) : (
                  <>
                    <LockIcon width={13} height={13} className="text-muted-foreground" />
                    Private
                  </>
                )}
              </span>
            </div>

            <div className="p-4">
              <h2 className="text-pretty text-lg font-semibold leading-snug">
                {m.title}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPinIcon width={14} height={14} />
                  {m.city}
                </span>
                <span className="flex items-center gap-1">
                  <CalendarIcon width={14} height={14} />
                  {m.date}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

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
