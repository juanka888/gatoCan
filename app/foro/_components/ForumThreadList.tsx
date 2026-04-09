"use client";

import Link from "next/link";
import { useMemo, useState, type CSSProperties } from "react";
import { Clock, Heart, MessageCircle, MessageSquare, ShieldAlert, Stethoscope } from "lucide-react";
import { FORUM_CATEGORIES, type ForumCategory } from "@/lib/forum";

type ThreadItem = {
  id: number;
  title: string;
  content: string;
  category: string;
  createdAt: string | Date;
  author: {
    name: string | null;
    email: string | null;
  };
  _count: {
    comments: number;
  };
};

type ForumThreadListProps = {
  posts: ThreadItem[];
};

const categoryIcons: Record<ForumCategory, typeof MessageSquare> = {
  General: MessageSquare,
  Salud: Stethoscope,
  Adopciones: Heart,
  Rescate: ShieldAlert,
};

export default function ForumThreadList({ posts }: ForumThreadListProps) {
  const [selectedCategory, setSelectedCategory] = useState<ForumCategory | "Todas">("Todas");

  const filteredPosts = useMemo(() => {
    if (selectedCategory === "Todas") return posts;
    return posts.filter((post) => post.category === selectedCategory);
  }, [posts, selectedCategory]);

  return (
    <section style={cardStyle}>
      <h2 style={{ margin: 0 }}>Filtros rápidos</h2>
      <div style={pillContainerStyle}>
        <button
          type="button"
          onClick={() => setSelectedCategory("Todas")}
          style={{ ...pillStyle, ...(selectedCategory === "Todas" ? selectedPillStyle : {}) }}
        >
          Todas
        </button>
        {FORUM_CATEGORIES.map((category) => {
          const Icon = categoryIcons[category];
          return (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              style={{ ...pillStyle, ...(selectedCategory === category ? selectedPillStyle : {}) }}
            >
              <Icon size={16} />
              {category}
            </button>
          );
        })}
      </div>

      <h2 style={{ margin: "0.7rem 0 0" }}>Hilos</h2>
      {filteredPosts.length === 0 ? (
        <p>No hay hilos para esta categoría todavía.</p>
      ) : (
        <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
          {filteredPosts.map((post) => {
            const CategoryIcon = categoryIcons[post.category as ForumCategory] || MessageSquare;
            return (
              <article key={post.id} style={feedCardStyle}>
                <h3 style={titleStyle}>
                  <Link href={`/foro/${post.id}`}>{post.title}</Link>
                </h3>

                <div style={metaRowStyle}>
                  <span style={badgeStyle}>
                    <CategoryIcon size={14} /> {post.category}
                  </span>
                  <span>{post.author.name || post.author.email || "Usuario"}</span>
                  <span style={iconMetaStyle}>
                    <Clock size={14} /> {new Date(post.createdAt).toLocaleString("es-ES")}
                  </span>
                </div>

                <p style={excerptStyle}>{post.content}</p>

                <small style={iconMetaStyle}>
                  <MessageCircle size={14} /> {post._count.comments} comentarios
                </small>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

const cardStyle: CSSProperties = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  padding: "1rem",
};

const pillContainerStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  marginTop: 10,
};

const pillStyle: CSSProperties = {
  border: "1px solid #cbd5e1",
  background: "#f8fafc",
  borderRadius: 999,
  padding: "0.4rem 0.75rem",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  cursor: "pointer",
  fontWeight: 600,
};

const selectedPillStyle: CSSProperties = {
  background: "#0f4c5c",
  color: "#fff",
  borderColor: "#0f4c5c",
};

const feedCardStyle: CSSProperties = {
  border: "1px solid rgba(226, 232, 240, 0.8)",
  background: "rgba(255, 255, 255, 0.9)",
  backdropFilter: "blur(8px)",
  borderRadius: 12,
  padding: "0.9rem",
};

const titleStyle: CSSProperties = {
  margin: "0 0 8px",
  fontWeight: 800,
  fontSize: "1.1rem",
};

const badgeStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  margin: "0",
  background: "#e6f2f5",
  color: "#0f4c5c",
  borderRadius: 999,
  padding: "0.2rem 0.6rem",
  fontSize: 12,
  fontWeight: 700,
};

const metaRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  alignItems: "center",
  marginBottom: 8,
  color: "#334155",
  fontSize: 14,
};

const excerptStyle: CSSProperties = {
  margin: "0 0 10px",
  overflow: "hidden",
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
};

const iconMetaStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
};
