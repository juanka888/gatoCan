import { GoogleGenerativeAI } from "@google/generative-ai";
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
  "Eres el asistente de GatoCan Natura Rural. Eres un gato sabio, amable y un poco travieso. Ayudas con dudas sobre la asociación, el método CER y bienestar animal. Responde de forma breve y usa emojis de gatos 🐾.";

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

    if (!lastUserMessage) return NextResponse.json({ error: "Vacío" }, { status: 400 });

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Sin API KEY" }, { status: 500 });

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Cambiamos la forma de pasar el SYSTEM_PROMPT para evitar el error 'systemInstruction'
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    }, { apiVersion: 'v1' });

    let history = (body.messages || [])
      .filter((msg) => msg?.content?.trim())
      .map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content.trim() }],
      }));

    if (history.length > 0 && history[0].role === "model") history.shift();

    // Insertamos el SYSTEM_PROMPT como el primer mensaje del historial si la librería falla con el config
    const chatHistory = [
      { role: "user", parts: [{ text: `INSTRUCCIÓN DE SISTEMA: ${SYSTEM_PROMPT}` }] },
      { role: "model", parts: [{ text: "¡Miau! Entendido, actuaré como el asistente gato de GatoCan. 🐾" }] },
      ...history.slice(-10)
    ];

    const chat = model.startChat({
      history: chatHistory,
      generationConfig: { temperature: 0.8, maxOutputTokens: 250 },
    });

    const result = await chat.sendMessage(lastUserMessage);
    const textReply = result.response.text().trim();

    return NextResponse.json({
      reply: textReply || "¡Miau! No supe qué decir 🐾",
      suggestions: extractSuggestions(lastUserMessage),
    });

  } catch (error: any) {
    console.error("--- 🚨 FALLO DETECTADO ---", error);
    return NextResponse.json({ error: "Fallo en el servidor", message: error.message }, { status: 500 });
  }
}
