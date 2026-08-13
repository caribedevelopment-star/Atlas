'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, Orbit, Sparkles } from 'lucide-react';
import { CompactGatewayGlobe, OrbitalGateway } from '@/components/visuals/OrbitalGateway';

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
      router.push('/home');
    }
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/home` },
    });
  };

  return <main className="atlas-gateway relative min-h-[100dvh] overflow-hidden bg-[#050609] text-white selection:bg-sky-300/20">
    <div className="atlas-gateway-stars absolute inset-0" aria-hidden="true" />
    <div className="absolute left-[-18vw] top-[-25vh] h-[70vh] w-[70vh] rounded-full bg-sky-400/[.07] blur-[120px]" aria-hidden="true" />
    <div className="absolute bottom-[-28vh] right-[-14vw] h-[65vh] w-[65vh] rounded-full bg-rose-400/[.055] blur-[130px]" aria-hidden="true" />

    <div className="relative mx-auto grid min-h-[100dvh] w-full max-w-7xl items-center gap-8 px-4 py-6 sm:px-8 lg:grid-cols-[1.12fr_.88fr] lg:px-12">
      <OrbitalGateway />
      <section className="relative mx-auto w-full max-w-[470px]">
        <CompactGatewayGlobe />
        <div className="atlas-login-card rounded-[2.2rem] border border-white/[.09] bg-zinc-950/64 p-5 shadow-[0_35px_100px_rgba(0,0,0,.52),inset_0_1px_0_rgba(255,255,255,.06)] backdrop-blur-3xl sm:p-7">
          <div className="mb-7">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.22em] text-zinc-500"><Orbit className="h-3.5 w-3.5 text-sky-300" />Atlas</div>
              <div className="flex items-center gap-2 rounded-full border border-emerald-300/10 bg-emerald-300/[.05] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[.14em] text-emerald-300"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />online</div>
            </div>
            <h1 className="mt-5 text-[2.55rem] font-semibold leading-none tracking-[-.055em] text-white sm:text-5xl">{isResetting ? 'Recupera tu Atlas.' : 'Entra en tu mundo.'}</h1>
            <p className="mt-3 max-w-sm text-sm leading-6 text-zinc-500">{isResetting ? 'Te enviaremos un enlace seguro para recuperar el acceso.' : 'Una cartografía viva de lugares, viajes, vinos, recuerdos y personas.'}</p>
          </div>

          {message && <div className={`mb-4 rounded-2xl border p-3 text-xs ${message.type === 'error' ? 'border-red-500/20 bg-red-500/10 text-red-300' : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'}`}>{message.text}</div>}

          {!isResetting && <button type="button" onClick={handleGoogleLogin} className="group flex h-12 w-full items-center justify-center gap-3 rounded-[1.15rem] border border-white/[.09] bg-white/[.055] text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-white/[.085] active:translate-y-0">
            <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z" /><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" /><path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12.5s.7 2.8 1.9 5.2l3.7-2.9z" /><path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16C3.7 19.7 7.5 22.3 12 23z" /></svg>
            Continuar con Google <ArrowRight className="h-3.5 w-3.5 text-zinc-600 transition group-hover:translate-x-0.5 group-hover:text-zinc-300" />
          </button>}

          {!isResetting && <div className="my-5 flex items-center gap-3 text-[9px] font-semibold uppercase tracking-[.18em] text-zinc-700"><div className="h-px flex-1 bg-white/[.07]" /><span>o email</span><div className="h-px flex-1 bg-white/[.07]" /></div>}

          <form onSubmit={handleAuth} className="space-y-3.5">
            <label className="block"><span className="mb-1.5 block px-1 text-[10px] font-medium text-zinc-600">Email</span><span className="relative block overflow-hidden rounded-[1.15rem] border border-white/[.08] bg-black/25 transition focus-within:border-sky-300/30 focus-within:bg-white/[.035] focus-within:ring-4 focus-within:ring-sky-300/[.035]"><Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" /><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" className="h-12 w-full bg-transparent pl-11 pr-4 text-sm text-white outline-none placeholder:text-zinc-700" /></span></label>

            {!isResetting && <div><div className="mb-1.5 flex items-center justify-between px-1"><span className="text-[10px] font-medium text-zinc-600">Contraseña</span><button type="button" onClick={() => setIsResetting(true)} className="text-[10px] text-zinc-500 transition hover:text-white">¿La olvidaste?</button></div><span className="relative block overflow-hidden rounded-[1.15rem] border border-white/[.08] bg-black/25 transition focus-within:border-sky-300/30 focus-within:bg-white/[.035] focus-within:ring-4 focus-within:ring-sky-300/[.035]"><Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" /><input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="h-12 w-full bg-transparent pl-11 pr-4 text-sm text-white outline-none placeholder:text-zinc-700" /></span></div>}

            <button type="submit" disabled={loading} className="group mt-2 flex w-full items-center justify-center gap-2 rounded-[1.2rem] bg-white px-4 py-3.5 text-sm font-semibold text-zinc-950 shadow-[0_16px_40px_rgba(255,255,255,.08)] transition hover:-translate-y-0.5 hover:bg-sky-50 active:translate-y-0 disabled:opacity-50">{loading ? 'Conectando…' : isResetting ? 'Enviar enlace' : 'Entrar en Atlas'}<ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" /></button>
          </form>

          {isResetting && <button type="button" onClick={() => setIsResetting(false)} className="mt-4 w-full text-center text-xs text-zinc-600 transition hover:text-white">Volver al inicio de sesión</button>}
          {!isResetting && <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-zinc-700"><Sparkles className="h-3 w-3" /><span>Tu archivo personal empieza aquí.</span></div>}
        </div>
      </section>
    </div>
  </main>;
}
