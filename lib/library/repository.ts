import { supabase } from '@/lib/supabase';
import type { ProfileAccess, ProfileLibraryItem } from '@/types/profile';

type Row = Record<string, unknown>;

interface DriveBook { id: string; title: string; viewUrl: string }

export async function importDriveBooks(): Promise<{ imported: number; skipped: number; total: number }> {
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) throw new Error('Debes iniciar sesión para importar tu biblioteca.');
  const response = await fetch('/api/library/drive');
  const result = await response.json() as { files?: DriveBook[]; error?: string };
  if (!response.ok || !result.files) throw new Error(result.error ?? 'No se pudo leer la carpeta de Drive.');
  const ids = result.files.map((file) => file.id);
  const { data: existing, error: existingError } = await supabase.from('library_items').select('drive_file_id').in('drive_file_id', ids);
  if (existingError) throw existingError;
  const known = new Set((existing ?? []).map((item) => item.drive_file_id).filter(Boolean));
  const pending = result.files.filter((file) => !known.has(file.id));
  if (pending.length) {
    const publishedDate = new Date().toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
    const rows = pending.map((file) => ({
      title: file.title,
      subtitle: null,
      author: 'Biblioteca Personal',
      type: 'my_book_pdf',
      status: 'backlog',
      category: 'Libros',
      description: null,
      drive_file_id: file.id,
      published_date: publishedDate,
      read_progress: 0,
    }));
    const { error } = await supabase.from('library_items').insert(rows);
    if (error) throw new Error(`Supabase no pudo importar los libros: ${error.message}`);
  }
  return { imported: pending.length, skipped: result.files.length - pending.length, total: result.files.length };
}

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
