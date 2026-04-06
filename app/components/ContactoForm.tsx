"use client";

import { useState } from "react";
import Link from "next/link";

export default function ContactoForm() {
  const [contactForm, setContactForm] = useState({
    nombre: "",
    email: "",
    mensaje: "",
    privacidad: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    try {
      const res = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({
          type: "success",
          message: "¡Mensaje enviado! Lo recibiremos en gatocannaturarural@gmail.com pronto.",
        });
        setContactForm({ nombre: "", email: "", mensaje: "", privacidad: false });
      } else {
        setStatus({
          type: "error",
          message: data.error || "Hubo un problema al procesar el envío.",
        });
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: "Error de conexión. Revisa tu internet e inténtalo de nuevo.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-card-content">
      <h3 style={{ marginBottom: "20px" }}>Contacta con Gatocan Natura Rural</h3>
      
      <form className="contact-form" onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px", textAlign: "left" }}>
          <label htmlFor="nombre" style={{ fontWeight: "bold", display: "block", marginBottom: "5px" }}>
            Nombre completo:
          </label>
          <input
            type="text"
            id="nombre"
            required
            placeholder="Tu nombre..."
            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
            value={contactForm.nombre}
            onChange={(e) => setContactForm({ ...contactForm, nombre: e.target.value })}
          />
        </div>

        <div style={{ marginBottom: "15px", textAlign: "left" }}>
          <label htmlFor="email" style={{ fontWeight: "bold", display: "block", marginBottom: "5px" }}>
            Correo electrónico:
          </label>
          <input
            type="email"
            id="email"
            required
            placeholder="tu@email.com"
            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
            value={contactForm.email}
            onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
          />
        </div>

        <div style={{ marginBottom: "15px", textAlign: "left" }}>
          <label htmlFor="mensaje" style={{ fontWeight: "bold", display: "block", marginBottom: "5px" }}>
            Tu mensaje:
          </label>
          <textarea
            id="mensaje"
            rows={5}
            required
            placeholder="Cuéntanos cómo podemos ayudarte..."
            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", resize: "vertical" }}
            value={contactForm.mensaje}
            onChange={(e) => setContactForm({ ...contactForm, mensaje: e.target.value })}
          />
        </div>

        <div className="legal" style={{ textAlign: "left", marginBottom: "20px" }}>
          <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
            <input
              type="checkbox"
              id="privacidad"
              checked={contactForm.privacidad}
              onChange={(e) => setContactForm({ ...contactForm, privacidad: e.target.checked })}
              required
            />
            <span style={{ fontSize: "0.9rem" }}>
              Acepto las condiciones y la <Link href="/politicas" style={{ color: "#ff4757" }}>política de privacidad</Link>.
            </span>
          </label>
        </div>

        <button 
          type="submit" 
          className="btn btn-primary btn-enviar" 
          disabled={isSubmitting}
          style={{ width: "100%", padding: "12px", fontWeight: "bold" }}
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
            fontWeight: 600,
            textAlign: "center"
          }}>
            {status.message}
          </div>
        )}
      </form>
    </div>
  );
}