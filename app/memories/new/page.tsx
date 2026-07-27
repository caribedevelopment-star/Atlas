import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import {
  ArrowLeftIcon,
  MapPinIcon,
  CalendarIcon,
  LockIcon,
  UsersIcon,
} from '@/components/icons';

export default function NewMemoryPage() {
  return (
    <AppShell showNav={false}>
      <header className="flex items-center gap-3 px-5 pb-2 pt-8">
        <Link
          href="/home"
          aria-label="Cancel"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card transition-transform active:scale-95"
        >
          <ArrowLeftIcon width={18} height={18} />
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">New Memory</h1>
      </header>

      <form className="space-y-5 px-5 pt-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Photo</span>
          <div className="flex aspect-[16/10] w-full items-center justify-center rounded-lg border border-dashed border-border bg-muted/50 text-sm text-muted-foreground">
            Tap to add a photo
          </div>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Title</span>
          <input
            type="text"
            placeholder="The last light over Oia"
            className="w-full rounded-md border border-border bg-card px-4 py-3 text-sm outline-none transition-colors focus:border-olive"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Location</span>
            <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-3">
              <MapPinIcon width={16} height={16} className="text-olive" />
              <input
                type="text"
                placeholder="City"
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Date</span>
            <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-3">
              <CalendarIcon width={16} height={16} className="text-olive" />
              <input
                type="text"
                placeholder="Month, Year"
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
          </label>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Story</span>
          <textarea
            rows={5}
            placeholder="What made this moment worth keeping?"
            className="w-full resize-none rounded-md border border-border bg-card px-4 py-3 text-sm leading-relaxed outline-none transition-colors focus:border-olive"
          />
        </label>

        <div>
          <span className="mb-1.5 block text-sm font-medium">Visibility</span>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-md border border-olive bg-olive/10 px-4 py-3 text-sm font-medium text-olive"
            >
              <LockIcon width={16} height={16} />
              Private
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-md border border-border bg-card px-4 py-3 text-sm font-medium text-muted-foreground"
            >
              <UsersIcon width={16} height={16} />
              Shared
            </button>
          </div>
        </div>

        <button
          type="button"
          className="w-full rounded-lg bg-primary px-6 py-4 text-base font-medium text-primary-foreground shadow-soft-lg transition-transform active:scale-[0.98]"
        >
          Save Memory
        </button>
      </form>
    </AppShell>
  );
}
