import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const requestedNext = requestUrl.searchParams.get('next') ?? '/home';
  const next = requestedNext.startsWith('/') && !requestedNext.startsWith('//') ? requestedNext : '/home';

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=enlace-invalido', requestUrl.origin));
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL('/login?error=confirmacion', requestUrl.origin));
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
