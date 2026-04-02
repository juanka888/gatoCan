"use client";
import { useState, useEffect } from 'react';

const FEEDS = [
  { name: 'La Región', url: 'https://www.laregion.es/rss' },
  { name: 'La Voz de Galicia', url: 'https://www.lavozdegalicia.es/sociedad/index.xml' },
  { name: '20 Minutos', url: 'https://www.20minutos.es/rss/animales/' },
  { name: 'Europa Press', url: 'https://www.europapress.es/rss/rss.aspx?ch=00066' }
];

// Lista de proxies para rotar si uno falla
const PROXIES = [
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
];

const WHITE_LIST = ['gato', 'felino', 'animal', 'protectora', 'mascota', 'perro', 'ourense', 'galicia', 'adopta', 'esteriliza', 'colonia', 'canino'];

export default function NoticiasGatocan() {
  const [news, setNews] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWithFallback(feedUrl: string) {
      // Intenta con cada proxy hasta que uno funcione
      for (const proxyFn of PROXIES) {
        try {
          const res = await fetch(proxyFn(feedUrl));
          const data = await res.json();
          // AllOrigins devuelve la respuesta en .contents, otros directamente el texto
          const xmlText = data.contents ? data.contents : await (await fetch(proxyFn(feedUrl))).text();
          
          if (xmlText && xmlText.includes('<item>')) return xmlText;
        } catch (e) { continue; }
      }
      return null;
    }

    async function loadAll() {
      setLoading(true);
      let allItems: any[] = [];

      for (const feed of FEEDS) {
        const xmlText = await fetchWithFallback(feed.url);
        if (xmlText) {
          const parser = new DOMParser();
          const xml = parser.parseFromString(xmlText, "text/xml");
          const items = Array.from(xml.querySelectorAll("item")).slice(0, 15);

          items.forEach(item => {
            const title = item.querySelector("title")?.textContent || "";
            const link = item.querySelector("link")?.textContent || "";
            const rawDesc = item.querySelector("description")?.textContent || "";
            const cleanDesc = rawDesc.replace(/<[^>]*>?/gm, '');

            const matches = WHITE_LIST.some(word => 
              title.toLowerCase().includes(word) || cleanDesc.toLowerCase().includes(word)
            );

            if (title && link && matches) {
              allItems.push({
                title, link, source: feed.name,
                desc: cleanDesc.substring(0, 250) + "..." // Resumen generoso
              });
            }
          });
        }
      }
      setNews(allItems.sort(() => Math.random() - 0.5));
      setLoading(false);
    }
    loadAll();
  }, []);

  if (loading) return <div style={{padding: '40px', textAlign: 'center', color: '#666', fontStyle: 'italic'}}>Buscando noticias de interés...</div>;
  if (news.length === 0) return null;

  const current = news[currentIndex];

  return (
    <div style={{
      background: 'white', border: '1px solid #ddd', borderRadius: '28px',
      padding: '30px', boxShadow: '0 10px 25px rgba(0,0,0,0.07)',
      fontFamily: 'sans-serif', minHeight: '320px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
    }}>
      <div>
        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '15px'}}>
          <span style={{background: '#2563eb', color: 'white', fontSize: '10px', padding: '4px 12px', borderRadius: '10px', fontWeight: '900', textTransform: 'uppercase'}}>{current.source}</span>
          <span style={{color: '#999', fontSize: '11px', fontWeight: 'bold'}}>{currentIndex + 1} / {news.length}</span>
        </div>

        <h3 style={{fontSize: '20px', color: '#111', margin: '0 0 12px 0', lineHeight: '1.2', fontWeight: '800'}}>{current.title}</h3>
        <p style={{fontSize: '15px', color: '#444', lineHeight: '1.6', margin: '0 0 20px 0'}}>{current.desc}</p>
      </div>

      <div style={{textAlign: 'center', borderTop: '1px solid #f0f0f0', paddingTop: '20px'}}>
        <a href={current.link} target="_blank" rel="noopener noreferrer" style={{color: '#2563eb', textDecoration: 'none', fontWeight: '800', fontSize: '13px'}}>LEER NOTICIA COMPLETA ↗</a>
        
        <div style={{display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px'}}>
          <button onClick={() => setCurrentIndex(i => (i - 1 + news.length) % news.length)} style={{width: '50px', height: '50px', borderRadius: '50%', border: '1px solid #eee', background: '#f9f9f9', cursor: 'pointer', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>‹</button>
          <button onClick={() => setCurrentIndex(i => (i + 1) % news.length)} style={{width: '50px', height: '50px', borderRadius: '50%', border: '1px solid #eee', background: '#f9f9f9', cursor: 'pointer', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>›</button>
        </div>
      </div>
    </div>
  );
      }
