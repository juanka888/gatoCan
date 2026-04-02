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
          const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(feed.url)}`);
          const data = await res.json();
          if (data?.contents) {
            const parser = new DOMParser();
            const xml = parser.parseFromString(data.contents, "text/xml");
            const items = Array.from(xml.querySelectorAll("item")).slice(0, 5);

            items.forEach(item => {
              const title = item.querySelector("title")?.textContent || "";
              const link = item.querySelector("link")?.textContent || "";
              const desc = item.querySelector("description")?.textContent || "";
              
              if (title && link) {
                allNews.push({
                  title, link,
                  source: feed.name,
                  description: desc.replace(/<[^>]*>?/gm, '').substring(0, 130) + "..."
                });
              }
            });
          }
        } catch (e) { console.error("Error en fuente:", feed.name); }
      }
      // Mezclamos para que no salga solo un periódico
      setNews(allNews.sort(() => Math.random() - 0.5));
      setLoading(false);
    }
    fetchNews();
  }, []);

  if (loading) return <div className="p-4 text-center text-slate-400 text-xs animate-pulse">Cargando prensa...</div>;
  if (news.length === 0) return null;

  const current = news[currentIndex];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm min-h-[220px] flex flex-col justify-between text-left">
      <div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-[10px] font-bold text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded">
            {current.source}
          </span>
          <span className="text-[10px] font-mono text-slate-400">{currentIndex + 1} / {news.length}</span>
        </div>

        <h3 className="text-slate-900 font-bold text-base leading-tight mb-2">
          {current.title}
        </h3>
        <p className="text-slate-600 text-xs leading-relaxed line-clamp-3">
          {current.description}
        </p>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
        <a href={current.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold text-[11px] hover:underline">
          Leer noticia completa
        </a>
        
        {/* BOTONES DE TEXTO PURO: No pueden hacerse gigantes */}
        <div className="flex gap-2">
          <button 
            onClick={() => setCurrentIndex(i => (i - 1 + news.length) % news.length)} 
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 bg-white hover:bg-slate-50"
          >
            <span style={{ fontSize: '18px', lineHeight: '0' }}>‹</span>
          </button>
          <button 
            onClick={() => setCurrentIndex(i => (i + 1) % news.length)} 
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 bg-white hover:bg-slate-50"
          >
            <span style={{ fontSize: '18px', lineHeight: '0' }}>›</span>
          </button>
        </div>
      </div>
    </div>
  );
}
