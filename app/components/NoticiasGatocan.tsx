"use client";
import { useState, useEffect } from 'react';

// WHITE_LIST: Prioridad para bienestar animal y noticias locales de Galicia/Ourense
const WHITE_LIST = [
  "gato", "bienestar animal", "protectora", "ley animal", 
  "colonias felinas", "CER", "mascotas", "animales", 
  "veterinario", "adopción", "Galicia", "Ourense", 
  "Trives", "San Xoán de Río", "Xunta", "abandono"
];

const FEEDS = [
  'https://www.lavozdegalicia.es/sociedad/index.xml',
  'https://www.farodevigo.es/rss/section/1',
  'https://www.20minutos.es/rss/animales/',
  'https://www.europapress.es/rss/rss.aspx?ch=00066',
  'https://www.efe.com/efe/espana/efeverde/rss'
];

export default function NoticiasGatocan() {
  const [news, setNews] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllNews() {
      try {
        const allResponses = await Promise.all(
          FEEDS.map(url => 
            fetch('https://api.allorigins.win/get?url=' + encodeURIComponent(url))
              .then(r => r.json())
          )
        );

        let combinedItems: any[] = [];
        const parser = new DOMParser();

        allResponses.forEach(res => {
          const xmlDoc = parser.parseFromString(res.contents, "text/xml");
          const items = Array.from(xmlDoc.querySelectorAll("item"));
          combinedItems = [...combinedItems, ...items];
        });

        const filtered = combinedItems.map(item => ({
          title: item.querySelector("title")?.textContent || "",
          link: item.querySelector("link")?.textContent || "",
          description: item.querySelector("description")?.textContent?.replace(/<[^>]*>?/gm, '') || ""
        })).filter(n => {
          const text = (n.title + n.description).toLowerCase();
          return WHITE_LIST.some(word => text.includes(word.toLowerCase()));
        });

        const uniqueNews = filtered.filter((v, i, a) => a.findIndex(t => (t.title === v.title)) === i);

        setNews(uniqueNews);
        setLoading(false);
      } catch (e) {
        console.error("Error cargando noticias:", e);
        setLoading(false);
      }
    }
    fetchAllNews();
  }, []);

  const nextNews = () => setCurrentIndex((prev) => (prev + 1) % news.length);
  const prevNews = () => setCurrentIndex((prev) => (prev - 1 + news.length) % news.length);

  if (loading) return <div className="text-white text-center p-10 font-medium">Cargando noticias de Galicia y bienestar animal...</div>;
  if (news.length === 0) return null;

  const current = news[currentIndex];

  return (
    <section className="relative my-10 mx-4">
      <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 relative min-h-[240px] flex flex-col justify-center shadow-2xl">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xs font-bold text-blue-400 uppercase tracking-widest">
            Actualidad GatoCan • {news.length} noticias
          </h2>
        </div>
        <div key={currentIndex} className="animate-in fade-in duration-500">
          <h3 className="text-white text-lg md:text-xl font-bold mb-3 leading-tight pr-10">
            {current.title}
          </h3>
          <p className="text-slate-300 text-sm line-clamp-3 mb-6 leading-relaxed">
            {current.description}
          </p>
          <a href={current.link} target="_blank" rel="noopener noreferrer" className="bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold py-2.5 px-6 rounded-full transition-all uppercase tracking-wider inline-block">
            Leer noticia completa
          </a>
        </div>
        <button onClick={prevNews} className="absolute left-[-15px] md:left-[-25px] top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 transition-all shadow-lg group">
          <span className="text-2xl group-hover:scale-125 transition-transform">❮</span>
        </button>
        <button onClick={nextNews} className="absolute right-[-15px] md:right-[-25px] top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 transition-all shadow-lg group">
          <span className="text-2xl group-hover:scale-125 transition-transform">❯</span>
        </button>
        <div className="absolute bottom-4 right-8 text-[10px] text-slate-400 font-mono bg-black/20 px-2 py-1 rounded">
          {currentIndex + 1} / {news.length}
        </div>
      </div>
    </section>
  );
}
