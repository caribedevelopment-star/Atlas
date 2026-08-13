import { Globe2, Sparkles } from 'lucide-react';

export function OrbitalGateway() {
  return <section className="relative hidden min-h-[620px] lg:flex lg:items-center lg:justify-center" aria-label="Universo Atlas">
    <div className="atlas-gateway-system relative aspect-square w-full max-w-[620px]">
      <div className="atlas-gateway-orbit atlas-gateway-orbit-a absolute inset-[5%] rounded-full border border-white/[.08]" />
      <div className="atlas-gateway-orbit atlas-gateway-orbit-b absolute inset-[17%] rounded-full border border-dashed border-sky-300/[.14]" />
      <div className="atlas-gateway-orbit atlas-gateway-orbit-c absolute inset-[29%] rounded-full border border-white/[.06]" />
      <div className="atlas-gateway-globe absolute left-1/2 top-1/2 h-[250px] w-[250px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-[radial-gradient(circle_at_32%_28%,rgba(255,255,255,.28),transparent_16%),radial-gradient(circle_at_45%_48%,rgba(56,189,248,.22),rgba(12,16,24,.97)_68%)] shadow-[0_0_100px_rgba(56,189,248,.13),inset_-38px_-28px_70px_rgba(0,0,0,.65)]">
        <div className="atlas-gateway-globe-grid absolute inset-0 rounded-full opacity-55" />
        <div className="absolute inset-[14%] rounded-full border border-white/[.08]" />
        <div className="absolute inset-y-[7%] left-1/2 w-[34%] -translate-x-1/2 rounded-[50%] border-x border-white/[.09]" />
        <div className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[1.45rem] border border-white/20 bg-white/[.08] shadow-[0_0_45px_rgba(255,255,255,.11)] backdrop-blur-xl"><span className="font-mono text-xl font-bold">A</span></div>
      </div>
      <Point className="left-[18%] top-[28%]" label="Memorias" />
      <Point className="right-[12%] top-[42%]" label="Viajes" delay />
      <Point className="bottom-[13%] left-[36%]" label="Vinos" />
      <Point className="right-[23%] top-[15%]" label="Personas" delay />
      <div className="absolute left-8 top-1/2 max-w-[220px] -translate-y-1/2 rounded-[1.4rem] border border-white/[.08] bg-black/25 p-4 backdrop-blur-xl"><div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.2em] text-sky-300"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-300" />Atlas vivo</div><p className="mt-3 text-sm leading-6 text-zinc-300">Tu mapa, tus recuerdos y las personas que forman parte de ellos.</p></div>
    </div>
  </section>;
}

export function CompactGatewayGlobe() {
  return <div className="mb-8 lg:hidden"><div className="atlas-gateway-globe mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-white/15 bg-[radial-gradient(circle_at_35%_25%,rgba(255,255,255,.22),rgba(56,189,248,.1)_35%,rgba(9,9,11,.98)_72%)] shadow-[0_0_55px_rgba(56,189,248,.15)]"><Globe2 className="h-7 w-7 text-sky-200" /></div><div className="atlas-mobile-orbit mx-auto -mt-[68px] h-32 w-32 rounded-full border border-dashed border-sky-300/15" /></div>;
}

function Point({ className, label, delay = false }: { className: string; label: string; delay?: boolean }) {
  return <div className={`atlas-gateway-point absolute ${className} ${delay ? '[animation-delay:-2.3s]' : ''}`}><span className="absolute -inset-3 rounded-full bg-sky-300/10 blur-lg" /><span className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-zinc-950/80 shadow-xl backdrop-blur-xl"><Sparkles className="h-3.5 w-3.5 text-sky-200" /></span><span className="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap text-[9px] font-semibold uppercase tracking-[.16em] text-zinc-600">{label}</span></div>;
}
