import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { FORUM_CATEGORIES, isForumCategory } from "@/lib/forum";
import CreateThreadForm from "./_components/CreateThreadForm";
import type { CSSProperties } from "react";

type ForoPageProps = {
  searchParams?: {
    category?: string;
    view?: "feed" | "table";
  };
};

export default async function ForoPage({ searchParams }: ForoPageProps) {
  const categoryFilter = searchParams?.category;
  const view = searchParams?.view === "table" ? "table" : "feed";

  const posts = await prisma.forumPost.findMany({
    where: categoryFilter && isForumCategory(categoryFilter) ? { category: categoryFilter } : undefined,
    include: {
      author: { select: { name: true, email: true, image: true } },
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

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Categorías</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link className="btn btn-secondary" href={`/foro?view=${view}`}>
            Todas
          </Link>
          {FORUM_CATEGORIES.map((category) => (
            <Link key={category} className="btn btn-secondary" href={`/foro?category=${encodeURIComponent(category)}&view=${view}`}>
              {category}
            </Link>
          ))}
        </div>
      </section>

      <section style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <h2 style={{ margin: 0 }}>Hilos</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <Link className="btn btn-secondary" href={`/foro?${categoryFilter ? `category=${encodeURIComponent(categoryFilter)}&` : ""}view=feed`}>
              Vista Feed
            </Link>
            <Link className="btn btn-secondary" href={`/foro?${categoryFilter ? `category=${encodeURIComponent(categoryFilter)}&` : ""}view=table`}>
              Vista Tabla
            </Link>
          </div>
        </div>

        {posts.length === 0 ? (
          <p>No hay hilos para esta categoría todavía.</p>
        ) : view === "table" ? (
          <div style={{ overflowX: "auto", marginTop: 12 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={thtd}>Título</th>
                  <th style={thtd}>Categoría</th>
                  <th style={thtd}>Autor</th>
                  <th style={thtd}>Comentarios</th>
                  <th style={thtd}>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id}>
                    <td style={thtd}>
                      <Link href={`/foro/${post.id}`}>{post.title}</Link>
                    </td>
                    <td style={thtd}>{post.category}</td>
                    <td style={thtd}>{post.author.name || post.author.email || "Usuario"}</td>
                    <td style={thtd}>{post._count.comments}</td>
                    <td style={thtd}>{new Date(post.createdAt).toLocaleString("es-ES")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
            {posts.map((post) => (
              <article key={post.id} style={feedCardStyle}>
                <p style={badgeStyle}>{post.category}</p>
                <h3 style={{ margin: "0 0 8px" }}>
                  <Link href={`/foro/${post.id}`}>{post.title}</Link>
                </h3>
                <p style={{ margin: "0 0 10px" }}>{post.content.slice(0, 180)}{post.content.length > 180 ? "..." : ""}</p>
                <small>
                  {post.author.name || post.author.email || "Usuario"} · {post._count.comments} comentarios · {new Date(post.createdAt).toLocaleString("es-ES")}
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

const heroCard: CSSProperties = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  padding: "1rem",
};

const cardStyle: CSSProperties = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  padding: "1rem",
};

const feedCardStyle: CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: 10,
  padding: "0.9rem",
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

const thtd: CSSProperties = {
  border: "1px solid #e2e8f0",
  padding: "0.55rem",
  textAlign: "left",
};
