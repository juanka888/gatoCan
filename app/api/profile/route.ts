import { getServerSession } from "next-auth/next"; 
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    // --- PROTECCIÓN PARA TYPESCRIPT ---
    // Si no hay sesión o no hay email, cortamos aquí. Esto quita el error en session.user
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Sesión no encontrada o incompleta" }, { status: 401 });
    }

    const sessionEmail = session.user.email.trim().toLowerCase();
    const userName = session.user.name ?? "Usuario";
    const userImage = session.user.image ?? null;

    const user = await prisma.user.upsert({
      where: { email: sessionEmail },
      update: {
        name: userName,
        image: userImage,
      },
      create: {
        email: sessionEmail,
        name: userName,
        image: userImage,
      },
      include: { profile: true },
    });

    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      update: { email: sessionEmail },
      create: {
        userId: user.id,
        email: sessionEmail,
        nombreCompleto: userName,
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

    // --- PROTECCIÓN PARA TYPESCRIPT ---
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Sesión no encontrada" }, { status: 401 });
    }

    const sessionEmail = session.user.email.trim().toLowerCase();
    const body = await req.json();
    const normalizedDniVal = body?.dniNie ? normalizeDni(body.dniNie) : "";

    if (normalizedDniVal && !isValidDni(normalizedDniVal)) {
      return NextResponse.json({ error: "El DNI no es válido" }, { status: 400 });
    }

    const user = await prisma.user.upsert({
      where: { email: sessionEmail },
      update: {},
      create: {
        email: sessionEmail,
        name: session.user.name ?? "Usuario",
        image: session.user.image ?? null,
      },
    });

    const currentProfile = await prisma.profile.findUnique({ where: { userId: user.id } });
    
    const incomingScore = Number(body?.runnerBestScore || 0);
    const incomingDistance = Number(body?.runnerBestDistanceM || 0);

    const finalScore = Math.max(incomingScore, currentProfile?.runnerBestScore || 0);
    const finalDistance = Math.max(incomingDistance, currentProfile?.runnerBestDistanceM || 0);

    const dataToUpdate = {
      nombreCompleto: normalizeOptionalField(body?.nombreCompleto) ?? session.user.name ?? "Usuario",
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
          // Ajustado según tu esquema de base de datos
          runnerBestDistance: finalDistance, 
        },
      }),
    ]);

    return NextResponse.json({ profile: updatedProfile });
  } catch (error) {
    console.error("Error en PUT /api/profile:", error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}