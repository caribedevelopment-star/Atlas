
'use client';

import React, { useState } from 'react';
import { Sparkles, Send, Loader2 } from 'lucide-react';

export default function AITestPage() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    setLoading(true);
    setResponse('');

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input }),
      });

      const data = await res.json();
      if (data.text) {
        setResponse(data.text);
      } else {
        setResponse('Error: ' + (data.error || 'Respuesta vacía'));
      }
    } catch (err) {
      setResponse('Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] p-6 md:p-12 font-sans text-stone-800">
      <div className="max-w-xl mx-auto space-y-6">
        <header className="space-y-1">
          <div className="flex items-center gap-2 text-[#546243]">
            <Sparkles className="w-5 h-5" />
            <span className="text-xs font-bold tracking-wider uppercase">Atlas AI Test</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-900">Probar conexión a Gemini</h1>
        </header>

        <form onSubmit={handleAskAI} className="space-y-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe una pregunta o idea..."
            className="w-full h-28 p-3 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 resize-none shadow-sm"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#546243] hover:bg-[#434f35] text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>{loading ? 'Consultando...' : 'Enviar a Gemini'}</span>
          </button>
        </form>

        {response && (
          <div className="bg-white border border-stone-200/80 rounded-xl p-4 shadow-sm space-y-2">
            <span className="text-[10px] font-bold tracking-wider text-stone-400 uppercase">Respuesta</span>
            <p className="text-sm text-stone-700 whitespace-pre-wrap leading-relaxed">{response}</p>
          </div>
        )}
      </div>
    </div>
  );
}
