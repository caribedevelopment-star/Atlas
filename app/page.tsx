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
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background px-6">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <p className="mb-6 text-xs font-medium uppercase tracking-[0.3em] text-olive">
          A personal memory journal
        </p>

        <h1 className="text-6xl font-semibold tracking-[0.02em]">ATLAS</h1>

        <p className="mt-5 max-w-xs text-pretty text-lg leading-relaxed text-muted-foreground">
          Places disappear. Stories remain.
        </p>
      </div>

      <div className="pb-12">
       <div className="space-y-4">

  <input
    type="email"
    placeholder="Correo electrónico"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3"
  />

  <input
    type="password"
    placeholder="Contraseña"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3"
  />

  <button
    onClick={signIn}
    disabled={loading}
    className="w-full rounded-lg bg-primary px-6 py-4 text-primary-foreground shadow-soft-lg"
  >
    Entrar
  </button>

  <button
    onClick={signInGoogle}
    className="w-full rounded-lg border border-gray-300 bg-white px-6 py-4"
  >
    Continuar con Google
  </button>

  <button
    onClick={signUp}
    className="w-full text-sm text-muted-foreground hover:underline"
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
