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

  return (a 
    <header style={{ width: "100%", position: "relative", paddingTop: "10px" }}>
      {/* Logo con margen superior para no chocar con el botón de login del layout */}
      <div style={{ display: "flex", alignItems: "center", gap: "15px", padding: "5px 10px", marginTop: "10px" }}>
        <img src="/img/logo1.png" alt="Logo" style={{ height: "65px", width: "65px", borderRadius: "50%", backgroundColor: "#fff" }} />
        <div style={{ textAlign: "left" }}>
          <h1 style={{ margin: 0, fontSize: "1.2rem", color: "#fff", fontWeight: "700" }}>GatoCan Natura Rural</h1>
          <p style={{ margin: "2px 0 0 0", fontSize: "0.7rem", color: "#ccc", textTransform: "uppercase", fontWeight: "600" }}>Asociación Protectora Animal</p>
        </div>
      </div>

      <nav style={{ padding: "5px 20px" }}>
        {isMobile && (
          <button onClick={() => setOpen(!menuOpen)} style={{ padding: "8px 15px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", borderRadius: "8px" }}>
            {menuOpen ? "✕ Cerrar" : "☰ Menú"}
          </button>
        )}

        <ul style={{ 
          display: (isMobile && !menuOpen) ? "none" : "flex", 
          flexDirection: isMobile ? "column" : "row",
          background: "rgba(255,255,255,0.1)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: "12px",
          padding: "5px",
          margin: "15px 0",
          listStyle: "none",
          justifyContent: "space-around"
        }}>
          {links.map((l) => (
            <li key={l.name} style={{ flex: isMobile ? "none" : 1, textAlign: "center" }}>
              <Link href={l.href} style={{ color: l.color || "#fff", textDecoration: "none", fontSize: "0.9rem", fontWeight: "600", display: "block", padding: "10px", borderRadius: "8px" }}>
                {l.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <section style={{ padding: "5px 20px 20px 20px" }}>
        <h2 style={{ fontSize: "1.1rem", color: "#fff", fontWeight: "700", marginBottom: "8px" }}>Compromiso y Conciencia Felina</h2>
        <p style={{ fontSize: "1rem", color: "#eee", marginBottom: "18px", maxWidth: "700px", lineHeight: "1.4" }}>
          Supervisamos, alimentamos y sensibilizamos sobre el bienestar animal. Unidos por el respeto a nuestras colonias rurales mediante el método CER.
        </p>
        
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Link href="/donaciones" style={{ padding: "10px 22px", background: "#f39c12", color: "#fff", borderRadius: "25px", textDecoration: "none", fontWeight: "bold", fontSize: "0.85rem" }}>❤️ Donar</Link>
          <a href="#ayuda" style={{ padding: "10px 22px", border: "2px solid #fff", color: "#fff", borderRadius: "25px", textDecoration: "none", fontWeight: "bold", fontSize: "0.85rem" }}>🤝 Voluntariado</a>
          <a href="https://www.teaming.net/proyectogatonaturanrural" target="_blank" style={{ padding: "10px 22px", background: "#27ae60", color: "#fff", borderRadius: "25px", textDecoration: "none", fontWeight: "bold", fontSize: "0.85rem" }}>🪙 Teaming 1€</a>
        </div>
      </section>
    </header>
  );
}
