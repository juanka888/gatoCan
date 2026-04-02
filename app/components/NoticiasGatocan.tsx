"use client";
import { useState, useEffect } from 'react';

const FEEDS = [
  { name: 'La Región', url: 'https://www.laregion.es/rss/},
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
              
              // --- Lógica para extraer imagen ---
              let imageUrl = null;
              
              // Intento 1: Buscar etiqueta <enclosure> (muy común)
              const enclosure = item.querySelector("enclosure");
              if (enclosure && enclosure.getAttribute("type")?.startsWith("image")) {
                imageUrl = enclosure.getAttribute("url");
              }
              
              // Intento 2: Buscar etiqueta <media:content> (formato de Europa Press)
              if (!imageUrl) {
                const mediaContent = item.querySelector("content[url]"); 
                if (mediaContent && mediaContent.getAttribute("url")) {
                  imageUrl = mediaContent.getAttribute("url");
                }
              }
              
              if (title && link) {
                allNews.push({
                  title, link, imageUrl,
                  description: desc.replace(/<[^>]*>?/gm, '').substring(0, 130) + "...",
                  source: feed.name
                });
              }
            });
          }
        } catch (err) { console.error(`Error cargando ${feed.name}: ${err}`); }
      }
      setNews(allNews);
      setLoading(false);
    }
    fetchNews();
  }, []);

  const next = () => setCurrentIndex(i => (i + 1) % news.length);
  const prev = () => setCurrentIndex(i => (i - 1 + news.length) % news.length);

  if (loading) return <div className="p-8 text-center text-slate-500 text-sm italic animate-pulse">Cargando actualidad local...</div>;
  if (news.length === 0) return null;

  const current = news[currentIndex];

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 relative group">
      
      {/* Header con fuente y contador */}
      <div className="flex justify-between items-center mb-6 border-b border-slate-50 pb-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></span>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {current.source}
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded">
          {currentIndex + 1} / {news.length}
        </span>
      </div>

      {/* Contenido Principal con Diseño Adaptable */}
      <div key={currentIndex} className="animate-in fade-in slide-in-from-bottom-2 duration-500 flex flex-col md:flex-row gap-6">
        
        {/* Columna de Imagen (solo si existe) */}
        {current.imageUrl && (
          <div className="md:w-1/3 flex-shrink-0">
            <img 
              src={current.imageUrl} 
              alt={current.title} 
              className="w-full h-48 md:h-full object-cover rounded-2xl shadow-inner border border-slate-100" 
              onError={(e) => (e.currentTarget.style.display = 'none')} // Ocultar si la imagen falla
            />
          </div>
        )}

        {/* Columna de Texto */}
        <div className={`flex flex-col justify-between ${current.imageUrl ? 'md:w-2/3' : 'w-full'}`}>
          <div>
            <h3 className="text-slate-950 text-xl md:text-2xl font-extrabold mb-3 leading-snug tracking-tight">
              {current.title}
            </h3>
            <p className="text-slate-600 text-sm md:text-base mb-6 leading-relaxed line-clamp-4 md:line-clamp-3">
              {current.description}
            </p>
          </div>
          
          {/* Footer del contenido: Enlace y Navegación */}
          <div className="flex items-center justify-between gap-4 border-t border-slate-50 pt-4 mt-auto">
            <a href={current.link} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-1.5 text-blue-600 font-bold text-sm hover:underline">
              Leer noticia completa
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </a>

            {/* Flechas de Navegación Mejoradas (SVG integrados) */}
            <div className="flex gap-2">
              <button onClick={prev} className="p-2.5 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-colors active:scale-95" title="Anterior">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button onClick={next} className="p-2.5 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-colors active:scale-95" title="Siguiente">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
