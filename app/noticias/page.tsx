"use client";

import { useEffect, useMemo, useState } from "react";

type RssItem = {
  title?: string;
  link?: string;
  pubDate?: string;
  thumbnail?: string;
  enclosure?: {
    link?: string;
  };
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

  useEffect(() => {
    const controller = new AbortController();

    const loadNews = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(FEED_URL, {
          mode: "cors",
          signal: controller.signal,
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const payload = (await response.json()) as RssResponse;

        if (payload.status !== "ok") {
          throw new Error(payload.message || "No se pudo convertir el RSS a JSON.");
        }

        if (!payload.items) {
          throw new Error("Formato de datos incorrecto");
        }

        const parsedNews = payload.items.slice(0, 12).map((item) => ({
          title: item.title?.trim() || "Sin titular",
          link: item.link?.trim() || "#",
          dateLabel: item.pubDate
            ? new Date(item.pubDate).toLocaleString("es-ES", {
                dateStyle: "medium",
                timeStyle: "short",
              })
            : "Fecha no disponible",
          image: item.thumbnail?.trim() || item.enclosure?.link?.trim() || DEFAULT_IMAGE,
        }));

        setNews(parsedNews);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;

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
      <div style={{ display: "grid", gap: 14 }}>
        {news.map((item) => (
          <article
            key={`${item.link}-${item.dateLabel}`}
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
    );
  }, [error, loading, news]);

  return (
    <main style={{ maxWidth: 980, margin: "2rem auto", padding: "0 1rem" }}>
      <h1>Noticias de bienestar animal</h1>
      <p>Actualizadas desde Europa Press vía rss2json.</p>
      {content}
    </main>
  );
}
