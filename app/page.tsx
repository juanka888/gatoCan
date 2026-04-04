"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from "react";
import { signIn, useSession } from "next-auth/react";
import EuropaPressNews from "./components/EuropaPressNews";
import GatitoRunner from "./components/GatitoRunner";
import NoticiasGatocan from "./components/NoticiasGatocan";

export const dynamic = 'force-dynamic';

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

const gatosColonia = [
  { id: 1, nombre: "Nube", colonia: "Río Norte", imagen: "https://images.pexels.com/photos/165775/pexels-photo-165775.jpeg", detalles: { esterilizacion: "Hecha ✅", enfermedad: "Gingivitis leve", tratamiento: "Antiinflamatorio", desaparicion: "No", edad: "4 años", caracter: "Miedoso" } },
  { id: 2, nombre: "Menta", colonia: "Mirador", imagen: "https://images.pexels.com/photos/617278/pexels-photo-617278.jpeg", detalles: { esterilizacion: "Pendiente ⏳", enfermedad: "Ninguna", tratamiento: "Preventivo", desaparicion: "No", edad: "2 años", caracter: "Cariñoso" } },
  { id: 3, nombre: "Rayo", colonia: "Fonteboa", imagen: "https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg", detalles: { esterilizacion: "Hecha ✅", enfermedad: "Lesión ocular", tratamiento: "Colirio", desaparicion: "No", edad: "7 años", caracter: "Tranquilo" } },
  { id: 4, nombre: "Luna", colonia: "Parque Central", imagen: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=500", detalles: { esterilizacion: "Hecha ✅", enfermedad: "Ninguna", tratamiento: "Revisión", desaparicion: "No", edad: "3 años", caracter: "Activa" } },
  { id: 5, nombre: "Zeus", colonia: "Río Norte", imagen: "https://images.pexels.com/photos/104827/cat-pet-animal-domestic-104827.jpeg", detalles: { esterilizacion: "Pendiente ⏳", enfermedad: "Resfriado", tratamiento: "Antibiótico", desaparicion: "No", edad: "5 años", caracter: "Líder" } },
  { id: 6, nombre: "Oreo", colonia: "Mirador", imagen: "https://images.pexels.com/photos/208984/pexels-photo-208984.jpeg", detalles: { esterilizacion: "Hecha ✅", enfermedad: "Ninguna", tratamiento: "Ninguno", desaparicion: "No", edad: "1 año", caracter: "Juguetón" } },
  { id: 7, nombre: "Misu", colonia: "Río Norte", imagen: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?q=80&w=500", detalles: { esterilizacion: "Hecha ✅", enfermedad: "Ninguna", tratamiento: "Ninguno", desaparicion: "No", edad: "2 años", caracter: "Curiosa" } },
  { id: 8, nombre: "Bigotes", colonia: "Mirador", imagen: "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?q=80&w=500", detalles: { esterilizacion: "Pendiente ⏳", enfermedad: "Asma", tratamiento: "Inhalador", desaparicion: "No", edad: "5 años", caracter: "Independiente" } }
];

const galleryImages: GalleryImage[] = [
  { src: "/img/foto-01.jpg", alt: "Gato negro", category: "capturas", tag: "Capturas", caption: "Captura segura." },
  { src: "/img/foto-02.jpg", alt: "Gato jaula", category: "capturas", tag: "Capturas", caption: "Revisión traslado." },
  { src: "/img/foto-03.jpg", alt: "Gato clínica", category: "capturas", tag: "Capturas", caption: "Zona espera." },
  { src: "/img/foto-04.jpg", alt: "Gato mesa", category: "esterilizaciones", tag: "Esterilizaciones", caption: "Ingreso previo." },
  { src: "/img/foto-05.jpg", alt: "Gato blanco", category: "colonias", tag: "Colonias", caption: "Control individual." },
  { src: "/img/foto-06.jpg", alt: "Gata tricolor", category: "actuaciones", tag: "Actuaciones", caption: "Caso urgente." },
  { src: "/img/foto-07.jpg", alt: "Gato gris", category: "colonias", tag: "Colonias", caption: "Alimentación." },
  { src: "/img/foto-08.jpg", alt: "Gato naranja", category: "capturas", tag: "Capturas", caption: "Trampa preparada." },
  { src: "/img/foto-09.jpg", alt: "Gato siamés", category: "esterilizaciones", tag: "Esterilizaciones", caption: "Post-operatorio." },
];

const donationOptions = [
  { id: "male", label: "Esterilización macho — 60 €", price: 60, karma: 30, icon: "✚", iconClassName: "icon-med" },
  { id: "female", label: "Esterilización femenina — 100 €", price: 100, karma: 50, icon: "♀", iconClassName: "icon-female" },
  { id: "food", label: "Comida mensual — 10 €", price: 10, karma: 10, icon: "🍴", iconClassName: "icon-food" },
  { id: "pipette", label: "Pipeta antiparasitaria — 12 €", price: 12, karma: 8, icon: "PP", iconClassName: "icon-pipette" },
  { id: "sponsor", label: "Apadrina este gato — 15 €/mes", price: 15, karma: 18, icon: "♥", iconClassName: "icon-love" },
];

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [filter, setFilter] = useState<GalleryCategory>("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [colabClicks, setColabClicks] = useState<Record<string, number>>({});
  const [donationSelections, setDonationSelections] = useState<Record<string, boolean>>({});
  const [openDonationCatId, setOpenDonationCatId] = useState<string | number>("");
  const [contactForm, setContactForm] = useState({ nombre: "", email: "", mensaje: "", privacidad: false });
  const [contactStatus, setContactStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [indiceInicio, setIndiceInicio] = useState(0);

  const { data: session, status } = useSession();

  useEffect(() => {
    setMounted(true);
    if (gatosColonia.length > 0) setOpenDonationCatId(gatosColonia[0].id);
    const stored = localStorage.getItem("gatocanColaboradoresClicks");
    if (stored) setColabClicks(JSON.parse(stored));
  }, []);

  const visibleImages = useMemo(() => 
    galleryImages.filter((img) => filter === "all" || img.category === filter), 
  [filter]);

  if (!mounted) {
    return <div className="bg-black min-h-screen" />;
  }

  const anteriorGato = () => { if (indiceInicio > 0) setIndiceInicio(prev => prev - 1); };
  const siguienteGato = () => { if (indiceInicio + 3 < gatosColonia.length) setIndiceInicio(prev => prev + 1); };

  const handlePayment = async (nombreItem: string, precio: number) => {
    setLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nombreItem, amount: precio }),
      });
      const data = await response.json();
      if (data.url) window.location.href = data.url;
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const submitContactForm = async (e: FormEvent) => {
    e.preventDefault();
    if (!contactForm.privacidad) {
      setContactStatus({ type: "error", message: "Debes aceptar la política de privacidad." });
      return;
    }
    setIsSubmittingContact(true);
    try {
      console.log("Enviando formulario:", contactForm);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setContactStatus({ type: "success", message: "¡Mensaje enviado correctamente!" });
      setContactForm({ nombre: "", email: "", mensaje: "", privacidad: false });
    } catch (error) {
      setContactStatus({ type: "error", message: "Error al enviar. Inténtalo de nuevo." });
    } finally {
      setIsSubmittingContact(false);
    }
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

  const gatosVisibles = gatosColonia.slice(indiceInicio, indiceInicio + 3);
  const activeImage = visibleImages[currentIndex] || galleryImages[0];
  const submitContactForm = async (e: FormEvent) => {
    e.preventDefault();
    if (!contactForm.privacidad) {
      setContactStatus({ type: "error", message: "Debes aceptar la política de privacidad." });
      return;
    }
    setIsSubmittingContact(true);
    try {
      console.log("Enviando formulario:", contactForm);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setContactStatus({ type: "success", message: "¡Mensaje enviado correctamente!" });
      setContactForm({ nombre: "", email: "", mensaje: "", privacidad: false });
    } catch (error) {
      setContactStatus({ type: "error", message: "Error al enviar. Inténtalo de nuevo." });
    } finally {
      setIsSubmittingContact(false);
    }
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

  const gatosVisibles = gatosColonia.slice(indiceInicio, indiceInicio + 3);
  const activeImage = visibleImages[currentIndex] || galleryImages[0];

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "1rem", display: "grid", gap: "1rem" }}>
      <header id="inicio" className="site-header">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <img src="/img/logo1.png" alt="Logo" className="brand-logo" />
            <div>
              <p className="eyebrow">Asociación de protección animal</p>
              <h1>GatoCan Natura Rural</h1>
            </div>
          </div>
          <div className="hero-actions">
            {status === "authenticated" ? (
              <Link href="/perfil" className="btn btn-secondary">Mi perfil</Link>
            ) : (
              <button className="btn btn-secondary" onClick={() => signIn("google")}>Acceder</button>
            )}
            <a href="https://www.teaming.net/proyectogatonaturanrural" target="_blank" className="btn btn-primary">Teaming 1€</a>
          </div>
        </div>

        <nav className="main-nav">
          <ul className={menuOpen ? "is-open" : ""}>
            <li><a href="#mision">Misión</a></li>
            <li><a href="#fichas">Fichas</a></li>
            <li><a href="#galeria">Galería</a></li>
            <li><a href="#donar">Donar</a></li>
            <li><a href="/foro">Foro</a></li>
          </ul>
        </nav>
      </header>

      <section id="fichas" style={{ ...card, padding: '20px 0' }} className="flip-card-section">
        <h3 style={{ textAlign: 'center' }}>Fichas de gatos de colonia</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
          <button onClick={anteriorGato} disabled={indiceInicio === 0} style={{ ...flechaStyle, opacity: indiceInicio === 0 ? 0.3 : 1 }}>⬅️</button>
          <div className="flip-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
            {gatosVisibles.map((gato) => (
              <div className="flip-card" key={gato.id}>
                <label className="flip-card-inner">
                  <input type="checkbox" className="flip-toggle" />
                  <div className="flip-face flip-front">
                    <img src={gato.imagen} alt={gato.nombre} style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px' }} />
                    <strong>{gato.nombre}</strong>
                    <button onClick={(e) => { e.preventDefault(); handlePayment(`Apadrinar a ${gato.nombre}`, 10); }} style={botonCaraFrontal}>Apadrinar 10€</button>
                  </div>
                  <div className="flip-face flip-back">
                    <h4>{gato.nombre}</h4>
                    <p>{gato.detalles.esterilizacion} | {gato.detalles.edad}</p>
                    <p>{gato.detalles.tratamiento}</p>
                  </div>
                </label>
              </div>
            ))}
          </div>
          <button onClick={siguienteGato} disabled={indiceInicio + 3 >= gatosColonia.length} style={{ ...flechaStyle, opacity: indiceInicio + 3 >= gatosColonia.length ? 0.3 : 1 }}>➡️</button>
        </div>
      </section>
      <section id="galeria" style={card}>
        <h3>Galería de actuaciones</h3>
        <div style={{ display: "flex", gap: ".5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
          {["all", "colonias", "capturas", "esterilizaciones", "actuaciones"].map((cat) => (
            <button key={cat} onClick={() => setFilter(cat as GalleryCategory)} className={`filter-btn ${filter === cat ? "active" : ""}`}>
              {cat.toUpperCase()}
            </button>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: ".5rem" }}>
          {visibleImages.map((image, index) => (
            <img key={image.src} src={image.src} alt={image.alt} onClick={() => { setCurrentIndex(index); setIsLightboxOpen(true); }} style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 8, cursor: "pointer" }} />
          ))}
        </div>
      </section>

      <section style={card}>
        <GatitoRunner embedded showLeaderboard={false} />
      </section>

      <section id="donar" style={card} className="donation-card">
        <h3>Haz tu aporte gatuno 🐾</h3>
        {gatosColonia.map((cat) => (
          <details key={cat.id} className="donation-panel" open={openDonationCatId === cat.id}>
            <summary onClick={(e) => { e.preventDefault(); setOpenDonationCatId(cat.id); }}>{cat.nombre}</summary>
            <div className="cat-options">
              {donationOptions.map((opt) => (
                <label key={`${cat.id}-${opt.id}`} className="donation-option">
                  <input type="checkbox" checked={!!donationSelections[`${cat.id}-${opt.id}`]} onChange={(e) => setDonationSelections(prev => ({ ...prev, [`${cat.id}-${opt.id}`]: e.target.checked }))} />
                  <span>{opt.icon} {opt.label}</span>
                </label>
              ))}
            </div>
          </details>
        ))}
        <div className="donation-summary">
          <p>Total: {donationTotal} € | Karma: {karmaTotal}</p>
          <button className="btn btn-primary" onClick={() => handlePayment("Donación conjunta", donationTotal)} disabled={donationTotal === 0}>Donar ahora</button>
        </div>
      </section>
      <section id="contacto" style={card}>
        <h3>Contacto</h3>
        <form onSubmit={submitContactForm} className="contact-form">
          <input type="text" placeholder="Nombre" required value={contactForm.nombre} onChange={e => setContactForm({...contactForm, nombre: e.target.value})} />
          <input type="email" placeholder="Email" required value={contactForm.email} onChange={e => setContactForm({...contactForm, email: e.target.value})} />
          <textarea placeholder="Mensaje" required value={contactForm.mensaje} onChange={e => setContactForm({...contactForm, mensaje: e.target.value})} />
          <label><input type="checkbox" checked={contactForm.privacidad} onChange={e => setContactForm({...contactForm, privacidad: e.target.checked})} /> Acepto la privacidad</label>
          <button type="submit" disabled={isSubmittingContact}>{isSubmittingContact ? "Enviando..." : "Enviar"}</button>
          {contactStatus && <p className={contactStatus.type}>{contactStatus.message}</p>}
        </form>
      </section>

      {isLightboxOpen && (
        <div className="lightbox-overlay" onClick={() => setIsLightboxOpen(false)}>
          <img src={activeImage.src} alt={activeImage.alt} />
          <p>{activeImage.caption}</p>
        </div>
      )}
    </main>
  );
}

const card: CSSProperties = { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "1rem" };
const flechaStyle = { background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', color: '#ff4757' };
const botonCaraFrontal = { backgroundColor: '#ff4757', color: 'white', padding: '8px 12px', borderRadius: '20px', border: 'none', fontWeight: 'bold' as const, cursor: 'pointer', fontSize: '0.8rem', marginTop: '10px' };