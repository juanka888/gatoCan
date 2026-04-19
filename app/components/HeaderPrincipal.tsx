"use client";

import { useState } from "react";
import Link from "next/link";

export default function HeaderPrincipal() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header style={{ width: "100%", position: "relative", paddingTop: "5px" }}>
      {/* LOGO: Nombre arriba, subtítulo abajo */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 15px" }}>
        <img src="/img/logo1.png" alt="Logo" style={{ height: "60px", width: "60px", borderRadius: "50%", backgroundColor: "#fff" }} />
        <div style={{ textAlign: "left" }}>
          <h1 style={{ margin: 0, fontSize: "1.35rem", color: "#fff", fontWeight: "800", lineHeight: "1" }}>GatoCan Natura Rural</h1>
          <p style={{ margin: "3px 0 0 0", fontSize: "0.6rem", color: "#ccc", textTransform: "uppercase", letterSpacing: "1px" }}>Asociación de protección animal</p>
        </div>
      </div>

      {/* MENÚ NAVEGACIÓN */}
      <nav style={{ padding: "5px 15px" }}>
        <button 
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ padding: "6px 12px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem" }}
        >
          {menuOpen ? "✕ Cerrar" : "☰ Menú"}
        </button>

        {menuOpen && (
          <ul style={{ listStyle: "none", padding: "10px", margin: "5px 0", background: "rgba(0,0,0,0.85)", borderRadius: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <li><Link href="/" style={{ color: "#fff", textDecoration: "none", fontSize: "0.9rem" }}>Inicio</Link></li>
            <li><Link href="/donaciones" style={{ color: "#f39c12", textDecoration: "none", fontSize: "0.9rem" }}>❤️ Donaciones</Link></li>
            <li><Link href="/rankings" style={{ color: "#fff", textDecoration: "none", fontSize: "0.9rem" }}>🏆 Rankings</Link></li>
            <li><Link href="/foro" style={{ color: "#fff", textDecoration: "none", fontSize: "0.9rem" }}>💬 Foro</Link></li>
          </ul>
        )}
      </nav>

      {/* HERO: 3 botones en línea */}
      <section style={{ padding: "25px 15px", textAlign: "left" }}>
        <h2 style={{ fontSize: "1.9rem", color: "#fff", fontWeight: "800", marginBottom: "8px", lineHeight: "1.1" }}>Responsabilidad y Compromiso</h2>
        <p style={{ fontSize: "0.9rem", color: "#eee", marginBottom: "20px" }}>Mejoramos la vida de los gatos comunitarios.</p>
        
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <Link href="/donaciones" className="btn btn-primary" style={{ padding: "10px 16px", fontSize: "0.85rem", borderRadius: "8px" }}>❤️ Donar</Link>
          <a href="#ayuda" className="btn btn-secondary" style={{ padding: "10px 16px", fontSize: "0.85rem", borderRadius: "8px", border: "1px solid #fff" }}>🤝 Voluntariado</a>
          <a href="https://www.teaming.net/proyectogatonaturanrural" target="_blank" className="btn btn-primary" style={{ padding: "10px 16px", fontSize: "0.85rem", borderRadius: "8px", backgroundColor: "#27ae60" }}>🪙 Teaming</a>
        </div>
      </section>
    </header>
  );
}
