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
          // Ponemos un tiempo límite de 5 segundos por fuente
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(feed.url)}`, {
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          const data = await res.json();
          
          if (data?.contents) {
            const parser = new DOMParser();
            const xml = parser.parseFromString(data.contents, "text/xml");
            const items = Array.from(xml.querySelectorAll("item")).slice(0, 5); // Cogemos las 5 últimas de cada uno

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
        } catch (err) {
          console.error(`Fallo en ${feed.name}:`, err);
          // Si una fuente falla, seguimos con la siguiente sin bloquear el componente
        }
      }

      setNews(allNews);
      setLoading(false);
    }

    fetchNews();
  }, []);

  const next = () => setCurrentIndex(i => (i + 1) % news.length);
  const prev = () => setCurrentIndex(i => (i - 1 + news.length) % news.length);

  // Si está cargando
  if (loading) return (
    <div className="p-10 text-center bg-white border border-slate-200 rounded-3xl shadow-sm">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse text-sm">Conectando con periódicos gallegos...</p>
      </div>
    </div>
  );

  // Si después de cargar no hay nada (error total de conexión)
  if (news.length === 0) return (
    <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-3xl">
      <p className="text-slate-400 text-sm">No se han podido cargar las noticias. Revisa tu conexión.</p>
    </div>
  );

  const current = news[currentIndex];

  return (
    <div className="relative bg-white border border-slate-200 rounded-[32px] p-6 md:p-8 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
          {current.source}
        </span>
        <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded">
          {currentIndex + 1} / {news.length}
        </span>
      </div>

      <div key={currentIndex} className="min-h-[140px]">
        <h3 className="text-slate-900 text-lg md:text-xl font-bold mb-3 leading-snug">
          {current.title}
        </h3>
        <p className="text-slate-600 text-sm md:text-base mb-8 leading-relaxed line-clamp-3">
          {current.description}
        </p>
        
        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
          <a href={current.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-1">
            Leer noticia completa
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </a>

          <div className="flex gap-2">
            <button onClick={prev} className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all text-slate-400 hover:text-slate-900">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            </button>
            <button onClick={next} className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all text-slate-400 hover:text-slate-900">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
