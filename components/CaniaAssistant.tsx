
'use client';

import React, { useState } from 'react';
import { Sparkles, Send, Loader2, Wine } from 'lucide-react';

interface CaniaProps {
  userWines: any[];
}

export default function CaniaAssistant({ userWines }: CaniaProps) {
  const [messages, setMessages] = useState<{ role: 'user' | 'cania'; text: string }[]>([
    { 
      role: 'cania', 
      text: '¡Hola! Soy Cania. Qué alegría saludarte. ¿Qué vino te apetece probar hoy o qué vas a cenar para recomendarte el maridaje perfecto?' 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/cania', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMsg, userWines }),
      });
      const data = await res.json();

      if (data.reply) {
        setMessages((prev) => [...prev, { role: 'cania', text: data.reply }]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev, 
        { role: 'cania', text: 'Vaya, he tenido un pequeño despiste. ¿Me repites la pregunta?' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm font-sans flex flex-col h-[460px]">
      {/* Cabecera */}
      <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
        <div className="p-2.5 bg-rose-100 text-rose-700 rounded-2xl">
          <Wine className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
            Cania
            <Sparkles className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </h3>
          <p className="text-xs text-slate-500">Sommelier Virtual</p>
        </div>
      </div>

      {/* Historial de mensajes */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1 text-xs">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-3 leading-relaxed ${
              m.role === 'user' 
                ? 'bg-slate-900 text-white rounded-br-none' 
                : 'bg-rose-50/70 text-slate-800 border border-rose-100/80 rounded-bl-none'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-slate-400 text-xs pl-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
            <span>Cania está pensando la recomendación...</span>
          </div>
        )}
      </div>

      {/* Input de chat */}
      <form onSubmit={sendMessage} className="flex gap-2 pt-2 border-t border-slate-100">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pregúntale a Cania sobre vinos o maridajes..."
          className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-slate-800"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition disabled:opacity-50 flex items-center justify-center"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}