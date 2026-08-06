import { supabase } from '@/lib/supabase';
import type { ProfileAccess, ProfileLibraryItem } from '@/types/profile';

type Row = Record<string, unknown>;

interface DriveBook { id: string; title: string; viewUrl: string }
export interface LibraryRecord { id:string;title:string;subtitle?:string;author:string;type:'my_article'|'my_book_pdf';status:'reading'|'completed'|'backlog';category:string;description:string;published_date?:string;drive_file_id?:string;read_progress?:number;favorite?:boolean;personal_notes?:string }

export async function listLibraryItems():Promise<LibraryRecord[]>{const {data:auth}=await supabase.auth.getUser();const [{data,error},interactions]=await Promise.all([supabase.from('library_items').select('*').order('created_at',{ascending:false}),auth.user?supabase.from('user_library_items').select('*').eq('user_id',auth.user.id):Promise.resolve({data:[],error:null})]);if(error)throw error;const personal=new Map((interactions.data??[]).map((item)=>[item.library_item_id,item]));return(data??[]).map((item)=>{const own=personal.get(item.id);return{id:item.id,title:item.title,subtitle:item.subtitle??undefined,author:item.author??'Autor desconocido',type:item.type,status:own?.completed?'completed':own?.saved?'reading':'backlog',category:item.category??'General',description:item.description??'',published_date:item.published_date??undefined,drive_file_id:item.drive_file_id??undefined,read_progress:own?.reading_progress??0,favorite:own?.favorite??false,personal_notes:own?.personal_notes??undefined};});}

export async function createLibraryItem(input:Omit<LibraryRecord,'id'|'status'|'read_progress'>){const {data:auth,error:authError}=await supabase.auth.getUser();if(authError||!auth.user)throw new Error('Debes iniciar sesión para añadir un libro.');const {data,error}=await supabase.from('library_items').insert({user_id:auth.user.id,title:input.title,subtitle:input.subtitle??null,author:input.author,type:input.type,category:input.category,description:input.description||null,drive_file_id:input.drive_file_id??null,published_date:input.published_date??null,visibility:'public'}).select('id').single();if(error)throw error;const {error:personalError}=await supabase.from('user_library_items').insert({user_id:auth.user.id,library_item_id:data.id,saved:true,reading_progress:0});if(personalError)throw personalError;}

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
      user_id: auth.user.id,
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
      visibility: 'public',
    }));
    const { data: inserted, error } = await supabase.from('library_items').insert(rows).select('id');
    if (error) throw new Error(`Supabase no pudo importar los libros: ${error.message}`);
    const {error:interactionError}=await supabase.from('user_library_items').insert((inserted??[]).map((item)=>({user_id:auth.user.id,library_item_id:item.id,saved:true,reading_progress:0})));
    if(interactionError)throw new Error(`Los libros se añadieron al catálogo, pero no a tu biblioteca: ${interactionError.message}`);
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
