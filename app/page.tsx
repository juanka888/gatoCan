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

  useEffect(() => { setCurrentIndex(0); }, [filter]);
  useEffect(() => { setMenuOpen(false); }, [status]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!isLightboxOpen || visibleImages.length === 0) return;
      if (event.key === "Escape") setIsLightboxOpen(false);
      if (event.key === "ArrowLeft") setCurrentIndex((index) => (index - 1 + visibleImages.length) % visibleImages.length);
      if (event.key === "ArrowRight") setCurrentIndex((index) => (index + 1) % visibleImages.length);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isLightboxOpen, visibleImages.length]);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setIsLightboxOpen(true);
  };

  const activeImage = visibleImages[currentIndex] || galleryImages[0];

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
      setContactStatus({ type: "error", message: "Debes aceptar las políticas de privacidad." });
      return;
    }
    setIsSubmittingContact(true);
    try {
      const response = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
      });
      if (!response.ok) throw new Error();
      setContactForm({ nombre: "", email: "", mensaje: "", privacidad: false });
      setContactStatus({ type: "success", message: "¡Mensaje enviado con éxito!" });
    } catch {
      setContactStatus({ type: "error", message: "Error al enviar. Inténtalo más tarde." });
    } finally {
      setIsSubmittingContact(false);
    }
  };

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "1rem", display: "grid", gap: "1rem" }}>
      <header id="inicio" className="site-header">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <img src="/img/logo1.png" alt="Logo" className="brand-logo" />
            <div>
              <p className="eyebrow">Asociación de protección animal</p>
              <h1>GatoCan Natura Rural</h1>
            </div>
          </div>
          <div className="hero-actions">
            <a href="https://www.teaming.net/tfg-asociaciongatocan" target="_blank" rel="noopener noreferrer" className="btn btn-primary">Teaming 1€</a>
          </div>
        </div>

        <nav aria-label="Principal" className="main-nav">
          <ul id="main-menu" className={menuOpen ? "is-open" : ""}>
            <li><a href="#inicio">Inicio</a></li>
            <li><a href="#mision">Misión</a></li>
            <li><a href="#galeria">Galería</a></li>
            <li><a href="#noticias">Noticias</a></li>
            <li><a href="#teaming">Teaming</a></li>
            <li><a href="#donar">Donar</a></li>
            <li><a href="#contacto">Contacto</a></li>
          </ul>
        </nav>

        <section className="hero">
          <h2>Cuidamos colonias felinas con responsabilidad</h2>
          <p>Aplicamos el método CER para mejorar la vida de los gatos comunitarios.</p>
          <div className="hero-actions">
            <a href="#donar" className="btn btn-primary">Donar ahora</a>
            <a href="#ayuda" className="btn btn-secondary">Cómo ayudar</a>
          </div>
        </section>
      </header>

      <section id="mision" style={card}><h3>Misión</h3><p>Protección y cuidado de colonias felinas rurales.</p></section>

      <section id="galeria" style={card}>
        <h3>Galería de actuaciones</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "0.75rem" }}>
          {visibleImages.map((image, index) => (
            <button key={image.src} onClick={() => openLightbox(index)} style={{ border: 0, background: "transparent", cursor: "pointer" }}>
              <img src={image.src} alt={image.alt} style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 8 }} />
            </button>
          ))}
        </div>
      </section>

      <section id="noticias" style={card}>
        <NoticiasGatocan />
      </section>

      <section id="donar" style={card} className="donation-card">
        <h3>Haz tu aporte gatuno 🐾</h3>
        {donationCats.map((cat) => (
          <details key={cat.id} className="donation-panel" open={openDonationCatId === cat.id}>
            <summary onClick={(e) => { e.preventDefault(); setOpenDonationCatId(cat.id); }}>
              <span className="cat-summary">
                <img src={cat.image} alt={cat.alt} style={{width:40, height:40, borderRadius:'50%'}} />
                <span>{cat.name}</span>
              </span>
            </summary>
            <div className="cat-options" style={{padding:'10px'}}>
              {donationOptions.map((option) => {
                const key = `${cat.id}-${option.id}`;
                return (
                  <label key={key} style={{display:'block', marginBottom:'5px'}}>
                    <input
                      type="checkbox"
                      checked={Boolean(donationSelections[key])}
                      onChange={(e) => setDonationSelections(prev => ({ ...prev, [key]: e.target.checked }))}
                    />
                    {option.label}
                  </label>
                );
              })}
            </div>
          </details>
        ))}
        <div style={{ marginTop: "20px", padding: "15px", background: "#f8fafc", borderRadius: "12px" }}>
          <p><strong>Total: {donationTotal} €</strong> | Karma: {karmaTotal}</p>
        </div>
      </section>

      {/* SECCIÓN TEAMING RESPONSIVA */}
      <section id="teaming" style={{ ...card, textAlign: "center" }}>
        <style>{`
          .t-desktop { display: block; } .t-mobile { display: none; }
          @media (max-width: 768px) { .t-desktop { display: none; } .t-mobile { display: block; } }
        `}</style>
        <h3>Apóyanos en Teaming</h3>
        <div style={{ display: "flex", justifyContent: "center", marginTop: "15px" }}>
          <div className="t-desktop">
            <iframe src="https://www.teaming.net/group/spread/widgets/vhhzRoTGtqKuuLnVWB2kVKfrWgONnGQd06Cg6Uu6MSVJh/6?lang=es_ES&TM=true" width="696" height="315" frameBorder="0" scrolling="no" style={{ overflow: "hidden" }} />
          </div>
          <div className="t-mobile">
            <iframe src="https://www.teaming.net/group/spread/widgets/vhhzRoTGtqKuuLnVWB2kVKfrWgONnGQd06Cg6Uu6MSVJh/7?lang=es_ES&TM=true" width="305" height="567" frameBorder="0" scrolling="no" style={{ overflow: "hidden" }} />
          </div>
        </div>
      </section>

      <section id="contacto" style={card}>
        <h3>Contacto</h3>
        <form onSubmit={submitContactForm} style={{ display: "grid", gap: "10px" }}>
          <input type="text" placeholder="Nombre" required value={contactForm.nombre} onChange={e => setContactForm({...contactForm, nombre: e.target.value})} />
          <input type="email" placeholder="Email" required value={contactForm.email} onChange={e => setContactForm({...contactForm, email: e.target.value})} />
          <textarea placeholder="Mensaje" value={contactForm.mensaje} onChange={e => setContactForm({...contactForm, mensaje: e.target.value})} />
          <label><input type="checkbox" checked={contactForm.privacidad} onChange={e => setContactForm({...contactForm, privacidad: e.target.checked})} /> Acepto privacidad</label>
          <button type="submit" className="btn btn-primary" disabled={isSubmittingContact}>Enviar</button>
        </form>
      </section>

      {isLightboxOpen && (
        <div onClick={() => setIsLightboxOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.8)", display: "grid", placeItems: "center", zIndex: 1000 }}>
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: 800, color: "#fff", textAlign: "center" }}>
            <img src={activeImage.src} alt={activeImage.alt} style={{ width: "100%", maxHeight: "70vh", objectFit: "contain" }} />
            <p>{activeImage.caption}</p>
            <button onClick={() => setIsLightboxOpen(false)}>Cerrar</button>
          </div>
        </div>
      )}
    </main>
  );
}

const card: CSSProperties = {
  background: "#fff",
  padding: "1.5rem",
  borderRadius: "1rem",
  border: "1px solid #e2e8f0",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
};
