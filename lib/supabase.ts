import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// El cliente SSR mantiene la sesión en cookies compartidas con middleware y Route Handlers.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
