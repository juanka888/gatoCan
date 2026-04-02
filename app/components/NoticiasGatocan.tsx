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
    async function loadNews() {
      setLoading(true);
      const allItems: any[] = [];

      for (const feed of FEEDS) {
        try {
          // Usamos CodeTabs como proxy alternativo
          const proxy = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(feed.url)}`;
          const response = await fetch(proxy);
          const xmlText = await response.text();
          
          const parser = new DOMParser();
          const xml = parser.parseFromString(xmlText, "text/xml");
          const items = Array.from(xml.querySelectorAll("item")).slice(0, 5);

          items.forEach(item => {
            const title = item.querySelector("title")?.textContent;
            const link = item.querySelector("link")?.textContent;
            if (title && link) {
              allItems.push({
                title,
                link,
                source: feed.name,
                desc: (item.querySelector("description")?.textContent || "").replace(/<[^>]*>?/gm, '').substring(0, 100) + "..."
              });
            }
          });
        } catch (e) {
          console.log("Error en:", feed.name);
        }
      }

      setNews(allItems.sort(() => Math.random() - 0.5));
      setLoading(false);
    }
    loadNews();
  }, []);

  if (loading) return (
    <div style={{padding: '40px', textAlign: 'center', background: 'white', borderRadius: '20px', border: '1px solid #eee'}}>
      <p style={{color: '#666', fontSize: '14px'}}>Buscando noticias frescas...</p>
    </div>
  );

  if (news.length === 0) return (
    <div style={{padding: '40px', textAlign: 'center', background: '#fffafa', borderRadius: '20px', border: '1px solid #ffdada'}}>
      <p style={{color: '#c00', fontSize: '14px', fontWeight: 'bold'}}>No pudimos conectar con los periódicos.</p>
      <button onClick={() => window.location.reload()} style={{marginTop: '10px', padding: '8px 15px', borderRadius: '8px', border: 'none', background: '#c00', color: 'white', cursor: 'pointer'}}>Reintentar</button>
    </div>
  );

  const current = news[currentIndex];

  return (
    <div style={{
      background: 'white',
      border: '1px solid #ddd',
      borderRadius: '24px',
      padding: '24px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      fontFamily: 'sans-serif'
    }}>
      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '15px'}}>
        <span style={{background: '#2563eb', color: 'white', fontSize: '10px', padding: '3px 8px', borderRadius: '5px', fontWeight: 'bold'}}>{current.source}</span>
        <span style={{color: '#999', fontSize: '11px'}}>{currentIndex + 1} / {news.length}</span>
      </div>

      <h3 style={{fontSize: '18px', color: '#111', margin: '0 0 10px 0', lineHeight: '1.3'}}>{current.title}</h3>
      <p style={{fontSize: '14px', color: '#555', lineHeight: '1.4', margin: '0 0 20px 0'}}>{current.desc}</p>

      <div style={{textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '20px'}}>
        <a href={current.link} target="_blank" rel="noopener noreferrer" style={{color: '#2563eb', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px'}}>LEER COMPLETA ↗</a>
        
        <div style={{display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px'}}>
          <button onClick={() => setCurrentIndex(i => (i - 1 + news.length) % news.length)} style={{width: '50px', height: '50px', borderRadius: '50%', border: '1px solid #ccc', background: 'white', cursor: 'pointer', fontSize: '20px'}}>‹</button>
          <button onClick={() => setCurrentIndex(i => (i + 1) % news.length)} style={{width: '50px', height: '50px', borderRadius: '50%', border: '1px solid #ccc', background: 'white', cursor: 'pointer', fontSize: '20px'}}>›</button>
        </div>
      </div>
    </div>
  );
    }
