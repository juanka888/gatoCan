import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const { name, email, password, aceptaPoliticas } = await req.json();

    // 1. Validaciones básicas de servidor
    if (!email || !password || !name) {
      return NextResponse.json({ message: "Faltan datos obligatorios" }, { status: 400 });
    }

    if (!aceptaPoliticas) {
      return NextResponse.json({ message: "Debes aceptar los términos y condiciones" }, { status: 400 });
    }

    const emailNormalizado = email.toLowerCase().trim();

    // 2. Verificar si ya existe el usuario
    const existingUser = await prisma.user.findUnique({
      where: { email: emailNormalizado },
    });

    if (existingUser) {
      return NextResponse.json({ message: "Este email ya está registrado" }, { status: 400 });
    }

    // 3. Cifrar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Crear usuario y perfil enlazado
    const user = await prisma.user.create({
      data: {
        name,
        email: emailNormalizado,
        password: hashedPassword,
        profile: {
          create: {
            nombreCompleto: name,
            email: emailNormalizado,
            aceptaPoliticas: true, // Guardamos el consentimiento real
          },
        },
      },
    });

    return NextResponse.json({ message: "Registro completado con éxito" }, { status: 201 });
  } catch (error: any) {
    console.error("ERROR_EN_REGISTRO:", error);
    
    // Error específico de Prisma por duplicados o constraints
    if (error.code === 'P2002') {
      return NextResponse.json({ message: "El usuario ya existe" }, { status: 400 });
    }
    
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}
