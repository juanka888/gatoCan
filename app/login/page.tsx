"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await signIn("credentials", {
      email,
      password,
      callbackUrl: "/perfil",
    });
  };

  return (
    <main style={containerStyle}>
      <div style={cardStyle}>
        <Link href="/" style={{ fontSize: "0.85rem", color: "#666", textDecoration: "none" }}>
          ← Volver al inicio
        </Link>
        <h1 style={{ margin: "1rem 0 0.5rem" }}>Iniciar sesión</h1>
        <p style={{ color: "#666", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
          Bienvenido de nuevo a Gatocan Natura Rural.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
          <div style={inputGroup}>
            <label style={labelStyle}>Email</label>
            <input 
              style={inputStyle} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="tu@email.com" 
              type="email" 
              required 
            />
          </div>
          
          <div style={inputGroup}>
            <label style={labelStyle}>Contraseña</label>
            <input 
              style={inputStyle} 
              onChange={(e) => setPassword(e.target.value)} 
              type="password" 
              placeholder="••••••••" 
              required 
            />
          </div>

          <button type="submit" style={btnPrimary}>Entrar ahora</button>
          
          <div style={separator}><span>o accede con</span></div>

          <button 
            type="button" 
            onClick={() => signIn('google', { callbackUrl: '/perfil' })} 
            style={btnGoogle}
          >
            <img src="https://authjs.dev/img/providers/google.svg" width="20" alt="G" />
            Continuar con Google
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.9rem" }}>
          ¿Aún no tienes cuenta?{" "}
          <Link href="/register" style={{ color: "#ff4757", fontWeight: "bold" }}>
            Regístrate aquí
          </Link>
        </p>
      </div>
    </main>
  );
}

// ESTILOS (Para que se vea como tus capturas)
const containerStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  padding: "1rem",
  backgroundColor: "#f7f9fc",
  backgroundImage: "url('/img/foto-05.jpg')", // Usa una de tus fotos de la galería de fondo
  backgroundSize: "cover",
  backgroundPosition: "center"
};

const cardStyle: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.95)",
  padding: "2.5rem",
  borderRadius: "16px",
  width: "100%",
  maxWidth: "400px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
  backdropFilter: "blur(5px)"
};

const inputGroup = { display: "grid", gap: "0.3rem" };
const labelStyle = { fontSize: "0.85rem", fontWeight: "bold", color: "#444" };
const inputStyle = { padding: "0.75rem", borderRadius: "8px", border: "1px solid #ddd", fontSize: "1rem" };
const btnPrimary = { padding: "0.8rem", background: "#ff4757", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "1rem" };
const btnGoogle = { padding: "0.75rem", background: "white", border: "1px solid #ddd", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", fontWeight: "500" };
const separator = { textAlign: "center" as const, borderBottom: "1px solid #eee", lineHeight: "0.1em", margin: "10px 0 20px" };