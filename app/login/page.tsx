'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setMessage('Por favor, rellena todos los campos.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      if (isLogin) {
        // Sign In
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setMessage(error.message);
        } else {
          router.push('/home');
        }
      } else {
        // Sign Up
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/home`,
          },
        });

        if (error) {
          setMessage(error.message);
        } else {
          setMessage('¡Cuenta creada! Revisa tu correo electrónico para confirmar.');
        }
      }
    } catch (err: any) {
      setMessage(err.message || 'Ocurrió un error inesperado.');
    } finally {
      setLoading(false);
    }
  }

  async function signInGoogle() {
    setMessage('');
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/home`,
        },
      });
    } catch (err: any) {
      setMessage(err.message || 'Error al conectar con Google.');
    }
  }

  return (
    <main className="min-h-screen bg-background flex flex-col justify-center items-center p-6 sm:p-12 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-olive/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-burgundy/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-card border border-border rounded-3xl p-8 shadow-soft-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4 justify-center">
            <div className="w-8 h-8 rounded-lg bg-olive flex items-center justify-center font-bold text-sm text-olive-foreground shadow-soft">
              A
            </div>
            <span className="font-sans text-lg font-bold tracking-[0.25em] text-foreground">ATLAS</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            {isLogin ? 'Bienvenido de nuevo' : 'Comienza tu viaje'}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            {isLogin ? 'Accede a tu cuenta de ATLAS' : 'Crea tu espacio de memorias privado'}
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-muted p-1 rounded-xl mb-6">
          <button
            onClick={() => { setIsLogin(true); setMessage(''); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
              isLogin ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => { setIsLogin(false); setMessage(''); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
              !isLogin ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Crear Cuenta
          </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-muted-foreground/60">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                placeholder="ejemplo@atlas.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-olive/20 focus:border-olive transition placeholder:text-muted-foreground/40 text-foreground"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
              Contraseña
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-muted-foreground/60">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-olive/20 focus:border-olive transition placeholder:text-muted-foreground/40 text-foreground"
              />
            </div>
          </div>

          {message && (
            <div className={`p-3 rounded-xl text-xs font-medium border ${
              message.includes('creada') || message.includes('enviado')
                ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                : 'bg-red-50 text-red-800 border-red-100'
            }`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-stone-800 text-primary-foreground font-semibold rounded-xl py-3 text-sm shadow-soft hover:shadow-soft-lg transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{isLogin ? 'Iniciar Sesión' : 'Registrar Cuenta'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2.5 text-muted-foreground/60 font-medium">O continuar con</span>
          </div>
        </div>

        {/* Social login */}
        <button
          onClick={signInGoogle}
          className="w-full bg-background border border-border hover:bg-muted/40 font-semibold rounded-xl py-3 text-sm transition flex items-center justify-center gap-2.5 text-foreground shadow-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span>Google</span>
        </button>
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground/40 px-4 leading-relaxed max-w-xs relative z-10">
        Places disappear. Stories remain.
      </p>
    </main>
  );
}
