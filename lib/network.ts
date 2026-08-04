import { createClient } from '@supabase/supabase-js';
import { NetworkUser } from '@/components/profile/NetworkCircles';

interface ProfileRow {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

interface CircleRow {
  requester_id: string;
  addressee_id: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function fetchUserNetwork(currentUserId: string): Promise<NetworkUser[]> {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // 1. Obtener todos los perfiles excepto el actual
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url')
    .neq('id', currentUserId);

  if (profilesError || !profiles) return [];

  // 2. Obtener los círculos aceptados del usuario actual
  const { data: circles } = await supabase
    .from('circles')
    .select('requester_id, addressee_id')
    .eq('status', 'accepted')
    .or(`requester_id.eq.${currentUserId},addressee_id.eq.${currentUserId}`);

  // Set de IDs pertenecientes al círculo íntimo
  const circleUserIds = new Set<string>();
  (circles as CircleRow[] | null)?.forEach((c: CircleRow) => {
    if (c.requester_id !== currentUserId) circleUserIds.add(c.requester_id);
    if (c.addressee_id !== currentUserId) circleUserIds.add(c.addressee_id);
  });

  // 3. Mapear relación según pertenencia
  return (profiles as ProfileRow[]).map((p: ProfileRow) => {
    let relationship: 'circle' | 'network' | 'public' = 'public';

    if (circleUserIds.has(p.id)) {
      relationship = 'circle';
    } else {
      relationship = 'network';
    }

    return {
      id: p.id,
      username: p.username || 'usuario',
      full_name: p.full_name || '',
      avatar_url: p.avatar_url || undefined,
      relationship,
      memories_count: 0,
    };
  });
}

