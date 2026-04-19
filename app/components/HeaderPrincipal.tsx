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
    { name: "❤️ Donar", href: "/donaciones", color: "#f39c12" },
    { name: "🏆 Rankings", href: "/rankings" },
    { name: "💬 Foro", href: "/foro" },
    { name: "🖼️ Galería", href: "#galeria" },
    { name: "📰 Noticias", href: "#noticias" },
    { name: "✉️ Contacto", href: "#contacto" },
  ];

  return (
    <header style={{ width: "100%", position: "relative", paddingTop: "10px" }}>
      {/* LOGO: Restaurado el subtítulo original */}
      <div style={{ display: "flex", alignItems: "center", gap: "15px", padding: "15px 20px", marginTop: "25px" }}>
        <img src="/img/logo1.png" alt="Logo" style={{ height: "65px", width: "65px", borderRadius: "50%", backgroundColor: "#fff" }} />
        <div style={{ textAlign: "left" }}>
          <h1 style={{ margin: 0, fontSize: "1.5rem", color: "#fff", fontWeight: "900", lineHeight: "1.1" }}>GatoCan Natura Rural</h1>
          <p style={{ margin: "4px 0 0 0", fontSize: "0.7rem", color: "#ccc", textTransform: "uppercase", fontWeight: "600" }}>Asociación Protectora Animal</p>
        </div>
      </div>

      {/* MENÚ */}
      <nav style={{ padding: "0 20px" }}>
        {isMobile && (
          <button onClick={() => setOpen(!menuOpen)} style={{ padding: "10px 15px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", borderRadius: "6px", cursor: "pointer", marginBottom: "10px" }}>
            {menuOpen ? "✕ Cerrar" : "☰ Menú"}
          </button>
        )}
        <ul style={{ 
          display: (isMobile && !menuOpen) ? "none" : "flex", 
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? "10px" : "25px",
          listStyle: "none", padding: isMobile ? "15px" : "0", margin: "10px 0",
          background: isMobile ? "rgba(0,0,0,0.85)" : "transparent", borderRadius: "10px"
        }}>
          {links.map((l) => (
            <li key={l.name}><Link href={l.href} style={{ color: l.color || "#fff", textDecoration: "none", fontSize: "0.95rem", fontWeight: "600" }}>{l.name}</Link></li>
          ))}
        </ul>
      </nav>

      {/* HERO SECTION: Texto con "alma" y espacio inferior controlado */}
      <section style={{ padding: "10px 20px 30px 20px", textAlign: "left" }}>
        <h2 style={{ fontSize: "2.1rem", color: "#fff", fontWeight: "900", marginBottom: "10px", lineHeight: "1.1" }}>Compromiso y Conciencia Felina</h2>
        <p style={{ fontSize: "1rem", color: "#eee", marginBottom: "20px", maxWidth: "700px", lineHeight: "1.4" }}>
          Supervisamos, alimentamos y sensibilizamos sobre el bienestar animal. 
          Unidos por el respeto a nuestras colonias rurales mediante el método CER.
        </p>
        
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Link href="/donaciones" style={{ padding: "10px 20px", background: "#f39c12", color: "#fff", borderRadius: "25px", textDecoration: "none", fontWeight: "bold", fontSize: "0.85rem" }}>❤️ Donar</Link>
          <a href="#ayuda" style={{ padding: "10px 20px", border: "2px solid #fff", color: "#fff", borderRadius: "25px", textDecoration: "none", fontWeight: "bold", fontSize: "0.85rem" }}>🤝 Voluntariado</a>
          <a href="https://www.teaming.net/proyectogatonaturanrural" target="_blank" style={{ padding: "10px 20px", background: "#27ae60", color: "#fff", borderRadius: "25px", textDecoration: "none", fontWeight: "bold", fontSize: "0.85rem" }}>🪙 Teaming 1€</a>
        </div>
      </section>
    </header>
  );
                    }
