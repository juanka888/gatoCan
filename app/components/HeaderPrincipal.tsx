"use client";

import { useState } from "react";
import Link from "next/link";

export default function HeaderPrincipal() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header style={{ width: "100%", position: "relative", paddingTop: "5px" }}>
      {/* CABECERA: Logo y Título Reordenado */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 15px", marginBottom: "5px" }}>
        <img 
          src="/img/logo1.png" 
          alt="Logo" 
          style={{ height: "60px", width: "60px", borderRadius: "50%", backgroundColor: "#fff" }} 
        />
        <div style={{ textAlign: "left" }}>
          <h1 style={{ margin: 0, fontSize: "1.3rem", color: "#fff", fontWeight: "800", lineHeight: "1" }}>
            GatoCan Natura Rural
          </h1>
          <p style={{ margin: "2px 0 0 0", fontSize: "0.65rem", color: "#ccc", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Asociación de protección animal
          </p>
        </div>
      </div>

      {/* NAVEGACIÓN */}
      <nav style={{ padding: "0 15px" }}>
        <button 
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ display: "block", padding: "6px 12px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem" }}
          className="mobile-only-btn"
        >
          {menuOpen ? "✕ Cerrar" : "☰ Menú"}
        </button>

        <ul style={{ 
          display: menuOpen ? "flex" : "none", 
          flexDirection: "column",
          gap: "5px", 
          listStyle: "none", 
          padding: "10px", 
          margin: "5px 0",
          background: "rgba(0,0,0,0.85)",
          borderRadius: "10px"
        }} className="nav-list">
          <li><Link href="/" style={navLinkStyle}>Inicio</Link></li>
          <li><Link href="#mision" style={navLinkStyle}>Misión</Link></li>
          <li><Link href="/donaciones" style={{...navLinkStyle, color: "#f39c12"}}>❤️ Donaciones</Link></li>
          <li><Link href="/rankings" style={navLinkStyle}>🏆 Rankings</Link></li>
          <li><Link href="/foro" style={navLinkStyle}>Foro</Link></li>
          {/* Teaming solo visible en escritorio dentro del menú */}
          <li className="desktop-only"><a href="https://www.teaming.net/proyectogatonaturanrural" target="_blank" style={{...navLinkStyle, color: "#27ae60"}}>Teaming 1€</a></li>
        </ul>
      </nav>

      {/* HERO: Título en una línea y 3 botones */}
      <section style={{ padding: "20px 15px", textAlign: "left" }}>
        <h2 style={{ fontSize: "1.9rem", color: "#fff", fontWeight: "800", marginBottom: "8px", lineHeight: "1.1" }}>
          Responsabilidad y Compromiso
        </h2>
        <p style={{ fontSize: "0.9rem", color: "#eee", maxWidth: "550px", marginBottom: "20px", lineHeight: "1.3" }}>
          Método CER para el bienestar de los gatos comunitarios.
        </p>
        
        {/* LOS 3 BOTONES EN LÍNEA */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <Link href="/donaciones" className="btn btn-primary" style={heroBtnStyle}>
            ❤️ Donar
          </Link>
          <a href="#ayuda" className="btn btn-secondary" style={{...heroBtnStyle, border: "1.5px solid #fff"}}>
            🤝 Voluntariado
          </a>
          <a href="https://www.teaming.net/proyectogatonaturanrural" target="_blank" className="btn btn-primary" style={{...heroBtnStyle, backgroundColor: "#27ae60"}}>
            🪙 Teaming
          </a>
        </div>
      </section>

      <style jsx>{`
        @media (min-width: 769px) {
          .nav-list { display: flex !important; flexDirection: row !important; background: transparent !important; }
          .mobile-only-btn { display: none !important; }
        }
        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
        }
      `}</style>
    </header>
  );
}

const navLinkStyle = { color: "#fff", textDecoration: "none", fontSize: "0.85rem", padding: "8px", display: "block" };
const heroBtnStyle = { padding: "10px 16px", fontSize: "0.85rem", borderRadius: "8px", fontWeight: "bold" };
