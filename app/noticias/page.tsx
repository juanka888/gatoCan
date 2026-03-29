"use client";

import { useEffect, useState } from "react";

type RssItem = {
  title?: string;
  link?: string;
  pubDate?: string;
  thumbnail?: string;
};

type RssResponse = {
  status?: string;
  message?: string;
  items?: RssItem[];
};

type News = {
  title: string;
  link: string;
  dateLabel: string;
  image: string;
};

const FEED_URL =
  "https://api.rss2json.com/v1/api.json?rss_url=https://www.europapress.es/rss/rss.aspx?ch=00647";

const DEFAULT_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 480 300'>
    <defs>
      <linearGradient id='bg' x1='0' x2='1' y1='0' y2='1'>
        <stop offset='0%' stop-color='#fef6f3'/>
        <stop offset='100%' stop-color='#f5e6ff'/>
      </linearGradient>
    </defs>
    <rect width='480' height='300' fill='url(#bg)'/>
    <text x='240' y='140' text-anchor='middle' font-size='88'>🐾</text>
    <text x='240' y='190' text-anchor='middle' fill='#6b4e94' font-family='Arial, sans-serif' font-size='28' font-weight='700'>GatoCan</text>
  </svg>
`);

export default function NoticiasPage() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [debugPayload, setDebugPayload] = useState<RssResponse | null>(null);

  useEffect(() => {
    const loadNews = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(FEED_URL, {
          mode: "cors",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const payload = (await response.json()) as RssResponse;
        setDebugPayload(payload);

        const items = Array.isArray(payload.items) ? payload.items : [];

        if (!payload.items) {
          throw new Error("Formato de datos incorrecto");
        }

        const parsedNews = payload.items.map((item) => ({
          title: item.title?.trim() || "Sin titular",
          link: item.link?.trim() || "#",
          dateLabel: item.pubDate
            ? new Date(item.pubDate).toLocaleString("es-ES", {
                dateStyle: "medium",
                timeStyle: "short",
              })
            : "Fecha no disponible",
          image: newsItem.thumbnail || DEFAULT_IMAGE,
        }));

        setNews(parsedNews);
      } catch (err) {
        console.error("Error cargando noticias:", err);
        setError(
          "No pudimos cargar las noticias ahora mismo. Revisa tu conexión e inténtalo de nuevo en unos minutos.",
        );
        setNews([]);
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, []);

  return (
    <main style={{ maxWidth: 980, margin: "2rem auto", padding: "0 1rem" }}>
      <h1>Noticias de bienestar animal</h1>
      <p>Actualizadas desde Europa Press vía rss2json.</p>

      {loading && <p>Cargando noticias de bienestar animal...</p>}

      {!loading && error && (
        <p role="alert" style={{ color: "#9d1c1c", fontWeight: 600 }}>
          {error}
        </p>
      )}

      {!loading && !error && !news.length && (
        <>
          <p>No hay noticias disponibles ahora mismo.</p>
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", background: "#f5f5f5", padding: 12, borderRadius: 8 }}>
            {JSON.stringify(debugPayload)}
          </pre>
        </>
      )}

      {!loading && !error && news.length > 0 && (
        <div style={{ display: "grid", gap: 14 }}>
          {news.map((item, index) => (
            <article
              key={`${item.link}-${index}`}
              style={{
                border: "1px solid #ddd",
                borderRadius: 12,
                overflow: "hidden",
                background: "#fff",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(140px, 220px) 1fr",
                  color: "inherit",
                  textDecoration: "none",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.title}
                  style={{ width: "100%", height: "100%", minHeight: 140, objectFit: "cover" }}
                />
                <div style={{ padding: 14 }}>
                  <h3 style={{ margin: "0 0 8px", fontSize: "1rem", lineHeight: 1.45 }}>{item.title}</h3>
                  <p style={{ margin: 0, color: "#555", fontSize: ".9rem" }}>{item.dateLabel}</p>
                </div>
              </a>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
