import { NextResponse } from "next/server";

type ContactPayload = {
  nombre?: string;
  email?: string;
  mensaje?: string;
  privacidad?: boolean;
};

export async function POST(request: Request) {
  const body = (await request.json()) as ContactPayload;
  const nombre = body.nombre?.trim();
  const email = body.email?.trim();
  const mensaje = body.mensaje?.trim();

  if (!nombre || !email || !mensaje) {
    return NextResponse.json({ error: "Faltan campos obligatorios." }, { status: 400 });
  }

  if (!body.privacidad) {
    return NextResponse.json({ error: "Debes aceptar la política de privacidad." }, { status: 400 });
  }

  console.info("[contacto] Nuevo mensaje para gatocannaturarural@gmail.com", {
    to: "gatocannaturarural@gmail.com",
    nombre,
    email,
    mensaje,
    receivedAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true, sentTo: "gatocannaturarural@gmail.com" });
}
