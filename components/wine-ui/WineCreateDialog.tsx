'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { Camera, Loader2, X } from 'lucide-react';
import { createWine, uploadWinePhoto } from '@/lib/wines/repository';
import type { WineItem } from '@/types/wine';

export function WineCreateDialog({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (wine: WineItem) => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [saving, setSaving] = useState(false); const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const escape = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, [onClose, open]);
  if (!open) return null;
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError(null);
    const form = new FormData(event.currentTarget);
    try {
      const file = form.get('photo');
      const imageUrl = file instanceof File && file.size ? await uploadWinePhoto(file) : '';
      const wine = await createWine({ name: String(form.get('name')), winery: String(form.get('winery')), vintage: Number(form.get('vintage')), rating: Number(form.get('rating')), supermarket: String(form.get('supermarket')), price: form.get('price') ? Number(form.get('price')) : null, tasting_notes: String(form.get('notes')), image_url: imageUrl });
      onCreated(wine); onClose();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo guardar el vino.'); }
    finally { setSaving(false); }
  }
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-sm sm:items-center sm:p-6" role="presentation"><section role="dialog" aria-modal="true" aria-labelledby="create-wine-title" className="max-h-[94dvh] w-full max-w-xl overflow-y-auto rounded-t-[2rem] border border-white/10 bg-zinc-950 p-6 shadow-2xl sm:rounded-[2rem]">
    <div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-widest text-rose-300">Nueva botella</p><h2 id="create-wine-title" className="mt-1 text-2xl font-semibold text-white">Añadir a mi bodega</h2></div><button ref={closeRef} onClick={onClose} className="rounded-full p-2 text-zinc-400 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400" aria-label="Cerrar"><X className="h-5 w-5" /></button></div>
    <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2"><Input name="name" label="Nombre" required /><Input name="winery" label="Bodega" required /><Input name="vintage" label="Añada" type="number" defaultValue={new Date().getFullYear()} required /><Input name="rating" label="Valoración" type="number" min="0" max="5" step="0.5" defaultValue="5" required /><Input name="supermarket" label="Supermercado o tienda" defaultValue="Mercadona" /><Input name="price" label="Precio (€)" type="number" min="0" step="0.01" /><label className="sm:col-span-2 text-sm text-zinc-300">Notas de cata<textarea name="notes" rows={3} className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-900 p-3 text-white outline-none focus:border-rose-400" /></label><label className="sm:col-span-2 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-white/15 p-4 text-sm text-zinc-400 hover:bg-white/5"><Camera className="h-5 w-5" />Añadir fotografía<input name="photo" type="file" accept="image/*" className="sr-only" /></label>{error && <p className="sm:col-span-2 text-sm text-red-400" role="alert">{error}</p>}<button disabled={saving} className="sm:col-span-2 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-rose-600 font-semibold text-white hover:bg-rose-500 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400">{saving && <Loader2 className="h-4 w-4 animate-spin" />}Guardar vino</button></form>
  </section></div>;
}

function Input({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) { return <label className="text-sm text-zinc-300">{label}<input {...props} className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-zinc-900 px-3 text-white outline-none focus:border-rose-400" /></label>; }
