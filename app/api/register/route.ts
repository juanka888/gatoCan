import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Faltan datos" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json({ message: "El email ya existe" }, { status: 400 });
    }

    // Ciframos la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Creamos el usuario usando tu campo 'password'
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword, // <--- Ajustado a tu schema de la imagen ae0524
        profile: {
          create: {
            nombreCompleto: name,
            email: email.toLowerCase(),
            aceptaPoliticas: false,
          },
        },
      },
    });

    return NextResponse.json({ message: "Ok" }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error en el servidor" }, { status: 500 });
  }
}