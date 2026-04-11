"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
// Mantenemos la importación original como respaldo de seguridad
import { galleryImages, type GalleryCategory } from "@/lib/gatos";

export default function GaleriaActuaciones() {
  const [filter, setFilter] = useState<GalleryCategory>("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  
  // Nuevo estado para las imágenes que vienen de la carpeta
  const [dynamicImages, setDynamicImages] = useState<any[]>([]);

  // Efecto para cargar las fotos automáticamente al entrar en la web
  useEffect(() => {
    async function loadImages() {
      try {
        const response = await fetch("/api/gallery");
        const data = await response.json();
        // Si la API devuelve imágenes, las usamos. Si no, usamos las de lib/gatos
        if (data.images && data.images.length > 0) {
          setDynamicImages(data.images);
        } else {
          setDynamicImages(galleryImages);
        }
      } catch (error) {
        console.error("Error cargando la galería:", error);
        setDynamicImages(galleryImages);
      }
    }
    loadImages();
  }, []);

  // Filtramos sobre las imágenes cargadas dinámicamente
  const visibleImages = useMemo(
    () => dynamicImages.filter((img) => filter === "all" || img.category === filter),
    [filter, dynamicImages]
  );

  // Resetear índice al cambiar filtro
  useEffect(() => { setCurrentIndex(0); }, [filter]);

  // Funciones de navegación (con control de seguridad)
  const nextImage = useCallback(() => {
    if (visibleImages.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % visibleImages.length);
  }, [visibleImages.length]);

  const prevImage = useCallback(() => {
    if (visibleImages.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + visibleImages.length) % visibleImages.length);
  }, [visibleImages.length]);

  // Manejo de teclado (Flechas y Escape)
  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "Escape") setIsLightboxOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, nextImage, prevImage]);

  // Imagen activa para el Lightbox
  const activeImage = visibleImages[currentIndex] || dynamicImages[0];

  return (
    <div>
      {/* Botones de Filtro (Tus estilos originales) */}
      <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
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
              fontSize: "0.9rem"
            }}
          >
            {cat === "all" ? "Todas" : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Rejilla de Fotos (Mantiene tu diseño original) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
        {visibleImages.map((img, index) => (
          <div 
            key={img.id || index} 
            onClick={() => { setCurrentIndex(index); setIsLightboxOpen(true); }} 
            style={{ cursor: "pointer", textAlign: "center" }}
          >
            <img 
              src={img.src} 
              alt={img.alt} 
              style={{ width: "100%", height: "150px", objectFit: "cover", borderRadius: "8px", transition: "transform 0.2s" }} 
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.03)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
            />
            <div style={{ fontSize: "0.75rem", color: "#666", marginTop: "4px" }}>{img.tag}</div>
          </div>
        ))}
      </div>

      {/* Visor / Lightbox (Tus flechas laterales y estilos originales) */}
      {isLightboxOpen && activeImage && (
        <div 
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Botón Cerrar */}
          <button 
            onClick={() => setIsLightboxOpen(false)}
            style={{ position: "absolute", top: "20px", right: "20px", background: "none", border: "none", color: "white", fontSize: "2.5rem", cursor: "pointer" }}
          >
            ×
          </button>

          {/* Flecha Izquierda */}
          <button 
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            style={{ position: "absolute", left: "20px", background: "rgba(255,255,255,0.1)", border: "none", color: "white", fontSize: "3rem", cursor: "pointer", borderRadius: "50%", width: "60px", height: "60px", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            ‹
          </button>

          {/* Contenedor Imagen */}
          <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: "80%", textAlign: "center" }}>
            <img 
              src={activeImage.src} 
              alt={activeImage.alt} 
              style={{ maxHeight: "80vh", maxWidth: "100%", borderRadius: "8px", boxShadow: "0 0 20px rgba(0,0,0,0.5)" }} 
            />
            <p style={{ marginTop: "1rem", color: "white", fontSize: "1.1rem" }}>{activeImage.caption}</p>
          </div>

          {/* Flecha Derecha */}
          <button 
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            style={{ position: "absolute", right: "20px", background: "rgba(255,255,255,0.1)", border: "none", color: "white", fontSize: "3rem", cursor: "pointer", borderRadius: "50%", width: "60px", height: "60px", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
