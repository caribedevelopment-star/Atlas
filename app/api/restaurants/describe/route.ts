import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

type RestaurantContext = { name?: string; label?: string; city?: string; country?: string; cuisine?: string; openingHours?: string };

export async function POST(request: Request) {
  try {
    const body = await request.json() as { restaurant?: RestaurantContext; status?: 'visited' | 'wishlist' };
    const restaurant = body.restaurant;
    if (!restaurant?.name && !restaurant?.label) return NextResponse.json({ error: 'Selecciona primero un restaurante.' }, { status: 400 });
    const fallback = localDescription(restaurant, body.status);
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ description: fallback, mode: 'local' });
    const prompt = `Escribe una nota breve para una guía privada de restaurantes en español. Usa exclusivamente estos datos: ${JSON.stringify(restaurant)}. Estado: ${body.status ?? 'visited'}. Una o dos frases, máximo 45 palabras, tono natural y elegante. No inventes premios, platos, precios, horarios ni hechos. No uses markdown ni emojis.`;
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({ model: process.env.GEMINI_MODEL?.trim() || 'gemini-3.6-flash', contents: prompt });
      const description = response.text?.trim();
      return NextResponse.json({ description: description || fallback, mode: description ? 'ai' : 'local' });
    } catch (error) {
      console.error('Restaurant description provider error:', error);
      return NextResponse.json({ description: fallback, mode: 'local' });
    }
  } catch {
    return NextResponse.json({ error: 'No se pudo preparar la nota.' }, { status: 400 });
  }
}

function localDescription(restaurant: RestaurantContext, status?: 'visited' | 'wishlist') {
  const name = restaurant.name || restaurant.label?.split(',')[0] || 'Este restaurante';
  const context = [restaurant.cuisine, restaurant.city, restaurant.country].filter(Boolean).join(' · ');
  return status === 'wishlist' ? `${name}${context ? ` — ${context}` : ''}. Guardado para conocerlo y completar la ficha después de la visita.` : `${name}${context ? ` — ${context}` : ''}. Una mesa añadida a mi guía privada para recordar la experiencia y decidir si volver.`;
}
