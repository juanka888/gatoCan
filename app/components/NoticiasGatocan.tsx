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
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        const promises = FEEDS.map(async (feed) => {
          try {
            const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(feed.url)}`);
            const json = await response.json();
            if (!json.contents) return [];

            const parser = new DOMParser();
            const doc = parser.parseFromString(json.contents, "text/xml");
            const items = Array.from(doc.querySelectorAll("item")).slice(0, 5);

            return items.map(item => ({
              title: item.querySelector("title")?.textContent || "Noticia sin título",
              link: item.querySelector("link")?.textContent || "#",
              source: feed.name,
              desc: (item.querySelector("description")?.textContent || "")
                .replace(/<[^>]*>?/gm, '').substring(0, 110) + "..."
            }));
          } catch (e) {
            return [];
          }
        });

        const allResults = await Promise.all(promises);
        const flatNews = allResults.flat().sort(() => Math.random() - 0.5);

        if (isMounted) {
          setNews(flatNews);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return <div className="p-10 text-center text-slate-400 animate-pulse border border-dashed rounded-3xl">Actualizando prensa...</div>;
  }

  if (news.length === 0) {
    return <div className="p-10 text-center text-slate-400 border rounded-3xl">No se han podido cargar las noticias. Reintenta en unos minutos.</div>;
  }

  const current = news[currentIndex];

  return (
    <div className="bg-white border border-slate-200 shadow-lg p-6 md:p-8" style={{ borderRadius: '24px', minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      
      <div>
        <div className="flex justify-between items-center mb-4">
          <span className="bg-blue-600 text-white font-bold px-3 py-1 rounded-full" style={{ fontSize: '10px', letterSpacing: '1px' }}>
            {current.source}
          </span>
          <span className="text-slate-400 font-mono" style={{ fontSize: '10px' }}>
            {currentIndex + 1} / {news.length}
          </span>
        </div>

        <h3 className="text-slate-900 font-extrabold text-lg md:text-xl leading-tight mb-3">
          {current.title}
        </h3>
        
        <p className="text-slate-600 text-sm leading-relaxed mb-6">
          {current.desc}
        </p>
      </div>

      <div className="pt-4 border-t border-slate-100 flex flex-col items-center gap-5">
        <a href={current.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold text-sm hover:underline">
          LEER NOTICIA COMPLETA ↗
        </a>

        <div className="flex gap-4">
          <button 
            onClick={() => setCurrentIndex(prev => (prev - 1 + news.length) % news.length)}
            className="w-12 h-12 flex items-center justify-center rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-90 transition-all shadow-sm"
          >
            <span style={{ fontSize: '24px', color: '#64748b' }}>‹</span>
          </button>
          <button 
            onClick={() => setCurrentIndex(prev => (prev + 1) % news.length)}
            className="w-12 h-12 flex items-center justify-center rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-90 transition-all shadow-sm"
          >
            <span style={{ fontSize: '24px', color: '#64748b' }}>›</span>
          </button>
        </div>
      </div>
    </div>
  );
}
