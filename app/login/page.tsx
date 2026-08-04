'use client';

import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Compass, Heart, MapPin } from 'lucide-react';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen w-full flex bg-[#09090b] text-zinc-100 font-sans selection:bg-amber-500/30">
      {/* Panel Izquierdo: Branding & Value Prop */}
      <div className="hidden lg:flex flex-col justify-between w-[55%] p-12 border-r border-zinc-800/60 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] relative overflow-hidden">
        {/* Glow de ambiente */}
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-zinc-100 text-zinc-950 font-bold flex items-center justify-center text-sm shadow-md">
            A
          </div>
          <span className="font-extrabold tracking-widest text-lg text-white">ATLAS</span>
        </div>

        <div className="relative z-10 max-w-xl my-auto py-12 space-y-6">
          <span className="text-[11px] font-bold tracking-[0.2em] text-zinc-400 uppercase block">
            A Personal Memory Journal
          </span>
          <h1 className="text-5xl font-black tracking-tight text-white leading-[1.1]">
            Places disappear.<br />
            <span className="font-serif italic font-normal text-zinc-400">Stories remain.</span>
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-md">
            Un espacio íntimo y sin ruido social para documentar tus viajes, registrar tus mejores experiencias gastronómicas y guardar los vinos que marcan cada momento de tu vida.
          </p>

          <div className="grid grid-cols-3 gap-3 pt-6">
            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 backdrop-blur-md space-y-2">
              <Compass className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-white">Diario de Viajes</h3>
              <p className="text-[11px] text-zinc-400 leading-snug">
                Memorias geolocalizadas ordenadas cronológicamente.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 backdrop-blur-md space-y-2">
              <Heart className="w-4 h-4 text-rose-400" />
              <h3 className="text-xs font-bold text-white">Bodega Abierta</h3>
              <p className="text-[11px] text-zinc-400 leading-snug">
                Vinos categorizados por cata y valoración personal.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 backdrop-blur-md space-y-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-white">Mapa Interactivo</h3>
              <p className="text-[11px] text-zinc-400 leading-snug">
                Ubica visualmente tus historias sobre el mundo.
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-[11px] text-zinc-400 font-mono">
          © 2026 Atlas. No followers. No likes. No noise.
        </div>
      </div>

      {/* Panel Derecho: Tarjeta de Autenticación Solucionada */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[#09090b] relative">
        <div className="w-full max-w-md space-y-6">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            
            {/* Encabezado */}
            <div className="text-center space-y-1.5 mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-white">
                {isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
              </h2>
              <p className="text-xs text-zinc-400">
                {isLogin
                  ? 'Accede a tu cuenta personal de Atlas'
                  : 'Empieza a registrar tus viajes y memorias'}
              </p>
            </div>

            {/* Selector Toggle (Corregido contraste texto/fondo) */}
            <div className="grid grid-cols-2 p-1 bg-zinc-950 rounded-xl border border-zinc-800/80 mb-6">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  isLogin
                    ? '!bg-zinc-100 !text-zinc-950 shadow-sm font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  !isLogin
                    ? '!bg-zinc-100 !text-zinc-950 shadow-sm font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Crear Cuenta
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase block">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="tu@email.com"
                    defaultValue="ale.bobbio07@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/60 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase block">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    defaultValue="password123"
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/60 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] mt-2"
              >
                <span>{isLogin ? 'Iniciar Sesión' : 'Registrarse'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Separador "O CONTINUAR CON" (Línea en el fondo, texto con caja sólida por encima) */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
                <span className="bg-[#18181b] px-3 text-zinc-400 rounded-full border border-zinc-800/50">
                  O continuar con
                </span>
              </div>
            </div>

            {/* Botón de Google */}
            <button
              type="button"
              className="w-full py-2.5 px-4 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-xs font-semibold text-zinc-200 flex items-center justify-center gap-2.5 transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                />
              </svg>
              <span>Google</span>
            </button>
          </div>

          <p className="text-[11px] text-center text-zinc-500 max-w-xs mx-auto leading-relaxed">
            Al continuar, aceptas que Atlas guarde únicamente tus recuerdos para ti mismo. Sin feed de noticias, sin presión.
          </p>
        </div>
      </div>
    </div>
  );
}
