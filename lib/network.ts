import { supabase } from '@/lib/supabase';
import { NetworkUser } from '@/components/profile/NetworkCircles';

interface ProfileRow {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

export async function fetchUserNetwork(currentUserId: string): Promise<NetworkUser[]> {
  try {
    // 1. Obtener los perfiles registrados
    const { data: profiles, error: profileErr } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .neq('id', currentUserId);

    if (profileErr || !profiles) {
      console.error('Error al obtener perfiles:', profileErr);
      return [];
    }

    // 2. Obtener las relaciones guardadas por el usuario actual
    const { data: relationships } = await supabase
      .from('user_relationships')
      .select('target_user_id, relationship')
      .eq('user_id', currentUserId);

    const relMap = new Map<string, 'circle' | 'network' | 'public'>();
    relationships?.forEach((r) => {
      relMap.set(r.target_user_id, r.relationship as 'circle' | 'network' | 'public');
    });

    // 3. Mapear usuarios con su relación (por defecto 'public')
    return (profiles as ProfileRow[]).map((p) => ({
      id: p.id,
      username: p.username || 'usuario',
      full_name: p.full_name || 'Usuario Atlas',
      avatar_url: p.avatar_url || undefined,
      relationship: relMap.get(p.id) || 'public',
    }));
  } catch (err) {
    console.error('Error en fetchUserNetwork:', err);
    return [];
  }
}

export async function updateUserRelationship(
  currentUserId: string,
  targetUserId: string,
  newRelationship: 'circle' | 'network' | 'public'
) {
  const { error } = await supabase
    .from('user_relationships')
    .upsert(
      {
        user_id: currentUserId,
        target_user_id: targetUserId,
        relationship: newRelationship,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,target_user_id' }
    );

  if (error) {
    console.error('Error al actualizar relación:', error.message);
    throw error;
  }
}
