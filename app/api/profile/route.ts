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

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
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
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const email = session.user.email.toLowerCase();
  const normalizedDni = body?.dniNie ? normalizeDni(body.dniNie) : "";

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
      nombreCompleto: body.nombreCompleto ?? null,
      telefono: body.telefono ?? null,
      dniNie: normalizedDni || null,
      direccion: body.direccion ?? null,
      codigoPostal: body.codigoPostal ?? null,
      poblacion: body.poblacion ?? null,
      runnerBestScore: body.runnerBestScore ?? undefined,
      runnerBestDistanceM: body.runnerBestDistanceM ?? undefined,
      aceptaPoliticas: body.aceptaPoliticas === true,
    },
    create: {
      userId: user.id,
      email,
      nombreCompleto: body.nombreCompleto ?? session.user.name ?? null,
      telefono: body.telefono ?? null,
      dniNie: normalizedDni || null,
      direccion: body.direccion ?? null,
      codigoPostal: body.codigoPostal ?? null,
      poblacion: body.poblacion ?? null,
      runnerBestScore: body.runnerBestScore ?? 0,
      runnerBestDistanceM: body.runnerBestDistanceM ?? 0,
      aceptaPoliticas: body.aceptaPoliticas === true,
    },
  });

  return NextResponse.json({ profile });
}
