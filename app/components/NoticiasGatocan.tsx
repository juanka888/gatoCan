"use client";
import { useState, useEffect } from 'react';

const FEEDS = [
  { name: 'La Voz de Galicia', url: 'https://www.lavozdegalicia.es/sociedad/index.xml' }
  { name: 'La Región', url: 'https://www.laregion.es/rss/section/1' },
  { name: '20 Minutos Animales', url: 'https://www.20minutos.es/rss/animales/' },
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
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 4000);
          const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(feed.url)}`, { signal: controller.signal });
          clearTimeout(timeoutId);
          const data = await res.json();
          if (data?.contents) {
            const parser = new DOMParser();
            const xml = parser.parseFromString(data.contents, "text/xml");
            const items = Array.from(xml.querySelectorAll("item")).slice(0, 5);
            items.forEach(item => {
              const title = item.querySelector("title")?.textContent || "";
              const link = item.querySelector("link")?.textContent || "";
              let desc = item.querySelector("description")?.textContent || "";
              if (title && link) {
                allNews.push({
                  title, link,
                  description: desc.replace(/<[^>]*>?/gm, '').substring(0, 140) + "...",
                  source: feed.name
                });
              }
            });
          }
        } catch (err) { console.error(err); }
      }
      setNews(allNews);
      setLoading(false);
    }
    fetchNews();
  }, []);

  if (loading) return <div className="p-6 text-center text-slate-500 text-sm italic animate-pulse">Actualizando noticias gallegas...</div>;
  if (news.length === 0) return null;

  const current = news[currentIndex];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter bg-blue-50 px-2 py-0.5 rounded">
          {current.source}
        </span>
        <span className="text-[10px] font-mono text-slate-400">
          {currentIndex + 1} / {news.length}
        </span>
      </div>

      {/* Contenido */}
      <div key={currentIndex} className="animate-in fade-in duration-500">
        <h3 className="text-slate-900 text-base md:text-lg font-bold mb-2 leading-tight">
          {current.title}
        </h3>
        <p className="text-slate-600 text-xs md:text-sm mb-4 leading-relaxed line-clamp-3">
          {current.description}
        </p>
        
        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-50 pt-3">
          <a href={current.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold text-xs hover:underline">
            Leer más →
          </a>

          {/* Botones de navegación simples sin SVGs externos */}
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentIndex(i => (i - 1 + news.length) % news.length)} 
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 active:bg-slate-100"
            >
              ❮
            </button>
            <button 
              onClick={() => setCurrentIndex(i => (i + 1) % news.length)} 
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 active:bg-slate-100"
            >
              ❯
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
