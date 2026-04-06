import { NextResponse } from "next/server";
import { Resend } from "resend";

// Inicializamos Resend con tu clave secreta del .env
const resend = new Resend(process.env.RESEND_API_KEY);

type ContactPayload = {
  nombre?: string;
  email?: string;
  mensaje?: string;
  privacidad?: boolean;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ContactPayload;
    const { nombre, email, mensaje, privacidad } = body;

    // 1. Validaciones
    if (!nombre?.trim() || !email?.trim() || !mensaje?.trim()) {
      return NextResponse.json({ error: "Faltan campos obligatorios." }, { status: 400 });
    }

    if (!privacidad) {
      return NextResponse.json({ error: "Debes aceptar la política de privacidad." }, { status: 400 });
    }

    // 2. ENVÍO REAL DEL EMAIL
    const { data, error } = await resend.emails.send({
      from: "Gatocan Web <onboarding@resend.dev>", // Al principio usa este de prueba
      to: ["gatocannaturarural@gmail.com"],
      subject: `🐾 Nuevo mensaje de contacto: ${nombre}`,
      replyTo: email, // Para que al dar a "Responder" le escribas al usuario
      html: `
        <h2>Nuevo mensaje desde la web de Gatocan</h2>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Mensaje:</strong></p>
        <p style="background: #f4f4f4; padding: 15px; border-radius: 8px;">${mensaje}</p>
        <hr />
        <p><small>Enviado el: ${new Date().toLocaleString()}</small></p>
      `,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: data?.id });

  } catch (err: any) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}