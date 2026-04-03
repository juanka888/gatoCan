import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma"; // Asegúrate de que la ruta sea correcta (@/lib/prisma)

export const dynamic = 'force-dynamic';

const dniLetters = "TRWAGMYFPDXBNJZSQVHLCKE";

function normalizeDni(value: string): string {
  return value.replace(/\s|-/g, "").toUpperCase();
}

function isValidDni(value: string): boolean {
  if (!/^\d{8}[A-Z]$/.test(value)) return false;
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
  if (error instanceof Prisma.PrismaClientKnownRequestError) return `Error de datos (${error.code})`;
  if (error instanceof Error) return error.message;
  return "Error desconocido al guardar el perfil";
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const sessionEmail = session?.user?.email?.trim().toLowerCase();

    if (!sessionEmail || !session?.user) {
      return NextResponse.json({ error: "Sesión no encontrada" }, { status: 401 });
    }

    // Upsert del usuario para asegurar que existe
    const user = await prisma.user.upsert({
      where: { email: sessionEmail },
      update: {
        name: session.user.name ?? undefined,
        image: session.user.image ?? undefined,
      },
      create: {
        email: sessionEmail,
        name: session.user.name,
        image: session.user.image,
      },
      include: { profile: true },
    });

    // Upsert del perfil
    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      update: { email: sessionEmail },
      create: {
        userId: user.id,
        email: sessionEmail,
        nombreCompleto: session.user.name ?? null,
        aceptaPoliticas: false,
      },
    });

    return NextResponse.json({ user, profile });
  } catch (error) {
    console.error("Error en GET /api/profile:", error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const sessionEmail = session?.user?.email?.trim().toLowerCase();

    if (!sessionEmail || !session?.user) {
      return NextResponse.json({ error: "Sesión no encontrada" }, { status: 401 });
    }

    const body = await req.json();
    const normalizedDniVal = body?.dniNie ? normalizeDni(body.dniNie) : "";

    if (normalizedDniVal && !isValidDni(normalizedDniVal)) {
      return NextResponse.json({ error: "El DNI no es válido" }, { status: 400 });
    }

    // 1. Obtener o crear usuario
    const user = await prisma.user.upsert({
      where: { email: sessionEmail },
      update: {},
      create: {
        email: sessionEmail,
        name: session.user.name,
        image: session.user.image,
      },
    });

    // 2. Lógica de récords (comparar con lo existente)
    const currentProfile = await prisma.profile.findUnique({ where: { userId: user.id } });
    
    const incomingScore = Number(body?.runnerBestScore || 0);
    const incomingDistance = Number(body?.runnerBestDistanceM || 0);

    const finalScore = Math.max(incomingScore, currentProfile?.runnerBestScore || 0);
    const finalDistance = Math.max(incomingDistance, currentProfile?.runnerBestDistanceM || 0);

    // 3. Preparar datos
    const dataToUpdate = {
      nombreCompleto: normalizeOptionalField(body?.nombreCompleto) ?? session.user.name ?? null,
      telefono: normalizeOptionalField(body?.telefono),
      dniNie: normalizedDniVal || null,
      direccion: normalizeOptionalField(body?.direccion),
      codigoPostal: normalizeOptionalField(body?.codigoPostal),
      poblacion: normalizeOptionalField(body?.poblacion),
      aceptaPoliticas: body.aceptaPoliticas === true,
      runnerBestScore: finalScore,
      runnerBestDistanceM: finalDistance,
      email: sessionEmail,
    };

    // 4. Actualizar Perfil y Usuario
    const [updatedProfile] = await prisma.$transaction([
      prisma.profile.upsert({
        where: { userId: user.id },
        update: dataToUpdate,
        create: { userId: user.id, ...dataToUpdate },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: {
          runnerBestScore: finalScore,
          runnerBestDistance: finalDistance, // Verifica que el campo en User se llame así
        },
      }),
    ]);

    return NextResponse.json({ profile: updatedProfile });
  } catch (error) {
    console.error("Error en PUT /api/profile:", error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}