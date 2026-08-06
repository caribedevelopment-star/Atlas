import { supabase } from '@/lib/supabase';

export interface NetworkUser { id: string; username: string; fullName: string; avatarUrl?: string; relationship: 'accepted' | 'public' }
type RelationshipRow = { user_id?: string; target_user_id?: string; requester_id?: string; addressee_id?: string; relationship?: string; status?: string };

export async function fetchUserNetwork(currentUserId: string): Promise<NetworkUser[]> {
  const [profilesResult, relationshipsResult] = await Promise.all([
    supabase.from('profiles').select('id,username,full_name,avatar_url').neq('id', currentUserId),
    supabase.from('user_relationships').select('*').or(`user_id.eq.${currentUserId},target_user_id.eq.${currentUserId}`),
  ]);
  if (profilesResult.error) throw profilesResult.error;
  if (relationshipsResult.error) throw relationshipsResult.error;
  const rows = (relationshipsResult.data ?? []) as RelationshipRow[];
  const blocked = new Set<string>(); const accepted = new Set<string>(); const circleDirections = new Map<string, number>();
  rows.forEach((row) => { const other = row.user_id === currentUserId ? row.target_user_id : row.target_user_id === currentUserId ? row.user_id : row.requester_id === currentUserId ? row.addressee_id : row.requester_id; if (!other) return; const state = row.status ?? row.relationship; if (state === 'blocked') blocked.add(other); if (state === 'accepted') accepted.add(other); if (state === 'circle') circleDirections.set(other, (circleDirections.get(other) ?? 0) + 1); });
  circleDirections.forEach((count, id) => { if (count >= 2) accepted.add(id); });
  return (profilesResult.data ?? []).flatMap((profile) => blocked.has(profile.id) ? [] : [{ id: profile.id, username: profile.username || '', fullName: profile.full_name || profile.username || '', avatarUrl: profile.avatar_url || undefined, relationship: accepted.has(profile.id) ? 'accepted' as const : 'public' as const }]);
}
