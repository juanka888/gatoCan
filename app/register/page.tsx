"use client";

import { useState, useMemo } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Nombre demasiado corto"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres")
    .regex(/[A-Z]/, "Falta mayúscula")
    .regex(/[0-9]/, "Falta número")
    .regex(/[^A-Za-z0-9]/, "Falta símbolo"),
  confirmPassword: z.string(),
  aceptaPoliticas: z.literal(true, {
    errorMap: () => ({ message: "Debes aceptar las políticas" }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export default function Register() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "", aceptaPoliticas: false });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const checks = useMemo(() => ({
    hasMin: formData.password.length >= 8,
    hasUpper: /[A-Z]/.test(formData.password),
    hasNum: /[0-9]/.test(formData.password),
    hasSpec: /[^A-Za-z0-9]/.test(formData.password),
  }), [formData.password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const result = registerSchema.safeParse(formData);
    if (!result.success) { setError(result.error.errors[0].message); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        await signIn("credentials", { email: formData.email, password: formData.password, callbackUrl: "/perfil" });
      } else {
        setError(data.message || "Error al crear cuenta");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={styles.container}>
      <div style={styles.card}>
        <Link href="/" style={styles.back}>← Volver al inicio</Link>
        <h1 style={styles.title}>Crear cuenta</h1>
        <p style={styles.sub}>Regístrate en Gatocan. La contraseña debe ser segura.</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Nombre completo</label>
          <input style={styles.input} placeholder="Tamara G" onChange={e => setFormData({...formData, name: e.target.value})} required />

          <label style={styles.label}>Email</label>
          <input style={styles.input} type="email" placeholder="tamara@gmail.com" onChange={e => setFormData({...formData, email: e.target.value})} required />

          <label style={styles.label}>Contraseña</label>
          <input style={styles.input} type="password" placeholder="••••••••" onChange={e => setFormData({...formData, password: e.target.value})} required />
          
          <div style={styles.grid}>
            <span style={{ color: checks.hasMin ? "#2ecc71" : "#999" }}>● Mín. 8 carac.</span>
            <span style={{ color: checks.hasUpper ? "#2ecc71" : "#999" }}>● Mayúscula</span>
            <span style={{ color: checks.hasNum ? "#2ecc71" : "#999" }}>● Un número</span>
            <span style={{ color: checks.hasSpec ? "#2ecc71" : "#999" }}>● Símbolo (@, ., #)</span>
          </div>

          <label style={styles.label}>Confirmar Contraseña</label>
          <input style={styles.input} type="password" placeholder="••••••••" onChange={e => setFormData({...formData, confirmPassword: e.target.value})} required />

          <div style={styles.checkRow}>
            <input type="checkbox" checked={formData.aceptaPoliticas} onChange={e => setFormData({...formData, aceptaPoliticas: e.target.checked})} />
            <span style={styles.checkText}>Acepto los <Link href="/terminos" style={styles.link}>Términos</Link> y la <Link href="/privacidad" style={styles.link}>Privacidad</Link>.</span>
          </div>

          <button type="submit" disabled={loading} style={styles.btnRegister}>
            {loading ? "Cargando..." : "Finalizar Registro"}
          </button>

          <div style={styles.or}>o regístrate con</div>

          <button type="button" onClick={() => signIn('google')} style={styles.btnGoogle}>
            <img src="https://authjs.dev/img/providers/google.svg" width="18" /> Google
          </button>
        </form>
      </div>
    </main>
  );
}

const styles = {
  container: { minHeight: "100vh", display: "grid", placeItems: "center", backgroundImage: "url('/img/foto-05.jpg')", backgroundSize: "cover" },
  card: { background: "white", padding: "2rem", borderRadius: "20px", width: "100%", maxWidth: "400px", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" },
  back: { fontSize: "0.8rem", color: "#666", textDecoration: "none" },
  title: { fontSize: "2rem", margin: "1rem 0 0.5rem" },
  sub: { color: "#666", fontSize: "0.9rem", marginBottom: "1.5rem" },
  form: { display: "flex", flexDirection: "column" as const, gap: "0.8rem" },
  label: { fontSize: "0.85rem", fontWeight: "bold" as const },
  input: { padding: "0.8rem", borderRadius: "10px", border: "1px solid #eee", background: "#fafafa" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px", fontSize: "0.7rem" },
  checkRow: { display: "flex", gap: "10px", alignItems: "center", marginTop: "0.5rem" },
  checkText: { fontSize: "0.75rem", color: "#555" },
  link: { color: "#ff4757", textDecoration: "none", fontWeight: "bold" as const },
  btnRegister: { padding: "1rem", background: "#2ecc71", color: "white", border: "none", borderRadius: "12px", fontWeight: "bold" as const, cursor: "pointer", marginTop: "0.5rem" },
  or: { textAlign: "center" as const, fontSize: "0.8rem", color: "#999", margin: "1rem 0" },
  btnGoogle: { padding: "0.8rem", background: "white", border: "1px solid #ddd", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", cursor: "pointer" },
  error: { background: "#ff4757", color: "white", padding: "0.8rem", borderRadius: "10px", textAlign: "center" as const, marginBottom: "1rem" }
};
                                                                                                         
