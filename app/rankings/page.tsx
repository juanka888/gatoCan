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
      <h1 className="text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] text-3xl font-bold">
        Rankings solidarios
      </h1>

      <section
        className="bg-black/60 backdrop-blur-md border border-white/20 rounded-xl p-6 text-white shadow-2xl"
        style={{ borderRadius: 10 }}
      >
        <h2 className="text-white border-b border-white/10 pb-2 mb-4 font-semibold">
          Top donaciones (Zarpa Karma)
        </h2>
        {donationsLoading && <p className="text-slate-300">Cargando ranking de donaciones...</p>}
        {donationsError && <p className="text-red-400">No se pudo cargar el ranking de donaciones.</p>}
        {!donationsLoading && !donationsError && (
          <ol className="list-decimal list-inside space-y-2">
            {donations.map((row) => (
              <li className="text-white drop-shadow-sm" key={row.userId}>
                <span className="font-medium">{row.nombreCompleto || row.email || "Usuario"}</span>{" "}
                <span className="text-slate-300">
                  — {Number(row.karmaPoints || 0)} puntos · {Number(row.totalDonaciones || 0)} €
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section
        className="bg-white/70 backdrop-blur-md border border-white/20 rounded-xl p-6 text-white shadow-2xl"
        style={{ borderRadius: 10 }}
      >
        <h2 className="!text-white border-b border-white/10 pb-2 mb-4 font-semibold">Top Gatito Runner</h2>
        {runnerLoading && <p className="text-slate-300">Cargando ranking de runner...</p>}
        {runnerError && <p className="text-red-400">No se pudo cargar el ranking de runner.</p>}
        {!runnerLoading && !runnerError && (
          <ol className="list-decimal list-inside space-y-2">
            {runner.map((row) => (
              <li className="text-white drop-shadow-sm" key={row.userId}>
                <span className="font-medium">{row.nombreCompleto || row.email || "Usuario"}</span>
                <span className="text-slate-300"> — {Number(row.runnerBestScore || 0)} puntos</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}
