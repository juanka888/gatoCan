import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// 1. DEFINICIÓN DE TIPOS (Para que TypeScript no dé errores)
type Role = "user" | "assistant";

type ChatMessage = {
  role: Role;
  content: string;
};

type ChatPayload = {
  message?: string;
  messages?: ChatMessage[];
};

// 2. CONFIGURACIÓN DEL SISTEMA Y PERSONALIDAD
const SYSTEM_PROMPT =
  "Eres el asistente de GatoCan Natura Rural. Eres un gato sabio, amable y un poco travieso. Tu objetivo es ayudar con dudas sobre la asociación, el método CER y bienestar animal. Responde de forma breve, cariñosa y usa emojis de gatos 🐾.";

// 3. DICCIONARIO DE SUGERENCIAS DE NAVEGACIÓN
const SECTION_SUGGESTIONS = [
  { section: "Donaciones", href: "/donaciones", keywords: ["donar", "donacion", "bizum", "paypal", "ayuda economica", "tarjeta", "dinero", "contribuir"] },
  { section: "Foro", href: "/foro", keywords: ["foro", "pregunta", "comunidad", "tema", "hablar", "discutir", "duda"] },
  { section: "Noticias", href: "/noticias", keywords: ["noticias", "novedades", "actualidad", "eventos", "pasa", "nuevo", "blog"] },
  { section: "Rankings", href: "/rankings", keywords: ["ranking", "karma", "puntos", "runner", "juego", "top", "clasificacion"] },
  { section: "Políticas", href: "/politicas", keywords: ["privacidad", "politica", "aviso legal", "cookies", "legal"] },
  { section: "Perfil", href: "/perfil", keywords: ["perfil", "cuenta", "usuario", "login", "mis datos", "ajustes"] },
];

// 4. FUNCIONES DE UTILIDAD (Normalización y extracción)
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

// 5. MANEJADOR DE LA RUTA POST
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatPayload;
    const lastUserMessage = body.message?.trim();

    if (!lastUserMessage) {
      return NextResponse.json({ error: "El mensaje es obligatorio." }, { status: 400 });
    }

    // Buscamos la API KEY en las variables de entorno de Vercel
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("❌ ERROR: No se encuentra la GEMINI_API_KEY en Vercel.");
      return NextResponse.json({ error: "Configuración de API incompleta." }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // MODELO ESTABLE: Usamos la versión exacta para evitar errores de ruta (v1/v1beta)
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-001", 
    });

    // Procesamos el historial para el formato de Google
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

    // Iniciamos la sesión de chat con la instrucción de sistema inyectada
    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: `Actúa bajo estas reglas: ${SYSTEM_PROMPT}` }] },
        { role: "model", parts: [{ text: "¡Miau! Entendido, soy el asistente de GatoCan. 🐾" }] },
        ...history.slice(-10)
      ],
      generationConfig: {
        temperature: 0.75,
        maxOutputTokens: 300,
      },
    });

    const result = await chat.sendMessage(lastUserMessage);
    const response = await result.response;
    const textReply = response.text().trim();

    // Enviamos respuesta + sugerencias de botones
    return NextResponse.json({
      reply: textReply || "¡Miau! Me he quedado sin palabras 😿",
      suggestions: extractSuggestions(lastUserMessage),
    });

  } catch (error: any) {
    console.error("--- 🚨 ERROR CRÍTICO EN API CHAT ---");
    console.error(error);
    
    return NextResponse.json({ 
      error: "Error interno en el cerebro del gato", 
      details: error.message 
    }, { status: 500 });
  }
  }
   
