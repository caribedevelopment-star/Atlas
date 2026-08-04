"use client";

import React, { useState } from "react";
import { Sparkles, X, Send, Loader2, Wine } from "lucide-react";

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

export default function CaniaAssistant({ userWines }: CaniaAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([
    {
      role: "assistant",
      text: "¡Hola! Soy Cania, tu Sommelier virtual. Puedo recomendarte maridajes o ayudarte a elegir un vino de tu bodega o supermercado.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          context: {
            systemPrompt: "Eres Cania, un Sommelier experto y cercano. Aconsejas sobre maridaje, vinos de supermercado y selección personal.",
            wines: userWines,
          },
        }),
      });

      const data = await response.json();
      const reply = data.reply || data.text || "No he podido procesar la recomendación en este momento.";

      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Hubo un error al conectar con el asistente sommelier." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-red-950/80 hover:bg-red-900 border border-red-700/50 text-red-100 p-3.5 rounded-full shadow-xl flex items-center gap-2 transition-all hover:scale-105"
        >
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-semibold pr-1">Cania Sommelier</span>
        </button>
      ) : (
        <div className="atlas-card w-80 sm:w-96 h-[450px] flex flex-col shadow-2xl border-red-900/40 overflow-hidden">
          {/* Header Chat */}
          <div className="bg-red-950/40 border-b border-surface-border p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wine className="w-4 h-4 text-red-400" />
              <span className="text-xs font-bold text-foreground">Cania Sommelier</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Lista de Mensajes */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl ${
                    m.role === "user"
                      ? "bg-accent text-accent-foreground font-medium"
                      : "bg-surface-hover text-foreground border border-surface-border"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-surface-hover p-3 rounded-2xl flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Consultando bodega...</span>
                </div>
              </div>
            )}
          </div>

          {/* Formulario Input */}
          <form onSubmit={handleSend} className="p-3 border-t border-surface-border flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="¿Qué vino me recomiendas para..."
              className="atlas-input text-xs py-2"
            />
            <button
              type="submit"
              disabled={loading}
              className="atlas-button-primary px-3 py-2 text-xs"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
