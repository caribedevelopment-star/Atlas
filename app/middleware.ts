
import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Comprobar si existe la cookie de sesión de Supabase
  const sessionToken = request.cookies.get('sb-access-token')?.value || 
                       request.cookies.get('sb-localhost-auth-token')?.value;

  const isProfilePage = request.nextUrl.pathname.startsWith('/profile');
  const isLoginPage = request.nextUrl.pathname.startsWith('/login');

  // Si intenta ir a /profile sin sesión, redirigir a /login
  if (isProfilePage && !sessionToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Si ya tiene sesión e intenta ir a /login, redirigir a /profile
  if (isLoginPage && sessionToken) {
    return NextResponse.redirect(new URL('/profile', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/profile/:path*', '/login'],
};
