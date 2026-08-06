import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

type WineContext = { name?: string; winery?: string; vintage?: number; rating?: number; supermarket?: string; price?: number; tasting_notes?: string };
type HistoryItem = { role?: string; text?: string };

export async function POST(request: Request) {
  try {
    const body = await request.json() as { message?: string; wines?: WineContext[]; history?: HistoryItem[] };
    const message = body.message?.trim();
    if (!message) return NextResponse.json({ error: 'Escribe una pregunta para Cania.' }, { status: 400 });
    const cellar = (body.wines ?? []).slice(0,100).map((wine)=>({ nombre:wine.name, bodega:wine.winery, añada:wine.vintage, valoración:wine.rating, tienda:wine.supermarket, precio:wine.price, notas:wine.tasting_notes }));
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ reply: localSommelier(message, body.wines ?? []) });
    const history = (body.history ?? []).slice(-8).map((item)=>`${item.role === 'user' ? 'Usuario' : 'Cania'}: ${item.text ?? ''}`).join('\n');
    const prompt = `Eres Cania, la sommelier de Atlas. Responde en español, con cercanía y precisión. Recomienda primero vinos de la bodega real proporcionada; no inventes botellas ni precios. Si faltan datos, dilo y formula una sola pregunta útil. Mantén la respuesta por debajo de 180 palabras.\n\nBodega del usuario:\n${JSON.stringify(cellar)}\n\nConversación reciente:\n${history}\n\nPregunta: ${message}`;
    try { const ai = new GoogleGenAI({ apiKey }); const response = await ai.models.generateContent({ model: process.env.GEMINI_MODEL || 'gemini-2.5-flash', contents: prompt }); const reply = response.text?.trim(); if (!reply) throw new Error('EMPTY_AI_RESPONSE'); return NextResponse.json({ reply }); }
    catch (error) { console.error('Cania provider error:',error); return NextResponse.json({ reply: localSommelier(message,body.wines??[]) }); }
  } catch (error) { console.error('Cania error:', error); return NextResponse.json({ error: 'Cania no pudo procesar la consulta.' }, { status: 400 }); }
}

function localSommelier(message:string,wines:WineContext[]):string { if(!wines.length)return 'Tu bodega todavía no tiene vinos con los que pueda trabajar. Añade una botella y podré recomendarte una opción real de tu colección.';const words=message.toLocaleLowerCase('es'),preferred=wines.filter((wine)=>{const text=`${wine.name} ${wine.winery} ${wine.tasting_notes}`.toLocaleLowerCase('es');if(/carne|queso|guiso|asado/.test(words))return /tinto|tempranillo|cabernet|syrah|crianza|roble/.test(text);if(/pescado|marisco|arroz|ensalada/.test(words))return /blanco|albariño|verdejo|sauvignon|chardonnay/.test(text);if(/postre|dulce/.test(words))return /dulce|moscatel|oporto/.test(text);return true}),choice=(preferred.length?preferred:wines).slice().sort((a,b)=>(b.rating??0)-(a.rating??0))[0];const details=[choice.winery,choice.vintage,choice.rating?`${choice.rating}/5`:undefined,choice.price?`${choice.price} €`:undefined].filter(Boolean).join(' · ');return `De tu bodega elegiría ${choice.name ?? 'esta botella'}${details?` (${details})`:''}. ${choice.tasting_notes?`Tus notas dicen: ${choice.tasting_notes}. `:''}Es la recomendación más coherente con lo que tienes guardado. Si me dices el plato exacto, puedo afinar el maridaje.`; }
