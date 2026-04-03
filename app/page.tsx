"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from "react";
import { signIn, useSession } from "next-auth/react";
import EuropaPressNews from "./components/EuropaPressNews";
import GatitoRunner from "./components/GatitoRunner";
import NoticiasGatocan from "./components/NoticiasGatocan";
type GalleryCategory = "all" | "colonias" | "capturas" | "esterilizaciones" | "actuaciones";

type GalleryImage = {
  src: string;
  alt: string;
  category: Exclude<GalleryCategory, "all">;
  tag: string;
  caption: string;
};

interface Gato {
  id: number;
  nombre: string;
  colonia: string;
  imagen: string;
  detalles: {
    esterilizacion: string;
    enfermedad: string;
    tratamiento: string;
    desaparicion: string;
    edad: string;
    caracter: string;
  };
}
const [loading, setLoading] = useState(false);
const gatosColonia = [
  { id: 1, nombre: "Nube", colonia: "Río Norte", imagen: "https://images.pexels.com/photos/165775/pexels-photo-165775.jpeg", detalles: { esterilizacion: "Hecha ✅", enfermedad: "Gingivitis leve", tratamiento: "Antiinflamatorio", edad: "4 años" } },
  { id: 2, nombre: "Menta", colonia: "Mirador", imagen: "https://images.pexels.com/photos/617278/pexels-photo-617278.jpeg", detalles: { esterilizacion: "Pendiente ⏳", enfermedad: "Ninguna", tratamiento: "Preventivo", edad: "2 años" } },
  { id: 3, nombre: "Rayo", colonia: "Fonteboa", imagen: "https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg", detalles: { esterilizacion: "Hecha ✅", enfermedad: "Lesión ocular", tratamiento: "Colirio", edad: "7 años" } },
  { id: 4, nombre: "Luna", colonia: "Parque Central", imagen: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=500&auto=format&fit=crop", detalles: { esterilizacion: "Hecha ✅", enfermedad: "Ninguna", tratamiento: "Revisión", edad: "3 años" } },
  { id: 5, nombre: "Zeus", colonia: "Río Norte", imagen: "https://images.pexels.com/photos/104827/cat-pet-animal-domestic-104827.jpeg", detalles: { esterilizacion: "Pendiente ⏳", enfermedad: "Resfriado", tratamiento: "Antibiótico", edad: "5 años" } },
  { id: 6, nombre: "Oreo", colonia: "Mirador", imagen: "https://images.pexels.com/photos/208984/pexels-photo-208984.jpeg", detalles: { esterilizacion: "Hecha ✅", enfermedad: "Ninguna", tratamiento: "Ninguno", edad: "1 año" } },
  { id: 7, nombre: "Misu", colonia: "Río Norte", imagen: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?q=80&w=500&auto=format&fit=crop", detalles: { esterilizacion: "Hecha ✅", enfermedad: "Ninguna", tratamiento: "Ninguno", edad: "2 años" } },
  { id: 8, nombre: "Bigotes", colonia: "Mirador", imagen: "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?q=80&w=500&auto=format&fit=crop", detalles: { esterilizacion: "Pendiente ⏳", enfermedad: "Asma", tratamiento: "Inhalador", edad: "5 años" } }
];

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

type DonationOption = {
  id: string;
  label: string;
  price: number;
  karma: number;
  icon: string;
  iconClassName: string;
};

const donationOptions: DonationOption[] = [
  { id: "male", label: "Esterilización macho — 60 €", price: 60, karma: 30, icon: "✚", iconClassName: "icon-med" },
  { id: "female", label: "Esterilización femenina — 100 €", price: 100, karma: 50, icon: "♀", iconClassName: "icon-female" },
  { id: "food", label: "Comida mensual — 10 €", price: 10, karma: 10, icon: "🍴", iconClassName: "icon-food" },
  { id: "pipette", label: "Pipeta antiparasitaria — 12 €", price: 12, karma: 8, icon: "PP", iconClassName: "icon-pipette" },
  { id: "sponsor", label: "Apadrina este gato — 15 €/mes", price: 15, karma: 18, icon: "♥", iconClassName: "icon-love" },
];

const flechaProStyle = {
  background: 'rgba(255, 71, 87, 0.1)', // Fondo rosado muy suave y elegante
  border: 'none',
  fontSize: '2rem',
  cursor: 'pointer',
  padding: '10px 15px',
  borderRadius: '50%', // Lo hace circular
  color: '#ff4757',
  transition: 'all 0.3s ease', // Animación suave
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  userSelect: 'none' as const, // Evita que se seleccione el emoji como texto
  width: '50px', // Tamaño fijo para que sea un círculo perfecto
  height: '50px',
  boxShadow: '0 2px 5px rgba(0,0,0,0.05)' // Una sombra casi invisible para dar relieve
};
const botonCaraFrontal = {
    backgroundColor: '#ff4757',
    color: 'white',
    padding: '8px 12px',
    borderRadius: '20px',
    border: 'none',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
    fontSize: '0.8rem',
    marginTop: '10px'
  };

  const flechaStyle = {
    background: 'none',
    border: 'none',
    fontSize: '2rem',
    cursor: 'pointer',
    color: '#ff4757'
  };

const handlePayment = async (nombreItem: string, precio: number) => {
  try {
    // 1. Llamamos a nuestra API local
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: nombreItem,
        amount: precio, // Euros (el route.ts ya lo multiplica por 100)
      }),
    });

    const data = await response.json();

    // 2. Si todo va bien, Stripe nos da una URL y saltamos a ella
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("Error al conectar con la pasarela de pago");
    }
  } catch (error) {
    console.error("Error en el pago:", error);
    alert("Hubo un fallo en la conexión");
  }
};


export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [filter, setFilter] = useState<GalleryCategory>("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [colabClicks, setColabClicks] = useState<Record<string, number>>({});
  const [donationSelections, setDonationSelections] = useState<Record<string, boolean>>({});
  const [openDonationCatId, setOpenDonationCatId] = useState<string | number>(gatosColonia[0]?.id ?? "");
  const [contactForm, setContactForm] = useState({ nombre: "", email: "", mensaje: "", privacidad: false });
  const [contactStatus, setContactStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const { status } = useSession();
  const [indiceGato, setIndiceGato] = useState(0);

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

  const donationTotal = Object.keys(donationSelections).reduce((acc, key) => {
    if (donationSelections[key]) {
      const optionId = key.split("-")[1];
      const option = donationOptions.find((o) => o.id === optionId);
      return acc + (option ? option.price : 0);
    }
    return acc;
  }, 0);

  const karmaTotal = Object.keys(donationSelections).reduce((acc, key) => {
    if (donationSelections[key]) {
      const optionId = key.split("-")[1];
      const option = donationOptions.find((o) => o.id === optionId);
      return acc + (option ? option.karma : 0);
    }
    return acc;
  }, 0);

  const btnPagoStyle = {
    backgroundColor: '#ff4757',
    color: 'white',
    border: 'none',
    borderRadius: '20px',
    padding: '5px 12px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '0.8rem',
    marginTop: 'auto', // Lo empuja hacia abajo
    marginBottom: '10px'
};
  // 1. Array de datos (asegúrate de que esté ANTES de gatosVisibles)


  // 2. Estado y Funciones
  const [indiceInicio, setIndiceInicio] = useState(0);

  const siguienteGato = () => {
    if (indiceInicio + 3 < gatosColonia.length) setIndiceInicio(indiceInicio + 1);
  };

  const anteriorGato = () => {
    if (indiceInicio > 0) setIndiceInicio(indiceInicio - 1);
  };

  // 3. Selección de los 3 que se muestran
  const gatosVisibles = gatosColonia.slice(indiceInicio, indiceInicio + 3);

  const submitContactForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!contactForm.privacidad) {
      setContactStatus({ type: "error", message: "Debes aceptar las políticas de privacidad para continuar." });
      return;
    }

    setIsSubmittingContact(true);
    setContactStatus(null);

    try {
      const response = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: contactForm.nombre,
          email: contactForm.email,
          mensaje: contactForm.mensaje,
          privacidad: contactForm.privacidad,
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo enviar el mensaje");
      }

      setContactForm({ nombre: "", email: "", mensaje: "", privacidad: false });
      setContactStatus({ type: "success", message: "¡Mensaje enviado con éxito!" });
    } catch (error) {
      console.error(error);
      setContactStatus({ type: "error", message: "No hemos podido enviar el mensaje. Inténtalo de nuevo en unos minutos." });
    } finally {
      setIsSubmittingContact(false);
    }
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

// 1. Añade este estado arriba con tus otros useState
const [indiceGato, setIndiceGato] = useState(0);

// 2. En tu sección de fichas:
<section id="fichas" style={{ ...card, padding: '20px 0' }} className="flip-card-section">
  <h3 style={{ textAlign: 'center' }}>Fichas de gatos de colonia</h3>
  <p style={{ textAlign: 'center', marginBottom: '20px' }}>Usa las flechas para descubrir más casos.</p>

  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
    
    {/* Botón Izquierda */}
    <button 
      onClick={anteriorGato} 
      disabled={indiceInicio === 0}
      style={{ 
        ...flechaStyle, 
        opacity: indiceInicio === 0 ? 0.3 : 1, 
        cursor: indiceInicio === 0 ? 'default' : 'pointer' 
      }}
    >
      ⬅️
    </button>

    {/* Contenedor de las 3 tarjetas */}
    <div className="flip-grid" style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(3, 1fr)', 
      gap: '15px',
      perspective: '1000px'
    }}>
      {gatosVisibles.map((gato) => (
        <div className="flip-card" key={gato.id}>
          <label className="flip-card-inner">
            <input type="checkbox" className="flip-toggle" />
            
            {/* CARA FRONTAL */}
            <div className="flip-face flip-front">
              <img src={gato.imagen} alt={gato.nombre} style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px' }} />
              <strong style={{ display: 'block', marginTop: '10px' }}>{gato.nombre}</strong>
              <small>{gato.colonia}</small>
              <button 
                onClick={(e) => { e.preventDefault(); handlePayment(`Apadrinar a ${gato.nombre}`, 10); }}
                style={botonCaraFrontal}
              >
                Apadrinar 10€
              </button>
            </div>

            {/* CARA TRASERA */}
            <div className="flip-face flip-back">
              <h4 style={{ margin: '5px 0' }}>{gato.nombre}</h4>
              <ul style={{ textAlign: 'left', fontSize: '0.75rem', padding: '0 10px', listStyle: 'none' }}>
                <li><strong>Esteril:</strong> {gato.detalles.esterilizacion}</li>
                <li><strong>Salud:</strong> {gato.detalles.enfermedad}</li>
                <li><strong>Edad:</strong> {gato.detalles.edad}</li>
              </ul>
              <button 
                onClick={(e) => { e.preventDefault(); handlePayment(`Ayudar a ${gato.nombre}`, 10); }}
                style={{ ...botonCaraFrontal, backgroundColor: '#2ed573' }}
              >
                ❤️ Ayudar
              </button>
            </div>
          </label>
        </div>
      ))}
    </div>

    {/* Botón Derecha */}
    <button 
      onClick={siguienteGato} 
      disabled={indiceInicio + 3 >= gatosColonia.length}
      style={{ 
        ...flechaStyle, 
        opacity: indiceInicio + 3 >= gatosColonia.length ? 0.3 : 1, 
        cursor: indiceInicio + 3 >= gatosColonia.length ? 'default' : 'pointer' 
      }}
    >
      ➡️
    </button>
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
        <NoticiasGatocan />
      </section>

      <section id="donar" style={card} className="donation-card">
        <h3>Apoya nuestro trabajo con una donación</h3>
        <p>Cada aportación nos ayuda a cubrir gastos veterinarios, alimentación y tratamientos de urgencia.</p>
        <h3>Haz tu aporte gatuno 🐾</h3>
        <p>Abre cada gatete y marca el apoyo que quieras cubrir. Verás el total y tus <strong>Puntos Karma</strong> al momento.</p>

        {gatosColonia.map((cat) => (
          <details key={cat.id} className="donation-panel" open={openDonationCatId === cat.id}>
            <summary
              onClick={(event) => {
                event.preventDefault();
                setOpenDonationCatId(cat.id);
              }}
            >
              <span className="cat-summary">
                <img src={cat.imagen} alt={cat.nombre} />
                <span>{cat.nombre}</span>
              </span>
            </summary>
            <div className="cat-options">
              {donationOptions.map((option) => {
                const key = `${cat.id}-${option.id}`;
                return (
                  <label key={key}>
                    <input
                      type="checkbox"
                      className="donation-item"
                      checked={Boolean(donationSelections[key])}
                      onChange={(event) => {
                        const checked = event.target.checked;
                        setDonationSelections((prev) => ({ ...prev, [key]: checked }));
                      }}
                    />{" "}
                    <span className={`option-icon ${option.iconClassName}`}>{option.icon}</span> {option.label}
                  </label>
                );
              })}
            </div>
          </details>
        ))}

        <div className="donation-summary" aria-live="polite">
          <p><strong>Total estimado:</strong> <span id="donation-total">{donationTotal} €</span></p>
          <p><strong>Puntos Karma:</strong> <span id="karma-total">{karmaTotal}</span></p>
          <p id="karma-message" className="karma-message">Cada punto ayuda a cambiar vidas felinas 💛</p>
          <button id="saveDonationScoreBtn" type="button" className="btn btn-secondary">Guardar puntos en mi perfil</button>
          <p id="saveDonationScoreMsg" className="auth-message" aria-live="polite"></p>
        </div>

      <button 
  className="btn btn-primary" 
  style={{ 
    marginTop: '20px', 
    width: '100%',
    padding: '15px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px',
    opacity: (donationTotal === 0 || loading) ? 0.7 : 1,
    cursor: (donationTotal === 0 || loading) ? 'not-allowed' : 'pointer'
  }}
  disabled={donationTotal === 0 || loading}
  onClick={async () => {
    setLoading(true); // 1. Empezamos a cargar
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: "Donación conjunta Colonias", 
          amount: donationTotal 
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url; // 2. Saltamos a Stripe
      } else {
        setLoading(false); // Si hay error, liberamos el botón
        throw new Error(data.error || "Error al crear la sesión");
      }
    } catch (err) {
      setLoading(false); // Si hay error, liberamos el botón
      console.error(err);
      alert("No se pudo iniciar el pago. Revisa tu conexión.");
    }
  }}
>
  {loading ? (
    <>
      <span className="spinner"></span> Procesando...
    </>
  ) : (
    donationTotal > 0 
      ? `Confirmar aportación de ${donationTotal} €` 
      : "Selecciona una ayuda para continuar"
  )}
</button>

    </section>

<section id="teaming" style={{ ...card, textAlign: "center" }}>
  <h3>Apóyanos en Teaming</h3>
  <p>Con solo 1€ al mes nos ayudas a salvar vidas.</p>
  
  <div className="teaming-container" style={{ display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
    {/* VERSIÓN PC */}
    <div className="t-desktop">
      <iframe 
        src="https://www.teaming.net/group/spread/widgets/vhhzRoTGtqKuuLnVWB2kVKfrWgONnGQd06Cg6Uu6MSVJh/6?lang=es_ES&TM=true" 
        width="696" 
        height="315" 
        frameBorder="0" 
        scrolling="no" 
        style={{ border: "none" }} 
      />
    </div>

    {/* VERSIÓN MÓVIL */}
    <div className="t-mobile">
      <iframe 
        src="https://www.teaming.net/group/spread/widgets/vhhzRoTGtqKuuLnVWB2kVKfrWgONnGQd06Cg6Uu6MSVJh/7?lang=es_ES&TM=true" 
        width="305" 
        height="567" 
        frameBorder="0" 
        scrolling="no" 
        style={{ border: "none" }} 
      />
    </div>
  </div>

  <div style={{ marginTop: "20px" }}>
    <a href="https://www.teaming.net/asociaciongatocannaturarural" target="_blank" className="btn btn-primary">
      Unirse al Grupo de Teaming
    </a>
  </div>
</section>


      <section id="contacto" style={card} className="contact-card">
        <h3>Contacta con Gatocan Natura Rural</h3>
        <form className="contact-form" onSubmit={submitContactForm}>
          <label htmlFor="nombre">Nombre completo:</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            required
            placeholder="Tu nombre..."
            value={contactForm.nombre}
            onChange={(event) => setContactForm((prev) => ({ ...prev, nombre: event.target.value }))}
          />

          <label htmlFor="email">Correo electrónico:</label>
          <input
            type="email"
            id="email"
            name="email"
            required
            placeholder="tu@email.com"
            value={contactForm.email}
            onChange={(event) => setContactForm((prev) => ({ ...prev, email: event.target.value }))}
          />

          <label htmlFor="mensaje">Tu mensaje:</label>
          <textarea
            id="mensaje"
            name="mensaje"
            rows={5}
            required
            placeholder="Cuéntanos..."
            value={contactForm.mensaje}
            onChange={(event) => setContactForm((prev) => ({ ...prev, mensaje: event.target.value }))}
          />

          <div className="legal">
            <input
              type="checkbox"
              id="privacidad"
              name="privacidad"
              checked={contactForm.privacidad}
              onChange={(event) => setContactForm((prev) => ({ ...prev, privacidad: event.target.checked }))}
              required
            />
            <label htmlFor="privacidad">
              Acepto las condiciones y la <Link href="/politicas">política de privacidad</Link>.
            </label>
          </div>

          <button type="submit" className="btn btn-primary btn-enviar" disabled={isSubmittingContact}>
            {isSubmittingContact ? "Enviando..." : "Enviar mensaje"}
          </button>
          {contactStatus && (
            <p style={{ margin: 0, color: contactStatus.type === "success" ? "#166534" : "#b91c1c", fontWeight: 600 }} role="status">
              {contactStatus.message}
            </p>
          )}
        </form>
      </section>

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
