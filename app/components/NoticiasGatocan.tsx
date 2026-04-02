"use client";
import { useState, useEffect } from 'react';

// FUENTES DE PRUEBA
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
            
            // HEMOS QUITADO EL FILTRO: Pasan todas las noticias
            combined.push({ 
              title, 
              description: desc.replace(/<[^>]*>?/gm, ''), 
              link 
            });
          });
        });

        setNews(combined);
      } catch (e) {
        console.error("Error en la conexión:", e);
      } finally {
        setLoading(false);
      }
