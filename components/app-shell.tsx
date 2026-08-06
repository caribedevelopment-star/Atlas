import { BottomNav } from './bottom-nav';

export function AppShell({
  children,
  showNav = true,
}: {
  children: React.ReactNode;
  showNav?: boolean;
}) {
  return (
    <div className="mx-auto min-h-screen w-full max-w-md overflow-x-hidden bg-background shadow-[0_0_60px_-40px_rgba(60,55,45,0.45)] sm:border-x sm:border-border">
      <div className={showNav ? 'min-w-0 pb-28 sm:pb-24' : 'min-w-0'}>{children}</div>
      {showNav && <BottomNav />}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="px-4 pb-4 pt-7 sm:px-5 sm:pt-8">
      {eyebrow && (
        <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.18em] text-olive sm:text-xs">
          {eyebrow}
        </p>
      )}
      <h1 className="text-pretty text-[clamp(1.75rem,8vw,2.25rem)] font-semibold tracking-tight">
        {title}
      </h1>
      {description && (
        <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
          {description}
        </p>
      )}
    </header>
  );
}
