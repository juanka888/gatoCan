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
          // Intentamos cargar cada fuente por separado para que una no rompa la otra
          const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(feed.url)}`);
          const data = await res.json();
          
          if (data && data.contents) {
            const parser = new DOMParser();
            const xml = parser.parseFromString(data.contents, "text/xml");
            const items = Array.from(xml.querySelectorAll("item"));

            items.forEach(item => {
              const title = item.querySelector("title")?.textContent || "";
              const link = item.querySelector("link")?.textContent || "";
              // Algunos RSS usan 'description' y otros 'encoded' o 'summary'
              let desc = item.querySelector("description")?.textContent || "";
              
              if (title && link) {
                allNews.push({
                  title,
                  link,
                  description: desc.replace(/<[^>]*>?/gm, '').substring(0, 150) + "...",
                  source: feed.name
                });
              }
            });
          }
        } catch (err) {
          console.error(`Error cargando fuente ${feed.name}:`, err);
          // Si falla una, el bucle sigue con la siguiente
        }
      }

      setNews(allNews);
      setLoading(false);
    }

    fetchNews();
  }, []);

  const next = () => setCurrentIndex(i => (i + 1) % news.length);
  const prev = () => setCurrentIndex(i => (i - 1 + news.length) % news.length);

  if (loading) return <div className="text-white text-center p-10 italic">Cargando noticias...</div>;
  if (news.length === 0) return <div className="text-slate-400 text-center p-10">No se han podido cargar noticias hoy.</div>;

  const current = news[currentIndex];

  return (
    <section className="relative my-10 mx-4">
      <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 relative min-h-[220px] flex flex-col justify-center shadow-2xl">
        
        {/* Etiqueta de la fuente para saber de dónde viene */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xs font-bold text-blue-400 uppercase tracking-widest">
            {current.source}
          </h2>
          <span className="text-[10px] text-slate-500 font-mono">
            {currentIndex + 1} / {news.length}
          </span>
        </div>
        
        <div key={currentIndex} className="animate-in fade-in duration-500">
          <h3 className="text-white text-lg md:text-xl font-bold mb-3 pr-10">{current.title}</h3>
          <p className="text-slate-300 text-sm mb-6">{current.description}</p>
          <a href={current.link} target="_blank" rel="noopener noreferrer" className="bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold py-2 px-5 rounded-full uppercase inline-block transition-colors">
            Leer noticia completa
          </a>
        </div>

        {/* Flechas */}
        <button onClick={prev} className="absolute left-[-20px] top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white w-10 h-10 rounded-full border border-white/10 backdrop-blur-md">❮</button>
        <button onClick={next} className="absolute right-[-20px] top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white w-10 h-10 rounded-full border border-white/10 backdrop-blur-md">❯</button>
      </div>
    </section>
  );
}
