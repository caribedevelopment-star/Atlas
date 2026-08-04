'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight } from 'lucide-react';

export default function AuthPage() {
  const [isResetting, setIsResetting] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (isResetting) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
      });
      setLoading(false);
      if (error) setMessage({ text: error.message, type: 'error' });
      else setMessage({ text: 'Enlace enviado a tu email.', type: 'success' });
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage({ text: error.message, type: 'error' });
      setLoading(false);
    } else {
      router.push('/profile');
    }
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <div className="min-h-[100dvh] w-full bg-zinc-950 flex items-center justify-center p-4 sm:p-6 selection:bg-zinc-800">
      <div className="w-full max-w-[400px] bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-6">
        
        <div className="space-y-1.5 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-zinc-800/60 border border-zinc-700/50 mb-2">
            <span className="font-mono text-sm font-bold text-white">A</span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-white">
            {isResetting ? 'Recuperar acceso' : 'Atlas'}
          </h1>
          <p className="text-xs text-zinc-400 font-normal">
            {isResetting ? 'Ingresa tu correo para recibir un enlace' : 'Tu cartografía personal de recuerdos'}
          </p>
        </div>

        {message && (
          <div className={`p-3 text-xs rounded-xl border ${
            message.type === 'error' 
              ? 'bg-red-500/10 border-red-500/20 text-red-400' 
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
          }`}>
            {message.text}
          </div>
        )}

        {!isResetting && (
          <button
            onClick={handleGoogleLogin}
            className="w-full py-2.5 px-4 bg-zinc-800/80 hover:bg-zinc-700/80 text-white font-medium text-xs rounded-2xl border border-zinc-700/60 transition flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z" />
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
              <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12.5s.7 2.8 1.9 5.2l3.7-2.9z" />
              <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16C3.7 19.7 7.5 22.3 12 23z" />
            </svg>
            Continuar con Google
          </button>
        )}

        {!isResetting && (
          <div className="flex items-center gap-3 text-zinc-700 text-[10px] font-mono uppercase">
            <div className="h-[1px] bg-zinc-800/80 flex-1" />
            <span>o email</span>
            <div className="h-[1px] bg-zinc-800/80 flex-1" />
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Email</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alessandro@studio.com"
                className="w-full bg-zinc-950/80 border border-zinc-800/80 rounded-2xl py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition"
              />
            </div>
          </div>

          {!isResetting && (
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Contraseña</label>
                <button
                  type="button"
                  onClick={() => setIsResetting(true)}
                  className="text-[10px] text-zinc-400 hover:text-white transition"
                >
                  ¿Olvidaste?
                </button>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4 h-4 text-zinc-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-950/80 border border-zinc-800/80 rounded-2xl py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs rounded-2xl transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {loading ? 'Procesando...' : isResetting ? 'Enviar enlace' : 'Iniciar Sesión'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {isResetting && (
          <button
            onClick={() => setIsResetting(false)}
            className="w-full text-center text-xs text-zinc-500 hover:text-zinc-300 transition"
          >
            Volver al inicio de sesión
          </button>
        )}
      </div>
    </div>
  );
}
