"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { galleryImages, type GalleryCategory } from "@/lib/gatos";

export default function GaleriaActuaciones() {
  const [filter, setFilter] = useState<GalleryCategory>("all");
  const [currentIndex, setCurrentIndex] = useState(0); // Para el Lightbox
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [dynamicImages, setDynamicImages] = useState<any[]>([]);
  
  // --- NUEVA LÓGICA DE PAGINACIÓN ---
  const [page, setPage] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);

  // Detectar si es PC o Móvil para decidir cuántas fotos mostrar
  useEffect(() => {
    const checkSize = () => setIsDesktop(window.innerWidth >= 1024);
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  // Carga desde la API
  useEffect(() => {
    async function loadImages() {
      try {
        const response = await fetch("/api/gallery");
        const data = await response.json();
        if (data.images && data.images.length > 0) {
          setDynamicImages(data.images);
        } else {
          setDynamicImages(galleryImages);
        }
      } catch (error) {
        setDynamicImages(galleryImages);
      }
    }
    loadImages();
  }, []);

  // 1. Filtrar imágenes
  const filteredImages = useMemo(
    () => dynamicImages.filter((img) => filter === "all" || img.category === filter),
    [filter, dynamicImages]
  );

  // 2. Calcular cuántas fotos por "página"
  // PC: 8 fotos (2 filas de 4) | Móvil: 4 fotos (2 filas de 2)
  const pageSize = isDesktop ? 8 : 4;
  const maxPage = Math.max(0, Math.ceil(filteredImages.length / pageSize) - 1);

  // Resetear a página 0 si cambiamos el filtro
  useEffect(() => { 
    setPage(0); 
    setCurrentIndex(0);
  }, [filter]);

  // 3. Obtener solo las fotos de la página actual
  const pageImages = useMemo(() => {
    const start = page * pageSize;
    return filteredImages.slice(start, start + pageSize);
  }, [filteredImages, page, pageSize]);

  // Funciones de navegación Lightbox
  const nextImage = useCallback(() => {
    if (filteredImages.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % filteredImages.length);
  }, [filteredImages.length]);

  const prevImage = useCallback(() => {
    if (filteredImages.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + filteredImages.length) % filteredImages.length);
  }, [filteredImages.length]);

  const activeImage = filteredImages[currentIndex] || filteredImages[0];

  return (
    <div className="w-full">
      {/* Botones de Filtro */}
      <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        {["all", "colonias", "capturas", "esterilizaciones", "actuaciones", "rescates"].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat as GalleryCategory)}
            style={{
              padding: "0.4rem 1rem",
              borderRadius: "20px",
              border: "1px solid #ddd",
              background: filter === cat ? "#111" : "#fff",
              color: filter === cat ? "#fff" : "#111",
              cursor: "pointer",
              fontSize: "0.9rem",
              transition: "all 0.2s"
            }}
          >
            {cat === "all" ? "Todas" : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* CONTENEDOR DE LA REJILLA CON FLECHAS LATERALES */}
      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "10px" }}>
        
        {/* Flecha Izquierda Miniaturas */}
        <button 
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={page === 0}
          style={{
            background: "white", border: "1px solid #ddd", borderRadius: "50%",
            width: "40px", height: "40px", cursor: "pointer", zIndex: 10,
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
            opacity: page === 0 ? 0.3 : 1
          }}
        >
          ⬅️
        </button>

        {/* Rejilla Principal */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: isDesktop ? "repeat(4, 1fr)" : "repeat(2, 1fr)", 
          gap: "1rem",
          flex: 1
        }}>
          {pageImages.map((img, index) => {
            // Calculamos el índice real dentro de la lista completa para el Lightbox
            const realIndex = page * pageSize + index;
            return (
              <div 
                key={img.id || index} 
                onClick={() => { setCurrentIndex(realIndex); setIsLightboxOpen(true); }} 
                style={{ cursor: "pointer", textAlign: "center" }}
              >
                <img 
                  src={img.src} 
                  alt={img.alt} 
                  style={{ width: "100%", height: isDesktop ? "180px" : "140px", objectFit: "cover", borderRadius: "12px", transition: "transform 0.2s" }} 
                  onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.03)"}
                  onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                />
                <div style={{ fontSize: "0.7rem", color: "#666", marginTop: "6px", fontWeight: "bold" }}>{img.tag}</div>
              </div>
            );
          })}
        </div>

        {/* Flecha Derecha Miniaturas */}
        <button 
          onClick={() => setPage(p => Math.min(maxPage, p + 1))}
          disabled={page >= maxPage}
          style={{
            background: "white", border: "1px solid #ddd", borderRadius: "50%",
            width: "40px", height: "40px", cursor: "pointer", zIndex: 10,
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
            opacity: page >= maxPage ? 0.3 : 1
          }}
        >
          ➡️
        </button>
      </div>

      {/* INDICADOR DE PÁGINAS (Puntitos) */}
      <div style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.8rem", color: "#888" }}>
        Página {page + 1} de {maxPage + 1}
      </div>

      {/* Lightbox (Visor de fotos grande) */}
      {isLightboxOpen && activeImage && (
        <div 
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}
          onClick={() => setIsLightboxOpen(false)}
        >
          <button 
            onClick={() => setIsLightboxOpen(false)}
            style={{ position: "absolute", top: "20px", right: "20px", background: "none", border: "none", color: "white", fontSize: "2.5rem", cursor: "pointer" }}
          >
            ×
          </button>

          <button 
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            style={{ position: "absolute", left: "20px", background: "rgba(255,255,255,0.15)", border: "none", color: "white", fontSize: "2.5rem", cursor: "pointer", borderRadius: "50%", width: "60px", height: "60px", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            ‹
          </button>

          <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: "85%", textAlign: "center" }}>
            <img 
              src={activeImage.src} 
              alt={activeImage.alt} 
              style={{ maxHeight: "75vh", maxWidth: "100%", borderRadius: "12px", boxShadow: "0 0 30px rgba(0,0,0,0.5)" }} 
            />
            <p style={{ marginTop: "1.5rem", color: "white", fontSize: "1.2rem", fontWeight: "300" }}>{activeImage.caption}</p>
          </div>

          <button 
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            style={{ position: "absolute", right: "20px", background: "rgba(255,255,255,0.15)", border: "none", color: "white", fontSize: "2.5rem", cursor: "pointer", borderRadius: "50%", width: "60px", height: "60px", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
                  }
