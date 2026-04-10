import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const pending = await prisma.manualDonation.findMany({
    where: { status: "PENDING" },
    include: {
      user: {
        select: {
          email: true,
        },
      },
    },
    orderBy: { fecha: "asc" },
  });

  return NextResponse.json({ pending });
}
