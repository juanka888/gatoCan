"use client";

import { useEffect, useState } from "react";

type LeaderboardRow = {
  userId: string;
  nombreCompleto: string | null;
  email: string;
  runnerBestScore: number;
};

type LeaderboardProps = {
  refreshKey?: number;
};

export default function Leaderboard({ refreshKey = 0 }: LeaderboardProps) {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadLeaderboard = async () => {
      setLoading(true);
      setError("");

      const response = await fetch("/api/rankings/runner", { cache: "no-store" });
      if (!response.ok) {
        if (!isMounted) return;
        setRows([]);
        setError("No se pudo cargar el ranking.");
        setLoading(false);
        return;
      }

      const data = await response.json();
      if (!isMounted) return;

      setRows(data.rows || []);
      setLoading(false);
    };

    loadLeaderboard();

    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  return (
    <section style={{ width: "100%", maxWidth: 960, border: "2px solid #8f5a2d", borderRadius: 12, background: "#fffaf0", padding: 16, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}>
      <h2 style={{ marginTop: 0, marginBottom: 12 }}>🏆 Top 10 Runner</h2>

      {loading ? (
        <p style={{ margin: 0 }}>Cargando ranking...</p>
      ) : error ? (
        <p style={{ margin: 0, color: "#9d1c1c" }}>{error}</p>
      ) : rows.length === 0 ? (
        <p style={{ margin: 0 }}>Todavía no hay puntuaciones registradas.</p>
      ) : (
        <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8 }}>
          {rows.map((row) => {
            const name = row.nombreCompleto || row.email || "Jugador anónimo";
            return (
              <li key={row.userId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, background: "#fff", border: "1px solid #f1ddbe", borderRadius: 8, padding: "8px 10px" }}>
                <strong>{name}</strong>
                <span>{Number(row.runnerBestScore || 0)} pts</span>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
