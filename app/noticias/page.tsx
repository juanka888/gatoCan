"use client";

import { useEffect, useState } from "react";

type RssItem = {
  title?: string;
  link?: string;
  pubDate?: string;
  thumbnail?: string;
};

export default function NoticiasPage() {
  const [news, setNews] = useState<RssItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNews = async () => {
    try {
      setError("");

      const res = await fetch("/api/noticias");

      if (!res.ok) throw new Error("Error cargando API");

      const data = await res.json();
      setNews(data);
    } catch (err) {
      setError("Error cargando noticias");
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  return (
    <main style={{ padding: "1rem", maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ fontSize: "clamp(1.4rem, 6vw, 2rem)", marginBottom: "1rem" }}>
        Noticias Sociales y Locales
      </h1>

      {loading && <p>Cargando noticias...</p>}

      {!loading && error && (
        <p style={{ color: "#c1121f", fontWeight: 700 }}>{error}</p>
      )}

      {!loading && news.length === 0 && (
        <p>No se han podido procesar las noticias.</p>
      )}

      {!loading && news.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "1rem" }}>
          {news.map((item, index) => {
            const key = item.link || index;
            const title = item.title || "Sin titular";
            const thumbnail = item.thumbnail;

            const formattedDate = item.pubDate
              ? new Date(item.pubDate).toLocaleString("es-ES", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Fecha no disponible";

            return (
              <li
                key={key}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 12,
                  background: "#fff",
                  padding: "0.85rem",
                }}
              >
                {thumbnail && (
                  <img
                    src={thumbnail}
                    alt={title}
                    loading="lazy"
                    onError={(e) =>
                      (e.currentTarget.style.display = "none")
                    }
                    style={{
                      width: "100%",
                      maxHeight: 200,
                      objectFit: "cover",
                      borderRadius: 8,
                    }}
                  />
                )}

                <h2 style={{ fontSize: "1rem" }}>
                  {item.link ? (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {title}
                    </a>
                  ) : (
                    title
                  )}
                </h2>

                <p style={{ fontSize: "0.8rem", color: "#555" }}>
                  {formattedDate}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
