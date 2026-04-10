import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const postId = Number(params.id);
  if (!Number.isInteger(postId)) {
    return NextResponse.json({ error: "Hilo no válido" }, { status: 400 });
  }

  await prisma.forumPost.delete({ where: { id: postId } });
  return NextResponse.json({ ok: true });
}
