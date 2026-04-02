"use client";
import { useState, useEffect } from 'react';

// Palabras que SÍ queremos
const WHITE_LIST = ["gato", "perro", "animal", "bienestar", "protectora", "felina", "mascota", "vacunación", "ley", "maltrato", "adopción"];
// Palabras que NO queremos (para evitar política o noticias raras)
const BLACK_LIST = ["cerdán", "amnistía", "psoe", "pp", "congreso", "fútbol", "ucrania", "gaza"];

const FEEDS = [
  'https://www.europapress.es/rss/rss.aspx?ch=00066', // Sociedad
  'https://www.efe.com/efe/espana/efeverde/rss'      // Medio Ambiente/Animales
];

export default function NoticiasGatocan() {
  const [news, setNews] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllNews() {
      try {
        const allResponses = await Promise.all(
          FEEDS.map(url => fetch('https://api.allorigins.win/get?url=' + encodeURIComponent(url)).then(r => r.json()))
        );

        let combinedItems = [];
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
          const hasGoodWord = WHITE_LIST.some(word => text.includes(word));
          const hasBadWord = BLACK_LIST.some(word => text.includes(word));
          return hasGoodWord && !hasBadWord;
        });

        setNews(filtered);
        setLoading(false);
      } catch (e) {
        setLoading(false);
      }
    }
    fetchAllNews();
  }, []);

  const nextNews = () => setCurrentIndex((prev) => (prev + 1) % news.length);
  const prevNews = () => setCurrentIndex((prev) => (prev - 1 + news.length) % news.length);

  if (loading) return <div className="text-white text-center p-10">Buscando noticias relevantes...</div>;
  if (news.length === 0) return null;

  const current = news[currentIndex];

  return (
    <section className="relative my-10 mx-4">
      <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 relative overflow-hidden group">
        
        <h2 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">Actualidad Animalista</h2>
        
        {/* Contenido de la Noticia */}
        <div className="min-h-[150px] transition-all duration-500">
          <h3 className="text-white text-xl font-bold mb-4 leading-tight">{current.title}</h3>
          <p className="text-slate-300 text-sm line-clamp-3 mb-6">{current.description}</p>
          <a href={current.link} target="_blank" className="bg-blue-600 hover:bg-blue-500 text-white text-xs py-2 px-4 rounded-full transition-colors inline-block">
            Leer noticia completa
          </a>
        </div>

        {/* Flechas Superpuestas */}
        <button 
          onClick={prevNews}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white w-10 h-10 rounded-full flex items-center justify-center transition-opacity"
        >
          ‹
        </button>
        <button 
          onClick={nextNews}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white w-10 h-10 rounded-full flex items-center justify-center transition-opacity"
        >
          ›
        </button>

        {/* Indicador de número */}
        <div className="absolute bottom-2 right-6 text-[10px] text-slate-500">
          {currentIndex + 1} / {news.length}
        </div>
      </div>
    </section>
  );
}
