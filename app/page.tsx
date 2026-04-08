"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import GatoCards from "./components/GatoCards";
import { gatosColonia } from "@/lib/gatos"; 
import ContactoForm from "./components/ContactoForm";
import GatitoRunner from "./components/GatitoRunner";
import DonationSection from "./components/DonationSection";
import NoticiasGatocan from "./components/NoticiasGatocan";
import GaleriaActuaciones from "./components/GaleriaActuaciones";
import TeamingWidget from "./components/TeamingWidget";

// --- ESTILOS MEJORADOS ---
const card: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: "16px",
  padding: "2rem",
  width: "100%",
  maxWidth: "1200px",
  margin: "0 auto 2rem auto",
  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
};

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false); // Nuevo para el dropdown de perfil
  const { data: session, status } = useSession();

  const [showDonationModal, setShowDonationModal] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<{name: string, amount: number} | null>(null);

  const avatar = useMemo(() => 
    session?.user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(session?.user?.name || "G")}&background=0f4c5c&color=fff`,
    [session]
  );

  useEffect(() => { setMenuOpen(false); setUserMenuOpen(false); }, [status]);

  const handlePayment = async (name: string, amount: number) => {
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, amount, userId: session?.user?.email || "anonymous" }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (error) { alert("Error en la conexión."); }
  };

  const handleDonationClick = (name: string, amount: number) => {
    if (status === "authenticated") { handlePayment(name, amount); } 
    else { setSelectedDonation({ name, amount }); setShowDonationModal(true); }
  };

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "1rem", display: "grid", gap: "1rem" }}>
      
      {/* MODAL DE DONACIÓN */}
      {showDonationModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', padding: '2.5rem', borderRadius: '20px', maxWidth: '450px', textAlign: 'center' }}>
            <h3 style={{ color: '#ff4757', marginBottom: '1rem' }}>¡Gracias por tu ayuda! 🐾</h3>
            <p style={{ marginBottom: '1.5rem', color: '#444' }}>Accede para ganar Karma o dona de forma anónima.</p>
            <button onClick={() => signIn("google", { callbackUrl: "/perfil" })} className="btn btn-primary" style={{ width: '100%', marginBottom: '12px' }}>🔑 Acceder y ganar Karma</button>
            <button onClick={() => { if(selectedDonation) handlePayment(selectedDonation.name, selectedDonation.amount); setShowDonationModal(false); }} className="btn btn-secondary" style={{ width: '100%', background: '#f1f2f6' }}>🕶️ Donar de forma anónima</button>
            <button onClick={() => setShowDonationModal(false)} style={{ marginTop: '20px', background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}>Volver atrás</button>
          </div>
        </div>
      )}

      {/* HEADER CON NAVBAR FIJO */}
      <header id="inicio" className="site-header">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <img src="/img/logo1.png" alt="Logo" className="brand-logo" />
            <div>
              <p className="eyebrow">Asociación de protección animal</p>
              <h1 style={{ fontSize: '1.8rem' }}>GatoCan Natura Rural</h1>
            </div>
          </div>
          
          <div className="hero-actions" style={{ position: 'relative' }}>
            {status === "loading" ? null : session ? (
              <div style={{ position: 'relative' }}>
                <img 
                  src={avatar} 
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  alt="Perfil" 
                  style={{ width: "45px", height: "45px", borderRadius: "50%", cursor: 'pointer', border: '2px solid #fff', boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }} 
                />
                {userMenuOpen && (
                  <div style={{ position: 'absolute', right: 0, top: '55px', background: '#fff', borderRadius: '12px', padding: '0.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', minWidth: '160px', zIndex: 100, border: '1px solid #eee' }}>
                    <Link href="/perfil" style={{ display: 'block', padding: '10px', textDecoration: 'none', color: '#333', fontSize: '0.9rem', borderBottom: '1px solid #f5f5f5' }}>👤 Mi Perfil</Link>
                    <button onClick={() => signOut()} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px', background: 'none', border: 'none', color: '#ff4757', cursor: 'pointer', fontSize: '0.9rem' }}>🚪 Cerrar sesión</button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link href="/login" className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>Acceder</Link>
                <a href="https://www.teaming.net/..." target="_blank" className="btn btn-primary" style={{ background: '#f39c12' }}>Teaming 1€</a>
              </div>
            )}
          </div>
        </div>

        <nav className="main-nav" style={{ position: 'sticky', top: '10px', zIndex: 90 }}>
          <ul id="main-menu" className={menuOpen ? "is-open" : ""}>
            <li><a href="#inicio">Inicio</a></li>
            <li><a href="#mision">Misión</a></li>
            <li><a href="#colonias">Colonias</a></li>
            <li><a href="#galeria">Galería</a></li>
            <li><a href="#fichas">Fichas</a></li>
            <li><a href="#minijuego">Juego</a></li>
            <li><a href="#ayuda">Ayuda</a></li>
            <li><a href="#donar">Donar</a></li>
            <li><a href="/rankings">🏆</a></li>
            <li><a href="#campana">📣</a></li>
          </ul>
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
        </nav>

        <section className="hero">
          <h2 style={{ fontSize: '2.5rem', color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Cuidamos colonias felinas con responsabilidad y compromiso</h2>
          <p style={{ color: '#eee' }}>Aplicamos el método CER para mejorar la vida de los gatos comunitarios.</p>
          <div className="hero-actions" style={{ marginTop: '1.5rem' }}>
            <a href="#donar" className="btn btn-primary" style={{ padding: '1rem 2rem' }}>Donar ahora</a>
            <a href="#ayuda" className="btn btn-secondary">Hazte voluntario/a</a>
          </div>
        </section>
      </header>

      {/* CONTENIDO RESTAURADO */}
      <section id="mision" style={card}>
        <h3 style={{ color: '#0f4c5c' }}>Misión y valores</h3>
        <p style={{ lineHeight: '1.6', color: '#444' }}>Trabajamos para proteger, esterilizar y cuidar a los gatos de colonias felinas mediante acciones coordinadas con personas voluntarias, clínicas veterinarias y administraciones locales para garantizar el bienestar animal.</p>
      </section>

      <section id="colonias" style={card}>
        <h3 style={{ color: '#0f4c5c' }}>Colonias felinas</h3>
        <p style={{ lineHeight: '1.6', color: '#444' }}>Realizamos seguimiento sanitario, alimentación controlada y campañas de sensibilización para garantizar colonias estables, saludables y bien gestionadas en el entorno rural.</p>
      </section>

      <section id="galeria" style={card}>
        <h3>Galería de actuaciones</h3>
        <GaleriaActuaciones />
      </section>

      <section id="fichas" style={card}>
        <GatoCards onPay={handleDonationClick} />
      </section>
      
      <section id="minijuego" style={card}>
        <h3>Minijuego: Gatito Runner 🐱</h3>
        <GatitoRunner embedded showLeaderboard={false} />
      </section>

      <section id="campana" style={{ ...card, background: '#0f766e', color: '#fff' }}>
        <h3 style={{ color: '#fff' }}>Campaña de firmas (Change.org)</h3>
        <p style={{ marginBottom: '1.5rem' }}>Apoya la petición para una gestión ética de colonias felinas en San Xoán de Río.</p>
        <a href="https://www.change.org/..." target="_blank" className="btn btn-primary" style={{ background: "#fff", color: "#0f766e", fontWeight: 'bold' }}>Firmar campaña</a>
      </section>

      <section id="ayuda" style={card}>
        <h3>Cómo ayudar</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '12px' }}><strong>🙌 Voluntariado</strong><p style={{ fontSize: '0.9rem' }}>Únete al equipo para alimentar o capturar.</p></div>
          <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '12px' }}><strong>📦 Donaciones</strong><p style={{ fontSize: '0.9rem' }}>Colabora con material o alimento.</p></div>
          <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '12px' }}><strong>📣 Difusión</strong><p style={{ fontSize: '0.9rem' }}>Comparte nuestras campañas.</p></div>
        </div>
      </section>

      <section id="donar" style={card}>
        <DonationSection gatosColonia={gatosColonia} handlePayment={handleDonationClick} cardStyle={{ border: 'none', padding: 0 }} />
      </section>

      <TeamingWidget />
      <NoticiasGatocan />
      <ContactoForm />
    </main>
  );
}