import { getServerSession } from "next-auth"; // Usa este import
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
  if (typeof value !== "string") return value == null ? null : String(value);
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Prisma.PrismaClientKnownRequestError) return `Prisma error ${error.code}`;
  if (error instanceof Error) return error.message;
  return "Error desconocido al guardar el perfil";
}

export async function GET() {
  try {
    // 1. Obtenemos la sesión
    const session = await getServerSession(authOptions);

    // 2. VALIDACIÓN CRÍTICA: Si no hay email, cortamos aquí.
    // Esto hace que TypeScript sepa que de aquí en adelante 'session.user' NO es nulo.
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Sesión no encontrada" }, { status: 401 });
    }

    const email = session.user.email.trim().toLowerCase();

    // 3. UPSERT: Ahora usamos los datos con seguridad
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name: session.user.name ?? undefined,
        image: session.user.image ?? undefined,
      },
      create: {
        email,
        name: session.user.name ?? "",
        image: session.user.image ?? "",
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
    console.error("Error en profile GET:", error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
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
    const email = sessionEmail;
    const mappedScore = Number(body?.score ?? 0);
    const mappedDistance = Number(body?.distance ?? 0);

    const normalizedDniValue = body?.dniNie ? normalizeDni(body.dniNie) : "";
    const telefono = normalizeOptionalField(body?.telefono);
    const direccion = normalizeOptionalField(body?.direccion);
    const codigoPostal = normalizeOptionalField(body?.codigoPostal);
    const poblacion = normalizeOptionalField(body?.poblacion);
    const nombreCompleto = normalizeOptionalField(body?.nombreCompleto) ?? session?.user?.name ?? null;

    if (normalizedDniValue && !isValidDni(normalizedDniValue)) {
      return NextResponse.json({ error: "El DNI no es válido" }, { status: 400 });
    }

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name: session?.user?.name ?? undefined,
        image: session?.user?.image ?? undefined,
      },
      create: {
        email,
        name: session?.user?.name ?? "",
        image: session?.user?.image ?? "",
      },
    });

    const currentProfile = await prisma.profile.findUnique({ where: { userId: user.id } });

    const finalScore = Math.max(Number.isFinite(mappedScore) ? mappedScore : 0, currentProfile?.runnerBestScore || 0);
    const finalDistance = Math.max(Number.isFinite(mappedDistance) ? mappedDistance : 0, currentProfile?.runnerBestDistanceM || 0);

    const dataToUpdate = {
      runnerBestScore: finalScore,
      runnerBestDistanceM: finalDistance,
      email,
      nombreCompleto,
      telefono,
      dniNie: normalizedDniValue || null,
      direccion,
      codigoPostal,
      poblacion,
      aceptaPoliticas: body.aceptaPoliticas === true,
    };

    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      update: dataToUpdate,
      create: {
        userId: user.id,
        ...dataToUpdate,
      },
    });

    // Actualizar también el modelo User si guardas ahí los récords
    await prisma.user.update({
      where: { id: user.id },
      data: {
        runnerBestScore: finalScore,
        runnerBestDistance: finalDistance,
      },
    });

    return NextResponse.json({ profile, records: { bestScore: finalScore, bestDistanceM: finalDistance } });
  } catch (error) {
    console.error("Error en profile PUT:", error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}