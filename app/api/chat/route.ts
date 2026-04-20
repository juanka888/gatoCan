import { NextResponse } from "next/server";

type Role = "user" | "assistant";
type ChatMessage = { role: Role; content: string; };
type ChatPayload = { message?: string; messages?: ChatMessage[]; };

const SYSTEM_PROMPT = "Eres el asistente de GatoCan Natura Rural. Eres un gato sabio, amable y travieso. Responde corto y usa emojis 🐾.";

const SECTION_SUGGESTIONS = [
  { section: "Donaciones", href: "/donaciones", keywords: ["donar", "donacion", "bizum", "paypal", "ayuda"] },
  { section: "Foro", href: "/foro", keywords: ["foro", "pregunta", "comunidad"] },
  { section: "Noticias", href: "/noticias", keywords: ["noticias", "novedades", "actualidad"] },
  { section: "Rankings", href: "/rankings", keywords: ["ranking", "karma", "puntos"] },
  { section: "Perfil", href: "/perfil", keywords: ["perfil", "cuenta", "usuario"] },
];

function normalize(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function extractSuggestions(text: string) {
  const normalized = normalize(text);
  return SECTION_SUGGESTIONS.filter((item) =>
    item.keywords.some((keyword) => normalized.includes(normalize(keyword)))
  ).map(({ section, href }) => ({ section, href }));
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatPayload;
    const lastUserMessage = body.message?.trim();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!lastUserMessage || !apiKey) {
      return NextResponse.json({ error: "Faltan datos o API KEY" }, { status: 400 });
    }

    // Construimos el historial para la API REST de Google
    const contents = (body.messages || [])
      .filter(msg => msg.content)
      .map(msg => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
      }));

    // Añadimos el mensaje actual
    contents.push({ role: "user", parts: [{ text: lastUserMessage }] });

    // LLAMADA MANUAL AL ENDPOINT (Esto evita el error 404 de la librería)
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: contents.slice(-11), // Últimos 10 + el nuevo
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        generationConfig: { temperature: 0.7, maxOutputTokens: 300 }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Error en la respuesta de Google");
    }

    const textReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "¡Miau! No supe qué decir 🐾";

    return NextResponse.json({
      reply: textReply.trim(),
      suggestions: extractSuggestions(lastUserMessage),
    });

  } catch (error: any) {
    console.error("--- 🚨 FALLO EN EL CHAT ---", error);
    return NextResponse.json({ error: "Fallo", details: error.message }, { status: 500 });
  }
      }
        
