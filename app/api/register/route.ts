import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const hashed = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      password: hashed,
    },
  });

  return new Response("OK");
}
