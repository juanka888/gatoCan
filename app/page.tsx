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

const donationCats = [
  {
    id: "luna",
    image: "https://images.pexels.com/photos/320014/pexels-photo-320014.jpeg",
    alt: "Foto del gatete Luna",
    name: "Gatete Luna (pincha para ver opciones)",
  },
  {
    id: "misu",
    image: "https://images.pexels.com/photos/1276553/pexels-photo-1276553.jpeg",
    alt: "Foto del gatete Misu",
    name: "Gatete Misu (pincha para ver opciones)",
  },
  {
    id: "bigotes",
    image: "https://images.pexels.com/photos/617278/pexels-photo-617278.jpeg",
    alt: "Foto del gatete Bigotes",
    name: "Gatete Bigotes (pincha para ver opciones)",
  },
];



export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [filter, setFilter] = useState<GalleryCategory>("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [colabClicks, setColabClicks] = useState<Record<string, number>>({});
  const [donationSelections, setDonationSelections] = useState<Record<string, boolean>>({});
  const [openDonationCatId, setOpenDonationCatId] = useState<string>(donationCats[0]?.id ?? "");
  const [contactForm, setContactForm] = useState({ nombre: "", email: "", mensaje: "", privacidad: false });
  const [contactStatus, setContactStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
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

  const donationTotal = donationCats.reduce((total, cat) => {
    return total + donationOptions.reduce((subtotal, option) => {
      return donationSelections[`${cat.id}-${option.id}`] ? subtotal + option.price : subtotal;
    }, 0);
  }, 0);

  const karmaTotal = donationCats.reduce((total, cat) => {
    return total + donationOptions.reduce((subtotal, option) => {
      return donationSelections[`${cat.id}-${option.id}`] ? subtotal + option.karma : subtotal;
    }, 0);
  }, 0);

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
              href="https://www.teaming.net/asociaciongatocannaturarural"
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
        <NoticiasGatocan />
      </section>

      <section id="donar" style={card} className="donation-card">
        <h3>Apoya nuestro trabajo con una donación</h3>
        <p>Cada aportación nos ayuda a cubrir gastos veterinarios, alimentación y tratamientos de urgencia.</p>
        <a href="#contacto" className="btn btn-primary">Quiero donar</a>
        <h3>Haz tu aporte gatuno 🐾</h3>
        <p>Abre cada gatete y marca el apoyo que quieras cubrir. Verás el total y tus <strong>Puntos Karma</strong> al momento.</p>

        {donationCats.map((cat) => (
          <details key={cat.id} className="donation-panel" open={openDonationCatId === cat.id}>
            <summary
              onClick={(event) => {
                event.preventDefault();
                setOpenDonationCatId(cat.id);
              }}
            >
              <span className="cat-summary">
                <img src={cat.image} alt={cat.alt} />
                <span>{cat.name}</span>
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
                      checked={Boolean(donat
                                       ionSelections[key])}
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

        <a href="#contacto" className="btn btn-primary">Quiero confirmar mi aportación</a>
      
      <section id="teaming" style={{ ...card, borderColor: "#3b82f6", overflow: "hidden" }}>
  <div style={{ textAlign: "center", marginBottom: "15px" }}>
    <h3 style={{ color: "#1e40af", marginBottom: "5px" }}>🐾 Colabora con 1€ al mes</h3>
    <p style={{ fontSize: "14px", color: "#64748b" }}>Únete a nuestro grupo de Teaming, es seguro y automático.</p>
  </div>

  <div className="teaming-responsive-container" style={{ width: "100%" }}>
    <style>{`
      /* OCULTAR/MOSTRAR SEGÚN PANTALLA */
      .teaming-desktop { display: block; }
      .teaming-mobile { display: none; }

      @media (max-width: 768px) {
        .teaming-desktop { display: none; }
        .teaming-mobile { display: block; }
      }

      /* ESTILO PARA QUE LOS IFRAMES NO TENGAN BORDES FEOS */
      .teaming-iframe {
        width: 100%;
        border: none;
        display: block;
        margin: 0 auto;
      }
    `}</style>

    {/* VERSIÓN PC (Horizontal / Apaisado) */}
    <div className="teaming-desktop">
      <iframe
        className="teaming-iframe"
        src="https://www.teaming.net/group/spread/widgets/vhhzRoTGtqKuuLnVWB2kVKfrWgONnGQd06Cg6Uu6MSVJh/6?lang=es_ES&TM=true"
        height="250"
        scrolling="no"
        title="Teaming Horizontal PC"
      />
    </div>

    {/* VERSIÓN MÓVIL (Vertical / Estrecho) */}
    <div className="teaming-mobile">
      <iframe
        className="teaming-iframe"
        src="https://www.teaming.net/group/spread/widgets/vhhzRoTGtqKuuLnVWB2kVKfrWgONnGQd06Cg6Uu6MSVJh/3?lang=es_ES&TM=true"
        height="450"
        scrolling="no"
        title="Teaming Vertical Móvil"
      />
    </div>
  </div>

  <div style={{ textAlign: "center", marginTop: "15px" }}>
    <a 
      href="https://www.teaming.net/tfg-asociaciongatocan" 
      target="_blank" 
      rel="noopener noreferrer"
      style={{ 
        display: "inline-block", 
        padding: "10px 20px", 
        background: "#2563eb", 
        color: "#fff", 
        borderRadius: "10px", 
        textDecoration: "none", 
        fontWeight: "bold",
        fontSize: "13px"
      }}
    >
      Unirse directamente en Teaming.net ↗
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
