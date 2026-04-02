"use client";
import { useState, useEffect } from 'react';

const FEEDS = [
  { name: 'La Región', url: 'https://www.laregion.es/rss/section/1' },
  { name: 'La Voz de Galicia', url: 'https://www.lavozdegalicia.es/sociedad/index.xml' },
  { name: '20 Minutos', url: 'https://www.20minutos.es/rss/animales/' },
  { name: 'Europa Press', url: 'https://www.europapress.es/rss/rss.aspx?ch=00066' },
  { name: 'SrPerro', url: 'https://www.srperro.com/blog/feed/' }
];

const PUNTOS = {
  CRITICO: ["gato", "perro", "felina", "canina", "protectora", "gatocan"],
  ANIMAL: ["bienestar", "animal", "mascota", "adopción", "veterinario", "maltrato"],
  LOCAL: ["ourense", "galicia", "trives", "río", "xunta", "gallego"]
};

export default function NoticiasGatocan() {
  const [news, setNews] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllFeeds() {
      try {
        const promises = FEEDS.map(async (feed) => {
          try {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 3500); // 3.5 segundos máximo

            const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(feed.url)}`, { signal: controller.signal });
            clearTimeout(id);
            const data = await res.json();
            
            if (!data?.contents) return [];

            const parser = new DOMParser();
            const xml = parser.parseFromString(data.contents, "text/xml");
            return Array.from(xml.querySelectorAll("item")).slice(0, 5).map(item => {
              const title = item.querySelector("title")?.textContent || "";
              const link = item.querySelector("link")?.textContent || "";
              const desc = item.querySelector("description")?.textContent || "";
              
              let score = 0;
              const text = (title + desc).toLowerCase();
              PUNTOS.CRITICO.forEach(w => { if(text.includes(w)) score += 20; });
              PUNTOS.LOCAL.forEach(w => { if(text.includes(w)) score += 15; });
              PUNTOS.ANIMAL.forEach(w => { if(text.includes(w)) score += 10; });

              return {
                title, link, score,
                source: feed.name,
                description: desc.replace(/<[^>]*>?/gm, '').substring(0, 130) + "..."
              };
            });
          } catch (e) { return []; }
        });

        const results = await Promise.all(promises);
        const combined = results.flat().sort((a, b) => b.score - a.score);
        
        setNews(combined);
      } catch (err) {
        console.error("Error global de carga");
      } finally {
        setLoading(false);
      }
    }
    fetchAllFeeds();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-400 text-sm animate-pulse">Cargando noticias destacadas...</div>;
  if (news.length === 0) return null;

  const current = news[currentIndex];

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm overflow-hidden relative">
      {/* Barra lateral de relevancia */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${current.score > 10 ? 'bg-orange-400' : 'bg-blue-300'}`} />

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded">
            {current.source}
          </span>
          {current.score > 20 && <span className="text-[9px] font-bold text-orange-500 uppercase">⭐ Recomendado</span>}
        </div>
        <span className="text-[10px] font-mono text-slate-300">{currentIndex + 1} / {news.length}</span>
      </div>

      <div key={currentIndex} className="animate-in fade-in duration-500">
        <h3 className="text-slate-900 text-base font-bold mb-2 leading-tight">{current.title}</h3>
        <p className="text-slate-500 text-xs md:text-sm mb-6 leading-relaxed">{current.description}</p>
        
        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
          <a href={current.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold text-xs hover:underline">
            Leer noticia completa
          </a>
          <div className="flex gap-2">
            <button onClick={() => setCurrentIndex(i => (i - 1 + news.length) % news.length)} className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all">❮</button>
            <button onClick={() => setCurrentIndex(i => (i + 1) % news.length)} className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all">❯</button>
          </div>
        </div>
      </div>
    </div>
  );
}
