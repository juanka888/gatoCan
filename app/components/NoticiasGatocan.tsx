"use client";
import { useState, useEffect } from 'react';

// Filtro de palabras clave para que solo salgan noticias relevantes
const KEYWORDS = ["gato", "bienestar animal", "protectora", "ley animal", "colonias felinas", "CER", "mascotas", "animales"];

export default function NoticiasGatocan() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      try {
        // Usamos el RSS de Europa Press de Sociedad (donde suelen salir temas de animales)
        const response = await fetch('https://api.allorigins.win/get?url=' + encodeURIComponent('https://www.europapress.es/rss/rss.aspx?ch=00066'));
        const data = await response.json();
        
        // Parseamos el XML básico
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data.contents, "text/xml");
        const items = Array.from(xmlDoc.querySelectorAll("item"));

        const filteredNews = items.map(item => ({
          title: item.querySelector("title")?.textContent || "",
          link: item.querySelector("link")?.textContent || "",
          description: item.querySelector("description")?.textContent || ""
        })).filter(newsItem => 
          KEYWORDS.some(key => 
            newsItem.title.toLowerCase().includes(key.toLowerCase()) || 
            newsItem.description.toLowerCase().includes(key.toLowerCase())
          )
        );

        setNews(filteredNews.slice(0, 6)); // Nos quedamos con las 6 más recientes
        setLoading(false);
      } catch (error) {
        console.error("Error cargando noticias:", error);
        setLoading(false);
      }
    }
    fetchNews();
  }, []);

  if (loading) return <div className="text-white p-10 text-center">Buscando noticias de bienestar animal...</div>;

  return (
    <section className="my-12 p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl mx-4">
      <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
        <span>📰</span> Actualidad y Leyes Animales
      </h2>
      
      {/* Contenedor tipo Banner deslizable */}
      <div className="flex overflow-x-auto gap-6 pb-6 scrollbar-hide">
        {news.length > 0 ? (
          news.map((item, index) => (
            <div key={index} className="min-w-[320px] max-w-[320px] bg-black/40 p-5 rounded-xl border border-white/10 flex flex-col justify-between hover:border-white/40 transition-all">
              <div>
                <h3 className="text-white font-bold text-lg line-clamp-2 mb-3">{item.title}</h3>
                <p className="text-slate-300 text-sm line-clamp-4 leading-relaxed">
                  {item.description.replace(/<[^>]*>?/gm, '')} 
                </p>
              </div>
              <a href={item.link} target="_blank" rel="noopener noreferrer" 
                 className="mt-4 inline-block text-blue-400 hover:text-blue-300 font-medium text-sm">
                Leer noticia completa →
              </a>
            </div>
          ))
        ) : (
          <p className="text-slate-400">No hay noticias urgentes sobre bienestar animal hoy.</p>
        )}
      </div>
    </section>
  );
}
