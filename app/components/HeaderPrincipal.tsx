"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

export default function HeaderPrincipal() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  const avatar = useMemo(
    () =>
      session?.user?.image ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        session?.user?.name || "G",
      )}&background=0f4c5c&color=fff`,
    [session],
  );

  useEffect(() => {
    setMenuOpen(false);
  }, [status]);

  return (
    <header id="inicio" className="site-header" style={{ width: "100%", overflowX: "hidden" }}>
      {/* BARRA SUPERIOR: Logo y Acciones Rápidas (Compacta y a la izquierda) */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", flexWrap: "wrap", padding: "10px 15px", width: "100%", boxSizing: "border-box" }}>
        
        {/* BLOQUE IZQUIERDO: Logo y Título (Más grandes y alineados) */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: "1 1 auto" }}>
          <img 
            src="/img/logo1.png" 
            alt="Logo GatoCan" 
            className="brand-logo" 
            style={{ height: "70px", width: "70px", borderRadius: "50%", border: "2px solid #fff", padding: "2px", backgroundColor: "#fff" }} 
          />
          <div className="header-text" style={{ textAlign: "left" }}>
            <p className="eyebrow" style={{ margin: 0, fontSize: "0.85rem", opacity: 0.9 }}>Asociación de protección animal</p>
            <h1 style={{ fontSize: "1.6rem", margin: "2px 0 0 0", fontWeight: "800" }}>GatoCan Natura Rural</h1>
          </div>
        </div>

        {/* BLOQUE DERECHO: Acciones y Menú (Compactos en línea) */}
        <div className="top-actions" style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
          
          {/* Botón de Menú (Compacto, no ocupa todo el ancho) */}
          <button
            type="button"
            className="menu-toggle"
            onClick={() => setMenuOpen((current) => !current)}
            style={{ padding: "8px 12px", fontSize: "0.9rem", border: "1px solid rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.1)", color: "#fff", borderRadius: "8px", cursor: "pointer" }}
          >
            {menuOpen ? "✕ Cerrar" : "☰ Menú"}
          </button>

          {/* Estado de Sesión / Botón de Acceso (Unificado) */}
          {status === "loading" ? (
             <span style={{ fontSize: "12px", color: "#fff" }}>...</span>
          ) : session ? (
            <div style={{ position: "relative", zIndex: 1000 }}>
              <img
                src={avatar}
                alt="Avatar Usuario"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{ width: "42px", height: "42px", borderRadius: "50%", cursor: "pointer", border: "2px solid #fff", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}
              />
              {userMenuOpen && (
                <div className="user-dropdown" style={{ position: "absolute", right: 0, top: "55px", background: "#fff", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", minWidth: "160px", border: "1px solid #eee", padding: "5px" }}>
                  <Link href="/perfil" onClick={() => setUserMenuOpen(false)} style={{ display: "block", padding: "10px", color: "#333", textDecoration: "none", fontSize: "14px" }}>Mi Perfil</Link>
                  <button onClick={() => { signOut({ callbackUrl: "/" }); setUserMenuOpen(false); }} style={{ display: "block", width: "100%", textAlign: "left", padding: "10px", background: "none", border: "none", color: "#ff4757", cursor: "pointer", fontSize: "14px", borderTop: "1px solid #eee" }}>Cerrar sesión</button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="btn btn-secondary" style={{ padding: "8px 12px", fontSize: "0.9rem", whiteSpace: "nowrap" }}>
              Acceder / Registrarse
            </Link>
          )}
          
          {/* Botón Teaming (Siempre visible, color distintivo) */}
          <a href="https://www.teaming.net/proyectogatonaturanrural" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: "8px 12px", fontSize: "0.9rem", backgroundColor: "#f39c12", color: "#fff", whiteSpace: "nowrap" }}>
            Teaming 1€
          </a>
        </div>
      </div>

      {/* NAVEGACIÓN DESPLEGABLE */}
      <nav className={`main-nav ${menuOpen ? "is-open" : ""}`} style={{ width: "100%", padding: menuOpen ? "10px 15px" : "0" }}>
        <ul id="main-menu" className={menuOpen ? "is-open" : ""} style={{ listStyle: "none", padding: 0, margin: 0, display: menuOpen ? "flex" : "none", flexDirection: "column", gap: "5px", background: "rgba(255,255,255,0.95)", borderRadius: "12px", border: "1px solid #eee", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
          <li><a href="/" style={{ display: "block", padding: "12px", color: "#333", textDecoration: "none", fontSize: "1rem", borderBottom: "1px solid #f0f0f0" }}>Inicio</a></li>
          <li><a href="/donaciones" style={{ display: "block", padding: "12px", color: "#333", textDecoration: "none", fontSize: "1rem", borderBottom: "1px solid #f0f0f0" }}>❤️ Donaciones</a></li>
          <li><a href="/foro" style={{ display: "block", padding: "12px", color: "#333", textDecoration: "none", fontSize: "1rem", borderBottom: "1px solid #f0f0f0" }}>💬 Foro</a></li>
          <li><a href="/rankings" style={{ display: "block", padding: "12px", color: "#333", textDecoration: "none", fontSize: "1rem", borderBottom: "1px solid #f0f0f0" }}>🏆 Rankings</a></li>
          <li><a href="#contacto" style={{ display: "block", padding: "12px", color: "#333", textDecoration: "none", fontSize: "1rem" }}>✉️ Contacto</a></li>
        </ul>
      </nav>

      {/* HERO: Título y texto alineados a la IZQUIERDA */}
      <section className="hero" style={{ padding: "60px 15px", textAlign: "left", width: "100%", boxSizing: "border-box" }}>
        <h2 style={{ fontSize: "2.2rem", marginBottom: "15px", fontWeight: "800", lineHeight: "1.2", maxWidth: "700px" }}>Responsabilidad y Compromiso Felino</h2>
        <p style={{ maxWidth: "600px", margin: "0 0 30px 0", lineHeight: "1.6", fontSize: "1.1rem", opacity: 0.9 }}>
          Aplicamos el método CER para mejorar la vida de los gatos comunitarios y fomentar una convivencia respetuosa en el entorno rural.
        </p>
        
        {/* Acciones principales del Hero (Donar destaca) */}
        <div className="hero-actions" style={{ display: "flex", gap: "15px", justifyContent: "flex-start", flexWrap: "wrap" }}>
          <a href="/donaciones" className="btn btn-primary" style={{ padding: "14px 30px", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "8px" }}>
            ❤️ Donar ahora
          </a>
          <a href="#ayuda" className="btn btn-secondary" style={{ padding: "14px 30px", fontSize: "1.1rem", border: "2px solid #fff" }}>
            🤝 Voluntariado
          </a>
        </div>
      </section>
    </header>
  );
                                                                 }

