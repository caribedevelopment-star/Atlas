import { supabase } from '@/lib/supabase';
import type { ProfileAccess, ProfileLibraryItem } from '@/types/profile';

type Row = Record<string, unknown>;
export async function listProfileLibraryItems(profileId: string, access: ProfileAccess): Promise<ProfileLibraryItem[]> {
  const { data, error } = await supabase.from('library_items').select('*').eq('user_id', profileId).order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).flatMap((value) => {
    const row = value as Row; const raw = row.visibility;
    const visibility = raw === 'private' ? 'private' : raw === 'friends' || raw === 'circle' || raw === 'network' ? 'friends' : 'public';
    if (access !== 'owner' && visibility === 'private') return [];
    if (access === 'public' && visibility === 'friends') return [];
    return [{ id: String(row.id), userId: typeof row.user_id === 'string' ? row.user_id : undefined, title: typeof row.title === 'string' ? row.title : 'Elemento', visibility, createdAt: typeof row.created_at === 'string' ? row.created_at : undefined }];
  });
}
