import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

type WineContext = { name?: string; winery?: string; vintage?: number; rating?: number; supermarket?: string; price?: number; tasting_notes?: string };
type HistoryItem = { role?: string; text?: string };

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'Cania no está configurada. Añade GEMINI_API_KEY al entorno.' }, { status: 503 });
  try {
    const body = await request.json() as { message?: string; wines?: WineContext[]; history?: HistoryItem[] };
    const message = body.message?.trim();
    if (!message) return NextResponse.json({ error: 'Escribe una pregunta para Cania.' }, { status: 400 });
    const cellar = (body.wines ?? []).slice(0,100).map((wine)=>({ nombre:wine.name, bodega:wine.winery, añada:wine.vintage, valoración:wine.rating, tienda:wine.supermarket, precio:wine.price, notas:wine.tasting_notes }));
    const history = (body.history ?? []).slice(-8).map((item)=>`${item.role === 'user' ? 'Usuario' : 'Cania'}: ${item.text ?? ''}`).join('\n');
    const prompt = `Eres Cania, la sommelier de Atlas. Responde en español, con cercanía y precisión. Recomienda primero vinos de la bodega real proporcionada; no inventes botellas ni precios. Si faltan datos, dilo y formula una sola pregunta útil. Mantén la respuesta por debajo de 180 palabras.\n\nBodega del usuario:\n${JSON.stringify(cellar)}\n\nConversación reciente:\n${history}\n\nPregunta: ${message}`;
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({ model: process.env.GEMINI_MODEL || 'gemini-2.5-flash', contents: prompt });
    const reply = response.text?.trim();
    if (!reply) throw new Error('EMPTY_AI_RESPONSE');
    return NextResponse.json({ reply });
  } catch (error) { console.error('Cania error:', error); return NextResponse.json({ error: 'Cania no pudo responder ahora. Inténtalo de nuevo.' }, { status: 502 }); }
}
