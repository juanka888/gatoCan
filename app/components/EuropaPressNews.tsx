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

export default function EuropaPressNews() {
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
        setNews(Array.isArray(data.items) ? data.items : []);
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

  if (loading) {
    return <p>Cargando noticias...</p>;
  }

  if (error) {
    return <p style={{ color: "#c1121f", fontWeight: 700 }}>{error}</p>;
  }

  if (news.length === 0) {
    return <p>No se han podido procesar noticias por ahora.</p>;
  }

  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "0.9rem" }}>
      {news.slice(0, 8).map((item, index) => {
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
              <div aria-hidden="true">🐾</div>
            )}

            <h4 style={{ margin: 0, fontSize: "1rem", lineHeight: 1.35 }}>
              {item.link ? (
                <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: "inherit" }}>
                  {title}
                </a>
              ) : (
                title
              )}
            </h4>

            <p style={{ margin: 0, color: "#4b4b4b", fontSize: "0.85rem" }}>{pubDate}</p>
          </li>
        );
      })}
    </ul>
  );
}
