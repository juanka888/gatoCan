"use client";

import type { CSSProperties } from "react";
import { FormEvent, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function CommentForm({ postId }: { postId: number }) {
  const { status } = useSession();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (status !== "authenticated") {
      setError("Debes iniciar sesión para comentar.");
      return;
    }

    setLoading(true);
    setError("");

    const response = await fetch(`/api/forum/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    setLoading(false);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error || "No se pudo publicar el comentario.");
      return;
    }

    setContent("");
    router.refresh();
  };

  return (
    <section style={cardStyle}>
      <h3 style={{ marginTop: 0 }}>Responder al hilo</h3>
      {status !== "authenticated" && (
        <button className="btn btn-secondary" onClick={() => signIn("google", { callbackUrl: `/foro/${postId}` })}>
          Iniciar sesión para comentar
        </button>
      )}

      {error && <p style={errorStyle}>{error}</p>}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={3}
          placeholder="Escribe tu respuesta"
          required
        />
        <button className="btn btn-primary" disabled={loading}>
          {loading ? "Enviando..." : "Publicar comentario"}
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
