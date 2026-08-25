'use client';

import { FormEvent, Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, CheckCircle2, Eye, EyeOff, KeyRound, Lock, LogIn, Mail, Orbit, Sparkles, User, UserPlus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { CompactGatewayGlobe, OrbitalGateway } from '@/components/visuals/OrbitalGateway';

type AuthMode = 'login' | 'signup' | 'reset' | 'update';
type Message = { text: string; type: 'error' | 'success' };

export default function AuthPage() {
  return <Suspense fallback={<main className="min-h-[100dvh] bg-[#050609]" aria-label="Cargando acceso a Atlas"/>}><AuthForm /></Suspense>;
}

function AuthForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>(searchParams.get('mode') === 'update' ? 'update' : 'login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Message | null>(() => authQueryMessage(searchParams.get('error')));
  const next = safeNext(searchParams.get('next'));

  const copy = useMemo(() => {
    if (mode === 'signup') return { title: 'Crea tu propio mundo.', subtitle: 'Una cuenta privada para tus lugares, vinos, viajes y personas.' };
    if (mode === 'reset') return { title: 'Recupera tu Atlas.', subtitle: 'Te enviaremos un enlace seguro para restablecer el acceso.' };
    if (mode === 'update') return { title: 'Elige una nueva clave.', subtitle: 'Guarda una contraseña segura para volver a entrar en tu Atlas.' };
    return { title: 'Entra en tu mundo.', subtitle: 'Una cartografía viva de lugares, viajes, vinos, recuerdos y personas.' };
  }, [mode]);

  function selectMode(value: AuthMode) {
    setMode(value); setMessage(null); setPassword(''); setPasswordConfirmation('');
  }

  async function handleAuth(event: FormEvent) {
    event.preventDefault();
    setLoading(true); setMessage(null);
    try {
      if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/auth/callback?next=/login?mode=update`,
        });
        if (error) throw error;
        setMessage({ text: 'Te hemos enviado el enlace. Revisa también la carpeta de spam.', type: 'success' });
        return;
      }

      if (password.length < 8) throw new Error('La contraseña debe tener al menos 8 caracteres.');
      if ((mode === 'signup' || mode === 'update') && password !== passwordConfirmation) throw new Error('Las contraseñas no coinciden.');

      if (mode === 'signup') {
        if (fullName.trim().length < 2) throw new Error('Escribe tu nombre para crear el perfil.');
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(), password,
          options: { data: { full_name: fullName.trim() }, emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
        });
        if (error) throw error;
        if (data.session) { router.replace(next); router.refresh(); }
        else setMessage({ text: 'Cuenta creada. Confirma el correo que te hemos enviado para entrar.', type: 'success' });
        return;
      }

      if (mode === 'update') {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setMessage({ text: 'Contraseña actualizada. Ya puedes continuar en Atlas.', type: 'success' });
        setTimeout(() => { router.replace('/home'); router.refresh(); }, 650);
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      router.replace(next); router.refresh();
    } catch (cause) {
      setMessage({ text: authErrorMessage(cause), type: 'error' });
    } finally { setLoading(false); }
  }

  return <main className="atlas-gateway relative min-h-[100dvh] overflow-hidden bg-[#050609] text-white selection:bg-sky-300/20">
    <div className="atlas-gateway-stars absolute inset-0" aria-hidden="true" />
    <div className="absolute left-[-18vw] top-[-25vh] h-[70vh] w-[70vh] rounded-full bg-sky-400/[.07] blur-[120px]" aria-hidden="true" />
    <div className="absolute bottom-[-28vh] right-[-14vw] h-[65vh] w-[65vh] rounded-full bg-rose-400/[.055] blur-[130px]" aria-hidden="true" />
    <div className="relative mx-auto grid min-h-[100dvh] w-full max-w-7xl items-center gap-8 px-4 py-6 sm:px-8 lg:grid-cols-[1.12fr_.88fr] lg:px-12">
      <OrbitalGateway />
      <section className="relative mx-auto w-full max-w-[470px]">
        <CompactGatewayGlobe />
        <div className="atlas-login-card rounded-[2.2rem] border border-white/[.09] bg-zinc-950/64 p-5 shadow-[0_35px_100px_rgba(0,0,0,.52),inset_0_1px_0_rgba(255,255,255,.06)] backdrop-blur-3xl sm:p-7">
          <div className="mb-6">
            <div className="flex items-center justify-between"><div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.22em] text-zinc-500"><Orbit className="h-3.5 w-3.5 text-sky-300" />Atlas</div><div className="flex items-center gap-2 rounded-full border border-emerald-300/10 bg-emerald-300/[.05] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[.14em] text-emerald-300"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />online</div></div>
            <h1 className="mt-5 text-[2.45rem] font-semibold leading-none tracking-[-.055em] text-white sm:text-5xl">{copy.title}</h1>
            <p className="mt-3 max-w-sm text-sm leading-6 text-zinc-500">{copy.subtitle}</p>
          </div>

          {(mode === 'login' || mode === 'signup') && <div className="mb-5 grid grid-cols-2 rounded-[1.1rem] border border-white/[.07] bg-black/25 p-1" role="tablist" aria-label="Acceso a Atlas"><ModeButton active={mode === 'login'} onClick={() => selectMode('login')} icon={<LogIn />} label="Entrar" /><ModeButton active={mode === 'signup'} onClick={() => selectMode('signup')} icon={<UserPlus />} label="Crear cuenta" /></div>}
          {message && <div role="status" className={`mb-4 flex items-start gap-2 rounded-2xl border p-3 text-xs leading-5 ${message.type === 'error' ? 'border-red-500/20 bg-red-500/10 text-red-200' : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200'}`}><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />{message.text}</div>}

          <form onSubmit={handleAuth} className="space-y-3.5">
            {mode === 'signup' && <AuthField label="Nombre" icon={<User />}><input autoComplete="name" required value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Tu nombre" className="h-12 w-full bg-transparent pl-11 pr-4 text-sm text-white outline-none placeholder:text-zinc-700" /></AuthField>}
            {mode !== 'update' && <AuthField label="Email" icon={<Mail />}><input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="tu@email.com" className="h-12 w-full bg-transparent pl-11 pr-4 text-sm text-white outline-none placeholder:text-zinc-700" /></AuthField>}
            {mode !== 'reset' && <div><div className="mb-1.5 flex items-center justify-between px-1"><span className="text-[10px] font-medium text-zinc-600">{mode === 'update' ? 'Nueva contraseña' : 'Contraseña'}</span>{mode === 'login' && <button type="button" onClick={() => selectMode('reset')} className="text-[10px] text-zinc-500 transition hover:text-white">¿La olvidaste?</button>}</div><span className="relative block overflow-hidden rounded-[1.15rem] border border-white/[.08] bg-black/25 transition focus-within:border-sky-300/30 focus-within:bg-white/[.035] focus-within:ring-4 focus-within:ring-sky-300/[.035]"><Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" /><input type={showPassword ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mínimo 8 caracteres" className="h-12 w-full bg-transparent pl-11 pr-12 text-sm text-white outline-none placeholder:text-zinc-700" /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-zinc-600 transition hover:text-white">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></span>{mode === 'signup' && <p className="mt-1.5 px-1 text-[9px] text-zinc-700">Usa 8 o más caracteres; evita reutilizar una clave importante.</p>}</div>}
            {(mode === 'signup' || mode === 'update') && <AuthField label="Repite la contraseña" icon={<KeyRound />}><input type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength={8} required value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} placeholder="Repite la contraseña" className="h-12 w-full bg-transparent pl-11 pr-4 text-sm text-white outline-none placeholder:text-zinc-700" /></AuthField>}
            <button type="submit" disabled={loading} className="group mt-2 flex w-full items-center justify-center gap-2 rounded-[1.2rem] bg-white px-4 py-3.5 text-sm font-semibold text-zinc-950 shadow-[0_16px_40px_rgba(255,255,255,.08)] transition hover:-translate-y-0.5 hover:bg-sky-50 active:translate-y-0 disabled:opacity-50">{loading ? 'Procesando…' : actionLabel(mode)}<ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" /></button>
          </form>
          {(mode === 'reset' || mode === 'update') && <button type="button" onClick={() => selectMode('login')} className="mt-4 w-full text-center text-xs text-zinc-600 transition hover:text-white">Volver al inicio de sesión</button>}
          <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-zinc-700"><Sparkles className="h-3 w-3" /><span>Tu archivo personal empieza aquí.</span></div>
        </div>
      </section>
    </div>
  </main>;
}

function AuthField({ label, icon, children }: { label: string; icon: React.ReactElement; children: React.ReactNode }) { return <label className="block"><span className="mb-1.5 block px-1 text-[10px] font-medium text-zinc-600">{label}</span><span className="relative block overflow-hidden rounded-[1.15rem] border border-white/[.08] bg-black/25 transition focus-within:border-sky-300/30 focus-within:bg-white/[.035] focus-within:ring-4 focus-within:ring-sky-300/[.035]"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 [&>svg]:h-4 [&>svg]:w-4">{icon}</span>{children}</span></label>; }
function ModeButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactElement; label: string }) { return <button type="button" role="tab" aria-selected={active} onClick={onClick} className={`inline-flex h-10 items-center justify-center gap-2 rounded-[.85rem] text-xs font-medium transition [&>svg]:h-3.5 [&>svg]:w-3.5 ${active ? 'bg-white text-zinc-950 shadow-lg' : 'text-zinc-500 hover:text-white'}`}>{icon}{label}</button>; }
function actionLabel(mode: AuthMode) { if (mode === 'signup') return 'Crear mi Atlas'; if (mode === 'reset') return 'Enviar enlace seguro'; if (mode === 'update') return 'Guardar nueva contraseña'; return 'Entrar en Atlas'; }
function safeNext(value: string | null) { return value?.startsWith('/') && !value.startsWith('//') ? value : '/home'; }
function authQueryMessage(error: string | null): Message | null { if (error === 'confirmacion') return { text: 'El enlace ha caducado o ya fue utilizado. Solicita uno nuevo.', type: 'error' }; if (error === 'enlace-invalido') return { text: 'Ese enlace no contiene una confirmación válida.', type: 'error' }; return null; }
function authErrorMessage(cause: unknown) { const raw = cause instanceof Error ? cause.message : 'No se pudo completar el acceso.'; if (/invalid login credentials/i.test(raw)) return 'Email o contraseña incorrectos.'; if (/user already registered/i.test(raw)) return 'Ya existe una cuenta con este email. Prueba a iniciar sesión.'; if (/email rate limit/i.test(raw)) return 'Se han enviado demasiados correos. Espera unos minutos y vuelve a intentarlo.'; if (/password should be/i.test(raw)) return 'La contraseña no cumple los requisitos de seguridad.'; return raw; }
