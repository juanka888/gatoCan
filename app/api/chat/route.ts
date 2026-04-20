import { NextResponse } from "next/server";

type Role = "user" | "assistant";

type ChatMessage = {
  role: Role;
  content: string;
};

type ChatPayload = {
  message?: string;
  messages?: ChatMessage[];
};

const SYSTEM_PROMPT =
  "Eres el asistente de GatoCan Natura Rural. Eres un gato sabio, amable y un poco travieso. Respondes dudas sobre la asociación, el bienestar animal y ayudas a navegar la web. Usa emojis de gatos y mantén respuestas cortas";

const SECTION_SUGGESTIONS = [
  { section: "Donaciones", href: "/donaciones", keywords: ["donar", "donacion", "bizum", "paypal", "ayuda economica", "tarjeta"] },
  { section: "Foro", href: "/foro", keywords: ["foro", "pregunta", "comunidad", "tema"] },
  { section: "Noticias", href: "/noticias", keywords: ["noticias", "novedades", "actualidad", "eventos"] },
  { section: "Rankings", href: "/rankings", keywords: ["ranking", "karma", "puntos", "runner", "juego"] },
  { section: "Políticas", href: "/politicas", keywords: ["privacidad", "politica", "aviso legal", "cookies"] },
  { section: "Perfil", href: "/perfil", keywords: ["perfil", "cuenta", "usuario", "login", "registro"] },
];

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
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

    if (!lastUserMessage) {
      return NextResponse.json({ error: "El mensaje es obligatorio." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Falta configurar GEMINI_API_KEY (o GOOGLE_API_KEY) en el servidor." },
        { status: 500 }
      );
    }

    const history = (body.messages || [])
      .filter((msg) => msg?.content?.trim())
      .slice(-12)
      .map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content.trim() }],
      }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            role: "system",
            parts: [{ text: SYSTEM_PROMPT }],
          },
          contents: [...history, { role: "user", parts: [{ text: lastUserMessage }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 220,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `Gemini API error: ${errorText}` }, { status: 502 });
    }

    const data = await response.json();
    const textReply =
      data?.candidates?.[0]?.content?.parts
        ?.map((part: { text?: string }) => part?.text || "")
        .join("\n")
        .trim() || "Miau... ahora mismo no tengo respuesta 😿";

    return NextResponse.json({
      reply: textReply,
      suggestions: extractSuggestions(lastUserMessage),
    });
  } catch {
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
