import Image from 'next/image';
import { AppShell, PageHeader } from '@/components/app-shell';
import { BookIcon, DownloadIcon } from '@/components/icons';
import { books } from '@/lib/data';

export default function BooksPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Reading room"
        title="Books"
        description="A small shelf of PDFs on wine, travel, and memory — open to read or download."
      />

      <div className="space-y-5 px-5 pt-2">
        {books.map((book, i) => (
          <article
            key={book.id}
            className="flex gap-4 rounded-lg border border-border bg-card p-4 shadow-soft"
          >
            <div className="relative h-36 w-24 shrink-0 overflow-hidden rounded-md bg-muted">
              <Image
                src={book.cover || '/placeholder.svg'}
                alt={`Cover of ${book.title}`}
                fill
                priority={i === 0}
                className="object-cover"
                sizes="96px"
              />
            </div>

            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-xs font-medium uppercase tracking-[0.14em] text-olive">
                {book.category}
              </span>
              <h2 className="mt-1 text-pretty text-lg font-semibold leading-snug">
                {book.title}
              </h2>
              <p className="text-sm text-muted-foreground">{book.author}</p>
              <p className="mt-2 line-clamp-2 text-pretty text-sm leading-relaxed text-muted-foreground">
                {book.description}
              </p>

              <div className="mt-auto flex items-center justify-between pt-3">
                <span className="text-xs text-muted-foreground">
                  {`PDF · ${book.pages} pages · ${book.size}`}
                </span>
                <div className="flex items-center gap-2">
                  <a
                    href={book.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-full bg-olive px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
                  >
                    <BookIcon width={14} height={14} strokeWidth={1.8} />
                    Read
                  </a>
                  <a
                    href={book.file}
                    download
                    aria-label={`Download ${book.title}`}
                    className="flex items-center justify-center rounded-full border border-border bg-background p-1.5 text-foreground transition-colors hover:bg-muted"
                  >
                    <DownloadIcon width={16} height={16} strokeWidth={1.8} />
                  </a>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
