"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const links = [
  { name: "Inicio", href: "/" },
  { name: "Donaciones", href: "/donaciones" },
  { name: "Rankings", href: "/rankings" },
  { name: "Foro", href: "/foro" },
  { name: "Galería", href: "#galeria" },
  { name: "Noticias", href: "#noticias" },
  { name: "Contacto", href: "#contacto" },
];

export default function MenuUniversal() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setMenuOpen(false);
    }
  }, [isMobile]);

  return (
    <nav style={{ width: "100%", position: "relative" }} aria-label="Navegación principal">
      {isMobile && (
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          style={{
            position: "fixed",
            top: "15px",
            left: "15px",
            zIndex: 60,
            padding: "8px 14px",
            color: "#fff",
            background: "rgba(255,255,255,0.14)",
            border: "1px solid rgba(255,255,255,0.28)",
            borderRadius: "12px",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            fontWeight: 700,
            fontSize: "0.9rem",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          {menuOpen ? "✕ Cerrar" : "☰ Menú"}
        </button>
      )}

      <ul
        style={{
          display: isMobile ? (menuOpen ? "flex" : "none") : "flex",
          flexDirection: isMobile ? "column" : "row",
          listStyle: "none",
          // MEJORA: En móvil ya no ocupa el 100%, sino un ancho máximo razonable
          width: isMobile ? "200px" : "100%", 
          gap: isMobile ? "2px" : "4px",
          margin: 0,
          padding: isMobile ? "8px" : "8px",
          borderRadius: "18px",
          border: "1px solid rgba(255,255,255,0.22)",
          background: isMobile ? "rgba(30, 30, 30, 0.75)" : "rgba(255,255,255,0.1)",
          backdropFilter: "blur(15px)",
          WebkitBackdropFilter: "blur(15px)",
          alignItems: isMobile ? "flex-start" : "center",
          justifyContent: "space-between",
          boxSizing: "border-box",
          position: isMobile ? "fixed" : "relative",
          top: isMobile ? "65px" : "auto",
          left: isMobile ? "15px" : "auto",
          // MEJORA: Quitamos el 'right: 15px' para que no se estire a la derecha
          right: isMobile ? "auto" : "auto", 
          zIndex: isMobile ? 55 : "auto",
          boxShadow: isMobile ? "0 10px 25px rgba(0,0,0,0.3)" : "none",
        }}
      >
        {links.map((link) => (
          <li key={link.name} style={{ flex: isMobile ? "none" : 1, width: "100%" }}>
            <Link
              href={link.href}
              onClick={() => isMobile && setMenuOpen(false)} // Cierra al hacer click
              style={{
                display: "block",
                padding: isMobile ? "10px 16px" : "10px 8px",
                // MEJORA: Alineado a la izquierda en móvil para mejor lectura
                textAlign: isMobile ? "left" : "center", 
                color: "#fff",
                textDecoration: "none",
                fontWeight: 500,
                borderRadius: "10px",
                fontSize: "0.9rem",
                lineHeight: 1.2,
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
