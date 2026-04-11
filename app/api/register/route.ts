import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, aceptaPoliticas } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ message: "Faltan datos obligatorios" }, { status: 400 });
    }

    const emailNormalizado = email.toLowerCase().trim();

    // 1. Verificar si existe
    const existingUser = await prisma.user.findUnique({
      where: { email: emailNormalizado },
    });

    if (existingUser) {
      return NextResponse.json({ message: "El email ya existe" }, { status: 400 });
    }

    // 2. Cifrar
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Crear usando los nombres EXACTOS de tu tabla 'Profile'
    // Nota: nombreCompleto, aceptaPoliticas, etc.
    const newUser = await prisma.user.create({
      data: {
        name,
        email: emailNormalizado,
        password: hashedPassword,
        profile: {
          create: {
            email: emailNormalizado,
            nombreCompleto: name,
            aceptaPoliticas: aceptaPoliticas === true,
            karmaPoints: 0,
            totalDonaciones: 0,
            runnerBestScore: 0,
            runnerBestDistanceM: 0,
          },
        },
      },
    });

    return NextResponse.json({ message: "Ok" }, { status: 201 });

  } catch (error: any) {
    console.error("ERROR_PRISMA_REGISTRO:", error);
    // Si hay un error de base de datos, lo enviamos para debuggear
    return NextResponse.json({ 
      message: "Error en la base de datos", 
      detail: error.message 
    }, { status: 400 });
  }
                             }
