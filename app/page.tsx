"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { signIn, useSession } from "next-auth/react";
import EuropaPressNews from "./components/EuropaPressNews";
import GatitoRunner from "./components/GatitoRunner";

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


export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [filter, setFilter] = useState<GalleryCategory>("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [colabClicks, setColabClicks] = useState<Record<string, number>>({});
  const { status } = useSession();

  const visibleImages = useMemo(
    () => galleryImages.filter((image) => filter === "all" || image.category === filter),
    [filter],
  );

  useEffect(() => {
    setCurrentIndex(0);
  }, [filter]);

  useEffect(() => {
    setMenuOpen(false);
  }, [status]);

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

  useEffect(() => {
    const stored = localStorage.getItem("gatocanColaboradoresClicks");
    if (stored) {
      setColabClicks(JSON.parse(stored));
    }
  }, []);

  const registerColabClick = (id: string) => {
    const next = { ...colabClicks, [id]: Number(colabClicks[id] || 0) + 1 };
    setColabClicks(next);
    localStorage.setItem("gatocanColaboradoresClicks", JSON.stringify(next));
  };

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "1rem", display: "grid", gap: "1rem" }}>
      <header id="inicio" className="site-header">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <img src="/img/logo1.png" alt="Logo de GatoCan Natura Rural" className="brand-logo" />
            <div>
              <p className="eyebrow">Asociación de protección animal</p>
              <h1>GatoCan Natura Rural</h1>
            </div>
          </div>
          <div className="hero-actions">
            {status === "authenticated" ? (
              <a href="/perfil" className="btn btn-secondary">Ir a mi perfil</a>
            ) : (
              <>
                <button type="button" className="btn btn-secondary" onClick={() => signIn("google", { callbackUrl: "/perfil" })}>Acceder</button>
                <a href="/register" className="btn btn-secondary">Crear cuenta</a>
              </>
            )}
            <a
              href="https://www.teaming.net/proyectogatonaturanrural"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              Teaming 1€
            </a>
          </div>
        </div>

        <button
          type="button"
          className="menu-toggle"
          onClick={() => setMenuOpen((current) => !current)}
          aria-expanded={menuOpen}
          aria-controls="main-menu"
        >
          ☰ Menú
        </button>

        <nav aria-label="Principal" className="main-nav">
          <ul id="main-menu" className={menuOpen ? "is-open" : ""}>
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

        <section className="hero">
          <h2>Cuidamos colonias felinas con responsabilidad y compromiso</h2>
          <p>
            Aplicamos el método CER para mejorar la vida de los gatos comunitarios y fomentar una convivencia
            respetuosa en el entorno rural.
          </p>
          <div className="hero-actions">
            {status === "authenticated" ? (
              <a href="/perfil" className="btn btn-secondary">Mi perfil</a>
            ) : (
              <button type="button" className="btn btn-secondary" onClick={() => signIn("google", { callbackUrl: "/perfil" })}>Acceder</button>
            )}
            <a href="/register" className="btn btn-secondary">Crear cuenta</a>
            <a href="#ayuda" className="btn btn-secondary">Hazte voluntario/a</a>
            <a href="#donar" className="btn btn-primary">Donar ahora</a>
            <a href="/foro" className="btn btn-secondary">Entrar al foro</a>
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

      <section id="fichas" style={card} className="flip-card-section">
        <h3>Fichas de gatos de colonia</h3>
        <p>Pincha o toca cada tarjeta para girarla y ver el estado del caso.</p>

        <div className="flip-grid">
          <label className="flip-card">
            <input type="checkbox" className="flip-toggle" aria-label="Girar ficha de Nube" />
            <span className="flip-card-inner">
              <span className="flip-face flip-front">
                <img src="https://images.pexels.com/photos/165775/pexels-photo-165775.jpeg" alt="Gato Nube mirando de frente" />
                <strong>Nube</strong>
                <small>Colonia Río Norte</small>
                <em>Pincha para ver ficha</em>
              </span>
              <span className="flip-face flip-back">
                <h4>Estado de Nube</h4>
                <ul>
                  <li><strong>Esterilización:</strong> Hecha ✅</li>
                  <li><strong>Enfermedad:</strong> Gingivitis leve</li>
                  <li><strong>Tratamiento:</strong> Antiinflamatorio + revisión mensual</li>
                  <li><strong>Desaparición:</strong> No</li>
                  <li><strong>Edad aprox.:</strong> 4 años</li>
                  <li><strong>Carácter:</strong> Sociable y tranquila</li>
                </ul>
              </span>
            </span>
          </label>

          <label className="flip-card">
            <input type="checkbox" className="flip-toggle" aria-label="Girar ficha de Menta" />
            <span className="flip-card-inner">
              <span className="flip-face flip-front">
                <img src="https://images.pexels.com/photos/617278/pexels-photo-617278.jpeg" alt="Gata Menta sobre la hierba" />
                <strong>Menta</strong>
                <small>Colonia Mirador</small>
                <em>Pincha para ver ficha</em>
              </span>
              <span className="flip-face flip-back">
                <h4>Estado de Menta</h4>
                <ul>
                  <li><strong>Esterilización:</strong> Pendiente ⏳</li>
                  <li><strong>Enfermedad:</strong> Sin diagnóstico actual</li>
                  <li><strong>Tratamiento:</strong> Desparasitación preventiva</li>
                  <li><strong>Desaparición:</strong> No</li>
                  <li><strong>Edad aprox.:</strong> 2 años</li>
                  <li><strong>Carácter:</strong> Curiosa y algo tímida</li>
                </ul>
              </span>
            </span>
          </label>

          <label className="flip-card">
            <input type="checkbox" className="flip-toggle" aria-label="Girar ficha de Rayo" />
            <span className="flip-card-inner">
              <span className="flip-face flip-front">
                <img src="https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg" alt="Gato Rayo tumbado" />
                <strong>Rayo</strong>
                <small>Colonia Fonteboa</small>
                <em>Pincha para ver ficha</em>
              </span>
              <span className="flip-face flip-back">
                <h4>Estado de Rayo</h4>
                <ul>
                  <li><strong>Esterilización:</strong> Hecha ✅</li>
                  <li><strong>Enfermedad:</strong> Lesión ocular antigua</li>
                  <li><strong>Tratamiento:</strong> Colirio en brotes</li>
                  <li><strong>Desaparición:</strong> Aviso activo desde febrero 2026</li>
                  <li><strong>Edad aprox.:</strong> 7 años</li>
                  <li><strong>Carácter:</strong> Independiente, acepta comida a distancia</li>
                </ul>
              </span>
            </span>
          </label>
        </div>
      </section>
      <section id="minijuego" style={card}>
        <h3>Minijuego: Gatito Runner 🐱</h3>
        <p>Salta con espacio o flecha arriba para sumar puntos y esquivar obstáculos.</p>
        <div style={{ margin: "0 auto", maxWidth: 920 }}>
          <GatitoRunner embedded showLeaderboard={false} />
        </div>
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

      <section id="login" style={card}>
        <h3>Iniciar sesión</h3>
        <p>Accede para gestionar tus aportaciones y revisar tus puntos Karma.</p>
        {status === "authenticated" ? (
          <a href="/perfil">Sesión activa · Ir al perfil</a>
        ) : (
          <button type="button" onClick={() => signIn("google", { callbackUrl: "/perfil" })}>
            Acceder con Google
          </button>
        )}
      </section>
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
        <div style={{ marginTop: 12 }}>
          <h4>Contador de colaboradores (rescatado del legacy)</h4>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { id: "zooplus", nombre: "Zooplus", url: "https://www.zooplus.es" },
              { id: "kiwoko", nombre: "Kiwoko", url: "https://www.kiwoko.com" },
              { id: "tiendanimal", nombre: "Tiendanimal", url: "https://www.tiendanimal.es" },
            ].map((colab) => (
              <a
                key={colab.id}
                href={colab.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => registerColabClick(colab.id)}
              >
                {colab.nombre} ({Number(colabClicks[colab.id] || 0)} clics)
              </a>
            ))}
          </div>
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
