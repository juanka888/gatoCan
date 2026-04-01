"use client";

import { useSWRLite } from "@/lib/useSWRLite";

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

const fetcher = async <T,>(url: string): Promise<T> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Error cargando ${url}: ${response.status}`);
  }
  return response.json();
};

export default function RankingsPage() {
  const {
    data: donationsData,
    error: donationsError,
    isLoading: donationsLoading,
  } = useSWRLite<{ rows: DonationRow[] }>("/api/rankings/donations", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30_000,
  });

  const {
    data: runnerData,
    error: runnerError,
    isLoading: runnerLoading,
  } = useSWRLite<{ rows: RunnerRow[] }>("/api/rankings/runner", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30_000,
  });

  const donations = donationsData?.rows || [];
  const runner = runnerData?.rows || [];

  return (
    <main style={{ maxWidth: 880, margin: "0 auto", padding: "1rem", display: "grid", gap: 14 }}>
      <h1>Rankings solidarios</h1>

      <section style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
        <h2>Top donaciones (Zarpa Karma)</h2>
        {donationsLoading && <p>Cargando ranking de donaciones...</p>}
        {donationsError && <p style={{ color: "#dc2626" }}>No se pudo cargar el ranking de donaciones.</p>}
        {!donationsLoading && !donationsError && (
          <ol>
            {donations.map((row) => (
              <li key={row.userId}>
                {(row.nombreCompleto || row.email || "Usuario")} — {Number(row.karmaPoints || 0)} puntos · {Number(row.totalDonaciones || 0)} €
              </li>
            ))}
          </ol>
        )}
      </section>

      <section style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
        <h2>Top Gatito Runner</h2>
        {runnerLoading && <p>Cargando ranking de runner...</p>}
        {runnerError && <p style={{ color: "#dc2626" }}>No se pudo cargar el ranking de runner.</p>}
        {!runnerLoading && !runnerError && (
          <ol>
            {runner.map((row) => (
              <li key={row.userId}>
                {(row.nombreCompleto || row.email || "Usuario")} — {Number(row.runnerBestScore || 0)} puntos
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}
