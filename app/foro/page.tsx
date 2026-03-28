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

export default function ForoPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadPosts = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("id,title,content,author,created_at")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error cargando posts:", error.message);
        return;
      }

      setPosts(data ?? []);
    };

    loadPosts();

    const channel = supabase
      .channel("posts-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        () => {
          loadPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

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
      alert(`Error al crear post: ${error.message}`);
      return;
    }

    setTitle("");
    setContent("");
  };

  return (
    <main style={{ maxWidth: 720, margin: "2rem auto", padding: "0 1rem" }}>
      <h1>Foro GatoCan</h1>
      <p>Todos pueden leer. Solo usuarios autenticados pueden publicar.</p>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12, marginBottom: 24 }}>
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
        {posts.length === 0 ? (
          <p>No hay publicaciones aún.</p>
        ) : (
          posts.map((post) => (
            <article key={post.id} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
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
