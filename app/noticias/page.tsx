"use client";

import { useEffect, useMemo, useState } from "react";

type RssItem = {
  title?: string;
  link?: string;
  pubDate?: string;
  thumbnail?: string;
  description?: string;
};

type RssResponse = {
  status: "ok" | "error";
  message?: string;
  items?: RssItem[];
};

type News = {
  title: string;
  link: string;
  dateLabel: string;
  image?: string;
};

const FEED_URL =
  "https://api.rss2json.com/v1/api.json?rss_url=https://www.animalshealth.es/rss/legislacion";

export default function NoticiasPage() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const loadNews = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(FEED_URL, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const payload = (await response.json()) as RssResponse;

        if (payload.status !== "ok") {
          throw new Error(payload.message || "No se pudo convertir el RSS a JSON.");
        }

        const parsedNews = (payload.items ?? []).slice(0, 12).map((item) => ({
          title: item.title?.trim() || "Sin título",
          link: item.link || "#",
          dateLabel: item.pubDate
            ? new Date(item.pubDate).toLocaleString("es-ES")
            : "Fecha no disponible",
          image: item.thumbnail || undefined,
        }));

        setNews(parsedNews);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;

        console.error("Error cargando noticias:", err);
        setError(
          "No se pudieron cargar las noticias en este momento. Inténtalo de nuevo en unos minutos.",
        );
        setNews([]);
      } finally {
        setLoading(false);
      }
    };

    loadNews();

    return () => {
      controller.abort();
    };
  }, []);

  const content = useMemo(() => {
    if (loading) {
      return <p>Cargando noticias de bienestar animal...</p>;
    }

    if (error) {
      return (
        <p role="alert" style={{ color: "#9d1c1c", fontWeight: 600 }}>
          {error}
        </p>
      );
    }

    if (!news.length) {
      return <p>No hay noticias disponibles ahora mismo.</p>;
    }

    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 14,
        }}
      >
        {news.map((item) => (
          <article
            key={`${item.link}-${item.dateLabel}`}
            style={{
              border: "1px solid #ddd",
              borderRadius: 10,
              overflow: "hidden",
              background: "#fff",
            }}
          >
            {item.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.image}
                alt={item.title}
                style={{ width: "100%", height: 160, objectFit: "cover" }}
              />
            ) : (
              <div
                aria-hidden="true"
                style={{
                  width: "100%",
                  height: 160,
                  display: "grid",
                  placeItems: "center",
                  background: "#f6f6f6",
                  fontSize: 26,
                }}
              >
                🐾
              </div>
            )}

            <div style={{ padding: 12 }}>
              <h3 style={{ margin: "0 0 8px", fontSize: "1rem", lineHeight: 1.4 }}>
                {item.title}
              </h3>
              <p style={{ margin: "0 0 10px", color: "#555", fontSize: ".9rem" }}>
                {item.dateLabel}
              </p>
              <a href={item.link} target="_blank" rel="noreferrer">
                Leer noticia
              </a>
            </div>
          </article>
        ))}
      </div>
    );
  }, [error, loading, news]);

  return (
    <main style={{ maxWidth: 980, margin: "2rem auto", padding: "0 1rem" }}>
      <h1>Noticias de bienestar animal</h1>
      <p>Fuente RSS transformada con rss2json para evitar bloqueos CORS en cliente.</p>
      {content}
    </main>
  );
}
