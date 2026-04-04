"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        // Si el registro es éxito, hacemos login automático
        await signIn("credentials", {
          email,
          password,
          callbackUrl: "/perfil",
        });
      } else {
        const data = await res.json();
        setError(data.message || "Error al crear la cuenta");
      }
    } catch (err) {
      setError("Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={containerStyle}>
      <div style={cardStyle}>
        <Link href="/" style={{ fontSize: "0.85rem", color: "#666", textDecoration: "none" }}>
          ← Volver al inicio
        </Link>
        
        <h1 style={{ margin: "1rem 0 0.5rem", color: "#333" }}>Crear cuenta</h1>
        <p style={{ color: "#666", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
          Únete a la comunidad de Gatocan Natura Rural.
        </p>

        {error && (
          <div style={{ color: "white", background: "#ff4757", padding: "0.8rem", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.85rem" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
          <div style={inputGroup}>
            <label style={labelStyle}>Nombre completo</label>
            <input 
              style={inputStyle} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Tu nombre" 
              type="text" 
              required 
            />
          </div>

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
              placeholder="Mínimo 6 caracteres" 
              minLength={6}
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{...btnPrimary, opacity: loading ? 0.7 : 1}}
          >
            {loading ? "Creando cuenta..." : "Registrarme"}
          </button>
          
          <div style={separator}>
            <span style={{ background: "#fff", padding: "0 10px", color: "#999", fontSize: "0.8rem" }}>
              o regístrate con
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
            Google
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.9rem", color: "#444" }}>
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" style={{ color: "#ff4757", fontWeight: "bold", textDecoration: "none" }}>
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </main>
  );
}

// --- ESTILOS (A juego con Login) ---
const containerStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  padding: "1rem",
  backgroundColor: "#f7f9fc",
  backgroundImage: "url('/img/foto-05.jpg')", 
  backgroundSize: "cover",
  backgroundPosition: "center",
  fontFamily: "sans-serif"
};

const cardStyle: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.98)",
  padding: "2rem 2.5rem",
  borderRadius: "16px",
  width: "100%",
  maxWidth: "400px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
  backdropFilter: "blur(5px)"
};

const inputGroup: React.CSSProperties = { display: "grid", gap: "0.3rem" };
const labelStyle: React.CSSProperties = { fontSize: "0.85rem", fontWeight: "bold", color: "#444" };
const inputStyle: React.CSSProperties = { padding: "0.75rem", borderRadius: "8px", border: "1px solid #ddd", fontSize: "1rem", outline: "none" };
const btnPrimary: React.CSSProperties = { padding: "0.8rem", background: "#ff4757", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "1rem" };
const btnGoogle: React.CSSProperties = { padding: "0.75rem", background: "white", border: "1px solid #ddd", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", fontWeight: "500", color: "#555" };
const separator: React.CSSProperties = { textAlign: "center", borderBottom: "1px solid #eee", lineHeight: "0.1em", margin: "15px 0 25px" };