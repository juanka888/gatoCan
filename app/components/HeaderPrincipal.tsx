"use client";

import { useState } from "react";
import Link from "next/link";

export default function HeaderPrincipal() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header style={{ width: "100%", position: "relative", paddingTop: "10px" }}>
      {/* CABECERA: Logo y Título */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "0 20px", marginBottom: "10px" }}>
        <img 
          src="/img/logo1.png" 
          alt="Logo" 
          style={{ height: "65px", width: "65px", borderRadius: "50%", backgroundColor: "#fff" }} 
        />
        <div style={{ textAlign: "left" }}>
          <p style={{ margin: 0, fontSize: "0.7rem", color: "#ddd", textTransform: "uppercase", letterSpacing: "1px" }}>Asociación de protección animal</p>
          <h1 style={{ margin: 0, fontSize: "1.4rem", color: "#fff", fontWeight: "bold" }}>GatoCan Natura Rural</h1>
        </div>
      </div>

      {/* BARRA DE NAVEGACIÓN */}
      <nav style={{ padding: "0 20px" }}>
        {/* Botón Menú (Solo visible en móvil por CSS) */}
        <button 
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ display: "block", padding: "8px 15px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", borderRadius: "8px", cursor: "pointer", marginBottom: "10px" }}
          className="mobile-only-btn"
        >
          {menuOpen ? "✕ Cerrar" : "☰ Menú Navegación"}
        </button>

        <ul style={{ 
          display: menuOpen ? "flex" : "none", 
          flexDirection: "column",
          gap: "8px", 
          listStyle: "none", 
          padding: "10px", 
          margin: 0,
          background: "rgba(0,0,0,0.8)",
          borderRadius: "10px"
        }} className="nav-list">
          <li><Link href="/" style={navLinkStyle}>Inicio</Link></li>
          <li><Link href="#mision" style={navLinkStyle}>Misión</Link></li>
          <li><Link href="#colonias" style={navLinkStyle}>Colonias</Link></li>
          <li><Link href="/donaciones" style={{...navLinkStyle, color: "#f39c12"}}>❤️ Donaciones</Link></li>
          <li><Link href="/rankings" style={navLinkStyle}>🏆 Rankings</Link></li>
          <li><Link href="/foro" style={navLinkStyle}>Foro</Link></li>
          <li><Link href="#contacto" style={navLinkStyle}>Contacto</Link></li>
        </ul>
      </nav>

      {/* HERO SECTION: Ajustada para reducir espacios */}
      <section style={{ padding: "20px 20px", textAlign: "left" }}>
        <h2 style={{ 
          fontSize: "2rem", 
          color: "#fff", 
          fontWeight: "800", 
          marginBottom: "10px", 
          lineHeight: "1.1",
          maxWidth: "900px" // Para que quepa en una línea
        }}>
          Responsabilidad y Compromiso
        </h2>
        <p style={{ 
          fontSize: "0.95rem", 
          color: "#eee", 
          maxWidth: "600px", 
          marginBottom: "20px", 
          lineHeight: "1.4" 
        }}>
          Aplicamos el método CER para mejorar la vida de los gatos comunitarios en el entorno rural.
        </p>
        
        {/* ACCIONES DEL HERO */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Link href="/donaciones" className="btn btn-primary" style={{ padding: "12px 20px" }}>
            ❤️ Donar ahora
          </Link>
          <a href="#ayuda" className="btn btn-secondary" style={{ padding: "12px 20px", border: "1px solid #fff" }}>
            🤝 Voluntariado
          </a>
          <a href="https://www.teaming.net/proyectogatonaturanrural" target="_blank" className="btn btn-primary" style={{ padding: "12px 20px", backgroundColor: "#27ae60" }}>
            Teaming 1€
          </a>
        </div>
      </section>

      <style jsx>{`
        @media (min-width: 769px) {
          .nav-list { 
            display: flex !important; 
            flex-direction: row !important; 
            background: transparent !important;
          }
          .mobile-only-btn { display: none !important; }
        }
        @media (max-width: 768px) {
          h2 { fontSize: 1.8rem !important; }
        }
      `}</style>
    </header>
  );
}

const navLinkStyle = {
  color: "#fff",
  textDecoration: "none",
  fontSize: "0.9rem",
  padding: "5px 10px",
  display: "block"
};
