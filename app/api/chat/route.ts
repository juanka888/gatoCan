import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  
  if (!apiKey) {
    return NextResponse.json({ reply: "¡Miau! Falta la llave en el servidor. 🐾" });
  }

  try {
    const body = await request.json();
    const message = body.message || "Hola";

    // Versión v1beta con reintento simple
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }],
        systemInstruction: {
          parts: [{ text: "Eres el asistente de GatoCan. Responde como un gato sabio, corto y con emojis 🐾." }]
        },
        generationConfig: { maxOutputTokens: 200 }
      }),
      // Añadimos un tiempo de espera para que no se quede colgado
      signal: AbortSignal.timeout(10000) 
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Fallo de conexión");
    }

    const textReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "¡Miau! 🐾";
    return NextResponse.json({ reply: textReply });

  } catch (error: any) {
    console.error("Error GatoCan:", error.message);
    return NextResponse.json({ 
      reply: "Ups, he tenido un problema gatuno. ¿Me lo repites? 🧶" 
    });
  }
}
