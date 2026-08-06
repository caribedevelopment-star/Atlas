import type React from 'react';
import { Wine } from 'lucide-react';
import { cx } from './utils';

export interface WineEmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function WineEmptyState({
  title = 'No hay vinos todavía',
  description = 'Guarda tus botellas favoritas para construir una biblioteca visual lista para recomendaciones, mapas y perfiles.',
  action,
  className,
  ...props
}: WineEmptyStateProps) {
  return (
    <div className={cx('rounded-[2rem] border border-dashed border-white/12 bg-white/[0.035] p-8 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]', className)} {...props}>
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-red-300/20 bg-red-500/10 text-red-100">
        <Wine className="h-5 w-5" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-zinc-400">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
