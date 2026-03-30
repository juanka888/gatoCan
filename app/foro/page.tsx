"use client";

import { FormEvent, useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";

type Post = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
};

export default function ForoPage() {
  const { status, data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadPosts = async () => {
    setLoadingPosts(true);
    const response = await fetch("/api/forum/posts", { cache: "no-store" });
    if (!response.ok) {
      setErrorMessage("No se pudieron cargar las publicaciones del foro.");
      setLoadingPosts(false);
      return;
    }

    const data = await response.json();
    setPosts(data.posts || []);
    setLoadingPosts(false);
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (status !== "authenticated") {
      setErrorMessage("Debes iniciar sesión para publicar.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    const response = await fetch("/api/forum/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });

    setLoading(false);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setErrorMessage(data.error || "Error al crear post");
      return;
    }

    setTitle("");
    setContent("");
    loadPosts();
  };

  return (
    <main style={{ maxWidth: 720, margin: "2rem auto", padding: "0 1rem" }}>
      <h1>Foro GatoCan</h1>
      <p>
        Todos pueden leer. Solo usuarios autenticados pueden publicar.
        {session?.user?.email ? ` Sesión activa: ${session.user.email}.` : ""}
      </p>

      {status !== "authenticated" && (
        <button type="button" onClick={() => signIn("google", { callbackUrl: "/foro" })} style={{ marginBottom: 16 }}>
          Acceder con Google para publicar
        </button>
      )}

      {errorMessage && (
        <p role="alert" style={{ color: "#9d1c1c", background: "#ffe6e6", border: "1px solid #f2b8b8", borderRadius: 8, padding: 10, marginBottom: 16 }}>
          {errorMessage}
        </p>
      )}

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12, marginBottom: 24 }}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título" required />
        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Contenido" rows={4} required />
        <button disabled={loading}>{loading ? "Publicando..." : "Publicar"}</button>
      </form>

      <section style={{ display: "grid", gap: 12 }}>
        {loadingPosts ? (
          <p>Cargando publicaciones...</p>
        ) : posts.length === 0 ? (
          <p>No hay publicaciones aún.</p>
        ) : (
          posts.map((post) => (
            <article key={post.id} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
              <h3 style={{ margin: "0 0 6px" }}>{post.title}</h3>
              <p style={{ margin: "0 0 10px" }}>{post.content}</p>
              <small>
                Por {post.author.name || post.author.email || "Usuario"} · {new Date(post.createdAt).toLocaleString()}
              </small>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
