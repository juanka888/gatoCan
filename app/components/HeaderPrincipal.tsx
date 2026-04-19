"use client";

import { useState } from "react";

export default function HeaderPrincipal() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header style={{ width: "100%", position: "relative", paddingTop: "20px" }}>
      {/* LOGO Y TÍTULO (Alineado a la izquierda) */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "0 15px", marginBottom: "15px" }}>
        <img src="/img/logo1.png" alt="Logo" style={{ height: "60px", width: "60px", borderRadius: "50%", backgroundColor: "#fff", padding: "2px" }} />
        <div style={{ textAlign: "left" }}>
          <p style={{ margin: 0, fontSize: "0.7rem", color: "#eee", textTransform: "uppercase" }}>Asociación de protección animal</p>
          <h1 style={{ margin: 0, fontSize: "1.2rem", color: "#fff", fontWeight: "bold" }}>GatoCan Natura Rural</h1>
        </div>
      </div>

      {/* ACCIONES SECUNDARIAS: Menú y Teaming */}
      <div style={{ display: "flex", gap: "10px", padding: "0 15px", alignItems: "center" }}>
        <button onClick={() => setMenuOpen(!menuOpen)} style={{ padding: "6px 15px", fontSize: "0.85rem", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", borderRadius: "8px" }}>
          {menuOpen ? "✕ Cerrar" : "☰ Menú"}
        </button>
        <a href="https://www.teaming.net/proyectogatonaturanrural" target="_blank" className="btn btn-primary" style={{ padding: "6px 15px", fontSize: "0.85rem", backgroundColor: "#f39c12" }}>
          Teaming 1€
        </a>
      </div>

      {/* MENU DESPLEGABLE */}
      {menuOpen && (
        <nav style={{ margin: "10px 15px", background: "rgba(255,255,255,0.95)", borderRadius: "10px", padding: "5px" }}>
          <a href="/" style={{ display: "block", padding: "12px", color: "#333", textDecoration: "none", borderBottom: "1px solid #eee" }}>Inicio</a>
          <a href="/donaciones" style={{ display: "block", padding: "12px", color: "#333", textDecoration: "none", borderBottom: "1px solid #eee" }}>❤️ Donaciones</a>
          <a href="/foro" style={{ display: "block", padding: "12px", color: "#333", textDecoration: "none" }}>💬 Foro</a>
        </nav>
      )}

      {/* HERO (Alineado a la izquierda con letras ajustadas) */}
      <section style={{ padding: "40px 15px", textAlign: "left" }}>
        <h2 style={{ fontSize: "1.7rem", color: "#fff", fontWeight: "800", marginBottom: "10px", lineHeight: "1.2" }}>
          Responsabilidad y <br /> Compromiso Felino
        </h2>
        <p style={{ fontSize: "0.9rem", color: "#eee", maxWidth: "85%", marginBottom: "25px" }}>
          Mejoramos la vida de los gatos comunitarios en el entorno rural mediante el método CER.
        </p>
        <div style={{ display: "flex", gap: "10px" }}>
          <a href="/donaciones" className="btn btn-primary" style={{ padding: "12px 20px" }}>❤️ Donar ahora</a>
          <a href="#ayuda" className="btn btn-secondary" style={{ padding: "12px 20px", border: "1px solid #fff" }}>🤝 Voluntariado</a>
        </div>
      </section>
    </header>
  );
          }
                                  
