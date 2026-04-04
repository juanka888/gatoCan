"use client";

import { useEffect, useState } from "react";

type RssItem = {
  title?: string;
  link?: string;
  pubDate?: string;
  thumbnail?: string;
};

export default function NoticiasPage() {
  const [news, setNews] = useState<RssItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNews = async () => {
    try {
      setLoading(true);
      setError("");

      // Añadimos cache: "no-store" para que siempre pida noticias frescas al backend
      const res = await fetch("/api/noticias", { 
        cache: "no-store",
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);

      const data = await res.json();
      
      // Verificamos que 'data' sea un array (tu backend lo envía así)
      const newsArray = Array.isArray(data) ? data : [];
      setNews(newsArray);
      
    } catch (err) {
      console.error("Fallo en el fetch:", err);
      setError("No se pudieron cargar las noticias desde el servidor.");
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  return (
    <main style={{ padding: "1rem", maxWidth: 720, margin: "0 auto", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "clamp(1.4rem, 6vw, 2rem)", marginBottom: "1.5rem", textAlign: "center" }}>
        Actualidad Social y Local
      </h1>

      {loading && (
        <p style={{ textAlign: "center", padding: "2rem" }}>🐾 Buscando noticias en Lugo y redes...</p>
      )}

      {!loading && error && (
        <div style={{ textAlign: "center", padding: "1rem" }}>
          <p style={{ color: "#c1121f", fontWeight: 700 }}>{error}</p>
          <button 
            onClick={() => loadNews()} 
            style={{ marginTop: "10px", padding: "8px 16px", borderRadius: "8px", cursor: "pointer" }}
          >
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && news.length === 0 && (
        <p style={{ textAlign: "center" }}>No hay noticias disponibles en este momento.</p>
      )}

      {!loading && news.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "1.2rem" }}>
          {news.map((item, index) => {
            const key = item.link || `news-${index}`;
            const title = item.title?.replace(/&quot;/g, '"').replace(/&amp;/g, '&') || "Sin titular";
            const thumbnail = item.thumbnail;

            // Formateo de fecha más robusto
            let formattedDate = "Fecha no disponible";
            if (item.pubDate) {
              const date = new Date(item.pubDate);
              if (!isNaN(date.getTime())) {
                formattedDate = date.toLocaleString("es-ES", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                });
              }
            }

            return (
              <li
                key={key}
                style={{
                  border: "1px solid #eee",
                  borderRadius: 16,
                  background: "#fff",
                  padding: "1rem",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.8rem"
                }}
              >
                {thumbnail ? (
                  <img
                    src={thumbnail}
                    alt=""
                    loading="lazy"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "cover",
                      borderRadius: 10,
                    }}
                  />
                ) : (
                  <div style={{ fontSize: "2rem", background: "#f9f9f9", borderRadius: 10, height: "100px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    🐾
                  </div>
                )}

                <div>
                  <h2 style={{ fontSize: "1.1rem", margin: "0 0 0.5rem 0", lineHeight: 1.3 }}>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#1a1a1a", textDecoration: "none" }}
                      onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
                      onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}
                    >
                      {title}
                    </a>
                  </h2>
                  <p style={{ fontSize: "0.8rem", color: "#888", margin: 0 }}>
                    {formattedDate}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
                }
