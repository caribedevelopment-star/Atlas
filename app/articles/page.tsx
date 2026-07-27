import Image from 'next/image';
import { AppShell, PageHeader } from '@/components/app-shell';
import { ClockIcon } from '@/components/icons';
import { articles } from '@/lib/data';

export default function ArticlesPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Field notes"
        title="Articles"
        description="Slow reading on places, wine, and the art of remembering."
      />

      <div className="space-y-5 px-5 pt-2">
        {articles.map((article, i) => (
          <article
            key={article.id}
            className="overflow-hidden rounded-lg border border-border bg-card shadow-soft"
          >
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
              <Image
                src={article.cover || '/placeholder.svg'}
                alt={article.title}
                fill
                priority={i === 0}
                className="object-cover"
                sizes="(max-width: 448px) 100vw, 448px"
              />
            </div>
            <div className="p-4">
              <h2 className="text-pretty text-lg font-semibold leading-snug">
                {article.title}
              </h2>
              <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
                {article.excerpt}
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">
                  {article.author}
                </span>
                <span className="flex items-center gap-1.5">
                  <ClockIcon width={13} height={13} />
                  {article.readingTime}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
