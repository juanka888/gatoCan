import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const userMessage = payload.message || "";
    const incomingMessages = payload.messages || [];

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction:
        "Eres el asistente experto de GatoCan. Tienes conocimientos sobre la Ley de Bienestar Animal 7/2023 de España. Responde siempre como un gato sabio, protector y muy breve 🐾.",
    });

    // 1. Mapeamos la historia
    let history = incomingMessages.map((msg: any) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content || msg.text || "" }],
    }));

    // 2. REGLA CRÍTICA: El historial de Gemini DEBE empezar por 'user'.
    // Si el primer mensaje es 'model' (el saludo), lo eliminamos.
    while (history.length > 0 && history[0].role !== "user") {
      history.shift();
    }

    // 3. Eliminamos el último mensaje si es 'user' para no duplicarlo con sendMessage
    if (history.length > 0 && history[history.length - 1].role === "user") {
      history.pop();
    }

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(userMessage);
    const response = await result.response;

    return NextResponse.json({ reply: response.text() });
  } catch (error) {
    console.error("Error GatoCan:", error);
    return NextResponse.json({ error: "Error en la conexión miau 🐾" }, { status: 500 });
  }
}
