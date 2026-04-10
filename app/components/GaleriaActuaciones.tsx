"use client";

import { useState, useMemo, useEffect, useCallback } from "react";

type GalleryCategory = "all" | "colonias" | "capturas" | "esterilizaciones" | "actuaciones" | "rescates";

interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  category: Exclude<GalleryCategory, "all">;
  tag: string;
  caption: string;
}

const CATEGORIES: GalleryCategory[] = ["all", "colonias", "capturas", "esterilizaciones", "actuaciones", "rescates"];

export default function GaleriaActuaciones() {
  const [filter, setFilter] = useState<GalleryCategory>("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isDesktop, setIsDesktop] = useState(false);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const checkViewport = () => setIsDesktop(window.innerWidth >= 1024);
    checkViewport();
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  useEffect(() => {
    async function loadImages() {
      const response = await fetch("/api/gallery", { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      setImages(data.images ?? []);
    }

    loadImages();
  }, []);

  const visibleImages = useMemo(
    () => images.filter((img) => filter === "all" || img.category === filter),
    [images, filter]
  );

  const pageSize = isDesktop ? 8 : 4;
  const maxPage = Math.max(0, Math.ceil(visibleImages.length / pageSize) - 1);

  useEffect(() => {
    setCurrentIndex(0);
    setPage(0);
  }, [filter]);

  useEffect(() => {
    if (page > maxPage) setPage(maxPage);
  }, [maxPage, page]);

  const pageImages = useMemo(() => {
    const start = page * pageSize;
    return visibleImages.slice(start, start + pageSize);
  }, [visibleImages, page, pageSize]);

  const nextImage = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % visibleImages.length);
  }, [visibleImages.length]);

  const prevImage = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + visibleImages.length) % visibleImages.length);
  }, [visibleImages.length]);

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

  const activeImage = visibleImages[currentIndex] ?? visibleImages[0];

  return (
    <div className="rounded-2xl border border-white/40 bg-white/65 p-4 backdrop-blur-md">
      <div className="mb-4 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              filter === cat ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-900"
            }`}
          >
            {cat === "all" ? "Todas" : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <div className="relative rounded-2xl border border-white/40 bg-white/60 p-3 backdrop-blur-md">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
          disabled={page === 0}
          className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/60 bg-slate-900/80 px-3 py-2 text-white disabled:opacity-30"
          aria-label="Miniaturas anteriores"
        >
          ‹
        </button>

        <div className={`grid gap-3 px-10 ${isDesktop ? "grid-cols-4" : "grid-cols-2"}`}>
          {pageImages.map((img, index) => {
            const sourceIndex = page * pageSize + index;
            return (
              <button
                key={img.id}
                onClick={() => {
                  setCurrentIndex(sourceIndex);
                  setIsLightboxOpen(true);
                }}
                className="text-center"
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="h-32 w-full rounded-2xl object-cover transition hover:scale-[1.02]"
                />
                <span className="mt-1 block text-xs text-slate-500">{img.tag}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setPage((prev) => Math.min(prev + 1, maxPage))}
          disabled={page >= maxPage}
          className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/60 bg-slate-900/80 px-3 py-2 text-white disabled:opacity-30"
          aria-label="Miniaturas siguientes"
        >
          ›
        </button>
      </div>

      {isLightboxOpen && activeImage && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute right-4 top-4 text-5xl text-white"
            aria-label="Cerrar"
          >
            ×
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
            className="absolute left-4 rounded-full bg-white/20 px-4 py-2 text-4xl text-white"
            aria-label="Anterior"
          >
            ‹
          </button>

          <div onClick={(e) => e.stopPropagation()} className="max-w-[85%] text-center">
            <img src={activeImage.src} alt={activeImage.alt} className="max-h-[80vh] max-w-full rounded-2xl" />
            <p className="mt-4 text-lg text-white">{activeImage.caption}</p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            className="absolute right-4 rounded-full bg-white/20 px-4 py-2 text-4xl text-white"
            aria-label="Siguiente"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
