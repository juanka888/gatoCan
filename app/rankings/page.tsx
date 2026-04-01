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
    <main className="grid gap-3.5 text-white" style={{ maxWidth: 880, margin: "0 auto", padding: "1rem" }}>
      <h1 className="text-white">Rankings solidarios</h1>

      <section className="rounded-xl border border-white/20 bg-white/10 p-3 text-white backdrop-blur-md">
        <h2 className="text-white">Top donaciones (Zarpa Karma)</h2>
        {donationsLoading && <p className="text-white">Cargando ranking de donaciones...</p>}
        {donationsError && <p className="text-white">No se pudo cargar el ranking de donaciones.</p>}
        {!donationsLoading && !donationsError && (
          <ol className="grid gap-2">
            {donations.map((row) => (
              <li key={row.userId} className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white">
                <span className="text-white">{row.nombreCompleto || row.email || "Usuario"}</span> —{" "}
                <span className="text-white">{Number(row.karmaPoints || 0)} puntos</span> ·{" "}
                <span className="text-white">{Number(row.totalDonaciones || 0)} €</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="rounded-xl border border-white/20 bg-white/10 p-3 text-white backdrop-blur-md">
        <h2 className="text-white">Top Gatito Runner</h2>
        {runnerLoading && <p className="text-white">Cargando ranking de runner...</p>}
        {runnerError && <p className="text-white">No se pudo cargar el ranking de runner.</p>}
        {!runnerLoading && !runnerError && (
          <ol className="grid gap-2">
            {runner.map((row) => (
              <li key={row.userId} className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white">
                <span className="text-white">{row.nombreCompleto || row.email || "Usuario"}</span> —{" "}
                <span className="text-white">{Number(row.runnerBestScore || 0)} puntos</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}
