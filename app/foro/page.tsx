"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type Post = {
  id: number;
  title: string;
  content: string;
  author: string;
  created_at: string;
};

function isPermissionError(error: unknown) {
  if (!error || typeof error !== "object") return false;

  const err = error as { code?: string; message?: string };
  const message = (err.message ?? "").toLowerCase();

  return (
    err.code === "42501" ||
    message.includes("permission") ||
    message.includes("rls") ||
    message.includes("row-level")
  );
}

export default function ForoPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadPosts = async () => {
      setLoadingPosts(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      console.log("Datos del foro:", data, error);

      if (error) {
        if (isPermissionError(error)) {
          setErrorMessage("Error de permisos, contacta al administrador");
        } else {
          setErrorMessage("No se pudieron cargar las publicaciones del foro.");
        }

        setPosts([]);
        setLoadingPosts(false);
        return;
      }

      setPosts((data ?? []) as Post[]);
      setLoadingPosts(false);
    };

    loadPosts();

    const channel = supabase
      .channel("posts-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        () => {
          loadPosts();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Debes iniciar sesión para publicar.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("posts").insert({
      title,
      content,
      author: user.email ?? user.id,
    });

    setLoading(false);

    if (error) {
      if (isPermissionError(error)) {
        setErrorMessage("Error de permisos, contacta al administrador");
      } else {
        setErrorMessage(`Error al crear post: ${error.message}`);
      }

      return;
    }

    setTitle("");
    setContent("");
  };

  return (
    <main style={{ maxWidth: 720, margin: "2rem auto", padding: "0 1rem" }}>
      <h1>Foro GatoCan</h1>
      <p>Todos pueden leer. Solo usuarios autenticados pueden publicar.</p>

      {errorMessage && (
        <p
          role="alert"
          style={{
            color: "#9d1c1c",
            background: "#ffe6e6",
            border: "1px solid #f2b8b8",
            borderRadius: 8,
            padding: 10,
            marginBottom: 16,
          }}
        >
          {errorMessage}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        style={{ display: "grid", gap: 12, marginBottom: 24 }}
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título"
          required
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Contenido"
          rows={4}
          required
        />
        <button disabled={loading}>{loading ? "Publicando..." : "Publicar"}</button>
      </form>

      <section style={{ display: "grid", gap: 12 }}>
        {loadingPosts ? (
          <p>Cargando publicaciones...</p>
        ) : posts.length === 0 ? (
          <p>No hay publicaciones aún.</p>
        ) : (
          posts.map((post) => (
            <article
              key={post.id}
              style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}
            >
              <h3 style={{ margin: "0 0 6px" }}>{post.title}</h3>
              <p style={{ margin: "0 0 10px" }}>{post.content}</p>
              <small>
                Por {post.author} · {new Date(post.created_at).toLocaleString()}
              </small>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
