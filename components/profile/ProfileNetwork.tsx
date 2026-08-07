import { RefreshCw, Users } from 'lucide-react';
import type { NetworkUser } from '@/lib/network';
import NetworkCircles from './NetworkCircles';

export function ProfileNetwork({ username, avatarUrl, users, loading, savingId, error, retry, onSend, onAccept, onDecline, onRemove }: {
  username: string;
  avatarUrl?: string;
  users: NetworkUser[];
  loading: boolean;
  savingId: string | null;
  error: string | null;
  retry: () => void;
  onSend: (id: string) => Promise<void>;
  onAccept: (user: NetworkUser) => Promise<void>;
  onDecline: (user: NetworkUser) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}) {
  return <section aria-labelledby="profile-network-title" className="rounded-[2rem] border border-white/[.08] bg-zinc-900/35 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,.04)] sm:p-6">
    <div className="mb-5"><div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.18em] text-rose-300"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-400" />Conexiones reales</div><h2 id="profile-network-title" className="mt-2 text-2xl font-semibold tracking-[-.035em] text-white">Amigos</h2><p className="mt-1 max-w-xl text-xs leading-5 text-zinc-500">Sin seguidores y sin feed social. Ser amigos solo sirve para elegirse al compartir recuerdos, viajes y momentos concretos.</p></div>
    {loading ? <div role="status" className="flex h-64 items-center justify-center text-sm text-zinc-500">Cargando amigos…</div> : error && users.length === 0 ? <div role="alert" className="flex h-64 flex-col items-center justify-center text-center"><p className="text-sm text-red-300">{error}</p><button onClick={retry} className="mt-3 flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs text-white"><RefreshCw className="h-3.5 w-3.5" />Reintentar</button></div> : users.length ? <><NetworkCircles currentUser={{ username, avatarUrl }} users={users} savingId={savingId} onSend={onSend} onAccept={onAccept} onDecline={onDecline} onRemove={onRemove} />{error && <p role="alert" className="mt-3 text-center text-xs text-red-300">{error}</p>}</> : <div className="flex h-64 flex-col items-center justify-center text-center"><Users className="h-7 w-7 text-zinc-600" /><p className="mt-3 text-sm text-zinc-400">Aún no hay otras personas en Atlas.</p></div>}
  </section>;
}
