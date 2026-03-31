import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const env = {
    NEXTAUTH_URL: Boolean(process.env.NEXTAUTH_URL),
    NEXTAUTH_SECRET: Boolean(process.env.NEXTAUTH_SECRET),
    GOOGLE_CLIENT_ID: Boolean(process.env.GOOGLE_CLIENT_ID),
    GOOGLE_CLIENT_SECRET: Boolean(process.env.GOOGLE_CLIENT_SECRET),
    DATABASE_URL: Boolean(process.env.DATABASE_URL),
  };

  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      ok: true,
      env,
      database: "reachable",
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        env,
        database: "unreachable",
        checkedAt: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown database error",
      },
      { status: 500 },
    );
  }
}
