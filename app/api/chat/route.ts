import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const SYSTEM_INSTRUCTION =
  "Eres el asistente de GatoCan. Eres un gato sabio y amable. Responde siempre muy corto y usa muchos emojis de gatos 🐾.";

const MODEL_FALLBACK_CHAIN = ["gemini-3.1-flash", "gemini-1.5-flash"];

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY?.trim();

    if (!apiKey) {
      return NextResponse.json({ reply: "¡Miau! No detecto la llave. 🐾" });
    }

    const body = await request.json();
    const message =
      typeof body?.message === "string" && body.message.trim().length > 0
        ? body.message.trim()
        : "Hola";

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelErrors: string[] = [];

    for (const modelName of MODEL_FALLBACK_CHAIN) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: SYSTEM_INSTRUCTION
        });

        const result = await model.generateContent(message);
        const textReply = result.response.text()?.trim() || "¡Miau! 🐾";

        return NextResponse.json({ reply: textReply });
      } catch (modelError) {
        const reason =
          modelError instanceof Error ? modelError.message : String(modelError);
        modelErrors.push(`${modelName}: ${reason}`);
      }
    }

    console.error("Gemini fallback exhausted:", modelErrors.join(" | "));
    return NextResponse.json(
      { reply: "¡Miau! Ahora no pude responder. Intenta en un ratito 🐾" },
      { status: 502 }
    );
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { reply: "Fallo de conexión en el servidor. 🧶" },
      { status: 500 }
    );
  }
}
