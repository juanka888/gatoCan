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

const RSS_URLS = [
  "https://www.europapress.es/rss/rss.aspx?ch=00647",
  "https://www.lavozdegalicia.es/galicia/index.xml",
  "https://www.gciencia.com/feed/",
  "https://www.elprogreso.es/rss"
];

// 🔥 fetch con timeout (CLAVE para que no se quede colgado)
const fetchWithTimeout = async (url: string, timeout = 6000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      cache: "no-store"
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return { items: [] }; // 👈 si falla, no rompe todo
  } finally {
    clearTimeout(id);
  }
};

export default function NoticiasPage() {
  const [news, setNews] = useState<RssItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNews = async () => {
    try {
      setError("");

      // 🔥 Creamos requests controladas
      const requests = RSS_URLS.map((url) =>
        fetchWithTimeout(
          `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`
        )
      );

      const results = await Promise.all(requests);

      let allItems = results.flatMap((data: RssResponse) => data.items || []);

      // 🔥 eliminar duplicados por link
      const unique = Array.from(
        new Map(allItems.map((item) => [item.link, item])).values()
      );

      // 🔥 ordenar por fecha
      unique.sort((a, b) => {
        const dateA = new Date(a.pubDate || 0).getTime();
        const dateB = new Date(b.pubDate || 0).getTime();
        return dateB - dateA;
      });

      // 🔥 limitar
      setNews(unique.slice(0, 30));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      setError(`Error al cargar noticias: ${message}`);
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();

    // 🔥 auto refresh cada 10 min
    const interval = setInterval(loadNews, 600000);
    return () => clearInterval(interval);
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

            // 🔥 fecha bonita
            const formattedDate = item.pubDate
              ? new Date(item.pubDate).toLocaleString("es-ES", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit"
                })
              : "Fecha no disponible";

            return (
              <li
                key={key}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 12,
                  background: "#fff",
                  padding: "0.85rem"
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
                      borderRadius: 8
                    }}
                  />
                )}

                <h2 style={{ fontSize: "1rem" }}>
                  {item.link ? (
                    <a href={item.link} target="_blank">
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
