import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FORUM_CATEGORIES, isForumCategory } from "@/lib/forum";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");

  const posts = await prisma.forumPost.findMany({
    where: category && isForumCategory(category) ? { category } : undefined,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      _count: {
        select: {
          comments: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ posts, categories: FORUM_CATEGORIES });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });
  }

  const { title, content, category } = await req.json();
  const cleanTitle = String(title ?? "").trim();
  const cleanContent = String(content ?? "").trim();
  const cleanCategory = String(category ?? "").trim();

  if (!cleanTitle || !cleanContent || !isForumCategory(cleanCategory)) {
    return NextResponse.json(
      { error: "Título, contenido y categoría válidos son obligatorios" },
      { status: 400 }
    );
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

  const post = await prisma.forumPost.create({
    data: {
      title: cleanTitle,
      content: cleanContent,
      category: cleanCategory,
      authorId: user.id,
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

  return NextResponse.json({ post }, { status: 201 });
}
