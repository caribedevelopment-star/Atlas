'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  getCurrentUserIsAdmin,
  listPendingWineEnrichmentReviews,
  reviewWineEnrichment,
  runWineEnrichment,
  type WineEnrichmentReview,
} from '@/lib/wines/enrichment';

export default function WineEnrichmentAdminPage() {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [reviews, setReviews] = useState<WineEnrichmentReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setMessage('');
    try {
      const isAdmin = await getCurrentUserIsAdmin();
      setAllowed(isAdmin);
      if (!isAdmin) return;
      setReviews(await listPendingWineEnrichmentReviews());
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo cargar la cola de revisión.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function decide(review: WineEnrichmentReview, decision: 'approved' | 'rejected') {
    setWorking(review.id);
    setMessage('');
    try {
      await reviewWineEnrichment(review.id, decision);
      setReviews((items) => items.filter((item) => item.id !== review.id));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo guardar la decisión.');
    } finally {
      setWorking(null);
    }
  }

  async function runBatch() {
    setWorking('batch');
    setMessage('Procesando hasta 5 vinos…');
    try {
      await runWineEnrichment();
      setMessage('Lote procesado. Actualizando cola…');
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo ejecutar el enriquecimiento.');
    } finally {
      setWorking(null);
    }
  }

  if (allowed === false) {
    return (
      <main className="min-h-screen bg-zinc-950 px-6 py-16 text-zinc-100">
        <div className="mx-auto max-w-xl rounded-3xl border border-zinc-800 bg-zinc-900/70 p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">Atlas Admin</p>
          <h1 className="mt-3 text-2xl font-bold">Acceso restringido</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-400">Esta herramienta solo está disponible para administradores de Atlas.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-rose-300">Atlas · Bodega</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Revisión de imágenes</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">Solo aparecen coincidencias de confianza media. Las coincidencias altas se aplican automáticamente y las bajas se descartan.</p>
          </div>
          <button
            type="button"
            onClick={runBatch}
            disabled={working !== null || loading}
            className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {working === 'batch' ? 'Procesando…' : 'Procesar 5 vinos'}
          </button>
        </div>

        {message && <div className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-300">{message}</div>}

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2"><Skeleton /><Skeleton /></div>
        ) : reviews.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-10 text-center">
            <p className="text-lg font-medium">No hay coincidencias pendientes.</p>
            <p className="mt-2 text-sm text-zinc-500">Atlas seguirá procesando el catálogo automáticamente mediante Cron.</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {reviews.map((review) => (
              <article key={review.id} className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/70">
                <div className="aspect-[4/3] bg-zinc-950 p-5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={review.proposed_image_url} alt="Botella propuesta" className="h-full w-full object-contain" />
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-semibold text-white">{review.wine?.name ?? 'Vino'}</h2>
                      <p className="mt-1 text-xs text-zinc-500">{[review.wine?.winery, review.wine?.vintage].filter(Boolean).join(' · ')}</p>
                    </div>
                    <span className="rounded-full border border-zinc-700 px-2.5 py-1 text-xs text-zinc-300">{Math.round(review.confidence * 100)}%</span>
                  </div>
                  <p className="mt-4 text-xs text-zinc-500">{review.provider_name} · {review.source_license ?? 'Licencia no indicada'}</p>
                  {review.source_url && <a href={review.source_url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs text-zinc-300 underline underline-offset-4">Ver fuente</a>}
                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => void decide(review, 'rejected')} disabled={working === review.id} className="rounded-xl border border-zinc-700 px-3 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800 disabled:opacity-50">Rechazar</button>
                    <button type="button" onClick={() => void decide(review, 'approved')} disabled={working === review.id} className="rounded-xl bg-white px-3 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-zinc-200 disabled:opacity-50">Aprobar</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function Skeleton() {
  return <div className="h-80 animate-pulse rounded-3xl border border-zinc-800 bg-zinc-900/50" />;
}
