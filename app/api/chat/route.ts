import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Forzamos el runtime de Nodejs para que la librería de Google no dé problemas en Vercel
export const runtime = "nodejs";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);
const SYSTEM_INSTRUCTION = `Eres el asistente de GatoCan. Experto en protección animal y leyes de bienestar (Ley 7/2023 de España).
- Responde siempre corto, amable y con emojis 🐾.
- Si te preguntan por salud o leyes, da la base pero sugiere consultar a un veterinario o profesional.
- Recuerda lo que el usuario te ha dicho antes en esta misma sesión.
- Habla con tono de gato sabio, protector y cercano.`;

export async function POST(req: Request) {
  try {
    if (!apiKey) {
      return NextResponse.json({ error: "Falta configurar GEMINI_API_KEY en el servidor." }, { status: 500 });
    }

    const payload = await req.json();
    const userMessage = typeof payload?.message === "string" ? payload.message.trim() : "";
    const incomingMessages = Array.isArray(payload?.messages) ? payload.messages.slice(-12) : [];

    if (!userMessage) {
      return NextResponse.json({ error: "El mensaje del usuario está vacío." }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    const history = incomingMessages
      .map((msg: any) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content || msg.text || "" }],
      }))
      .filter((msg) => msg.parts[0].text.length > 0);

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(userMessage);
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
