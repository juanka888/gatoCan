"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import EuropaPressNews from "./components/EuropaPressNews";

type GalleryCategory = "all" | "colonias" | "capturas" | "esterilizaciones" | "actuaciones";

type GalleryImage = {
  src: string;
  alt: string;
  category: Exclude<GalleryCategory, "all">;
  tag: string;
  caption: string;
};

const galleryImages: GalleryImage[] = [
  {
    src: "/img/foto-01.jpg",
    alt: "Gato negro en jaula humanitaria",
    category: "capturas",
    tag: "Capturas",
    caption: "Captura segura en jaula humanitaria.",
  },
  {
    src: "/img/foto-02.jpg",
    alt: "Gato en jaula verde de captura",
    category: "capturas",
    tag: "Capturas",
    caption: "Preparación y revisión durante el traslado.",
  },
  {
    src: "/img/foto-03.jpg",
    alt: "Gato en jaula cubierta en clínica",
    category: "capturas",
    tag: "Capturas",
    caption: "Zona de espera para minimizar estrés.",
  },
  {
    src: "/img/foto-04.jpg",
    alt: "Gato en jaula sobre mesa clínica",
    category: "esterilizaciones",
    tag: "Esterilizaciones",
    caption: "Ingreso para revisión previa veterinaria.",
  },
  {
    src: "/img/foto-05.jpg",
    alt: "Gato blanco en jaula de observación",
    category: "colonias",
    tag: "Colonias",
    caption: "Control individualizado por colonia.",
  },
  {
    src: "/img/foto-06.jpg",
    alt: "Gata tricolor en transportín de captura",
    category: "actuaciones",
    tag: "Actuaciones",
    caption: "Actuación coordinada para caso urgente.",
  },
];

const bestScoreKey = "gatocanBestScore";
const bestDistanceKey = "gatocanBestDistance";

export default function HomePage() {
  const [filter, setFilter] = useState<GalleryCategory>("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [bestScore, setBestScore] = useState(0);
  const [bestDistance, setBestDistance] = useState(0);

  const visibleImages = useMemo(
    () => galleryImages.filter((image) => filter === "all" || image.category === filter),
    [filter],
  );

  useEffect(() => {
    setCurrentIndex(0);
  }, [filter]);

  useEffect(() => {
    const score = Number(localStorage.getItem(bestScoreKey) || 0);
    const distance = Number(localStorage.getItem(bestDistanceKey) || 0);
    setBestScore(score);
    setBestDistance(distance);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!isLightboxOpen || visibleImages.length === 0) return;
      if (event.key === "Escape") {
        setIsLightboxOpen(false);
      }
      if (event.key === "ArrowLeft") {
        setCurrentIndex((index) => (index - 1 + visibleImages.length) % visibleImages.length);
      }
      if (event.key === "ArrowRight") {
        setCurrentIndex((index) => (index + 1) % visibleImages.length);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isLightboxOpen, visibleImages.length]);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setIsLightboxOpen(true);
  };

  const activeImage = visibleImages[currentIndex] || galleryImages[0];

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "1rem", display: "grid", gap: "1rem" }}>
      <header id="inicio" style={card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <img src="/img/logo1.png" alt="Logo de GatoCan Natura Rural" style={{ width: 72, height: 72, objectFit: "contain" }} />
            <div>
              <p style={{ margin: 0 }}>Asociación de protección animal</p>
              <h1 style={{ margin: 0 }}>GatoCan Natura Rural</h1>
            </div>
          </div>
          <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", alignItems: "center" }}>
            <a href="/login">Acceder</a>
            <a href="/register">Crear cuenta</a>
            <a
              href="https://www.teaming.net/proyectogatonaturanrural"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                background: "#0f766e",
                color: "#fff",
                borderRadius: 999,
                padding: "0.4rem 0.85rem",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Teaming 1€
            </a>
          </div>
        </div>

        <nav aria-label="Principal">
          <ul style={navList}>
            <li><a href="#inicio">Inicio</a></li>
            <li><a href="#mision">Misión</a></li>
            <li><a href="#colonias">Colonias</a></li>
            <li><a href="#galeria">Galería</a></li>
            <li><a href="#fichas">Fichas</a></li>
            <li><a href="#minijuego">Minijuego</a></li>
            <li><a href="#ayuda">Cómo ayudar</a></li>
            <li><a href="#noticias">Noticias</a></li>
            <li><a href="/foro">Foro</a></li>
            <li><a href="#contacto">Contacto</a></li>
            <li><a href="#donar">Donar</a></li>
            <li><a href="/rankings">Rankings</a></li>
            <li><a href="#campana">Campaña</a></li>
            <li><a href="/perfil">Perfil</a></li>
          </ul>
        </nav>

        <section>
          <h2>Cuidamos colonias felinas con responsabilidad y compromiso</h2>
          <p>
            Aplicamos el método CER para mejorar la vida de los gatos comunitarios y fomentar una convivencia
            respetuosa en el entorno rural.
          </p>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <a href="/login">Acceder</a>
            <a href="/register">Crear cuenta</a>
            <a href="#ayuda">Hazte voluntario/a</a>
            <a href="#donar">Donar ahora</a>
            <a href="/foro">Entrar al foro</a>
          </div>
        </section>
      </header>

      <section id="mision" style={card}><h3>Misión y valores</h3><p>Trabajamos para proteger, esterilizar y cuidar a los gatos de colonias felinas mediante acciones coordinadas con personas voluntarias, clínicas veterinarias y administraciones locales.</p></section>
      <section id="colonias" style={card}><h3>Colonias felinas</h3><p>Realizamos seguimiento sanitario, alimentación controlada y campañas de sensibilización para garantizar colonias estables, saludables y bien gestionadas.</p></section>

      <section id="galeria" style={card}>
        <h3>Galería de actuaciones</h3>
        <p>Recorrido visual de colonias, capturas y esterilizaciones. Puedes abrir cualquier miniatura y pasar fotos con teclado o botones.</p>
        <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", marginBottom: ".8rem" }}>
          {[
            ["all", "Todas"],
            ["colonias", "Colonias"],
            ["capturas", "Capturas"],
            ["esterilizaciones", "Esterilizaciones"],
            ["actuaciones", "Actuaciones"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value as GalleryCategory)}
              style={{
                border: "1px solid #cbd5e1",
                borderRadius: 999,
                padding: "0.35rem .8rem",
                background: filter === value ? "#111827" : "#fff",
                color: filter === value ? "#fff" : "#111827",
                cursor: "pointer",
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "0.75rem" }}>
          {visibleImages.map((image, index) => (
            <button
              key={image.src}
              type="button"
              onClick={() => openLightbox(index)}
              style={{ margin: 0, textAlign: "left", border: 0, background: "transparent", padding: 0, cursor: "pointer" }}
            >
              <img src={image.src} alt={image.alt} style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 8 }} />
              <span>{image.tag}</span>
            </button>
          ))}
        </div>
      </section>

      <section id="fichas" style={card}><h3>Fichas de gatos de colonia</h3><p>Pincha o toca cada tarjeta para girarla y ver el estado del caso.</p></section>
      <section id="minijuego" style={card}>
        <h3>Minijuego: Gatito Runner 🐱</h3>
        <p>Salta con espacio o flecha arriba para sumar puntos y esquivar obstáculos.</p>
        <p style={{ margin: ".5rem 0" }}>
          Récord local restaurado: <strong>{bestScore}</strong> puntos · <strong>{Math.floor(bestDistance)}</strong> m
        </p>
        <Link href="/gato-runner">Ir al minijuego</Link>
      </section>
      <section id="campana" style={{ ...card, borderColor: "#0f766e" }}>
        <h3>Campaña de firmas (Change.org)</h3>
        <p>Apoya la petición para una gestión ética de colonias felinas en San Xoán de Río (Ourense).</p>
        <a
          href="https://www.change.org/p/impulsa-el-cambio-en-la-gesti%C3%B3n-de-las-colonias-felinas-en-san-xo%C3%A1n-de-r%C3%ADo-ourense/exp/wa/washarecopy_490375885_es-ES/4/306768009?recruiter=306768009&recruited_by_id=36374024-da0e-4dba-89e6-5f40d5c92574&utm_source=share_petition&utm_campaign=psf_combo_share_initial&utm_medium=whatsapp&utm_content=washarecopy_490375885_es-ES%3A4"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: "inline-block", padding: ".55rem .9rem", borderRadius: 8, background: "#0f766e", color: "#fff", textDecoration: "none", fontWeight: 700 }}
        >
          Firmar campaña en Change.org
        </a>
      </section>
      <section id="ayuda" style={card}><h3>Cómo ayudar</h3><ul><li>Únete al equipo de voluntariado.</li><li>Colabora con material o alimento.</li><li>Difunde nuestras campañas en tu entorno.</li></ul></section>
      <section id="ranking" style={card}><h3>Rankings solidarios 🏆</h3><p>Consulta los dos rankings completos (donaciones y minijuego).</p><a href="/rankings">Ver página completa de rankings</a></section>

      <section id="noticias" style={card}>
        <h3>Noticias y actualizaciones</h3>
        <p>Feed dinámico de Europa Press (sin filtros).</p>
        <EuropaPressNews />
      </section>

      <section id="login" style={card}><h3>Iniciar sesión</h3><p>Accede para gestionar tus aportaciones y revisar tus puntos Karma.</p><a href="/login">Ir a login</a></section>
      <section id="registro" style={card}><h3>Registro</h3><p>Crea una cuenta y participa en campañas, eventos y retos solidarios.</p><a href="/register">Ir a registro</a></section>
      <section id="donar" style={card}>
        <h3>Apoya nuestro trabajo con una donación</h3>
        <p>Cada aportación nos ayuda a cubrir gastos veterinarios, alimentación y tratamientos de urgencia.</p>
        <div style={{ marginTop: ".6rem" }}>
          <iframe
            src="https://www.teaming.net/group/spread/widgets/vhhzRoTGtqKuuLnVWB2kVKfrWgONnGQd06Cg6Uu6MSVJh/6?lang=es_ES&TM=true"
            title="Widget Teaming GatoCan"
            style={{ width: "100%", minHeight: 180, border: "1px solid #cbd5e1", borderRadius: 10 }}
          />
        </div>
      </section>
      <section id="contacto" style={card}><h3>Contacta con Gatocan Natura Rural</h3><p>Para voluntariado, avisos o colaboración, usa los formularios de la web.</p></section>

      {isLightboxOpen && (
        <div
          role="dialog"
          aria-label="Visor de imágenes"
          onClick={() => setIsLightboxOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.8)",
            display: "grid",
            placeItems: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
        >
          <div onClick={(event) => event.stopPropagation()} style={{ maxWidth: 860, width: "100%", color: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: ".5rem" }}>
              <button type="button" onClick={() => setIsLightboxOpen(false)}>Cerrar ×</button>
              <div style={{ display: "flex", gap: ".5rem" }}>
                <button type="button" onClick={() => setCurrentIndex((index) => (index - 1 + visibleImages.length) % visibleImages.length)}>‹ Anterior</button>
                <button type="button" onClick={() => setCurrentIndex((index) => (index + 1) % visibleImages.length)}>Siguiente ›</button>
              </div>
            </div>
            <img src={activeImage.src} alt={activeImage.alt} style={{ width: "100%", maxHeight: "75vh", objectFit: "contain" }} />
            <p style={{ marginTop: ".5rem" }}>{activeImage.caption}</p>
          </div>
        </div>
      )}
    </main>
  );
}

const card: CSSProperties = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: "1rem",
};

const navList: CSSProperties = {
  listStyle: "none",
  padding: 0,
  margin: "0.75rem 0",
  display: "flex",
  gap: "0.6rem",
  flexWrap: "wrap",
};
