"use client";

import { useEffect, useState } from "react";

type RssItem = {
  title?: string;
  link?: string;
  pubDate?: string;
  thumbnail?: string;
  source?: string;
};

type RssResponse = {
  status: string;
  items?: RssItem[];
};

// URLs corregidas (sin espacios)
const FEEDS = [
  { name: "El Progreso", url: "https://www.elprogreso.es/rss" },
  { name: "La Voz de Galicia", url: "https://www.lavozgalicia.es/lugo/index.xml" },
  { name: "GCiencia", url: "https://www.gciencia.com/feed/" },
  { name: "El Español", url: "https://www.elespanol.com/curiosidades/mascotas/rss.xml" },
  { name: "Europa Press", url: "https://www.europapress.es/rss/rss.aspx?ch=00647" }
];

export default function NoticiasPage() {
  const [news, setNews] = useState<RssItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true);
        setError("");

        const fetchPromises = FEEDS.map(async (feed) => {
          try {
            const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`;
            const response = await fetch(apiUrl);
            
            if (!response.ok) return [];
            
            const data = (await response.json()) as RssResponse;
            if (data.status !== "ok") return [];

            return (data.items || []).map(item => ({ 
              ...item, 
              source: feed.name 
            }));
          } catch (e) {
            console.error(`Error cargando ${feed.name}:`, e);
            return [];
          }
        });

        const results = await Promise.all(fetchPromises);
        const combined = results.flat().sort((a, b) => {
          const dateA = new Date(a.pubDate || 0).getTime();
          const dateB = new Date(b.pubDate || 0).getTime();
          return dateB - dateA;
        });

        setNews(combined.slice(0, 30)); // Limitamos a 30 para que no explote el banner
      } catch (err) {
        setError("Error de conexión al cargar las fuentes.");
      } finally {
        setLoading(false);
      }
    };

    void loadNews();
  }, []);

  return (
    <main style={{ padding: "1rem", maxWidth: 720, margin: "0 auto", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Noticias de la Zona y Animales</h1>

      {loading && <p>Actualizando noticias...</p>}
      {!loading && error && <p style={{ color: "red" }}>{error}</p>}

      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "1rem" }}>
        {news.map((item, index) => (
          <li key={index} style={{ border: "1px solid #eee", padding: "1rem", borderRadius: "8px", position: "relative" }}>
            <span style={{ fontSize: "0.7rem", background: "#eee", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold" }}>
              {item.source}
            </span>
            <h2 style={{ fontSize: "1.1rem", margin: "0.5rem 0" }}>
              <a href={item.link} target="_blank" rel="noopener" style={{ color: "#0070f3", textDecoration: "none" }}>
                {item.title}
              </a>
            </h2>
            <p style={{ fontSize: "0.8rem", color: "#666", margin: 0 }}>{item.pubDate}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
