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
  const [status, setStatus] = useState<'loading' | 'error' | 'ready'>('loading');

  useEffect(() => {
    async function load() {
      try {
        setStatus('loading');
        const allResults: any[] = [];

        // Usamos una técnica más conservadora: una por una
        for (const feed of FEEDS) {
          try {
            const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(feed.url)}`);
            const data = await res.json();
            
            if (data && data.contents) {
              const parser = new DOMParser();
              const xml = parser.parseFromString(data.contents, "text/xml");
              const items = Array.from(xml.querySelectorAll("item")).slice(0, 4);

              items.forEach(item => {
                const title = item.querySelector("title")?.textContent || "";
                if (title) {
                  allResults.push({
                    title: title,
                    link: item.querySelector("link")?.textContent || "#",
                    source: feed.name,
                    desc: (item.querySelector("description")?.textContent || "").replace(/<[^>]*>?/gm, '').substring(0, 100) + "..."
                  });
                }
              });
            }
          } catch (e) { console.warn("Fallo en una fuente"); }
        }

        if (allResults.length > 0) {
          setNews(allResults.sort(() => Math.random() - 0.5));
          setStatus('ready');
        } else {
          setStatus('error');
        }
      } catch (err) {
        setStatus('error');
      }
    }
    load();
  }, []);

  // --- RENDERIZADO SEGURO ---

  // 1. Estado de carga
  if (status === 'loading') {
    return <div style={{padding: '40px', textAlign: 'center', background: '#f8fafc', borderRadius: '24px', border: '1px solid #e2e8f0', color: '#64748b'}}>Cargando prensa local...</div>;
  }

  // 2. Estado de error (Si el servidor nos bloquea)
  if (status === 'error' || news.length === 0) {
    return (
      <div style={{padding: '40px', textAlign: 'center', background: '#fff1f2', borderRadius: '24px', border: '1px solid #fecaca', color: '#b91c1c'}}>
        <p style={{fontWeight: 'bold', margin: 0}}>Pausa temporal</p>
        <p style={{fontSize: '12px', marginTop: '8px'}}>El servidor de noticias está descansando. Prueba a refrescar en 2 minutos.</p>
      </div>
    );
  }

  // 3. Estado normal
  const current = news[currentIndex];

  return (
    <div style={{
      background: 'white',
      border: '1px solid #e2e8f0',
      borderRadius: '28px',
      padding: '24px',
      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '16px'}}>
        <span style={{fontSize: '10px', fontWeight: '900', color: '#2563eb', textTransform: 'uppercase', background: '#eff6ff', padding: '4px 10px', borderRadius: '10px'}}>{current.source}</span>
        <span style={{fontSize: '10px', color: '#94a3b8', fontWeight: 'bold'}}>{currentIndex + 1} / {news.length}</span>
      </div>

      <h3 style={{fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '0 0 10px 0', lineHeight: '1.2'}}>{current.title}</h3>
      <p style={{fontSize: '14px', color: '#475569', lineHeight: '1.5', margin: '0 0 20px 0'}}>{current.desc}</p>

      <div style={{textAlign: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '20px'}}>
        <a href={current.link} target="_blank" rel="noopener noreferrer" style={{color: '#2563eb', fontWeight: 'bold', fontSize: '13px', textDecoration: 'none'}}>LEER NOTICIA ↗</a>
        
        <div style={{display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '20px'}}>
          <button onClick={() => setCurrentIndex(i => (i - 1 + news.length) % news.length)} style={{width: '48px', height: '48px', borderRadius: '14px', border: '1px solid #e2e8f0', background: 'white', fontSize: '20px', cursor: 'pointer'}}>‹</button>
          <button onClick={() => setCurrentIndex(i => (i + 1) % news.length)} style={{width: '48px', height: '48px', borderRadius: '14px', border: '1px solid #e2e8f0', background: 'white', fontSize: '20px', cursor: 'pointer'}}>›</button>
        </div>
      </div>
    </div>
  );
}
