"use client";

import React, { useState } from "react";
import { Copy } from "lucide-react";

export default function BotonesMetodosPago() {
  const [openManualMethod, setOpenManualMethod] = useState<"bizum" | "bank" | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const bizumNumber = "00000";
  const ibanNumber = "ES12 3456 7890 1234 5678 9012";

  const toggleManualMethod = (method: "bizum" | "bank") => {
    setOpenManualMethod((prev) => (prev === method ? null : method));
  };

  const copyToClipboard = async (value: string, field: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1800);
    } catch (error) {
      console.error("No se pudo copiar al portapapeles", error);
    }
  };

  return (
    <div style={{ marginTop: "14px", display: "grid", gap: "10px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        <button
          type="button"
          onClick={() => toggleManualMethod("bizum")}
          style={{
            border: "1px solid rgba(16, 185, 129, 0.4)",
            borderRadius: "16px",
            padding: "0.8rem 0.9rem",
            fontWeight: 700,
            color: "#065f46",
            background: "rgba(255,255,255,0.75)",
            backdropFilter: "blur(10px)",
            cursor: "pointer",
          }}
        >
          Donar con Bizum
        </button>
        <button
          type="button"
          onClick={() => toggleManualMethod("bank")}
          style={{
            border: "1px solid rgba(37, 99, 235, 0.35)",
            borderRadius: "16px",
            padding: "0.8rem 0.9rem",
            fontWeight: 700,
            color: "#1d4ed8",
            background: "rgba(255,255,255,0.75)",
            backdropFilter: "blur(10px)",
            cursor: "pointer",
          }}
        >
          Transferencia Bancaria
        </button>
      </div>

      <p
        style={{
          margin: 0,
          fontWeight: 700,
          color: "#166534",
          background: "rgba(240,253,244,0.8)",
          border: "1px solid rgba(34,197,94,0.25)",
          borderRadius: "16px",
          padding: "0.65rem 0.8rem",
          backdropFilter: "blur(10px)",
        }}
      >
        Donación 100% íntegra: Sin comisiones bancarias para la asociación
      </p>

      {openManualMethod === "bizum" && (
        <div
          style={{
            border: "1px solid rgba(16, 185, 129, 0.28)",
            borderRadius: "16px",
            padding: "0.9rem",
            background: "rgba(236, 253, 245, 0.72)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 6px 20px rgba(16,185,129,0.1)",
          }}
        >
          <p style={{ margin: "0 0 8px", fontWeight: 700, color: "#065f46" }}>Bizum</p>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <code style={{ fontSize: "1rem", fontWeight: 700, color: "#064e3b" }}>{bizumNumber}</code>
            <button
              type="button"
              onClick={() => copyToClipboard(bizumNumber, "bizum")}
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                border: "1px solid rgba(16, 185, 129, 0.4)",
                background: "white",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
              aria-label="Copiar número Bizum"
            >
              <Copy size={16} />
            </button>
            {copiedField === "bizum" && <span style={{ color: "#047857", fontWeight: 700 }}>¡Copiado!</span>}
          </div>
          <p style={{ margin: "10px 0 0", color: "#166534", fontWeight: 700 }}>
            IMPORTANTE: Pon tu nombre de usuario o email en el concepto para poder reclamar tus puntos Karma
          </p>
        </div>
      )}

      {openManualMethod === "bank" && (
        <div
          style={{
            border: "1px solid rgba(59, 130, 246, 0.25)",
            borderRadius: "16px",
            padding: "0.9rem",
            background: "rgba(239, 246, 255, 0.76)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 6px 20px rgba(59,130,246,0.1)",
          }}
        >
          <p style={{ margin: "0 0 8px", fontWeight: 700, color: "#1e3a8a" }}>Cuenta bancaria</p>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <code style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1e40af" }}>{ibanNumber}</code>
            <button
              type="button"
              onClick={() => copyToClipboard(ibanNumber, "iban")}
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                border: "1px solid rgba(59, 130, 246, 0.4)",
                background: "white",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
              aria-label="Copiar IBAN"
            >
              <Copy size={16} />
            </button>
            {copiedField === "iban" && <span style={{ color: "#1d4ed8", fontWeight: 700 }}>¡Copiado!</span>}
          </div>
          <p style={{ margin: "10px 0 0", color: "#1e3a8a", fontWeight: 700 }}>
            IMPORTANTE: Pon tu nombre de usuario o email en el concepto para poder reclamar tus puntos Karma
          </p>
        </div>
      )}
    </div>
  );
}
