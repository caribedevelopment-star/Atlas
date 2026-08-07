'use client';

import { useCallback, useEffect, useState } from 'react';
import { fetchUserNetwork, removeFriend, respondFriendRequest, sendFriendRequest, type NetworkUser } from '@/lib/network';

export function useProfileNetwork(userId?: string, enabled = true) {
  const [users, setUsers] = useState<NetworkUser[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId || !enabled) return;
    setLoading(true);
    setError(null);
    try { setUsers(await fetchUserNetwork(userId)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudieron cargar tus amigos.'); }
    finally { setLoading(false); }
  }, [enabled, userId]);

  useEffect(() => { void refresh(); }, [refresh]);

  const run = useCallback(async (targetId: string, action: () => Promise<void>) => {
    setSavingId(targetId);
    setError(null);
    try { await action(); await refresh(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo actualizar la amistad.'); throw cause; }
    finally { setSavingId(null); }
  }, [refresh]);

  return {
    users,
    loading,
    savingId,
    error,
    refresh,
    sendRequest: (targetId: string) => run(targetId, () => sendFriendRequest(targetId)),
    acceptRequest: (user: NetworkUser) => user.friendshipId ? run(user.id, () => respondFriendRequest(user.friendshipId!, true)) : Promise.resolve(),
    declineRequest: (user: NetworkUser) => user.friendshipId ? run(user.id, () => respondFriendRequest(user.friendshipId!, false)) : Promise.resolve(),
    remove: (targetId: string) => run(targetId, () => removeFriend(targetId)),
  };
}
