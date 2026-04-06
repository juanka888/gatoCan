"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { z } from "zod";

// --- ESQUEMA DE SEGURIDAD CON ZOD ---
const loginSchema = z.object({
  email: z.string().email("Introduce un correo electrónico válido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Evitar que el espacio interfiera con el foco o giros de tarjeta
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === " ") e.stopPropagation();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // 1. Validación de seguridad con Zod
    const result = loginSchema.safeParse({ email, password });
    
    if (!result.success) {
      setError(result.error.errors[0].message);
      setLoading(false);
      return;
    }

    // 2. Intento de inicio de sesión
    const res = await signIn("credentials", {
      email: result.data.email,
      password: result.data.password,
      redirect: false, // Lo manejamos nosotros para controlar el error
      callbackUrl: "/perfil",
    });

    if (res?.error) {
      setError("Email o contraseña incorrectos");
      setLoading(false);
    } else {
      window.location.href = "/perfil"; // Redirección manual exitosa
    }
  };

  return (
    <main style={containerStyle}>
      <div style={cardStyle}>
        <Link href="/" style={{ fontSize: "0.85rem", color: "#666", textDecoration: "none", display: "flex", alignItems: "center", gap: "5px" }}>
          ← Volver al inicio
        </Link>
        
        <h1 style={{ margin: "1.5rem 0 0.5rem", color: "#333", fontSize: "1.8rem" }}>Iniciar sesión</h1>
        <p style={{ color: "#666", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
          Bienvenido de nuevo a Gatocan Natura Rural.
        </p>

        {error && (
          <div style={errorBox}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
          <div style={inputGroup}>
            <label style={labelStyle}>Email</label>
            <input 
              style={inputStyle} 
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
              onKeyDown={handleKeyDown}
              placeholder="tu@email.com" 
              type="email" 
              required 
            />
          </div>
          
          <div style={inputGroup}>
            <label style={labelStyle}>Contraseña</label>
            <input 
              style={inputStyle} 
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              onKeyDown={handleKeyDown}
              type="password" 
              placeholder="••••••••" 
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{...btnPrimary, opacity: loading ? 0.7 : 1}}
          >
            {loading ? "Verificando..." : "Entrar ahora"}
          </button>
          
          <div style={separator}>
            <span style={{ background: "#fff", padding: "0 10px", color: "#999", fontSize: "0.8rem" }}>
              o accede con
            </span>
          </div>

          <button 
            type="button" 
            onClick={() => signIn('google', { callbackUrl: '/perfil' })} 
            style={btnGoogle}
          >
            <img 
              src="https://authjs.dev/img/providers/google.svg" 
              width="20" 
              height="20" 
              alt="Google" 
            />
            Continuar con Google
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.9rem", color: "#444" }}>
          ¿Aún no tienes cuenta?{" "}
          <Link href="/register" style={{ color: "#ff4757", fontWeight: "bold", textDecoration: "none" }}>
            Regístrate aquí
          </Link>
        </p>
      </div>
    </main>
  );
}

// --- ESTILOS MEJORADOS ---
const containerStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  padding: "1rem",
  backgroundColor: "#f7f9fc",
  backgroundImage: "linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('/img/foto-05.jpg')", 
  backgroundSize: "cover",
  backgroundPosition: "center",
  fontFamily: "sans-serif"
};

const cardStyle: React.CSSProperties = {
  background: "white",
  padding: "2.5rem",
  borderRadius: "16px",
  width: "100%",
  maxWidth: "400px",
  boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
};

const inputGroup: React.CSSProperties = { display: "grid", gap: "0.4rem" };
const labelStyle: React.CSSProperties = { fontSize: "0.85rem", fontWeight: "bold", color: "#444", textAlign: "left" };
const inputStyle: React.CSSProperties = { padding: "0.75rem", borderRadius: "8px", border: "1px solid #ddd", fontSize: "1rem", outline: "none" };
const btnPrimary: React.CSSProperties = { padding: "0.8rem", background: "#ff4757", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "1rem" };
const btnGoogle: React.CSSProperties = { padding: "0.75rem", background: "white", border: "1px solid #ddd", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", fontWeight: "500", color: "#555" };
const separator: React.CSSProperties = { textAlign: "center", borderBottom: "1px solid #eee", lineHeight: "0.1em", margin: "20px 0" };
const errorBox: React.CSSProperties = { backgroundColor: "#fee2e2", color: "#b91c1c", padding: "10px", borderRadius: "8px", marginBottom: "1.5rem", fontSize: "0.85rem", fontWeight: "bold", textAlign: "center" };