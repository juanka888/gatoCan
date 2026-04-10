"use client";

import { useState, type CSSProperties } from "react";

type PendingDonation = {
  id: string;
  concepto: string;
  cantidad: string | number;
  fecha: string;
  user: { email: string | null };
};

export default function AdminPanelClient({ initialPending }: { initialPending: PendingDonation[] }) {
  const [pending, setPending] = useState(initialPending);
  const [workingId, setWorkingId] = useState<string | null>(null);

  const processDonation = async (id: string, action: "APPROVE" | "REJECT") => {
    setWorkingId(id);
    try {
      const res = await fetch(`/api/admin/manual-donations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "No se pudo procesar la solicitud");
      }

      setPending((current) => current.filter((row) => row.id !== id));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error inesperado");
    } finally {
      setWorkingId(null);
    }
  };

  return (
    <section style={glassCardStyle}>
      <h2 style={{ marginTop: 0 }}>Gestión de Karma · Donaciones manuales pendientes</h2>
      {pending.length === 0 ? (
        <p>No hay donaciones manuales pendientes.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th>Email donante</th>
                <th>Concepto</th>
                <th>Cantidad</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((row) => (
                <tr key={row.id}>
                  <td>{row.user?.email || "Sin email"}</td>
                  <td>{row.concepto}</td>
                  <td>{Number(row.cantidad).toFixed(2)} €</td>
                  <td>{new Date(row.fecha).toLocaleString("es-ES")}</td>
                  <td style={{ display: "flex", gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => processDonation(row.id, "APPROVE")}
                      disabled={workingId === row.id}
                      style={approveBtn}
                    >
                      Aprobar
                    </button>
                    <button
                      type="button"
                      onClick={() => processDonation(row.id, "REJECT")}
                      disabled={workingId === row.id}
                      style={rejectBtn}
                    >
                      Rechazar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

const glassCardStyle: CSSProperties = {
  background: "rgba(255,255,255,0.18)",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.24)",
  borderRadius: 16,
  padding: "1rem",
  color: "white",
};

const tableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: 760,
};

const approveBtn: CSSProperties = {
  background: "#16a34a",
  color: "white",
  border: "none",
  borderRadius: 8,
  padding: "0.45rem 0.7rem",
  cursor: "pointer",
};

const rejectBtn: CSSProperties = {
  background: "#dc2626",
  color: "white",
  border: "none",
  borderRadius: 8,
  padding: "0.45rem 0.7rem",
  cursor: "pointer",
};
