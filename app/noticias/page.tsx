"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Rss2JsonItem = {
  title?: string;
  link?: string;
  pubDate?: string;
  thumbnail?: string;
  enclosure?: {
    link?: string;
  };
  content?: string;
  description?: string;
};

type Rss2JsonResponse = {
  status?: string;
  items?: Rss2JsonItem[];
  message?: string;
};

type NewsItem = {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  image: string;
  source: string;
  timestamp: number;
};

type NewsSource = {
  label: string;
  feedUrl: string;
};

const GATOCAN_LOGO = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360">
    <rect width="640" height="360" fill="#f6f2ec"/>
    <circle cx="220" cy="170" r="92" fill="#f3d9b1"/>
    <circle cx="420" cy="170" r="92" fill="#f3d9b1"/>
    <polygon points="150,90 205,30 235,110" fill="#f0c88f"/>
    <polygon points="490,90 435,30 405,110" fill="#f0c88f"/>
    <circle cx="260" cy="175" r="10" fill="#2e2e2e"/>
    <circle cx="380" cy="175" r="10" fill="#2e2e2e"/>
    <ellipse cx="320" cy="210" rx="24" ry="16" fill="#d08f7d"/>
    <text x="320" y="305" text-anchor="middle" font-size="44" font-family="Arial, sans-serif" fill="#1f1f1f" font-weight="700">GatoCan</text>
  </svg>`,
)}`;

const SOURCES: NewsSource[] = [
  {
    label: "Europa Press Animales",
    feedUrl: "https://www.europapress.es/rss/rss.aspx?ch=00647",
  },
  {
    label: "Animal's Health",
    feedUrl: "https://www.animalshealth.es/rss/legislacion",
  },
  {
    label: "SrPerro (Blog)",
    feedUrl: "https://www.srperro.com/blog_rss",
  },
];

const buildRss2JsonUrl = (feedUrl: string) =>
  `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;

const extractImageFromHtml = (value?: string): string | undefined => {
  if (!value) return undefined;
  const match = value.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1];
};

const parseDate = (value?: string) => {
  if (!value) return 0;
  const ms = Date.parse(value);
  return Number.isNaN(ms) ? 0 : ms;
};

const normalizeItem = (item: Rss2JsonItem, source: string): NewsItem | null => {
  const title = item.title?.trim() || "Sin titular";
  const link = item.link?.trim() || "#";
  const pubDate = item.pubDate?.trim() || "Fecha no disponible";
  const timestamp = parseDate(item.pubDate);

  const image =
    item.thumbnail?.trim() ||
    item.enclosure?.link?.trim() ||
    extractImageFromHtml(item.content) ||
    extractImageFromHtml(item.description) ||
    GATOCAN_LOGO;

  const keyBase = `${link.toLowerCase()}|${title.toLowerCase()}`;
  const id = keyBase || `${source}-${Math.random().toString(36).slice(2)}`;

  if (!title && !link) return null;

  return {
    id,
    title,
    link,
    pubDate,
    image,
    source,
    timestamp,
  };
};

export default function NoticiasPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [allFailed, setAllFailed] = useState(false);
  const [error, setError] = useState("");

  const loadNews = useCallback(async () => {
    setLoading(true);
    setError("");
    setAllFailed(false);

    const requests = SOURCES.map(async (source) => {
      const response = await fetch(buildRss2JsonUrl(source.feedUrl), {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`${source.label}: HTTP ${response.status}`);
      }

      const payload = (await response.json()) as Rss2JsonResponse;

      if (payload.status !== "ok" || !Array.isArray(payload.items)) {
        throw new Error(
          `${source.label}: respuesta inválida (${payload.message || "sin detalles"})`,
        );
      }

      return payload.items
        .map((item) => normalizeItem(item, source.label))
        .filter((item): item is NewsItem => Boolean(item));
    });

    const settled = await Promise.allSettled(requests);

    const successfulLists = settled
      .filter((result): result is PromiseFulfilledResult<NewsItem[]> => result.status === "fulfilled")
      .map((result) => result.value);

    const failed = settled.filter((result) => result.status === "rejected");

    if (successfulLists.length === 0) {
      setNews([]);
      setAllFailed(true);
      setError(
        "El servicio de noticias está en mantenimiento temporal. Puedes intentar de nuevo en unos segundos.",
      );
      setLoading(false);
      return;
    }

    const merged = successfulLists.flat();
    const dedupMap = new Map<string, NewsItem>();

    merged.forEach((item) => {
      const dedupKey = `${item.link.toLowerCase()}|${item.title.toLowerCase()}`;
      const existing = dedupMap.get(dedupKey);
      if (!existing || item.timestamp > existing.timestamp) {
        dedupMap.set(dedupKey, item);
      }
    });

    const sorted = Array.from(dedupMap.values()).sort(
      (a, b) => b.timestamp - a.timestamp,
    );

    setNews(sorted);
    setAllFailed(false);

    if (failed.length > 0) {
      setError(
        `Se cargaron ${successfulLists.length} de ${SOURCES.length} fuentes. Algunas noticias pueden faltar temporalmente.`,
      );
    } else {
      setError("");
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void loadNews();
  }, [loadNews]);

  const title = useMemo(() => "Noticias de bienestar animal", []);

  return (
    <main
      style={{
        width: "100%",
        maxWidth: 1120,
        margin: "0 auto",
        padding: "1rem",
      }}
    >
      <h1 style={{ marginBottom: "0.75rem", fontSize: "clamp(1.5rem, 5vw, 2rem)" }}>
        {title}
      </h1>

      {loading && <p>Cargando noticias...</p>}

      {!loading && error && !allFailed && (
        <p role="status" style={{ color: "#7a4f01", fontWeight: 600, marginBottom: "1rem" }}>
          {error}
        </p>
      )}

      {!loading && allFailed && (
        <section
          style={{
            border: "2px solid #f0d6d6",
            background: "#fff5f5",
            borderRadius: 14,
            padding: "1.25rem",
            display: "grid",
            gap: "0.9rem",
            textAlign: "center",
          }}
        >
          <p role="alert" style={{ color: "#8f1b1b", fontWeight: 700, margin: 0 }}>
            {error}
          </p>
          <button
            type="button"
            onClick={() => void loadNews()}
            style={{
              width: "100%",
              maxWidth: 360,
              margin: "0 auto",
              padding: "0.95rem 1.1rem",
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
              fontWeight: 800,
              fontSize: "1rem",
              background: "#161616",
              color: "#ffffff",
            }}
          >
            Reintentar cargar noticias
          </button>
        </section>
      )}

      {!loading && !allFailed && news.length === 0 && <p>No hay noticias disponibles.</p>}

      {!loading && !allFailed && news.length > 0 && (
        <ul
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "1rem",
            listStyle: "none",
            padding: 0,
            margin: 0,
          }}
        >
          {news.map((item) => (
            <li
              key={item.id}
              style={{
                border: "1px solid #dedede",
                borderRadius: 12,
                overflow: "hidden",
                background: "#fff",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", height: "100%" }}
              >
                <img
                  src={item.image || GATOCAN_LOGO}
                  alt={item.title}
                  loading="lazy"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src.endsWith(GATOCAN_LOGO)) return;
                    target.src = GATOCAN_LOGO;
                  }}
                  style={{
                    width: "100%",
                    aspectRatio: "16 / 9",
                    objectFit: "cover",
                    background: "#f5f5f5",
                  }}
                />
                <div style={{ padding: "0.85rem", display: "grid", gap: "0.45rem" }}>
                  <p style={{ margin: 0, fontSize: "0.83rem", color: "#5e5e5e", fontWeight: 600 }}>
                    {item.source}
                  </p>
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
