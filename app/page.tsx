"use client";

import { useEffect, useState } from "react";
import { getSession, signIn } from "next-auth/react";
import GatoCards from "./components/GatoCards";
import { gatosColonia } from "@/lib/gatos"; 
import ContactoForm from "./components/ContactoForm";
import GatitoRunner from "./components/GatitoRunner";
import DonationSection from "./components/DonationSection";
import NoticiasGatocan from "./components/NoticiasGatocan";
import GaleriaActuaciones from "./components/GaleriaActuaciones";
import TeamingWidget from "./components/TeamingWidget";
import HeaderPrincipal from "./components/HeaderPrincipal";

const card: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.85)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  border: "1px solid rgba(229, 231, 235, 0.5)",
  borderRadius: "16px",
  padding: "1.25rem",
  width: "100%",
  maxWidth: "100%", 
  boxSizing: "border-box", 
  justifySelf: "center",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
  margin: "0 auto",
  overflow: "hidden"
};

const mainContainerStyle: React.CSSProperties = {
  maxWidth: "1100px",
  margin: "0 auto",
  padding: "1rem 15px", 
  display: "grid",
  gridTemplateColumns: "100%",
  gap: "1.2rem",
  boxSizing: "border-box",
  minHeight: "100vh"
};

export default function HomePage() {
  const [colabClicks, setColabClicks] = useState<Record<string, number>>({});
  const [donationSelections, setDonationSelections] = useState<Record<string, boolean>>({});
  const [openDonationCatId, setOpenDonationCatId] = useState<string | number>(gatosColonia[0]?.id ?? "");
  const [stats, setStats] = useState({ total: 0, usuarios: 0, anonimo: 0 });

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    fetch("/api/stats")
      .then(res => res.json())
      .then(data => {
        setStats(data);
      })
      .catch(err => console.error("Error cargando estadísticas:", err));
  }, []);

  const handlePayment = async (name: string, amount: number) => {
    try {
      const session = await getSession();

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

  useEffect(() => {
  // Detecta si volvemos de una donación anónima exitosa
  const params = new URLSearchParams(window.location.search);
  if (params.get("thanks") === "true") {
    alert("¡Muchas gracias por tu donación! Tu ayuda llegará directamente a las colonias felinas. 🐱");
    
    // Limpia la URL para que el mensaje no salga cada vez que recarguen
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}, []);

  // Cargar clicks de colaboradores
  useEffect(() => {
    const stored = localStorage.getItem("gatocanColaboradoresClicks");
    if (stored) setColabClicks(JSON.parse(stored));
  }, []);
const StatsDonaciones = ({ stats }: { stats: any }) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem" }}>
    {[
      { label: "Total", val: stats.total, col: "#0f4c5c" },
      { label: "Socios", val: stats.usuarios, col: "#0f766e" },
      { label: "Anónimos", val: stats.anonimo, col: "#64748b" }
    ].map((s, i) => (
      <div key={i} style={{ background: "#fff", padding: "1rem", borderRadius: "10px", border: "1px solid #eee", textAlign: "center" }}>
        <span style={{ fontSize: "0.75rem", color: "#666", textTransform: "uppercase" }}>{s.label}</span>
        <div style={{ fontSize: "1.25rem", fontWeight: "bold", color: s.col }}>{s.val}€</div>
      </div>
    ))}
  </div>
);
  
  return (
    <main style={mainContainerStyle}>
      <HeaderPrincipal />

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

{/* SECCIÓN DE ESTADÍSTICAS */}
      <section id="estadisticas" style={card}>
        <h3 style={{ color: "#0f4c5c", marginBottom: "0.5rem" }}>Progreso Solidario</h3>
        <p style={{ fontSize: "0.9rem", color: "#666" }}>Visualiza el impacto de vuestra ayuda en tiempo real.</p>
        
        <StatsDonaciones stats={stats} />

        {/* Barra de Progreso */}
        <div style={{ marginTop: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px", fontSize: "13px", fontWeight: "bold" }}>
            <span>Objetivo: {stats.total}€ / 1000€</span>
            <span>{Math.min(Math.round((stats.total / 1000) * 100), 100)}%</span>
          </div>
          <div style={{ width: "100%", backgroundColor: "#e5e7eb", borderRadius: "20px", height: "12px", overflow: "hidden" }}>
            <div style={{ 
              width: `${Math.min((stats.total / 1000) * 100, 100)}%`, 
              backgroundColor: "#0f766e", 
              height: "100%", 
              transition: "width 1.5s ease-in-out" 
            }}></div>
          </div>
          {/* Texto del Sorteo */}
          <p style={{ 
            margin: "1.2rem 0 0",
            fontSize: "0.9rem", 
            color: "#0f766e", 
            backgroundColor: "#f0fdfa", 
            padding: "10px", 
            borderRadius: "8px",
            border: "1px dashed #0f766e",
            textAlign: "center"
          }}>
            🎁 <strong>¡Sorteo Especial!</strong> Al alcanzar el objetivo de 1000€, sortearemos una camiseta exclusiva de GatoCan entre los usuarios registrados que hayan aportado 100€ o más.
          </p>
        </div>
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
