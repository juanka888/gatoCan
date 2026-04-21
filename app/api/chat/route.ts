import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const apiKey = process.env.GEMINI_API_KEY?.trim();

    if (!apiKey) {
      return NextResponse.json({ reply: "¡Miau! No encuentro mi llave mágica en el servidor. 🐾" });
    }

    // Usamos v1beta, que es la ruta que NUNCA falla con llaves de AI Studio
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: body.message || "Hola" }]
        }],
        systemInstruction: {
          parts: [{ text: "Eres el asistente de GatoCan. Eres un gato sabio y travieso. Responde muy corto y usa muchos emojis 🐾." }]
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error de Google:", data);
      // Si falla, devolvemos un mensaje simpático en lugar del error técnico
      return NextResponse.json({ reply: "¡Uy! Me he enredado con un ovillo de lana. Inténtalo de nuevo, miau. 🧶🐾" });
    }

    const textReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "¡Miau! Me he quedado sin palabras. 🐾";

    return NextResponse.json({
      reply: textReply.trim(),
      suggestions: [] 
    });

  } catch (error: any) {
    return NextResponse.json({ reply: "He tenido un pequeño problema gatuno. 😿" });
  }
}
