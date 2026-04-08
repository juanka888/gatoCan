import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CommentForm from "../_components/CommentForm";
import type { CSSProperties } from "react";

type ThreadPageProps = {
  params: { id: string };
};

export default async function ThreadPage({ params }: ThreadPageProps) {
  const postId = Number(params.id);
  if (!Number.isInteger(postId)) {
    notFound();
  }

  const post = await prisma.forumPost.findUnique({
    where: { id: postId },
    include: {
      author: { select: { name: true, email: true } },
      comments: {
        include: { author: { select: { name: true, email: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!post) {
    notFound();
  }

  return (
    <main style={layoutStyle}>
      <Link href="/foro" className="btn btn-secondary">← Volver al foro</Link>

      <article style={cardStyle}>
        <p style={badgeStyle}>{post.category}</p>
        <h1 style={{ margin: "0 0 10px" }}>{post.title}</h1>
        <p style={{ whiteSpace: "pre-wrap" }}>{post.content}</p>
        <small>
          Publicado por {post.author.name || post.author.email || "Usuario"} · {new Date(post.createdAt).toLocaleString("es-ES")}
        </small>
      </article>

      <CommentForm postId={post.id} />

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Comentarios ({post.comments.length})</h2>
        {post.comments.length === 0 ? (
          <p>Todavía no hay comentarios en este hilo.</p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {post.comments.map((comment) => (
              <article key={comment.id} style={commentCardStyle}>
                <p style={{ margin: "0 0 8px", whiteSpace: "pre-wrap" }}>{comment.content}</p>
                <small>
                  {comment.author.name || comment.author.email || "Usuario"} · {new Date(comment.createdAt).toLocaleString("es-ES")}
                </small>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

const layoutStyle: CSSProperties = {
  maxWidth: 980,
  margin: "1.5rem auto",
  padding: "0 1rem",
  display: "grid",
  gap: 16,
};

const cardStyle: CSSProperties = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  padding: "1rem",
};

const commentCardStyle: CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: 10,
  padding: "0.75rem",
};

const badgeStyle: CSSProperties = {
  display: "inline-block",
  margin: "0 0 8px",
  background: "#e6f2f5",
  color: "#0f4c5c",
  borderRadius: 999,
  padding: "0.2rem 0.6rem",
  fontSize: 12,
  fontWeight: 700,
};
