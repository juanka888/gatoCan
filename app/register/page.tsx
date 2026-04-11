"use client";

import { useState, useMemo } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "El nombre es muy corto"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres")
    .regex(/[A-Z]/, "Falta una mayúscula")
    .regex(/[0-9]/, "Falta un número")
    .regex(/[^A-Za-z0-9]/, "Falta un símbolo"),
  confirmPassword: z.string(),
  aceptaPoliticas: z.literal(true, {
    errorMap: () => ({ message: "Acepta los términos para continuar" }),
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
    match: formData.password === formData.confirmPassword && formData.password !== ""
  }), [formData.password, formData.confirmPassword]);

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
        setError(data.message || "Error al crear la cuenta");
      }
    } catch {
      setError("Error de red");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={styles.container}>
      <div style={styles.card}>
        <Link href="/" style={styles.back}>← Volver al inicio</Link>
        <h1 style={styles.title}>Crear cuenta</h1>
        <p style={styles.sub}>Regístrate en Gatocan para ayudar a los michis.</p>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.group}>
            <label style={styles.label}>Nombre completo</label>
            <input style={styles.input} placeholder="Tu nombre" onChange={e => setFormData({...formData, name: e.target.value})} required />
          </div>

          <div style={styles.group}>
            <label style={styles.label}>Email</label>
            <input style={styles.input} type="email" placeholder="tu@email.com" onChange={e => setFormData({...formData, email: e.target.value})} required />
          </div>

          <div style={styles.group}>
            <label style={styles.label}>Contraseña</label>
            <input style={styles.input} type="password" placeholder="••••••••" onChange={e => setFormData({...formData, password: e.target.value})} required />
            <div style={styles.grid}>
              <span style={{ color: checks.hasMin ? "#27ae60" : "#999" }}>● 8+ carac.</span>
              <span style={{ color: checks.hasUpper ? "#27ae60" : "#999" }}>● Mayúscula</span>
              <span style={{ color: checks.hasNum ? "#27ae60" : "#999" }}>● Número</span>
              <span style={{ color: checks.hasSpec ? "#27ae60" : "#999" }}>● Símbolo</span>
            </div>
          </div>

          <div style={styles.group}>
            <label style={styles.label}>Confirmar Contraseña</label>
            <input style={styles.input} type="password" placeholder="••••••••" onChange={e => setFormData({...formData, confirmPassword: e.target.value})} required />
          </div>

          <div style={styles.checkRow}>
            <input type="checkbox" id="pol" checked={formData.aceptaPoliticas} onChange={e => setFormData({...formData, aceptaPoliticas: e.target.checked})} />
            <label htmlFor="pol" style={styles.checkText}>
              Acepto los <Link href="/terminos" style={styles.link}>Términos</Link> y la <Link href="/privacidad" style={styles.link}>Privacidad</Link>.
            </label>
          </div>

          <button type="submit" disabled={loading || !formData.aceptaPoliticas} style={{...styles.btn, opacity: (loading || !formData.aceptaPoliticas) ? 0.7 : 1}}>
            {loading ? "Creando michi-cuenta..." : "Finalizar Registro"}
          </button>

          <div style={styles.or}>o continúa con</div>

          <button type="button" onClick={() => signIn('google', { callbackUrl: '/perfil' })} style={styles.btnGoogle}>
            <img src="https://authjs.dev/img/providers/google.svg" width="18" /> Google
          </button>
        </form>
      </div>
    </main>
  );
}

const styles = {
  container: { minHeight: "100vh", display: "grid", placeItems: "center", backgroundImage: "url('/img/foto-05.jpg')", backgroundSize: "cover", fontFamily: "sans-serif" },
  card: { background: "rgba(255,255,255,0.98)", padding: "2rem", borderRadius: "20px", width: "95%", maxWidth: "400px", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" },
  back: { fontSize: "0.8rem", color: "#666", textDecoration: "none" },
  title: { fontSize: "1.8rem", margin: "1rem 0 0.3rem", color: "#333" },
  sub: { color: "#666", fontSize: "0.85rem", marginBottom: "1.5rem" },
  form: { display: "flex", flexDirection: "column" as const, gap: "0.8rem" },
  group: { display: "flex", flexDirection: "column" as const, gap: "0.3rem" },
  label: { fontSize: "0.8rem", fontWeight: "bold" as const, color: "#444" },
  input: { padding: "0.75rem", borderRadius: "10px", border: "1px solid #eee", background: "#f9f9f9", fontSize: "1rem" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px", fontSize: "0.65rem", marginTop: "4px" },
  checkRow: { display: "flex", gap: "10px", alignItems: "center", marginTop: "0.5rem" },
  checkText: { fontSize: "0.75rem", color: "#555" },
  link: { color: "#ff4757", textDecoration: "none", fontWeight: "bold" as const },
  btn: { padding: "0.9rem", background: "#2ecc71", color: "white", border: "none", borderRadius: "12px", fontWeight: "bold" as const, cursor: "pointer", fontSize: "1rem" },
  or: { textAlign: "center" as const, fontSize: "0.75rem", color: "#999", margin: "0.5rem 0" },
  btnGoogle: { padding: "0.75rem", background: "white", border: "1px solid #ddd", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", cursor: "pointer", color: "#555" },
  errorBox: { background: "#ff4757", color: "white", padding: "0.8rem", borderRadius: "10px", textAlign: "center" as const, marginBottom: "1rem", fontSize: "0.8rem" }
};
