import type { LucideIcon } from 'lucide-react';
import { MapPinned, Plane, Sparkles, Users, Wine } from 'lucide-react';

const satellites: Array<{ label: string; icon: LucideIcon; className: string; tone: string; delay: string }> = [
  { label: 'Memorias', icon: Sparkles, className: 'left-[5%] top-[31%]', tone: 'sky', delay: '-1.1s' },
  { label: 'Viajes', icon: Plane, className: 'right-[3%] top-[35%]', tone: 'cyan', delay: '-3.6s' },
  { label: 'Vinos', icon: Wine, className: 'bottom-[9%] left-[26%]', tone: 'rose', delay: '-2.2s' },
  { label: 'Personas', icon: Users, className: 'right-[18%] top-[7%]', tone: 'violet', delay: '-4.7s' },
  { label: 'Lugares', icon: MapPinned, className: 'bottom-[15%] right-[10%]', tone: 'emerald', delay: '-.5s' },
];

export function OrbitalGateway() {
  return <section className="atlas-gateway-visual relative flex min-h-[330px] items-center justify-center sm:min-h-[470px] lg:min-h-[720px]" aria-label="Universo Atlas">
    <div className="atlas-gateway-system relative aspect-square w-[min(92vw,680px)] max-w-[680px]">
      <div className="atlas-gateway-aurora absolute inset-[4%] rounded-full" aria-hidden="true" />
      <div className="atlas-gateway-orbit atlas-gateway-orbit-a absolute inset-[2%] rounded-full border border-white/[.18]" aria-hidden="true" />
      <div className="atlas-gateway-orbit atlas-gateway-orbit-b absolute inset-[13%] rounded-full border border-dashed border-cyan-200/[.28]" aria-hidden="true" />
      <div className="atlas-gateway-orbit atlas-gateway-orbit-c absolute inset-[25%] rounded-full border border-white/[.14]" aria-hidden="true" />
      <div className="atlas-gateway-orbit atlas-gateway-orbit-d absolute inset-[36%] rounded-full border border-dashed border-sky-200/[.2]" aria-hidden="true" />

      <div className="atlas-gateway-globe absolute left-1/2 top-1/2 h-[205px] w-[205px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border border-white/25 sm:h-[300px] sm:w-[300px] lg:h-[370px] lg:w-[370px]">
        <div className="atlas-gateway-ocean absolute inset-0 rounded-full" />
        <div className="atlas-gateway-grid absolute inset-[-10%] rounded-full" />
        <span className="atlas-gateway-land atlas-gateway-land-a absolute" />
        <span className="atlas-gateway-land atlas-gateway-land-b absolute" />
        <span className="atlas-gateway-land atlas-gateway-land-c absolute" />
        <span className="atlas-gateway-land atlas-gateway-land-d absolute" />
        <span className="atlas-gateway-land atlas-gateway-land-e absolute" />
        <div className="atlas-gateway-globe-shade absolute inset-0 rounded-full" />
        <div className="atlas-gateway-globe-sheen absolute inset-0 rounded-full" />
        <div className="atlas-gateway-nightline absolute inset-y-0 right-[12%] w-[38%] rounded-full" />
      </div>

      <div className="atlas-gateway-brand absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[1.25rem] border border-white/25 bg-black/35 shadow-[0_0_60px_rgba(125,211,252,.22)] backdrop-blur-2xl sm:h-16 sm:w-16"><span className="font-mono text-lg font-bold tracking-[-.08em] text-white sm:text-xl">A</span></div>
        <span className="mt-3 hidden text-[9px] font-semibold uppercase tracking-[.28em] text-white/45 sm:block">Atlas</span>
      </div>

      {satellites.map((satellite) => <Satellite key={satellite.label} {...satellite} />)}
      <div className="atlas-gateway-comet absolute left-[12%] top-[13%] h-px w-24 rotate-[18deg] bg-gradient-to-r from-transparent via-cyan-100/80 to-transparent" aria-hidden="true" />
      <div className="atlas-gateway-comet atlas-gateway-comet-b absolute bottom-[21%] right-[4%] h-px w-20 -rotate-[24deg] bg-gradient-to-r from-transparent via-white/70 to-transparent" aria-hidden="true" />
      <div className="absolute bottom-[1%] left-1/2 hidden -translate-x-1/2 items-center gap-2 rounded-full border border-white/[.12] bg-black/40 px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[.18em] text-white/60 shadow-xl backdrop-blur-2xl sm:flex"><span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-60" /><span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-300" /></span>Atlas está vivo</div>
    </div>
  </section>;
}

export function CompactGatewayGlobe() { return null; }

function Satellite({ label, icon: Icon, className, tone, delay }: { label: string; icon: LucideIcon; className: string; tone: string; delay: string }) {
  const tones: Record<string, string> = {
    sky: 'border-sky-200/30 bg-sky-300/10 text-sky-100',
    cyan: 'border-cyan-200/30 bg-cyan-300/10 text-cyan-100',
    rose: 'border-rose-200/25 bg-rose-300/10 text-rose-100',
    violet: 'border-violet-200/25 bg-violet-300/10 text-violet-100',
    emerald: 'border-emerald-200/25 bg-emerald-300/10 text-emerald-100',
  };
  return <div className={`atlas-gateway-point absolute z-20 ${className}`} style={{ animationDelay: delay }}><span className="atlas-gateway-satellite-halo absolute -inset-4 rounded-full" /><span className={`relative flex h-10 w-10 items-center justify-center rounded-full border shadow-[0_10px_35px_rgba(0,0,0,.48)] backdrop-blur-xl sm:h-11 sm:w-11 ${tones[tone]}`}><Icon className="h-4 w-4" /></span><span className="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap text-[8px] font-semibold uppercase tracking-[.16em] text-white/55 sm:text-[9px]">{label}</span></div>;
}
