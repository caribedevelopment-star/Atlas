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
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-3 rounded-full shadow-xl border border-rose-100 hover:scale-105 transition duration-300"
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
        <div className="w-80 sm:w-96 bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden transition-all">
          <header className="bg-rose-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cloud className="w-6 h-6 fill-rose-200 text-rose-100" />
              <div>
                <h3 className="text-sm font-bold leading-none">Cania</h3>
                <span className="text-[10px] text-rose-200">Sommelier en la nube</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-rose-200 hover:text-white transition">
              <X className="w-5 h-5" />
            </button>
          </header>

          <div className="p-4 h-72 overflow-y-auto space-y-3 text-xs">
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

          <form onSubmit={handleSend} className="p-3 border-t border-slate-100 flex gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="¿Qué vino me recomiendas para...?"
              className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-rose-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-rose-900 text-white p-2 rounded-xl hover:bg-rose-800 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
