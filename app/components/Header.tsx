"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  const avatar = useMemo(() => 
    session?.user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(session?.user?.name || "G")}&background=0f4c5c&color=fff`,
    [session]
  );

  // Cerrar menús al cambiar de ruta o estado
  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  }, [status]);

  return (
    <header id="inicio" className="site-header">
      <div style={s.topBar}>
        {/* LOGO Y TÍTULO */}
        <div style={s.brand}>
          <img src="/img/logo1.png" alt="Logo" className="brand-logo" />
          <div className="header-text">
            <p className="eyebrow">Asociación de protección animal</p>
            <h1>GatoCan Natura Rural</h1>
          </div>
        </div>

        {/* ACCIONES PRINCIPALES UNIFICADAS */}
        <div className="hero-actions" style={s.actions}>
          {status === "loading" ? (
            <span style={s.loading}>...</span>
          ) : session ? (
            <div style={{ position: 'relative' }}>
              <img 
                src={avatar} 
                alt="Perfil" 
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={s.avatar} 
              />
              {userMenuOpen && (
                <div style={s.userDropdown}>
                  <Link href="/perfil" style={s.dropLink}>Mi Perfil</Link>
                  <button onClick={() => signOut({ callbackUrl: "/" })} style={s.dropBtn}>Cerrar sesión</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="btn btn-secondary">Entrar</Link>
              <Link href="/register" className="btn btn-secondary">Registrarse</Link>
            </>
          )}
          
          <a href="https://www.teaming.net/proyectogatonaturanrural" target="_blank" className="btn btn-primary">Teaming 1€</a>
        </div>
      </div>

      {/* BOTÓN MÓVIL */}
      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? "✕ Cerrar" : "☰ Menú"}
      </button>

      {/* NAVEGACIÓN LIMPIA */}
      <nav className={`main-nav ${menuOpen ? "is-open" : ""}`}>
        <ul id="main-menu">
          <li><a href="#inicio">Inicio</a></li>
          <li><a href="#mision">Misión</a></li>
          <li><a href="#colonias">Colonias</a></li>
          <li><a href="#ayuda">Cómo ayudar</a></li> {/* Aquí dentro podrías meter Campaña */}
          <li><a href="/foro">Foro</a></li>
          <li><a href="/rankings">Rankings</a></li>
          <li><a href="#donar" style={{ fontWeight: 'bold', color: '#0f766e' }}>Donar</a></li>
        </ul>
      </nav>

      {/* HERO SECTION (Opcional: puedes dejarlo aquí o en el Home) */}
      <section className="hero">
        <h2>Cuidamos colonias felinas con compromiso</h2>
        <p>Aplicamos el método CER para mejorar la vida de los gatos comunitarios.</p>
        <div className="hero-actions">
          <a href="#donar" className="btn btn-primary">Donar ahora</a>
          <a href="#ayuda" className="btn btn-secondary">Ser Voluntario</a>
        </div>
      </section>
    </header>
  );
}

const s = {
  topBar: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" as const },
  brand: { display: "flex", alignItems: "center", gap: "1rem" },
  actions: { display: "flex", alignItems: "center", gap: "0.5rem" },
  avatar: { width: "45px", height: "45px", borderRadius: "50%", cursor: 'pointer', border: '2px solid #0f4c5c' },
  loading: { color: "#999", fontSize: "0.8rem" },
  userDropdown: { position: 'absolute' as const, right: 0, top: '55px', background: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', minWidth: '160px', zIndex: 100, border: '1px solid #eee', padding: '5px' },
  dropLink: { display: 'block', padding: '10px', textDecoration: 'none', color: '#333', fontSize: '14px' },
  dropBtn: { display: 'block', width: '100%', textAlign: 'left' as const, padding: '10px', background: 'none', border: 'none', color: '#ff4757', cursor: 'pointer' }
};