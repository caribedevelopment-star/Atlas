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

const DEFAULT_MODEL = 'gemini-3.6-flash';
const FALLBACK_MODEL = 'gemini-flash-latest';

export async function POST(request: Request) {
  try {
    const body = await request.json() as { message?: string; wines?: WineContext[]; history?: HistoryItem[] };
    const message = body.message?.trim();
    if (!message) return NextResponse.json({ error: 'Escribe una pregunta para Can.ia 🍷' }, { status: 400 });

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
    if (!apiKey) return NextResponse.json({ reply: localSommelier(message, wines), mode: 'local' });

    const history = (body.history ?? [])
      .slice(-8)
      .map((item) => `${item.role === 'user' ? 'Usuario' : 'Can.ia'}: ${item.text ?? ''}`)
      .join('\n');

    const prompt = `Eres Can.ia Sommelier 🍷, la sommelier personal de Atlas. Responde siempre en español natural, elegante, cercano y muy fácil de escanear.

REGLAS DE ESTILO:
- Usa entre 1 y 4 emojis útiles por respuesta, nunca una lluvia de emojis.
- Mensajes limpios: frases cortas, espacios y como máximo 3 bloques breves.
- Si recomiendas un vino, empieza directamente por la recomendación.
- Puedes usar encabezados muy cortos como "🍷 Mi elección", "🍽️ Maridaje" o "💡 Por qué" cuando ayuden.
- Evita párrafos largos, introducciones genéricas y repeticiones.
- Máximo 140 palabras salvo que el usuario pida detalle.

REGLAS DE DATOS:
- Tu prioridad es la bodega REAL proporcionada por Atlas.
- Nunca inventes botella, precio, valoración, tienda, añada o nota que no esté en los datos.
- Puedes explicar maridajes y conceptos generales con conocimiento enológico, distinguiéndolos de datos reales de Atlas.
- Si pregunta qué comprar, prioriza vinos disponibles en el catálogo recibido.
- Si falta información importante, dilo en una sola frase y haz como máximo una pregunta útil.

Bodega disponible:
${JSON.stringify(cellar)}

Conversación reciente:
${history}

Pregunta del usuario: ${message}`;

    const ai = new GoogleGenAI({ apiKey });
    const configured = process.env.GEMINI_MODEL?.trim();
    const models = Array.from(new Set([DEFAULT_MODEL, configured, FALLBACK_MODEL].filter((value): value is string => Boolean(value))));

    for (const model of models) {
      try {
        const response = await ai.models.generateContent({ model, contents: prompt });
        const reply = response.text?.trim();
        if (reply) return NextResponse.json({ reply, mode: 'ai', model });
      } catch (error) {
        console.error(`Can.ia provider error (${model}):`, error);
      }
    }

    return NextResponse.json({ reply: localSommelier(message, wines), mode: 'local' });
  } catch (error) {
    console.error('Can.ia error:', error);
    return NextResponse.json({ error: 'Can.ia no pudo procesar la consulta 🍷' }, { status: 400 });
  }
}

function localSommelier(message: string, wines: WineContext[]): string {
  if (!wines.length) return '🍷 Todavía no tengo vinos cargados para recomendarte una botella concreta.\n\nPuedes preguntarme por un maridaje general o añadir vinos a Atlas para que use tu bodega real.';
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
  return `🍷 **Mi elección: ${choice.name ?? 'esta botella'}**${details ? `\n${details}` : ''}\n\n${choice.tasting_notes ? `💡 ${choice.tasting_notes}\n\n` : ''}Si me dices el plato, presupuesto o estilo que buscas, te la afino.`;
}
