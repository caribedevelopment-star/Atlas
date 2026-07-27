import Link from 'next/link';
import { ArrowRightIcon } from '@/components/icons';

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background px-6">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <p className="mb-6 text-xs font-medium uppercase tracking-[0.3em] text-olive">
          A personal memory journal
        </p>

        <h1 className="text-6xl font-semibold tracking-[0.02em]">ATLAS</h1>

        <p className="mt-5 max-w-xs text-pretty text-lg leading-relaxed text-muted-foreground">
          Places disappear. Stories remain.
        </p>
      </div>

      <div className="pb-12">
        <Link
          href="/home"
          className="group flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-4 text-base font-medium text-primary-foreground shadow-soft-lg transition-transform active:scale-[0.98]"
        >
          Enter Atlas
          <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />
        </Link>
        <p className="mt-5 text-center text-xs leading-relaxed text-muted-foreground">
          No followers. No likes. No noise.
          <br />
          Only the moments worth keeping.
        </p>
      </div>
    </main>
  );
}
