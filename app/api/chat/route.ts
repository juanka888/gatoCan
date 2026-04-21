import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const lastUserMessage = body.message?.trim();
    // Limpiamos la API KEY por si acaso tiene espacios invisibles
    const apiKey = process.env.GEMINI_API_KEY?.trim();

    if (!lastUserMessage || !apiKey) {
      return NextResponse.json({ error: "Faltan datos clave" }, { status: 400 });
    }

    // URL TOTALMENTE GLOBAL Y ESTABLE
    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: lastUserMessage }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 200 }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("DETALLE DEL ERROR:", JSON.stringify(data));
      return NextResponse.json({ error: data.error?.message || "Error en Google" }, { status: response.status });
    }

    const textReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "¡Miau! 🐾";

    return NextResponse.json({
      reply: textReply.trim(),
      suggestions: [] // Simplificado para probar si conecta
    });

  } catch (error: any) {
    console.error("--- 🚨 FALLO TOTAL ---", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
