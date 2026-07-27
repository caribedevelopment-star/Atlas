import { getUser, type User } from '@/lib/data';

const colorMap: Record<User['color'], string> = {
  olive: 'bg-olive text-olive-foreground',
  burgundy: 'bg-burgundy text-burgundy-foreground',
  slate: 'bg-foreground text-background',
};

export function Avatar({
  userId,
  size = 32,
  className = '',
}: {
  userId: string;
  size?: number;
  className?: string;
}) {
  const user = getUser(userId);
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full font-medium ring-2 ring-background ${colorMap[user.color]} ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      aria-hidden="true"
    >
      {user.initials}
    </span>
  );
}

export function ParticipantStack({
  userIds,
  size = 28,
}: {
  userIds: string[];
  size?: number;
}) {
  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {userIds.map((id) => (
          <Avatar key={id} userId={id} size={size} />
        ))}
      </div>
    </div>
  );
}

export function ParticipantRow({ userIds }: { userIds: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {userIds.map((id) => {
        const user = getUser(id);
        return (
          <li
            key={id}
            className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-3 shadow-soft"
          >
            <Avatar userId={id} size={26} />
            <span className="text-xs font-medium">{user.name}</span>
          </li>
        );
      })}
    </ul>
  );
}
