import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt, userWines } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { reply: 'Hola, falta configurar la clave GEMINI_API_KEY en las variables de entorno.' },
        { status: 200 }
      );
    }

    const systemInstruction = `
Tu nombre es Cania. Eres una experta sommelier, cálida, cercana, elegante y muy apasionada por el mundo del vino.
Estás integrada en la aplicación web 'Atlas' para aconsejar al usuario sobre su bodega personal, maridajes de comida con vino, notas de cata y recomendaciones.

Esta es la lista actual de vinos que el usuario tiene guardados en su bodega personal:
${JSON.stringify(userWines || [], null, 2)}

Instrucciones de respuesta:
- Responde siempre con un tono amigable, experto y entusiasta.
- Si te preguntan qué vino abrir o con qué maridar un plato, analiza su bodega e intenta recomendarle uno de sus vinos guardados.
- Si no tiene ninguno adecuado en su lista, recomiéndale uno clásico de mercado y explícales por qué.
- Mantén las respuestas claras y no demasiado largas.
    `;

    // URL corregida a la versión 'v1' oficial
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Añadimos system_instruction de manera nativa para mejor comportamiento
          system_instruction: {
            parts: [{ text: systemInstruction }]
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      console.error('Error Gemini API:', data.error);
      return NextResponse.json({ reply: 'Disculpa, tuve un problema al consultar mi manual de cata. Inténtalo de nuevo.' });
    }

    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      'No he podido procesar esa consulta sobre vinos, ¿me la repites?';

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('Error endpoint Cania:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}