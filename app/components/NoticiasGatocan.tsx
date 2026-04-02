"use client";
import { useState, useEffect } from 'react';

// Filtro con términos clave
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
            // Verificamos contra la lista de permitidos
            if (WHITE_LIST.some(word => fullText.includes(word.toLowerCase()))) {
              combined.push({ title, description: desc.replace(/<[^>]*>?/gm, ''), link });
            }
          });
        });

        const unique = combined.filter((v, i, a) => a.findIndex(t => t.title === v.title) === i);
        setNews(unique);
      } catch (e) {
        console.error("Error cargando noticias:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchAllNews();
  }, []);

  if (loading) return <div className="text-white text-center p-10 italic">Buscando noticias relevantes...</div>;
  
  if (news.length === 0) return (
    <div className="max-w-3xl mx-auto bg-white/5 p-8 rounded-2xl border border-white/10 text-center">
      <p className="text-slate-400 font-white">No hay noticias urgentes de bienestar animal en este momento.</p>
    </div>
  );

  const current = news[currentIndex];

  return (
    <section className="relative my-10 mx-4">
      <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 relative min-h-[220px] flex flex-col justify-center">
        <h2 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4">Actualidad GatoCan</h2>
        
        <div key={currentIndex} className="animate-in fade-in duration-500">
          <h3 className="text-white text-lg font-bold mb-3">{current.title}</h3>
          <p className="text-slate-300 text-sm line-clamp-3 mb-6">{current.description}</p>
          <a href={current.link} target="_blank" rel="noopener noreferrer" className="bg-blue-600 text-white text-[11px] font-bold py-2 px-5 rounded-full uppercase">
            Leer noticia completa
          </a>
        </div>

        {/* Botones de navegación */}
        <button onClick={() => setCurrentIndex(i => (i - 1 + news.length) % news.length)} className="absolute left-[-20px] top-1/2 bg-white/10 text-white w-10 h-10 rounded-full flex items-center justify-center border border-white/20">❮</button>
        <button onClick={() => setCurrentIndex(i => (i + 1) % news.length)} className="absolute right-[-20px] top-1/2 bg-white/10 text-white w-10 h-10 rounded-full flex items-center justify-center border border-white/20">❯</button>
      </div>
    </section>
  );
}
