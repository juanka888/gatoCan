"use client";

import { useState } from "react";
import Link from "next/link";
import { z } from "zod";

// Definimos el esquema de seguridad con Zod
const contactSchema = z.object({
  nombre: z.string().min(2, "El nombre es demasiado corto").max(50, "Nombre demasiado largo"),
  email: z.string().email("Email inválido"),
  mensaje: z.string().min(10, "El mensaje debe tener al menos 10 caracteres").max(1000, "Mensaje demasiado largo"),
  privacidad: z.literal(true, {
    errorMap: () => ({ message: "Debes aceptar la política de privacidad" }),
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

  // Función para evitar que el espacio active el giro de las cartas
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === " ") {
      e.stopPropagation();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    // 1. Validación de seguridad con Zod en el cliente
    const result = contactSchema.safeParse(contactForm);
    
    if (!result.success) {
      const errorMsg = result.error.errors[0].message;
      setStatus({ type: "error", message: errorMsg });
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data), // Enviamos los datos ya validados
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({
          type: "success",
          message: "¡Mensaje enviado! Lo recibiremos pronto.",
        });
        setContactForm({ nombre: "", email: "", mensaje: "", privacidad: false });
      } else {
        setStatus({ type: "error", message: data.error || "Error al enviar." });
      }
    } catch (error) {
      setStatus({ type: "error", message: "Error de conexión con el servidor." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-card-content" style={{ padding: "20px" }}>
      <h3 style={{ marginBottom: "20px" }}>Contacta con Gatocan Natura Rural</h3>
      
      <form className="contact-form" onSubmit={handleSubmit}>
        <div style={inputGroup}>
          <label htmlFor="nombre" style={labelStyle}>Nombre completo:</label>
          <input
            type="text"
            id="nombre"
            placeholder="Tu nombre..."
            style={inputStyle}
            value={contactForm.nombre}
            onKeyDown={handleKeyDown} // Arregla el problema del espacio
            onChange={(e) => setContactForm({ ...contactForm, nombre: e.target.value })}
          />
        </div>

        <div style={inputGroup}>
          <label htmlFor="email" style={labelStyle}>Correo electrónico:</label>
          <input
            type="email"
            id="email"
            placeholder="tu@email.com"
            style={inputStyle}
            value={contactForm.email}
            onKeyDown={handleKeyDown} // Arregla el problema del espacio
            onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
          />
        </div>

        <div style={inputGroup}>
          <label htmlFor="mensaje" style={labelStyle}>Tu mensaje:</label>
          <textarea
            id="mensaje"
            rows={5}
            placeholder="Cuéntanos..."
            style={{ ...inputStyle, resize: "vertical" }}
            value={contactForm.mensaje}
            onKeyDown={handleKeyDown} // Arregla el problema del espacio
            onChange={(e) => setContactForm({ ...contactForm, mensaje: e.target.value })}
          />
        </div>

        <div className="legal" style={{ marginBottom: "20px", textAlign: "left" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
            <input
              type="checkbox"
              id="privacidad"
              checked={contactForm.privacidad}
              onChange={(e) => setContactForm({ ...contactForm, privacidad: e.target.checked })}
            />
            <span style={{ fontSize: "0.85rem" }}>
              Acepto las condiciones y la <Link href="/politicas" style={{ color: "#ff4757" }}>política de privacidad</Link>.
            </span>
          </label>
        </div>

        <button 
          type="submit" 
          className="btn btn-primary btn-enviar" 
          disabled={isSubmitting}
          style={buttonStyle}
        >
          {isSubmitting ? "🚀 Enviando..." : "Enviar mensaje"}
        </button>

        {status && (
          <div style={{ 
            marginTop: "20px", 
            padding: "10px", 
            borderRadius: "6px",
            backgroundColor: status.type === "success" ? "#dcfce7" : "#fee2e2",
            color: status.type === "success" ? "#166534" : "#b91c1c",
            fontWeight: "bold"
          }}>
            {status.message}
          </div>
        )}
      </form>
    </div>
  );
}

// Estilos rápidos para el formulario
const inputGroup: React.CSSProperties = { marginBottom: "15px", textAlign: "left" };
const labelStyle: React.CSSProperties = { display: "block", marginBottom: "5px", fontWeight: "600", fontSize: "0.9rem" };
const inputStyle: React.CSSProperties = { width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd" };
const buttonStyle: React.CSSProperties = { width: "100%", padding: "12px", backgroundColor: "#ff4757", color: "white", border: "none", borderRadius: "25px", fontWeight: "bold", cursor: "pointer" };