import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Forzamos el runtime de Nodejs para que la librería de Google no dé problemas en Vercel
export const runtime = "nodejs";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);
const SYSTEM_INSTRUCTION = `Eres el asistente experto de GatoCan. Tienes conocimientos sobre la Ley de Bienestar Animal 7/2023 de España, protocolos de adopción, colonias felinas y salud animal básica.
REGLAS:
- Responde siempre como un gato sabio y protector 🐾.
- Sé muy breve y conciso (ideal para móviles).
- Si el usuario pregunta por salud o leyes, da la base informativa pero aclara que debe consultar a un veterinario o profesional legal.
- Recomienda visitar /donaciones, /foro o /noticias si el contexto lo permite.`;

type IncomingMessage = {
  role: "assistant" | "user";
  content: string;
};

export async function POST(req: Request) {
  try {
    if (!apiKey) {
      return NextResponse.json({ error: "Falta configurar GEMINI_API_KEY en el servidor." }, { status: 500 });
    }

    const payload = await req.json();
    const message = typeof payload?.message === "string" ? payload.message.trim() : "";
    const incomingMessages: IncomingMessage[] = Array.isArray(payload?.messages) ? payload.messages.slice(-8) : [];

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    const mappedHistory = incomingMessages
      .filter((msg) => msg && (msg.role === "assistant" || msg.role === "user") && typeof msg.content === "string")
      .map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content.trim() }],
      }))
      .filter((msg) => msg.parts[0].text.length > 0);

    const lastFromClient = mappedHistory[mappedHistory.length - 1];
    const history = lastFromClient?.role === "user" ? mappedHistory.slice(0, -1) : mappedHistory;
    const prompt =
      message || (lastFromClient?.role === "user" ? lastFromClient.parts[0].text : "") || "Hola";

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ reply: text });
  } catch (error) {
    console.error("Error GatoCan Detallado:", error);
    return NextResponse.json(
      { error: "¡Miau! Mis circuitos se han enredado con un ovillo. Inténtalo de nuevo. 🧶🐾" },
      { status: 500 },
    );
  }
}
