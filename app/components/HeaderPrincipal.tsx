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

  return (
    <header style={{ width: "100%", position: "relative", paddingTop: "20px" }}>
      {/* Logo y Nombre con el subtítulo que da seriedad */}
      <div style={{ display: "flex", alignItems: "center", gap: "15px", padding: "10px 20px" }}>
        <img src="/img/logo1.png" alt="Logo" style={{ height: "65px", width: "65px", borderRadius: "50%", backgroundColor: "#fff" }} />
        <div style={{ textAlign: "left" }}>
          <h1 style={{ margin: 0, fontSize: "1.5rem", color: "#fff", fontWeight: "900" }}>GatoCan Natura Rural</h1>
          <p style={{ margin: "2px 0 0 0", fontSize: "0.75rem", color: "#ccc", textTransform: "uppercase", fontWeight: "600" }}>Asociación Protectora Animal</p>
        </div>
      </div>

      {/* Menú de navegación */}
      <nav style={{ padding: "10px 20px" }}>
        {isMobile && (
          <button onClick={() => setOpen(!menuOpen)} style={{ padding: "8px 12px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", borderRadius: "6px" }}>
            {menuOpen ? "✕ Cerrar" : "☰ Menú"}
          </button>
        )}
        <ul style={{ 
          display: (isMobile && !menuOpen) ? "none" : "flex", 
          flexDirection: isMobile ? "column" : "row",
          gap: "20px", listStyle: "none", padding: isMobile ? "15px" : "0", margin: "10px 0",
          background: isMobile ? "rgba(0,0,0,0.8)" : "transparent", borderRadius: "10px"
        }}>
          <li><Link href="/" style={{ color: "#fff", textDecoration: "none", fontWeight: "600" }}>Inicio</Link></li>
          <li><Link href="/donaciones" style={{ color: "#f39c12", textDecoration: "none", fontWeight: "600" }}>❤️ Donar</Link></li>
          <li><Link href="/rankings" style={{ color: "#fff", textDecoration: "none" }}>🏆 Rankings</Link></li>
          <li><Link href="/foro" style={{ color: "#fff", textDecoration: "none" }}>💬 Foro</Link></li>
          <li><Link href="#galeria" style={{ color: "#fff", textDecoration: "none" }}>🖼️ Galería</Link></li>
          <li><Link href="#noticias" style={{ color: "#fff", textDecoration: "none" }}>📰 Noticias</Link></li>
        </ul>
      </nav>

      {/* Hero: Texto más completo y emocional */}
      <section style={{ padding: "15px 20px 30px 20px" }}>
        <h2 style={{ fontSize: "2.2rem", color: "#fff", fontWeight: "900", marginBottom: "10px", lineHeight: "1.1" }}>Compromiso y Conciencia Felina</h2>
        <p style={{ fontSize: "1.05rem", color: "#eee", marginBottom: "20px", maxWidth: "700px", lineHeight: "1.5" }}>
          Cuidamos, supervisamos y sensibilizamos sobre el bienestar de nuestras colonias. 
          Un proyecto nacido del respeto animal en el entorno rural mediante el método CER.
        </p>
        
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Link href="/donaciones" style={{ padding: "12px 20px", background: "#f39c12", color: "#fff", borderRadius: "25px", textDecoration: "none", fontWeight: "bold" }}>❤️ Donar</Link>
          <a href="#ayuda" style={{ padding: "12px 20px", border: "2px solid #fff", color: "#fff", borderRadius: "25px", textDecoration: "none", fontWeight: "bold" }}>🤝 Voluntariado</a>
          <a href="https://www.teaming.net/proyectogatonaturanrural" target="_blank" style={{ padding: "12px 20px", background: "#27ae60", color: "#fff", borderRadius: "25px", textDecoration: "none", fontWeight: "bold" }}>🪙 Teaming 1€</a>
        </div>
      </section>
    </header>
  );
}
