
'use client';

import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import GoogleButton from './GoogleButton';

interface LoginCardProps {
  isLogin: boolean;
  setIsLogin: (value: boolean) => void;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  loading: boolean;
  message: string;
  handleAuth: (e: React.FormEvent) => void;
}

export default function LoginCard({
  isLogin,
  setIsLogin,
  email,
  setEmail,
  password,
  setPassword,
  loading,
  message,
  handleAuth,
}: LoginCardProps) {
  return (
    <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-8 shadow-2xl">

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white">
          {isLogin ? 'Bienvenido de nuevo' : 'Comienza tu viaje'}
        </h2>

        <p className="text-xs text-stone-400 mt-2">
          {isLogin
            ? 'Accede a tu espacio personal'
            : 'Crea tu repositorio privado'}
        </p>
      </div>

      <div className="flex bg-stone-950 p-1 rounded-xl mb-6 border border-stone-800">

        <button
          type="button"
          onClick={() => setIsLogin(true)}
          className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${
            isLogin
              ? 'bg-stone-800 text-white'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          Iniciar sesión
        </button>

        <button
          type="button"
          onClick={() => setIsLogin(false)}
          className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${
            !isLogin
              ? 'bg-stone-800 text-white'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          Crear cuenta
        </button>

      </div>

      <form onSubmit={handleAuth} className="space-y-4">

        <div className="relative">

          <Mail className="absolute left-3 top-3.5 w-4 h-4 text-stone-500"/>

          <input
            className="w-full rounded-xl bg-stone-950 border border-stone-800 py-3 pl-10 pr-4 text-sm"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
          />

        </div>

        <div className="relative">

          <Lock className="absolute left-3 top-3.5 w-4 h-4 text-stone-500"/>

          <input
            type="password"
            className="w-full rounded-xl bg-stone-950 border border-stone-800 py-3 pl-10 pr-4 text-sm"
            placeholder="Contraseña"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
          />

        </div>

        {message && (

          <div className="rounded-xl border border-red-800 bg-red-950/40 p-3 text-xs text-red-300">
            {message}
          </div>

        )}

        <button
          disabled={loading}
          className="w-full rounded-xl bg-white py-3 text-sm font-bold text-black flex items-center justify-center gap-2"
        >
          {loading
            ? <Loader2 className="w-4 h-4 animate-spin"/>
            : <>
                {isLogin ? 'Entrar' : 'Crear cuenta'}
                <ArrowRight className="w-4 h-4"/>
              </>
          }
        </button>

      </form>

      <div className="my-6 border-t border-stone-800"/>

      <GoogleButton loading={loading}/>

    </div>
  );
}
