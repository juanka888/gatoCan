import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Forzamos el runtime de Nodejs para que la librería de Google no dé problemas en Vercel
export const runtime = "nodejs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    // Según tu lista técnica, estos son los modelos que TIENES activos:
    // Probamos con el 2.5 Flash que es el más rápido y estable según tu JSON
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: "Eres el asistente de GatoCan. Eres un gato sabio. Responde corto y usa emojis 🐾.",
    });

    const result = await model.generateContent(message || "Hola");
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ reply: text });

  } catch (error: any) {
    console.error("Error GatoCan Detallado:", error);

    // Si por lo que sea falla el 2.5, intentamos el 1.5 que es el que tenías antes
    try {
        const backupModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const backupResult = await backupModel.generateContent(message);
        return NextResponse.json({ reply: backupResult.response.text() });
    } catch (backupError) {
        return NextResponse.json(
            { reply: "¡Miau! Mis circuitos se han enredado con un ovillo. Inténtalo de nuevo. 🧶🐾" },
            { status: 500 }
        );
    }
  }
}
