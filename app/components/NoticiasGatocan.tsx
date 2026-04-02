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
            const items = Array.from(xml.querySelectorAll("item")).slice(0, 8);

            items.forEach(item => {
              const title = item.querySelector("title")?.textContent || "";
              const link = item.querySelector("link")?.textContent || "";
              const desc = item.querySelector("description")?.textContent || "";
              
              // Buscador de imagen simplificado para evitar errores
              let img = "";
              try {
                const media = item.getElementsByTagName("media:content")[0] || item.getElementsByTagName("enclosure")[0];
                if (media) img = media.getAttribute("url") || "";
              } catch (e) { img = ""; }

              if (title && link) {
                allNews.push({
                  title, link, img,
                  source: feed.name,
                  description: desc.replace(/<[^>]*>?/gm, '').substring(0, 120) + "..."
                });
              }
            });
          }
        } catch (e) { console.error("Error en feed"); }
      }
      // MEZCLA ALEATORIA PARA QUE NO SALGA SOLO EUROPA PRESS
      setNews(allNews.sort(() => Math.random() - 0.5));
      setLoading(false);
    }
    fetchNews();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-400 animate-pulse text-sm">Actualizando prensa...</div>;
  if (news.length === 0) return null;

  const current = news[currentIndex];

  return (
    <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-md flex flex-col justify-between min-h-[350px]">
      <div>
        <div className="flex justify-between items-center mb-5">
          <span className="text-[10px] font-bold text-blue-600 uppercase bg-blue-50 px-3 py-1 rounded-full">
            {current.source}
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            {currentIndex + 1} / {news.length}
          </span>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          {current.img && (
            <div className="w-full md:w-24 h-24 flex-shrink-0">
              <img 
                src={current.img} 
                className="w-full h-full object-cover rounded-2xl bg-slate-100" 
                alt="Foto"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-slate-900 font-extrabold text-base md:text-lg leading-snug mb-2">
              {current.title}
            </h3>
            <p className="text-slate-500 text-xs md:text-sm leading-relaxed">
              {current.description}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
        <a href={current.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold text-xs hover:underline">
          Leer noticia completa →
        </a>
        
        {/* BOTONES DE TEXTO: Adiós a las flechas gigantes */}
        <div className="flex gap-2">
          <button 
            onClick={() => setCurrentIndex(i => (i - 1 + news.length) % news.length)} 
            className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 active:bg-slate-100"
          >
            <span className="text-xl font-light leading-none">‹</span>
          </button>
          <button 
            onClick={() => setCurrentIndex(i => (i + 1) % news.length)} 
            className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 active:bg-slate-100"
          >
            <span className="text-xl font-light leading-none">›</span>
          </button>
        </div>
      </div>
    </div>
  );
}
