import { Users } from 'lucide-react';
import type { WineParticipant } from './types';
import { cx } from './utils';

export interface WineParticipantStackProps {
  participants?: WineParticipant[];
  className?: string;
}

export function WineParticipantStack({ participants = [], className }: WineParticipantStackProps) {
  if (participants.length === 0) return null;

  const visibleParticipants = participants.slice(0, 3);
  const overflow = participants.length - visibleParticipants.length;

  return (
    <div className={cx('flex items-center gap-2 text-xs text-zinc-400', className)}>
      <Users className="h-3.5 w-3.5" aria-hidden="true" />
      <div className="flex -space-x-2">
        {visibleParticipants.map((participant) => (
          <span
            key={participant.id}
            className="flex h-6 w-6 items-center justify-center rounded-full border border-zinc-950 bg-zinc-800 text-[10px] font-semibold text-zinc-100"
            title={participant.name}
          >
            {participant.name.slice(0, 2).toUpperCase()}
          </span>
        ))}
        {overflow > 0 && (
          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-zinc-950 bg-zinc-700 text-[10px] font-semibold text-zinc-100">
            +{overflow}
          </span>
        )}
      </div>
    </div>
  );
}
