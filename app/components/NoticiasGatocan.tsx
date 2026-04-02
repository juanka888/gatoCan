"use client";
import { useState, useEffect } from 'react';

const FEEDS = [
  { name: 'La Región', url: 'https://www.laregion.es/rss' }, // URL Corregida
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
          const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 segundos por fuente

          const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(feed.url)}`, {
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          
          const data = await res.json();
          if (data?.contents) {
            const parser = new DOMParser();
            const xml = parser.parseFromString(data.contents, "text/xml");
            // Cogemos hasta 8 de cada fuente para tener más variedad
            const items = Array.from(xml.querySelectorAll("item")).slice(0, 8);

            items.forEach(item => {
              const title = item.querySelector("title")?.textContent || "";
              const link = item.querySelector("link")?.textContent || "";
              const desc = item.querySelector("description")?.textContent || "";
              
              // Buscador de imagen mejorado
              let imageUrl = "";
              const media = item.getElementsByTagName("media:content")[0] || item.getElementsByTagName("content")[0];
              if (media) imageUrl = media.getAttribute("url") || "";
              
              if (!imageUrl) {
                const enc = item.querySelector("enclosure");
                if (enc && enc.getAttribute("type")?.includes("image")) imageUrl = enc.getAttribute("url") || "";
              }

              if (title && link) {
                allNews.push({
                  title, link, imageUrl,
                  source: feed.name,
                  description: desc.replace(/<[^>]*>?/gm, '').substring(0, 130) + "..."
                });
              }
            });
          }
        } catch (e) {
          console.error(`Fallo en: ${feed.name}`);
        }
      }

      // IMPORTANTE: Mezclamos las noticias de todos los periódicos
      // Así no salen todas las de Europa Press juntas al principio
      const shuffledNews = allNews.sort(() => Math.random() - 0.5);
      
      setNews(shuffledNews);
      setLoading(false);
    }
    fetchNews();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500 italic animate-pulse text-sm">Conectando con la actualidad gallega...</div>;
  if (news.length === 0) return null;

  const current = news[currentIndex];

  return (
    <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm flex flex-col justify-between min-h-[320px]">
      <div>
        <div className="flex justify-between items-center mb-5">
          <span className="text-[10px] font-black text-blue-600 uppercase bg-blue-50 px-2.5 py-1 rounded-full tracking-wider">
            {current.source}
          </span>
          <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded">
            {currentIndex + 1} / {news.length}
          </span>
        </div>

        <div className="flex flex-col md:flex-row gap-5">
          {current.imageUrl && (
            <div className="w-full md:w-28 h-28 flex-shrink-0">
              <img 
                src={current.imageUrl} 
                className="w-full h-full object-cover rounded-2xl border border-slate-100" 
                alt="Miniatura"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-slate-900 font-bold text-base md:text-lg leading-tight mb-2">
              {current.title}
            </h3>
            <p className="text-slate-500 text-xs md:text-sm leading-relaxed">
              {current.description}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-50">
        <a href={current.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold text-xs hover:underline flex items-center gap-1">
          Leer noticia completa
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </a>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setCurrentIndex(i => (i - 1 + news.length) % news.length)} 
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 active:scale-90 transition-all"
          >
            ❮
          </button>
          <button 
            onClick={() => setCurrentIndex(i => (i + 1) % news.length)} 
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 active:scale-90 transition-all"
          >
            ❯
          </button>
        </div>
      </div>
    </div>
  );
}
