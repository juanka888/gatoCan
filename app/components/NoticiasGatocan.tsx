"use client";
import { useState, useEffect } from 'react';

const WHITE_LIST = ["gato", "bienestar", "protectora", "animal", "mascota", "ourense", "galicia", "ley", "xunta"];
const FEEDS = [
  'https://www.lavozdegalicia.es/sociedad/index.xml',
  'https://www.20minutos.es/rss/animales/',
  'https://www.europapress.es/rss/rss.aspx?ch=00066'
];

export default function NoticiasGatocan() {
  const [news, setNews] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllNews() {
      setLoading(true);
      try {
        const results = await Promise.all(
          FEEDS.map(url => 
            fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`)
              .then(r => r.ok ? r.json() : null)
              .catch(() => null)
          )
        );

        let combined: any[] = [];
        const parser = new DOMParser();

        results.forEach(res => {
          if (!res?.contents) return;
          const xmlDoc = parser.parseFromString(res.contents, "text/xml");
          const items = Array.from(xmlDoc.querySelectorAll("item"));
          
          items.forEach(item => {
            const title = item.querySelector("title")?.textContent || "";
            const desc = item.querySelector("description")?.textContent || "";
            const link = item.querySelector("link")?.textContent || "";
            
            const fullText = (title + desc).toLowerCase();
            if (WHITE_LIST.some(word => fullText.includes(word.toLowerCase()))) {
              combined.push({ title, description: desc.replace(/<[^>]*>?/gm, ''), link });
            }
          });
        });

        // Eliminar duplicados
        const unique = combined.filter((v, i, a) => a.findIndex(t => t.title === v.title) === i);
        setNews(unique);
      } catch (e) {
        console.error("Error crítico:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchAllNews();
  }, []);

  if (loading) return <div className="text-white text-center p-10 italic">Buscando noticias relevantes...</div>;
  
  // Si no hay noticias, mostramos un mensaje amigable en lugar de nada
  if (news.length === 0) return (
    <div className="max-w-3xl mx-auto bg-white/5 p-8 rounded-2xl border border-white/10 text-center">
      <p className="text-slate-400">No se han encontrado noticias de animales en las últimas horas. ¡Vuelve más tarde!</p>
    </div>
  );

  const current = news[currentIndex];

  return (
    <section className="relative my-10 mx-4">
      <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 relative min-h-[220px] flex flex-col justify-center shadow-2xl">
        <h2 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4">Actualidad GatoCan</h2>
        
        <div key={currentIndex} className="animate-in fade-in slide-in-from-right-5 duration-500">
          <h3 className="text-white text-lg md:text-xl font-bold mb-3 pr-10">{current.title}</h3>
          <p className="text-slate-300 text-sm line-clamp-3 mb-6">{current.description}</p>
          <a href={current.link} target="_blank" rel="noopener noreferrer" className="bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold py-2 px-5 rounded-full uppercase inline-block">
            Leer más
          </a>
        </div>

        <button onClick={() => setCurrentIndex(i => (i - 1 + news.length) % news.length)} className="absolute left-[-20px] top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20">❮</button>
        <button onClick={() => setCurrentIndex(i => (i + 1) % news.length)} className="absolute right-[-20px] top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20">❯</button>
        
        <div className="absolute bottom-4 right-8 text-[10px] text-slate-500 font-mono">
          {currentIndex + 1} / {news.length}
        </div>
      </div>
    </section>
  );
}
