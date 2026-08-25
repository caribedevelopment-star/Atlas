'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Map, Orbit, Sparkles, Store, Wine, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const steps = [
  { eyebrow: 'Tu archivo vivo', title: 'Atlas convierte tu vida en un mapa.', copy: 'Guarda memorias, viajes y mesas en el lugar donde ocurrieron. El mapa conecta todo sin convertir tu historia en un feed público.', icon: Map, accent: '#7dd3fc' },
  { eyebrow: 'Bodega con contexto', title: 'Cada vino vuelve a su región.', copy: 'Tu bodega recuerda botellas y fotografías. Las denominaciones te enseñan dónde nacen, y Can.ia te ayuda a elegir sin complicaciones.', icon: Wine, accent: '#fda4af' },
  { eyebrow: 'Guía privada', title: 'Restaurantes para volver o descubrir.', copy: 'Busca un local, deja que Atlas complete sus datos y guarda solo lo personal: tu nota, valoración, chef y qué pedir.', icon: Store, accent: '#6ee7b7' },
  { eyebrow: 'Universo social', title: 'Las personas orbitan; la privacidad no cambia.', copy: 'Íntimos, cercanos y públicos expresan relación. Tus memorias solo se comparten cuando tú eliges a las personas concretas.', icon: Orbit, accent: '#c4b5fd' },
];

export function AtlasOnboarding() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [storageKey, setStorageKey] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!active || !data.user) return;
      const key = `atlas:onboarding:v3:${data.user.id}`;
      setStorageKey(key);
      if (!window.localStorage.getItem(key)) setOpen(true);
    });
    const reopen = () => { setStep(0); setOpen(true); };
    window.addEventListener('atlas:open-onboarding', reopen);
    return () => { active = false; window.removeEventListener('atlas:open-onboarding', reopen); };
  }, []);

  function finish() {
    if (storageKey) window.localStorage.setItem(storageKey, 'complete');
    setOpen(false);
  }

  if (!open) return null;
  const current = steps[step]; const Icon = current.icon; const isLast = step === steps.length - 1;
  return <div className="fixed inset-0 z-[9000] flex items-center justify-center bg-black/70 p-3 text-white backdrop-blur-xl" role="dialog" aria-modal="true" aria-labelledby="atlas-onboarding-title">
    <div className="relative w-full max-w-[760px] overflow-hidden rounded-[2.2rem] border border-white/[.11] bg-[#08090d] shadow-[0_50px_150px_rgba(0,0,0,.75)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_10%,rgba(125,211,252,.12),transparent_34%),radial-gradient(circle_at_8%_100%,rgba(244,114,182,.08),transparent_32%)]" aria-hidden="true" />
      <div className="relative grid min-h-[500px] lg:grid-cols-[.8fr_1.2fr]">
        <aside className="hidden border-r border-white/[.07] p-7 lg:flex lg:flex-col"><div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.22em] text-zinc-500"><Orbit className="h-4 w-4 text-sky-300"/>Atlas</div><div className="mt-auto space-y-3">{steps.map((item,index)=>{const StepIcon=item.icon;return <button key={item.title} type="button" onClick={()=>setStep(index)} className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${step===index?'border-white/[.13] bg-white/[.075]':'border-transparent text-zinc-600 hover:bg-white/[.03]'}`}><span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[.07] bg-black/30" style={{color:item.accent}}><StepIcon className="h-4 w-4"/></span><span><strong className="block text-[11px] font-medium text-white">0{index+1}</strong><span className="mt-0.5 block text-[9px]">{item.eyebrow}</span></span></button>})}</div></aside>
        <section className="relative flex flex-col p-6 sm:p-9"><button type="button" onClick={finish} aria-label="Cerrar tutorial" className="absolute right-5 top-5 rounded-full border border-white/[.08] bg-white/[.035] p-2 text-zinc-500 transition hover:bg-white/[.08] hover:text-white"><X className="h-4 w-4"/></button><div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[.2em] text-zinc-600"><span className="h-1.5 w-1.5 rounded-full" style={{backgroundColor:current.accent,boxShadow:`0 0 16px ${current.accent}`}}/>Primer recorrido · {step+1} de {steps.length}</div><div className="my-auto py-14"><span className="flex h-16 w-16 items-center justify-center rounded-[1.35rem] border border-white/[.1] bg-white/[.045] shadow-[0_22px_60px_rgba(0,0,0,.35)]" style={{color:current.accent}}><Icon className="h-7 w-7"/></span><p className="mt-8 text-[10px] font-semibold uppercase tracking-[.22em]" style={{color:current.accent}}>{current.eyebrow}</p><h2 id="atlas-onboarding-title" className="mt-3 max-w-xl text-3xl font-semibold leading-[1.05] tracking-[-.05em] sm:text-5xl">{current.title}</h2><p className="mt-5 max-w-lg text-sm leading-7 text-zinc-400">{current.copy}</p></div><div className="flex items-center justify-between border-t border-white/[.07] pt-5"><button type="button" onClick={step===0?finish:()=>setStep((value)=>value-1)} className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs text-zinc-500 transition hover:bg-white/[.04] hover:text-white">{step===0?'Omitir':<><ArrowLeft className="h-3.5 w-3.5"/>Anterior</>}</button>{isLast?<Link href="/home" onClick={finish} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-semibold text-zinc-950 hover:bg-sky-50"><Sparkles className="h-3.5 w-3.5"/>Abrir mi Atlas</Link>:<button type="button" onClick={()=>setStep((value)=>value+1)} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-semibold text-zinc-950 hover:bg-sky-50">Siguiente<ArrowRight className="h-3.5 w-3.5"/></button>}</div></section>
      </div>
    </div>
  </div>;
}
