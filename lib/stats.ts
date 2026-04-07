import { prisma } from "@/lib/prisma";

export async function getDonationStats() {
  // Suma de donaciones de usuarios registrados
  const userDonations = await prisma.donation.aggregate({
    where: { userId: { not: null } },
    _sum: { amount: true },
  });

  // Suma de donaciones anónimas
  const anonymousDonations = await prisma.donation.aggregate({
    where: { userId: null },
    _sum: { amount: true },
  });

  const registeredTotal = Number(userDonations._sum.amount) || 0;
  const anonymousTotal = Number(anonymousDonations._sum.amount) || 0;

  return {
    registeredTotal,
    anonymousTotal,
    overallTotal: registeredTotal + anonymousTotal,
  };
}