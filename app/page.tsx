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

// --- ESTILOS ESENCIALES ---
const card: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  padding: "2rem", // Aumentado un poco el padding para mejor lectura
  width: "100%",
  maxWidth: "1200px",
  margin: "0 auto 2rem auto"
};

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  // Estados para el Modal de Donación
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<{name: string, amount: number} | null>(null);

  const avatar = useMemo(() => 
    session?.user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(session?.user?.name || "G")}&background=0f4c5c&color=fff`,
    [session]
  );

  useEffect(() => {
    setMenuOpen(false);
  }, [status]);

  // --- LÓGICA DE PAGO ---
  const handlePayment = async (name: string, amount: number) => {
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          amount,
          userId: session?.user?.email || "anonymous" 
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("No se pudo generar el pago.");
      }
    } catch (error) {
      alert("Error de conexión con la pasarela.");
    }
  };

  const handleDonationClick = (name: string, amount: number) => {
    if (status === "authenticated") {
      handlePayment(name, amount);
    } else {
      setSelectedDonation({ name, amount });
      setShowDonationModal(true);
    }
  };

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "1rem", display: "grid", gap: "1rem" }}>
      
      {/* MODAL DE DONACIÓN (PASITO A PASITO) */}
      {showDonationModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 9999, padding: '20px', backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'white', padding: '2.5rem', borderRadius: '20px',
            maxWidth: '450px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ color: '#ff4757', marginBottom: '1rem' }}>¡Gracias por tu ayuda! 🐾</h3>
            <p style={{ marginBottom: '1.5rem', color: '#444' }}>
              Si accedes con tu cuenta, acumularás puntos de Karma por esta donación de {selectedDonation?.amount}€.
            </p>
            <button onClick={() => signIn("google", { callbackUrl: "/perfil" })} className="btn btn-primary" style={{ width: '100%', marginBottom: '12px' }}>
              🔑 Acceder y ganar Karma
            </button>
            <button onClick={() => { if(selectedDonation) handlePayment(selectedDonation.name, selectedDonation.amount); setShowDonationModal(false); }}
              className="btn btn-secondary" style={{ width: '100%', background: '#f1f2f6', color: '#2f3542' }}>
              🕶️ Donar de forma anónima
            </button>
            <button onClick={() => setShowDonationModal(false)} style={{ marginTop: '20px', background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}>
              Volver atrás
            </button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header id="inicio" className="site-header">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <img src="/img/logo1.png" alt="Logo de GatoCan Natura Rural" className="brand-logo" />
            <div>
              <p className="eyebrow">Asociación de protección animal</p>
              <h1>GatoCan Natura Rural</h1>
            </div>
          </div>
          <div className="hero-actions">
            {status === "loading" ? (
              <button className="btn btn-secondary" disabled>Cargando...</button>
            ) : session ? (
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <Link href="/perfil" className="btn btn-secondary" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <img src={avatar} alt="Avatar" style={{ width: "24px", height: "24px", borderRadius: "50%" }} />
                  Mi perfil
                </Link>
                <button type="button" className="btn btn-secondary" onClick={() => signOut({ callbackUrl: "/" })}>Salir</button>
              </div>
            ) : (
              <>
                <Link href="/login" className="btn btn-secondary">Acceder</Link>
                <Link href="/register" className="btn btn-secondary">Crear cuenta</Link>
              </>
            )}
            <a href="https://www.teaming.net/proyectogatonaturanrural" target="_blank" rel="noopener noreferrer" className="btn btn-primary">Teaming 1€</a>
          </div>
        </div>

        {/* --- MENÚ RESTAURADO --- */}
        <nav className="main-nav">
          <ul id="main-menu" className={menuOpen ? "is-open" : ""}>
            <li><a href="#inicio">Inicio</a></li>
            <li><a href="#mision">Misión</a></li>
            <li><a href="#colonias">Colonias</a></li> {/* Recuperado */}
            <li><a href="#galeria">Galería</a></li>
            <li><a href="#fichas">Fichas</a></li> {/* Recuperado */}
            <li><a href="#minijuego">Minijuego</a></li>
            <li><a href="#ayuda">Cómo ayudar</a></li> {/* Nombre restaurado */}
            <li><a href="#donar">Donar</a></li>
            <li><a href="/rankings">Rankings</a></li>
            <li><a href="#campana">Campaña</a></li> {/* Recuperado */}
            <li><a href="#noticias">Noticias</a></li>
            <li><a href="#contacto">Contacto</a></li>
          </ul>
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>☰ Menú</button>
        </nav>

        <section className="hero">
          <h2>Cuidamos colonias felinas con responsabilidad y compromiso</h2>
          <p>Aplicamos el método CER para mejorar la vida de los gatos comunitarios.</p>
          <div className="hero-actions">
            <a href="#donar" className="btn btn-primary">Donar ahora</a>
            <a href="#ayuda" className="btn btn-secondary">Hazte voluntario/a</a>
            <Link href="/foro" className="btn btn-secondary">Entrar al foro</Link>
          </div>
        </section>
      </header>

      {/* SECCIONES */}
      <section id="mision" style={card}>
        <h3>Misión y valores</h3>
        <p>Trabajamos para proteger, esterilizar y cuidar a los gatos de colonias felinas mediante acciones coordinadas.</p>
      </section>

      {/* Sección Colonias (Recuperada para el menú) */}
      <section id="colonias" style={card}>
        <h3>Nuestras Colonias</h3>
        <p>Realizamos seguimiento sanitario y alimentación controlada en diversos puntos.</p>
      </section>

      <section id="galeria" style={card}>
        <h3>Galería de actuaciones</h3>
        <GaleriaActuaciones />
      </section>

      {/* Sección Fichas (Recuperada para el menú) */}
      <section id="fichas" style={card}>
        <h3>Fichas Felinas</h3>
        <GatoCards onPay={handleDonationClick} />
      </section>
      
      <section id="minijuego" style={card}>
        <h3>Minijuego: Gatito Runner 🐱</h3>
        <GatitoRunner embedded showLeaderboard={false} />
      </section>

      {/* --- BOTÓN DE CAMPAÑA ARREGLADO (LETRAS BLANCAS) --- */}
      <section id="campana" style={{ ...card, borderColor: "#0f766e" }}>
        <h3>Campaña de firmas (Change.org)</h3>
        <p>Apoya la petición para una gestión ética de colonias felinas.</p>
        <a 
          href="https://www.change.org/..." 
          target="_blank" 
          rel="noopener noreferrer"
          className="btn btn-primary" 
          style={{ 
            background: "#0f766e", 
            color: "#ffffff", // ¡Letras blancas restauradas!
            border: "none",
            fontWeight: "bold"
          }}
        >
          Firmar campaña en Change.org
        </a>
      </section>

      {/* Sección Cómo ayudar (Con el ID correcto para el menú) */}
      <section id="ayuda" style={card}>
        <h3>Cómo ayudar</h3>
        <ul>
          <li>Únete al equipo de voluntariado.</li>
          <li>Colabora con material o alimento.</li>
          <li>Difunde nuestras campañas.</li>
        </ul>
      </section>

      <section id="donar" style={card}>
        <h3>Donaciones Directas</h3>
        <DonationSection gatosColonia={gatosColonia} handlePayment={handleDonationClick} cardStyle={{ border: 'none', padding: 0 }} />
      </section>

      <TeamingWidget />

      <section id="noticias" style={card}>
        <NoticiasGatocan />
      </section>

      <section id="contacto" style={card}>
        <ContactoForm />
      </section>
    </main>
  );
}