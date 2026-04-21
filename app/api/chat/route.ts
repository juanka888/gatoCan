import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Limpiamos la clave de posibles espacios invisibles
    const apiKey = process.env.GEMINI_API_KEY?.trim();

    if (!apiKey) {
      return NextResponse.json({ reply: "¡Miau! Mi llave no ha llegado al servidor de Vercel. 🐾" });
    }

    // Usamos la versión v1beta que es la que te ha funcionado en el navegador
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: body.message || "Hola" }]
          }
        ],
        systemInstruction: {
          parts: [{ text: "Eres el asistente de GatoCan. Eres un gato sabio, protector y amable. Responde siempre muy corto y usa emojis de gatos 🐾." }]
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error detallado de Google:", data);
      return NextResponse.json({ reply: "¡Uy! Me he enredado con un ovillo de lana. Inténtalo otra vez. 🧶🐾" });
    }

    const textReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "¡Miau! 🐾";

    return NextResponse.json({
      reply: textReply.trim(),
      suggestions: [] 
    });

  } catch (error: any) {
    return NextResponse.json({ reply: "He tenido un pequeño problema de conexión gatuna. 😿" });
  }
}
