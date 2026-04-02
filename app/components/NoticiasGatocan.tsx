"use client";
import { useState, useEffect } from 'react';

const FEEDS = [
  { name: 'La Voz de Galicia', url: 'https://www.lavozdegalicia.es/sociedad/index.xml' },
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
          const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(feed.url)}`);
          const data = await res.json();
          if (data?.contents) {
            const parser = new DOMParser();
            const xml = parser.parseFromString(data.contents, "text/xml");
            const items = Array.from(xml.querySelectorAll("item"));
            items.forEach(item => {
              const title = item.querySelector("title")?.textContent || "";
              const link = item.querySelector("link")?.textContent || "";
              let desc = item.querySelector("description")?.textContent || "";
              if (title && link) {
                allNews.push({
                  title,
                  link,
                  description: desc.replace(/<[^>]*>?/gm, '').substring(0, 160) + "...",
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

  const next = () => setCurrentIndex(i => (i + 1) % news.length);
  const prev = () => setCurrentIndex(i => (i - 1 + news.length) % news.length);

  if (loading) return <div className="p-10 text-center animate-pulse text-slate-500">Cargando últimas noticias...</div>;
  if (news.length === 0) return null;

  const current = news[currentIndex];

  return (
    <div className="relative group bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300">
      {/* Cabecera con fuente y contador */}
      <div className="flex justify-between items-center mb-4">
        <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          {current.source}
        </span>
        <span className="text-[10px] font-mono text-slate-400">
          {currentIndex + 1} / {news.length}
        </span>
      </div>

      {/* Contenido de la noticia */}
      <div key={currentIndex} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        <h3 className="text-slate-900 text-lg md:text-xl font-extrabold mb-3 leading-snug">
          {current.title}
        </h3>
        <p className="text-slate-600 text-sm md:text-base mb-6 leading-relaxed">
          {current.description}
        </p>
        
        <div className="flex items-center justify-between">
          <a 
            href={current.link} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center text-blue-600 font-bold text-sm hover:underline"
          >
            Leer noticia completa 
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </a>

          {/* Flechas integradas más pequeñas y estéticas */}
          <div className="flex gap-2">
            <button onClick={prev} className="p-2 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors text-slate-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            </button>
            <button onClick={next} className="p-2 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors text-slate-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
