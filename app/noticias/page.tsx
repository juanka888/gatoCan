"use client";

import { useEffect, useState } from "react";

// URLs verificadas y limpias
const FEEDS = [
  { name: "Lugo (El Progreso)", url: "https://www.elprogreso.es/rss" },
  { name: "La Voz de Galicia", url: "https://www.lavozgalicia.es/lugo/index.xml" },
  { name: "GCiencia", url: "https://www.gciencia.com/feed/" },
  { name: "Mascotas (El Español)", url: "https://www.elespanol.com/curiosidades/mascotas/rss.xml" },
  { name: "Europa Press", url: "https://www.europapress.es/rss/rss.aspx?ch=00647" }
];

export default function NoticiasPage() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const allResults = await Promise.all(
          FEEDS.map(async (f) => {
            try {
              // Añadimos un timeout manual de 5 segundos por cada fuente
              const controller = new AbortController();
              const id = setTimeout(() => controller.abort(), 5000);

              const res = await fetch(
                `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(f.url)}`,
                { signal: controller.signal }
              );
              clearTimeout(id);

              const data = await res.json();
              if (data.status === "ok") {
                return data.items.map((i: any) => ({ ...i, source: f.name }));
              }
              return [];
            } catch (e) {
              console.warn(`Fallo en ${f.name}:`, e);
              return [];
            }
          })
        );

        const merged = allResults
          .flat()
          .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
          .slice(0, 20); // Solo las 20 mejores para no saturar

        setNews(merged);
      } catch (err) {
        console.error("Error crítico:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  if (loading) return <p style={{ padding: "1rem" }}>🐾 Buscando últimas noticias...</p>;

  return (
    <div style={{ padding: "1rem", maxWidth: "600px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <h2 style={{ fontSize: "1.2rem", borderBottom: "2px solid #eee", paddingBottom: "10px" }}>
        Actualidad Protectora
      </h2>
      
      {news.length === 0 ? (
        <p>No hay noticias recientes disponibles ahora mismo.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "15px" }}>
          {news.map((item, idx) => (
            <div key={idx} style={{ padding: "10px", border: "1px solid #f0f0f0", borderRadius: "8px" }}>
              <span style={{ fontSize: "0.65rem", fontWeight: "bold", color: "#e63946", textTransform: "uppercase" }}>
                {item.source}
              </span>
              <h3 style={{ margin: "5px 0", fontSize: "0.95rem" }}>
                <a href={item.link} target="_blank" rel="noreferrer" style={{ textDecoration: "none", color: "#333" }}>
                  {item.title}
                </a>
              </h3>
              <small style={{ color: "#999" }}>{new Date(item.pubDate).toLocaleDateString()}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
