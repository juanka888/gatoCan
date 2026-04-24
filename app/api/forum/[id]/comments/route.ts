import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });
  }

  const postId = Number(params.id);
  if (!Number.isInteger(postId)) {
    return NextResponse.json({ error: "Hilo no válido" }, { status: 400 });
  }

  const { content } = await req.json();
  const cleanContent = String(content ?? "").trim();

  if (!cleanContent) {
    return NextResponse.json({ error: "El comentario no puede estar vacío" }, { status: 400 });
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

  const comment = await prisma.comment.create({
    data: {
      content: cleanContent,
      authorId: user.id,
      postId,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  return NextResponse.json({ comment }, { status: 201 });
}
