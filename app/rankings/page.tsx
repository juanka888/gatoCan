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
    <main className="text-white" style={{ maxWidth: 880, margin: "0 auto", padding: "1rem", display: "grid", gap: 14 }}>
      <h1 className="text-white">Rankings solidarios</h1>

      <section className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white" style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
        <h2 className="text-white">Top donaciones (Zarpa Karma)</h2>
        {donationsLoading && <p className="text-white">Cargando ranking de donaciones...</p>}
        {donationsError && <p style={{ color: "#dc2626" }}>No se pudo cargar el ranking de donaciones.</p>}
        {!donationsLoading && !donationsError && (
          <ol className="text-white">
            {donations.map((row) => (
              <li className="text-white" key={row.userId}>
                {(row.nombreCompleto || row.email || "Usuario")} — {Number(row.karmaPoints || 0)} puntos · {Number(row.totalDonaciones || 0)} €
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white" style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
        <h2 className="text-white">Top Gatito Runner</h2>
        {runnerLoading && <p className="text-white">Cargando ranking de runner...</p>}
        {runnerError && <p style={{ color: "#dc2626" }}>No se pudo cargar el ranking de runner.</p>}
        {!runnerLoading && !runnerError && (
          <ol className="text-white">
            {runner.map((row) => (
              <li className="text-white" key={row.userId}>
                {(row.nombreCompleto || row.email || "Usuario")} — {Number(row.runnerBestScore || 0)} puntos
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}
