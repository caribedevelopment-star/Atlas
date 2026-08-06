import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';
export function ProfileEmptyState({ title, description, icon: Icon = Inbox }: { title: string; description: string; icon?: LucideIcon }) { return <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-center"><Icon className="mx-auto h-7 w-7 text-zinc-500" aria-hidden="true" /><h3 className="mt-3 font-medium text-white">{title}</h3><p className="mt-1 text-sm text-zinc-500">{description}</p></div>; }
