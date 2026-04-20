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
  "Eres el asistente de GatoCan Natura Rural. Eres un gato sabio, amable y un poco travieso. Tu objetivo es ayudar con dudas sobre la asociación, el método CER y bienestar animal. Responde de forma breve, cariñosa y usa emojis de gatos 🐾.";

const SECTION_SUGGESTIONS = [
  { section: "Donaciones", href: "/donaciones", keywords: ["donar", "donacion", "bizum", "paypal", "ayuda economica", "tarjeta", "dinero"] },
  { section: "Foro", href: "/foro", keywords: ["foro", "pregunta", "comunidad", "tema", "hablar"] },
  { section: "Noticias", href: "/noticias", keywords: ["noticias", "novedades", "actualidad", "eventos", "pasa"] },
  { section: "Rankings", href: "/rankings", keywords: ["ranking", "karma", "puntos", "runner", "juego", "top"] },
  { section: "Perfil", href: "/perfil", keywords: ["perfil", "cuenta", "usuario", "login", "mis datos"] },
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

    // Buscamos la API KEY en las variables de entorno
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      console.error("❌ ERROR: API KEY no configurada.");
      return NextResponse.json({ error: "Falta API KEY en el servidor." }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // USAMOS LA VERSIÓN v1 PARA EVITAR EL ERROR 404
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: {
        role: "system",
        parts: [{ text: SYSTEM_PROMPT }]
      }
    }, { apiVersion: 'v1' });

    // Preparamos el historial para Gemini
    let history = (body.messages || [])
      .filter((msg) => msg?.content?.trim())
      .map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content.trim() }],
      }));

    // El historial debe empezar siempre por un mensaje de usuario
    if (history.length > 0 && history[0].role === "model") {
      history.shift();
    }

    // Limitamos a los últimos 10 mensajes
    const chat = model.startChat({
      history: history.slice(-10),
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 250,
      },
    });

    const result = await chat.sendMessage(lastUserMessage);
    const textReply = result.response.text().trim();

    // Devolvemos la respuesta de la IA + las sugerencias de navegación
    return NextResponse.json({
      reply: textReply || "¡Miau! No supe qué decir 🐾",
      suggestions: extractSuggestions(lastUserMessage),
    });

  } catch (error: any) {
    console.error("--- 🚨 FALLO DETECTADO ---");
    console.error(error);
    
    return NextResponse.json({ 
      error: "Error en el servidor", 
      message: error.message || "Error desconocido"
    }, { status: 500 });
  }
}
