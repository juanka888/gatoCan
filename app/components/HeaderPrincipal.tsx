"use client";

import { useState } from "react";

export default function HeaderPrincipal() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header" style={{ width: "100%", padding: "20px 0" }}>
      {/* BLOQUE LOGO */}
      <div style={{ display: "flex", alignItems: "center", gap: "15px", padding: "0 20px", marginBottom: "25px" }}>
        <img src="/img/logo1.png" alt="Logo" style={{ height: "75px", width: "75px", borderRadius: "50%", backgroundColor: "#fff" }} />
        <div style={{ textAlign: "left" }}>
          <p style={{ margin: 0, fontSize: "0.8rem", color: "#ddd", letterSpacing: "1px" }}>ASOCIACIÓN PROTECCIÓN ANIMAL</p>
          <h1 style={{ margin: 0, fontSize: "1.8rem", color: "#fff" }}>GatoCan Natura Rural</h1>
        </div>
      </div>

      {/* NAVEGACIÓN PRINCIPAL */}
      <nav style={{ padding: "0 20px" }}>
        {/* Botón solo para móvil */}
        <button 
          className="menu-toggle-btn" 
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ display: "none", padding: "10px", marginBottom: "10px" }} // Se activa por CSS global
        >
          {menuOpen ? "✕ Cerrar" : "☰ Menú"}
        </button>

        <ul className={`nav-menu-list ${menuOpen ? "is-open" : ""}`} style={{ 
          display: "flex", 
          flexWrap: "wrap", 
          gap: "10px", 
          listStyle: "none", 
          padding: 0, 
          margin: 0 
        }}>
          <li><a href="/" className="nav-link">Inicio</a></li>
          <li><a href="#mision" className="nav-link">Misión</a></li>
          <li><a href="#colonias" className="nav-link">Colonias</a></li>
          <li><a href="/donaciones" className="nav-link highlight">❤️ Donaciones</a></li>
          <li><a href="/foro" className="nav-link">Foro</a></li>
          <li><a href="#galeria" className="nav-link">Galería</a></li>
          <li><a href="#noticias" className="nav-link">Noticias</a></li>
          <li><a href="https://www.teaming.net/proyectogatonaturanrural" target="_blank" className="nav-link teaming">Teaming 1€</a></li>
        </ul>
      </nav>

      <style jsx>{`
        .nav-link {
          color: #fff;
          text-decoration: none;
          padding: 8px 15px;
          border-radius: 6px;
          transition: background 0.3s;
          font-size: 0.95rem;
          display: block;
        }
        .nav-link:hover {
          background: rgba(255,255,255,0.2);
        }
        .highlight {
          background: #e67e22;
        }
        .teaming {
          background: #27ae60;
        }

        @media (max-width: 768px) {
          .menu-toggle-btn { display: block !important; }
          .nav-menu-list { 
            display: ${menuOpen ? "flex" : "none"} !important; 
            flex-direction: column; 
            background: rgba(0,0,0,0.8);
            border-radius: 8px;
            padding: 10px;
          }
        }
      `}</style>

      {/* HERO ALINEADO A LA IZQUIERDA */}
      <section style={{ padding: "60px 20px", textAlign: "left" }}>
        <h2 style={{ fontSize: "2.4rem", color: "#fff", fontWeight: "900", marginBottom: "15px" }}>
          Responsabilidad y <br /> Compromiso Felino
        </h2>
        <p style={{ fontSize: "1.1rem", color: "#eee", maxWidth: "650px", marginBottom: "30px", lineHeight: "1.5" }}>
          Trabajamos con el método CER para garantizar el bienestar de los gatos comunitarios.
        </p>
        <div style={{ display: "flex", gap: "15px" }}>
          <a href="/donaciones" className="btn btn-primary" style={{ padding: "14px 28px" }}>❤️ Donar ahora</a>
          <a href="#ayuda" className="btn btn-secondary" style={{ padding: "14px 28px", border: "2px solid #fff" }}>🤝 Voluntariado</a>
        </div>
      </section>
    </header>
  );
}
