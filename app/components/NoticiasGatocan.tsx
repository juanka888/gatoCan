"use client";
import { useState, useEffect, useCallback } from 'react';

// Filtros de relevancia para que el banner sea 100% temático
const WHITE_LIST = [
  'gato', 'animal', 'perro', 'mascota', 'ourense', 'galicia', 'protectora', 
  'felino', 'adopta', 'canino', 'cachorro', 'veterinario', 'fauna', 
  'naturaleza', 'biodiversidad', 'medio ambiente', 'rescate', 'colonia',
  'lugo', 'pontevedra', 'coruña', 'allariz', 'carballiño'
];

export default function NoticiasGatocan() {
  const [news, setNews] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Función para avanzar slide (memorizada para el auto-play)
  const nextSlide = useCallback(() => {
    setNews((currentNews) => {
      if (currentNews.length === 0) return [];
      setCurrentIndex((prev) => (prev + 1) % currentNews.length);
      return currentNews;
    });
  }, []);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + news.length) % news.length);
  };

  useEffect(() => {
    async function loadNews() {
      try {
        setLoading(true);
        // Consumimos tu propia API de Vercel
        const response = await fetch('/api/noticias', { cache: 'no-store' });
        if (!response.ok) throw new Error("Error en API");
        
        const data = await response.json();

        // Filtramos por palabras clave y limpiamos el HTML residual
        const filtered = data
          .filter((item: any) => {
            const searchContent = (item.title + (item.description || "")).toLowerCase();
            return WHITE_LIST.some(word => searchContent.includes(word));
          })
          .map((item: any) => ({
            ...item,
            title: item.title?.replace(/&lt;.*?&gt;/g, "").replace(/&quot;/g, '"'),
            desc: item.description?.replace(/<[^>]*>?/gm, '').substring(0, 180) + "..."
          }));

        // Mezcla aleatoria para que el banner siempre parezca nuevo
        setNews(filtered.sort(() => Math.random() - 0.5));
      } catch (e) {
        console.error("Fallo al cargar el banner de noticias:", e);
      } finally {
        setLoading(false);
      }
    }
    loadNews();
  }, []);

  // Efecto de Auto-play: cambia cada 6 segundos
  useEffect(() => {
    if (news.length === 0 || loading) return;
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [news.length, loading, nextSlide]);

  if (loading) return (
    <div style={{padding: '40px', textAlign: 'center', background: 'rgba(255,255,255,0.65)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)'}}>
      <p style={{color: '#666', fontSize: '14px', fontWeight: '500', animation: 'pulse 1.5s infinite'}}>
        🐾 Rastreando últimas noticias animales...
      </p>
    </div>
  );

  if (news.length === 0) return null;
  const current = news[currentIndex];

  return (
    <div style={{
      background: 'rgba(255,255,255,0.65)', 
      border: '1px solid rgba(255,255,255,0.4)', 
      borderRadius: '16px',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      padding: '20px 24px', 
      boxShadow: '0 10px 25px rgba(0,0,0,0.05)', 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      transition: 'all 0.3s ease'
    }}>
      {/* Cabecera del Banner */}
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          <span style={{
            background: '#2563eb', 
            color: 'white', 
            fontSize: '10px', 
            padding: '3px 10px', 
            borderRadius: '6px', 
            fontWeight: '800',
            letterSpacing: '0.5px'
          }}>
            ACTUALIDAD
          </span>
          <span style={{fontSize: '11px', color: '#64748b', fontWeight: '600'}}>
            • {current.source || 'GatoCan Informa'}
          </span>
        </div>
        <span style={{color: '#cbd5e1', fontSize: '11px', fontWeight: 'bold'}}>
          {currentIndex + 1} / {news.length}
        </span>
      </div>

      {/* Contenido Principal */}
      <div style={{ display: 'flex', gap: '15px', flexDirection: 'column', minHeight: '400px', maxHeight: '400px' }}>
        <h3 style={{
          fontSize: '18px', 
          color: '#0f172a', 
          margin: '0', 
          lineHeight: '1.3', 
          fontWeight: '800',
          cursor: 'pointer'
        }}>
          {current.title}
        </h3>
        
        {/* Imagen opcional si el backend la proporciona */}
        {current.thumbnail && (
          <div style={{ width: '100%', height: '140px', overflow: 'hidden', borderRadius: '14px' }}>
            <img 
              src={current.thumbnail} 
              alt="" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>
        )}

        <p style={{fontSize: '14px', color: '#475569', lineHeight: '1.5', margin: '0', overflowY: 'auto', flexGrow: 1, paddingRight: '4px'}}>
          {current.desc}
        </p>
      </div>

      {/* Footer y Navegación */}
      <div style={{
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginTop: '18px', 
        paddingTop: '14px', 
        borderTop: '1px solid #f1f5f9'
      }}>
        <a 
          href={current.link} 
          target="_blank" 
          rel="noopener noreferrer" 
          style={{
            color: '#2563eb', 
            textDecoration: 'none', 
            fontWeight: 'bold', 
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          LEER MÁS <span style={{fontSize: '16px'}}>›</span>
        </a>

        <div style={{display: 'flex', gap: '10px'}}>
          <button onClick={prevSlide} style={btnStyle}>‹</button>
          <button onClick={nextSlide} style={btnStyle}>›</button>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}

const btnStyle = {
  width: '38px', 
  height: '38px', 
  borderRadius: '12px', 
  border: '1px solid #e2e8f0', 
  background: '#fff', 
  cursor: 'pointer', 
  fontSize: '20px', 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center', 
  color: '#64748b',
  transition: 'background 0.2s'
};