"use client";

import { useEffect, useState } from "react";

type NewsItem = {
  title?: string;
  link?: string;
  pubDate?: string;
};

type AllOriginsResponse = {
  contents?: string;
};

export default function NoticiasPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadNews = async () => {
      setLoading(true);
      setError("");

      try {
        const url =
          "https://api.allorigins.win/get?url=" +
          encodeURIComponent(
            "https://api.rss2json.com/v1/api.json?rss_url=https://www.europapress.es/rss/rss.aspx?ch=00647",
          );

        const response = await fetch(url, { cache: "no-store" });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status} al consultar allorigins`);
        }

        const json = (await response.json()) as AllOriginsResponse;

        if (!json.contents) {
          throw new Error("La respuesta de allorigins no trae el campo contents");
        }

        const payload = JSON.parse(json.contents) as { items?: NewsItem[] };
        setNews(payload.items || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(`Error al cargar noticias: ${message}`);
        setNews([]);
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, []);

  return (
    <main style={{ maxWidth: 900, margin: "2rem auto", padding: "0 1rem" }}>
      <h1>Noticias de bienestar animal</h1>

      {loading && <p>Cargando noticias...</p>}

      {!loading && error && (
        <p role="alert" style={{ color: "#9d1c1c", fontWeight: 600 }}>
          {error}
        </p>
      )}

      {!loading && !error && news.length === 0 && <p>No hay noticias disponibles.</p>}

      {!loading && !error && news.length > 0 && (
        <ul style={{ display: "grid", gap: 10, padding: 0, listStyle: "none" }}>
          {news.map((item, index) => (
            <li key={`${item.link || item.title || "item"}-${index}`} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
              <a href={item.link || "#"} target="_blank" rel="noopener noreferrer">
                {item.title || "Sin titular"}
              </a>
              {item.pubDate && (
                <p style={{ margin: "6px 0 0", color: "#555", fontSize: ".9rem" }}>{item.pubDate}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
