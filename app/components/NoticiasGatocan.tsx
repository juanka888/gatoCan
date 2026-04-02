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
    async function fetchNews() {
      setLoading(true);
      let allNews: any[] = [];

      for (const feed of FEEDS) {
        try {
          // Cambiamos AllOrigins por CORSProxy.io que es más ligero
          const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(feed.url)}`;
          const res = await fetch(proxyUrl);
          const text = await res.text(); // Leemos como texto primero

          if (text) {
            const parser = new DOMParser();
            const xml = parser.parseFromString(text, "text/xml");
            const items = Array.from(xml.querySelectorAll("item")).slice(0, 5);

            items.forEach(item => {
              const title = item.querySelector("title")?.textContent || "";
              const link = item.querySelector("link")?.textContent || "";
              const desc = item.querySelector("description")?.textContent || "";

              if (title && link) {
                allNews.push({
                  title,
                  link,
                  source: feed.name,
                  description: desc.replace(/<[^>]*>?/gm, '').substring(0, 120) + "..."
                });
              }
            });
          }
        } catch (err) {
          console.warn(`Error en ${feed.name}, saltando fuente...`);
        }
      }

      if (allNews.length > 0) {
        setNews(allNews.sort(() => Math.random() - 0.5));
      }
      setLoading(false);
    }
    fetchNews();
  }, []);

  if (loading) return (
    <div style={{padding: '30px', textAlign: 'center', background: '#fff', borderRadius: '24px', border: '1px solid #eee', color: '#888'}}>
      <div className="animate-pulse">Actualizando prensa...</div>
    </div>
  );

  if (news.length === 0) return (
    <div style={{padding: '30px', textAlign: 'center', background: '#fff', borderRadius: '24px', border: '1px solid #fee2e2', color: '#b91c1c'}}>
      No se han podido conectar las noticias. Revisa la conexión.
    </div>
  );

  const current = news[currentIndex];

  return (
    <div style={{
      background: 'white',
      border: '1px solid #e2e8f0',
      borderRadius: '24px',
      padding: '24px',
      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
      minHeight: '280px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      fontFamily: 'sans-serif'
    }}>
      <div>
        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '15px'}}>
          <span style={{fontSize: '10px', fontWeight: 'bold', color: '#2563eb', background: '#eff6ff', padding: '3px 10px', borderRadius: '10px'}}>{current.source}</span>
          <span style={{fontSize: '10px', color: '#94a3b8'}}>{currentIndex + 1} / {news.length}</span>
        </div>
        <h3 style={{fontSize: '18px', fontWeight: '800', color: '#1e293b', margin: '0 0 10px 0', lineHeight: '1.3'}}>{current.title}</h3>
        <p style={{fontSize: '14px', color: '#64748b', lineHeight: '1.5'}}>{current.description}</p>
      </div>

      <div style={{marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #f1f5f9', textAlign: 'center'}}>
        <a href={current.link} target="_blank" rel="noopener noreferrer" style={{color: '#2563eb', fontWeight: 'bold', fontSize: '13px', textDecoration: 'none', display: 'block', marginBottom: '20px'}}>
          LEER NOTICIA COMPLETA ↗
        </a>

        <div style={{display: 'flex', justifyContent: 'center', gap: '15px'}}>
          <button 
            onClick={() => setCurrentIndex(i => (i - 1 + news.length) % news.length)}
            style={{width: '45px', height: '45px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: '20px'}}
          >‹</button>
          <button 
            onClick={() => setCurrentIndex(i => (i + 1) % news.length)}
            style={{width: '45px', height: '45px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: '20px'}}
          >›</button>
        </div>
      </div>
    </div>
  );
}
