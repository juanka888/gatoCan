import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@lib/prisma";
export const dynamic = 'force-dynamic'; // Esto soluciona el error de "Uso dinámico del servidor"
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
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return `Prisma error ${error.code}: ${error.message}`;
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return `Prisma initialization error: ${error.message}`;
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return `Prisma validation error: ${error.message}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Error desconocido al guardar el perfil";
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const sessionEmail = session?.user?.email?.trim().toLowerCase();
    if (!sessionEmail) {
      return NextResponse.json({ error: "Sesión no encontrada" }, { status: 401 });
    }

    const email = sessionEmail;

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
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("Prisma known request error en profile GET:", {
        code: error.code,
        message: error.message,
        meta: error.meta,
      });
    } else {
      console.error("Error en base de datos (profile GET):", error);
    }

    const message = getErrorMessage(error);
    return NextResponse.json({ error: message, message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const sessionEmail = session?.user?.email?.trim().toLowerCase();
    if (!sessionEmail) {
      return NextResponse.json({ error: "Sesión no encontrada" }, { status: 401 });
    }

    const body = await req.json();
    console.log("Datos recibidos en API:", body);

    const email = sessionEmail;
    const mappedScore = Number(body?.score ?? 0);
    const mappedDistance = Number(body?.distance ?? 0);

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
      },
      create: {
        email,
        name: session.user.name,
        image: session.user.image,
      },
    });

    const currentProfile = await prisma.profile.findUnique({ where: { userId: user.id } });

    const finalScore = Math.max(
      Number.isFinite(mappedScore) ? mappedScore : 0,
      currentProfile?.runnerBestScore || 0
    );
    const finalDistance = Math.max(
      Number.isFinite(mappedDistance) ? mappedDistance : 0,
      currentProfile?.runnerBestDistanceM || 0
    );
    console.log("Guardando récord: Score " + finalScore + ", Distancia " + finalDistance);

    const dataToUpdate = {
      runnerBestScore: finalScore,
      runnerBestDistanceM: finalDistance,
      email,
      nombreCompleto,
      telefono,
      dniNie: normalizedDni || null,
      direccion,
      codigoPostal,
      poblacion,
      aceptaPoliticas: body.aceptaPoliticas === true,
    };

    let profile;
    try {
      profile = await prisma.profile.upsert({
        where: { userId: user.id },
        update: dataToUpdate,
        create: {
          userId: user.id,
          ...dataToUpdate,
        },
      });
    } catch (error) {
      console.error("Error detallado de Prisma:", error);
      throw error;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        runnerBestScore: dataToUpdate.runnerBestScore,
        runnerBestDistance: dataToUpdate.runnerBestDistanceM,
      },
    });

    return NextResponse.json({
      profile,
      records: {
        bestScore: dataToUpdate.runnerBestScore,
        bestDistanceM: dataToUpdate.runnerBestDistanceM,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("Prisma known request error en profile PUT:", {
        code: error.code,
        message: error.message,
        meta: error.meta,
      });
    } else {
      console.error("Error en base de datos (profile PUT):", error);
    }

    const message = getErrorMessage(error);
    return NextResponse.json({ error: message, message }, { status: 500 });
  }
}
