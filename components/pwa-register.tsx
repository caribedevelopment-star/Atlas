'use client';

import { useEffect, useRef, useState } from 'react';
import { Download, RefreshCw, Share, X } from 'lucide-react';

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PwaRegister() {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const reloadForUpdate = useRef(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const onControllerChange = () => {
      if (reloadForUpdate.current) window.location.reload();
    };
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

    void navigator.serviceWorker.register('/sw.js').then((registration) => {
      if (registration.waiting) setWaitingWorker(registration.waiting);
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        worker?.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) setWaitingWorker(worker);
        });
      });
    }).catch((error) => console.error('No se pudo registrar el modo offline de Atlas:', error));

    const onInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onInstallPrompt);

    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (ios && !standalone && !window.navigator.standalone) setShowIosHelp(true);

    return () => {
      window.removeEventListener('beforeinstallprompt', onInstallPrompt);
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
    };
  }, []);

  async function install() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }

  function update() {
    if (!waitingWorker) return;
    reloadForUpdate.current = true;
    waitingWorker.postMessage({ type: 'SKIP_WAITING' });
  }

  if (waitingWorker) return <PwaNotice icon={<RefreshCw className="h-5 w-5" />} title="Atlas tiene una actualización" action="Actualizar" onAction={update} onClose={() => setWaitingWorker(null)} />;
  if (installPrompt) return <PwaNotice icon={<Download className="h-5 w-5" />} title="Instala Atlas en este dispositivo" action="Instalar" onAction={() => void install()} onClose={() => setInstallPrompt(null)} />;
  if (showIosHelp) return <PwaNotice icon={<Share className="h-5 w-5" />} title="Pulsa Compartir y Añadir a inicio" action="Entendido" onAction={() => setShowIosHelp(false)} onClose={() => setShowIosHelp(false)} />;
  return null;
}

function PwaNotice({ icon, title, action, onAction, onClose }: { icon: React.ReactNode; title: string; action: string; onAction: () => void; onClose: () => void }) {
  return <aside role="status" className="fixed inset-x-4 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-[1000] mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-white/10 bg-zinc-900/95 p-3 text-white shadow-2xl backdrop-blur-xl md:bottom-6">
    <span className="rounded-xl bg-white/10 p-2 text-rose-300" aria-hidden="true">{icon}</span>
    <p className="min-w-0 flex-1 text-sm font-medium">{title}</p>
    <button type="button" onClick={onAction} className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-zinc-950">{action}</button>
    <button type="button" onClick={onClose} aria-label="Cerrar aviso" className="rounded-full p-2 text-zinc-400 hover:bg-white/10"><X className="h-4 w-4" /></button>
  </aside>;
}

declare global {
  interface Navigator { standalone?: boolean }
}
