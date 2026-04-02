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
  { src: "/img/foto-01.jpg", alt: "Gato negro", category: "capturas", tag: "Capturas", caption: "Captura segura." },
  { src: "/img/foto-02.jpg", alt: "Gato en jaula", category: "capturas", tag: "Capturas", caption: "Traslado." },
  { src: "/img/foto-03.jpg", alt: "Gato en clínica", category: "capturas", tag: "Capturas", caption: "Zona de espera." },
  { src: "/img/foto-04.jpg", alt: "Revisión", category: "esterilizaciones", tag: "Esterilizaciones", caption: "Revisión veterinaria." },
  { src: "/img/foto-05.jpg", alt: "Gato blanco", category: "colonias", tag: "Colonias", caption: "Control de colonia." },
  { src: "/img/foto-06.jpg", alt: "Gata tricolor", category: "actuaciones", tag: "Actuaciones", caption: "Caso urgente." },
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
  { id: "luna", image: "https://images.pexels.com/photos/320014/pexels-photo-320014.jpeg", alt: "Luna", name: "Gatete Luna" },
  { id: "misu", image: "https://images.pexels.com/photos/1276553/pexels-photo-1276553.jpeg", alt: "Misu", name: "Gatete Misu" },
  { id: "bigotes", image: "https://images.pexels.com/photos/617278/pexels-photo-617278.jpeg", alt: "Bigotes", name: "Gatete Bigotes" },
];

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [filter, setFilter] = useState<GalleryCategory>("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [donationSelections, setDonationSelections] = useState<Record<string, boolean>>({});
  const [openDonationCatId, setOpenDonationCatId] = useState<string>(donationCats[0]?.id ?? "");
  const [contactForm, setContactForm] = useState({ nombre: "", email: "", mensaje: "", privacidad: false });
  const [contactStatus, setContactStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const { status } = useSession();

  const visibleImages = useMemo(() => galleryImages.filter((img) => filter === "all" || img.category === filter), [filter]);

  const donationTotal = donationCats.reduce((total, cat) => {
    return total + donationOptions.reduce((sub, opt) => donationSelections[`${cat.id}-${opt.id}`] ? sub + opt.price : sub, 0);
  }, 0);

  const karmaTotal = donationCats.reduce((total, cat) => {
    return total + donationOptions.reduce((sub, opt) => donationSelections[`${cat.id}-${opt.id}`] ? sub + opt.karma : sub, 0);
  }, 0);

  const submitContactForm = async (e: FormEvent) => {
    e.preventDefault();
    if (!contactForm.privacidad) return setContactStatus({ type: "error", message: "Acepta la privacidad." });
    setIsSubmittingContact(true);
    try {
      const res = await fetch("/api/contacto", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(contactForm) });
      if (res.ok) {
        setContactForm({ nombre: "", email: "", mensaje: "", privacidad: false });
        setContactStatus({ type: "success", message: "¡Enviado!" });
      }
    } catch { setContactStatus({ type: "error", message: "Error al enviar." }); }
    finally { setIsSubmittingContact(false); }
  };

  const activeImage = visibleImages[currentIndex] || galleryImages[0];

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "1rem", display: "grid", gap: "2rem" }}>
      <header id="inicio">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <img src="/img/logo1.png" alt="Logo" style={{ height: 60 }} />
            <div>
              <p style={{ fontSize: 12, margin: 0, color: "#64748b" }}>Asociación de protección animal</p>
              <h1 style={{ margin: 0, fontSize: 24 }}>GatoCan Natura Rural</h1>
            </div>
          </div>
          <a href="https://www.teaming.net/asociaciongatocannaturarural" target="_blank" className="btn btn-primary">Teaming 1€</a>
        </div>
      </header>

      <section id="mision" style={card}>
        <h3>Nuestra Misión</h3>
        <p>Cuidamos y protegemos las colonias felinas mediante el método CER.</p>
      </section>

      <section id="galeria" style={card}>
        <h3>Galería</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px" }}>
          {visibleImages.map((img, i) => (
            <img key={i} src={img.src} onClick={() => { setCurrentIndex(i); setIsLightboxOpen(true); }} style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 8, cursor: "pointer" }} />
          ))}
        </div>
      </section>

      <section id="noticias" style={card}>
        <NoticiasGatocan />
      </section>

      {/* SECCIÓN TEAMING RESPONSIVA DEFINITIVA */}
      <section id="teaming" style={{ ...card, textAlign: "center", padding: "20px" }}>
        <style>{`
          .t-desktop { display: block; }
          .t-mobile { display: none; }
          @media (max-width: 768px) {
            .t-desktop { display: none; }
            .t-mobile { display: block; }
          }
        `}</style>
        <h3>Apóyanos en Teaming</h3>
        <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "20px" }}>Ayúdanos a cubrir gastos veterinarios con solo 1€ al mes.</p>
        <div style={{ display: "flex", justifyContent: "center", width: "100%", overflow: "hidden" }}>
          <div className="t-desktop">
            <iframe src="https://www.teaming.net/group/spread/widgets/vhhzRoTGtqKuuLnVWB2kVKfrWgONnGQd06Cg6Uu6MSVJh/6?lang=es_ES&TM=true" width="696" height="315" frameBorder="0" scrolling="no" style={{ overflow: "hidden", maxWidth: "100%" }} />
          </div>
          <div className="t-mobile">
            <iframe src="https://www.teaming.net/group/spread/widgets/vhhzRoTGtqKuuLnVWB2kVKfrWgONnGQd06Cg6Uu6MSVJh/7?lang=es_ES&TM=true" width="305" height="567" frameBorder="0" scrolling="no" style={{ overflow: "hidden" }} />
          </div>
        </div>
        <div style={{ marginTop: "20px" }}>
          <a href="https://www.teaming.net/asociaciongatocannaturarural" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: "12px 25px", borderRadius: "10px", display: "inline-block", textDecoration: "none" }}>
            Unirse al Grupo de Teaming ↗
          </a>
        </div>
      </section>

      <section id="donar" style={card}>
        <h3>Dona para un gatete 🐾</h3>
        {donationCats.map((cat) => (
          <details key={cat.id} open={openDonationCatId === cat.id} style={{ marginBottom: "1rem", border: "1px solid #eee", borderRadius: 8, padding: 10 }}>
            <summary onClick={(e) => { e.preventDefault(); setOpenDonationCatId(cat.id); }} style={{ cursor: "pointer", fontWeight: "bold" }}>
              {cat.name}
            </summary>
            <div style={{ padding: "10px" }}>
              {donationOptions.map((opt) => (
                <label key={opt.id} style={{ display: "block", marginBottom: 5 }}>
                  <input type="checkbox" checked={!!donationSelections[`${cat.id}-${opt.id}`]} onChange={(e) => setDonationSelections({ ...donationSelections, [`${cat.id}-${opt.id}`]: e.target.checked })} /> {opt.label}
                </label>
              ))}
            </div>
          </details>
        ))}
        <div style={{ background: "#f8fafc", padding: 15, borderRadius: 10 }}>
          <p><strong>Total: {donationTotal} €</strong> | Karma: {karmaTotal}</p>
          <a href="#contacto" className="btn btn-primary" style={{ width: "100%", display: "block", textAlign: "center" }}>Confirmar ayuda</a>
        </div>
      </section>

      <section id="contacto" style={card}>
        <h3>Contacto</h3>
        <form onSubmit={submitContactForm} style={{ display: "grid", gap: "1rem" }}>
          <input type="text" placeholder="Nombre" required value={contactForm.nombre} onChange={e => setContactForm({ ...contactForm, nombre: e.target.value })} style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }} />
          <input type="email" placeholder="Email" required value={contactForm.email} onChange={e => setContactForm({ ...contactForm, email: e.target.value })} style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }} />
          <textarea placeholder="Mensaje" rows={4} required value={contactForm.mensaje} onChange={e => setContactForm({ ...contactForm, mensaje: e.target.value })} style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }} />
          <label style={{ fontSize: 12 }}><input type="checkbox" checked={contactForm.privacidad} onChange={e => setContactForm({ ...contactForm, privacidad: e.target.checked })} /> Acepto la privacidad</label>
          <button type="submit" disabled={isSubmittingContact} className="btn btn-primary">{isSubmittingContact ? "Enviando..." : "Enviar"}</button>
          {contactStatus && <p>{contactStatus.message}</p>}
        </form>
      </section>

      {isLightboxOpen && (
        <div onClick={() => setIsLightboxOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 2000, display: "grid", placeItems: "center" }}>
          <div onClick={e => e.stopPropagation()} style={{ color: "#fff", textAlign: "center", padding: 20 }}>
            <img src={activeImage.src} style={{ maxWidth: "100%", maxHeight: "80vh" }} />
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
};
              
