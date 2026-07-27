import { BottomNav } from './bottom-nav';

export function AppShell({
  children,
  showNav = true,
}: {
  children: React.ReactNode;
  showNav?: boolean;
}) {
  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-background">
      <div className={showNav ? 'pb-24' : ''}>{children}</div>
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
    <header className="px-5 pb-4 pt-8">
      {eyebrow && (
        <p className="mb-1 text-xs font-medium uppercase tracking-[0.18em] text-olive">
          {eyebrow}
        </p>
      )}
      <h1 className="text-pretty text-3xl font-semibold tracking-tight">
        {title}
      </h1>
      {description && (
        <p className="mt-2 text-pretty leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
    </header>
  );
}
