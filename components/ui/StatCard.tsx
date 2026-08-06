import React from 'react';
import { Card } from './Card';
import { cn } from './utils';

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  trend?: React.ReactNode;
}

export function StatCard({ label, value, icon, trend, className = '', ...props }: StatCardProps) {
  return (
    <Card className={cn('flex items-start justify-between gap-4', className)} {...props}>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        <div className="mt-2 text-2xl font-bold text-foreground">{value}</div>
        {trend && <div className="mt-2 text-xs text-muted-foreground">{trend}</div>}
      </div>
      {icon && <div className="rounded-2xl border border-surface-border bg-surface-hover p-3 text-muted-foreground">{icon}</div>}
    </Card>
  );
}
