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
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3500);
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
                .replace(/<[^>]*>?/gm, '').substring(0, 130) + "..."
            }));
          }
        } catch (e) { console.error(`Error en ${feed.name}`); }
        return [];
      });

      const results = await Promise.all(newsPromises);
      const combined = results.flat().sort(() => Math.random() - 0.5);
      setNews(combined);
      setLoading(false);
    }
    fetchAllNews();
  }, []);

  if (loading) return (
    <div className="p-12 text-center bg-white border border-slate-100 rounded-[2.5rem] shadow-xl">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Sincronizando...</p>
    </div>
  );

  if (news.length === 0) return null;
  const current = news[currentIndex];

  return (
    <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-xl flex flex-col justify-between min-h-[340px] relative overflow-hidden">
      
      {/* Adorno visual superior */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-blue-600 to-indigo-500" />

      <div>
        <div className="flex justify-between items-center mb-6">
          <span className="text-[11px] font-black text-white bg-blue-600 px-3 py-1 rounded-full shadow-sm">
            {current.source}
          </span>
          <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
            {currentIndex + 1} / {news.length}
          </span>
        </div>

        <h3 className="text-slate-900 font-extrabold text-xl md:text-2xl leading-tight mb-4 tracking-tight">
          {current.title}
        </h3>
        <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-6 opacity-90">
          {current.description}
        </p>
      </div>

      <div className="flex flex-col items-center gap-6 mt-4 pt-6 border-t border-slate-50">
        
        {/* Enlace centrado */}
        <a 
          href={current.link} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-600 font-black text-sm hover:text-blue-800 transition-all uppercase tracking-tighter flex items-center gap-2"
        >
          Ver noticia completa
          <span className="text-lg">↗</span>
        </a>
        
        {/* BOTONES CENTRADOS PARA MÓVIL (MÁXIMA ACCESIBILIDAD) */}
        <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100">
          <button 
            onClick={() => setCurrentIndex(i => (i - 1 + news.length) % news.length)} 
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-700 shadow-sm hover:bg-white hover:text-blue-600 active:scale-90 transition-all"
            aria-label="Anterior"
          >
            <span className="text-3xl leading-none">‹</span>
          </button>

          <div className="w-px h-6 bg-slate-200" />

          <button 
            onClick={() => setCurrentIndex(i => (i + 1) % news.length)} 
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-700 shadow-sm hover:bg-white hover:text-blue-600 active:scale-90 transition-all"
            aria-label="Siguiente"
          >
            <span className="text-3xl leading-none">›</span>
          </button>
        </div>
      </div>
    </div>
  );
}
