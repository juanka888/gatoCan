"use client";

import Link from "next/link"; // Añade esto
import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from "react";
import { signIn, signOut, useSession } from "next-auth/react"; // Añade signOut aquí
import GatoCards from "./components/GatoCards";
import { gatosColonia } from "@/lib/gatos"; 
import ContactoForm from "./components/ContactoForm";
import EuropaPressNews from "./components/EuropaPressNews";
import GatitoRunner from "./components/GatitoRunner";
import NoticiasGatocan from "./components/NoticiasGatocan";
import GaleriaActuaciones from "./components/GaleriaActuaciones";


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

const flechaProStyle = {
  background: 'rgba(255, 71, 87, 0.1)', // Fondo rosado muy suave y elegante
  border: 'none',
  fontSize: '2rem',
  cursor: 'pointer',
  padding: '10px 15px',
  borderRadius: '50%', // Lo hace circular
  color: '#ff4757',
  transition: 'all 0.3s ease', // Animación suave
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  userSelect: 'none' as const, // Evita que se seleccione el emoji como texto
  width: '50px', // Tamaño fijo para que sea un círculo perfecto
  height: '50px',
  boxShadow: '0 2px 5px rgba(0,0,0,0.05)' // Una sombra casi invisible para dar relieve
};
const botonCaraFrontal = {
    backgroundColor: '#ff4757',
    color: 'white',
    padding: '8px 12px',
    borderRadius: '20px',
    border: 'none',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
    fontSize: '0.8rem',
    marginTop: '10px'
  };

  const flechaStyle = {
    background: 'none',
    border: 'none',
    fontSize: '2rem',
    cursor: 'pointer',
    color: '#ff4757'
  };
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
const handlePayment = async (name: string, amount: number) => {
  try {
    // 1. Llamamos a tu API
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, amount }), // Enviamos nombre y cantidad (en euros)
    });

    const data = await res.json();

    // 2. Si la API nos devuelve la URL de Stripe, redirigimos
    if (data.url) {
      window.location.href = data.url;
    } else {
      console.error("Error en la respuesta de Stripe:", data.error);
      alert("No se pudo generar la sesión de pago: " + data.error);
    }
  } catch (error) {
    console.error("Error de conexión:", error);
    alert("Hubo un fallo en la conexión con el servidor de pagos.");
  }
};

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [colabClicks, setColabClicks] = useState<Record<string, number>>({});
  const [donationSelections, setDonationSelections] = useState<Record<string, boolean>>({});
  const [openDonationCatId, setOpenDonationCatId] = useState<string | number>(gatosColonia[0]?.id ?? "");
  const { data: session, status } = useSession();

  // Avatar dinámico
  const avatar = useMemo(() => 
    session?.user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(session?.user?.name || "G")}&background=0f4c5c&color=fff`,
    [session]
  );

  // Cerrar menú al cambiar login
  useEffect(() => {
    setMenuOpen(false);
  }, [status]);

  // Cargar clicks de colaboradores
  useEffect(() => {
    const stored = localStorage.getItem("gatocanColaboradoresClicks");
    if (stored) setColabClicks(JSON.parse(stored));
  }, []);

  // Cálculos de donaciones
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
          /* SI ESTÁ LOGUEADO */
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <Link href="/perfil" className="btn btn-secondary" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <img 
                src={avatar} 
                alt="Avatar" 
                style={{ width: "24px", height: "24px", borderRadius: "50%" }} 
              />
              Ir a mi perfil
            </Link>
            
            <button 
              type="button" 
              className="btn btn-secondary" 
              style={{ opacity: 0.8 }}
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Salir
            </button>
          </div>
        ) : (
          /* SI NO ESTÁ LOGUEADO */
          <>
            <Link href="/login" className="btn btn-secondary">
              Acceder
            </Link>
            <Link href="/register" className="btn btn-secondary">
              Crear cuenta
            </Link>
          </>
        )}

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

      <section id="donar" style={card} className="donation-card">
        <h3>Apoya nuestro trabajo con una donación</h3>
        <p>Cada aportación nos ayuda a cubrir gastos veterinarios, alimentación y tratamientos de urgencia.</p>
        <h3>Haz tu aporte gatuno 🐾</h3>
        <p>Abre cada gatete y marca el apoyo que quieras cubrir. Verás el total y tus <strong>Puntos Karma</strong> al momento.</p>

        {gatosColonia.map((cat) => (
          <details key={cat.id} className="donation-panel" open={openDonationCatId === cat.id}>
            <summary
              onClick={(event) => {
                event.preventDefault();
                setOpenDonationCatId(cat.id);
              }}
            >
              <span className="cat-summary">
                <img src={cat.imagen} alt={cat.nombre} />
                <span>{cat.nombre}</span>
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
                      checked={Boolean(donationSelections[key])}
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

      <button 
        className="btn btn-primary" 
        style={{ 
          marginTop: '20px', 
          width: '100%',
          opacity: donationTotal > 0 ? 1 : 0.6, // Se ve un poco más transparente si es 0
          cursor: donationTotal > 0 ? 'pointer' : 'not-allowed'
        }}
        disabled={donationTotal === 0} // Desactiva el clic si no hay nada seleccionado
        onClick={() => {
          handlePayment("Donación conjunta Colonias", donationTotal);
        }}
      >
        {donationTotal > 0 
          ? `Quiero confirmar mi aportación de ${donationTotal} €` 
          : "Selecciona una ayuda para continuar"}
      </button>

    </section>

<section id="teaming" style={{ ...card, textAlign: "center" }}>
  <h3>Apóyanos en Teaming</h3>
  <p>Con solo 1€ al mes nos ayudas a salvar vidas.</p>
  
  <div className="teaming-container" style={{ display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
    {/* VERSIÓN PC */}
    <div className="t-desktop">
      <iframe 
        src="https://www.teaming.net/group/spread/widgets/vhhzRoTGtqKuuLnVWB2kVKfrWgONnGQd06Cg6Uu6MSVJh/6?lang=es_ES&TM=true" 
        width="696" 
        height="315" 
        frameBorder="0" 
        scrolling="no" 
        style={{ border: "none" }} 
      />
    </div>

    {/* VERSIÓN MÓVIL */}
    <div className="t-mobile">
      <iframe 
        src="https://www.teaming.net/group/spread/widgets/vhhzRoTGtqKuuLnVWB2kVKfrWgONnGQd06Cg6Uu6MSVJh/7?lang=es_ES&TM=true" 
        width="305" 
        height="567" 
        frameBorder="0" 
        scrolling="no" 
        style={{ border: "none" }} 
      />
    </div>
  </div>

  <div style={{ marginTop: "20px" }}>
    <a href="https://www.teaming.net/asociaciongatocannaturarural" target="_blank" className="btn btn-primary">
      Unirse al Grupo de Teaming
    </a>
  </div>
</section>

{/* CONTACTO */}
      <section id="contacto" style={card}>
        <ContactoForm />
      </section>
    </main>
  );
}
