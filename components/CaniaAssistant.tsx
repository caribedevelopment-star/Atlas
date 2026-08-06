'use client';

import React, { useState } from 'react';
import { Cloud, Send, X, Bot, Loader2 } from 'lucide-react';

interface CaniaProps {
  userWines: any[];
}

export default function CaniaAssistant({ userWines }: CaniaProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [chat, setChat] = useState<{ role: string; text: string }[]>([
    { role: 'cania', text: '¡Hola! Soy Cania, tu sommelier personal. ¿Qué te apetece cenar hoy o qué vino buscas de la bodega?' }
  ]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const userMessage = prompt;
    setPrompt('');
    setChat((prev) => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch('/api/cania', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMessage, userWines }),
      });
      const data = await res.json();
      setChat((prev) => [...prev, { role: 'cania', text: data.reply }]);
    } catch {
      setChat((prev) => [...prev, { role: 'cania', text: 'Disculpa, no he podido consultar mi guía de maridajes.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-x-3 bottom-24 z-50 flex justify-end font-sans sm:inset-x-auto sm:bottom-6 sm:right-6">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex min-h-12 items-center gap-2 rounded-full border border-rose-100 bg-white/90 px-4 py-3 shadow-xl backdrop-blur-md transition duration-300 hover:scale-105"
        >
          <div className="relative">
            <Cloud className="w-7 h-7 text-rose-500 fill-rose-50 animate-pulse" />
            <Bot className="w-3.5 h-3.5 text-rose-700 absolute inset-0 m-auto" />
          </div>
          <span className="text-xs font-semibold text-slate-800 group-hover:text-rose-600 transition">
            Preguntar a Cania
          </span>
        </button>
      ) : (
        <div className="flex max-h-[min(34rem,calc(100dvh-8rem))] w-full max-w-sm flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white/95 shadow-2xl backdrop-blur-md transition-all sm:w-96">
          <header className="flex items-center justify-between bg-rose-900 p-4 text-white">
            <div className="flex items-center gap-2">
              <Cloud className="w-6 h-6 fill-rose-200 text-rose-100" />
              <div>
                <h3 className="text-sm font-bold leading-none">Cania</h3>
                <span className="text-[10px] text-rose-200">Sommelier en la nube</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-full text-rose-200 transition hover:bg-white/10 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </header>

          <div className="h-72 space-y-3 overflow-y-auto p-4 text-xs">
            {chat.map((m, i) => (
              <div
                key={i}
                className={`p-3 rounded-2xl max-w-[85%] ${
                  m.role === 'user'
                    ? 'bg-slate-900 text-white ml-auto rounded-tr-none'
                    : 'bg-rose-50 text-slate-800 border border-rose-100 rounded-tl-none'
                }`}
              >
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-slate-400 italic text-[11px]">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Cania está descorchando la respuesta...</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="flex gap-2 border-t border-slate-100 p-3">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="¿Qué vino me recomiendas para...?"
              className="min-h-11 min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-rose-500 sm:text-xs"
            />
            <button
              type="submit"
              disabled={loading}
              className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-rose-900 p-2 text-white hover:bg-rose-800 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
