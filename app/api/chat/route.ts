import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// 1. DEFINICIÓN DE TIPOS
type Role = "user" | "assistant";

type ChatMessage = {
  role: Role;
  content: string;
};

type ChatPayload = {
  message?: string;
  messages?: ChatMessage[];
};

// 2. CONFIGURACIÓN DEL SISTEMA
const SYSTEM_PROMPT =
  "Eres el asistente de GatoCan Natura Rural. Eres un gato sabio, amable y un poco travieso. Tu objetivo es ayudar con dudas sobre la asociación, el método CER y bienestar animal. Responde de forma breve, cariñosa y usa emojis de gatos 🐾.";

// 3. DICCIONARIO DE SUGERENCIAS (Botones de navegación)
const SECTION_SUGGESTIONS = [
  { section: "Donaciones", href: "/donaciones", keywords: ["donar", "donacion", "bizum", "paypal", "ayuda economica", "tarjeta", "dinero", "contribuir"] },
  { section: "Foro", href: "/foro", keywords: ["foro", "pregunta", "comunidad", "tema", "hablar", "discutir", "duda"] },
  { section: "Noticias", href: "/noticias", keywords: ["noticias", "novedades", "actualidad", "eventos", "pasa", "nuevo", "blog"] },
  { section: "Rankings", href: "/rankings", keywords: ["ranking", "karma", "puntos", "runner", "juego", "top", "clasificacion"] },
  { section: "Políticas", href: "/politicas", keywords: ["privacidad", "politica", "aviso legal", "cookies", "legal"] },
  { section: "Perfil", href: "/perfil", keywords: ["perfil", "cuenta", "usuario", "login", "mis datos", "ajustes"] },
];

// 4. FUNCIONES DE UTILIDAD
function normalize(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function extractSuggestions(text: string) {
  const normalized = normalize(text);
  return SECTION_SUGGESTIONS.filter((item) =>
    item.keywords.some((keyword) => normalized.includes(normalize(keyword)))
  ).map(({ section, href }) => ({ section, href }));
}

// 5. MANEJADOR DE LA RUTA POST
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatPayload;
    const lastUserMessage = body.message?.trim();

    if (!lastUserMessage) return NextResponse.json({ error: "Mensaje vacío" }, { status: 400 });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Falta la llave API en Vercel" }, { status: 500 });

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // --- EL CAMBIO MAESTRO ---
    // Usamos 'gemini-1.5-flash' pero forzamos explícitamente la API 'v1'
    // Si sigue fallando, la librería tiene un bug interno con Next.js
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

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: `Actúa siempre como: ${SYSTEM_PROMPT}` }] },
        { role: "model", parts: [{ text: "¡Miau! Entendido. 🐾" }] },
        ...history.slice(-10)
      ],
      generationConfig: { temperature: 0.7, maxOutputTokens: 250 },
    });

    const result = await chat.sendMessage(lastUserMessage);
    const textReply = result.response.text().trim();

    return NextResponse.json({
      reply: textReply || "¡Miau! No sé qué decir 🐾",
      suggestions: extractSuggestions(lastUserMessage),
    });

  } catch (error: any) {
    console.error("--- 🚨 ERROR EN EL CHAT ---");
    console.error(error);
    return NextResponse.json({ error: "Fallo en el servidor", details: error.message }, { status: 500 });
  }
}
