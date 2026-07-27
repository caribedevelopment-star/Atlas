'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { SearchIcon, MapPinIcon, UsersIcon } from '@/components/icons';
import { Rating } from '@/components/rating';
import { averageRating, type Wine } from '@/lib/data';

export function WineLibrary({ wines }: { wines: Wine[] }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return wines;
    return wines.filter((w) =>
      [w.name, w.country, w.region, w.type, w.addedBy]
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [query, wines]);

  return (
    <div className="px-5">
      <div className="sticky top-0 z-20 -mx-5 bg-background/90 px-5 pb-3 pt-1 backdrop-blur">
        <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-3 shadow-soft">
          <SearchIcon width={18} height={18} className="text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, region, or type"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            aria-label="Search wines"
          />
        </div>
      </div>

      <div className="space-y-4 pt-2">
        {filtered.map((wine) => {
          const avg = averageRating(wine);
          return (
            <article
              key={wine.id}
              className="overflow-hidden rounded-lg border border-border bg-card shadow-soft"
            >
              <div className="flex gap-4 p-4">
                <div className="relative h-36 w-24 shrink-0 overflow-hidden rounded-md bg-muted">
                  <Image
                    src={wine.image || '/placeholder.svg'}
                    alt={wine.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>

                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="w-fit rounded-full bg-burgundy/10 px-2.5 py-0.5 text-[11px] font-medium text-burgundy">
                    {wine.type}
                  </span>
                  <h2 className="mt-2 text-pretty text-lg font-semibold leading-snug">
                    {wine.name}
                  </h2>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPinIcon width={13} height={13} />
                    {wine.region}, {wine.country}
                  </p>

                  <div className="mt-auto flex items-center gap-2 pt-3">
                    <Rating value={avg} size={15} />
                    <span className="text-sm font-medium">{avg}</span>
                    <span className="text-xs text-muted-foreground">
                      ({wine.ratings.length})
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <UsersIcon width={13} height={13} className="text-olive" />
                  {wine.ratings.length} tasters
                </span>
                <span className="text-xs text-muted-foreground">
                  Added by{' '}
                  <span className="font-medium text-foreground">
                    {wine.addedBy}
                  </span>
                </span>
              </div>
            </article>
          );
        })}

        {filtered.length === 0 && (
          <p className="py-16 text-center text-sm text-muted-foreground">
            No wines match &ldquo;{query}&rdquo;.
          </p>
        )}
      </div>
    </div>
  );
}
