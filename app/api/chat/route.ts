import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const apiKey = process.env.GEMINI_API_KEY?.trim();

    if (!apiKey) {
      return NextResponse.json({ reply: "¡Miau! No detecto la llave. 🐾" });
    }

    // Probamos con gemini-pro, que es el modelo con menos errores de compatibilidad
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: body.message || "Hola" }]
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      // Si falla, sacamos el error exacto para no adivinar más
      console.error("Error técnico real:", data.error?.message);
      return NextResponse.json({ 
        reply: "Error de Google: " + (data.error?.message || "Desconocido") 
      });
    }

    const textReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "¡Miau! 🐾";
    return NextResponse.json({ reply: textReply });

  } catch (error) {
    return NextResponse.json({ reply: "Fallo de conexión en el servidor. 🧶" });
  }
}
