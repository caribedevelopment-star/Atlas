'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Mail, Lock, Loader2, Compass, Heart, Map, ArrowRight } from 'lucide-react';

export default function LandingPage() {
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
    <main className="min-h-screen bg-stone-950 flex flex-col lg:flex-row text-stone-100">
      {/* Editorial / Left Showcase Panel */}
      <div className="flex-1 lg:flex flex-col justify-between p-8 lg:p-16 bg-stone-900 border-r border-stone-800 relative overflow-hidden select-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#2a2a2a_1px,transparent_1px),linear-gradient(to_bottom,#2a2a2a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8 lg:mb-16">
            <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-900 flex items-center justify-center font-extrabold text-xl shadow-md">
              A
            </div>
            <span className="font-sans text-xl font-black tracking-[0.2em] text-white">ATLAS</span>
          </div>

          <div className="max-w-xl">
            <p className="text-xs font-semibold tracking-[0.3em] uppercase text-stone-400 mb-4">
              A personal memory journal
            </p>
            <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
              Places disappear. <br />
              <span className="text-stone-400 font-serif italic">Stories remain.</span>
            </h1>
            <p className="text-stone-300 text-base lg:text-lg leading-relaxed mb-8 max-w-md">
              Un espacio íntimo y sin ruido social para documentar tus viajes, registrar tus mejores experiencias gastronómicas y guardar los vinos que marcan cada momento de tu vida.
            </p>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 lg:mt-0">
          <div className="p-5 rounded-2xl bg-stone-800/60 border border-stone-700/60 backdrop-blur-sm">
            <div className="p-2 w-10 h-10 rounded-lg bg-stone-700/50 flex items-center justify-center mb-4 text-stone-200">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-stone-100 mb-1">Diario de Viajes</h3>
            <p className="text-xs text-stone-400 leading-normal">Tus memorias geolocalizadas ordenadas cronológicamente.</p>
          </div>

          <div className="p-5 rounded-2xl bg-stone-800/60 border border-stone-700/60 backdrop-blur-sm">
            <div className="p-2 w-10 h-10 rounded-lg bg-stone-700/50 flex items-center justify-center mb-4 text-stone-200">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-stone-100 mb-1">Bodega Abierta</h3>
            <p className="text-xs text-stone-400 leading-normal">Vinos excelentes categorizados por precio y supermercado.</p>
          </div>

          <div className="p-5 rounded-2xl bg-stone-800/60 border border-stone-700/60 backdrop-blur-sm">
            <div className="p-2 w-10 h-10 rounded-lg bg-stone-700/50 flex items-center justify-center mb-4 text-stone-200">
              <Map className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-stone-100 mb-1">Mapa Interactivo</h3>
            <p className="text-xs text-stone-400 leading-normal">Ubica visualmente tus historias sobre el mapa del mundo.</p>
          </div>
        </div>

        <div className="relative z-10 hidden lg:block text-stone-500 text-xs mt-8">
          &copy; {new Date().getFullYear()} Atlas. No followers. No likes. No noise.
        </div>
      </div>

      {/* Right Auth Panel */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16 bg-stone-950 relative">
        <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              {isLogin ? 'Bienvenido de nuevo' : 'Comienza tu viaje'}
            </h2>
            <p className="text-xs text-stone-400 mt-1">
              {isLogin ? 'Accede a tu cuenta personal de Atlas' : 'Crea tu espacio personal e independiente'}
            </p>
          </div>

          {/* Selector de pestañas con alto contraste */}
          <div className="flex bg-stone-950 p-1.5 rounded-xl mb-6 border border-stone-800">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setMessage(''); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                isLogin
                  ? 'bg-stone-800 text-white shadow-sm'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setMessage(''); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                !isLogin
                  ? 'bg-stone-800 text-white shadow-sm'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              Crear Cuenta
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-stone-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="ejemplo@atlas.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-600 focus:border-stone-600 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                Contraseña
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-stone-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-600 focus:border-stone-600 transition"
                />
              </div>
            </div>

            {message && (
              <div className={`p-3 rounded-xl text-xs font-medium border ${
                message.includes('creada') || message.includes('enviado')
                  ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800'
                  : 'bg-red-950/50 text-red-300 border-red-800'
              }`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white hover:bg-stone-200 text-stone-900 font-bold rounded-xl py-3 text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-stone-900" />
              ) : (
                <>
                  <span>{isLogin ? 'Iniciar Sesión' : 'Registrar Cuenta'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-stone-900 px-3 text-stone-500 font-medium tracking-wider">
                O continuar con
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={signInGoogle}
            className="w-full bg-stone-950 border border-stone-800 hover:bg-stone-800/80 font-semibold rounded-xl py-3 text-sm transition flex items-center justify-center gap-2.5 text-stone-200 shadow-sm"
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

        <p className="mt-8 text-center text-xs text-stone-500 px-4 leading-relaxed max-w-xs">
          Al continuar, aceptas que Atlas guarde únicamente tus recuerdos para ti mismo. Sin feed de noticias, sin presión.
        </p>
      </div>
    </main>
  );
}
