import { AlertCircle, Loader2, RefreshCw, Wine } from 'lucide-react';

export function WineLoadingState() {
  return <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 text-zinc-400" role="status"><Loader2 className="h-7 w-7 animate-spin text-rose-400" aria-hidden="true" /><span>Cargando tu bodega…</span></div>;
}

export function WineErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div className="mx-auto flex min-h-[280px] max-w-md flex-col items-center justify-center rounded-3xl border border-red-500/20 bg-red-500/5 p-8 text-center" role="alert"><AlertCircle className="mb-3 h-8 w-8 text-red-400" aria-hidden="true" /><h2 className="font-semibold text-white">No pudimos abrir la bodega</h2><p className="mt-2 text-sm text-zinc-400">{message}</p><button onClick={onRetry} className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"><RefreshCw className="h-4 w-4" aria-hidden="true" />Reintentar</button></div>;
}

export function WineNoResults({ filtered, onReset }: { filtered: boolean; onReset: () => void }) {
  return <div className="flex min-h-[300px] flex-col items-center justify-center rounded-[2rem] border border-dashed border-white/15 bg-white/[0.02] p-8 text-center"><Wine className="mb-4 h-10 w-10 text-rose-400" aria-hidden="true" /><h2 className="text-lg font-semibold text-white">{filtered ? 'No hay vinos con estos filtros' : 'Tu bodega está esperando'}</h2><p className="mt-2 max-w-sm text-sm text-zinc-400">{filtered ? 'Prueba a ampliar la búsqueda o limpiar la selección.' : 'Añade tu primera botella para empezar tu colección personal.'}</p>{filtered && <button onClick={onReset} className="mt-5 rounded-full border border-white/15 px-4 py-2 text-sm text-white hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400">Limpiar filtros</button>}</div>;
}
