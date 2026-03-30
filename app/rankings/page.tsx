"use client";

import { useEffect, useState } from "react";

type DonationRow = {
  userId: string;
  nombreCompleto: string | null;
  email: string;
  karmaPoints: number;
  totalDonaciones: number;
};

type RunnerRow = {
  userId: string;
  nombreCompleto: string | null;
  email: string;
  runnerBestScore: number;
};

export default function RankingsPage() {
  const [donations, setDonations] = useState<DonationRow[]>([]);
  const [runner, setRunner] = useState<RunnerRow[]>([]);

  useEffect(() => {
    const load = async () => {
      const [donationResponse, runnerResponse] = await Promise.all([
        fetch("/api/rankings/donations", { cache: "no-store" }),
        fetch("/api/rankings/runner", { cache: "no-store" }),
      ]);

      if (donationResponse.ok) {
        const data = await donationResponse.json();
        setDonations(data.rows || []);
      }

      if (runnerResponse.ok) {
        const data = await runnerResponse.json();
        setRunner(data.rows || []);
      }
    };

    load();
  }, []);

  return (
    <main style={{ maxWidth: 880, margin: "0 auto", padding: "1rem", display: "grid", gap: 14 }}>
      <h1>Rankings solidarios</h1>

      <section style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
        <h2>Top donaciones (Zarpa Karma)</h2>
        <ol>
          {donations.map((row) => (
            <li key={row.userId}>
              {(row.nombreCompleto || row.email || "Usuario")} — {Number(row.karmaPoints || 0)} puntos · {Number(row.totalDonaciones || 0)} €
            </li>
          ))}
        </ol>
      </section>

      <section style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
        <h2>Top Gatito Runner</h2>
        <ol>
          {runner.map((row) => (
            <li key={row.userId}>
              {(row.nombreCompleto || row.email || "Usuario")} — {Number(row.runnerBestScore || 0)} puntos
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
