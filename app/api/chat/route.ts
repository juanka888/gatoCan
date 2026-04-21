import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 1. Extraemos la clave y limpiamos espacios que puedan venir de Vercel
    const apiKey = process.env.GEMINI_API_KEY?.trim();

    if (!apiKey) {
      return NextResponse.json({ 
        reply: "¡Miau! No encuentro la variable GEMINI_API_KEY en Vercel. 🐾" 
      });
    }

    // 2. Usamos la URL larga y la versión v1beta (la que te funcionó en el navegador)
    // Usamos 'gemini-1.5-flash-latest' para máxima compatibilidad
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: body.message || "Hola" }]
          }
        ],
        // Esto le da la personalidad al gato directamente desde la API
        systemInstruction: {
          parts: [{ text: "Eres el asistente de GatoCan. Eres un gato sabio, travieso y protector. Responde de forma muy breve y usa emojis de gatos 🐾." }]
        },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 200,
        }
      }),
    });

    const data = await response.json();

    // 3. Control de errores detallado
    if (!response.ok) {
      console.error("Error detectado en la llamada a Google:", JSON.stringify(data));
      
      // Si el error sigue siendo 404, damos una pista clara
      if (response.status === 404) {
        return NextResponse.json({ 
          reply: "¡Uy! Google dice que no encuentra el modelo (Error 404). Revisa que la clave sea la del proyecto correcto. 🧶" 
        });
      }

      return NextResponse.json({ 
        reply: "He tenido un traspié gatuno. Inténtalo de nuevo en un momento. 🐾" 
      });
    }

    // 4. Extraemos la respuesta del texto
    const textReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "¡Miau! Me he quedado sin palabras. 🐾";

    return NextResponse.json({
      reply: textReply.trim(),
      suggestions: [] 
    });

  } catch (error: any) {
    console.error("Fallo crítico en el servidor:", error);
    return NextResponse.json({ 
      reply: "Mis cables gatunos se han cruzado. 😿" 
    });
  }
}
