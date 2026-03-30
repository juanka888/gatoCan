import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashed,
      },
    });

    await prisma.profile.upsert({
      where: { userId: user.id },
      update: { email: normalizedEmail },
      create: {
        userId: user.id,
        email: normalizedEmail,
      },
    });

    return NextResponse.json({ message: "Usuario creado", userId: user.id }, { status: 201 });
  } catch (error) {
    console.error("Error en registro:", error);
    return NextResponse.json({ error: "Error al crear usuario" }, { status: 500 });
  }
}
