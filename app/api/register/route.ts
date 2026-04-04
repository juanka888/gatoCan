import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Faltan datos obligatorios" }, { status: 400 });
    }

    // 1. Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json({ message: "El correo electrónico ya está registrado" }, { status: 400 });
    }

    // 2. Cifrar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Crear el usuario y su perfil inicial
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        hashedPassword, // Asegúrate de que tu modelo Prisma tenga este campo
        profile: {
          create: {
            nombreCompleto: name,
            email: email.toLowerCase(),
            aceptaPoliticas: false,
          },
        },
      },
    });

    return NextResponse.json({ message: "Usuario creado con éxito", userId: user.id }, { status: 201 });

  } catch (error) {
    console.error("Error en el registro:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}