"use client";
import { useState, useEffect } from 'react';

const FEEDS = [
  { name: 'La Región (Ourense)', url: 'https://www.laregion.es/rss/section/1' },
  { name: 'La Voz de Galicia', url: 'https://www.lavozdegalicia.es/sociedad/index.xml' },
  { name: '20 Minutos Animales', url: 'https://www.20minutos.es/rss/animales/' },
  { name: 'Europa Press', url: 'https://www.europapress.es/rss/rss.aspx?ch=00066' },
  { name: 'SrPerro', url: 'https://www.srperro.com/blog/feed/' },
  { name: 'Praza Pública', url: 'https://praza.gal/rss' }
];

// Sistema de Pesos: Cuanto más arriba, más puntos da
const PUNTOS = {
  CRITICO: ["gato", "perro", "felina", "canina", "protectora", "gatocan"], // +20
  ANIMAL: ["bienestar", "animal", "mascota", "adopción", "veterinario", "maltrato"], // +10
  LOCAL: ["ourense", "galicia", "trives", "río", "xunta", "gallego"] // +15 (priorizamos lo local)
};

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
            const items = Array.from(xml.querySelectorAll("item")).slice(0, 6);

            items.forEach(item => {
              const title = item.querySelector("title")?.textContent || "";
              const link = item.querySelector("link")?.textContent || "";
              let desc = item.querySelector("description")?.textContent || "";
              
              if (title && link) {
                // Cálculo de prevalencia (Score)
                let score = 0;
                const text = (title + desc).toLowerCase();
                
                PUNTOS.CRITICO.forEach(w => { if(text.includes(w)) score += 20; });
                PUNTOS.LOCAL.forEach(w => { if(text.includes(w)) score += 15; });
                PUNTOS.ANIMAL.forEach(w => { if(text.includes(w)) score += 10; });

                allNews.push({
                  title, link, score,
                  description: desc.replace(/<[^>]*>?/gm, '').substring(0, 140) + "...",
                  source: feed.name
                });
              }
            });
          }
        } catch (err) { console.error(`Error en ${feed.name}`); }
      }

      // Ordenamos por puntuación y luego por novedades
      allNews.sort((a, b) => b.score - a.score);
      setNews(allNews);
      setLoading(false);
    }
    fetchNews();
  }, []);

  if (loading) return <div className="p-10 text-center animate-pulse text-slate-400 italic">Buscando lo más relevante para GatoCan...</div>;
  if (news.length === 0) return null;

  const current = news[currentIndex];

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden">
      {/* Indicador de relevancia visual */}
      <div className={`absolute top-0 left-0 w-1 h-full ${current.score > 15 ? 'bg-orange-400' : 'bg-blue-400'}`} />

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded">
            {current.source}
          </span>
          {current.score >= 15 && (
            <span className="text-[9px] font-black text-orange-600 uppercase animate-bounce">
              🔥 Recomendado
            </span>
          )}
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          {currentIndex + 1} / {news.length}
        </span>
      </div>

      <div key={currentIndex} className="animate-in fade-in duration-500">
        <h3 className="text-slate-900 text-lg font-bold mb-2 leading-tight">
          {current.title}
        </h3>
        <p className="text-slate-600 text-sm mb-6 leading-relaxed line-clamp-3">
          {current.description}
        </p>
        
        <div className="flex items-center justify-between border-t border-slate-50 pt-4">
          <a href={current.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold text-xs hover:scale-105 transition-transform">
            Leer noticia completa →
          </a>
          <div className="flex gap-2">
            <button onClick={() => setCurrentIndex(i => (i - 1 + news.length) % news.length)} className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 active:scale-90 transition-all">❮</button>
            <button onClick={() => setCurrentIndex(i => (i + 1) % news.length)} className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 active:scale-90 transition-all">❯</button>
          </div>
        </div>
      </div>
    </div>
  );
}
