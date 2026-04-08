"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react"; // Limpiado CSSProperties y FormEvent
import { signIn, signOut, useSession } from "next-auth/react";
import GatoCards from "./components/GatoCards";
import { gatosColonia } from "@/lib/gatos"; 
import ContactoForm from "./components/ContactoForm";
import GatitoRunner from "./components/GatitoRunner";
import DonationSection from "./components/DonationSection";
import NoticiasGatocan from "./components/NoticiasGatocan";
import GaleriaActuaciones from "./components/GaleriaActuaciones";
import TeamingWidget from "./components/TeamingWidget";

// Estilo base para las secciones
const card: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  padding: "1rem",
  width: "100%",
  maxWidth: "1200px",
  margin: "0 auto 2rem auto"
};

const handlePayment = async (name: string, amount: number) => {
  try {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, amount }),
    });

    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      console.error("Error en Stripe:", data.error);
      alert("No se pudo generar el pago.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Hubo un fallo en la conexión.");
  }
};

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  // Avatar dinámico
  const avatar = useMemo(() => 
    session?.user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(session?.user?.name || "G")}&background=0f4c5c&color=fff`,
    [session]
  );

  // Cerrar menú al cambiar estado de sesión
  useEffect(() => {
    setMenuOpen(false);
  }, [status]);

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "1rem", display: "grid", gap: "1rem" }}>
      <header id="inicio" className="site-header">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <img src="/img/logo1.png" alt="Logo de GatoCan" className="brand-logo" />
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
                  Ir a mi perfil
                </Link>
                <button type="button" className="btn btn-secondary" style={{ opacity: 0.8 }} onClick={() => signOut({ callbackUrl: "/" })}>
                  Salir
                </button>
              </div>
            ) : (
              <>
                <Link href="/login" className="btn btn-secondary">Acceder</Link>
                <Link href="/register" className="btn btn-secondary">Crear cuenta</Link>
              </>
            )}
            <a href="https://www.teaming.net/proyectogatonaturanrural" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              Teaming 1€
            </a>
          </div>
        </div>

        <button type="button" className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          ☰ Menú
        </button>

        <nav aria-label="Principal" className="main-nav">
          <ul id="main-menu" className={menuOpen ? "is-open" : ""}>
            <li><a href="#inicio">Inicio</a></li>
            <li><a href="#mision">Misión</a></li>
            <li><a href="#galeria">Galería</a></li>
            <li><a href="#minijuego">Minijuego</a></li>
            <li><a href="#ayuda">Ayuda</a></li>
            <li><a href="/foro">Foro</a></li>
            <li><a href="#contacto">Contacto</a></li>
            <li><a href="#donar">Donar</a></li>
            <li><a href="/rankings">Rankings</a></li>
            <li><a href="/perfil">Perfil</a></li>
          </ul>
        </nav>

        <section className="hero">
          <h2>Cuidamos colonias felinas con responsabilidad</h2>
          <p>Aplicamos el método CER para mejorar la vida de los gatos comunitarios.</p>
          <div className="hero-actions">
            {status !== "authenticated" && (
               <button type="button" className="btn btn-secondary" onClick={() => signIn("google", { callbackUrl: "/perfil" })}>Acceder</button>
            )}
            <a href="#donar" className="btn btn-primary">Donar ahora</a>
            <a href="/foro" className="btn btn-secondary">Entrar al foro</a>
          </div>
        </section>
      </header>

      <section id="mision" style={card}>
        <h3>Misión y valores</h3>
        <p>Trabajamos para proteger y esterilizar colonias felinas en el entorno rural.</p>
      </section>

      <section id="galeria" style={card}>
        <h3>Galería de actuaciones</h3>
        <GaleriaActuaciones />
      </section>

      <section id="fichas" style={card}>
        <GatoCards onPay={handlePayment} />
      </section>
      
      <section id="minijuego" style={card}>
        <h3>Minijuego: Gatito Runner 🐱</h3>
        <GatitoRunner embedded showLeaderboard={false} />
      </section>

      <section id="campana" style={{ ...card, borderColor: "#0f766e" }}>
        <h3>Campaña de firmas</h3>
        <a href="https://www.change.org/..." target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ background: "#0f766e" }}>
          Firmar en Change.org
        </a>
      </section>
      
      <section id="ranking" style={card}>
        <h3>Rankings solidarios 🏆</h3>
        <Link href="/rankings" className="btn btn-secondary">Ver rankings</Link>
      </section>

      <section id="noticias" style={card}>
        <NoticiasGatocan />
      </section>

      <section id="donar">
        <DonationSection gatosColonia={gatosColonia} handlePayment={handlePayment} cardStyle={card} />
      </section>

      <TeamingWidget />

      <section id="contacto" style={card}>
        <ContactoForm />
      </section>
    </main>
  );
}