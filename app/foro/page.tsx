import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import CreateThreadForm from "./_components/CreateThreadForm";
import ForumThreadList from "./_components/ForumThreadList";
import type { CSSProperties } from "react";

export default async function ForoPage() {
  const session = await getServerSession(authOptions);
  const admin = isAdmin(session?.user?.email);

  const posts = await prisma.forumPost.findMany({
    include: {
      author: { select: { name: true, email: true } },
      _count: { select: { comments: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <main style={layoutStyle}>
      <section style={heroCard}>
        <h1 style={{ marginTop: 0 }}>Foro GatoCan</h1>
        <p style={{ marginBottom: 0 }}>Espacio para consultas, coordinación y apoyo entre socios.</p>
      </section>

      <CreateThreadForm />

      <ForumThreadList posts={posts} isAdmin={admin} />
    </main>
  );
}

const layoutStyle: CSSProperties = {
  maxWidth: 980,
  margin: "1.5rem auto",
  padding: "1rem",
  display: "grid",
  gap: 16,
  borderRadius: 16,
  background: "rgba(0, 0, 0, 0.2)",
};

const heroCard: CSSProperties = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  padding: "1rem",
};
