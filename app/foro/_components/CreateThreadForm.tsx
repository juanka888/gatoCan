"use client";

import type { CSSProperties } from "react";
import { FormEvent, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FORUM_CATEGORIES, type ForumCategory } from "@/lib/forum";

export default function CreateThreadForm() {
  const { status } = useSession();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<ForumCategory>("General");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status !== "authenticated") {
      setError("Debes iniciar sesión para crear un hilo.");
      return;
    }

    setLoading(true);
    setError("");

    const response = await fetch("/api/forum", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, category }),
    });

    setLoading(false);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error || "No se pudo crear el hilo.");
      return;
    }

    setTitle("");
    setContent("");
    router.refresh();
  };

  return (
    <section style={cardStyle}>
      <h2 style={{ marginTop: 0 }}>Crear nuevo hilo</h2>
      {status !== "authenticated" && (
        <button className="btn btn-secondary" type="button" onClick={() => signIn("google", { callbackUrl: "/foro" })}>
          Iniciar sesión para publicar
        </button>
      )}

      {error && <p style={errorStyle}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10, marginTop: 12 }}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título del hilo" required />
        <select value={category} onChange={(e) => setCategory(e.target.value as ForumCategory)} required>
          {FORUM_CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Describe tu caso o consulta"
          rows={4}
          required
        />
        <button className="btn btn-primary" disabled={loading}>
          {loading ? "Publicando..." : "Publicar hilo"}
        </button>
      </form>
    </section>
  );
}

const cardStyle: CSSProperties = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  padding: "1rem",
};

const errorStyle: CSSProperties = {
  color: "#9d1c1c",
  background: "#ffe6e6",
  border: "1px solid #f2b8b8",
  borderRadius: 8,
  padding: "0.5rem 0.75rem",
};
