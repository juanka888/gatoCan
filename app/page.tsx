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
    [span_0](start_span)caption: "Captura segura en jaula humanitaria.",[span_0](end_span)
  },
  {
    src: "/img/foto-02.jpg",
    alt: "Gato en jaula verde de captura",
    category: "capturas",
    tag: "Capturas",
    [span_1](start_span)caption: "Preparación y revisión durante el traslado.",[span_1](end_span)
  },
  {
    src: "/img/foto-03.jpg",
    alt: "Gato en jaula cubierta en clínica",
    category: "capturas",
    tag: "Capturas",
    [span_2](start_span)caption: "Zona de espera para minimizar estrés.",[span_2](end_span)
  },
  {
    src: "/img/foto-04.jpg",
    alt: "Gato en jaula sobre mesa clínica",
    category: "esterilizaciones",
    tag: "Esterilizaciones",
    [span_3](start_span)caption: "Ingreso para revisión previa veterinaria.",[span_3](end_span)
  },
  {
    src: "/img/foto-05.jpg",
    alt: "Gato blanco en jaula de observación",
    category: "colonias",
    tag: "Colonias",
    [span_4](start_span)caption: "Control individualizado por colonia.",[span_4](end_span)
  },
  {
    src: "/img/foto-06.jpg",
    alt: "Gata tricolor en transportín de captura",
    category: "actuaciones",
    tag: "Actuaciones",
    [span_5](start_span)caption: "Actuación coordinada para caso urgente.",[span_5](end_span)
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
  [span_6](start_span){ id: "sponsor", label: "Apadrina este gato — 15 €/mes", price: 15, karma: 18, icon: "♥", iconClassName: "icon-love" },[span_6](end_span)
];

const donationCats = [
  {
    id: "luna",
    image: "https://images.pexels.com/photos/320014/pexels-photo-320014.jpeg",
    alt: "Foto del gatete Luna",
    [span_7](start_span)name: "Gatete Luna (pincha para ver opciones)",[span_7](end_span)
  },
  {
    id: "misu",
    image: "https://images.pexels.com/photos/1276553/pexels-photo-1276553.jpeg",
    alt: "Foto del gatete Misu",
    [span_8](start_span)name: "Gatete Misu (pincha para ver opciones)",[span_8](end_span)
  },
  {
    id: "bigotes",
    image: "https://images.pexels.com/photos/617278/pexels-photo-617278.jpeg",
    alt: "Foto del gatete Bigotes",
    [span_9](start_span)name: "Gatete Bigotes (pincha para ver opciones)",[span_9](end_span)
  },
];

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [filter, setFilter] = useState<GalleryCategory>("all");
  [span_10](start_span)const [currentIndex, setCurrentIndex] = useState(0);[span_10](end_span)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  [span_11](start_span)const [colabClicks, setColabClicks] = useState<Record<string, number>>({});[span_11](end_span)
  [span_12](start_span)const [donationSelections, setDonationSelections] = useState<Record<string, boolean>>({});[span_12](end_span)
  const [openDonationCatId, setOpenDonationCatId] = useState<string>(donationCats[0]?.id ?? "");
  [span_13](start_span)const [contactForm, setContactForm] = useState({ nombre: "", email: "", mensaje: "", privacidad: false });[span_13](end_span)
  const [contactStatus, setContactStatus] = useState<{ type: "success" | [span_14](start_span)"error"; message: string } | null>(null);[span_14](end_span)
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  [span_15](start_span)const { status } = useSession();[span_15](end_span)

  const visibleImages = useMemo(
    () => galleryImages.filter((image) => filter === "all" || image.category === filter),
    [filter],
  );

  useEffect(() => {
    setCurrentIndex(0);
  [span_16](start_span)}, [filter]);[span_16](end_span)

  useEffect(() => {
    setMenuOpen(false);
  [span_17](start_span)}, [status]);[span_17](end_span)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!isLightboxOpen || visibleImages.length === 0) return;
      if (event.key === "Escape") setIsLightboxOpen(false);
      if (event.key === "ArrowLeft") setCurrentIndex((index) => (index - 1 + visibleImages.length) % visibleImages.length);
      if (event.key === "ArrowRight") setCurrentIndex((index) => (index + 1) % visibleImages.length);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  [span_18](start_span)}, [isLightboxOpen, visibleImages.length]);[span_18](end_span)

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setIsLightboxOpen(true);
  [span_19](start_span)};[span_19](end_span)

  const activeImage = visibleImages[currentIndex] || galleryImages[0];

  const donationTotal = donationCats.reduce((total, cat) => {
    return total + donationOptions.reduce((subtotal, option) => {
      return donationSelections[`${cat.id}-${option.id}`] ? subtotal + option.price : subtotal;
    }, 0);
  [span_20](start_span)}, 0);[span_20](end_span)

  const karmaTotal = donationCats.reduce((total, cat) => {
    return total + donationOptions.reduce((subtotal, option) => {
      return donationSelections[`${cat.id}-${option.id}`] ? subtotal + option.karma : subtotal;
    }, 0);
  [span_21](start_span)}, 0);[span_21](end_span)

  const submitContactForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!contactForm.privacidad) {
      [span_22](start_span)setContactStatus({ type: "error", message: "Debes aceptar las políticas de privacidad para continuar." });[span_22](end_span)
      [span_23](start_span)return;[span_23](end_span)
    }
    setIsSubmittingContact(true);
    setContactStatus(null);
    try {
      const response = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
      });
      [span_24](start_span)if (!response.ok) throw new Error("No se pudo enviar el mensaje");[span_24](end_span)
      [span_25](start_span)setContactForm({ nombre: "", email: "", mensaje: "", privacidad: false });[span_25](end_span)
      [span_26](start_span)setContactStatus({ type: "success", message: "¡Mensaje enviado con éxito!" });[span_26](end_span)
    } catch (error) {
      [span_27](start_span)setContactStatus({ type: "error", message: "No hemos podido enviar el mensaje. Inténtalo de nuevo." });[span_27](end_span)
    } finally {
      [span_28](start_span)setIsSubmittingContact(false);[span_28](end_span)
    }
  };

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "1rem", display: "grid", gap: "1rem" }}>
      <header id="inicio" className="site-header">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <img src="/img/logo1.png" alt="Logo de GatoCan Natura Rural" className="brand-logo" />
            <div>
              [span_29](start_span)<p className="eyebrow">Asociación de protección animal</p>[span_29](end_span)
              <h1>GatoCan Natura Rural</h1>
            </div>
          </div>
          <div className="hero-actions">
            {status === "authenticated" ? (
              [span_30](start_span)<a href="/perfil" className="btn btn-secondary">Ir a mi perfil</a>[span_30](end_span)
            ) : (
              <>
                <button type="button" className="btn btn-secondary" onClick={() => signIn("google", { callbackUrl: "/perfil" })}>Acceder</button>
                [span_31](start_span)<a href="/register" className="btn btn-secondary">Crear cuenta</a>[span_31](end_span)
              </>
            )}
            [span_32](start_span)<a href="https://www.teaming.net/tfg-asociaciongatocan" target="_blank" rel="noopener noreferrer" className="btn btn-primary">Teaming 1€</a>[span_32](end_span)
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
            [span_33](start_span)<li><a href="#contacto">Contacto</a></li>[span_33](end_span)
          </ul>
        </nav>

        <section className="hero">
          [span_34](start_span)<h2>Cuidamos colonias felinas con responsabilidad y compromiso</h2>[span_34](end_span)
          [span_35](start_span)<p>Aplicamos el método CER para mejorar la vida de los gatos comunitarios.</p>[span_35](end_span)
          <div className="hero-actions">
            <a href="#donar" className="btn btn-primary">Donar ahora</a>
            [span_36](start_span)<a href="#ayuda" className="btn btn-secondary">Hazte voluntario/a</a>[span_36](end_span)
          </div>
        </section>
      </header>

      [span_37](start_span)<section id="mision" style={card}><h3>Misión y valores</h3><p>Trabajamos para proteger y cuidar a los gatos de colonias felinas.</p></section>[span_37](end_span)

      <section id="galeria" style={card}>
        <h3>Galería de actuaciones</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "0.75rem" }}>
          {visibleImages.map((image, index) => (
            <button key={image.src} type="button" onClick={() => openLightbox(index)} style={{ border: 0, background: "transparent", cursor: "pointer" }}>
              [span_38](start_span)<img src={image.src} alt={image.alt} style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 8 }} />[span_38](end_span)
            </button>
          ))}
        </div>
      </section>

      <section id="noticias" style={card}>
        [span_39](start_span)<NoticiasGatocan />[span_39](end_span)
      </section>

      <section id="donar" style={card} className="donation-card">
        [span_40](start_span)<h3>Haz tu aporte gatuno 🐾</h3>[span_40](end_span)
        {donationCats.map((cat) => (
          <details key={cat.id} className="donation-panel" open={openDonationCatId === cat.id}>
            [span_41](start_span)<summary onClick={(event) => { event.preventDefault(); setOpenDonationCatId(cat.id); }}>[span_41](end_span)
              <span className="cat-summary">
                <img src={cat.image} alt={cat.alt} style={{width:40, height:40, borderRadius:'50%'}} />
                [span_42](start_span)<span>{cat.name}</span>[span_42](end_span)
              </span>
            </summary>
            <div className="cat-options" style={{padding:'10px'}}>
              {donationOptions.map((option) => {
                const key = `${cat.id}-${option.id}`;
                return (
                  <label key={key} style={{display:'block', marginBottom:'5px'}}>
                    <input
                      type="checkbox"
                      [span_43](start_span)checked={Boolean(donationSelections[key])}[span_43](end_span)
                      onChange={(event) => {
                        const checked = event.target.checked;
                        [span_44](start_span)setDonationSelections((prev) => ({ ...prev, [key]: checked }));[span_44](end_span)
                      }}
                    />{" "}
                    [span_45](start_span){option.label}[span_45](end_span)
                  </label>
                );
              })}
            </div>
          </details>
        ))}
        <div style={{ marginTop: "20px", padding: "15px", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <p><strong>Total donación: {donationTotal} €</strong></p>
          <p style={{ color: "#059669" }}>✨ Puntos Karma ganados: {karmaTotal}</p>
          [span_46](start_span)<a href="#contacto" className="btn btn-primary" style={{ display: 'block', textAlign: 'center', marginTop: '10px' }}>Confirmar mi aportación</a>[span_46](end_span)
        </div>
      </section>

      {/* SECCIÓN TEAMING RESPONSIVA */}
      <section id="teaming" style={{ ...card, textAlign: "center" }}>
        <style>{`
          .t-desktop { display: block; }
          .t-mobile { display: none; }
          @media (max-width: 768px) {
            .t-desktop { display: none; }
            .t-mobile { display: block; }
          }
        `}</style>
        <h3 style={{ marginBottom: "15px" }}>Apóyanos también desde Teaming</h3>
        <p style={{ marginBottom: "20px", fontSize: "14px", color: "#64748b" }}>
          [span_47](start_span)Con solo 1 € al mes puedes ayudarnos a cubrir comida y tratamientos veterinarios.[span_47](end_span)
        </p>
        <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
          <div className="t-desktop">
            <iframe
              src="https://www.teaming.net/group/spread/widgets/vhhzRoTGtqKuuLnVWB2kVKfrWgONnGQd06Cg6Uu6MSVJh/6?lang=es_ES&TM=true"
              width="696" height="315" frameBorder="0" scrolling="no" style={{ overflow: "hidden", maxWidth: "100%" }}
              [span_48](start_span)title="Teaming Horizontal"[span_48](end_span)
            />
          </div>
          <div className="t-mobile">
            <iframe
              src="https://www.teaming.net/group/spread/widgets/vhhzRoTGtqKuuLnVWB2kVKfrWgONnGQd06Cg6Uu6MSVJh/7?lang=es_ES&TM=true"
              width="305" height="567" frameBorder="0" scrolling="no" style={{ overflow: "hidden" }}
              title="Teaming Vertical"
            />
          </div>
        </div>
      </section>

      <section id="contacto" style={card} className="contact-card">
        [span_49](start_span)<h3>Contacta con Gatocan Natura Rural</h3>[span_49](end_span)
        [span_50](start_span)<form onSubmit={submitContactForm} style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>[span_50](end_span)
          <input 
            type="text" placeholder="Nombre completo" required 
            value={contactForm.nombre}
            onChange={(e) => setContactForm((prev) => ({ ...prev, nombre: e.target.value }))}
            [span_51](start_span)style={{ padding: ".6rem", borderRadius: 8, border: "1px solid #cbd5e1" }}[span_51](end_span)
          />
          <input 
            type="email" placeholder="tu@email.com" required 
            value={contactForm.email}
            onChange={(e) => setContactForm((prev) => ({ ...prev, email: e.target.value }))}
            [span_52](start_span)style={{ padding: ".6rem", borderRadius: 8, border: "1px solid #cbd5e1" }}[span_52](end_span)
          />
          <textarea 
            placeholder="Cuéntanos..." rows={5} required 
            value={contactForm.mensaje}
            onChange={(e) => setContactForm((prev) => ({ ...prev, mensaje: e.target.value }))}
            [span_53](start_span)style={{ padding: ".6rem", borderRadius: 8, border: "1px solid #cbd5e1" }}[span_53](end_span)
          />
          <label style={{ display: "flex", alignItems: "center", gap: ".5rem", fontSize: "13px" }}>
            <input 
              type="checkbox" checked={contactForm.privacidad} required
              onChange={(e) => setContactForm((prev) => ({ ...prev, privacidad: e.target.checked }))}
            [span_54](start_span)/>[span_54](end_span)
            [span_55](start_span)Acepto las condiciones y la <Link href="/politicas">política de privacidad</Link>.[span_55](end_span)
          </label>
          <button type="submit" className="btn btn-primary" disabled={isSubmittingContact}>
            {isSubmittingContact ? [span_56](start_span)"Enviando..." : "Enviar mensaje"}[span_56](end_span)
          </button>
          {contactStatus && (
            <p style={{ color: contactStatus.type === "success" ? "#166534" : "#b91c1c", fontWeight: 600 }}>
              [span_57](start_span){contactStatus.message}[span_57](end_span)
            </p>
          )}
        </form>
      </section>

      {isLightboxOpen && (
        [span_58](start_span)<div role="dialog" onClick={() => setIsLightboxOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.85)", display: "grid", placeItems: "center", zIndex: 1000, padding: "1rem" }}>[span_58](end_span)
          [span_59](start_span)<div onClick={(e) => e.stopPropagation()} style={{ maxWidth: 860, width: "100%", color: "#fff", textAlign: "center" }}>[span_59](end_span)
            [span_60](start_span)<div style={{ display: "flex", justifyContent: "space-between", marginBottom: ".5rem" }}>[span_60](end_span)
              <button type="button" onClick={() => setIsLightboxOpen(false)}>Cerrar ×</button>
              <div style={{ display: "flex", gap: ".5rem" }}>
                <button type="button" onClick={() => setCurrentIndex((index) => (index - 1 + visibleImages.length) % visibleImages.length)}>‹ Ant.</button>
                <button type="button" onClick={() => setCurrentIndex((index) => (index + 1) % visibleImages.length)}>Sig. [span_61](start_span)›</button>[span_61](end_span)
              </div>
            </div>
            [span_62](start_span)<img src={activeImage.src} alt={activeImage.alt} style={{ width: "100%", maxHeight: "75vh", objectFit: "contain", borderRadius: 12 }} />[span_62](end_span)
            [span_63](start_span)<p style={{ marginTop: ".5rem" }}>{activeImage.caption}</p>[span_63](end_span)
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
  [span_64](start_span)padding: "1rem",[span_64](end_span)
};
