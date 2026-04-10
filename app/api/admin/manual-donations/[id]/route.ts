import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const action = String((await req.json())?.action ?? "").toUpperCase();
  if (!["APPROVE", "REJECT"].includes(action)) {
    return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  }

  const donation = await prisma.manualDonation.findUnique({
    where: { id: params.id },
    include: { user: { select: { id: true, email: true } } },
  });

  if (!donation) {
    return NextResponse.json({ error: "Donación no encontrada" }, { status: 404 });
  }

  if (donation.status !== "PENDING") {
    return NextResponse.json({ error: "La donación ya fue procesada" }, { status: 409 });
  }

  if (action === "REJECT") {
    const updated = await prisma.manualDonation.update({
      where: { id: donation.id },
      data: { status: "REJECTED" },
    });

    return NextResponse.json({ donation: updated });
  }

  const amount = Number(donation.cantidad);
  const karmaPoints = Math.round(amount * 10);

  const [updated] = await prisma.$transaction([
    prisma.manualDonation.update({
      where: { id: donation.id },
      data: { status: "APPROVED" },
    }),
    prisma.profile.upsert({
      where: { userId: donation.user.id },
      update: {
        totalDonaciones: { increment: amount },
        karmaPoints: { increment: karmaPoints },
      },
      create: {
        userId: donation.user.id,
        email: donation.user.email,
        totalDonaciones: amount,
        karmaPoints,
        aceptaPoliticas: false,
      },
    }),
  ]);

  return NextResponse.json({ donation: updated });
}
