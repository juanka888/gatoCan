"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type LeaderboardRow = {
  id: string;
  username: string | null;
  full_name: string | null;
  runner_best_score: number | null;
};

export default function Leaderboard() {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadLeaderboard = async () => {
      setLoading(true);
      setError("");

      const { data, error: queryError } = await supabase
        .from("profiles")
        .select("id, username, full_name, runner_best_score")
        .order("runner_best_score", { ascending: false })
        .limit(10);

      if (!isMounted) return;

      if (queryError) {
        setRows([]);
        setError("No se pudo cargar el ranking.");
        setLoading(false);
        return;
      }

      setRows((data ?? []) as LeaderboardRow[]);
      setLoading(false);
    };

    loadLeaderboard();

    const channel = supabase
      .channel("runner-leaderboard")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => {
          loadLeaderboard();
        },
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <section
      style={{
        width: "100%",
        maxWidth: 960,
        border: "2px solid #8f5a2d",
        borderRadius: 12,
        background: "#fffaf0",
        padding: 16,
        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: 12 }}>🏆 Top 10 Runner</h2>

      {loading ? (
        <p style={{ margin: 0, display: "flex", gap: 8, alignItems: "center" }}>
          <span
            aria-hidden="true"
            style={{
              width: 16,
              height: 16,
              border: "2px solid #d8b282",
              borderTopColor: "#8f5a2d",
              borderRadius: "50%",
              display: "inline-block",
              animation: "spin 0.9s linear infinite",
            }}
          />
          Cargando ranking...
        </p>
      ) : error ? (
        <p style={{ margin: 0, color: "#9d1c1c" }}>{error}</p>
      ) : rows.length === 0 ? (
        <p style={{ margin: 0 }}>Todavía no hay puntuaciones registradas.</p>
      ) : (
        <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8 }}>
          {rows.map((row) => {
            const name = row.username || row.full_name || "Jugador anónimo";
            return (
              <li
                key={row.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  background: "#fff",
                  border: "1px solid #f1ddbe",
                  borderRadius: 8,
                  padding: "8px 10px",
                }}
              >
                <strong>{name}</strong>
                <span>{Number(row.runner_best_score || 0)} pts</span>
              </li>
            );
          })}
        </ol>
      )}

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </section>
  );
}
