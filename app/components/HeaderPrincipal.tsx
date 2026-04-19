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
    <header id="inicio" className="site-header">
      {/* BARRA SUPERIOR: Logo y Acciones Rápidas */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", paddingBottom: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <img src="/img/logo1.png" alt="Logo" className="brand-logo" style={{ height: "60px" }} />
          <div className="header-text">
            <p className="eyebrow" style={{ margin: 0, fontSize: "0.8rem" }}>Asociación de protección animal</p>
            <h1 style={{ fontSize: "1.4rem", margin: 0 }}>GatoCan Natura Rural</h1>
          </div>
        </div>

        <div className="top-actions" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {status === "loading" ? (
             <span style={{ fontSize: "12px" }}>...</span>
          ) : session ? (
            <div style={{ position: "relative", zIndex: 1000 }}>
              <img
                src={avatar}
                alt="Avatar"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{ width: "40px", height: "40px", borderRadius: "50%", cursor: "pointer", border: "2px solid #0f4c5c" }}
              />
              {userMenuOpen && (
                <div className="user-dropdown" style={{ position: "absolute", right: 0, top: "50px", background: "#fff", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", minWidth: "150px", border: "1px solid #eee", padding: "5px" }}>
                  <Link href="/perfil" style={{ display: "block", padding: "10px", color: "#333", textDecoration: "none", fontSize: "14px" }}>Mi Perfil</Link>
                  <button onClick={() => signOut({ callbackUrl: "/" })} style={{ display: "block", width: "100%", textAlign: "left", padding: "10px", background: "none", border: "none", color: "#ff4757", cursor: "pointer", fontSize: "14px", borderTop: "1px solid #eee" }}>Cerrar sesión</button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="btn btn-secondary" style={{ padding: "8px 15px", fontSize: "14px" }}>
              Acceder
            </Link>
          )}
          
          <a href="https://www.teaming.net/proyectogatonaturanrural" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: "8px 15px", fontSize: "14px", backgroundColor: "#f39c12" }}>
            Teaming 1€
          </a>
        </div>
      </div>

      {/* BOTÓN MENÚ MÓVIL */}
      <button
        type="button"
        className="menu-toggle"
        onClick={() => setMenuOpen((current) => !current)}
        style={{ width: "100%", padding: "10px", margin: "10px 0" }}
      >
        {menuOpen ? "✕ Cerrar Menú" : "☰ Menú Navegación"}
      </button>

      {/* NAVEGACIÓN */}
      <nav className={`main-nav ${menuOpen ? "is-open" : ""}`}>
        <ul id="main-menu" className={menuOpen ? "is-open" : ""} style={{ listStyle: "none", padding: 0 }}>
          <li><a href="/">Inicio</a></li>
          <li><a href="#mision">Misión</a></li>
          <li><a href="#colonias">Colonias</a></li>
          <li><a href="/foro">Foro</a></li>
          <li><a href="/donaciones">Donaciones</a></li>
          <li><a href="/rankings">Rankings</a></li>
          <li><a href="#contacto">Contacto</a></li>
        </ul>
      </nav>

      {/* HERO: Mensaje directo y llamadas a la acción principales */}
      <section className="hero" style={{ padding: "40px 20px", textAlign: "center" }}>
        <h2 style={{ fontSize: "1.8rem", marginBottom: "15px" }}>Responsabilidad y Compromiso Felino</h2>
        <p style={{ maxWidth: "600px", margin: "0 auto 25px auto", lineHeight: "1.5" }}>
          Aplicamos el método CER para mejorar la vida de los gatos comunitarios en el entorno rural.
        </p>
        <div className="hero-actions" style={{ display: "flex", gap: "15px", justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/donaciones" className="btn btn-primary" style={{ padding: "12px 25px" }}>
            ❤️ Donar ahora
          </a>
          <a href="#ayuda" className="btn btn-secondary" style={{ padding: "12px 25px" }}>
            🤝 Voluntariado
          </a>
        </div>
      </section>
    </header>
  );
}
