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

const SYSTEM_PROMPT = "Eres el asistente de GatoCan Natura Rural. Eres un gato sabio, amable y un poco travieso. Tu objetivo es ayudar con dudas sobre la asociación, el método CER y bienestar animal. Responde de forma breve, cariñosa y usa emojis de gatos 🐾.";

const SECTION_SUGGESTIONS = [
  { section: "Donaciones", href: "/donaciones", keywords: ["donar", "donacion", "bizum", "paypal", "ayuda economica", "tarjeta", "dinero"] },
  { section: "Foro", href: "/foro", keywords: ["foro", "pregunta", "comunidad", "tema", "hablar"] },
  { section: "Noticias", href: "/noticias", keywords: ["noticias", "novedades", "actualidad", "eventos", "pasa"] },
  { section: "Rankings", href: "/rankings", keywords: ["ranking", "karma", "puntos", "runner", "juego", "top"] },
  { section: "Perfil", href: "/perfil", keywords: ["perfil", "cuenta", "usuario", "login", "mi datos"] },
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

    if (!lastUserMessage) {
      return NextResponse.json({ error: "El mensaje es obligatorio." }, { status: 400 });
    }

    // Buscamos la clave en las posibles variables que hayas configurado
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      console.error("❌ ERROR: No hay API KEY configurada.");
      return NextResponse.json({ error: "Falta la API KEY." }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Configuramos el modelo con la instrucción de sistema de forma más explícita
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: {
        role: "system",
        parts: [{ text: SYSTEM_PROMPT }]
      }
    });

    // Mapeamos el historial
    let history = (body.messages || [])
      .filter((msg) => msg?.content?.trim())
      .map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content.trim() }],
      }));

    // El historial debe empezar por 'user'
    if (history.length > 0 && history[0].role === "model") {
      history.shift();
    }

    // Iniciamos chat con historial limpio
    const chat = model.startChat({
      history: history.slice(-10),
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 250,
      },
    });

    const result = await chat.sendMessage(lastUserMessage);
    const textReply = result.response.text().trim();

    return NextResponse.json({
      reply: textReply || "¡Miau! No supe qué decir 🐾",
      suggestions: extractSuggestions(lastUserMessage),
    });

  } catch (error: any) {
    console.error("--- 🚨 FALLO EN EL CHAT ---");
    console.error(error);
    
    return NextResponse.json({ 
      error: "Error en el servidor", 
      details: error.message 
    }, { status: 500 });
  }
}
