import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });
  }

  const body = await req.json();
  const concepto = String(body?.concepto ?? "").trim();
  const cantidad = Number(body?.cantidad ?? 0);

  if (!concepto || !Number.isFinite(cantidad) || cantidad <= 0) {
    return NextResponse.json({ error: "Concepto e importe válidos son obligatorios" }, { status: 400 });
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
  });

  const donation = await prisma.manualDonation.create({
    data: {
      userId: user.id,
      concepto,
      cantidad,
      status: "PENDING",
    },
  });

  return NextResponse.json({ donation }, { status: 201 });
}
