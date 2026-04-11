"use client";

import { useState, useMemo } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Nombre muy corto"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres")
    .regex(/[A-Z]/, "Usa una mayúscula")
    .regex(/[0-9]/, "Usa un número")
    .regex(/[^A-Za-z0-9]/, "Usa un símbolo"),
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
    length: formData.password.length >= 8,
    upper: /[A-Z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[^A-Za-z0-9]/.test(formData.password),
    match: formData.password === formData.confirmPassword && formData.password !== ""
  }), [formData.password, formData.confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const val = registerSchema.safeParse(formData);
    if (!val.success) { setError(val.error.errors[0].message); return; }

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
        setError(data.message || "Error al registrar");
      }
    } catch {
      setError("Fallo de red");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={s.cont}>
      <div style={s.card}>
        <h2 style={{ marginBottom: "1rem" }}>Crear Cuenta Gatocan</h2>
        {error && <div style={s.err}>{error}</div>}
        <form onSubmit={handleSubmit} style={s.form}>
          <input style={s.input} placeholder="Nombre completo" onChange={e => setFormData({...formData, name: e.target.value})} required />
          <input style={s.input} type="email" placeholder="Email" onChange={e => setFormData({...formData, email: e.target.value})} required />
          <input style={s.input} type="password" placeholder="Contraseña" onChange={e => setFormData({...formData, password: e.target.value})} required />
          <div style={s.checkGrid}>
            <span style={{ color: checks.length ? "green" : "#999" }}>● 8+ carac.</span>
            <span style={{ color: checks.upper ? "green" : "#999" }}>● Mayúscula</span>
            <span style={{ color: checks.number ? "green" : "#999" }}>● Número</span>
            <span style={{ color: checks.special ? "green" : "#999" }}>● Símbolo</span>
          </div>
          <input style={s.input} type="password" placeholder="Confirmar contraseña" onChange={e => setFormData({...formData, confirmPassword: e.target.value})} required />
          <div style={s.checkCont}>
            <input type="checkbox" id="pol" checked={formData.aceptaPoliticas} onChange={e => setFormData({...formData, aceptaPoliticas: e.target.checked})} />
            <label htmlFor="pol" style={{ fontSize: "0.8rem" }}>Acepto términos y privacidad</label>
          </div>
          <button type="submit" disabled={loading || !formData.aceptaPoliticas} style={s.btn}>
            {loading ? "Cargando..." : "Registrarme"}
          </button>
        </form>
      </div>
    </main>
  );
}

const s = {
  cont: { minHeight: "100vh", display: "grid", placeItems: "center", backgroundImage: "url('/img/foto-05.jpg')", backgroundSize: "cover" },
  card: { background: "rgba(255,255,255,0.96)", padding: "2rem", borderRadius: "16px", width: "90%", maxWidth: "400px" },
  form: { display: "grid", gap: "1rem" },
  input: { padding: "0.8rem", borderRadius: "8px", border: "1px solid #ddd", width: "100%" },
  btn: { padding: "0.9rem", background: "#2ecc71", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" },
  err: { background: "#ff4757", color: "white", padding: "0.7rem", borderRadius: "8px", marginBottom: "1rem", textAlign: "center" as const },
  checkGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", fontSize: "0.65rem", gap: "4px" },
  checkCont: { display: "flex", gap: "8px", alignItems: "center" }
};
