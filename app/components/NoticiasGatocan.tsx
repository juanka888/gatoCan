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
      
      // Lanzamos todas las peticiones a la vez (Paralelo)
      const newsPromises = FEEDS.map(async (feed) => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5 segundos máximo por fuente

          const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(feed.url)}`, {
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          
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
        } catch (e) {
          console.error(`Error en ${feed.name}`);
        }
        return [];
      });

      const results = await Promise.all(newsPromises);
      const combined = results.flat().sort(() => Math.random() - 0.5); // Mezcla total
      
      setNews(combined);
      setLoading(false);
    }
    fetchAllNews();
  }, []);

  if (loading) return (
    <div className="p-10 text-center bg-white border border-slate-100 rounded-3xl shadow-sm">
      <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
      <p className="text-slate-400 text-xs font-medium">Sincronizando prensa local...</p>
    </div>
  );

  if (news.length === 0) return null;

  const current = news[currentIndex];

  return (
    <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-shadow min-h-[280px] flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-5">
          <span className="text-[10px] font-extrabold text-blue-700 uppercase bg-blue-50 px-3 py-1 rounded-full tracking-wider">
            {current.source}
          </span>
          <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded">
            {currentIndex + 1} / {news.length}
          </span>
        </div>

        <h3 className="text-slate-900 font-bold text-lg md:text-xl leading-tight mb-3">
          {current.title}
        </h3>
        <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">
          {current.description}
        </p>
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-50">
        <a 
          href={current.link} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-600 font-bold text-xs hover:text-blue-800 transition-colors"
        >
          Leer noticia completa →
        </a>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setCurrentIndex(i => (i - 1 + news.length) % news.length)} 
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 active:scale-95 transition-all"
          >
            <span className="text-2xl leading-none" style={{ marginTop: '-4px' }}>‹</span>
          </button>
          <button 
            onClick={() => setCurrentIndex(i => (i + 1) % news.length)} 
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 active:scale-95 transition-all"
          >
            <span className="text-2xl leading-none" style={{ marginTop: '-4px' }}>›</span>
          </button>
        </div>
      </div>
    </div>
  );
}
