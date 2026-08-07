"use client";

import React, { useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2, Send, Sparkles, Wine, X } from "lucide-react";

interface WineItem {
  id: string;
  name: string;
  winery: string;
  vintage: number;
  rating: number;
  supermarket: string;
  price: number;
  tasting_notes: string;
  image_url: string;
  is_popular?: boolean;
}

interface CaniaAssistantProps {
  userWines: WineItem[];
}

type Message = { role: "user" | "assistant"; text: string };

const quickPrompts = [
  "🍷 Recomiéndame uno",
  "🥩 Para carne",
  "🐟 Para pescado",
  "💸 Mejor calidad-precio",
];

export default function CaniaAssistant({ userWines }: CaniaAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "🍷 Soy **Can.ia Sommelier**. Dime qué vas a comer, cuánto quieres gastar o qué te apetece beber y te recomiendo algo de tu bodega real.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [loading, messages]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 120);
  }, [isOpen]);

  async function sendMessage(raw: string) {
    const userMsg = raw.trim();
    if (!userMsg || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      const response = await fetch("/api/cania", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          wines: userWines.slice(0, 100),
          history: messages.slice(-8),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo consultar a Can.ia.");
      const reply = data.reply || data.text || "🍷 No he podido procesar la recomendación ahora mismo.";
      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: error instanceof Error ? `⚠️ ${error.message}` : "⚠️ Hubo un error al conectar con Can.ia.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void sendMessage(input);
  }

  return (
    <div className="fixed bottom-5 right-4 z-50 sm:bottom-6 sm:right-6">
      {!isOpen ? (
        <button
          aria-label="Abrir Can.ia Sommelier"
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2 rounded-full border border-rose-500/30 bg-zinc-950/95 px-4 py-3 text-rose-100 shadow-2xl shadow-black/40 backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-rose-400/50 hover:bg-zinc-900"
        >
          <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-rose-500/25 to-amber-400/10 ring-1 ring-white/10">
            <Sparkles className="h-4.5 w-4.5 text-amber-300 transition group-hover:scale-110" />
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-zinc-950 bg-emerald-400" />
          </span>
          <span className="pr-1 text-left">
            <span className="block text-[10px] uppercase tracking-[0.18em] text-zinc-500">Atlas AI</span>
            <span className="block text-xs font-semibold text-white">Can.ia Sommelier</span>
          </span>
        </button>
      ) : (
        <div
          className={`flex flex-col overflow-hidden border border-white/10 bg-zinc-950/95 shadow-2xl shadow-black/50 backdrop-blur-2xl transition-all duration-300 ${
            expanded
              ? "h-[min(82dvh,760px)] w-[min(94vw,560px)] rounded-[2rem]"
              : "h-[min(72dvh,560px)] w-[min(92vw,390px)] rounded-[1.75rem]"
          }`}
        >
          <header className="flex items-center justify-between border-b border-white/10 bg-[radial-gradient(circle_at_20%_0%,rgba(244,63,94,.14),transparent_38%)] px-4 py-3.5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[.05]">
                <Wine className="h-5 w-5 text-rose-300" />
                <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-zinc-950 bg-emerald-400" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-semibold text-white">Can.ia Sommelier</span>
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-emerald-300">online</span>
                </div>
                <p className="truncate text-[11px] text-zinc-500">Tu bodega · {userWines.length} vinos disponibles</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setExpanded((value) => !value)}
                aria-label={expanded ? "Reducir Can.ia" : "Ampliar Can.ia"}
                className="rounded-xl p-2 text-zinc-500 transition hover:bg-white/5 hover:text-white"
              >
                {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Cerrar Can.ia"
                className="rounded-xl p-2 text-zinc-500 transition hover:bg-white/5 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </header>

          <div className="border-b border-white/5 px-3 py-2.5">
            <div className="flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {quickPrompts.map((prompt) => (
                <button
                  type="button"
                  key={prompt}
                  disabled={loading}
                  onClick={() => void sendMessage(prompt.replace(/^[^\p{L}\p{N}]+/u, ""))}
                  className="shrink-0 rounded-full border border-white/10 bg-white/[.035] px-3 py-1.5 text-[11px] text-zinc-300 transition hover:border-rose-400/30 hover:bg-rose-400/10 hover:text-white disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-3.5 py-4 text-sm [scrollbar-width:thin]">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[86%] whitespace-pre-wrap rounded-2xl px-3.5 py-3 leading-5 shadow-sm ${
                    message.role === "user"
                      ? "rounded-br-md bg-white text-zinc-950"
                      : "rounded-bl-md border border-white/10 bg-white/[.045] text-zinc-200"
                  }`}
                >
                  <MessageText text={message.text} />
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-white/10 bg-white/[.045] px-4 py-3 text-zinc-500">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-rose-300 [animation-delay:-.2s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-rose-300 [animation-delay:-.1s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-rose-300" />
                  <span className="ml-1 text-[11px]">Can.ia está eligiendo…</span>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form onSubmit={handleSubmit} className="border-t border-white/10 bg-zinc-950/90 p-3">
            <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-white/[.045] p-1.5 transition focus-within:border-rose-400/30 focus-within:ring-4 focus-within:ring-rose-500/5">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pregunta por vino, comida o presupuesto…"
                className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                aria-label="Enviar mensaje"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-zinc-950 transition hover:bg-rose-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-center text-[9px] text-zinc-700">Can.ia usa los vinos reales disponibles en Atlas.</p>
          </form>
        </div>
      )}
    </div>
  );
}

function MessageText({ text }: { text: string }) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return <>{parts.map((part, index) => part.startsWith("**") && part.endsWith("**") ? <strong key={index} className="font-semibold text-inherit">{part.slice(2, -2)}</strong> : <React.Fragment key={index}>{part}</React.Fragment>)}</>;
}
