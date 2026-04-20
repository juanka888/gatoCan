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
          width: "100%",
          gap: isMobile ? "6px" : "4px",
          margin: 0,
          padding: isMobile ? "12px" : "8px",
          borderRadius: "14px",
          border: "1px solid rgba(255,255,255,0.22)",
          background: "rgba(255,255,255,0.1)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          alignItems: "center",
          justifyContent: "space-between",
          boxSizing: "border-box",
          position: isMobile ? "fixed" : "relative",
          top: isMobile ? "60px" : "auto",
          left: isMobile ? "15px" : "auto",
          right: isMobile ? "15px" : "auto",
          zIndex: isMobile ? 55 : "auto",
        }}
      >
        {links.map((link) => (
          <li key={link.name} style={{ flex: isMobile ? "none" : 1, width: isMobile ? "100%" : "auto" }}>
            <Link
              href={link.href}
              style={{
                display: "block",
                padding: isMobile ? "11px 12px" : "10px 8px",
                textAlign: "center",
                color: "#fff",
                textDecoration: "none",
                fontWeight: 600,
                borderRadius: "10px",
                fontSize: "0.92rem",
                lineHeight: 1.1,
              }}
            >
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
