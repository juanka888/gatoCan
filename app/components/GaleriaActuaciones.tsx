"use client";

import { useState, useMemo, useEffect } from "react";
import { galleryImages, type GalleryCategory } from "@/lib/gatos";

export default function GaleriaActuaciones() {
  const [filter, setFilter] = useState<GalleryCategory>("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const visibleImages = useMemo(
    () => galleryImages.filter((img) => filter === "all" || img.category === filter),
    [filter]
  );

  useEffect(() => { setCurrentIndex(0); }, [filter]);

  const activeImage = visibleImages[currentIndex] || galleryImages[0];

  return (
    <div>
      {/* Botones de Filtro */}
      <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        {["all", "colonias", "capturas", "esterilizaciones", "actuaciones"].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat as GalleryCategory)}
            style={{
              padding: "0.4rem 1rem",
              borderRadius: "20px",
              border: "1px solid #ddd",
              background: filter === cat ? "#111" : "#fff",
              color: filter === cat ? "#fff" : "#111",
              cursor: "pointer"
            }}
          >
            {cat === "all" ? "Todas" : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Rejilla de Fotos */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
        {visibleImages.map((img, index) => (
          <div key={index} onClick={() => { setCurrentIndex(index); setIsLightboxOpen(true); }} style={{ cursor: "pointer" }}>
            <img src={img.src} alt={img.alt} style={{ width: "100%", height: "150px", objectFit: "cover", borderRadius: "8px" }} />
            <span style={{ fontSize: "0.75rem", color: "#666" }}>{img.tag}</span>
          </div>
        ))}
      </div>

      {/* Visor / Lightbox */}
      {isLightboxOpen && (
        <div 
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "grid", placeItems: "center", zIndex: 9999 }}
          onClick={() => setIsLightboxOpen(false)}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: "90%", color: "#fff", textAlign: "center" }}>
            <img src={activeImage.src} alt={activeImage.alt} style={{ maxHeight: "80vh", borderRadius: "8px" }} />
            <p style={{ marginTop: "1rem" }}>{activeImage.caption}</p>
            <button onClick={() => setIsLightboxOpen(false)} style={{ marginTop: "10px", padding: "5px 15px" }}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}