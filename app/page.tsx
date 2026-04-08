"use client";

import Link from "next/link"; // Añade esto
import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from "react";
import { signIn, signOut, useSession } from "next-auth/react"; // Añade signOut aquí
import GatoCards from "./components/GatoCards";
import { gatosColonia } from "@/lib/gatos"; 
import ContactoForm from "./components/ContactoForm";
import GatitoRunner from "./components/GatitoRunner";
import DonationSection from "./components/DonationSection";
import NoticiasGatocan from "./components/NoticiasGatocan";
import GaleriaActuaciones from "./components/GaleriaActuaciones";
import TeamingWidget from "./components/TeamingWidget";

const card: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  padding: "1rem",
  width: "100%",
  maxWidth: "1200px",
  margin: "0 auto 2rem auto"
};

const mainLayout: React.CSSProperties = {
  backgroundColor: "#f4f7f6",
  minHeight: "100vh",
  padding: "40px 10px"
};

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [colabClicks, setColabClicks] = useState<Record<string, number>>({});
  const [donationSelections, setDonationSelections] = useState<Record<string, boolean>>({});
  const [openDonationCatId, setOpenDonationCatId] = useState<string | number>(gatosColonia[0]?.id ?? "");
  const { data: session, status } = useSession();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Avatar dinámico
  const avatar = useMemo(() => 
    session?.user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(session?.user?.name || "G")}&background=0f4c5c&color=fff`,
    [session]
  );

  const handlePayment = async (name: string, amount: number) => {
    try {
      // Usamos un correo genérico para anónimos
      let identity = "anonymous@gatocan.com"; 
      
      if (!session) {
        const confirmar = confirm("Estás donando sin sesión. Los puntos irán a la cuenta global de anónimos. ¿Continuar?");
        if (!confirmar) {
          signIn(); 
          return;
        }
      } else {
        identity = session.user?.email || "anonymous@gatocan.com";
      }

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          amount,
          userId: identity 
        }),
      });

      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        // ESTO ES CLAVE: Si falla, el alert nos dirá por qué
        alert("Stripe dice: " + (data.error || "Error desconocido"));
      }
    } catch (error) {
      alert("Error de red al intentar pagar");
    }
  };

  // Cerrar menú al cambiar login
  useEffect(() => {
    setMenuOpen(false);
  }, [status]);

  // Cargar clicks de colaboradores
  useEffect(() => {
    const stored = localStorage.getItem("gatocanColaboradoresClicks");
    if (stored) setColabClicks(JSON.parse(stored));
  }, []);

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
            {status === "loading" ? (
              <button className="btn btn-secondary" disabled>Cargando...</button>
            ) : session ? (
              /* ESTADO LOGUEADO: Solo el avatar con su menú */
              <div style={{ position: 'relative', zIndex: 1000 }}>
                <img 
                  src={avatar} 
                  alt="Avatar" 
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  style={{ 
                    width: "45px", 
                    height: "45px", 
                    borderRadius: "50%", 
                    cursor: 'pointer', 
                    border: '2px solid #0f4c5c',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)' 
                  }} 
                />
                {userMenuOpen && (
                  <div style={{ 
                    position: 'absolute', 
                    right: 0, 
                    top: '55px', 
                    background: '#fff', 
                    borderRadius: '8px', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)', 
                    minWidth: '160px', 
                    padding: '5px', 
                    border: '1px solid #eee' 
                  }}>
                    <Link href="/perfil" style={{ display: 'block', padding: '10px', textDecoration: 'none', color: '#333', fontSize: '14px' }}>
                      Mi Perfil
                    </Link>
                    <button 
                      onClick={() => signOut({ callbackUrl: "/" })} 
                      style={{ 
                        display: 'block', 
                        width: '100%', 
                        textAlign: 'left', 
                        padding: '10px', 
                        background: 'none', 
                        border: 'none', 
                        color: '#ff4757', 
                        cursor: 'pointer', 
                        fontSize: '14px', 
                        borderTop: '1px solid #f5f5f5' 
                      }}
                    >
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* ESTADO NO LOGUEADO: Los dos botones clásicos */
              <>
                <Link href="/login" className="btn btn-secondary">
                  Acceder
                </Link>
                <Link href="/register" className="btn btn-secondary">
                  Crear cuenta
                </Link>
              </>
            )}

            {/* El botón de Teaming siempre visible */}
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

      {/* SECCIÓN GALERÍA (La parte que hemos extraído) */}
      <section id="galeria" style={card}>
        <h3>Galería de actuaciones</h3>
        <p>Recorrido visual de nuestro trabajo en las colonias.</p>
        <GaleriaActuaciones />
      </section>


    {/* Contenedor de las 3 tarjetas */}
   {/* GatoCards (le pasamos el estilo "card" directamente) */}
      <section id="colonias" style={card}>
        <GatoCards onPay={handlePayment} />
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

      <DonationSection 
        gatosColonia={gatosColonia} 
        handlePayment={handlePayment} 
        cardStyle={card} 
      />

{/* Antes había 30 líneas de código aquí, ahora solo una */}
<TeamingWidget />

{/* CONTACTO */}
      <section id="contacto" style={card}>
        <ContactoForm />
      </section>
    </main>
  );
}
