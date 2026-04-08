import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const donations = await prisma.donation.findMany();

    // Convertimos cada cantidad a número antes de sumar
    const total = donations.reduce((acc, d) => acc + Number(d.amount), 0);
    
    const usuarios = donations
      .filter(d => d.userId && d.userId !== "anonymous")
      .reduce((acc, d) => acc + Number(d.amount), 0);
      
    const anonimo = donations
      .filter(d => !d.userId || d.userId === "anonymous")
      .reduce((acc, d) => acc + Number(d.amount), 0);

    return NextResponse.json({ total, usuarios, anonimo });
  } catch (error) {
    console.error("Error en API de stats:", error);
    return NextResponse.json({ total: 0, usuarios: 0, anonimo: 0 }, { status: 500 });
  }
}