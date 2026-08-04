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

// MOCK DE RESPALDO: Si aún no hay usuarios en tu base de datos de Supabase, se muestran estos.
const DEFAULT_NETWORK_USERS: NetworkUser[] = [
  { id: 'usr-1', username: 'camila', full_name: 'Camila R.', relationship: 'circle' },
  { id: 'usr-2', username: 'santiago', full_name: 'Santiago M.', relationship: 'circle' },
  { id: 'usr-3', username: 'mateo_arch', full_name: 'Mateo V.', relationship: 'network' },
  { id: 'usr-4', username: 'lucia_design', full_name: 'Lucía B.', relationship: 'network' },
  { id: 'usr-5', username: 'elena_urban', full_name: 'Elena P.', relationship: 'public' },
  { id: 'usr-6', username: 'david_p', full_name: 'David P.', relationship: 'public' },
];

export async function fetchUserNetwork(currentUserId: string): Promise<NetworkUser[]> {
  if (!supabaseUrl || !supabaseAnonKey) {
    return DEFAULT_NETWORK_USERS;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // 1. Obtener perfiles reales de la BD
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url')
    .neq('id', currentUserId);

  if (error || !profiles || profiles.length === 0) {
    return DEFAULT_NETWORK_USERS;
  }

  // 2. Obtener círculos aceptados
  const { data: circles } = await supabase
    .from('circles')
    .select('requester_id, addressee_id')
    .eq('status', 'accepted')
    .or(`requester_id.eq.${currentUserId},addressee_id.eq.${currentUserId}`);

  const circleUserIds = new Set<string>();
  (circles as CircleRow[] | null)?.forEach((c) => {
    if (c.requester_id !== currentUserId) circleUserIds.add(c.requester_id);
    if (c.addressee_id !== currentUserId) circleUserIds.add(c.addressee_id);
  });

  // 3. Formatear red
  return (profiles as ProfileRow[]).map((p) => ({
    id: p.id,
    username: p.username || 'usuario',
    full_name: p.full_name || '',
    avatar_url: p.avatar_url || undefined,
    relationship: circleUserIds.has(p.id) ? 'circle' : 'public',
  }));
}
