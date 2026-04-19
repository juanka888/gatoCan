"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function HeaderPrincipal() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si es móvil para mostrar el menú horizontal o vertical
  useEffect(() => {
    const checkSize = () => setIsMobile(window.innerWidth < 768);
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  const navLinks = [
    { name: "Inicio", href: "/" },
    { name: "❤️ Donaciones", href: "/donaciones", color: "#f39c12" },
    { name: "🏆 Rankings", href: "/rankings" },
    { name: "💬 Foro", href: "/foro" },
    { name: "🖼️ Galería", href: "#galeria" },
    { name: "✉️ Contacto", href: "#contacto" },
  ];

  return (
    <header style={{ width: "100%", position: "relative", paddingTop: "5px" }}>
      {/* LOGO Y TÍTULO */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 15px", marginBottom: "5px" }}>
        <img src="/img/logo1.png" alt="Logo" style={{ height: "60px", width: "60px", borderRadius: "50%", backgroundColor: "#fff", padding: "2px" }} />
        <div style={{ textAlign: "left" }}>
          <h1 style={{ margin: 0, fontSize: "1.35rem", color: "#fff", fontWeight: "800", lineHeight: "1" }}>GatoCan Natura Rural</h1>
          <p style={{ margin: "3px 0 0 0", fontSize: "0.6rem", color: "#ccc", textTransform: "uppercase", letterSpacing: "1px" }}>Asociación de protección animal</p>
        </div>
      </div>

      {/* NAVEGACIÓN */}
      <nav style={{ padding: "0 15px" }}>
        {isMobile && (
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ padding: "8px 15px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem", marginBottom: "10px" }}
          >
            {menuOpen ? "✕ Cerrar" : "☰ Menú"}
          </button>
        )}

        <ul style={{ 
          display: (isMobile && !menuOpen) ? "none" : "flex", 
          flexDirection: isMobile ? "column" : "row",
          listStyle: "none", 
          padding: isMobile ? "15px" : "0", 
          margin: isMobile ? "0 0 10px 0" : "10px 0 20px 0",
          gap: isMobile ? "10px" : "20px",
          background: isMobile ? "rgba(0,0,0,0.9)" : "transparent",
          borderRadius: isMobile ? "10px" : "0",
          flexWrap: "wrap"
        }}>
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link href={link.href} onClick={() => setMenuOpen(false)} style={{ color: link.color || "#fff", textDecoration: "none", fontSize: "0.9rem", fontWeight: "600", display: "block" }}>
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* HERO SECTION */}
      <section style={{ padding: "15px 15px 25px 15px", textAlign: "left" }}>
        <h2 style={{ fontSize: "2rem", color: "#fff", fontWeight: "800", marginBottom: "8px", lineHeight: "1.1" }}>Responsabilidad y Compromiso</h2>
        <p style={{ fontSize: "0.95rem", color: "#eee", maxWidth: "600px", marginBottom: "20px" }}>Mejoramos la vida de los gatos comunitarios mediante el método CER.</p>
        
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Link href="/donaciones" style={{ padding: "12px 20px", fontSize: "0.85rem", background: "#f39c12", color: "#fff", borderRadius: "8px", textDecoration: "none", fontWeight: "bold" }}>❤️ Donar ahora</Link>
          <a href="#ayuda" style={{ padding: "12px 20px", fontSize: "0.85rem", border: "1.5px solid #fff", color: "#fff", borderRadius: "8px", textDecoration: "none", fontWeight: "bold" }}>🤝 Voluntariado</a>
          <a href="https://www.teaming.net/proyectogatonaturanrural" target="_blank" style={{ padding: "12px 20px", fontSize: "0.85rem", backgroundColor: "#27ae60", color: "#fff", borderRadius: "8px", textDecoration: "none", fontWeight: "bold" }}>🪙 Teaming 1€</a>
        </div>
      </section>
    </header>
  );
}
