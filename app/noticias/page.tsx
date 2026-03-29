"use client";

import React, { useEffect, useState } from "react";

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
  items?: RssItem[];
};

type NewsItem = {
  title: string;
  link: string;
  pubDate: string;
  image?: string;
  timestamp: number;
};

const RSS2JSON_SOURCES = [
  "https://api.rss2json.com/v1/api.json?rss_url=https://www.europapress.es/rss/rss.aspx?ch=00647",
  "https://api.rss2json.com/v1/api.json?rss_url=https://www.animalshealth.es/rss/legislacion",
  "https://api.rss2json.com/v1/api.json?rss_url=https://www.srperro.com/blog_rss",
];

export default function NoticiasPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const loadNews = async () => {
      try {
        setError("");

        const responses = await Promise.all(
          RSS2JSON_SOURCES.map((url) =>
            fetch(url, { cache: "no-store" })
              .then((res) => (res.ok ? res.json() : null))
              .catch(() => null),
          ),
        );

        const allItems = responses.flatMap((payload) => {
          const typedPayload = payload as RssResponse | null;
          return Array.isArray(typedPayload?.items) ? typedPayload.items : [];
        });

        const normalized: NewsItem[] = allItems
          .map((item) => {
            const link = item.link?.trim() || "";
            const pubDate = item.pubDate?.trim() || "";
            const timestamp = Number.isNaN(Date.parse(pubDate)) ? 0 : Date.parse(pubDate);

            return {
              title: item.title?.trim() || "Sin titular",
              link,
              pubDate: pubDate || "Fecha no disponible",
              image: item.thumbnail?.trim() || item.enclosure?.link?.trim() || "",
              timestamp,
            };
          })
          .filter((item) => item.link);

        const dedupByLink = new Map<string, NewsItem>();

        normalized.forEach((item) => {
          const existing = dedupByLink.get(item.link);
          if (!existing || item.timestamp > existing.timestamp) {
            dedupByLink.set(item.link, item);
          }
        });

        const sorted = Array.from(dedupByLink.values()).sort(
          (a, b) => b.timestamp - a.timestamp,
        );

        setNews(sorted);

        if (sorted.length === 0) {
          setError("Error de red: no se pudieron cargar noticias desde ninguna fuente.");
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error desconocido";
        setError(`Error de red: ${message}`);
        setNews([]);
      }
    };

    void loadNews();
  }, []);

  return (
    <main style={{ padding: "1rem", maxWidth: 980, margin: "0 auto" }}>
      <h1 style={{ fontSize: "clamp(1.4rem, 6vw, 2rem)", marginBottom: "1rem" }}>
        Noticias
      </h1>

      {error && (
        <p style={{ color: "#c1121f", fontWeight: 700, marginBottom: "1rem" }}>{error}</p>
      )}

      {news.length === 0 ? (
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            width: "100%",
            maxWidth: 360,
            padding: "0.9rem 1rem",
            borderRadius: 10,
            border: "none",
            background: "#161616",
            color: "#fff",
            fontWeight: 800,
            fontSize: "1rem",
            cursor: "pointer",
          }}
        >
          REINTENTAR CARGA
        </button>
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "0.9rem" }}>
          {news.map((item) => (
            <li
              key={item.link}
              style={{
                border: "1px solid #ddd",
                borderRadius: 12,
                overflow: "hidden",
                background: "#fff",
              }}
            >
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none", color: "inherit", display: "block" }}
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    style={{ width: "100%", aspectRatio: "16 / 9", objectFit: "cover" }}
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    style={{
                      width: "100%",
                      aspectRatio: "16 / 9",
                      display: "grid",
                      placeItems: "center",
                      fontSize: "4rem",
                      background: "#f5f5f5",
                    }}
                  >
                    🐾
                  </div>
                )}

                <div style={{ padding: "0.85rem", display: "grid", gap: "0.45rem" }}>
                  <h2 style={{ margin: 0, fontSize: "1rem", lineHeight: 1.35 }}>{item.title}</h2>
                  <p style={{ margin: 0, color: "#4b4b4b", fontSize: "0.85rem" }}>{item.pubDate}</p>
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
