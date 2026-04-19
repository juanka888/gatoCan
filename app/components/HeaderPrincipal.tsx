"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function HeaderPrincipal() {
  const [menuOpen, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const links = [
    { name: "Inicio", href: "/" },
    { name: "❤️ Donaciones", href: "/donaciones", color: "#f39c12" },
    { name: "🏆 Rankings", href: "/rankings" },
    { name: "💬 Foro", href: "/foro" },
    { name: "🖼️ Galería", href: "#galeria" },
    { name: "📰 Noticias", href: "#noticias" },
    { name: "✉️ Contacto", href: "#contacto" },
  ];

  return (
    <header style={{ width: "100%", position: "relative", paddingTop: "15px" }}>
      {/* CABECERA: Logo y Nombre con aire superior */}
      <div style={{ display: "flex", alignItems: "center", gap: "15px", padding: "15px 20px", marginTop: "10px" }}>
        <img src="/img/logo1.png" alt="Logo" style={{ height: "65px", width: "65px", borderRadius: "50%", backgroundColor: "#fff", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }} />
        <div style={{ textAlign: "left" }}>
          <h1 style={{ margin: 0, fontSize: "1.5rem", color: "#fff", fontWeight: "900", lineHeight: "1.1" }}>GatoCan Natura Rural</h1>
          <p style={{ margin: "4px 0 0 0", fontSize: "0.65rem", color: "#ddd", textTransform: "uppercase", letterSpacing: "1px" }}>Protección, Bienestar y Respeto Animal</p>
        </div>
      </div>

      {/* NAVEGACIÓN */}
      <nav style={{ padding: "0 20px" }}>
        {isMobile && (
          <button 
            onClick={() => setOpen(!menuOpen)} 
            style={{ padding: "10px 18px", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", borderRadius: "8px", cursor: "pointer", fontSize: "0.85rem", marginBottom: "15px" }}
          >
            {menuOpen ? "✕ Cerrar Menú" : "☰ Menú Principal"}
          </button>
        )}

        <ul style={{ 
          display: (isMobile && !menuOpen) ? "none" : "flex", 
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? "12px" : "25px",
          listStyle: "none",
          padding: isMobile ? "20px" : "0",
          margin: "10px 0 20px 0",
          background: isMobile ? "rgba(0,0,0,0.9)" : "transparent",
          borderRadius: "12px",
          flexWrap: "wrap"
        }}>
          {links.map((l) => (
            <li key={l.name}>
              <Link href={l.href} style={{ color: l.color || "#fff", textDecoration: "none", fontSize: "0.95rem", fontWeight: "600", transition: "0.3s" }}>{l.name}</Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* HERO SECTION: Texto enriquecido y menos espacio abajo */}
      <section style={{ padding: "20px 20px 40px 20px", textAlign: "left" }}>
        <h2 style={{ fontSize: "2.2rem", color: "#fff", fontWeight: "900", marginBottom: "12px", lineHeight: "1.1", maxWidth: "800px" }}>
          Compromiso y Conciencia Felina
        </h2>
        <p style={{ fontSize: "1.05rem", color: "#eee", marginBottom: "25px", maxWidth: "700px", lineHeight: "1.5" }}>
          Supervisamos, alimentamos y sensibilizamos sobre el cuidado de nuestras colonias. 
          Unidos por el bienestar animal y el respeto en nuestro entorno rural mediante el método CER.
        </p>
        
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Link href="/donaciones" style={{ padding: "12px 24px", background: "#f39c12", color: "#fff", borderRadius: "30px", textDecoration: "none", fontWeight: "bold", fontSize: "0.9rem", boxShadow: "0 4px 15px rgba(243,156,18,0.3)" }}>❤️ Donar ahora</Link>
          <a href="#ayuda" style={{ padding: "12px 24px", border: "2px solid #fff", color: "#fff", borderRadius: "30px", textDecoration: "none", fontWeight: "bold", fontSize: "0.9rem" }}>🤝 Voluntariado</a>
          <a href="https://www.teaming.net/proyectogatonaturanrural" target="_blank" style={{ padding: "12px 24px", background: "#27ae60", color: "#fff", borderRadius: "30px", textDecoration: "none", fontWeight: "bold", fontSize: "0.9rem", boxShadow: "0 4px 15px rgba(39,174,96,0.3)" }}>🪙 Teaming 1€</a>
        </div>
      </section>
    </header>
  );
      }
