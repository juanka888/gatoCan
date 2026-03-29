"use client";

import { useEffect, useState } from "react";

type RssItem = {
  title?: string;
  link?: string;
  pubDate?: string;
  thumbnail?: string;
};

type RssResponse = {
  items?: RssItem[];
};

const FEED_URL =
  "https://api.rss2json.com/v1/api.json?rss_url=https://www.europapress.es/rss/rss.aspx?ch=00647";

export default function NoticiasPage() {
  const [news, setNews] = useState<RssItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadNews = async () => {
      try {
        setError("");

        const response = await fetch(FEED_URL, { cache: "no-store" });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = (await response.json()) as RssResponse;
        const items = Array.isArray(data.items) ? data.items : [];
        setNews(items);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error desconocido";
        setError(`Error al cargar noticias: ${message}`);
        setNews([]);
      } finally {
        setLoading(false);
      }
    };

    void loadNews();
  }, []);

  return (
    <main style={{ padding: "1rem", maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ fontSize: "clamp(1.4rem, 6vw, 2rem)", marginBottom: "1rem" }}>
        Noticias
      </h1>

      {loading && <p>Cargando noticias...</p>}

      {!loading && error && (
        <p style={{ color: "#c1121f", fontWeight: 700, marginBottom: "1rem" }}>{error}</p>
      )}

      {!loading && news.length === 0 && (
        <p style={{ fontWeight: 600 }}>
          No se han podido procesar las noticias. Intenta recargar.
        </p>
      )}

      {!loading && news.length > 0 && (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "0.9rem" }}>
          {news.map((item, index) => {
            const key = item.link?.trim() || `${item.title || "noticia"}-${index}`;
            const title = item.title?.trim() || "Sin titular";
            const pubDate = item.pubDate?.trim() || "Fecha no disponible";
            const thumbnail = item.thumbnail?.trim();

            return (
              <li
                key={key}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 12,
                  background: "#fff",
                  padding: "0.85rem",
                  display: "grid",
                  gap: "0.45rem",
                }}
              >
                {thumbnail ? (
                  <img
                    src={thumbnail}
                    alt={title}
                    loading="lazy"
                    style={{ width: "100%", maxHeight: 220, objectFit: "cover", borderRadius: 8 }}
                  />
                ) : (
                  <div aria-hidden="true" style={{ fontSize: "1.3rem" }}>
                    🐾
                  </div>
                )}

                <h2 style={{ margin: 0, fontSize: "1rem", lineHeight: 1.35 }}>
                  {item.link ? (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "inherit", textDecoration: "none" }}
                    >
                      {title}
                    </a>
                  ) : (
                    title
                  )}
                </h2>

                <p style={{ margin: 0, color: "#4b4b4b", fontSize: "0.85rem" }}>{pubDate}</p>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
