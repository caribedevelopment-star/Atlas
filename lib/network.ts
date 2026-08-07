import { supabase } from '@/lib/supabase';

export type FriendshipState = 'none' | 'pending_outgoing' | 'pending_incoming' | 'friends';

export interface NetworkUser {
  id: string;
  username: string;
  fullName: string;
  avatarUrl?: string;
  friendship: FriendshipState;
  friendshipId?: string;
}

type FriendshipRow = {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'declined';
};

export async function fetchUserNetwork(currentUserId: string): Promise<NetworkUser[]> {
  const [profilesResult, friendshipsResult] = await Promise.all([
    supabase.from('profiles').select('id,username,full_name,avatar_url').neq('id', currentUserId),
    supabase.from('friendships').select('id,requester_id,addressee_id,status').or(`requester_id.eq.${currentUserId},addressee_id.eq.${currentUserId}`),
  ]);

  if (profilesResult.error) throw profilesResult.error;
  if (friendshipsResult.error) throw friendshipsResult.error;

  const byUser = new Map<string, { state: FriendshipState; id: string }>();
  ((friendshipsResult.data ?? []) as FriendshipRow[]).forEach((row) => {
    const other = row.requester_id === currentUserId ? row.addressee_id : row.requester_id;
    if (row.status === 'accepted') byUser.set(other, { state: 'friends', id: row.id });
    else if (row.status === 'pending') byUser.set(other, { state: row.requester_id === currentUserId ? 'pending_outgoing' : 'pending_incoming', id: row.id });
  });

  return (profilesResult.data ?? []).map((profile) => {
    const relation = byUser.get(profile.id);
    return {
      id: profile.id,
      username: profile.username || '',
      fullName: profile.full_name || profile.username || 'Usuario Atlas',
      avatarUrl: profile.avatar_url || undefined,
      friendship: relation?.state ?? 'none',
      friendshipId: relation?.id,
    };
  }).sort((a, b) => friendshipRank(a.friendship) - friendshipRank(b.friendship) || a.fullName.localeCompare(b.fullName, 'es'));
}

export async function sendFriendRequest(targetUserId: string): Promise<void> {
  const { error } = await supabase.rpc('atlas_send_friend_request', { target_user_id: targetUserId });
  if (error) throw new Error(error.message || 'No se pudo enviar la solicitud.');
}

export async function respondFriendRequest(friendshipId: string, accept: boolean): Promise<void> {
  const { error } = await supabase.rpc('atlas_respond_friend_request', { friendship_id: friendshipId, accept_request: accept });
  if (error) throw new Error(error.message || 'No se pudo responder la solicitud.');
}

export async function removeFriend(friendUserId: string): Promise<void> {
  const { error } = await supabase.rpc('atlas_remove_friend', { friend_user_id: friendUserId });
  if (error) throw new Error(error.message || 'No se pudo eliminar la amistad.');
}

export async function listShareableUsers(): Promise<NetworkUser[]> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error('Debes iniciar sesión para seleccionar participantes.');
  const users = await fetchUserNetwork(data.user.id);
  return users.filter((user) => user.friendship === 'friends');
}

function friendshipRank(value: FriendshipState) {
  if (value === 'pending_incoming') return 0;
  if (value === 'friends') return 1;
  if (value === 'pending_outgoing') return 2;
  return 3;
}
