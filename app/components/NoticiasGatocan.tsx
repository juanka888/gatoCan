"use client";
import { useState, useEffect } from 'react';

const FEEDS = [
  { name: 'La Región', url: 'https://www.laregion.es/rss' },
  { name: 'La Voz de Galicia', url: 'https://www.lavozdegalicia.es/sociedad/index.xml' },
  { name: '20 Minutos', url: 'https://www.20minutos.es/rss/animales/' },
  { name: 'Europa Press', url: 'https://www.europapress.es/rss/rss.aspx?ch=00066' }
];

export default function NoticiasGatocan() {
  const [news, setNews] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllNews() {
      setLoading(true);
      const newsPromises = FEEDS.map(async (feed) => {
        try {
          const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(feed.url)}`);
          const data = await res.json();
          if (data?.contents) {
            const parser = new DOMParser();
            const xml = parser.parseFromString(data.contents, "text/xml");
            return Array.from(xml.querySelectorAll("item")).slice(0, 6).map(item => ({
              title: item.querySelector("title")?.textContent || "",
              link: item.querySelector("link")?.textContent || "",
              source: feed.name,
              description: (item.querySelector("description")?.textContent || "")
                .replace(/<[^>]*>?/gm, '').substring(0, 120) + "..."
            }));
          }
        } catch (e) { console.error(e); }
        return [];
      });
      const results = await Promise.all(newsPromises);
      const combined = results.flat().sort(() => Math.random() - 0.5);
      setNews(combined);
      setLoading(false);
    }
    fetchAllNews();
  }, []);

  if (loading) return <div style={{padding: '40px', textAlign: 'center', color: '#64748b'}}>Cargando noticias...</div>;
  if (news.length === 0) return null;

  const current = news[currentIndex];

  return (
    <div className="noticias-container">
      <style>{`
        .noticias-container {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 24px;
          padding: 24px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          min-height: 300px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          font-family: sans-serif;
          position: relative;
          overflow: hidden;
        }
        .noticias-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .source-tag {
          background: #2563eb;
          color: white;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 12px;
        }
        .counter {
          font-size: 10px;
          color: #94a3b8;
          background: #f1f5f9;
          padding: 2px 8px;
          border-radius: 6px;
        }
        .noticias-title {
          color: #0f172a;
          font-size: 1.25rem;
          font-weight: 800;
          line-height: 1.2;
          margin: 0 0 12px 0;
        }
        .noticias-desc {
          color: #475569;
          font-size: 0.95rem;
          line-height: 1.5;
        }
        .noticias-footer {
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid #f1f5f9;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .read-more {
          color: #2563eb;
          font-weight: 700;
          text-decoration: none;
          font-size: 13px;
        }
        .nav-buttons {
          display: flex;
          gap: 10px;
          align-items: center;
          background: #f8fafc;
          padding: 6px;
          border-radius: 16px;
        }
        .btn-nav {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background: white;
          color: #334155;
          font-size: 24px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .btn-nav:active {
          transform: scale(0.9);
          background: #f1f5f9;
        }
      `}</style>

      <div className="noticias-content">
        <div className="noticias-header">
          <span className="source-tag">{current.source}</span>
          <span className="counter">{currentIndex + 1} / {news.length}</span>
        </div>

        <h3 className="noticias-title">{current.title}</h3>
        <p className="noticias-desc">{current.description}</p>
      </div>

      <div className="noticias-footer">
        <a href={current.link} target="_blank" rel="noopener noreferrer" className="read-more">
          LEER NOTICIA COMPLETA ↗
        </a>

        <div className="nav-buttons">
          <button className="btn-nav" onClick={() => setCurrentIndex(i => (i - 1 + news.length) % news.length)}>‹</button>
          <button className="btn-nav" onClick={() => setCurrentIndex(i => (i + 1) % news.length)}>›</button>
        </div>
      </div>
    </div>
  );
}
