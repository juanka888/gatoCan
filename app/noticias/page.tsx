"use client";

import { useEffect, useState } from "react";

type RssItem = {
  title?: string;
  link?: string;
  pubDate?: string;
  thumbnail?: string;
  source?: string; // Añadimos esto para saber de dónde viene la noticia
};

type RssResponse = {
  items?: RssItem[];
};

// Configuración de las fuentes solicitadas
const FEEDS = [
  { name: "El Progreso de Lugo", url: "https://www.elprogreso.es/rss" },
  { name: "La Voz de Galicia", url: "https://www.lavoz degalicia.es/lugo/index.xml" },
  { name: "GCiencia", url: "https://www.gciencia.com/feed/" },
  { name: "El Español (Mascotas)", url: "https://www.elespanol.com/curiosidades/mascotas/rss.xml" },
  { name: "Europa Press Animales", url: "https://www.europapress.es/rss/rss.aspx?ch=00647" }
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

        // Mapeamos cada URL al servicio de rss2json para poder leerlas todas
        const fetchPromises = FEEDS.map(async (feed) => {
          const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`;
          const response = await fetch(apiUrl);
          if (!response.ok) return []; // Si falla un feed, devolvemos vacío para no romper el resto
          
          const data = (await response.json()) as RssResponse;
          // Inyectamos el nombre de la fuente en cada item
          return (data.items || []).map(item => ({ ...item, source: feed.name }));
        });

        // Resolvemos todas las peticiones en paralelo
        const results = await Promise.all(fetchPromises);
        
        // Aplanamos el array de arrays y ordenamos por fecha (más recientes primero)
        const combinedNews = results.flat().sort((a, b) => {
          return new Date(b.pubDate || 0).getTime() - new Date(a.pubDate || 0).getTime();
        });

        setNews(combinedNews);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error desconocido";
        setError(`Error al cargar noticias: ${message}`);
      } finally {
        setLoading(false);
      }
    };

    void loadNews();
  }, []);

  return (
    <main style={{ padding: "1rem", maxWidth: 720, margin: "0 auto" }}>
      <header style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "clamp(1.4rem, 6vw, 2rem)", marginBottom: "0.5rem" }}>
          Noticias Sociales y Locales
        </h1>
        <p style={{ fontSize: "0.9rem", color: "#666" }}>Actualidad de Lugo, Galicia y bienestar animal</p>
      </header>

      {loading && <p>Cargando últimas noticias...</p>}

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
                  position: "relative"
                }}
              >
                {/* Badge de Fuente */}
                <span style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  background: "#f0f0f0",
                  padding: "2px 8px",
                  borderRadius: "20px",
                  fontSize: "0.7rem",
                  fontWeight: "bold",
                  zIndex: 1
                }}>
                  {item.source}
                </span>

                {thumbnail ? (
                  <img
                    src={thumbnail}
                    alt={title}
                    loading="lazy"
                    style={{ width: "100%", maxHeight: 220, objectFit: "cover", borderRadius: 8 }}
                  />
                ) : (
                  <div aria-hidden="true" style={{ fontSize: "1.3rem", padding: "0.5rem 0" }}>
                    🐾
                  </div>
                )}

                <h2 style={{ margin: 0, fontSize: "1rem", lineHeight: 1.35, paddingRight: "80px" }}>
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

                <p style={{ margin: 0, color: "#4b4b4b", fontSize: "0.85rem" }}>
                  {new Date(pubDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
