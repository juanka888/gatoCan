import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const dniLetters = "TRWAGMYFPDXBNJZSQVHLCKE";

function normalizeDni(value: string): string {
  return value.replace(/\s|-/g, "").toUpperCase();
}

function isValidDni(value: string): boolean {
  if (!/^\d{8}[A-Z]$/.test(value)) {
    return false;
  }

  const dniNumber = Number(value.slice(0, 8));
  const expectedLetter = dniLetters[dniNumber % 23];
  return value[8] === expectedLetter;
}

function normalizeOptionalField(value: unknown): string | null {
  if (typeof value !== "string") {
    return value == null ? null : String(value);
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Error desconocido al guardar el perfil";
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Sesión no encontrada" }, { status: 401 });
    }

    const email = session.user.email.toLowerCase();

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name: session.user.name ?? undefined,
        image: session.user.image ?? undefined,
      },
      create: {
        email,
        name: session.user.name,
        image: session.user.image,
      },
      include: { profile: true },
    });

    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      update: { email },
      create: {
        userId: user.id,
        email,
        nombreCompleto: session.user.name ?? null,
        aceptaPoliticas: false,
      },
    });

    return NextResponse.json({ user, profile });
  } catch (error) {
    console.error("Error en base de datos:", error);
    const message = getErrorMessage(error);
    return NextResponse.json({ error: message, message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Sesión no encontrada" }, { status: 401 });
    }

    const body = await req.json();
    const email = session.user.email.toLowerCase();
    const normalizedDni = body?.dniNie ? normalizeDni(body.dniNie) : "";
    const telefono = normalizeOptionalField(body?.telefono);
    const direccion = normalizeOptionalField(body?.direccion);
    const codigoPostal = normalizeOptionalField(body?.codigoPostal);
    const poblacion = normalizeOptionalField(body?.poblacion);
    const nombreCompleto = normalizeOptionalField(body?.nombreCompleto) ?? session.user.name ?? null;

    if (normalizedDni && !isValidDni(normalizedDni)) {
      return NextResponse.json({ error: "El DNI no es válido" }, { status: 400 });
    }

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name: session.user.name ?? undefined,
        image: session.user.image ?? undefined,
        runnerBestScore: body.runnerBestScore ?? undefined,
        runnerBestDistance: body.runnerBestDistanceM ?? undefined,
      },
      create: {
        email,
        name: session.user.name,
        image: session.user.image,
        runnerBestScore: body.runnerBestScore ?? 0,
        runnerBestDistance: body.runnerBestDistanceM ?? 0,
      },
    });

    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        email,
        nombreCompleto,
        telefono,
        dniNie: normalizedDni || null,
        direccion,
        codigoPostal,
        poblacion,
        runnerBestScore: body.runnerBestScore ?? undefined,
        runnerBestDistanceM: body.runnerBestDistanceM ?? undefined,
        aceptaPoliticas: body.aceptaPoliticas === true,
      },
      create: {
        userId: user.id,
        email,
        nombreCompleto,
        telefono,
        dniNie: normalizedDni || null,
        direccion,
        codigoPostal,
        poblacion,
        runnerBestScore: body.runnerBestScore ?? 0,
        runnerBestDistanceM: body.runnerBestDistanceM ?? 0,
        aceptaPoliticas: body.aceptaPoliticas === true,
      },
    });

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Error en base de datos:", error);
    const message = getErrorMessage(error);
    return NextResponse.json({ error: message, message }, { status: 500 });
  }
}
