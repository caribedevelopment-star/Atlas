'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';


export default function LandingPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function signIn() {
    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      router.push('/home');
    }

    setLoading(false);
  }

  async function signUp() {
    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Cuenta creada. Revisa tu correo.');
    }

    setLoading(false);
  }

  async function signInGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/home`,
      },
    });
  }
  
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col overflow-x-hidden bg-background px-4 sm:px-6">
      <div className="flex flex-1 flex-col items-center justify-center px-1 py-10 text-center">
        <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.24em] text-olive sm:mb-6 sm:text-xs sm:tracking-[0.3em]">
          A personal memory journal
        </p>

        <h1 className="text-[clamp(3.25rem,18vw,4.5rem)] font-semibold tracking-[0.02em]">ATLAS</h1>

        <p className="mt-4 max-w-xs text-pretty text-base leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg">
          Places disappear. Stories remain.
        </p>
      </div>

      <div className="pb-[max(2rem,env(safe-area-inset-bottom))]">
       <div className="space-y-3.5 sm:space-y-4">

  <input
    type="email"
    placeholder="Correo electrónico"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    className="min-h-12 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-base outline-none focus:border-olive"
  />

  <input
    type="password"
    placeholder="Contraseña"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    className="min-h-12 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-base outline-none focus:border-olive"
  />

  <button
    onClick={signIn}
    disabled={loading}
    className="min-h-12 w-full rounded-2xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-soft-lg transition active:scale-[0.99] disabled:opacity-60 sm:py-4"
  >
    Entrar
  </button>

  <button
    onClick={signInGoogle}
    className="min-h-12 w-full rounded-2xl border border-gray-300 bg-white px-6 py-3.5 text-sm font-semibold transition active:scale-[0.99] sm:py-4"
  >
    Continuar con Google
  </button>

  <button
    onClick={signUp}
    className="min-h-11 w-full rounded-2xl text-sm font-medium text-muted-foreground hover:underline"
  >
    Crear una cuenta
  </button>

  {message && (
    <p className="text-center text-sm text-red-500">
      {message}
    </p>
  )}

</div>
        <p className="mt-5 text-center text-xs leading-relaxed text-muted-foreground">
          No followers. No likes. No noise.
          <br />
          Only the moments worth keeping.
        </p>
      </div>
    </main>
  );
}
