import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, aceptaPoliticas } = body;

    // 1. Validación de campos
    if (!email || !password || !name) {
      return NextResponse.json({ message: "Todos los campos son obligatorios" }, { status: 400 });
    }

    const emailNormalizado = email.toLowerCase().trim();

    // 2. Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: emailNormalizado },
    });

    if (existingUser) {
      return NextResponse.json({ message: "Este email ya está registrado" }, { status: 400 });
    }

    // 3. Encriptar contraseña (usando bcryptjs para total compatibilidad)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Crear Usuario y Perfil (siguiendo tu esquema real de Supabase)
    const user = await prisma.user.create({
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
            runnerBestDistanceM: 0, // Nombre exacto de tu tabla
          },
        },
      },
    });

    return NextResponse.json({ message: "Usuario creado con éxito" }, { status: 201 });

  } catch (error: any) {
    console.error("ERROR_REGISTRO_GATOCAN:", error);
    return NextResponse.json({ 
      message: "Error al guardar en la base de datos", 
      detail: error.message 
    }, { status: 400 });
  }
}
