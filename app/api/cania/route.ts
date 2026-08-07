import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

type WineContext = {
  name?: string;
  winery?: string;
  vintage?: number;
  rating?: number;
  supermarket?: string;
  price?: number;
  tasting_notes?: string;
  country?: string;
  region?: string;
  grapes?: string[] | string;
};
type HistoryItem = { role?: string; text?: string };

const DEFAULT_MODEL = 'gemini-3.5-flash';
const FALLBACK_MODEL = 'gemini-flash-latest';

export async function POST(request: Request) {
  try {
    const body = await request.json() as { message?: string; wines?: WineContext[]; history?: HistoryItem[] };
    const message = body.message?.trim();
    if (!message) return NextResponse.json({ error: 'Escribe una pregunta para Cania.' }, { status: 400 });

    const wines = (body.wines ?? []).slice(0, 100);
    const cellar = wines.map((wine) => ({
      nombre: wine.name,
      bodega: wine.winery,
      añada: wine.vintage,
      valoración: wine.rating,
      tienda: wine.supermarket,
      precio: wine.price,
      notas: wine.tasting_notes,
      país: wine.country,
      región: wine.region,
      uvas: wine.grapes,
    }));

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ reply: localSommelier(message, wines), mode: 'local' });
    }

    const history = (body.history ?? [])
      .slice(-8)
      .map((item) => `${item.role === 'user' ? 'Usuario' : 'Cania'}: ${item.text ?? ''}`)
      .join('\n');

    const prompt = `Eres Cania, la sommelier de Atlas. Responde siempre en español natural y útil. Tu prioridad es la bodega REAL proporcionada por Atlas. Nunca inventes una botella, precio, valoración, tienda o nota que no esté en los datos. Puedes explicar maridajes y conceptos generales de vino usando conocimiento enológico, pero distingue claramente una recomendación de la bodega de una sugerencia general. Si el usuario pregunta qué comprar, prioriza vinos del catálogo disponible. Si faltan datos, dilo brevemente. Sé concreta: máximo 180 palabras.\n\nBodega disponible:\n${JSON.stringify(cellar)}\n\nConversación reciente:\n${history}\n\nPregunta del usuario: ${message}`;

    const ai = new GoogleGenAI({ apiKey });
    const configured = process.env.GEMINI_MODEL?.trim();
    const models = Array.from(new Set([configured, DEFAULT_MODEL, FALLBACK_MODEL].filter((value): value is string => Boolean(value))));

    for (const model of models) {
      try {
        const response = await ai.models.generateContent({ model, contents: prompt });
        const reply = response.text?.trim();
        if (reply) return NextResponse.json({ reply, mode: 'ai', model });
      } catch (error) {
        console.error(`Cania provider error (${model}):`, error);
      }
    }

    return NextResponse.json({ reply: localSommelier(message, wines), mode: 'local' });
  } catch (error) {
    console.error('Cania error:', error);
    return NextResponse.json({ error: 'Cania no pudo procesar la consulta.' }, { status: 400 });
  }
}

function localSommelier(message: string, wines: WineContext[]): string {
  if (!wines.length) return 'Todavía no tengo vinos cargados para recomendarte una botella concreta. Puedes preguntarme por maridajes generales o añadir vinos a Atlas para que use tu bodega real.';
  const words = message.toLocaleLowerCase('es');
  const preferred = wines.filter((wine) => {
    const text = `${wine.name ?? ''} ${wine.winery ?? ''} ${wine.tasting_notes ?? ''} ${wine.region ?? ''} ${Array.isArray(wine.grapes) ? wine.grapes.join(' ') : wine.grapes ?? ''}`.toLocaleLowerCase('es');
    if (/carne|queso|guiso|asado|chuletón/.test(words)) return /tinto|tempranillo|cabernet|syrah|crianza|roble|ribera|rioja/.test(text);
    if (/pescado|marisco|arroz|ensalada|ceviche/.test(words)) return /blanco|albariño|verdejo|sauvignon|chardonnay|godello/.test(text);
    if (/postre|dulce/.test(words)) return /dulce|moscatel|oporto|pedro ximénez/.test(text);
    return true;
  });
  const choice = (preferred.length ? preferred : wines).slice().sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))[0];
  const details = [choice.winery, choice.vintage, choice.rating ? `${choice.rating}/5` : undefined, choice.price ? `${choice.price} €` : undefined].filter(Boolean).join(' · ');
  return `De los vinos que Atlas tiene disponibles elegiría ${choice.name ?? 'esta botella'}${details ? ` (${details})` : ''}. ${choice.tasting_notes ? `La nota guardada dice: ${choice.tasting_notes}. ` : ''}Si me dices el plato, presupuesto o estilo que buscas, te doy una recomendación más precisa.`;
}
