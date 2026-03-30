import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const rows = await prisma.profile.findMany({
    select: {
      userId: true,
      nombreCompleto: true,
      email: true,
      runnerBestScore: true,
    },
    orderBy: { runnerBestScore: "desc" },
    take: 10,
  });

  return NextResponse.json({ rows });
}
