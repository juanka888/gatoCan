"use client";
import { useState, useEffect } from 'react';

const FEEDS = [
  { name: 'La Región', url: 'https://www.laregion.es/rss' },
  { name: 'La Voz de Galicia', url: 'https://www.lavoz degalicia.es/sociedad/index.xml' },
  { name: '20 Minutos', url: 'https://www.20minutos.es/rss/animales/' },
  { name: 'Europa Press', url: 'https://www.europapress.es/rss/rss.aspx?ch=00066' }
];

export default function NoticiasGatocan() {
  const [news, setNews] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        let results: any[] = [];
        
        for (const feed of FEEDS) {
          try {
            const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(feed.url)}`);
            const data = await res.json();
            if (data?.contents) {
              const parser = new DOMParser();
              const xml = parser.parseFromString(data.contents, "text/xml");
              const items = Array.from(xml.querySelectorAll("item")).slice(0, 5);
              
              items.forEach(item => {
                results.push({
                  title: item.querySelector("title")?.textContent || "",
                  link: item.querySelector("link")?.textContent || "",
                  source: feed.name,
                  description: (item.querySelector("description")?.textContent || "").replace(/<[^>]*>?/gm, '').substring(0, 100) + "..."
                });
              });
            }
          } catch (e) { console.error("Error en fuente"); }
        }
        setNews(results);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div style={{padding: '20px', textAlign: 'center'}}>Cargando prensa...</div>;
  if (news.length === 0) return <div style={{padding: '20px', textAlign: 'center'}}>No hay noticias disponibles.</div>;

  const current = news[currentIndex];

  return (
    <div style={{
      background: 'white',
      border: '2px solid #f1f5f9',
      borderRadius: '20px',
      padding: '20px',
      fontFamily: 'sans-serif',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
    }}>
      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
        <span style={{fontSize: '10px', fontWeight: 'bold', color: '#2563eb', textTransform: 'uppercase'}}>{current.source}</span>
        <span style={{fontSize: '10px', color: '#94a3b8'}}>{currentIndex + 1} / {news.length}</span>
      </div>

      <h3 style={{fontSize: '16px', margin: '0 0 10px 0', color: '#1e293b'}}>{current.title}</h3>
      <p style={{fontSize: '13px', color: '#64748b', lineHeight: '1.4'}}>{current.description}</p>

      <div style={{marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #f1f5f9', textAlign: 'center'}}>
        <a href={current.link} target="_blank" rel="noopener noreferrer" style={{color: '#2563eb', fontSize: '12px', fontWeight: 'bold', textDecoration: 'none', display: 'block', marginBottom: '15px'}}>
          LEER NOTICIA COMPLETA ↗
        </a>

        <div style={{display: 'flex', justifyContent: 'center', gap: '20px'}}>
          <button 
            onClick={() => setCurrentIndex(i => (i - 1 + news.length) % news.length)}
            style={{width: '45px', height: '45px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: '20px'}}
          >
            ‹
          </button>
          <button 
            onClick={() => setCurrentIndex(i => (i + 1) % news.length)}
            style={{width: '45px', height: '45px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: '20px'}}
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
  }
