import { supabase } from '@/lib/supabase';
import { NetworkUser } from '@/components/profile/NetworkCircles';

interface ProfileRow {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

const DEFAULT_NETWORK_USERS: NetworkUser[] = [
  { id: 'usr-1', username: 'camila', full_name: 'Camila R.', relationship: 'circle' },
  { id: 'usr-2', username: 'santiago', full_name: 'Santiago M.', relationship: 'circle' },
  { id: 'usr-3', username: 'mateo_arch', full_name: 'Mateo V.', relationship: 'network' },
  { id: 'usr-4', username: 'lucia_design', full_name: 'Lucía B.', relationship: 'network' },
  { id: 'usr-5', username: 'elena_urban', full_name: 'Elena P.', relationship: 'public' },
  { id: 'usr-6', username: 'david_p', full_name: 'David P.', relationship: 'public' },
];

export async function fetchUserNetwork(currentUserId: string): Promise<NetworkUser[]> {
  try {
    // 1. Obtener los demás perfiles registrados en la tabla 'profiles'
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .neq('id', currentUserId);

    // Si ocurre un error o la tabla no tiene datos, retorna el mock por defecto
    if (error || !profiles || profiles.length === 0) {
      console.warn('Usando mock por falta de perfiles en BD:', error?.message);
      return DEFAULT_NETWORK_USERS;
    }

    // 2. Mapear y distribuir a los usuarios reales en los niveles de red
    const relationships: ('circle' | 'network' | 'public')[] = ['circle', 'network', 'public'];

    return (profiles as ProfileRow[]).map((p, index) => ({
      id: p.id,
      username: p.username || 'usuario',
      full_name: p.full_name || '',
      avatar_url: p.avatar_url || undefined,
      relationship: relationships[index % 3], // Distribuye los usuarios entre las 3 órbitas
    }));
  } catch (err) {
    console.error('Error al obtener la red de usuarios:', err);
    return DEFAULT_NETWORK_USERS;
  }
}
