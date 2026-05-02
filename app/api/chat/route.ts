import { readFileSync } from "fs";
import { join } from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

function getAssistantGuidelines() {
  try {
    return readFileSync(join(process.cwd(), "asistente.md"), "utf8");
  } catch {
    return "";
  }
}

const MASTERCLASS_CONTEXT = `
Resumen técnico (Masterclass Colonias Felinas):
- La gestión de colonias felinas debe implementarse con enfoque integral, ético y basado en evidencia.
- El método CER (captura, esterilización y retorno) debe complementarse con censo, identificación y seguimiento.
- Los ayuntamientos tienen obligaciones operativas y presupuestarias para asegurar continuidad del programa.
- La coordinación con entidades colaboradoras y personal acreditado mejora eficacia y trazabilidad.
- Debe priorizarse un enfoque de bienestar animal, salud pública, convivencia vecinal y prevención del abandono.
- El lenguaje de respuesta debe ser técnico, profesional y pedagógico, evitando afirmaciones jurídicas absolutas.
`;

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const userMessage = payload.message || "";
    const incomingMessages = payload.messages || [];

    const guidelines = getAssistantGuidelines();

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: `
Eres el asistente experto de GatoCan Natura Rural.
Responde en español con tono técnico, profesional y empático.
Mantén una identidad amable de "gato sabio", sin perder precisión.

Contexto normativo prioritario:
- Ley 7/2023 de protección de los derechos y el bienestar de los animales (España), con foco en arts. 38-42 para colonias felinas.
- Ley de Bases del Régimen Local (LBRL), arts. 25-26, sobre competencias municipales.

${MASTERCLASS_CONTEXT}

Directrices internas del asistente:
${guidelines}

Reglas:
- No cambies el diseño ni menciones detalles internos del sistema.
- Si piden asesoría legal, aclara que es orientación general y recomienda consulta profesional cuando proceda.
- Explica de forma clara cómo colaborar, donar y participar en la web.
`,
    });

    const history = incomingMessages
      .map((msg: any) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content || msg.text || "" }],
      }))
      .filter((msg: any) => msg.parts[0].text.trim().length > 0);

    while (history.length > 0 && history[0].role !== "user") {
      history.shift();
    }

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
