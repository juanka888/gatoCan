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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <img src="/img/logo1.png" alt="Logo de GatoCan Natura Rural" className="brand-logo" />
          <div>
            <p className="eyebrow">Asociación de protección animal</p>
            <h1>GatoCan Natura Rural</h1>
          </div>
        </div>
        <div className="hero-actions">
          {status === "loading" ? (
            <button className="btn btn-secondary" disabled>
              Cargando...
            </button>
          ) : session ? (
            <div style={{ position: "relative", zIndex: 1000 }}>
              <img
                src={avatar}
                alt="Avatar"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{
                  width: "45px",
                  height: "45px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  border: "2px solid #0f4c5c",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                }}
              />
              {userMenuOpen && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "55px",
                    background: "#fff",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    minWidth: "160px",
                    padding: "5px",
                    border: "1px solid #eee",
                  }}
                >
                  <Link
                    href="/perfil"
                    style={{ display: "block", padding: "10px", textDecoration: "none", color: "#333", fontSize: "14px" }}
                  >
                    Mi Perfil
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "10px",
                      background: "none",
                      border: "none",
                      color: "#ff4757",
                      cursor: "pointer",
                      fontSize: "14px",
                      borderTop: "1px solid #f5f5f5",
                    }}
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="btn btn-secondary">
                Acceder
              </Link>
              <Link href="/register" className="btn btn-secondary">
                Crear cuenta
              </Link>
            </>
          )}

          <a
            href="https://www.teaming.net/proyectogatonaturanrural"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            Teaming 1€
          </a>
        </div>
      </div>

      <button
        type="button"
        className="menu-toggle"
        onClick={() => setMenuOpen((current) => !current)}
        aria-expanded={menuOpen}
        aria-controls="main-menu"
      >
        ☰ Menú
      </button>

      <nav aria-label="Principal" className="main-nav">
        <ul id="main-menu" className={menuOpen ? "is-open" : ""}>
          <li>
            <a href="#inicio">Inicio</a>
          </li>
          <li>
            <a href="#mision">Misión</a>
          </li>
          <li>
            <a href="#colonias">Colonias</a>
          </li>
          <li>
            <a href="#galeria">Galería</a>
          </li>
          <li>
            <a href="#fichas">Fichas</a>
          </li>
          <li>
            <a href="#minijuego">Minijuego</a>
          </li>
          <li>
            <a href="#ayuda">Cómo ayudar</a>
          </li>
          <li>
            <a href="#noticias">Noticias</a>
          </li>
          <li>
            <a href="/foro">Foro</a>
          </li>
          <li>
            <a href="#contacto">Contacto</a>
          </li>
          <li>
            <a href="#donar">Donar</a>
          </li>
          <li>
            <a href="/rankings">Rankings</a>
          </li>
          <li>
            <a href="#campana">Campaña</a>
          </li>
          <li>
            <a href="/perfil">Perfil</a>
          </li>
        </ul>
      </nav>

      <section className="hero">
        <h2>Cuidamos colonias felinas con responsabilidad y compromiso</h2>
        <p>
          Aplicamos el método CER para mejorar la vida de los gatos comunitarios y fomentar una convivencia respetuosa
          en el entorno rural.
        </p>
        <div className="hero-actions">
          {status === "authenticated" ? (
            <a href="/perfil" className="btn btn-secondary">
              Mi perfil
            </a>
          ) : (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => signIn("google", { callbackUrl: "/perfil" })}
            >
              Acceder
            </button>
          )}
          <a href="/register" className="btn btn-secondary">
            Crear cuenta
          </a>
          <a href="#ayuda" className="btn btn-secondary">
            Hazte voluntario/a
          </a>
          <a href="#donar" className="btn btn-primary">
            Donar ahora
          </a>
          <a href="/foro" className="btn btn-secondary">
            Entrar al foro
          </a>
        </div>
      </section>
    </header>
  );
}
