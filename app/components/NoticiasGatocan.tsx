"use client";
import { useState, useEffect } from 'react';

const FEEDS = [
  { name: 'La Región', url: 'https://www.laregion.es/rss' },
  { name: 'La Voz de Galicia', url: 'https://www.lavozdegalicia.es/sociedad/index.xml' },
  { name: '20 Minutos', url: 'https://www.20minutos.es/rss/animales/' },
  { name: 'Europa Press', url: 'https://www.europapress.es/rss/rss.aspx?ch=00066' }
];

const WHITE_LIST = ['gato', 'animal', 'perro', 'mascota', 'ourense', 'galicia', 'protectora', 'felino', 'adopta'];

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
          const proxy = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(feed.url)}`;
          const response = await fetch(proxy);
          const xmlText = await response.text();
          const parser = new DOMParser();
          const xml = parser.parseFromString(xmlText, "text/xml");
          const items = Array.from(xml.querySelectorAll("item")).slice(0, 15);

          items.forEach(item => {
            const title = item.querySelector("title")?.textContent || "";
            const link = item.querySelector("link")?.textContent || "";
            const rawDesc = item.querySelector("description")?.textContent || "";
            const cleanDesc = rawDesc.replace(/<[^>]*>?/gm, '');

            const isRelevant = WHITE_LIST.some(word => 
              title.toLowerCase().includes(word) || cleanDesc.toLowerCase().includes(word)
            );

            if (title && link && isRelevant) {
              allItems.push({
                title, link, source: feed.name,
                desc: cleanDesc.substring(0, 250) + "..."
              });
            }
          });
        } catch (e) { console.log("Error en:", feed.name); }
      }
      setNews(allItems.sort(() => Math.random() - 0.5));
      setLoading(false);
    }
    loadNews();
  }, []);

  if (loading) return (
    <div style={{padding: '40px', textAlign: 'center', background: 'white', borderRadius: '24px', border: '1px solid #eee'}}>
      <p style={{color: '#666', fontSize: '14px'}}>Sincronizando actualidad...</p>
    </div>
  );

  if (news.length === 0) return null;
  const current = news[currentIndex];

  return (
    <div style={{
      background: 'white',
      border: '1px solid #e2e8f0',
      borderRadius: '24px',
      padding: '20px 24px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      fontFamily: 'sans-serif',
      maxWidth: '500px' // Ajusta esto según tu diseño
    }}>
      {/* Cabecera optimizada */}
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          <span style={{background: '#2563eb', color: 'white', fontSize: '9px', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold', letterSpacing: '0.5px'}}>
            ACTUALIDAD
          </span>
          <span style={{fontSize: '11px', color: '#64748b', fontWeight: '600'}}>
            • {current.source}
          </span>
        </div>
        <span style={{color: '#cbd5e1', fontSize: '10px', fontWeight: 'bold'}}>{currentIndex + 1}/{news.length}</span>
      </div>

      {/* Cuerpo de la noticia */}
      <h3 style={{fontSize: '17px', color: '#0f172a', margin: '0 0 8px 0', lineHeight: '1.3', fontWeight: '800'}}>
        {current.title}
      </h3>
      <p style={{fontSize: '13.5px', color: '#475569', lineHeight: '1.4', margin: '0 0 16px 0'}}>
        {current.desc}
      </p>

      {/* Navegación y Leer más en una sola fila */}
      <div style={{
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingTop: '12px', 
        borderTop: '1px solid #f1f5f9'
      }}>
        {/* Leer más a la izquierda */}
        <a href={current.link} target="_blank" rel="noopener noreferrer" style={{
          color: '#2563eb', 
          textDecoration: 'none', 
          fontWeight: 'bold', 
          fontSize: '12px'
        }}>
          LEER MÁS ↗
        </a>
        
        {/* Botones compactos a la derecha */}
        <div style={{display: 'flex', gap: '8px'}}>
          <button 
            onClick={() => setCurrentIndex(i => (i - 1 + news.length) % news.length)} 
            style={{width: '36px', height: '36px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b'}}
          >‹</button>
          <button 
            onClick={() => setCurrentIndex(i => (i + 1) % news.length)} 
            style={{width: '36px', height: '36px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b'}}
          >›</button>
        </div>
      </div>
    </div>
  );
        }
        
