"use client";

import { useState, useMemo } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";

// --- ESQUEMA DE SEGURIDAD CON ZOD ---
const registerSchema = z.object({
  name: z.string().min(2, "El nombre es demasiado corto"),
  email: z.string().email("Introduce un correo válido"),
  password: z
    .string()
    .min(8, "Mínimo 8 caracteres")
    .regex(/[A-Z]/, "Falta una mayúscula")
    .regex(/[0-9]/, "Falta un número")
    .regex(/[^A-Za-z0-9]/, "Falta un símbolo (ej: @, ., #, !, etc.)"),
  confirmPassword: z.string(),
  aceptaPoliticas: z.literal(true, {
    errorMap: () => ({ message: "Debes aceptar los términos y condiciones" }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [aceptaPoliticas, setAceptaPoliticas] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === " ") e.stopPropagation();
  };

  const passwordValidation = useMemo(() => {
    return {
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[^A-Za-z0-9]/.test(password),
      match: password === confirmPassword && password !== ""
    };
  }, [password, confirmPassword]);

  const isPasswordSecure = Object.values(passwordValidation).every(Boolean);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const result = registerSchema.safeParse({ name, email, password, confirmPassword, aceptaPoliticas });
    
    if (!result.success) {
      const fieldErrors = Object.values(result.error.flatten().fieldErrors);
      const firstError = fieldErrors.length > 0 && fieldErrors[0] ? fieldErrors[0][0] : "Datos inválidos";
      setError(firstError);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, aceptaPoliticas }),
      });

      if (res.ok) {
        await signIn("credentials", { email, password, callbackUrl: "/perfil" });
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
          Regístrate en Gatocan. La contraseña debe ser segura.
        </p>

        {error && (
          <div style={errorBox}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
          <div style={inputGroup}>
            <label style={labelStyle}>Nombre completo</label>
            <input 
              style={inputStyle} 
              onKeyDown={handleKeyDown}
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
              onKeyDown={handleKeyDown}
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="tu@email.com" 
              type="email" 
              required 
            />
          </div>
          
          <div style={inputGroup}>
            <label style={labelStyle}>Contraseña</label>
            <input 
              style={{...inputStyle, borderColor: password && !isPasswordSecure ? "#ff4757" : "#ddd"}} 
              onChange={(e) => setPassword(e.target.value)} 
              onKeyDown={handleKeyDown}
              type="password" 
              placeholder="••••••••" 
              required 
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px", marginTop: "5px" }}>
              <p style={{ fontSize: "0.7rem", margin: 0, color: passwordValidation.hasMinLength ? "#27ae60" : "#999" }}>● Mín. 8 carac.</p>
              <p style={{ fontSize: "0.7rem", margin: 0, color: passwordValidation.hasUpperCase ? "#27ae60" : "#999" }}>● Mayúscula</p>
              <p style={{ fontSize: "0.7rem", margin: 0, color: passwordValidation.hasNumber ? "#27ae60" : "#999" }}>● Un número</p>
              <p style={{ fontSize: "0.7rem", margin: 0, color: passwordValidation.hasSpecial ? "#27ae60" : "#999" }}>● Símbolo (@, ., #...)</p>
            </div>
          </div>

          <div style={inputGroup}>
            <label style={labelStyle}>Confirmar Contraseña</label>
            <input 
              style={{...inputStyle, borderColor: confirmPassword && !passwordValidation.match ? "#ff4757" : "#ddd"}} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              onKeyDown={handleKeyDown}
              type="password" 
              placeholder="Repite la contraseña" 
              required 
            />
          </div>

          {/* CHECKBOX DE POLÍTICAS */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginTop: "0.5rem" }}>
            <input 
              type="checkbox" 
              id="politicas" 
              checked={aceptaPoliticas}
              onChange={(e) => setAceptaPoliticas(e.target.checked)}
              style={{ marginTop: "4px", cursor: "pointer" }}
            />
            <label htmlFor="politicas" style={{ fontSize: "0.8rem", color: "#555", cursor: "pointer", lineHeight: "1.2" }}>
              Acepto los <Link href="/terminos" style={{ color: "#ff4757", fontWeight: "bold" }}>Términos de Uso</Link> y la <Link href="/privacidad" style={{ color: "#ff4757", fontWeight: "bold" }}>Política de Privacidad</Link>.
            </label>
          </div>

          <button 
            type="submit" 
            disabled={loading || !isPasswordSecure || !aceptaPoliticas}
            style={{...btnPrimary, opacity: (loading || !isPasswordSecure || !aceptaPoliticas) ? 0.6 : 1, marginTop: "0.5rem"}}
          >
            {loading ? "Procesando..." : "Finalizar Registro"}
          </button>
          
          <div style={separator}>
            <span style={{ background: "#fff", padding: "0 10px", color: "#999", fontSize: "0.8rem" }}>o regístrate con</span>
          </div>

          <button type="button" onClick={() => signIn('google', { callbackUrl: '/perfil' })} style={btnGoogle}>
            <img src="https://authjs.dev/img/providers/google.svg" width="20" height="20" alt="G" />
            Google
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.9rem", color: "#444" }}>
          ¿Ya tienes cuenta? <Link href="/login" style={{ color: "#ff4757", fontWeight: "bold", textDecoration: "none" }}>Inicia sesión</Link>
        </p>
      </div>
    </main>
  );
}

const containerStyle: React.CSSProperties = { minHeight: "100vh", display: "grid", placeItems: "center", padding: "1rem", backgroundImage: "url('/img/foto-05.jpg')", backgroundSize: "cover", backgroundPosition: "center", fontFamily: "sans-serif" };
const cardStyle: React.CSSProperties = { background: "rgba(255, 255, 255, 0.98)", padding: "2rem 2.5rem", borderRadius: "16px", width: "100%", maxWidth: "420px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)", backdropFilter: "blur(5px)" };
const inputGroup: React.CSSProperties = { display: "grid", gap: "0.3rem" };
const labelStyle: React.CSSProperties = { fontSize: "0.85rem", fontWeight: "bold", color: "#444" };
const inputStyle: React.CSSProperties = { padding: "0.75rem", borderRadius: "8px", border: "1px solid #ddd", fontSize: "1rem", outline: "none" };
const btnPrimary: React.CSSProperties = { padding: "0.8rem", background: "#2ecc71", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "1rem" };
const btnGoogle: React.CSSProperties = { padding: "0.75rem", background: "white", border: "1px solid #ddd", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", fontWeight: "500", color: "#555" };
const separator: React.CSSProperties = { textAlign: "center", borderBottom: "1px solid #eee", lineHeight: "0.1em", margin: "15px 0 25px" };
const errorBox: React.CSSProperties = { backgroundColor: "#ff4757", color: "white", padding: "0.8rem", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.85rem", textAlign: "center" };
