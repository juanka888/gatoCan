"use client";

import { useState } from "react";
import Link from "next/link";
import { z } from "zod";

// 1. Esquema con validación flexible para evitar conflictos de tipos
const contactSchema = z.object({
  nombre: z.string().min(2, "El nombre es demasiado corto").max(50, "Nombre demasiado largo"),
  email: z.string().email("Email inválido"),
  mensaje: z.string().min(10, "El mensaje debe tener al menos 10 caracteres").max(1000, "Mensaje demasiado largo"),
  // Usamos boolean() y luego un refinamiento para que TS no se queje del valor inicial 'false'
  privacidad: z.boolean().refine((val) => val === true, {
    message: "Debes aceptar la política de privacidad",
  }),
});

export default function ContactoForm() {
  const [contactForm, setContactForm] = useState({
    nombre: "",
    email: "",
    mensaje: "",
    privacidad: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === " ") e.stopPropagation();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    // 2. Validación amigable con TypeScript
    const result = contactSchema.safeParse(contactForm);
    
    if (!result.success) {
      // Técnica flatten() para evitar el error de "errors[0]" que tenías antes
      const formattedErrors = result.error.flatten();
      const fieldErrors = Object.values(formattedErrors.fieldErrors);
      const firstError = fieldErrors.length > 0 && fieldErrors[0] ? fieldErrors[0][0] : "Datos inválidos";

      setStatus({ type: "error", message: firstError });
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data), 
      });

      if (res.ok) {
        setStatus({ type: "success", message: "¡Mensaje enviado correctamente!" });
        setContactForm({ nombre: "", email: "", mensaje: "", privacidad: false });
      } else {
        const data = await res.json();
        setStatus({ type: "error", message: data.error || "Error al enviar." });
      }
    } catch (error) {
      setStatus({ type: "error", message: "Error de conexión." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-card-content" style={{ padding: "20px" }}>
      <h3 style={{ marginBottom: "20px" }}>Contacta con Gatocan Natura Rural</h3>
      
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
        <div style={inputGroup}>
          <label style={labelStyle}>Nombre completo</label>
          <input
            style={inputStyle}
            type="text"
            placeholder="Tu nombre..."
            value={contactForm.nombre}
            onKeyDown={handleKeyDown}
            onChange={(e) => setContactForm({ ...contactForm, nombre: e.target.value })}
            required
          />
        </div>

        <div style={inputGroup}>
          <label style={labelStyle}>Email</label>
          <input
            style={inputStyle}
            type="email"
            placeholder="tu@email.com"
            value={contactForm.email}
            onKeyDown={handleKeyDown}
            onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
            required
          />
        </div>

        <div style={inputGroup}>
          <label style={labelStyle}>Mensaje</label>
          <textarea
            style={{ ...inputStyle, resize: "vertical" }}
            rows={4}
            placeholder="¿En qué podemos ayudarte?"
            value={contactForm.mensaje}
            onKeyDown={handleKeyDown}
            onChange={(e) => setContactForm({ ...contactForm, mensaje: e.target.value })}
            required
          />
        </div>

        <div style={{ textAlign: "left" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={contactForm.privacidad}
              onChange={(e) => setContactForm({ ...contactForm, privacidad: e.target.checked })}
            />
            <span style={{ fontSize: "0.85rem" }}>
              Acepto la <Link href="/politicas" style={{ color: "#ff4757" }}>política de privacidad</Link>
            </span>
          </label>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          style={{...buttonStyle, opacity: isSubmitting ? 0.7 : 1}}
        >
          {isSubmitting ? "Enviando..." : "Enviar mensaje"}
        </button>

        {status && (
          <div style={{ 
            marginTop: "10px", 
            padding: "10px", 
            borderRadius: "8px",
            textAlign: "center",
            backgroundColor: status.type === "success" ? "#dcfce7" : "#fee2e2",
            color: status.type === "success" ? "#166534" : "#b91c1c",
            fontSize: "0.85rem",
            fontWeight: "bold"
          }}>
            {status.message}
          </div>
        )}
      </form>
    </div>
  );
}

// Estilos
const inputGroup: React.CSSProperties = { display: "grid", gap: "0.3rem", textAlign: "left" };
const labelStyle: React.CSSProperties = { fontSize: "0.85rem", fontWeight: "bold", color: "#444" };
const inputStyle: React.CSSProperties = { padding: "0.75rem", borderRadius: "8px", border: "1px solid #ddd", width: "100%" };
const buttonStyle: React.CSSProperties = { padding: "0.8rem", background: "#ff4757", color: "white", border: "none", borderRadius: "25px", fontWeight: "bold", cursor: "pointer" };